import type { Express, RequestHandler } from "express";
import multer from "multer";
import { basename, extname } from "node:path";
import { z } from "zod";
import type { IStorage } from "./storage";
import {
  parseStructuredReport,
  parseReportDocument,
  resolveReportDate,
  STRUCTURED_REPORT_MAX_BYTES,
  type StructuredReport,
} from "../shared/structured-report";
type Store = Pick<
  IStorage,
  | "insertMicrobiomeSample"
  | "updateMicrobiomeSample"
  | "insertBacterialComposition"
  | "insertMlAnalysis"
>;
const fieldsSchema = z.object({
  testDate: z.string().max(100).optional(),
  testingCompany: z.string().max(100).optional(),
  testId: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});
const requestSchema = fieldsSchema
  .extend({
    originalFilename: z.string().max(255).optional(),
    report: z.unknown().optional(),
    bacteria_percentages: z.unknown().optional(),
  })
  .strict();
export async function saveStructuredReport(
  store: Store,
  userId: string,
  report: StructuredReport,
  fields: z.infer<typeof fieldsSchema>,
  filename: string | null = null,
) {
  const resolved = resolveReportDate(fields.testDate, report);
  let sampleId: string | undefined;
  try {
    const sample = await store.insertMicrobiomeSample({
      userId,
      testDate: resolved.date,
      testingCompany: fields.testingCompany || report.sourceLabel,
      testId: fields.testId || null,
      notes: fields.notes || null,
      rawDataPath: null,
      structuredData: {
        ...report,
        importInfo: {
          originalFilename: filename,
          dateSource: resolved.dateSource,
        },
      },
      processingStatus: "processing",
      diversityIndex: null,
    });
    sampleId = sample.id;
    for (const [name, abundance] of Object.entries(
      report.bacteria_percentages || {},
    ))
      await store.insertBacterialComposition({
        sampleId: sample.id,
        bacterialName: name,
        abundance,
        taxonomyLevel: "reported",
        genomeData: null,
      });
    await store.insertMlAnalysis({
      sampleId: sample.id,
      analysisType:
        report.kind === "abundance"
          ? "reported-abundances"
          : "reported-functional-scores",
      modelVersion: "structured-report-v2",
      confidence: null,
      results: {
        provenance:
          report.dataOrigin ||
          "User-supplied report; not independently verified",
        capabilities: report.capabilities,
        missingData: report.missingData,
        measuredGenes: false,
        measuredMetabolites: false,
      },
    });
    await store.updateMicrobiomeSample(sample.id, {
      processingStatus: "completed",
    });
    return {
      success: true,
      sampleId: sample.id,
      preview: {
        kind: report.kind,
        scores: report.scores.length,
        reportedOrganisms: report.organisms.length,
        quantifiedTaxa: Object.keys(report.bacteria_percentages || {}).length,
        dateSource: resolved.dateSource,
        missingData: report.missingData,
      },
    };
  } catch {
    if (sampleId)
      await store
        .updateMicrobiomeSample(sampleId, { processingStatus: "failed" })
        .catch(() => {});
    throw Error(
      "The report could not be saved. Please retry; no completed import was created.",
    );
  }
}
export function registerReportRoutes(
  app: Express,
  auth: RequestHandler,
  store: Store,
  _legacyMlServiceUrl?: string,
) {
  const noCache: RequestHandler = (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  };
  app.post("/api/microbiome/import", auth, noCache, async (req, res) => {
    const fields = requestSchema.safeParse(req.body);
    if (!fields.success)
      return res
        .status(400)
        .json({
          error:
            "Provide a report JSON object and valid optional test date, company, ID and notes. Do not include account IDs.",
        });
    let report: StructuredReport;
    try {
      report = parseStructuredReport(
        fields.data.report ?? {
          bacteria_percentages: fields.data.bacteria_percentages,
        },
      );
      resolveReportDate(fields.data.testDate, report);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
    try {
      res.json(
        await saveStructuredReport(
          store,
          req.session.userId!,
          report,
          fields.data,
          fields.data.originalFilename
            ? basename(fields.data.originalFilename)
            : null,
        ),
      );
    } catch {
      res
        .status(503)
        .json({ error: "Report could not be saved. Please retry." });
    }
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: STRUCTURED_REPORT_MAX_BYTES, files: 1, fields: 4, fieldSize: 8000, parts: 5 },
    fileFilter: (_req, file, cb) => {
      if (
        [".json", ".csv"].includes(
          extname(file.originalname).toLowerCase(),
        )
      )
        cb(null, true);
      else
        cb(
          Error(
            "Use JSON or CSV reports. Raw sequence processing is not available.",
          ),
        );
    },
  });
  app.post(
    "/api/microbiome/upload",
    auth,
    noCache,
    (req, res, next) => {
      upload.single("file")(req, res, (error) => {
        if (error)
          return res
            .status(400)
            .json({
              error:
                error instanceof multer.MulterError &&
                error.code === "LIMIT_FILE_SIZE"
                  ? "Structured JSON/CSV reports must be 2 MB or smaller."
                  : "Invalid upload. Use one supported file of an allowed size.",
            });
        next();
      });
    },
    async (req, res) => {
      const file = req.file;
      if (!file)
        return res
          .status(400)
          .json({ error: "Choose a JSON or CSV report." });
      try {
        const fields = fieldsSchema.strict().safeParse(req.body);
        if (!fields.success)
          return res
            .status(400)
            .json({ error: "Invalid test date, company, test ID or notes." });
        const extension = extname(file.originalname).toLowerCase();
        if (extension === ".json" || extension === ".csv") {
          if (file.size > STRUCTURED_REPORT_MAX_BYTES)
            return res
              .status(413)
              .json({
                error: "Structured JSON/CSV reports must be 2 MB or smaller.",
              });
          let parsed: StructuredReport;
          try {
            parsed = parseReportDocument(
              new TextDecoder("utf-8", { fatal: true }).decode(file.buffer),
              extension === ".json" ? "json" : "csv",
            ).parsed;
            resolveReportDate(fields.data.testDate, parsed);
          } catch (error) {
            return res.status(400).json({ error: (error as Error).message });
          }
          try {
            return res.json(
              await saveStructuredReport(
                store,
                req.session.userId!,
                parsed,
                fields.data,
                basename(file.originalname),
              ),
            );
          } catch {
            return res
              .status(503)
              .json({ error: "Report could not be saved. Please retry." });
          }
        }
        return res.status(415).json({ error: "Use a structured JSON or CSV report. Raw sequence processing is not available." });
      } catch {
        return res
          .status(503)
          .json({ error: "Upload could not be saved. Please retry." });
      }
    },
  );
}
