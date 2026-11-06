# Bloom microbiome-report food influence — Branding & UX handoff
Date 2026-11-05. **Disposition: APPROVE WITH REVISIONS**, for Chief Architect reconciliation; not implementation/clinical or User Testing approval.
Requirements: BIO-MICROFOOD-01–08; UT-MICROFOOD-4501–4512.

## Existing verified source
At development commit `aab68943dfda97100d124e5f73a6a1d645e8717e`, `client/src/components/ProviderFoodSuggestions.tsx` is a read-only, searchable/filterable display of imported provider categories. Its wording explicitly states no food ranking influence. It has no demonstrated opt-in. Do not classify cross-app opt-in ranking as already implemented.
Source discrepancy: current November 5 specialist handoffs say **299 rows** (240 Enjoy, 28 Superfood, 22 Minimize, 9 Avoid), whereas a previous reviewed extraction package claimed **371 rows**. Do **not** harmonize without exact document/sample identity, original PDF text/page inspection and parser-version receipt. No row counts should be hard-coded into user-facing UI.

## Experience decision — one setting, one quiet marker, no new dashboard
1. **Where:** At the end of successful reviewed microbiome report import, an optional single-line opt-in: `Use my microbiome food recommendations`. Description: `Let foods listed in your report help personalize meal ideas and food suggestions.` Starts OFF. A persistent version is in Profile → Food preferences or the report’s `Food suggestions` section. Do not force a wizard or separate top-level screen. Accessible native switch/checkbox, state reflected across sessions.
2. **When On:** The existing canonical suggestion engine may use verified exact food-category mapping as a modest secondary ranking signal, subordinate to exclusions, allergies, validated nutrition and goals. It must not change search hits' factual existence, logged meals, macros, safety constraints or claims of measured microbial function. Food search remains usable when Off.
3. **Where the marker appears:** *Only* on a recommendation actually materially influenced by the enabled report: quiet outlined icon + `Microbiome report match`. Do not repeat badge on every historical imported food row or make it a dominant card. On a natural source lookup with no ranking effect use `Listed in your report`, not a promoted influence label.
4. **Why this suggestion:** One disclosure attached to the suggestion, not a full-screen scientific warning. Default sentence `Your report was one factor in this suggestion.` Expanded detail: original source provider, category, original food label, source page and report date, other contributing recommendation factors. Show `Ignore this suggestion` and `Turn off report influence`. Provider-neutral compact badge, provider named in details.
5. **Avoid / Minimize:** These are original provider classifications, NOT an allergy, medical prohibition, or warning during food logging. User may log bell pepper without an alarm, shame or blocked save. Do not display an alarming red label in regular suggestions. Preserve categories verbatim within clearly attributed source details.
6. **Recipes:** If only oats and banana are verified matched, show `Your report mentions oats and banana` in details with distinct provider categories; never assign whole recipe `Superfood` or claim ingredients alter a measured butyrate score. Unmatched ingredients do not inherit labels.
7. **Conflict:** User exclusions and dietary preferences ALWAYS win. Avoid surfaces suggesting excluded seafood, even if report suggests it. Allow per-food override while retaining source data.
8. **Fallback and fail-closed:** With Off, no matching source, ambiguous food identity, deleted or older unselected report, unresolved sample link or missing consent: no report signal, no influenced badge; ordinary food recommendation and logs remain usable. One short setting or source status explains why where relevant. Do not show repeated caveats.
9. **Source versions:** Report history and selected test sample remain separately available. Old conflicting reports are not merged into a synthetic consensus. On deletion, consent withdrawal or account switch immediately drop report-derived ranking and badge from cached surfaces. Do not show current-measurement language for historical sample.
10. **Privacy:** opt-in authorizes only in-app ranking, not external AI/provider sharing. Keep personal report IDs out of analytics, query URLs and public source assets.

## Screens to adjust, not rebuild
- Microbiome report detail: `ProviderFoodSuggestions.tsx` already lists historical source categories; add quiet opt-in section and source details. This is the setting’s primary discovery point.
- Food Discovery & eligible recommendation lists: `Microbiome report match` below item title or next to one short reason, only when contribution proven. No new tile. Search result identity/ingredient facts untouched.
- Meal planner, recipe ideas, swaps: shared influence resolver, one reason disclosure and per-ingredient match in detail, never a recipe-level medical label.
- Food logging/journal: do **not** show report Avoid banners or change nutrition values; optional source provenance only in deliberate detail.
- Profile Food preferences: one toggle and link to source report, not a microbiome control center.
- Today: no automatic report-influence summary card; contextual recommendation may carry quiet marker if actually influenced.

## Microcopy
- Setting: `Use my microbiome food recommendations`.
- On first use: `This can help personalize food ideas. It won’t change your nutrition totals or restrict what you can eat.`
- Marker: `Microbiome report match`.
- Why: `Your imported report was one factor in this suggestion.`
- No match: `We couldn't match this food reliably, so it won't affect suggestions.`
- Source view: `Listed in your microbiome report`.
- Off: `Report preferences are off. Your saved report is still available.`
- Conflict in details: `Your food preference takes priority over the report's suggestion.`
- No `microbiome-approved`, `safe/unsafe`, `clinically recommended`, `improves your gut bacteria`.

## Acceptance criteria
A. Real 299 vs 371 fixture discrepancy documented with checksum/source version and exact page/row verification prior to canonical influence activation; do not fabricate rows. This is a source reconciliation dependency, not an owner decision.
B. Off by default after report import. Setting retained per account. No influence on ranking, markers or prior meals while Off.
C. On with verified exact `Oats` mapping: item rank may change only as secondary input; marker only when actual order/selection materially changed. Details show source.
D. Same item appears independently for nutritional reason with no report contribution: **no marker**.
E. Almond milk ≠ almonds; cow kefir ≠ plant kefir; green onion greens ≠ whole onion; walnut oil ≠ walnuts; unmatched means no influence.
F. No source Avoid allergy warnings; bell pepper logs normally; seafood exclusion always holds.
G. Mixed recipe shows individual category detail, no fabricated whole recipe status.
H. Opt-out, delete, account switch, conflicting report and source correction invalidate all derived influenced results and retained UI caches.
I. At 320px and 200% zoom, keyboard and VoiceOver: setting, marker, reason, source and override reachable. First viewport not consumed by warnings/extra cards.
J. Uncoached users can distinguish import, optional ranking influence, provider opinion, nutrition evidence and actual measurement. This is not yet tested.

## Specialist handoff format
A. IDs above plus FOOD recommendation and MICRO import UI.
B. Current read-only provider display verified from code; opt-in/ranking and human testing unverified.
C. APPROVE WITH REVISIONS: one setting, quiet marker, separate source data, no new dashboard.
D. Details and acceptance A–J above.
E. Architect/Integrations source version and 299-vs-371 discrepancy; Biology evidence; Legal rights; Security opt-in isolation; Developer ranking instrument; User Testing real-device comprehension.
F. v0.5 P0 correctness/opt-in/source truth, P1 cross-surface rollout and recipes; v0.6 advanced mechanisms.
G. No new Product Owner decision required; default Off is specialist safety recommendation for Architect ratification.
H. Architect: adopt as presentation contract, reconcile named IDs and input resolver, route to Codex only with approved centralized ranking architecture. Do not rebuild existing provider list component.
