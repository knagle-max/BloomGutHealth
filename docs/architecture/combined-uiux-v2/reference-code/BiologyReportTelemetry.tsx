import { SurfaceCard, TelemetryMetric } from "@/components/ui/primitives";

/**
 * Presentation-only view of fields already read from ONE owned gut report.
 * Parent page owns source selection, account/freshness checks, and queries.
 * Never infer health status, microbial function or clinical reference ranges.
 */
export interface BiologyReportTelemetryProps {
  diversityIndex: number | string | null | undefined;
  quantifiedTaxaCount: number;
  reportDate: string;
  testingCompany?: string | null;
  processingStatus?: string | null;
}

export default function BiologyReportTelemetry({
  diversityIndex,
  quantifiedTaxaCount,
  reportDate,
  testingCompany,
  processingStatus,
}: BiologyReportTelemetryProps) {
  // Do not coerce "unknown", missing, or unsupported imported strings to numbers.
  // A numerical diversity index is still method-dependent, not a health score.
  const savedDiversity =
    typeof diversityIndex === "number" && Number.isFinite(diversityIndex)
      ? diversityIndex
      : null;
  const countedTaxa =
    Number.isSafeInteger(quantifiedTaxaCount) && quantifiedTaxaCount >= 0
      ? quantifiedTaxaCount
      : null;
  const provider = testingCompany?.trim() || "Provider not recorded";

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="gut-report-telemetry-heading">
      <div className="space-y-1">
        <p className="eyebrow">RECORDED REPORT DATA</p>
        <h3 id="gut-report-telemetry-heading" className="text-xl font-medium tracking-tight">
          At a glance
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These values describe the selected report. They are not a microbiome health
          score, directly measured SCFA production, or a measure of gut barrier function.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SurfaceCard variant="default" className="p-4 sm:p-5">
          <TelemetryMetric
            label="Saved diversity index"
            value={savedDiversity}
            statusLabel="Reported value; method-dependent"
            sourceLabel={`${provider} · ${reportDate}`}
          />
        </SurfaceCard>
        <SurfaceCard variant="default" className="p-4 sm:p-5">
          <TelemetryMetric
            label="Taxa with a numeric reported abundance"
            value={countedTaxa}
            statusLabel="Count of reported entries, not an absolute organism count"
            sourceLabel={`${provider} · ${reportDate}`}
          />
        </SurfaceCard>
      </div>
      <details className="workspace-disclosure min-w-0">
        <summary className="min-h-11 cursor-pointer">How to interpret these report values</summary>
        <div className="space-y-2 pt-3 text-sm text-muted-foreground">
          <p>Report date: {reportDate}. Laboratory/provider: {provider}.</p>
          {processingStatus && <p>Saved processing state: {processingStatus}.</p>}
          <p>
            The saved diversity index is an imported value. Its calculation,
            comparability and biological meaning depend on the source method;
            no universal healthy cutoff is applied.
          </p>
          <p>
            The numeric-taxa count describes which source rows contain a
            numerical abundance. Relative abundance does not establish absolute
            organism count, metabolite output, gene expression or function.
          </p>
          <p>
            Do not infer SCFA production, gut permeability, inflammation or
            intervention effects without appropriate separate measurements and
            independently validated interpretation.
          </p>
          <p>
            Review the original report, organism table, saved source identifiers
            and methods disclosures elsewhere on this page for detail. Missing
            methods must remain explicitly unknown.
          </p>
        </div>
      </details>
    </section>
  );
}