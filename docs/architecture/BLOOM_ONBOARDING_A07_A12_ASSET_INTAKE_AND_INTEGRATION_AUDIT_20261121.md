# Bloom — ONB-A07–A12 Original Asset Intake and Onboarding Integration Audit
**Chief Architect · 2026-11-21 · reviewed design sources, NOT production approval**

## 0. Authority, scope and approval

Read `AGENTS.md` → `NEXT_ACTIONS.md`. This handoff is a **bounded existing P3 consumer onboarding acceptance task**, not a new priority, implementation order, separate wizard framework or authorization to interrupt P1/P2 scientific work. Earlier P0 work is permitted only for evidenced consent, security, data-loss or source-integrity defects. Current owner Render/Mac pause, cloud health-data restrictions and no-routine-screenshot directive remain binding.

Eight uploaded owner-design ZIPs were directly inspected: original README, manifest and prototype files (HTML/CSS/JS), WebP/SVG/PNG imagery, and a visual contact sheet. The ZIPs were available in the architect conversation, **not independently verified in Codex's checkout or repository**. Codex must retrieve exact original bytes by an authorized transfer and SHA-verify them; if unavailable, record an asset transfer blocker and continue other approved work. Do not regenerate already designed art.

| Package | Source and purpose | Current design status |
| --- | --- | --- |
| ONB-A07 Goal Cards | Interactive six-goal radio/card specimen, six approved 768px WebP photos | **Design review v0.1**, visuals available; not implemented |
| ONB-A08 Progress Navigation | Exactly Goals → About you → Health context, Save & Exit, Back, skip, fail/retry, resume states | **Design review** interactions; simulated persistence only |
| ONB-A09a Medical Conditions | Exact SVG and PNG previews | Earlier individual **design candidate**; superseded for icon approval by newer A09 family |
| ONB-A09b Medications & Supplements | Exact SVG and PNG previews | Earlier candidate; icon approved in newer A09 family |
| ONB-A09 Four Approved Icons | Conditions, medications/supplements, food allergy/intolerance, dietary preferences; four `currentColor` original SVGs | **Owner-approved icon artwork** only; theme/DOM acceptance pending |
| ONB-A09d Dietary Preferences | Exact SVG and PNG previews | Earlier candidate; icon approved in newer A09 family |
| ONB-A10 Expandable Forms | Four expandable Health Context form sections with native inputs; distinguishing none, not sure and skip; demo consent | **Design review**, not a backend/privacy control |
| ONB-A12 Responsive Compositions | Assembled four-theme screens (Goals, About you, Health context, zero-data dashboard), six A07 WebPs and four A09 SVGs | **Latest assembled visual reference; DESIGN_REVIEW**, no server persistence or actual consent |

**Source asset duplication:** A12 includes the exact same six goal WebPs and four original SVGs as the prior packages. All fourteen entries in A12's manifest passed SHA-256 checks; the A08, A10 and four-icon-family manifest checks also matched. Preview PNG sheets and 24/32/96 PNGs are review artifacts, **not additional runtime icons**. Import only one copy of each original asset.

### Exact approved asset hashes (SHA-256)

**Six original WebP images**
- `ONB-A01-gut-health-768.webp`: `b1c182f5a3960f0d67c5742025cd94c73a7f087a8978520ef0181f8811dcc9df`
- `ONB-A02-longevity-768.webp`: `dca16c5bac876fe86ccc25afadd84df892552dc6aee14ac`
- `ONB-A03-general-health-768.webp`: `d2a1190ae7ec0f08d11e8e7196bd5596b42128c96afa21846cd25a377f93189f`
- `ONB-A04-metabolic-health-768.webp`: `5369dcb31a0b762ca2b5b817b1f557bf5d92366c5ef8261d892552dc6aee14ac`
- `ONB-A05-weight-management-768.webp`: `f24fcaa39dc46139aaa8fcff2bec684f613c61c026c765eef9eb94a4561e969f`
- `ONB-A06-athletic-performance-768.webp`: `e8f655b2025c0453fef8541ec1e90e25846044671dfb12bbebf6c8e101e914a8`

**Four original SVG icons**
- `onb-context-conditions.svg`: `d289661d40aa0df1167d6929c5426bdb56341ffb2efd58863172c97182b0f6b4`
- `onb-context-medications-supplements.svg`: `7d6c5f9ccc4abcafa38f43f08722c36f7298a1cefd42955edcb0ad90f172449a`
- `onb-context-food-allergies-intolerances.svg`: `064b7deea4f4880058984b1c4cc171aa0179926771d5dc35a20470478d6fabb6`
- `onb-context-dietary-preferences.svg`: `4072956faace9663d557dbc33db1f99f331d6040195f9b03a19e2c4b24cc3ab1`

## 1. Verified existing canonical application points

