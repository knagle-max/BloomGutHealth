# BLOOM — Universal Quick Log & Daily Capture Intelligence

**Owner original:** `QL-20261127-R1` · November 27, 2026 · amendment to `TODAY-UI05`. **Architect disposition:** accept full product direction; **narrowly supersede the prior `TODAY-UI05` defer for a verified, route-only Phase 1 launcher**, subject to the **existing** sole `NEXT_ACTIONS.md` task-selection precedence. Do not self-activate ten domains, new data capture, advanced voice/AI, personal-health egress, app release or production deployment. This is a durable source/implementation contract, **not** a claim that Quick Log is shipped.

## 1. Consumer promise and decisive architecture

Quick Log is the **one low-friction entry into existing canonical domain capture**, not a new multi-domain health journal, storage ledger, schema of biological truth, nutrient calculator, training engine or recommendation engine. Place **one clearly discoverable yet subordinate** trigger on Today (consistent with Today = Act and the existing one-primary-next-step UX); **mobile compact bottom sheet / desktop modest dialog or popover**. The launcher has approximately **four or five initial actions**, with the rest behind “More”/progressive disclosure. Everyday initial order preference: **Food, Supplements, Movement, Hydration, Symptoms**; Athlete: **Workout, Nutrition, Hydration, Supplements, Recovery**, but **display only verified actually eligible actions** and fill unused slots with genuinely supported alternatives—never dead or misleading buttons. User customization, habit adaptation, and saved favorites are subsequent phases; repeated usage may adjust ordering later, without unstable interface reshuffling or off-account history.

**Open supported canonical editor, preserve draft, route back safely, cancel with zero writes, then confirm actual event using the existing domain's source-aware authorization, validation, idempotent persistence, correction and account-isolation mechanics.** Do not bypass editor-specific eligibility gates or hide relevant consent/clinical messages. Only after existing canonical save receipt can Today and eligible dependent read models refresh; a saved source event, a pending derivative interpretation and a failed downstream calculation are **distinct statuses**. History, scheduled routines, favourites, recommendations, planned meals, workout starts and reminders never automatically count as consumption, completed exercise or other recorded events.

## 2. Scope and actual-branch code references

**Inspected `enhance/bloom-experience` source**:
- `client/src/pages/Dashboard.tsx` Today mounts `TodayFocus`, `TodayFoodSummary`, `TodayStatus` and food journal; `TodayFocus.tsx` owns the source-eligible hero. The Quick Log entry must **not** replace the primary next-step CTA or create another large marketing/analytics card.
- `client/src/App.tsx` declares actual protected routes `/log-meal`, `/activity`, `/nutrition`, `/precision`, `/microbiome`, `/upload`, `/weekly-review`, `/profile`, `/plan-day`, and `/athlete` sections. **A route's existence does not establish that it contains an eligible editor for every health domain**, and `/microbiome` may be primarily reading. Codex must inspect actual mounted component, user/feature guard and permission, form, save and return path *before* labeling an action active.
- Today specialist [original reconciled handoff](../agent-handoffs/BLOOM_TODAY_UI01_07_UX_BRAND_ARCHITECT_RECONCILIATION_20261126.md) marked `TODAY-UI05` conditional/deferred and had **no approved UI05 visual board**. This new specific owner instruction allows the **limited launcher-only** phase when selected; it does **not** approve the original proposed unbuilt multi-domain journal or a fabricated visual asset. Read original Today UX/Brand handoffs and [maintained Today Brand tokens](../agent-handoffs/BLOOM_TODAY_BRAND_UI_TOKEN_ASSET_HANDOFF_20261126.md), not just new markup.
- Food and recipes: [`BLOOM-NUT-RECIPE-20261127-R1`](BLOOM_NUT_RECIPE_20261127_R1_ARCHITECT_CODEX_RECONCILIATION.md) defines recipe version → verified consumed portion → **single canonical meal journal save with all included source-backed ingredients and nutrients**. Existing `/log-meal` and food methods must remain.
- Supplements: [`BLOOM-NUT-SUPPLEMENT-20261127-R1`](BLOOM_NUT_SUPPLEMENT_20261127_R1_ARCHITECT_CODEX_RECONCILIATION.md) preserves `shared/supplement-intake.ts` explicit `confirmedTaken:true`, actual product/label version, amounts and independent canonical records. The presence of supplement intake infrastructure does **not** prove a dedicated currently usable user-facing route or batch stack composer; inspect it.
- Movement/workouts: existing `/activity` and prior EMP-UI01–09 original architecture, `ActivityLog`, `TrainingSetsEditor` and `ActivityReview`; planning/starting ≠ completed activity and unreviewed 553 muscle associations cannot be inferred.
- Symptoms/pain: prior EMP UX and symptom domain persistence may be source-present but **localized severity / canonical person mapping / rights or read-only decisions remain gated**; a general link to unapproved symptom creation must not bypass that.
- Hydration, medication, sleep/check-in, measurement, digestive, bloodwork, microbiome and general observation: **availability unverified in this review**. Require actual owner-editable canonical form, source validation, relevant privacy and finished user journey, not merely an existing report/read page. A bloodwork upload or microbiome report manager can be offered only with accurate “Add report” language when supported, not “Log biomarker” or false new result.
  
