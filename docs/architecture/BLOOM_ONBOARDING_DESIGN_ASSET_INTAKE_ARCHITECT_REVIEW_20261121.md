# Bloom — ONB-A07/A08/A09/A10/A12 Onboarding Design & Asset Intake Review
**Chief Architect review · 2026-11-21 · Design source assessment, NOT code/approval receipt**

## 1. Inputs reviewed and disposition

Reviewed eight owner-provided ZIP packages at the source-file level (READMEs, manifests, contracts, HTML/CSS/JS prototypes, SVG/WebP/PNG files) and inspected the compiled image review sheet. **Assets are already authored: do not recreate, redraw, re-prompt or replace them.** Compare current source HEAD before any implementation. These ZIPs were attached to the owner conversation, **not verified as committed to the repository**; Codex must obtain the exact original ZIP bytes from the owner's authorized shared-file channel or an owner-approved transfer before claiming asset integration. Do not assume a conversation-local path exists in Codex's cloud workspace.

| Package | Contents / authoritative role | Status and action |
|---|---|---|
| ONB-A07 Goal Cards Review | Six finished 768px WebP goal photographs, interactive goal-card HTML with radio selection/keyboard/focus/error/responsive specimen | **Design review v0.1**; reuse images, verify selection UX; runtime integration not proven |
| ONB-A08 Progress Navigation Review | Three-step Goals → About you → Health context, Back/Continue/Save & Exit/resume/error prototype; `contract.json` | **Design review v0.1**; use interaction semantics; persistence must use existing account ownership |
| ONB-A09a Medical Conditions Review | Editable `onb-context-conditions.svg` and four-theme/size PNG review aids | Original individual candidate README says DESIGN REVIEW; **later A09 four-icon family explicitly owner-approved** |
| ONB-A09b Medications & Supplements Review | Editable SVG; medication/supplement source distinction | Original individual DESIGN REVIEW; later **four-icon family approved** |
| ONB-A09 Four Approved Icons 2026-11-21 | Four approved, matched `currentColor` SVGs (conditions, meds/supplements, food allergy/intolerance, dietary preferences) + PNG sheets | **Authoritative newer approval for four SVG visuals only**, pending app integration/theme/assistive-tech testing |
| ONB-A09d Dietary Preferences Review | Editable SVG, PNG sizes/themes and review sheet | Original DESIGN REVIEW; later four-icon family approved |
| ONB-A10 Expandable Forms Review | Four native expandable Health Context sections with distinct medication/supplement, allergy/intolerance, none/not sure/skip and consent **demo** states | Design review; use semantics/interaction patterns, **not** working persistence or permission |
| ONB-A12 Responsive Compositions Review 2026-11-21 | Combined Goals, About you, Health context, *first-use dashboard* compositions, all six goal WebPs and four SVGs, responsive/theme CSS and client-only JS | **Latest assembled visual reference**, still DESIGN_REVIEW and NOT_DEPLOYED. Its appearance does not supersede A08/A10 omitted safety/persistence semantics |

File integrity: the ZIP manifests inspected for A08/A09 family/A10/A12 were matched against included file SHA-256 digests (A12: fourteen files). A12's originals are ready to transport as a coherent source package **when a supported path to Codex is established**. Avoid importing duplicate PNG sheets or 24/32/96 previews as production icons; the four SVGs are runtime sources. Goal photos use six owner-provided WebPs. Do not request another image generation cycle.

**Exact A12 source-asset hashes** (SHA-256):
- `ONB-A01-gut-health-768.webp`: `b1c182f5a3960f0d67c5742025cd94c73a7f087a8978520ef0181f8811dcc9df`
- `ONB-A02-longevity-768.webp`: `dca16c5bac876fe86ccc25afadd84df892552dc6aee14ac`
- `ONB-A03-general-health-768.webp`: `d2a1190ae7ec0f08d11e8e7196bd5596b42128c96afa21846cd25a377f93189f`
- `ONB-A04-metabolic-health-768.webp`: `5369dcb31a0b762ca2b5b817b1f557bf5d92366c5ef8261d892552dc6aee14ac`
- `ONB-A05-weight-management-768.webp`: `f24fcaa39dc46139aaa8fcff2bec684f613c61c026c765eef9eb94a4561e969f`
- `ONB-A06-athletic-performance-768.webp`: `e8f655b2025c0453fef8541ec1e90e25846044671dfb12bbebf6c8e101e914a8`
- `onb-context-conditions.svg`: `d289661d40aa0df1167d6929c5426bdb56341ffb2efd58863172c97182b0f6b4`
- `onb-context-medications-supplements.svg`: `7d6c5f9ccc4abcafa38f43f08722c36f7298a1cefd42955edcb0ad90f172449a`
- `onb-context-food-allergies-intolerances.svg`: `064b7deea4f4880058984b1c4cc171aa0179926771d5dc35a20470478d6fabb6`
- `onb-context-dietary-preferences.svg`: `4072956faace9663d557dbc33db1f99f331d6040195f9b03a19e2c4b24cc3ab1`