- `client/src/components/EverydayStart.tsx`: existing optional single-screen “Build your first food snapshot,” goal selection and food-exclusion checkboxes; existing `PUT /api/preferences` revision handling; `useExperience().patchAsync({onboarding:{status:'complete'}})`, optional skip and `/log-meal` continuation. **Do not build a second independent first-run flow.**
- `shared/experience.ts`: account-scoped `onboarding.status: not-started|skipped|complete`, existing units, activity, check-in and meal-template contracts. This status is **not** a proven step-by-step resumable draft or sensitive-processing consent.
- `shared/precision-nutrition.ts` `contextSchema`, `client/src/pages/PrecisionNutrition.tsx` and `server/precision-routes.ts`: existing private `conditions`, `medications`, `allergies`, `intolerances` fields and current context API. Reuse and extend only where necessary. Actual taken supplements remain distinct from planned/reported medication/supplement names.
- The active [medical-condition checkbox and proactive reviewed science handoff](BLOOM_PROACTIVE_SCIENCE_INSIGHTS_AND_CONDITION_SELECTION_HANDOFF_20261121.md) requires a grouped searchable, editable condition catalogue with custom/legacy values, MASLD/NAFLD and low testosterone/hypogonadism, user-asserted diagnosis/status and unknown vs none. **Do not replace this with the A10/A12 free-text demo or a second medical store.**
- The active [consumer acceptance and anti-overbuild handoff](BLOOM_CONSUMER_EXPERIENCE_ACCEPTANCE_AND_FOUR_CONTRACT_INTEGRATION_HANDOFF_20261121.md) remains authoritative for honest sparse-data value, P3 priority and `REUSE/CHANGE/DEFER` decisions.

## 2. Integration contradictions to address before coding

1. **A08 Save & Exit/resume vs assembled A12:** A08 explicitly demonstrates save failure, retry and resumed indicator; A12's composition does not carry every interaction. Use A12 as visual reference but preserve the separately specified actual safe draft/back/skip/resume contract. Never pretend client-only JS persisted private data. Narrow authenticated storage only if current code cannot support this and the requirement is approved.
2. **A10 none/not sure/skip vs assembled A12:** A10 has explicit per-category none/not sure/skip; A12 simplifies the display. Preserve their **data semantics** even when using a cleaner, progressively disclosed UI. Unentered ≠ unknown ≠ explicitly none ≠ deliberately skipped; absent symptoms/conditions/allergies cannot be assumed.
3. **Six approved goal names vs current goal choices:** A07/A12: Gut health, Longevity, General health, Metabolic health, Weight management, Athletic performance. Current `EverydayStart`: Balanced nutrition, Build muscle, Digestive comfort, Cardiovascular health. Reuse existing canonical preferences; map stable IDs/aliases backward-compatibly, preserve legacy/user custom/multiple goals, do not create six program engines or let a goal selection unlock a scientific feature. A single **primary** new goal influences prioritization only.
4. **Primary goal required vs optional setup:** Continue on Goals may require one selection but **Skip setup remains available**. Step 2 and all Health Context sections are optional. Existing accounts do not get force-re-onboarded.
5. **Mock consent vs real consent:** A10 and A12 demo checkbox has no real privacy/legal authority. Independent scope-specific, revocable permission must remain separate from Finish/Skip; no implicit consent to AI, genetic/medical data processing or external providers.
6. **Medical conditions vs preference data:** Do not conflate “gluten-free preference” and allergy, an entered medication and clinician-approved change, or planned supplement and confirmed taken dose. Keep existing source/revision and account ownership.
7. **About-you data precision:** Birth year, sex relevant to lab ranges, height/weight, activity level, unit switch are optional in A12. Wire only to compatible existing canonical stores after actual schema inspection; unknown/prefer not to say ≠ absent, and changing display units must not mutate source measurements.
8. **Dashboard destination:** Exactly three onboarding steps, then navigation to existing authorized home/dashboard. A12's “first-use dashboard” is a composition reference, not Step 4 or a new app dashboard. Preserve working Log Food navigation and only expose functional authorized Import Bloodwork / Add Health Info / Explore Biology routes.
9. **Accessibility and asset fidelity:** Original six WebPs/four SVGs without image regeneration, text-labelled decorative icons (`aria-hidden`), native radio/fieldset, focused/back/resume, mobile 320/390/768/1440, four theme palettes, 200% zoom, reduced motion and forced colors. Verification is not achieved by opening prototypes or by code compilation alone.

## 2A. Owner clarification — original three-screen interaction intent (2026-11-21)

