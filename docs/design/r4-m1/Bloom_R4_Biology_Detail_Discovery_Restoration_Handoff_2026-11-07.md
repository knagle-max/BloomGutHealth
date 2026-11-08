# Bloom R4 — Restore Bloodwork and Microbiome Detail Discovery

**Prepared:** 2026-11-07 · **Owner:** Structural UX · **Destination:** Chief Architect, Designer, Developer, User Review · **Scope:** `/precision?tab=labs`, `/microbiome?tab=bacteria`, relevant Biology overview links. **Priority:** P1 UX regression fix in active premium production; do not stop work on other screens.

## Verified branch evidence (source inspection, not screenshots)
- `client/src/pages/PrecisionNutrition.tsx`: R4 has `BloodworkSourceOverview` inside the `labs` tab, `LabSourceHistory` and `labSourceToOpen` focus requests. It also displays a separate Latest results list and source-management widgets. Interaction capability survives but is distributed across stacked areas.
- `client/src/components/BloodworkSourceOverview.tsx`: report cards contain clickable source-section names (`reportedLabSections`), which call `onOpen(section.firstId)`. The headings are original report-provided sections, not clinical categories.
- `client/src/components/LabSourceHistory.tsx`: source history is nested within a collapsed `<details>` and individual report details; each analyte is currently a heading and has collapsible source facts/trends, rather than a unified clearly clickable marker detail. Its open-on-request behavior exists.
- `client/src/pages/Microbiome.tsx`: organism list is a table inside the separate `bacteria` tab, where each name is a `<button aria-haspopup="dialog">`, with search and topic filters. Selecting opens `MicrobialProfile`.
- `client/src/components/MicrobialProfile.tsx`: accessible Radix Dialog containing portrait, research sections, report facts, sources and limitations. Source-specific profile capability survives.
- The code alone cannot prove that the exact former on-screen layout was removed by R4, or whether a current deployment reflects these files. Request actual deployed before/after screenshots and reproduce with a saved lab/report fixture. Do not state that functionality was deleted without verification.

## Product decision
**Restore obvious tap/click-by-name navigation as a first-class premium UX pattern.** Keep the existing biological provenance, laboratory report identity, dialog focus restoration, source-specific values, and safe state handling. A simplified visual composition is **not** permission to hide the scientifically useful details or replace them with summaries.

## Bloodwork design contract
1. Lab Results surface: introduce a compact **Browse results** region above source management; preserve real report/source identity, dates and any unit-review alerts. Show genuine source headings where available; do not invent unverified panel membership from analyte names.
2. Under each actual report/source section, show analyte rows: `Name` (clearly interactive), latest applicable source-reported value + unit, collected date, and a subtle `View details` affordance. Missing / provisional values are explicitly marked. Choose a responsive single-column list on 390px and a visually quiet two-column list only when it improves scanability at 1440px. Avoid a card per measurement.
3. Selecting an analyte name opens its actual **marker details** in a modal/sheet or an expanded adjacent region; use existing `LabSourceHistory`, `LabSourceContext` and `LabTrend` rather than rewriting lab data. Contents: exact marker name, dated observations, original units/reference text, source/report/specimen association only when recorded, provisional state, applicable chart with real dates, and correction/deletion controls in their existing safe flow. Rows without interpretation must remain browsable.
4. Preserve `?tab=labs&labResult=<id>` deep links, return focus to activating marker, Escape/back close when a dialog is used, and ensure only the current account's record may open. No surprise scroll into a hidden collapsed multi-level area. Avoid hiding main bloodwork browse beneath long import-management forms.
5. Do not group by inferred Liver/Kidney/Inflammation or invent color-coded high/low unless a verified source explicitly supports that. If a user-facing research organization is offered, clearly separate it from original report sections.

## Microbiome design contract
1. Make **Bacteria & other reported organisms** a prominent discoverable section on Gut Reports, not a hard-to-find tab under report-management chrome. Keep report selection, report date, taxonomy resolution, comparison caveats, search and research-topic filters.
2. Restyle the `microbial-composition-table` into a responsive **compact organism explorer** using one section surface with whitespace/dividers, or quiet list rows. Avoid every organism being its own large bordered card and avoid nested cards within the profile.
3. Each row: optional 36px illustrative portrait or neutral symbol, *italicized reported source organism name*, reported value/status when present, taxonomy resolution, and an obvious chevron/`View organism` indicator. The name itself is a button; row-wide click is optional but must not duplicate interactive nested targets. Touch targets >=44px.
4. Keep `MicrobialProfile` as the deeper detail experience. Redesign its layout into a calm intro (organism name, source-labeled illustration and one reported observation), then an organized set of sections: **Your report**, **What research has studied**, **Nutrients & molecules**, **Food research**, **Sources & limitations**. Use accordions or sectional navigation; avoid stacking separate dark cards inside a dialog.
5. Preserve source caveats: detection and abundance do not prove function, gut health benefit/harm, a metabolite value, strain identity or disease risk; archaea are not bacteria; relative abundance is not an absolute count. Functional research stays general, with citations and limitations. Do not classify observed organisms as good/bad or assign personalized score solely from research association.
6. Keep focus restoration, Escape/back, current account + selected sample isolation, proper dialog labeling, and empty/filter-no-results states. Provide list and single-profile accessibility checks on mobile and desktop.

## Visual division of authority
Graphic Designer owns the premium treatment for list rows, cards, source chips, charts, dialog depth and art. Structural UX owns discovery hierarchy, interaction, semantic rows, state handling and a11y. Branding owns friendly labels. Existing R4 canonical scoped CSS remains the single design source. Use real illustrations only as explicitly labeled representative art, never a matched image of a laboratory observation.

## Developer implementation packet (immediate, not an approval hold)
- Inspect current `PrecisionNutrition.tsx`, `BloodworkSourceOverview.tsx`, `LabSourceHistory.tsx`, `Microbiome.tsx`, `MicrobialProfile.tsx`, `OrganismPortrait.tsx`, relevant CSS, and route state at exact SHA. Capture baseline 390px and 1440px screenshots with real fixture data.
- Create/refactor presentational components **without duplicating underlying data pipelines**: `BloodworkMarkerExplorer` and `MicrobialOrganismExplorer` are suggested boundaries, not mandatory new route shells. Preserve account isolation, links, source dates, unit review and existing mutation safeguards.
- Implement clean rows + details; move technical source/import tools into labeled secondary disclosures without removing functionality. Deep link directly to the requested marker and organism where authorized.
- Add automated tests for clickable name, modal/detail open and close, focus restoration, source qualification, null and provisional values, empty search, report switch/account switch, tab navigation and mobile key/touch behavior.
- Capture real before/after 390/1440px in Everyday light/dark and Athlete where applicable; Designer + User Review inspect visual hierarchy and scanability. Continue other premium screen work in parallel.

## Acceptance criteria
- A first-time user can identify *where to browse bloodwork results* and *where to browse reported organisms* within three seconds of reaching the relevant view.
- Clicking an analyte or organism name opens useful dated details, with a visible and keyboard-usable return path; no nested disclosure hunt.
- The compact explorer is less box-heavy than R4's institutional lists while preserving exact values, source provenance and the ability to inspect all supplied observations.
- Real-world missingness, provisional data and comparison limitations survive unchanged; no fabricated grouping, normalization, classification or diagnosis.
- No structural or visual `PASS` until tested against the deployed application. **This is a build correction inside the current premium milestone, not a new gate.**