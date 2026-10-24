# Bloom — Active Codex Execution Queue
**Updated:** 2026-10-23 | **Branch:** `enhance/bloom-experience` / PR #1 | **Owner:** Chief Architect, implementation by Codex only

> **Read this first at session start.** This is a short *next-action index*, not a replacement for `CURRENT_V05_REQUIREMENTS.md` (authoritative v0.5 scope), `V05_IMPLEMENTATION_STATUS.md` (implementation evidence), `DEVELOPER_EXECUTION_ORDER.md` (milestone order), `V06_HANDOFF.md` (future requirements) or security/legal gates. Verify code and tests before starting: an item listed here may have been completed after the last reconciliation. Do not overwrite concurrent Codex changes.

## Now — v0.5 only, complete vertical slices

| Sequence | Slice and definition of done | Gate |
| --- | --- | --- |
| 1 — **P0** | **Make packaged-food search lead to a saved meal.** Reproduce KitKat / `kit kit bar` and Michelina's Canadian searches, verify source config, enable permissible USDA **Branded Foods** querying separately from generic FNDDS; implement typo/alias/exact-SKU ranking and transparent no-results path to barcode/label/manual entry, saved repeat product and accurate daily totals. Keep raw text and package/source/units. Add product-search tests with source enabled/disabled/unavailable, mobile journey and account isolation. | `UT-FOOD-501/502/503/505`. Do **not** enable Open Food Facts until explicit current Legal/Integration licensing approval. A missing exact SKU must not be silently invented. Verify existing barcode/photo features before promising them. |
| 2 — **P0/P1** | **Finish remaining Today / nutrition correctness:** more evidence-supported next actions, complete preference/units coverage, existing food→journal→nutrient totals→goal planning path and user-visible uncertainty. Follow actual remaining acceptance in current v0.5 requirements and latest implementation status; do not redo completed UI. | Safety, food calculations and applicable evidence approvals. |
| 3 — **P0/P1** | **Account, export/backup/vendor lifecycle and remaining clinical evidence surfaces.** Deliver coherent, tested end-to-end journeys. Keep unsafe clinical and licensed data-provider features gated. | Security, privacy, legal/clinical and source rights for feature activation. |
| 4 — **Release acceptance** | **Actual platform and independent acceptance:** integrate/verify native HealthKit/Health Connect when required, device/accessibility/persona testing, cross-domain regression, Render preview and CI. Explicitly record external device/credential or specialist review blockers; pursue independent unblocked work. | Do not claim web mocks or synthetic tests equal native-device testing or public release approval. |

**Immediate focus:** work on sequence 1 until a real meal can be saved reliably; avoid distributing effort across unrelated refinements. Sequence numbering is not a claim that preceding items have no partial implementation. Check `V05_IMPLEMENTATION_STATUS.md` and current code on each pass.

## Later — v0.6 only after v0.5 completion

1. Audit actual dependency graph, violations and CI/migration/rollback gaps (`MOD-ARCH-01–05`, `ENG-EVOL-01–10`), then fix only critical blockers; concurrently establish purpose-scoped, versioned AI/observation contracts.
2. Ship first useful, **fully connected Eat–Move–Recover** workflow with manual fallbacks.
3. Layer training/recovery guidance, measured response learning, reviewed biology/evidence, optional Coach, and carefully gated advanced research in the order specified by `DEVELOPER_EXECUTION_ORDER.md`.

## Operational rules — minimize overhead without weakening quality

