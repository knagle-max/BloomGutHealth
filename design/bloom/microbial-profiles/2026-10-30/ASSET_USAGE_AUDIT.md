# Bloom — Current-build design asset utilization audit and promotion plan
**Date:** 2026-10-30 | **Owner:** Branding & UX | **Scope:** source-tree and selected component audit; **not** full runtime bundle or screenshot acceptance.
**Inspected:** `enhance/bloom-experience` at `cdd362809eb5c504cb6595abe61290960d296c4d`. GitHub recursive tree returned 1,762 entries, not truncated.

## Evidence-based asset status
| Family | Source state | Usage / design disposition |
|---|---|---|
| Original approved brand | 13 `client/public/brand/` files, confirmed historical byte match in `design/bloom/VERIFICATION.md` | Keep existing runtime source; **do not copy duplicate logo/icon/empty journal assets**. Exact runtime loading of each individual asset not audited. |
| Consolidated 2026-10-25 archive | `design/bloom/archives/`, 175 manifest entries, historically verified 174 files, 117 SVGs parse; one original legacy preview missing | This is an **archive**, not a promise every mockup should appear in the app. Do not import all archived SVG/CSS/TSX. Prioritize by current accepted UX and phase. |
| Flagship 2026-10-26 | `design/bloom/flagship/2026-10-26/` includes UX/visual contracts, prototype, five editable SVGs, reference images. `client/src/flagship-core.css` and `docs/review/flagship-core-20261029` exist | **Partially implemented** Today/Food. Developer's review packet explicitly says Athlete/Biology/Progress broader programme and full visual signoff remain open. Do not equate concept-image use with fidelity. |
| Exercise Intelligence | `design/bloom/exercise-intelligence/2026-10-29/` and older `design/bloom/exercise/2026-10-29/` are both present, including per-set SVG, contracts | Sources **already transferred**, so do not reupload. Current live parser/display per-set fidelity must be checked in actual build against last Amendment D v1.4; earlier screenshot revealed generic strength extraction. |
| Microbial clickable profile | `client/src/pages/Microbiome.tsx` still renders `Bacterial composition & change`, plain text `b.bacterialName` in `td`, no inline onClick/profile trigger. `ImportedReportDetails.tsx` offers separate educational cards | **Confirmed source-level gap**: promote editable `microbial-profile-sheet.svg` plus binding UX contract/Architect handoff from this design branch into Developer implementation. Reuse existing `shared/report-explanations.ts` research catalogue; no duplicated health data. |
| Preview-only / speculative screens | Some master athlete/coach/digital-twin imagery and concept screens live in archive | **Do not promote indiscriminately**. Unreleased Coach, clinical claims, simulated outcomes, AI/photo or device capabilities must remain gated; concepts are references not production UI. |

## Specific promotion decision — do next
**MKT-ASSET-3101 (P1)** — Microbial composition clickable profile: Developer cherry-picks/source-imports the three **editable, repository-native** assets in this directory into `enhance/bloom-experience`; integrate accessible taxon click target, research panel and exact original observation. Preserve sample/filter/scroll, focus return, screen reader and scientific evidence segregation. Architect reconciles UT-TAXON-2801–2808 and BIO-TAXON-2901–2905. Biology approves claim text. No automatic personal target, organism risk grade or inferred metabolite.

**MKT-ASSET-3102 (P1)** — Flagship partial implementation: compare approved flagship five SVG references and UX contract to live Food/Today, Athlete, Biology and Progress; use scoped before/after screenshots, prioritize still-approved portions. Do not silently replace Canonical Food or Athlete child-set workflows with archived proposal code.

**MKT-ASSET-3103 (P1)** — Exercise per-set UX: verify current rendered strength review against latest approved 2026-10-29 v1.4; expected one bench-press parent, each set individually editable with compact completion icons and truthful reported-vs-confirmed status. Developer records exact source→parse→draft→save→reload evidence.

**MKT-ASSET-3104 (P2)** — Historical archive inventory: Developer runs static reference/bundle check against all app source + `public` on exact checkout, records referenced/unreferenced and intentional preview-only assets, and flags duplicates/obsolete files. No deletion without reviewing original manifest, licence and active design references. Earlier `VERIFICATION.md` is a **source-integrity** audit, not a runtime usage audit.

## Verification boundaries
Tree inventory does **not** establish any asset loaded in the deployed Render app, whether bundled/pruned, or full UI acceptance. A robust exhaustive unused-assets report requires source import graph, CSS URL references, dynamic references, public assets and built output plus browser traces at the exact deployed SHA. Do not report 274 design-tree entries as 274 unused assets: that counts directories and documents and intentionally archived references.

## Delivery and status
Branch `design/microbial-profiles-2026-10-30`. Source files: `UX_CONTRACT.md`, `ARCHITECT_HANDOFF.md`, `microbial-profile-sheet.svg`. All are editable GitHub files and each was read back successfully; this report is added as the audit. Designer owns UX fidelity, Architect integration, Developer merge/implementation, Biology claim signoff, User Testing independent acceptance.
