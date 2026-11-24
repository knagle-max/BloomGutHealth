# Bloom — Architect disposition: Premium Visual System proposed production packages

**Reviewed 2026-11-23** · **Source (different design branch):** `design/biology-visuals-2026-10-30/docs/agents/branding-ux/Bloom_Premium_Visual_System_Architect_Handoff_2026-11-23.md` · source blob SHA `a2cbbcb602c10ddf73d24d4773b813a4ddc344d9`.

**Decision: ACCEPT THE INTENT, REJECT NEW BVA-PARENT REGISTRATION AS WRITTEN, MERGE NONDUPLICATE REQUIREMENTS INTO EXISTING CANONICAL CONTRACTS, DEFER ANY NEW ARTWORK UNTIL REAL SCREEN NEED.** Do not alter Codex's active queue, UI runtime, asset registry count, current approved illustrations, or biological/source semantics.

## 1. Exact ID conflict at latest development branch

At `enhance/bloom-experience`, the canonical `docs/visual-assets/visual-asset-registry.json` has 101 permanent numeric IDs. `BVA-0091`=C06 curved rods, `BVA-0092`=F03 budding yeasts, `BVA-0093`=A01 archaea, `BVA-0094`=P01 vacuolated protists, `BVA-0095`=P02 amoeboid protists. The design-branch handoff uses the same five numbers for proposed *presentation contracts*. **These IDs are unavailable and must not be reassigned.** The handoff's own conditional-ID/collision safety is correct, but assigning new IDs 0102+ would still duplicate current contracts and inflate the permanent art inventory unless a unique artwork deliverable becomes concrete. Rejected as a batch.

The handoff examined an earlier supplied baseline and admits that a default-branch indexed search cannot prove ID availability. The current numeric registry is the authoritative source.

## 2. Per-proposal disposition

| Design-branch proposal | Decision | Existing owner/contract and narrow future trigger |
| --- | --- | --- |
| Proposed `0091 Unified Data Visualization Kit` | **MERGE / NO NEW BVA** | Existing shared chart, R4/M1/visual DNA, scientific source/unknown semantics, BVA-0089 symptom markers and BVA-0090 nutrient source/diary/reporting separation. Reuse current charts and components; remedy actual failing source/denominator/ARIA instances only. |
| Proposed `0092 Editorial State Kit` | **MERGE / NO NEW BVA** | Existing UX state handling, skeletons, error/retry/unknown versus zero, partial/withdrawn source semantics. Existing meaningful designs remain. Extra spot illustrations receive new BVA only if justified on a named screen; generic skeletons and status text are not commissioned art. CLS ≤0.1 can be a measured quality target when meaningful, not a mandate to rebuild all screens. |
| Proposed `0093 Micro-Iconography Kit` | **REUSE/DEFER / NO NEW BVA** | Existing Lucide/R4 icons, ONB-A09 and BVA-0081 outstanding six onboarding goal glyphs. Audit at 16/20/24px only if a real use lacks an adequate icon. Do not rebuild a parallel icon pack or mark existing glyphs unapproved because new guideline exists. |
| Proposed `0094 Biological Event Timeline Kit` | **DEFER FEATURE-DEPENDENT / NO NEW BVA** | Existing events/progress/activity/source contracts and relevant prior design. A future user-authorized timeline can reuse applicable patterns; no new event store, implied correlations, or original schema without separate scope. |
| Proposed `0095 Typography, Surface & Onboarding Kit` | **MERGE / NO NEW BVA** | Existing approved `BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md`, cross-page preservation/additive policy, current Bloom tokens, R4/M1 and ONB-A07–A12. Preserve Everyday green, Athlete blue and Coach purple, use existing typography/surface primitives and improve only demonstrated shortcomings. 2–3 onboarding explanations are *not* an authorized image production quota. |

The **Explore → Understand → Verify** progressive-disclosure design pattern and reliable source/uncertainty semantics are accepted as refinements consistent with existing Bloom directions, not new runtime data logic, route architecture or a parallel component library.

## 3. Anatomy proposal is already substantially reconciled

The design-branch handoff's BVA-0087–0089 section acknowledged that 49/41/47 counts and sources had not been verified. Subsequent source work **already exists**: `docs/agent-handoffs/BLOOM_BVA_0087_0089_RECONCILIATION_V1_ARCHITECT_REVIEW_20261122.md` reads the six-file V1 ZIP and identifies 49 visual rows, 41 provisional unique IDs, 58 proposed edges, 10 unmatched canonical regions and ten pending decisions. The actual mapping approvals, 77 source-measured geometry anchors and clinical/anatomical review remain unverified. **Do not commission a second reconciliation.** Reuse the V1 row-level crosswalk/decision register; preserve symptom-vs-Athlete separate layers, underlying patient observation identity, front/back anatomical laterality, non-diagnostic markers and original approved hybrid body sources.

## 4. What remains useful, without overengineering

- Keep coherent, premium editorial design, strong typography, named units/denominators, subdued meaningful motion and noncolor source-state distinction.
- On an **eligible touched screen**, make the first action/observation obvious, expose interpretation progressively and keep evidence/assumption verification accessible. No invented clinical conclusion.
- Fix demonstrated actual screen issues using existing tokens and components: no new `bv-*` theme/library by default, new universal visualization grammar or mandatory seven-page styling milestone. Preserve strong existing designs, function and source provenance while improving weak compositions.
- When *new standalone illustration* is truly necessary, use the 2026-11-23 `AGENTS.md` **same-change placeholder → canonical BVA** rule and next permanent ID, not one of the conflicting design-branch proposed IDs.
- Avoid blanket review ceremonies: feature-specific science/privacy/rights and meaningful final design/UX verification matter; ordinary authorized styling/implementation does not require per-image/per-commit approval.

## 5. Codex, registry, and priority

This is a **documentation-only reconciliation**. Do **not** create BVA-0102..0106 for five abstract UI design contracts, or populate the existing BVA-0091..0095 with unrelated metadata. Do not modify `NEXT_ACTIONS.md`; active GI-01..GI-10 evidence/inventory baseline and owner STOP remain sole task. Deferred EE-04 remains deferred. Future screen-local qualified improvements can cite this disposition when selected.

**Final position:** **Design goals ACCEPTED / redundant five-parent asset program NOT APPROVED / anatomy V1 reuse REQUIRED / no new BVA IDs / no new implementation task.**
