# Bloom v0.5 — Final Independent User Testing RC Review

**Report ID:** UT-RC-V05-20261108-FINAL-R1  
**Date:** 2026-11-08 (America/Regina)  
**To:** Chief Architect & Integration Lead; Branding/Graphic Designer; Structural UX; Developer/Codex; Product Owner  
**Reviewer:** Independent User Testing & Product Research specialty  
**Disposition:** **ENGINEERING EVIDENCE POSITIVE; NO NEW INDEPENDENTLY REPRODUCED P0 DEFECT; INDEPENDENT HUMAN / LIVE-VISUAL ACCEPTANCE NOT PERFORMED. OWNER RC DECISION READY WITH EXPLICIT LIMITS.**  
**Code modifications:** None. **Production data changes:** None.

## 1. Emotional reaction and short decision

**I felt cautiously encouraged, but still unsatisfied by the missing real-user visual evidence.** Bloom's previous Food complexity and hidden bloodwork/microbiome explorers were real product concerns. The RC appears to have invested in fixing the underlying interaction paths, not just repainting them. That is meaningful progress. But a green CI cannot tell us whether a first-time iPhone user enjoys adding food, or whether the Biology interface actually feels premium and organized. **Novice Friction: I don't know what to do next** remains an explicitly *untested question*, not a current demonstrated failure. **Expert Friction: This hides the underlying biology** is likewise a past user concern requiring the real-screen discovery test. Do **not** assert a current **Bland/SaaS Alert** without actual screenshots; retain it as a mandatory visual review category.

**Decision to Architect:** Present the current full RC to the Product Owner for a *single* final go/no-go; do not invent new pre-development approval gates, restart design, or delay unrelated work for a fresh specification. Report precisely what engineering proved and what independent subjective/hardware testing did not. Any newly observed critical defect should be logged and corrected with an exact-SHA retest, not treated as a speculative global blocker.

## 2. Exact reviewed source / environment

- Repository: `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`, PR #1.
- **Latest source/deployed RC SHA:** `f077da1aade3da240180c5bdccc5981702603205` (GitHub PR head at review).
- **Matching live Render deploy:** `dep-dbogh6m8bjmc73b7dao0`, same SHA, service `srv-db9u7mjbc2fs73d86uv0`, preview `https://bloomguthealth.onrender.com/`.
- **Exact-head GitHub Actions:** workflow `42536362821`, completed **success** (independently checked). The **672/672** count pertains to application `d20e384b9223bef553f6a0def273f0d697028846`, workflow `42533189930`, reported in pinned full-RC packet. The final two commits publish evidence/QA and remove sensitive cookie values from failure assertions; application source-tree equality is **reported by packet**, not a new independent execution of 672 tests.
- Main unmerged; v0.6 paused.
- **Important preview caveat:** Render is bound to a new isolated `review/bloom-v05` database; legacy owner accounts and records were **not migrated/copied**, so test with newly created synthetic accounts. The time-bounded hosted write-test guard is separate from database lifetime.
- **Independent test environment:** GitHub connector source inspection, Render connector deployment query, CI status query, Architect/developer RC evidence packet. Direct web access to `https://bloomguthealth.onrender.com/` returned inaccessible/error from the available web access tool. No authenticated interactive cloud browser, real iPhone/Safari, physical keyboard, VoiceOver, recruited human testers or new RC screenshots were available/executed here.
- **No private medical fixtures** inspected or used for live tests. The packet says reconstructed/deidentified two-PDF acceptance completed locally with a real bundled worker; this is developer-reported evidence, not independent third-party re-execution.

## 3. Source-grounded implementation assessment

| User task / source | Finding at exact RC | Grade |
|---|---|---|
| Fast first food entry, `/log-meal`, `LogMeal.tsx` | Has immediate canonical text composer and optional methods; `R4_M1_UNIFIED_FOOD_EDITOR_20261108.md` reports responsive App→HTTP→SQL journeys and source-preserving review. | Source-verified + developer engineering receipt; human ease unverified |
| Edit a saved meal, `NutritionHistory.tsx` → `/log-meal?edit=` | Journal edit now navigates to the canonical composer rather than a separate text-only form; reviewed PUT/retry documented. | Source-verified; live uncoached edit untested |
| Change ingredient / household quantity | `MealAnalysis.tsx` retains individual food/portion controls, source/unknowns and review invalidation; test receipt includes pizza slices, eggs/toast and safe bunless-burger abstention. | Engineering evidence; physical usability untested |
| Grouped bloodwork, `LabExplorer.tsx` | Expandable categories and named marker actions remain with trends and original-source details; on `/progress?view=biology`. | Source-verified; discoverability unresolved |
| Microbiome clickable organism cards, `Microbiome.tsx` / `MicrobialProfile.tsx` | Bacteria list still invokes the organism detail sheet with source observation, taxonomy, research and limitations; profile discovery button present in Gut reports. | Source-verified; discoverability and touch behavior untested |
| Athlete per-set editing | Packet reports stable IDs, independent sets and units, planned/completed distinction, manual + keyboard/test scenarios across widths. | Engineering receipt; native-device untested |
| Labs, genetics, reports, Progress, account lifecycle | Packet reports 672-test integrated checks, source/ownership/correction/erasure and isolated-hosted sessions; private source transfer not claimed. | Engineering receipt; independent clinical/physical/provider acceptance unverified |
| Visual identity, modes, responsiveness | R4/M1 copy/media integrated, 320/390/768/1440, light/dark/Athlete and 200% browser checks reported. **No screenshot gallery was delivered in the packet.** | Layout automation reported; subjective visual acceptance NOT TESTED |

