# Bloom v0.6 — Biology & Microbiome Telemetry Design Addendum

**For:** Brand & Visual Design Specialist → Chief Architect → UI Development Agent

**Repository review:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, commit `506c43c8e48291bc50b75d2a13190ff54029e81f` (2026-11-10). **Status:** proposed adaptation, not installed, typechecked, CI-tested or deployed.

## Decision

**Adopt the progressive-disclosure and telemetry styling concept with substantial scientific and architectural changes. Reject a direct replacement of the Biology route.** The supplied `BiologyOverview.tsx` is not present in the current development repository. `client/src/components/BiologyHome.tsx` is the navigation overview for bloodwork, gut reports, genetics and measurements. The source-aware gut-report interface is `client/src/pages/Microbiome.tsx`, with report management, comparisons, organism profiles, research views and owner-scoped queries. Do not replace either page with the proposed minimal implementation.

### Critical scientific corrections

- **Remove all example figures** `8.4`, `14.2%`, `1.18`, `Normal`: none is linked to verified saved report measurements. Do not label a hypothetical index “High Stability”, abundance “Optimal SCFA”, ratio “Balanced”, or barrier marker “Low Inflammation”.
- **No top-line “biological confidence” or universal health score.** Bloom can honestly describe report availability, original source count and method completeness, but not assign a numeric health/confidence interpretation without a validated source-specific model.
- **Do not treat taxa abundances as SCFA measurement.** Taxon identity/abundance is not measured metabolite output, active metabolism, gene expression or clinical barrier function. Firmicutes/Bacteroidetes ratios are not automatically valid health metrics.
- **Remove the methodology sentence** “Shotgun metagenomic sequencing targeting 16S rRNA V3–V4.” Shotgun metagenomics and 16S amplicon sequencing are different methods. Display the actual report-supplied assay if known; otherwise “Method not recorded.”
- **Remove fake reference fallback** “Standard reference sequence NCBI-txid562 applied.” No such source or standard can be invented. A research citation is only shown when already associated with the actual report's scientific content and verified in the current context.
- **Do not use `/api/precision/wellness-context` as a proxy for microbiome report data.** It is the goal/action context feed, not a source for per-report diversity, taxa, sampling method or measured SCFA. Reuse the owned, existing `/api/microbiome/samples` and `/api/microbiome/results` data pathways and freshness guards.
- **Avoid “Log Intake to Map SCFA Impact.”** Logging food alone does not measure or establish an effect on SCFA production. Prefer “Log a meal”, “Review foods”, or “Explore research” with explicit limitations.

## Correct implementation strategy

1. Preserve `BiologyHome.tsx` as the biology workspace navigation; keep its real results and source-review counts, not a single invented health score. Preserve the user's ability to reach bloodwork, genetics, gut reports and measurements.
2. Preserve `Microbiome.tsx`: query keys/account-scoped selection, saved-report date/processing status, upload link, source deletion confirmation, Viome report relationship management, current taxon browser, original-report compare, result tabs, method limits, provenance, research links, original source downloads and organism profiles. Do not replace these with an unrelated local tab switcher.
3. Add the **optional `BiologyReportTelemetry` component** to the existing *selected report* section only **after `currentResults` is confirmed**. Display just source-authentic values: numeric saved diversity index if recorded, number of source rows with numeric abundance, provider/date/processing context. Unknown ≠ zero. No status/color classifications.
4. Reuse the proposed `TelemetryMetric` and `SurfaceCard` primitives from the earlier Today package, if Brand approves; the existing token-safe version already accepts nullable values, status labels and source labels. Keep surface wrappers sparse. Avoid nested dark dashboard cards.
5. Keep existing saved report date/age/assay limits, method-specific comparability statements and external research citations where genuinely recorded. Research associations must remain distinct from personal measurements.
6. A 3-second top layer should explain **what data exists and where to act next**, not pretend to know a user's gut health. Deeper layer uses native `<details>` with accessible labels and original-source links.

## Proposed code files

- `BiologyReportTelemetry.tsx` → add `client/src/components/BiologyReportTelemetry.tsx`.
- `primitives.tsx` → reuse the prior handoff's existing implementation, with token-based `TelemetryMetric` **as-is**. Do not replace it with a second copy from the user's snippet.
- `Microbiome.tsx` → **minimal insertion** (see exact patch below), not a wholesale rewrite.

### Safe integration patch for `client/src/pages/Microbiome.tsx`

Insert this import alongside existing component imports:

```tsx
import BiologyReportTelemetry from "@/components/BiologyReportTelemetry";
```

Inside the **existing** `{tab === "results" && currentResults && ( ... )}` selected report block, immediately after the current report summary/note and **before** its existing `Methods & historical analysis limits` `<details>` (and without removing `ImportedReportDetails`), add:

```tsx
<BiologyReportTelemetry
  diversityIndex={currentResults.sample.diversityIndex}
  quantifiedTaxaCount={currentResults.bacterial_composition.filter(
    (item: ReportedTaxon) =>
      typeof item.abundance === "number" && Number.isFinite(item.abundance)
  ).length}
  reportDate={reportDateText(currentResults.sample)}
  testingCompany={currentResults.sample.testingCompany}
  processingStatus={currentResults.sample.processingStatus}
/>
```

The page already imports `ReportedTaxon` and `reportDateText`. Optional: remove the *redundant* `gut-report-facts` summary only after verifying equivalent information is preserved by the new component, with no functional/regression changes. It is acceptable to retain both for first review.

**No new query, API endpoint, data store, fabricated report fields, ML health scoring, route replacement or persistence changes.** This addition is strictly presentational.

## Required QA / acceptance

- With a saved report: correct source-linked count and numeric diversity only when present; provider/date/processing status correct.
- Missing diversity: display “Not available”, not `0`, not a synthetic score. Missing method remains unknown.
- Relative abundance is never labeled actual SCFA production, absolute organism count, barrier integrity or inflammation.
- If report loading fails or source is deleted or account switches, the old telemetry disappears with the source; preserve existing loading/empty/error/ownership logic.
- Source reports from different methods remain independent, and same-day reports are not merged; comparison never makes an unsupported trend claim.
- Existing original report, source deletion, Viome saved context, filtered organism lists, historical analysis warnings, bibliography links and modal keyboard navigation continue to function.
- Accessible at 320/390/768/1440 widths; Everyday/Athlete and light/dark themes; doubled text/page zoom; keyboard and reduced motion.
- Before/after screenshots must prove legibility and an improved surface/deep-information hierarchy; TypeScript, production build, existing browser suites and full relevant CI must pass.

## Brand review request

Propose a source-aware *microbiome report overview* that feels warm, tactile and editorial at the surface and precise in deeper metric displays. Compare original BiologyHome + Microbiome pages against a minimal additive design, **without inventing scores or replacing the current research/report workflows**. Evaluate whether telemetry is materially useful here; reject excess card density if it is not.

## Architect disposition

Only authorize the UI implementation after rechecking the latest branch, confirming the report data contract, and specifying non-overlapping ownership with ongoing Codex work. This addendum supplements, not replaces, the TodayFocus/primitives handoff. No feature is represented as already shipped.

---

## Reference code: `BiologyReportTelemetry.tsx`

```tsx
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

```