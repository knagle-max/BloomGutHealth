# Bloom — Independent User Review Agent Handoff: First-Time Onboarding

**Date:** 2026-11-21  
**Review ID:** UT-ONB-2026-001  
**Priority:** P1 — foundational consumer UX  
**Status:** Approved UX direction; proposed implementation, not independently tested or deployed  
**Owner:** Independent User Review Agent  
**Routing:** Chief Architect / Codex Developer / Branding & UX / Biology / Security

## Explicit owner-requested workflow

**Account creation → one-time Goals → About you → Health context → personalized Bloom dashboard → normal ongoing application.**

This exact three-step, post-signup onboarding workflow is a product requirement, not just a sketch. Replace the *default food-first introduction*, but **do not remove, bury, or break food logging**. It appears once per account, may resume if interrupted, and must not be forced on existing accounts. All collected data remains editable from the canonical Profile/Settings screens. New capabilities do not retrigger setup.

This is the *approved flow/interaction intent*, not authorization to copy ChatGPT's visual styling. Use Bloom's established brand and responsive design contracts. User-supplied visual reference screenshots were labeled IMG_2735.jpeg (Goals), IMG_2736.png (About you), IMG_2737.png (Health context) in the originating handoff; the textual specification below is authoritative even when those chat-uploaded screenshots are not present in a repository checkout.

## Step 1 of 3 — Goals

**Title:** “What would you like to improve?”  
**Supporting copy:** “Bloom uses your goals to decide which insights matter most to you. You can change them anytime.”

Show six large selectable goal cards in a responsive grid (two columns when width permits):

1. Gut health
2. Longevity
3. General health
4. Metabolic health
5. Weight management
6. Athletic performance

Require one **primary** selection; permit secondary selections later in Profile (or during this step only if complexity remains low). Clearly signal selection with a distinct border/check. **Continue** advances to About you. The selected goal changes insight *priority and communication*, **not** the biological systems analyzed, data retained, or features enabled. Navigation back/forward preserves entered values.

## Step 2 of 3 — About you

**Title:** “A little about you”  
**Supporting copy:** “This helps Bloom interpret relevant health information more accurately.”

Collect birth year or date of birth (with validity and age/privacy treatment); sex relevant to laboratory reference ranges (including skip/unknown, without conflating with gender identity); optional height, current weight, and typical activity level. Support preferred units; show clear labels and compact helpful descriptions. Do not assume a sex-specific reference interval works for all assays; defer or ask extra test-specific context where necessary.

**Screenshot correction:** The concept showed the *text* “Height and weight (optional)” but **no actual inputs**. Production must have usable entry controls or an explicit documented decision to defer them; activity level was also absent from that picture and should be supplied in this step without turning it into a long form. Missing/unknown does not mean negative, normal, or zero. **Back** retains goal; **Continue** advances to Health context.

## Step 3 of 3 — Health context

**Title:** “Anything Bloom should consider?”  
**Supporting copy:** “Add medical conditions, medications, dietary restrictions or other important information. Everything here is optional.”

Show four **collapsed optional sections**, each with a real interactive entry mechanism, not an inert plus icon:

1. **Medical conditions:** known conditions; distinguish self-report/confirmed where material.
2. **Medications and supplements:** may be grouped visually; preserve correct separate canonical data and dose/time where useful.
3. **Food allergies and intolerances:** distinguish allergy from intolerance; missing answer is not assurance of safety.
4. **Dietary preferences:** exclusions, restrictions and preferences.

Relevant pregnancy/clinical safety context may be requested when appropriate, not indiscriminately. Support meaningful distinctions: **none confirmed**, **unknown/not sure**, **not provided/skipped**. The model rule “unknown and not provided differ from confirmed none” should not be displayed as awkward technical text; use consumer-friendly microcopy. Avoid overwhelming the user with a required medical questionnaire.

**Back** retains inputs. Final CTA **“Finish setup”** or **“Go to Bloom”** saves the onboarding completion state and enters the main app. The screenshot's demo-only label “Explore post-onboarding experience” must NOT ship.

## First dashboard after completion