## 4. Prioritized current punch list — no invented failures

### UT-RC-FINAL-01 — P1 experience risk: food flow could remain cognitively heavy
- **Trigger/task:** First-time user logs “two eggs, toast and banana,” corrects quantity/source, saves; then Journal Edit and Save changes.
- **Observed current:** Source shows unified composer and correction/save semantics; engineer's actual App/HTTP/SQL journey passes. No independently observed tap count, time to first action, or effort on mobile.
- **Expected:** Text input visible and focusable without method-choice detour; food rows and quantity editable in place; one clearly labelled final save; acknowledged receipt; Today/Journal/Progress parity. Simple path should normally avoid >3 unnecessary taps, while preserving explicit review for uncertain identity or amounts.
- **Reproduction script:** New synthetic account → Today → Add food → type meal → Review → correct banana amount/source → Save → Journal → Edit → correct toast quantity → Save changes → reopen.
- **Device:** 390px iPhone Safari **NOT TESTED**; 1440 desktop keyboard/browser **NOT TESTED**; engineering 320/390/768/1440 automated journeys **reported PASS**.
- **Impact:** Frequent daily task; P1 if actual excessive friction reproduced; P0 only if save/correction/data integrity fails.
- **Minimum acceptance:** No separate competing editor, no lost draft, correct reviewed ingredients and acknowledged one-row save, preserved original source/units and partial nutrients; straightforward first action on both viewport classes.

### UT-RC-FINAL-02 — P1 discoverability risk: bloodwork marker expansion
- **Steps:** My biology → Bloodwork; locate liver/lipid group → select ALT or triglycerides → read original date/value/unit and explanatory/chart details → back.
- **Source actual:** `LabExplorer` still exists and is rendered under Progress → Biology; My biology → Lab results emphasizes source-report records. This can hide the categorical marker experience from users expecting it within Bloodwork.
- **Expected:** Clearly labelled, direct access to grouped marker browser from the Bloodwork landing, with accessible return path and source precision.
- **Device:** 390 and 1440 real navigation **NOT TESTED**; source-confirmed route structure.
- **Severity:** P1 if undiscoverable. **Not a confirmed current broken click.**
- **Minimum acceptance:** A novice can locate the marker list immediately or via one obvious labelled action; tap/click opens its details and original evidence.

### UT-RC-FINAL-03 — P1 discoverability risk: microbiome organism profiles
- **Steps:** My biology → Gut reports → choose report → select Bacteria or “Explore organisms” → tap named organism → inspect biological and source tabs → close/back.
- **Source actual:** `MicrobialProfile` dialog and clickable organism list exist; prominence in long report layout is not established by source.
- **Expected:** One prominent organism-exploration entry, distinct from report management and technical source table; proper focus/Back and no invented abundance or clinical claims.
- **Device:** 390 and 1440 **NOT TESTED**.
- **Severity:** P1 if access is non-obvious, P0 only if current user scientific measurement represented falsely.
- **Minimum acceptance:** Named organism opens a useful profile in one tap after visible list, with real source-status caveats, references and close/return focus.

### UT-RC-FINAL-04 — Independent premium quality test not performed
- **Steps:** Show paired actual RC captures of Today, Food, Biology/Gut, Explore, Progress, Athlete and Profile to novice and expert reviewers at 390 and 1440, light/dark and mode variants, plus 320/768 and 200% cases for risk states; ask first action within 3 seconds and candid aesthetic reaction.
- **Actual:** Engineering reports responsive code/layout/browser checks and authentic assets. **No RC screenshot artifacts/human observation supplied to reviewer.**
- **Expected:** Warm editorial, tactile visual hierarchy, generous 16–24px panel padding, visual distinction across routes and no clinical/SaaS resemblance. Scientific telemetry inspectable but visually distinct. Art never hides CTA or facts.
- **Severity:** **NOT TESTED / visual acceptance unresolved**, not a newly confirmed P0 defect or permission to restart design.
- **Minimum acceptance:** Actual screenshots judged for attractiveness, originality, readability and brand fidelity; explicit Designer/User Review/owner result. Raise **Bland/SaaS Alert** only for *observed* institutional screens, not merely source names.

