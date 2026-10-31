# Microbial metabolite research foundation

This release implements a **scenario builder, readiness screen and strict external-service adapter**. It does not ship or deploy a MICOM model, curated model database, substrate conversion dataset, or validated biological predictor. A disconnected service returns blockers and no numbers. The legacy ML service and its predictions are never used as flux simulation evidence.

## User workflow

In Meal plans, save a checked weekly plan, then select it in “Microbial metabolite scenarios”. Check readiness without transmitting to an external service. The scenario combines the saved plan's intended per-person edible intake with the latest supported structured microbial abundance report at request time. Inspect its assumptions and inputs. An explicit checkbox is required before external transmission. Results are transient, experimental, and never change plan ranking, nutrient constraints or saved biology. The report date is visible; the application does not establish that an old report describes today's microbiome.

The first targets are acetate, propionate and butyrate. The quantity is **net microbial secretion flux in mmol/gDW/h**, not concentration, absorbed dose or a personal daily production estimate. A negative value denotes net consumption under model assumptions. Sensitivity bounds are not clinical confidence intervals. Model provenance and coverage are displayed, but structural validation is not scientific validation.

## Service contract

`POST /api/precision/metabolite-research` accepts `{planId, run:false}` to check readiness, or `{planId, run:true, researchConsent:true}` to execute. Requires login and an account-owned saved weekly plan. Requests cannot submit or replace a plan payload or choose a service URL. Each account may execute once per minute; at most two outbound requests run per application process. External calls time out at 25 seconds and responses are limited to 256 KB. A future long-running backend should use queued jobs; this adapter currently expects a completed response within that deadline.

Configure `METABOLITE_RESEARCH_URL` as an HTTPS endpoint and `METABOLITE_RESEARCH_TOKEN` as its bearer credential, server-side only. No redirects are followed. This is distinct from `ML_SERVICE_URL`. Do not enable it until the backend meets the contract. Prefer a separate research environment before production.

Request body: `researchScenario()` in `shared/metabolite-research.ts`, plus server-generated `inputHash`. It contains the protocol version, three metabolite names, report date, reported taxa with percentages, and each day's food IDs, FDC identifiers, preparation, source URL and edible grams. Household servings do not multiply personal quantities. Names, account/record identifiers, genotypes, laboratory results, symptoms and legacy predictions are excluded. Date/taxa are still sensitive biological information; configure the research service's retention and access policies before enabling.

Response schema: `researchResultSchema` and `validateResearchResult()` in that file. Echo the exact hash; respond `blocked` with actionable blockers and zero estimates if any prerequisite is missing. For `simulated`, return:

- engine, version, model database version, substrate mapping version, solver, citations and assumptions;
- matched reported abundance fraction, unmapped taxa and food IDs;
- exactly one finite estimate per requested day and metabolite with value/lower/upper;
- `units: "mmol/gDW/h"` and a declared parameter-sensitivity or model-ensemble method.

A simulated response cannot contain unmapped foods, zero matched abundance, missing provenance or missing target metabolites. Missing taxa are displayed as a coverage limitation; no universal scientific adequacy cutoff is asserted. Backends must abstain when their reviewed coverage policy is not met. The hash binds outputs to the exact submitted scenario, not proof the service ran the claimed model. Test fixtures are explicitly synthetic and never used in the live app.

## Work still required for a genuine simulation backend

1. Select a microbial model database; establish permitted use, organism identifiers, supported taxonomic resolution and versioned model coverage. Prefer quality-controlled shotgun metagenomics and functional profiles. Genus-only abundance is not evidence of strain-level pathways.
2. Curate a versioned mapping from each prepared food to model exchange substrates, with digestion/colon availability assumptions and uncertainty. USDA total fibre alone is not a growth medium. Reject unmapped preparations rather than guessing. Model food additions and substitutions on the same basis.
3. Construct a microbial community, assign its medium, and run a documented MICOM/COBRA workflow with declared solver and tradeoff parameters. Distinguish medium gap filling from measured dietary input. Perform sensitivity/ensemble runs. Record infeasibility and abstain where appropriate.
4. Reproduce published benchmark outputs using permitted data, then evaluate on independent people. Prevent participant leakage. Report per-metabolite error, calibration/interval performance, failures, coverage, subgroup performance and comparison with simple baselines. Do not reuse simulation outputs as measurement labels.
5. Design prospective dietary perturbations and appropriate measurements with microbiome/metabolic modelling and nutrition expertise. Stool concentration is affected by absorption/transit and is not direct total production. Establish which outcome the model actually predicts before claiming clinical utility.
6. Add host absorption/transformation/clearance only with suitable models and data. Genetic associations must not become arbitrary multipliers of microbial flux. Nutrient adequacy and reviewed clinical constraints remain separate from exploratory model objectives.

Foundational references:
- MICOM original: https://doi.org/10.1128/mSystems.00606-19
- Personalized SCFA modelling: https://doi.org/10.1038/s41564-024-01728-4
- Maintainer documentation: https://micom-dev.github.io/micom/
- Maintainer medium examples: https://github.com/micom-dev/media

## AI activation is a separate connection

The existing recipe proposer, meal parser and evidence-ranking paths require **both** `OPENAI_API_KEY` and `OPENAI_SCIENCE_MODEL`. The application already uses the server-side OpenAI Responses API with structured outputs and `store:false`. An API key is not a metabolic model.

1. Create an API project key at https://platform.openai.com/api-keys and configure API billing/usage controls in that account.
2. Open the Bloom Render service's Environment page: https://dashboard.render.com/web/srv-db9u7mjbc2fs73d86uv0/env . Add the key there; never commit it or send it in chat.
3. Set `OPENAI_SCIENCE_MODEL` to an available Responses/structured-output-capable model in that API project. `gpt-5-mini` is one documented compatible example; verify project access. Preserve DATABASE_URL, SESSION_SECRET and PRECISION_DATA_KEY.
4. Choose Save and deploy (or rebuild and deploy). Saving alone does not activate variables in the running process.
5. Sign in, open Meal plans, and check Analysis connections. “Configured” only establishes nonempty variables. Opt in and generate recipe ideas to verify a real call. Then generate a checked weekly plan. Test meal parsing and Science Coach separately; all three use the same provider configuration but different validation paths.

AI proposes known ingredient combinations and orders curated explanations; it does not freely author biological facts or calculate authoritative nutrients. The current food catalogue still limits recipe variety. A real provider call has not been verified in this release because no key is configured.

Official references: https://developers.openai.com/api/docs/quickstart and https://developers.openai.com/api/docs/models/gpt-5-mini ; Render configuration: https://render.com/docs/configure-environment-variables .
