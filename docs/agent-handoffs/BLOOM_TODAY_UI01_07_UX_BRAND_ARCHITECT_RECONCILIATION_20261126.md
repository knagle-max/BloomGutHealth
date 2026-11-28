# Bloom — TODAY-UI01–07 approved UX + Brand visual handoff: Architect reconciliation

**Owner intake:** 2026-11-26. **Disposition:** ACCEPT approved selective UI design *as directional presentation/UX*, with source and execution qualifications. **Not** automatic product-scope, medical/scientific, source-data or release approval. Follow root `AGENTS.md` and the **single** `NEXT_ACTIONS.md` task selector. Companion [all-four-package source availability and UX gap-sweep handoff](BLOOM_20261126_FOUR_PACKAGE_UI_UX_CODEX_INVENTORY_AND_COVERAGE.md).

## 1. Exact owner original and independently verified intake

**Outer ZIP:** `Bloom_TODAY_UI01-07_Approved_Design_Handoff_2026-11-26(1).zip`; 2,493,313 bytes; **SHA-256 `edbcd27527cf979140dfaa065b615290ae6140a622e8d41e5eb94097f69a2dbd`**. ZIP CRC passes. **20/20 `manifests/SHA256_MANIFEST.json` entries independently verified by original byte count and SHA-256.** This archive contains a single common top-level directory (`Bloom_TODAY_UI01-07_Approved_Design_Handoff_2026-11-26/`).

Content:
- **Six** approved PNG review boards: `approved_review_boards/TODAY_UI01.png`, `UI02.png`, `UI03.png`, `UI04.png`, `UI06.png`, `UI07.png`.
- **Five** editable **design-review** SVGs: `editable_review_svg/TODAY_UI01.svg`, `UI02.svg`, `UI03.svg`, `UI04.svg`, `UI06.svg`. **UI07 is PNG-only; no editable original exists in this ZIP.** Do not present review-SVG files as production components or replace approved BVA art.
- Primary owner design handoff `handoff/ARCHITECT_CODEX_MASTER_HANDOFF.md`; `handoff/ASSET_AND_COMPONENT_REUSE_REGISTER.md`; `handoff/IMPLEMENTATION_STATES_RESPONSIVE_SPEC.md`; `manifests/DESIGN_APPROVAL_REGISTER.csv`.
- **Full 8,964-byte UX specialist original** `reference_documents/Bloom_Today_Brand_UX_Handoff_2026-11-26.md` (ID `UX-TODAY-BRAND-20261126-R1`, acceptance T01–T16).
- Brand specialist reference and routing `reference_documents/Bloom_Today_Brand_UI_Asset_Handoff_Shared_Library_2026-11-26.md`; **full authoritative Brand specification is already in GitHub:** [Today Brand/UI hierarchy, tokens and source reuse](BLOOM_TODAY_BRAND_UI_TOKEN_ASSET_HANDOFF_20261126.md) (ID `BRAND-TODAY-20261126-R1`). Also read [standing Brand visual and token mandate](../../design/visual-system/STANDING_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md).

**Codex access boundary:** The SHA/manifest facts and this GitHub documentation are accessible in the branch, but **none of these original PNG/SVG/ZIP bytes are automatically installed in Codex's working directory through this review**. Owner will attach the exact ZIP in Codex, which must verify SHA and 20/20 manifest there. A screenshot-style reference is **not** proof of current app UI or source-persisted data.

## 2. UX/Brand review against actual source

**Principle:** Today = **Act**, My Biology = Understand, Progress = Observe. TODAY must foreground **one canonical eligible action**, not make Add food primary regardless of user state; brand art and secondary detail cannot push the primary action off the first viewport. No new engine, journal, medical recovery score, speculative contextual advice or punitive streak.

**Source inspection on `enhance/bloom-experience`:** `client/src/pages/Dashboard.tsx` already uses `TodayFocus`, `TodayFoodSummary`, `TodayStatus`, existing food journal and `ActivityRoutines`; `TodayFocus` delegates existing source action selection to `todayContextAction` and `useWellnessChoices`, including paused, loading, journal error and source freshness. `TodayStatus` uses Eat/Move/Recover recorded-source semantics. `CompanionHero` is presentation-only. **Potential real UX hierarchy defect**: `TodayFoodSummary` and `TodayStatus` both emphasize food, and `Dashboard` adds further food-journal blocks. This deserves bounded same-SHA rendered review; **not** an authorization to delete canonical summary/data, skip source accuracy or rebuild Today from a static mock. The older UX handoff's Nov 9 `main` source read is historical, not proof the current branch still has its hard-coded routing problem.

**Brand conclusion:** reuse existing BVA-0001 Today botanical asset, `EditorialMedia('today')`, existing `CompanionHero`, `TodayFocus`, `TodayStatus` and canonical five-method food capture. Conditional BVA-0008 journal-empty artwork requires real checked source/version proof; BVA-0027 is not a Today dependency. Use real opt-in computed `--bv-*` variables and four Everyday/Athlete × Light/Dark modes; review boards don't establish production color values. **No new original art / no new BVA ID** justified by this package.

## 3. Exact TODAY-UI screen decisions