The owner has additionally supplied screenshots of the **original onboarding concept**. They establish intent, not a newly approved asset package or production-ready implementation. **Interpretation hierarchy:** original screenshots = three-step user-journey intent; ONB-A12 = newer responsive visual composition; ONB-A07 six WebPs and approved ONB-A09 four SVGs = artwork to reuse; ONB-A08 = navigation/save/resume behaviour; ONB-A10 = expandable-context/none-versus-unknown semantics; existing canonical records and active condition-checkbox handoff = functional and privacy authority. Do not reproduce screenshot typography/black prototype chrome in place of the established Bloom design system.

- **Goals:** initial question “What would you like to improve?”; six approved goal categories, choose **one primary** focus to guide relevance, with additional goals editable later. The choice is not a diagnosis or licence to build six specialized programmes. Retain a real Skip setup path.
- **About you:** short “A little about you” step, with birth year and sex relevant to reference ranges **optional / selectable as unknown**, height/weight optional and complete-able later. Reuse existing Profile/units rather than forcing fields or inventing facts. Do not imply such inputs prove a lab reference range is applicable without separate review.
- **Health context:** “Anything Bloom should consider?”; the four **collapsible** categories medical conditions, medications and supplements, food allergies and intolerances, dietary preferences. Entire step optional, distinguish unanswered/unknown/none, reuse the reviewed medical-condition checkbox selection semantics and current private account controls.
- **Finish and first value:** after exactly three steps, navigate to the user's **existing Bloom home/main navigation** with independent working entry points to log food, review/import bloodwork where authorized, add context, or explore biology. **Do not force food logging as a prerequisite to bloodwork, context entry or general exploration.** Do not add a fourth onboarding step or duplicate dashboard. A standalone feature such as experimental diet estimates may truthfully retain its own actual-data prerequisite.
- **Resume/correction:** Back, Skip, and A08's Save & Exit/resume expectations must fit current account-scoped persistence. No duplicate wizard state or auto-consent. Edits propagate through canonical Profile/preferences/precision context without copying medical records.
- **Assets and acceptance:** already designed original images/icons should be imported exactly once when authorized and byte-available; the screenshots are not replacement art and do not override source hashes. No new visuals or full UI-redesign track from this clarification.

**Acceptance example:** A first-time user who only wants bloodwork may skip Goals/About you/Health context and reach the actual bloodwork workflow without first recording food. A user who chooses Gut health as primary goal may complete optional details and see that choice retained/adjustable through existing canonical preferences. Both paths preserve current authorization, error handling and source revisions.

## 3. Minimal Codex implementation steps (existing P3 queue)

- **Intake:** inspect current HEAD and whether exact original assets have already been imported. If unavailable to Codex, report `ASSET_TRANSFER_BLOCKED`, do not substitute lookalikes, continue other eligible work.
- **Map:** report concise `REUSE/NO CHANGE`, `NARROW CHANGE`, `DEFER/BLOCKED` for existing `EverydayStart`, preference revision writes, onboarding settings, health context, conditions selector, units, consent and navigation.
- **Integrate only when eligible:** one first-run routed flow, not duplicate onboarding. Three designed steps with actual skip/back/continue/error/resume states, authentic canonical saves, six exact goal visuals and four icon SVGs; condition forms share the authorized selector. Never auto-fill unknown context.
- **Verify targeted checks:** existing-user bypass; first-run skip/finish/resume; six goals and legacy mapping; Save & Exit failure/retry/idempotency; none/unknown/skip; meds vs supplements; allergy vs intolerance; source revisions and account isolation; consent not implied; keyboard/accessibility/theme/responsive layouts; zero-data first value. Do not build broad new test frameworks or mandatory screenshot baselines.
- **Stop:** once small scoped implementation and regression tests pass, return to `NEXT_ACTIONS.md` highest-value eligible P1/P2/P3 task. Design packages are **not** independent epics and do not justify new scores, conditions-treatment rules or health notification systems.

## 4. Disposition and status

- **APPROVED ARTWORK FOR REUSE:** six previously approved goal WebPs, four owner-approved A09 source SVGs. Optical fit, actual runtime accessibility and responsive QA remain to be verified.
- **IMPLEMENTATION DESIGN INPUT (review stage):** A07 goal cards, A08 three-step navigation/resume, A10 expandable forms, A12 assembled four-theme compositions. A12's latest appearance does not override missing A08/A10 semantics.
- **NOT VERIFIED:** that original assets exist in Codex's live checkout, integrated actual UI, durable resume/save, actual sensitive consent, cross-account tests, screen reader/real-device QA, owner final integrated visual signoff.
- **DEFER:** regenerated art, second wizard/health-profile backend, goal-specific programme engines, new symptom/medication tracking stacks, new on-device integrations, a new dashboard, broad visual refresh and P1/P2 science displacement.

**Acceptance:** A new user can choose or skip a goal, enter only desired context, save/return without losing confirmed facts or fabricating negatives, reach the existing useful dashboard/logging route, and later edit all health context at its true canonical source. No prototype checkbox grants consent and no goal constitutes a diagnosis or scientific conclusion.
