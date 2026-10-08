# Bloom's scientific recommendation foundation

## What is implemented

The `/insights` route is now a goal-based Diet coach. It connects selected goals to molecules or measured community outcomes, microbial functions, organisms involved, substrate/context, and eligible food actions. Every connection links to a versioned source record containing study design, DOI, findings, and limitations.

The initial supported goals are butyrate production potential, microbial diversity, athlete-associated functions, and centenarian-associated functions. The last two are research views: the catalogue does not invent a food intervention when a human intervention has not established it. Goals and listed food restrictions are saved per account on the current device. Plans are generated from current choices, not permanently stored as clinical records.

Evidence is curated and versioned, not automatically refreshed from the internet. The initial sources were checked against primary research during implementation. This catalogue and its translations still need independent expert review; it is not a clinical guideline or a validated treatment model.

## The reasoning model

1. **Goal:** an explicit supported outcome, not an arbitrary health promise.
2. **Biological pathway:** the relevant molecule or community endpoint and the microbial function behind it.
3. **Organisms:** taxa that may carry the function, distinguished from cross-feeding contributors. Presence, function, activity, and flux are separate properties.
4. **Substrate/context:** what feeds or enables the pathway. Host bile acids and exercise-associated lactate are not automatically actionable dietary ingredients.
5. **Action:** a supported dietary pattern or a clearly labelled whole-food translation. Study doses are not inferred from household servings.
6. **Evidence boundary:** human intervention, mechanistic translation, or association; the app preserves uncertainty rather than converting it into a percentage confidence.
7. **Personal fit:** food filters, tolerance settings, and food familiarity from recent journal entries. The planner does not infer bacterial deficits, metabolite concentrations, or health scores from nutrients.

A resistant-starch pathway is a network: primary degraders such as R. bromii can make substrates accessible to downstream fermenters. A named organism is not an obligatory universal target, and eating its substrate does not introduce a missing strain. Bifidobacterium can contribute acetate/lactate to cross-feeding; it is not presented as a direct butyrate producer.

## How AI is used

`server/science-coach.ts` uses the existing OpenAI SDK and structured outputs. Configure `OPENAI_API_KEY` and `OPENAI_SCIENCE_MODEL` with a model supporting structured Responses API output. No model name or credential is hardcoded.

After the user explicitly opts in, the model receives the supported goals, filtered actions, pathway/source records, ingredient-group restrictions, sensitivity flag, food-familiarity flags, and optional preferences. Raw meal descriptions and account identifiers are not sent. Preference text is not persisted by the form. `store: false` is passed to the Responses API; this should not be described as a blanket guarantee about all provider retention policies.

The model returns an ordered list of eligible action IDs only. It cannot alter citations, mechanisms, practical steps, dose limits, or caveats. Application validation requires an exact permutation of the allowed IDs. Unknown, duplicated, missing, or excluded actions cause a fallback to the curated plan. Model errors/refusals/timeouts also fall back with an explicit status. Without configuration or consent, the UI calls the result a curated evidence plan, not AI-generated advice. Preferences influence ordering only, not eligibility or scientific conclusions.

The authenticated endpoint takes the user identity from the session and reviews meal text from the last 14 days. It accepts supported request fields only and limits generation requests to six per minute per user in this process. A multi-instance deployment would need a shared rate limiter. Provider calls have a 20-second timeout and no automatic retries.

## Why cohort matching is not implemented yet

Neither the app nor the initial catalogue contains a harmonized athlete or centenarian reference dataset. There is no legitimate cohort percentile or similarity score. The current coach therefore exposes those groups as research themes only.

A future cohort comparison needs:

- Consent and provenance for a real reference dataset, including geography, age, sex, diet, medication, training, and sampling context.
- Compatible sequencing, preprocessing, taxonomy, and normalization. Relative-abundance data are compositional; an increase in one taxon can change other proportions without changing their absolute amounts.
- Clear treatment of strain/function differences, detection limits, missing values, uncertainty, and batch effects. Undetected does not automatically mean absent.
- Separate descriptions of taxonomic resemblance, pathway capacity, measured activity/metabolites, and actual clinical outcomes.
- External validation. A resemblance score must not imply athletic performance or longevity.

## Next implementation stages

1. Expand the catalogue with human intervention evidence for specific fibers, food patterns, strains, and clinical goals. Record the exact study population, exposure, dose, preparation, duration, outcomes, negative findings, and practical translation for each edge.
2. Add an expert review workflow with extraction status, review dates, conflict handling, evidence upgrades/downgrades, and source-version history. Retrieval may propose new edges; it must not publish an unchecked claim.
3. Add validated importers for laboratory abundance reports, metagenomic pathways, and metabolite results. Preserve provenance and report uncertainty. The current upload guard rejects unsupported analysis instead of using demonstration data.
4. Add persisted goal plans and follow-up check-ins for symptoms, serving amounts, adherence, and outcomes. The revised meal schema stores optional symptoms and portion/time context; longer-term plans and outcome validation remain future work. A 2–4-week check-in is a practical review window, not a proven response timeline.
5. Evaluate recommendations prospectively: eligibility errors, contradictory advice, unsupported claims, adherence, tolerance, and independently measured outcomes. Clinical effectiveness needs more than a working interface.

## Preserved experimental experiences

The original health, molecule, dietary bacterial exploration, recommendation, adherence and trend endpoints are restored. `/health-insights` routes the original feature areas alongside `/insights`. Explicit banners identify rule-based estimates as experimental, not measured biology. `/microbiome` restores composition, molecular model details, diet exploration and illustrative cohort comparison. The revised journal uses sourced ingredient-pathway explanations rather than silently dropping food-effect exploration.

`/meal-planner` adds complete recipes and saved account preferences. Supported goals and restrictions filter meals before optional AI ordering. The recipe model is extensible but remains a curated catalogue, not unrestricted AI recipe invention. New whole-diet SCFA and walnut/urolithin sources expand the meal explanation graph. `FUNCTIONALITY.md` lists complete scope and remaining gaps.

## Validation

Automated tests cover source/pathway integrity, food filtering, cohort-only plans, consent, invalid AI output, fallback behavior, malformed requests, authenticated user scope, the recent-journal window, and rate limiting. Browser smoke tests exercise goal selection, exclusions, sensitivity filtering, evidence expansion, plan regeneration, responsive layouts, and AI-mode labels using fixture responses. A live model call and production database integration require configured credentials and were not exercised here.

## Nutrition interpretation and AI consent

Optional ingredient parsing sends the entered meal description to the configured OpenAI provider after explicit consent. Ingredient gram masses must correspond to mass values in the user description; absent quantities stay unknown. USDA automatic record matches are shown with FDC identifiers and nutrient coverage. API Ninjas remains a compatible fallback. The application never asks the model to create nutrient values. Missing values are null; partial values are not complete meal totals.

Optional recipe prioritization sends filtered recipe records, goals, saved preferences and evidence to the provider. An exact ID permutation is required; invalid, duplicated, omitted or invented recipes fall back. Neither model output can introduce new citations or clinical conclusions. Broad recipe generation, measured personalization and expert review remain development work.
