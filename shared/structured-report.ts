import { abundanceSchema } from "./report-import";
export const STRUCTURED_REPORT_MAX_BYTES = 2 * 1024 * 1024;
type Dict = Record<string, unknown>;
const object = (value: unknown): value is Dict =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max = 1000): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
export type ReportScore = {
  name: string;
  category: string | null;
  score: number | null;
  reportedValue: string | null;
  scale: string | null;
  reportedCategory: string | null;
  notes: string | null;
};
export type ReportOrganism = {
  name: string;
  reportedStatus: string | null;
  reportedAbundance: string | null;
  notes: string | null;
};
export type ReportFoodRecommendation = {
  name: string;
  reportedCategory: string | null;
  notes: string | null;
  sourcePage: number | null;
  sourceColumn: number | null;
};
export type StructuredReport = {
  schemaVersion: "bloom-report-v2";
  kind: "abundance" | "functional-report";
  sourceLabel: string;
  dataOrigin: string | null;
  testPeriod: string | null;
  scoreInterpretationWarning: string | null;
  scores: ReportScore[];
  organisms: ReportOrganism[];
  foods?: ReportFoodRecommendation[];
  bacteria_percentages?: Record<string, number>;
  missingData: string[];
  sourceMissingData: string[];
  capabilities: {
    quantitativeAbundance: boolean;
    functionalScores: boolean;
    reportedOrganisms: boolean;
    measuredMetabolites: false;
    measuredGenes: false;
  };
  sourceReport: Dict;
};
/** Bound structure before serializing or traversing uploaded input. */
export function validateReportComplexity(input: unknown) {
  const stack: { value: unknown; depth: number }[] = [{ value: input, depth: 0 }];
  const seen = new Set<object>();
  let nodes = 0;
  while (stack.length) {
    const { value, depth } = stack.pop()!;
    if (++nodes > 20_000 || depth > 32) throw Error("Report structure is too complex. Use a smaller, flatter report.");
    if (value && typeof value === "object") {
      if (seen.has(value)) throw Error("Report must not contain circular or repeated object references.");
      seen.add(value);
      for (const key in value) if (Object.hasOwn(value, key)) {
        if (nodes + stack.length >= 20_000) throw Error("Report structure is too complex. Use a smaller, flatter report.");
        stack.push({ value: (value as Record<string, unknown>)[key], depth: depth + 1 });
      }
    }
  }
}
/** Same source-envelope selection for parsing and read-only provenance. */
function structuredSourceObject(input: Dict): Dict {
  const nested = object(input.data) ? input.data : undefined;
  return object(input.report)
    ? input.report
    : nested &&
        [
          "scores",
          "organisms",
          "healthScores",
          "functionalScores",
          "microorganisms",
          "bacteria_percentages",
          "foods",
          "food_recommendations",
        ].some((k) => k in nested)
      ? nested
      : input;
}
export type MicrobiomeSourceFact = { kind: "assay" | "method" | "taxonomy" | "qc"; value: string; sourcePath: string };
/** Verbatim supplied source text only. No method/strain inference or QC grading. */
export function microbiomeSourceFacts(report: Pick<StructuredReport,"sourceReport">): MicrobiomeSourceFact[] {
  const original=report.sourceReport;if(!object(original))return [];
  const source=structuredSourceObject(original);
  const prefix=source===original?"sourceReport":source===original.report?"sourceReport.report":"sourceReport.data";
  const locations:[string,Dict][]=[[prefix,source]];
  if(object(original.metadata))locations.push(["sourceReport.metadata",original.metadata]);
  if(source!==original&&object(source.metadata))locations.push([prefix+".metadata",source.metadata]);
  const keys:Record<MicrobiomeSourceFact["kind"],string[]>={assay:["assay_type","assayType"],method:["assay_method","assayMethod","sequencing_method","sequencingMethod","vendor_method","vendorMethod"],taxonomy:["taxonomy_version","taxonomyVersion"],qc:["qc_status","qcStatus","qc_notes","qcNotes","quality_control_notes","qualityControlNotes"]};
  const facts:MicrobiomeSourceFact[]=[];
  for(const [path,record]of locations)for(const kind of Object.keys(keys)as MicrobiomeSourceFact["kind"][])for(const key of keys[kind]){
    const value=Object.hasOwn(record,key)?record[key]:undefined;if(typeof value==="string"&&value.trim())facts.push({kind,value,sourcePath:path+"."+key});
  }
  return facts;
}
/** Reader compatibility for sources saved before food projection existed.
 * An explicit canonical empty array takes precedence over the original source. */