## 2. Verified current-code reuse and specific integration gaps

Inspected branch `enhance/bloom-experience`:
- `client/src/components/EverydayStart.tsx`: existing optional one-screen “Build your first food snapshot” setup, saved goals/preference revision and exclusions, `useExperience().patchAsync({onboarding:{status:'complete'}})`, Skip setup state, then navigates `/log-meal`. It currently offers **Balanced nutrition / Build muscle / Digestive comfort / Cardiovascular health**, not the six A07 goal choices.
- `shared/experience.ts`: onboarding already has `not-started|skipped|complete` account settings; avoid creating independent wizard persistence or treating new status as consent. Also has activity/check-in/meal-template schemas.
- `shared/precision-nutrition.ts` `contextSchema`: `conditions`, `medications`, `allergies`, `intolerances` are canonical account-context fields, with current UI handling through `client/src/pages/PrecisionNutrition.tsx` and `server/precision-routes.ts` context API. Clinical qualifiers and medication-versus-supplement representation must be reconciled with source authority and the separately approved [conditions selector handoff](BLOOM_PROACTIVE_SCIENCE_INSIGHTS_AND_CONDITION_SELECTION_HANDOFF_20261121.md) rather than independently stored in onboarding.
- The [consumer acceptance handoff](BLOOM_CONSUMER_EXPERIENCE_ACCEPTANCE_AND_FOUR_CONTRACT_INTEGRATION_HANDOFF_20261121.md) already mandates sparse-data value and anti-overbuild; **this onboarding is one bounded P3 journey**, not a new app-wide design effort.

**No second profile database, preference system, medical-condition selector, consent engine, coach/athlete profile, health history store, or goal-recommendation engine.** Reuse current domain owners and source revisions.

## 3. Specific design seams to reconcile *before* writing a wizard

1. **A08 vs A12 Save & Exit:** A08 prototypes Save & Exit, resumed states, transient save failure and retry. A12 presents the assembled wizard but does not visually carry the complete Save & Exit/resume contract. **Use A12 for visual composition; preserve A08's user-flow semantics** only where actually feasible with current account-scoped settings and verified durable writes. Do not claim persistence because A08 JS simulates it.
2. **A10 vs A12 explicit absence states:** A10 distinguishes `Add my details`, `None to report`, `Not sure`, `Skip` for context categories. A12's compact compositions do not visibly retain all these explicit choices. **Preserve the semantic distinction in the real UI**, but don't add four conspicuous toggles to every collapsed card if they clutter the experience. Use progressive disclosure. Lack of entry ≠ confirmed absence.
3. **Goal taxonomy mismatch:** A07/A12 six visual goal labels differ from current `EverydayStart` stored values and other profile goals. Define a single stable mapping from the **six exact owner-provided goal labels** to existing canonical saved preferences/user goal IDs, preserving legacy custom and multiple goals. The visual prototype asks for **one primary goal** for initial prioritization, not permission to replace all existing goals or restrict features. **Do not silently overwrite or demote preexisting goals.**
4. **Skip and compulsory goal:** A07 requires one primary selected goal to Continue; A08 has optional Health Context Skip. Current EverydayStart has Skip Setup. **Keep a skip-able first-run path** consistent with product value without mandatory intake; within the user-chosen wizard route, require a goal only for Continue as designed. Existing accounts bypass the first-run wizard; no forced re-onboarding.
5. **A10 medications, supplements, allergies:** The design intentionally displays related fields together but the canonical sources are distinct. Verify whether the current context represents a reported supplement list versus actual confirmed doses; never convert a named supplement to taken. Preserve food allergy vs intolerance and unknown vs explicit none. No clinician direction inferred from user-entered medications.
6. **Medical conditions checkboxes:** The active condition-selector handoff calls for searchable grouped checkboxes, self-reported/suspected/past/clinician-diagnosed *as user assertions*, custom terms and legacy strings. A10/A12 simple text+chip demo is **not** a replacement or a competing store. Integrate the single reusable condition selector where eligible; no hardcoded static condition-to-treatment branching.
7. **About-you data:** Birth year, sex relevant to lab comparisons, body measurements, unit switching and activity level are optional in A12. Existing age/measurement/preference models may have different allowed values and dates; use only values that current canonical source and explicit consent genuinely support. Do not guess birth year, sex, activity or health status. Changing display units must not alter stored canonical measurement units.
8. **Consent is not a checkbox demo:** Both A10 and A12 explicitly mark consent examples nonfunctional. Onboarding completion/Skip cannot imply private-health processing or AI/provider consent. Reuse scope-specific, independently governed consent and account controls; data entry permission and external transfer are distinct.
9. **A12 dashboard destination:** A12 mock shows “Log food,” “Import bloodwork,” “Add health information,” “Explore Biology.” This is **a visual reference for the existing post-setup destination**, not permission to build a second dashboard or new navigation route. After finish/skip, use the existing authorized home/Today routes; import/explore links only if the destination truly works and is eligible.
10. **P0/P1/P2 interaction:** Do not use onboarding to invent health scores, clinical recommendations, personalized longevity claims or a P1-ready biological investigator. Source-backed context may be collected for future authorized private use; no automatic Gemini/private external transmission.