### Per-domain eligibility ledger (Codex must fill from current HEAD before enabling UI)

| Requested action | Candidate current surface | Initial disposition |
|---|---|---|
| Food / meal | `/log-meal` | Candidate for Phase 1: inspect save, correct form and return path |
| Recipe / prepared meal | existing food / recipe planner flow | Conditional on real recipe-portion→journal implementation; no invented shortcut |
| Exercise / movement | `/activity` | Candidate for Phase 1: verify exact editable manual capture |
| Workout / saved routine | `/activity`, `/athlete` | Conditional on authorized actual session/builder route; started ≠ completed |
| Supplements | `/nutrition` or existing supplement UI; exact route pending | Candidate only if full existing confirmed taken editor is reachable |
| Water / hydration | Inspect actual active canonical water events and editor | **NOT_VERIFIED**; omit until eligible |
| Pain / symptoms | Existing localized symptom contract and supported editor | **GATED/NOT_VERIFIED**; don't bypass symptom semantics |
| Medications | Inspect medication source and explicit actual-taking editor | **NOT_VERIFIED**; medication list ≠ taken event |
| Sleep / recovery | Checkin and `/weekly-review` | Conditional on actual editable sleep/checkin capture (not review alone) |
| Body measurements | Existing measurements source and editor | **NOT_VERIFIED** |
| Digestive observations | Existing GI/checkin source and approved editor | **NOT_VERIFIED** |
| Bloodwork | `/precision`, `/biology/reports`, `/upload` | Only clearly labelled supported add/upload/correct flow |
| Microbiome | `/microbiome`, `/upload` | Only supported report upload/add; do not imply fabricated microbiome entry |
| General health observations | Inspect actual source-backed checkin/editor | **NOT_VERIFIED** |

**Phase 1 trigger should show an honest 4–5 action layout only if that many canonical routes are truly valid; otherwise use fewer without inventing functionality**. Accessible More list may contain only supported routes, or clearly disabled “Coming later” labels *outside the active actions* only when useful; no decorative dead shortcuts.

## 3. QL-01..10 implementation strategy (not separate task queue)

| ID | Scope and sequencing |
|---|---|
| **QL-01** | One exact HEAD domain inventory of real forms, required authorization, save semantics, draft/return behavior; report enabled/disabled + proof |
| **QL-02** | Today persistent compact launcher respecting one primary action, safe area and four themes |
| **QL-03** | Route to original editor and restore Today/draft/back navigation; URL return marker validated for same-origin authorized route only |
| **QL-04** | Canonical save receipt, idempotent retry and scoped cache invalidation; no new journal writer |
| **QL-05** | Confirmed-use, actor-local recent/recurring templates (food, recipe portions, sessions, symptoms, hydration) only where actual route/editor supports them |
| **QL-06** | User-configurable primary actions, safe stable default, preferences under existing account and revision rules |
| **QL-07** | Reuse domain editors in compact sheets only where form reusability and confirmation are independently proven |
| **QL-08** | Recipe/workout/supplement stack routine integrations with separate actual confirmation |
| **QL-09** | Future optional text/voice multi-event parsing into **separate** reviewable draft records, individually confirmed/saved with partial failure handling, not merged event table |
| **QL-10** | Accessibility/security/privacy/responsiveness, corrected/draft/account isolation and no-regression proof |

