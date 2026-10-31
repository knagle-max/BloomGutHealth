# Bloom v0.5 — Scientific Insights UI Kit, Design and Implementation Handoff
**Date:** 2026-10-23 · **Owner:** Branding & UX Specialist · **Status:** Editable design assets delivered; Architect review, Codex implementation, Biology sign-off and live testing outstanding.
**Scope:** MKT-011–020 clinical insights; MKT-002, MKT-005, MKT-007; related Biology/UT handoffs. **Do not block existing v0.5 engineering.**

## Included
- `components/ScientificInsight.tsx`: shared Evidence Insight Card, status badge, observation chart+table, six failure/missingness states. Source components are integration references, not a claim of production compatibility.
- `styles/scientific-insights.css`: responsive light/dark friendly CSS using semantic variables and workspace accents.
- `examples/ExampleUsage.tsx`: illustrative lab, food, microbiome, Athlete, trend and empty states.
- `assets/`: editable semantic icons.
- `PREVIEW.html`: standalone browser-friendly wireframe featuring all four domains and states.

## Required behavior and acceptance criteria
**SCI-UI-01 P0** One Evidence Insight Card architecture, with optional fields for current value/unit/date, original source, evidence category, practical meaning/next action, expandable source/method/limitations; content varies by domain. State `unconfirmed` is not an alert or confirmed interpretation.
**SCI-UI-02 P0** Never infer clinical significance from unconfirmed units; retain imported text and source unit separately from display unit. Confirmed units never silently modify original records.
**SCI-UI-03 P0** Charts display actual dated points; straight segments only if biologically/analytically compatible and allowed by backend; accessible table; no smoothed synthetic curve, imaginary points, false continuity or causal implication. Single point, many gaps, incompatible units and no readings have explicit states. Chart dates are source-local normalized appropriately by Codex.
**SCI-UI-04 P0** Evidence state vocabulary: measured, provider-reported, user-entered, general research, association, validated estimate (ONLY after independent validation), research simulation, unconfirmed and unknown. Text and icon independent of colour.
**SCI-UI-05 P1** Domain-specific detail: lab (specimen, method, interval, unit), nutrition (portion, nutrient completeness and exact food source), microbiome (provider assay/relative abundance/taxonomic resolution), Athlete (session measured vs user-entered and distinct from readiness). Do not imply a single scientific scoring model across domains.
**SCI-UI-06 P0** Six states: missing, unconfirmed unit, incompatible measurements, insufficient evidence, loading, error. Error retains prior measurements; unconfirmed/unknown never shown as zero. Explicit confirmation/selection requires Codex backend workflow; these cards do not auto-confirm.
**SCI-UI-07 P0** WCAG 2.2 AA evaluation, 320px reflow, 200% zoom, table keyboard navigation, focus and contrast, screen reader understandable title and source; Bloom target-size guideline 44px; light/dark and Everyday/Athlete colour inheritance.

## Design rules
- Everyday green `#246B50`, Athlete blue `#2563A6`, Coach muted indigo `#62558D` proposed. Shared typography, structure and status language; semantic evidence statuses must never be workspace colours or imply diagnostic urgency.
- Reuse existing `EvidenceInsight`, `LabTrend`, `LabUnitReview`, `ImportedReportDetails`, `TodayFocus`, `workspace.css` and `/brand/design-tokens.json`; Codex should adapt reference code rather than blindly overwrite existing components.
- Fields shown only if source supports them. A laboratory's provider range is not a universally appropriate target. Microbiome provider score is not a validated personal gut-health score.
- Examples are synthetic; no personal record or provider connection. Reference TSX expects React and application CSS integration; intentionally has no API or validation business logic.

## User acceptance scenarios
1. User imports ALT 73 without unit: confirmation required; no risk grading; original row accessible.
2. User has 2 LDL tests with compatible units/methods: dated points/straight segment and table; 'observed change' wording only.
3. User has two incomparable methods or unit assumptions: no joined trend and plain-language reason.
4. Provider microbiome report lists organism: source and assay available, no fabricated pathway activation.
5. Nutrition card has partial nutrients: unknown != zero and portion/source visible.
6. Athlete RPE=7: user entry distinguished from measured heart rate and next-day readiness.
7. No data, loading, outage: accurate non-blaming explanatory state and retry when supported.
8. Dark mode/mobile/keyboard/screen readers: no overflow, accessible disclosure and table.

## Cross-specialty sign-off
**Branding/UX:** design package approved for Architect intake. **Biology:** meaning/reference/status copy review outstanding. **Security:** source/consent exposure review outstanding. **User Testing:** comprehension, mobile/device and accessibility review outstanding. **Codex:** integration/tests/repository/production solely owned by Codex. **Architect:** deduplication and backlog acceptance outstanding.