Enter normal Bloom navigation immediately—**no fourth required stage and no forced import** of labs, genetics, or microbiome data. The dashboard must remain understandable with **no imported data or saved meals**: reflect the selected goal and present one meaningful next action. Give easy access to **Log food**, **Import bloodwork**, and **Add other relevant health information**. Other optional imports can be introduced contextually. Never fabricate a personal health score, gut state, microbial concentration, causal effect, or clinical recommendation to populate an empty state. Preserve fast, normal food entry.

## State, data and consent

- Check current implementation before architecture changes. Original proposal refers to onboarding state in `shared/experience.ts`; extend the existing canonical state if current, **do not create a parallel onboarding state machine**.
- Account-scoped completion state concept: `status: "not-started" | "in-progress" | "complete"; version: number; completedAt: string | null`. The exact schema is subject to Developer verification/migration review.
- Save per-step progress; resume safely on interruption; avoid duplicate medical/profile rows from retries.
- Existing accounts must not be redirected to first-time onboarding. Future wizard versions do not force a re-run.
- Write to canonical goals, demographics, preferences, medication, conditions and relevant context records; propagate changes and invalidate/re-evaluate materially affected science insights.
- Unknown vs not provided vs explicit none must survive storage, retrieval, and recommendation logic.
- Required health-data and AI-processing consent must be explicit and distinct from the “Finish setup” action. Respect refusal and explain any feature limitation. Security owns retention/access controls.
- Avoid premature or unsupported person-specific biological claims. Biology owns evidence and interpretation review.
- Settings/Profile must support edits to all onboarding answers after completion.

## Independent user review findings

- **UT-ONB-101 (P1) Medical-context overload:** optional collapsed sections, searchable/chip-style or concise entry, ability to skip entire step.
- **UT-ONB-102 (P1) Empty dashboard:** first useful goal-aware action; zero-data state must not appear broken or invented.
- **UT-ONB-103 (P1) Trust and consent:** clear purpose and privacy; explicit separate permissions.
- **UT-ONB-104 (P2) Time promise:** do not promise 2–3 minutes without user testing; optimize short basic setup.
- **UT-ONB-105 (P2) Biological-context precision:** clear units/optional values and assay-dependent reference-interval handling.
- **UT-ONB-106 (P2) Return/missing-context:** no repeated wizard; contextual, nonintrusive questions only when a requested action depends on absent/outdated information.

## Required acceptance scenarios

| Scenario | Expected outcome |
| --- | --- |
| New user completes Goals | Main goal is saved and later changes dashboard emphasis |
| New user skips optional health information | Reaches regular dashboard with no false “none” records |
| User navigates Back/Continue | Inputs remain intact |
| User closes mid-wizard and returns | Resumes saved stage without data loss |
| Existing user signs in | No forced re-onboarding |
| User changes goals/medications in Profile | Canonical state updates; materially affected interpretations refreshed or invalidated |
| No imported data or meals | Clear useful empty-state action; no fabricated scores |
| Explicit “none” vs unanswered | Distinct in persistence and consumer logic |
| Consent declined | No unauthorized health-data/AI processing; truthful limitation |
| Narrow mobile viewport, larger desktop | Accessible layout, legible controls, no overflow; focus/keyboard/screen-reader paths |
| Completion | Clear final button, completion persisted once, dashboard opens; normal food/log/profile navigation available |

Review must include actual mobile and desktop UX, interactive section inputs, errors and screen-reader semantics. Automated tests alone do not establish UX acceptance.

## Ownership and delivery

This is **independent UX guidance**, not verified code and not a declaration of readiness. Chief Architect reconciles the requirements with the current experience/design and product directive; Codex owns implementation, tests and source updates; Branding & UX owns final visual treatment; Biology reviews scientific-context implications; Security reviews privacy and consent. Respect the repository's latest `PROJECT_COORDINATION.md` supersession and `NEXT_ACTIONS.md` active sequencing. Distinguish implemented, tested, deployed, and independently accepted.

**Do not implement screenshot demo placeholders as functioning production controls.** The order and capabilities of the three steps, and the landing on the normal dashboard, are explicit requirements.