**Phase 1** may be implemented when selected on the current canonical queue: **QL-01 (bounded route audit) + QL-02/03 (working launcher over confirmed canonical routes)**. It must provide actual navigation and cancellation without writes; don't hold it pending recipe library, full pantry, supplement comparison or clinical biology. **Phase 2** stable personal shortcuts and safe reusable compact editors, plus optional batch routine confirmation once actually supported. **Phase 3** opt-in natural language/voice parsing, no mandatory AI. Do not make unrelated advanced claims a prerequisite for honest quick entry.

## 4. Acceptance and actual-source proof

| ID | Acceptance |
|---|---|
| **QL-T01** | Every enabled action points to an authenticated, presently usable, permission-approved existing canonical capture editor; unsupported actions are hidden/inactive and not mislabelled |
| **QL-T02** | Opening launcher, browsing, cancelling, Escape/backdrop and returning to Today create **zero** source events; no accidental writes from prefilled templates |
| **QL-T03** | Explicit save creates the same canonical domain event as direct entry; reused original validation, privacy/encryption, source-revision and corrections |
| **QL-T04** | Retry or repeated confirm does not duplicate events; partial post-save read-model failure is distinguishable from failed persistence |
| **QL-T05** | Recents, stacks, workouts, scheduled events and recipes remain templates until user-reviewed quantities, timestamps and domain-specific confirmation |
| **QL-T06** | Actor/account switch discards prior private draft, recent templates and stale network result; no cross-account cache or saved event leakage |
| **QL-T07** | Everyday and Athlete show 4–5 **supported** priorities or fewer honestly, stable ordering, no surprise rearrangement; customization is separate QL-06 phase |
| **QL-T08** | Food/recipe, workout and multi-supplement confirmation each invoke canonical domain save and preserve per-ingredient/set/label snapshots when eligible |
| **QL-T09** | Typed/dictated future multi-event drafts cannot write without independent review, can handle partial failure, and work is explicitly gated/AI-optional |
| **QL-T10** | Actual mobile **390×844** bottom sheet and desktop **1440×900** popover/modal with closed/open/route-return states plus 320/768, 200% reflow, four mode/theme combos, focus restoration, 44px targets, Escape/backdrop, reduced motion and screen-reader semantics |
| **QL-T11** | No independent Quick Log storage, nutrient, activity or biological inference engine; source corrections and consent are authoritative |
| **QL-T12** | Cancelled/stale/partial/failed downstream processing never appears as completed underlying intake or activity; read-model refresh uses existing account-scoped invalidation |

**Delivery proof:** on actual same-HEAD build, capture original Today (primary CTA still visible), mobile/desktop launcher open, supported editor open, return/back/cancel, loading/error/disabled cases and focus; inspect screenshots and run real editor tests. Report `PASS / FAIL / NOT_TESTED / NOT_APPLICABLE` per applicable QL-T. No exact live UI screenshot or user testing was provided in the owner proposal. Do not claim full release or end-to-end capture from route links alone.

## 5. Source/architecture precedence, owner approval and holds

The previous `TODAY-UI05` design status was **DEFERRED**; new dated owner amendment explicitly **reconsiders limited Phase 1**. Architectural decision: **approve the subset as eligible product scope, not immediate execution priority or general activation**. The old status stays historical. **No UI05 original approved visual board exists in the November 26 Today ZIP**; use original UX+Brand token specs and real renders for sheet design rather than claim pixel-approval. The Today ZIP and prior three UI/UX ZIPs remain subject to [four-package original source inventory and per-ID QA](../agent-handoffs/BLOOM_20261126_FOUR_PACKAGE_UI_UX_CODEX_INVENTORY_AND_COVERAGE.md); this amendment does **not** erase earlier UI approvals or require reopening finished unrelated work.

Keep one app queue, bounded source tests and working code, avoid a paperwork-only loop. Work on authorized nonshipping branch/local isolated environment with synthetic test records only. **No Render before December**, no `main` merge, production DB, provider cost, private-health external transfer, unreviewed clinical prediction, nonapproved pain/recovery write or protected Mac/Tailscale/network changes without appropriate clearance. This new scope is not approval of unrelated medical assertions, independent scientific review or deployment.