- **No approval pauses:** Codex may implement, commit, push and update the existing protected Render review branch for approved work. Owner approval is **not** required for routine commits; feature-specific legal, security, privacy, medical and licence activation gates remain binding.
- **One vertical slice at a time:** Deliver useful working behavior including wiring, data compatibility and cross-module regression. Avoid isolated UI demonstrations that cannot save real records or generate real outputs.
- **Risk-proportional testing:** During iterative coding run targeted TypeScript/unit/provider/permission tests relevant to edits. Before publishing a substantive slice, run the required broader CI, production build, persistence and critical end-to-end paths. Never weaken mandated security/advisory gates or misstate unrun tests.
- **Lightweight evidence:** For routine internal changes, commit message + precise concise status row (implemented/tested/blocker/commit) suffices. For substantive visual changes use the existing selective before/after requirement. For schema, safety, permissions or provider switches preserve stronger audit/rollback/approval evidence. No repetitive galleries or essay-style progress logs per small change.
- **Blocker segregation:** Log an externally gated item once with owner, exact decision/evidence needed and safe fallback. Continue unrelated unblocked work. Never silently enable a blocked clinical/provider/research feature.
- **No overlapping planning mandates:** New specialist handoffs go to Architect consolidation. Codex follows this queue for near-term focus, full v0.5 specification for scope and security constraints, and execution order for future versions. Specialist comments are recommendations until reconciled.
- **Update cadence:** At the end of a substantial functional slice, update this queue only when order/status materially changes, and update `V05_IMPLEMENTATION_STATUS.md` with concise test/preview evidence. Do not repeatedly rewrite large architecture source docs for routine bug fixes.
- **Keep architecture useful:** Secure, interchangeable domain modules must still support legitimate cross-module flows. Prefer tested provider contracts over speculative platform abstractions, and the smallest robust change over a broad rewrite.

## Verification snapshot

At the last Architect check PR #1 reports **188 Node tests** and live Render deployment for implementation commit `082f081`; subsequent architect-only documentation commits do not themselves verify latest running code. **v0.5 is incomplete.** New packaged-food incident requirements and alternate USDA branded source plan are **documented but not confirmed implemented**. Codex must update this snapshot from current code and CI before asserting a new status.

## New Branding deliverables reconciled — 2026-10-23 (Architect intake)

**Delivered in shared Bloom Library, not confirmed committed/implemented:** `Bloom_v05_Scientific_Insights_UI_Kit_2026-10-23.zip` and `Bloom_v05_Scientific_Insights_UI_Kit_Design_Handoff_2026-10-23.md` (SCI-UI-01–07); `Bloom_Asset_Audit_Addendum_2026-10-23.zip` and `Bloom_Asset_Audit_And_Signoff_2026-10-23.md` (MKT-ASSET-601–605). The asset audit confirms 16 scientific kit archive entries (editable TSX/CSS/SVG/examples/browser preview), branded-food no-results SVG wireframe, and deferred research-consent wireframe. This **closes the earlier missing-design-package concern**, not code implementation or specialist sign-off.

**Codex use at current v0.5 slices:** During P0 food-search work, review MKT-ASSET-601 and adapt its spelling, zero-result, barcode/label/manual/generic and serving-confirmation interaction into **existing `ProductPicker`**. While finishing scientific presentation MKT-011–014/019 and relevant MKT-015–020, import/adapt the scientific kit's typed reference components to existing `EvidenceInsight`, `LabTrend`, `LabUnitReview`, `ImportedReportDetails`, `TodayFocus`, shared design tokens and data services. Do **not** build duplicates or treat example fixtures as actual source data. Source-specific observed/estimated states, unit confirmation, dated method-compatible trends, accessible table, uncertainty and six failure/missingness states are acceptance gates. Confirm real responsive/light-dark/keyboard/screen-reader behavior. Biology, Security and User Testing reviews remain outstanding. Continue current v0.5 sequencing, do not interrupt active coding for blanket UI rebuild.

**Deferred only:** MKT-ASSET-602 research-consent concept is NOT permission to launch a research network or consent flow; MKT-ASSET-603 Coach professional kit and MKT-ASSET-604 v0.6 interactive multi-goal kit are incomplete/future. MKT-ASSET-605 is real-build visual/accessibility QA, not satisfied by asset inventory. No new external authorization gates beyond existing scope.
