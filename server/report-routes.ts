import type { Express, RequestHandler } from "express";
import multer from "multer";
import { basename, extname } from "node:path";
import { z } from "zod";
import {assertViomeImportMetadata,hasViomeFindingsMarker,viomeReportIdSchema} from "../shared/viome-findings";
import {ViomeReportContextError} from "../shared/viome-report-context";
import type { IStorage } from "./storage";
import {
  parseStructuredReport,
  parseReportDocument,
  resolveReportDate,
  STRUCTURED_REPORT_MAX_BYTES,
  type StructuredReport,
  type ReportSaveResult,
  ReportSaveConflict,
} from "../shared/structured-report";
type BaseStore = Pick<
  IStorage,
  | "insertMicrobiomeSample"
  | "updateMicrobiomeSample"
  | "insertBacterialComposition"
  | "insertMlAnalysis"
>;
type Store = BaseStore & Pick<IStorage,"importStructuredReport"|"deleteViomeReport">;
const fieldsSchema = z.object({
  testDate: z.string().max(100).optional(),
  testingCompany: z.string().max(100).optional(),
  testId: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});
const requestSchema = fieldsSchema
  .extend({
    originalFilename: z.string().max(255).optional(),
    reuseExistingReportId:viomeReportIdSchema.optional(),
    report: z.unknown().optional(),
    bacteria_percentages: z.unknown().optional(),
  })
  .strict();
export async function saveStructuredReport(
  store: BaseStore,
  userId: string,
  report: StructuredReport,
  fields: z.infer<typeof fieldsSchema>,
  filename: string | null = null,
): Promise<ReportSaveResult> {
  assertViomeImportMetadata(report.sourceReport,fields,filename);
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
          ...(resolved.dateSource === "user-provided" ? {testDateInput: fields.testDate} : {}),
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
      },userId);
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
    },userId);
    await store.updateMicrobiomeSample(sample.id, {
      processingStatus: "completed",
    },userId);
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
        .updateMicrobiomeSample(sampleId, { processingStatus: "failed" },userId)
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
  const sameActor:RequestHandler=(req,res,next)=>{const expected=req.get("X-Bloom-Report-Actor");if(expected!==undefined&&expected!==req.session.userId)return void res.status(409).json({error:"The signed-in account changed. Reload this page and review the current account before saving."});next();};
  const keyFor=(req:Parameters<RequestHandler>[0])=>{const value=req.get("Idempotency-Key");if(value!==undefined&&!z.string().uuid().safeParse(value).success)throw Error("INVALID_REPORT_KEY");return value;};
  const save=(owner:string,report:StructuredReport,fields:z.infer<typeof fieldsSchema>,filename:string|null,key:string|undefined,reuseExistingReportId?:string)=>key!==undefined
    ? store.importStructuredReport?store.importStructuredReport(owner,report,fields,filename,key,reuseExistingReportId):Promise.reject(Error("REPORT_RECEIPT_UNAVAILABLE"))
    : reuseExistingReportId||(report.sourceReport as any)?.specimenEvent?Promise.reject(new ViomeReportContextError("incompatible")):saveStructuredReport(store,owner,report,fields,filename);
  const noCache: RequestHandler = (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  };
  // No reference dataset with reviewed provenance is installed. Never let an
  // older processing service turn its hard-coded prototype profiles into one.
  app.get('/api/microbiome/cohorts', auth, noCache, (_req, res) => {
    res.json({cohorts:[],status:'unavailable',interpretationStatus:'no_validated_reference_dataset',message:'Validated reference cohorts are not installed. No sample sizes, reference profiles or personal comparisons are available.'});
  });
  app.post("/api/microbiome/import", auth, noCache, sameActor, async (req, res) => {
    let key:string|undefined;try{key=keyFor(req);}catch{return res.status(400).json({error:"Invalid report save reference."});}
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
      if(hasViomeFindingsMarker(report.sourceReport)){
        const{report:_reviewed,reuseExistingReportId:_reuse,...extras}=fields.data;
        assertViomeImportMetadata(report.sourceReport,extras,null);
      }
      resolveReportDate(fields.data.testDate, report);
      if(fields.data.reuseExistingReportId&&!hasViomeFindingsMarker(report.sourceReport))throw new ViomeReportContextError("incompatible");
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
    try {
      res.json(
        await save(
          req.session.userId!,
          report,
          fieldsSchema.parse(fields.data),
          fields.data.originalFilename
            ? basename(fields.data.originalFilename)
            : null,
          key,
          fields.data.reuseExistingReportId,
        ),
      );
    } catch(error) {
      if(error instanceof ReportSaveConflict)return res.status(409).json({error:error.message});
      if(error instanceof ViomeReportContextError)return res.status(error.code==="unavailable"?404:409).json({error:error.message});
      res
        .status(503)
        .json({ error: "Report could not be confirmed. Retry the same import or check your saved reports." });
    }
  });
  app.delete("/api/microbiome/reports/:id",auth,noCache,sameActor,async(req,res)=>{
    if(!viomeReportIdSchema.safeParse(req.params.id).success)return res.status(404).json({error:"Report not found in your account."});
    if(!store.deleteViomeReport)return res.status(503).json({error:"Report deletion is unavailable. Try again later."});
    try{if(!await store.deleteViomeReport(req.session.userId!,req.params.id))return res.status(404).json({error:"Report not found in your account."});return res.json({success:true});}
    catch{return res.status(503).json({error:"The report could not be deleted. Reload your saved reports before trying again."});}
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
    sameActor,
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
      let key:string|undefined;try{key=keyFor(req);}catch{return res.status(400).json({error:"Invalid report save reference."});}
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
            if(hasViomeFindingsMarker(parsed.sourceReport))throw Error("Original attachments are not accepted for de-identified Viome findings. Use the reviewed findings workflow.");
            resolveReportDate(fields.data.testDate, parsed);
          } catch (error) {
            return res.status(400).json({ error: (error as Error).message });
          }
          try {
            return res.json(
              await save(
                req.session.userId!,
                parsed,
                fields.data,
                basename(file.originalname),
                key,
              ),
            );
          } catch(error) {
            if(error instanceof ReportSaveConflict)return res.status(409).json({error:error.message});
            return res
              .status(503)
              .json({ error: "Report could not be confirmed. Retry the same import or check your saved reports." });
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
