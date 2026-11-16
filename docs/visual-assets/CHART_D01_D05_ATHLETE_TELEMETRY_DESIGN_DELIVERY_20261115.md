# Bloom — CHART-D01 through D05 Athlete telemetry design delivery

**Date:** 2026-11-15  
**Status:** Five complete editable *design candidate* packages published for Architect/Codex, not deployed or scientifically accepted.

## Source of truth
Shared Library: `Bloom gut health / Agent Handoffs /`

- `Bloom_CHART_D01_D05_Complete_2026-11-15.zip` — all five individual archive files and SHA-256 delivery index
- `Bloom_CHART_D01_D05_delivery_index.json` — ZIP hashes and archive metadata
- `Bloom_CHART_D01_Athlete_Telemetry_2026-11-15.zip` — heart-rate time series / qualified source zones
- `Bloom_CHART_D02_Athlete_Telemetry_2026-11-15.zip` — recorded strength progression / sets, plans
- `Bloom_CHART_D03_Athlete_Telemetry_2026-11-15.zip` — sampled pace / power / discrete exertion
- `Bloom_CHART_D04_Athlete_Telemetry_2026-11-15.zip` — planned / performed activity timelines
- `Bloom_CHART_D05_Athlete_Telemetry_2026-11-15.zip` — hydration / fueling, logged vs planned vs calculated

Corresponding registry entries in `docs/visual-assets/scientific-chart-asset-registry.json`.

Each package includes 72 editable SVGs (64 responsive, eight master), five PNG previews, scoped CSS, JSON contract, fictional-only fixtures, source implementation handoff, accessibility gates and SHA-256 per-file manifest.

**Modes:** Everyday Light, Everyday Dark, Athlete Light and Athlete Dark. **Responsive:** 320, 390, 768, 1440px. Examples contain fictional illustrative values and must never be used as user records. Non-scaling and provenance logic belongs in the runtime chart implementation.

## Required scientific behavior
- **D01:** Only source-sampled heart rate. Display zones only with recorded device or validated user zone thresholds. Do not bridge stream gaps.
- **D02:** Preserve performed vs planned, partial vs skipped. Training volume only when recorded inputs and units support it.
- **D03:** Recorded pace/power streams only. Manual RPE is discrete and not a continuously sampled stream.
- **D04:** Scheduled/recurring events not proof of performance. Unknown is not cancelled or zero.
- **D05:** Distinguish real logged intake, planned intake and calculated recommendation with independent sources. No entry is unrecorded, never 0.
- All charts: exact source timestamp, units, source authority, corrections and accessible tabular alternative. Keep missingness, revoked source privacy and 44px target contract.

## Integration steps for Codex and Architect
1. Retrieve ZIPs from Shared Library; verify hashes in delivery index and individual manifests.
2. Extract into agreed `design/visual-system/scientific-charts/v1/athlete/` source directory and import approved scoped CSS only once.
3. Use A01–A08 tokens and selected visual primitives, without reimplementing source models.
4. Bind source data into real charts in Athlete/Progress; never use synthetic specimen coordinates for telemetry.
5. Science reviews semantics and source comparability. UX signs off selection, accessibility and source drill-down.
6. Capture actual application at 320/390/768/1440, all four themes and 200% zoom; Designer reviews exact SHA screenshots. Source-availability tests and keyboard/table alternatives required.
7. Only after review mark designs **Integrated**/**Visually Verified**. As of this handoff both are **pending**.

## Release audit
Five individual kit packages and combined ZIP were uploaded to Shared Library. Scientific Chart Asset Registry contains 25 entries through D05. Static XML/JSON and archive integrity tests passed for local sources. This does **not** establish browser QA or app integration.