## 4. Recommended Codex implementation contract (single P3 increment)

**Prerequisites:** 1) confirm original ZIP available in Codex environment (use owner-provided original bytes, hashes; if unavailable, report a narrow asset-import blocker, continue other approved work); 2) inspect current branch endpoints/form validation/preferences and account version/consent; 3) inventory what is already implemented and tested, then choose the smallest safe integration.

**Priority order within this single increment (not a new queue):**
- **A. Asset import only once:** Bring A12's six WebPs and four SVGs, plus its editable `index.html`, `prototype.js`, `styles.css`, README and manifest as design reference into a single clearly scoped original-source folder, with SHA receipts. Preserve owner files unmodified; don't also import separately duplicated A09 PNG review sheets as shipped assets. Keep A07/A08/A10 contract/reference ZIPs or originals accessible for interaction fidelity. No inventing local asset paths not verified in Codex's workspace.
- **B. Minimal source integration:** Adapt `EverydayStart` or its existing routed entry to the three-step composition using existing preference/experience/precision context APIs. Maintain old user records, Back, Skip, Save & Exit (when safely supported), resume, retry and existing-account bypass. Prefer a small reusable card/form component over another global wizard framework. Keep `Goals → About you → Health context` in this order; dashboard is destination, **not a fourth required step**.
- **C. Reconcile approved forms:** Use native accessible selection and fieldset/legend; one primary goal only at initial guided choice; maintain six exact labels and legacy goal mapping; optional About you; four optional Health Context sections with truthful none/unknown/skip; reuse condition checkbox component, medication/food-safety source owners and real scope-specific consent. Ship only fields existing storage can truthfully preserve. If not yet supported, defer that field instead of creating a new medical database from the prototype.
- **D. Verify integrated user journey:** Run focused new-user/legacy-user/account switch/back/resume/failure/skip/form-correction tests, keyboard/accessibility, responsive practical breakpoints 320/390/768/1440 and four theme palettes where applicable. App browser QA when material; no mandatory before/after screenshots; explicit `NOT_TESTED` where not performed. Avoid a new generalized onboarding e2e platform.
- **E. Stop:** Once a bounded journey and nonnegotiable source/consent guards pass, return to `NEXT_ACTIONS.md` priority. Do not implement broad redesign, extra goal photos, unrelated health widgets, new notification campaigns or additional analysis merely because mocked in A12.

**Named acceptance checks (only as applicable to touched feature):**
- `ONB-01`: existing user bypass; first-run complete, skip and resume use existing account-scoped onboarding state.
- `ONB-02`: six approved visual goal assets exactly reused; one primary goal selection accessible; legacy goals preserved.
- `ONB-03`: selected preference revision conflict/save failure recovers without duplicate write or lost previous answer; Back retains draft.
- `ONB-04`: optional About you and Health Context neither block completion nor manufacture unknown facts.
- `ONB-05`: conditions persist through one canonical selector, support custom and explicit user-asserted status; legacy health context remains editable.
- `ONB-06`: medications separate from supplements, planned names distinct from confirmed taken, allergy vs intolerance distinct, none vs unknown vs skipped survive re-edit.
- `ONB-07`: consent separately scoped/revocable, no implied external-health permission, no private-data cross-account view.
- `ONB-08`: finish/skip navigates to existing authorized home with useful zero-data actions; no fabricated dashboard values or fourth wizard step.
- `ONB-09`: source file hashes, four-theme responsive, keyboard, screen reader/reduced motion and 200% zoom as actually tested (report `NOT_TESTED` where applicable).
- `ONB-10`: existing P1/P2 source-context and legacy meal/preferences/regression remain intact; no duplicate domain store, no unreviewed advice.

**Approval/implementation states:** Owner approval of the four A09 SVGs does not imply A07/A08/A10/A12 runtime visual acceptance. A07/A08/A10/A12 are design-review candidates with coherent intended direction. A12 is the latest assembled composition, **not production integration, permission, consent, or scientific review**. Codex may follow this approved *integration direction* with small proof-driven increments under the existing queue, but must not mark full onboarding accepted until runtime, accessibility, privacy and owner visual-design gates are met. Source ZIP asset transfer is a real dependency; do not request regenerating assets.

**Receipt:** exact ZIP source/version + SHA-256, original file path in repo, changed code, reused canonical record APIs, state/consent semantics, tests run/passed, browser/device states tested or NOT_TESTED, limitations and next eligible queue action.