export function reportedFoodSuggestions(report:Pick<StructuredReport,"foods"|"sourceReport">){
  const source:Dict=report.foods!==undefined?{foods:report.foods}:object(report.sourceReport)?structuredSourceObject(report.sourceReport):{};
  const raw=source.foods??source.food_recommendations;
  if(raw===undefined||raw===null)return{status:"not-supplied" as const,foods:[] as ReportFoodRecommendation[]};
  if(Array.isArray(raw)&&!raw.length)return{status:"available" as const,foods:[] as ReportFoodRecommendation[]};
  try{return{status:"available" as const,foods:parseStructuredReport({foods:raw}).foods||[]};}
  catch{return{status:"unreadable" as const,foods:[] as ReportFoodRecommendation[]};}
}
export function parseStructuredReport(input: unknown): StructuredReport {
  validateReportComplexity(input);
  if (!object(input))
    throw Error(
      "The JSON must be an object containing bacteria_percentages, scores or organisms. No report was saved.",
    );
  let bytes: number;
  try {
    bytes = new TextEncoder().encode(JSON.stringify(input)).length;
  } catch {
    throw Error("Report must be valid, serializable JSON.");
  }
  if (bytes > STRUCTURED_REPORT_MAX_BYTES)
    throw Error("Structured JSON reports must be 2 MB or smaller.");
  const source = structuredSourceObject(input);
  // Our exported format carries source strings, not new permission/evidence authority.
  const canonical = source.schemaVersion === "bloom-report-v2";
  const metadata = object(input.metadata)
    ? input.metadata
    : object(source.metadata)
      ? source.metadata
      : {};
  let percentages: Record<string, number> | undefined;
  if (Object.hasOwn(source, "bacteria_percentages")) {
    const parsed = abundanceSchema.safeParse(source.bacteria_percentages);
    if (!parsed.success)
      throw Error(
        "bacteria_percentages must contain 1–1000 distinct taxa with numeric percentages from 0 to 100, totaling no more than 100. Scores, counts and presence labels cannot be used as percentages.",
      );
    percentages = parsed.data;
  }
  const rawScores =
    source.scores ?? source.healthScores ?? source.functionalScores;
  const scores: ReportScore[] = [];
  if (rawScores !== undefined && rawScores !== null) {
    const rows = Array.isArray(rawScores)
      ? rawScores
      : object(rawScores)
        ? Object.entries(rawScores).map(([name, v]) =>
            object(v)
              ? { ...v, name: text(v.name) || name }
              : { name, score: v },
          )
        : null;
    if (!rows || rows.length > 500)
      throw Error(
        "scores must be a list or named object with no more than 500 score records.",
      );
    for (const [index, row] of Array.from(rows.entries())) {
      if (!object(row))
        throw Error(
          `Score record ${index + 1} must be an object with a name and score/value.`,
        );
      const name = text(row.name ?? row.score_name ?? row.scoreName, 150);
      if (!name) throw Error(`Score record ${index + 1} needs a name.`);
      const value = canonical ? row.score ?? row.reportedValue : row.score ?? row.value ?? row.scoreValue;
      if (
        value !== undefined &&
        value !== null &&
        !finite(value) &&
        typeof value !== "string"
      )
        throw Error(`Score record ${index + 1} has an invalid score/value.`);
      const scale = text(row.scale, 100);
      if (
        finite(value) &&
        scale &&
        /^0\s*(?:-|–|to)\s*100$/i.test(scale) &&
        !(value >= 0 && value <= 100)
      )
        throw Error(
          `Score record ${index + 1} is outside its reported 0–100 scale.`,
        );
      scores.push({
        name,
        category: text(row.category, 150),
        score: finite(value) ? value : null,
        reportedValue: canonical ? text(row.reportedValue,150) : typeof value === "string" ? text(value, 150) : null,
        scale,
        reportedCategory: text(canonical ? row.reportedCategory : row.viome_category ?? row.status, 150),
        notes: text(row.notes),
      });
    }
  }
  const rawOrganisms = source.organisms ?? source.microorganisms;
  const organisms: ReportOrganism[] = [];
  if (rawOrganisms !== undefined && rawOrganisms !== null) {
    if (!Array.isArray(rawOrganisms) || rawOrganisms.length > 1000)
      throw Error(
        "organisms must be a list of no more than 1000 organism records.",
      );
    for (const [index, row] of Array.from(rawOrganisms.entries())) {
      if (typeof row === "string") {
        const name = text(row, 150);
        if (!name) throw Error(`Organism record ${index + 1} needs a name.`);
        organisms.push({
          name,
          reportedStatus: null,
          reportedAbundance: null,
          notes: null,
        });
        continue;
      }
      if (!object(row))
        throw Error(
          `Organism record ${index + 1} must have an organism/name field.`,
        );
      const name = text(row.organism ?? row.name ?? row.organismName, 150);
      if (!name)
        throw Error(
          `Organism record ${index + 1} needs an organism/name field.`,
        );
      const value = canonical ? row.reportedAbundance : row.quantitative_abundance ?? row.abundance;
      let reportedAbundance: string | null = null;
      if (typeof value === "string") reportedAbundance = text(value, 200);
      else if (finite(value))
        reportedAbundance = String(value) + " (unit not supplied)";
      else if (object(value) && finite(value.value))
        reportedAbundance = `${value.value} ${text(value.unit, 60) || "(unit not supplied)"}`;
      else if (value !== undefined && value !== null)
        throw Error(
          `Organism record ${index + 1} has an invalid abundance field.`,
        );
      organisms.push({
        name,
        reportedStatus: text(canonical ? row.reportedStatus : row.reported_status ?? row.status, 200),
        reportedAbundance,
        notes: text(row.notes),
      });
    }
  }
  const rawFoods = source.foods ?? source.food_recommendations;
  const foods: ReportFoodRecommendation[] = [];
  if (rawFoods !== undefined && rawFoods !== null) {
    if (!Array.isArray(rawFoods) || rawFoods.length > 1000)
      throw Error("Food suggestions must be a list of no more than 1000 source rows.");
    for (const [index, row] of Array.from(rawFoods.entries())) {
      if (!object(row) || typeof row.name !== "string" || !row.name.trim() || row.name.length > 200)
        throw Error(`Food row ${index + 1} needs a source name of up to 200 characters.`);
      const category = row.reportedCategory ?? row.category;
      if (category !== undefined && category !== null && (typeof category !== "string" || !category.trim() || category.length > 150))
        throw Error(`Food row ${index + 1} has an invalid provider category.`);
      if (row.notes !== undefined && row.notes !== null && (typeof row.notes !== "string" || row.notes.length > 1000))
        throw Error(`Food row ${index + 1} has an invalid source note.`);
      const sourceIndex = (value: unknown, max: number) => {
        if (value === undefined || value === null) return null;
        if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > max)
          throw Error(`Food row ${index + 1} has an invalid source position.`);
        return value;
      };
      foods.push({name: row.name.trim(), reportedCategory: typeof category === "string" ? category.trim() : null, notes: typeof row.notes === "string" ? row.notes : null, sourcePage: sourceIndex(row.sourcePage,1000), sourceColumn: sourceIndex(row.sourceColumn,10)});
    }
  }
  if (!percentages && !scores.length && !organisms.length && !foods.length)
    throw Error(
      "This JSON has no supported report data. Provide bacteria_percentages or a report containing nonempty scores, organisms or provider food suggestions. A pathway score is not a bacterial percentage.",
    );
  const missingData = [
    "Measured metabolite concentrations are not supplied in a supported measurement format.",
    "Measured gene/sequence information is not supplied in a supported measurement format.",
  ];
  if (!percentages)
    missingData.unshift(
      "Quantitative bacterial abundance percentages are unavailable; organism detection and functional scores are not percentages.",
      "Diversity and quantitative microbiome modelling are unavailable from this report.",
    );
  const originalMissing = canonical ? source.sourceMissingData : source.missing_data ?? metadata.missing_data;
  return {
    schemaVersion: "bloom-report-v2",
    kind: scores.length || organisms.length || foods.length ? "functional-report" : "abundance",
    sourceLabel:
      text(
        canonical ? source.sourceLabel : source.testing_company ?? metadata.testingCompany ?? metadata.provider,
        100,
      ) ||
      (scores.length || organisms.length || foods.length
        ? "Viome-style report"
        : "Abundance report"),
    dataOrigin: text(
      canonical ? source.dataOrigin : source.data_origin ?? metadata.data_origin ?? metadata.source,
      500,
    ),
    testPeriod: text(canonical ? source.testPeriod : source.test_period ?? metadata.test_period, 150),
    scoreInterpretationWarning: text(canonical ? source.scoreInterpretationWarning : source.score_interpretation_warning, 1000),
    scores,
    organisms,
    ...(rawFoods !== undefined && rawFoods !== null ? {foods} : {}),
    ...(percentages ? { bacteria_percentages: percentages } : {}),
    missingData,
    sourceMissingData: Array.isArray(originalMissing)
      ? originalMissing
          .filter((v): v is string => typeof v === "string")
          .slice(0, 30)
          .map((v) => v.slice(0, 500))
      : [],
    capabilities: {
      quantitativeAbundance: !!percentages,
      functionalScores: !!scores.length,
      reportedOrganisms: !!organisms.length,
      measuredMetabolites: false,
      measuredGenes: false,
    },
    sourceReport: canonical && object(source.sourceReport) ? source.sourceReport : input,
  };
}
export function parseReportDocument(textInput: string, format: "json" | "csv") {
  if (new TextEncoder().encode(textInput).length > STRUCTURED_REPORT_MAX_BYTES)
    throw Error("Structured reports must be 2 MB or smaller.");
  let source: unknown;
  if (format === "json") {
    try {
      source = JSON.parse(textInput.replace(/^\uFEFF/, ""));
    } catch {
      throw Error(
        "The pasted text is not valid JSON. Check commas, quotes and braces, then try again.",
      );
    }
  } else {
    if (textInput.split(/\r?\n/).length > 1002)
      throw Error("CSV reports support at most 1,000 taxon rows.");
    // Keep the existing explicit CSV contract; never reinterpret scores as abundance.
    const rows = textInput
      .trim()
      .split(/\r?\n/)
      .map((line) => line.split(",").map((s) => s.trim()));
    if (rows[0]?.join(",").toLowerCase() !== "bacteria,abundance")
      throw Error(
        "CSV requires bacteria,abundance columns with percentage values. For Viome scores/organisms, use JSON.",
      );
    const values: Record<string, number> = {};
    for (const row of rows.slice(1)) {
      if (
        row.length !== 2 ||
        !row[0] ||
        !row[1] ||
        Object.hasOwn(values, row[0])
      )
        throw Error("CSV contains an invalid or duplicate taxon row.");
      Object.defineProperty(values, row[0], {
        value: Number(row[1]),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    source = { bacteria_percentages: values };
  }
  return { source, parsed: parseStructuredReport(source) };
}
export function embeddedReportTestDate(value: unknown) {
  const source = object(value) ? value : {};
  const payload = object(source.report)
    ? source.report
    : object(source.data)
      ? source.data
      : source;
  const metadata = object(payload.metadata)
    ? payload.metadata
    : object(source.metadata)
      ? source.metadata
      : {};
  return payload.test_date ??
    payload.testDate ??
    metadata.test_date ??
    metadata.testDate;
}

export function resolveReportDate(
  supplied: unknown,
  report: StructuredReport,
  now = new Date(),
) {
  const embedded = embeddedReportTestDate(report.sourceReport);
  const value =
    supplied !== undefined && supplied !== null && supplied !== ""
      ? supplied
      : embedded;
  if (value === undefined || value === null || value === "")
    return { date: now, dateSource: "import-date" as const };
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(
      value,
    )
  )
    throw Error(
      "Test date must be a valid calendar date (YYYY-MM-DD) or ISO date/time. Leave it blank to label the report with its import date.",
    );
  const date = new Date(value);
  if (
    !Number.isFinite(+date) ||
    value.slice(0, 10) !==
      new Date(value.slice(0, 10) + "T00:00:00Z").toISOString().slice(0, 10)
  )
    throw Error("Test date is invalid. Choose a real calendar date.");
  return {
    date,
    dateSource: supplied
      ? ("user-provided" as const)
      : ("report-provided" as const),
  };
}

export type ReportImportFields={testDate?:string;testingCompany?:string;testId?:string;notes?:string};
export type ReportSaveResult={success:true;sampleId:string;preview:{kind:StructuredReport['kind'];scores:number;reportedOrganisms:number;quantifiedTaxa:number;dateSource:ReturnType<typeof resolveReportDate>['dateSource'];missingData:string[]}};
export class ReportSaveConflict extends Error {constructor(){super("This save reference belongs to different report details. Check your saved reports before starting another import.");}}
export function reportImportIdentity(userId:string,key:string){return JSON.stringify(['structured-report-import-v1',userId,key]);}