### UT-RC-FINAL-05 — Physical accessibility/mobile usability not performed
- **Steps:** On iPhone Safari and VoiceOver, use account creation, food correction, marker and organism dialogs, edit/save/retry, dark mode and 200% text; verify targets, focus, safe-area navigation and screen reader semantics.
- **Actual:** Developer browser/keyboard/zoom checks reported pass; physical device, VoiceOver and human acceptance not performed.
- **Severity:** **NOT TESTED**, feature-specific potential accessibility risk; no assertion current code fails.
- **Minimum acceptance:** No inaccessible critical action; screen reader label/read order and post-modal focus correct; no horizontal clipping on 320px.

## 5. User's twelve essential journeys: final independent evidence ledger

| Journey | Engineering evidence available | Independent reviewer execution |
|---|---|---|
| 1. Account without biological report | Hosted authenticated synthetic sessions, isolated review DB | NOT TESTED |
| 2. Goals and dietary exclusions | Code/contract/regression claims | NOT TESTED |
| 3. Free-text meal, sources, portions, review, save | Actual App/HTTP/SQL and regression receipt | NOT TESTED |
| 4. Reopen/edit saved meal and totals | Canonical composer and owned reviewed PUT receipt | NOT TESTED |
| 5. Import microbiome/genetics/labs | Native PDF compiled test and source storage claims | NOT TESTED |
| 6. Understand finding without technical coaching | Detailed source and educational components | NOT TESTED with human |
| 7. Multi-activity workout/set/reps/weights | Compacted set editor App/SQL receipt | NOT TESTED |
| 8. Historical Progress, unknown/partial | Chart/lineage regressions | NOT TESTED |
| 9. Preferences, permissions, sources | Profile/consent/revision checks | NOT TESTED |
| 10. Delete report and linked/derived effects | PostgreSQL/HTTP and hosted account deletion checks | NOT TESTED |
| 11. Mobile, dark mode, keyboard, assistive technology | Automated 320/390/768/1440 browser/zoom checks | NOT TESTED physical/VoiceOver |
| 12. Invalid input, network errors, incomplete records | Source revisions, retry, outage fixtures | NOT TESTED live fault injection |

## 6. Final recommendation and decision boundary

**No confirmed new release-blocking defect was independently reproduced during this review.** The existing developer-reported engineering receipts and verified current-head green CI support presenting the RC for a **single owner go/no-go** now. **Do not mark independent usability/visual/physical-device acceptance as PASS**. The unresolved items above are targeted acceptance unknowns and owner-observed priority areas, not fresh proof the final build is defective. Any visible failure at the owner's RC walkthrough should receive a specific reproduction, screenshot, severity and focused correction; no new blanket design freeze.

**Recommended 5-minute owner smoke review** (same fresh review account; one mobile viewport and one desktop): (1) Add food → adjust quantity → Save → Edit from Journal; (2) Biology → find ALT group/detail → Gut reports → open organism profile; (3) glance Today, Food and Progress in light/dark; (4) on Athlete verify individual sets. Capture brief notes/screenshot and decide `ACCEPT`, `ACCEPT WITH NONCRITICAL FOLLOWUPS` or `REJECT WITH EXACT REPRODUCER`. This is a helpful owner decision aid, not a new mandatory release certification process.

**Handoff routing:** Publish to shared `/Bloom gut health/Agent Handoffs/` for Chief Architect, Branding/Graphic Designer, Structural UX and Developer. Developer integrates any accepted bounded corrections on development branch and records the new SHA; main merge remains an owner decision.

## 7. Source/evidence links

- Full RC: `docs/verification/V05_FULL_RELEASE_CANDIDATE_20261108.md` and `.json` at reviewed SHA.
- Unified Food evidence: `docs/verification/R4_M1_UNIFIED_FOOD_EDITOR_20261108.md`.
- Release packet: `NEXT_ACTIONS.md` at reviewed SHA.
- Exact-head CI [42536362821](https://github.com/knagle-max/BloomGutHealth/actions/runs/42536362821) success; application CI [42533189930](https://github.com/knagle-max/BloomGutHealth/actions/runs/42533189930) 672/672 source receipt.
- PR [#1](https://github.com/knagle-max/BloomGutHealth/pull/1); preview https://bloomguthealth.onrender.com/ .
- Code: `client/src/pages/LogMeal.tsx`, `NutritionHistory.tsx`, `Microbiome.tsx`, `Progress.tsx`; components `FoodEntryChooser.tsx`, `MealAnalysis.tsx`, `LabExplorer.tsx`, `MicrobialProfile.tsx`.