| ID | Owner design disposition | Architect implementation interpretation |
|---|---|---|
| **TODAY-UI01 — Next Step** | Approved visual direction, editable board | Source-eligible contextual CTA owns hierarchy; Why this?/Adjust/Skip subordinate, source reason short. Neutral manual-food fallback only where eligible. Active Athlete workout only when a *real active* session exists. **Do not hard-code food as primary** from a concept PNG. |
| **TODAY-UI02 — lifecycle states** | Approved, editable board | Distinguish pending/selected/intended/planned versus actually recorded/saved, paused versus active, fresh/loading/stale/error, partial and unknown. Never show stale personalized CTA or completed state before canonical save. Error/retry preserves manually accessible capture. |
| **TODAY-UI03 — Eat / Move / Recover** | Approved, editable board | Compact flat source-based summaries, labels and source links; unknown is not zero, planned isn't completed, sleep report is not inferred recovery. Avoid competing dashboard card deck. |
| **TODAY-UI04 — Journal preview** | Approved **for current food journal**, editable board | Max 2–3 **actual** dated food entries with source/view/edit and View all. Reuse canonical food journal and five-method capture. **Do not imply a unified food/activity/sleep/pain journal exists.** |
| **TODAY-UI05 — Quick Log** | **Conditional / DEFERRED**, no board | A future route launcher must reuse actual supported capture flows and permissions. **No automatic authorization** to implement a multi-domain bottom sheet, new journal/store or duplicate forms. |
| **TODAY-UI06 — Theme tokens** | Approved visual direction, editable board | Reconcile exact existing computed four-theme roles, hierarchy, min 44px controls / 48px dominant action, contrast, focus and reduced motion; screenshot hexadecimal colors are reference, not global token replacements. |
| **TODAY-UI07 — Responsive/accessibility** | Approved with explicit caveats, PNG only | Layout samples are conceptual and **depict future mixed journal events / food CTA**: those are *not* feature approvals. Verify 320/390/768/1440, 200% zoom, keyboard/order, safe area, four themes and tested UI states. |

**Precedence:** Original full UX and actual source/consent precede illustrative board microcopy and future event mocks. Full maintained Brand source governs visual execution. Current `NEXT_ACTIONS.md` and latest owner permission govern coding and deployment; dated notes that the ZIP itself didn't authorize code are not a newly imposed stop on already authorized safe UI work.

## 4. Key source-truth and visual acceptance

- **Selected vs performed:** tapped suggestion is **intent**, not actual logged activity, intake, treatment or recovery. Completed only after canonical save; expired/stale choices and wrong-account context must be invalidated.
- **No fabrication:** Current Today journal is food-centric; it can show the existing food rows but must not display fabricated activity or symptom records as saved; no unreadable telemetry, invented calorie target, 'readiness' or recovery score.
- **Not blanket success:** Source acceptance `T01–T16` comes with **zero** executed user/browser test evidence in this package. For each eligible changed screen/status, Codex must run tests and report `PASS / FAIL / NOT_TESTED` at actual SHA. Real 3-second-glance participant test, physical device screen reader and final deployed UX are `NOT_TESTED` until actually performed.
- **Owner standing screenshot rule:** Render **390×844** and **1440×900** initial, selected/paused and secondary/detail states from the same build; review overlap, top-of-fold CTA prominence, source/freshness labels, card duplication and 320px/200% reflow. Extra 768/1440 theme variations as relevant; review focus/keyboard, screen reader only if tested.
- **Preserve existing:** BVA-0001 exact source and its possible runtime/manifest mismatch are *audit questions*, not authorization to regenerate art or search forever. BVA-0008 conditionally; original five-method food, existing Today journal, source corrections, user scope and material safety notices remain.

## 5. Execution and next Architect

**Scope for Codex:** Process through [the four-package full UI/UX design receipt & coverage matrix](BLOOM_20261126_FOUR_PACKAGE_UI_UX_CODEX_INVENTORY_AND_COVERAGE.md). Under a selected Today slice, read original full UX, Brand, relevant board and exact current code. Implement only a *reproduced* missing authorized UI requirement, preserve previous work, run focused and real rendered tests. Do **not** use a single preservation-line as a substitute for a per-screen implemented/missing/deferred matrix. No duplicate engine, multi-domain journal or premature Quick Log.

**Succession:** This handoff is durable and referenced from standing [Architect→Codex UI governance](BLOOM_STANDING_ARCHITECT_TO_CODEX_UI_UX_BRAND_GOVERNANCE_20261126.md). Original ZIP remains a separately transferred design source. **No Render until December**, public deployment, `main` merge, protected networking, external private-health transfer or unsupported clinical claim.

## Owner successor amendment — QL-20261127-R1 narrow Quick Log Phase 1 authorization

**This later owner directive supersedes the TODAY-UI05 blanket defer only for a limited, source-verified route-only universal Quick Log launcher.** Read the new [Quick Log canonical route eligibility and Codex implementation contract](../architecture/BLOOM_QUICK_LOG_20261127_R1_ARCHITECT_CODEX_RECONCILIATION.md) (QL-01..10, QL-T01..12). The **full multi-domain journal/composer and optional AI/voice natural-language parsing are still conditional**, as are any unsupported hydration, medication, pain, recovery or measurement writes. The source approval does **not** create an approved UI05 board retroactively; actual Today UX, Brand and real rendered mobile/desktop verification govern. Quick Log stays a **secondary persistent Today trigger** under the one-source-eligible primary next-step CTA, opening only confirmed editable canonical domain routes with no silent save. First selected bounded slice audits actual routes and implements a working authenticated sheet/popover launcher. One queue and November Render hold remain unchanged.
