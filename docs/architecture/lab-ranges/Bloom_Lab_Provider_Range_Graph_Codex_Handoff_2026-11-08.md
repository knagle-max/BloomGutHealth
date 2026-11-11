# Bloom — Codex Handoff: Provider-Specific Lab Ranges on Graphs
**Date:** 2026-11-08 | **Scope:** v0.6 lab visualization; do not alter approved v0.5 RC without Architect authority.

## Goal
Add reference interval overlays and a laboratory selector to existing `LabTrend.tsx`, preserving original source data. Suggested selector: **Original report / LifeLabs / Other lab / None**. When LifeLabs chosen, require **province**, and match test, specimen/assay, date/version, age at collection, appropriate reference sex category and fasting context. Do not treat LifeLabs BC values as Saskatchewan or Ontario values.

## Source-of-truth priority
1. For the individual result, use the reference interval **printed on that exact source report**, if supplied and its units/method validated. Never replace or rewrite this source interval.
2. Offer separately labelled *published provider comparison interval* only if independently verified provider + region + test + method/assay + applicable demographics + collection-era date match. Selection changes display overlay only, not historical lab observations or provider identities.
3. No verified match: show **Reference unavailable** and keep the observations visible. Do not invent a clinical or wellness range.

## Graph presentation
- Extend existing SVG chart, not another graph implementation. Use a subtle translucent band for two-sided reference intervals, dashed horizontal threshold for one-sided values; draw all observations clearly and label boundaries numerically (screen reader text too).
- Distinguish `reference_interval` from `clinical_decision_limit`, `risk_threshold`, or `treatment_target`. The latter must never be called a normal interval; treatment targets are not authorized by this handoff.
- When historical samples have different laboratory, assay, ranges or effective versions, show interval at selected result or segmented interval periods. Never paint one range across the entire graph if its applicability changes.
- Fit y axis to both observed values and relevant reference bounds, with reasonable padding. One-sided intervals must not acquire fake zero or fake high/low endpoints. Retain all original date/units/reference information and source drilldown.
- Label as `Published comparison interval — LifeLabs BC, September 2025` where applicable; never present as source-original or optimal/healthy target. If provider differs from sample, prominently say `Comparison only — not this result's laboratory`.

## Data model (proposed)
```ts
type LabRange = {
 id: string; provider: string; province: string; markerId: string;
 specimen: string; assay?: string; method?: string;
 ageMinYears?: number; ageMaxYears?: number;
 sexReferenceCategory?: 'M'|'F'|'all'; fasting?: 'yes'|'no'|'either';
 effectiveFrom: string; effectiveTo?: string;
 kind: 'reference_interval'|'clinical_decision_limit'|'risk_threshold';
 low?: number; lowInclusive?: boolean;
 high?: number; highInclusive?: boolean;
 unit: string; sourceUrl: string; sourceDocumentDate: string;
 page?: number; scientificReviewStatus: 'verified'|'pending';
};
```
Different tests can have multiple decision thresholds, each individually labelled. Matching and conversion are deterministic; an unknown assay or pending unit review must abstain. No network request to LifeLabs is needed at runtime.

## LifeLabs BC 2025 official reference examples — NOT universal LifeLabs intervals
**Source:** https://lifelabs.azureedge.net/lifelabs-wp-cdn/2025/10/BC_Ranges_Sep25-6798eab0dfdde.pdf (September 2, 2025; page numbers below are printed page numbers). Confirm entries before production import.

| Marker | Applicability | Reported reference interval or boundary | Printed page |
|---|---|---|---|
| HDL-C | Male ≥18 | >0.99 mmol/L | 36 |
| HDL-C | Female ≥18 | >1.19 mmol/L | 36 |
| LDL-C | All ≥30 | 1.50–3.40 mmol/L | 36 |
| LDL-C | All 18–29 | 1.50–3.00 mmol/L | 36 |
| Triglycerides | All >17 | <2.21 mmol/L | 36 |
| ApoB | All ≥20 | 0.59–1.25 g/L | 6 |
| ALT | Male ≥1 | <50 U/L | 4 |
| ALT | Female ≥1 | <36 U/L | 4 |
| AST | All ≥1 | <36 U/L | 7 |
| GGT | Male, published category | <65 U/L | 20 |
| GGT | Female, published category | <44 U/L | 20 |
| Fasting glucose | All, published category | 3.3–5.5 mmol/L | 21 |
| Random glucose | All, published category | 3.3–11.0 mmol/L | 21 |
| HbA1c | All, published category | 4.5–5.9% | 28 |
| Ferritin | Male >18 | 24–444 µg/L | 18 |
| Ferritin | Female >18 | 15–247 µg/L | 18 |
| Homocysteine | All, published category | 5.1–15.4 µmol/L | 29 |
| 25-hydroxy vitamin D | All <100 | 50–125 nmol/L | 2 |
| **1,25-dihydroxy vitamin D** | All <100 | 60–210 pmol/L | 2; DIFFERENT ANALYTE |

**Not verified for BC here:** B12, serum folate. Must stay unknown; do not fill from another region. Lab report's original range remains preferable.

## LifeLabs Ontario decision-limit examples, never mislabel as reference intervals
- **Vitamin B12 (effective July 8, 2024):** <150 pmol/L = low; 150–220 pmol/L = borderline; >220 pmol/L = deficiency unlikely. No established upper decision limit. Source: https://lifelabs.azureedge.net/lifelabs-wp-cdn/2024/06/UPDATED-REPORTING-OF-VITAMIN-B12.pdf
- **Ferritin (effective September 9, 2024):** <30 µg/L for age ≥18 is low decision threshold; ≥600 µg/L is high. Intermediate interpretation depends on inflammation and other iron indices. Source: https://www.lifelabs.com/notification/update-to-reporting-of-ferritin-in-ontario/
- These are Ontario-specific published notices, **not** a verified Saskatchewan/BC current implementation. Keep thresholds labelled as limits, not a 30–600 green band.

## Engineering integration and QA
Existing files: `client/src/components/LabTrend.tsx` SVG; `shared/precision-nutrition.ts` with `laboratory`, `method`, `fasting`, `referenceLow/High`, `measuredAt`, source units and source links; `shared/lab-history.ts` historical provenance; `shared/lab-assay-identity.ts` special vitamin D guards.

Acceptance tests: precise source range overrides published overlay; BC range does not auto-load for SK/ON; different age/sex ranges; one-sided > / < operators; fasting vs random; LDL risk target not derived from source interval; Ontario B12 and ferritin threshold type; 25-OH vs 1,25-(OH)2 distinction; mixed assays and historical intervals; invalid/incompatible units; missing lab/age/method, account isolation; original record edits/deletes; dark/light/mobile 320/390 and 200% zoom; accessibility text and keyboard; no invented clinical diagnosis, optimal range or treatment target. Keep all writes account-scoped, and make changes display-only where possible.