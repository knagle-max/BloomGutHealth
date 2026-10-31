# Everyday and athlete experiences

The header's **Experience mode** selector persists per account. Everyday remains the default. Athlete mode uses a blue palette (including a dark variant), a leaf/lightning Bloom Athlete mark, separate navigation, and a performance home screen. Switching back preserves both profiles and their records. The everyday planner is redirected to athlete fueling while athlete mode is active.

## Shared workflows

- Reuse reviewed journal meals with an explicit serving multiplier and eaten date/time. Nutrients are resolved again, including exact saved product servings.
- Explicit ingredient corrections are remembered privately only for the identical normalized description, including quantities. Changed amounts or descriptions get a fresh analysis. Corrections can be forgotten.
- Voice entry uses supported browser speech services and creates a reviewable transcript. Barcode image detection is browser-dependent; manual barcode search remains available.
- Meal photos create editable descriptions, not invented nutrient values. Label photos transcribe visible per-serving values and require review before saving a private label. Image requests require explicit consent and configured, funded AI with image support; Bloom does not retain the image. Provider failure leaves manual entry available. Browser speech services and the AI provider may process the submitted data under their own policies.
- `/plan-day` offers up to three distinct alternatives that fit the next eligible meal slot, known remaining limits, dietary restrictions, pantry preferences, preparation time and available equipment. No eligible choice is forced over a limit. Household size scales shopping, not individual intake. Budget and convenience are heuristics, not live pricing, inventory or restaurant-menu verification.
- Weekly check-ins and one-change routine experiments are separated by mode. Missing entries are not zeros; observed trends do not establish causation.

## Athlete workspace

`/athlete` records sport, discipline, level, training phase, body mass, reviewed targets and training sessions. Sessions can be scheduled, edited, completed or cancelled. Actual duration × reported RPE is a recorded load metric; missing RPE is reported separately. Overnight workload is clipped to the selected local day without changing the session's actual recovery time.

`/athlete/fueling` combines known journal intake, broad daily carbohydrate/protein starting targets, familiar before/during/after-session suggestions, product-label serving arithmetic, training-day meal alternatives and sweat-loss observations. Fueling notes do not add nutrition twice: only actual journal entries contribute intake. Individual energy targets are explicitly entered; wearable calories and an optimal energy requirement are not inferred. Athlete planning does not inherit everyday calorie/fiber/sodium caps.

Numerical targets require confirmed adult health context, reviewed targets and a body mass. Known under-18, pregnancy and selected high-risk clinical contexts require individual professional planning. Conflicting energy and macro targets are withheld for review. Higher carbohydrate ranges are not assumed tolerated without reported rehearsal, and reported low session gut comfort suppresses that assumption. Workload categories are simple duration heuristics, not validated performance predictions. Sweat sodium is shown only when a measured concentration and its source are supplied; estimated losses are not replacement prescriptions.

`/athlete/recovery` provides check-ins, comparisons with the preceding week, practical focus and personal routine experiments. It does not diagnose REDs or explain causality.

`/athlete/competition` stores familiar-food, travel/access and preparation checklists. Supplement purpose, exact batch, certification link, check date and reviewer are self-reported records. Repeated ingredient names can be flagged, but Bloom does not verify certification, interaction safety, total duplicate doses, prohibited-substance status or TUE eligibility. Official USADA and WADA resources are linked. The workspace has no IOC endorsement or prospective elite-athlete validation; professional use needs qualified support-team review.

## Persistence and deployment

Apply the additive `migrations/0004_experience.sql` after earlier migrations, or review the equivalent Drizzle schema change. `experience_settings` and `experience_records` use the retained `PRECISION_DATA_KEY` with account-bound AES-256-GCM. No new provider or production encryption secret is needed. Keep the existing key unchanged. All experience routes require authentication, owner-scoped access and no-store responses. Settings/records include export and explicit deletion controls; journal and biology data are separate.

Verification includes TypeScript, automated domain/API/embedded PostgreSQL tests, production build, browser workflow checks at 320–1440 px, and an isolated Neon built-app check in the PR workflow. The Neon check uses only synthetic accounts and cleans them up. Live photo-provider access, arbitrary restaurant nutrition, automatic wearable integration, external certification verification and clinical reliability are not established by these tests.
