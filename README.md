# Bloom Gut Health

Bloom combines a five-layer precision nutrition workspace with a food and symptom journal, nutrition estimates, microbiome reports, experimental research views, and an evidence-linked meal planner. React/TypeScript, Express, PostgreSQL and a separate Python prototype service.

## Run locally

```sh
npm ci
npm run db:push
npm run dev
```

Use Node.js 22 or newer. The server and Drizzle configuration load `.env.local` and `.env` without replacing values supplied by the hosting environment. Neon pulls pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED`; application traffic uses the pooled URL, while schema tools prefer the direct one.

Configure `DATABASE_URL` (Neon-compatible PostgreSQL), `SESSION_SECRET`, and optional provider settings:

- `USDA_FDC_API_KEY`: USDA FoodData Central lookup for ingredient-level macros, vitamins and minerals. Records are scaled from per-100g data using explicitly supplied ingredient weights. Automatic food matches are displayed for review; missing nutrient values are not zero-filled.
- `API_NINJAS_KEY`: existing natural-language nutrition provider, retained as fallback. Without either provider, meals and symptoms still save with nutrition unavailable.
- `OPENAI_API_KEY` and `OPENAI_SCIENCE_MODEL`: optional structured ingredient parsing and evidence-constrained recipe/action prioritization. The user must opt in; the app works with curated rules otherwise.
- `ML_SERVICE_URL`: Python prototype service, defaults to `http://localhost:8000`.
- `PRECISION_DATA_KEY`: base64-encoded 32-byte secret for account-bound AES-256-GCM encryption of precision inputs, health context and plan snapshots. Required before storing or reading encrypted precision data; never commit it. See `PRECISION_NUTRITION.md` for key retention and deployment requirements.
- `PORT`: Express port, defaults to 5000.

Before running the revised server against an existing database, apply the **additive** SQL in `migrations/0001_preserve_functionality.sql` and `migrations/0002_precision_nutrition.sql`, or use `npm run db:push` after reviewing the proposed schema changes. New JSON columns store preferences, meal context, nutrition provenance and structured report data; existing records are preserved. No production migration is applied by this PR.

For Python, install `pyproject.toml` dependencies with `uv sync`, then `uv run uvicorn ml_service.main:app --host 127.0.0.1 --port 8000`.

## Feature map

- `/precision`: 23andMe import with an reviewed seven-marker catalogue, dated bloodwork and measured metabolites, separated microbiome hypotheses, ranked foods/meals, conditional supplement assessments, evidence snapshots and response tracking. Inputs are encrypted and account-scoped. See `PRECISION_NUTRITION.md` for exact scope and scientific limits.
- `/`: responsive personal overview, daily nutrition, meal history and restored report/research summary.
- `/log-meal`: description, meal type, date/time, portion context, optional saved symptoms (bloating, energy, digestive comfort, mental clarity), optional AI ingredient parsing, nutrient/molecule/pathway explanations.
- `/nutrition`: journal editing/deletion, individual nutrition items and pathway hypotheses, saved context, daily targets, monthly and yearly summaries.
- `/profile`: actual account nutrition profile and database-persisted dietary preferences, dislikes, exclusions, dietary pattern, cooking-time limit, cuisine context and goals; theme/logout.
- `/meal-planner`: 15 complete recipes with amounts, steps, goal rationale and pathway citations. Preferences filter eligibility before optional AI ordering. Recipe nutrition uses configured databases; recipe-to-journal handoff does not log food until the user saves it. Four-week saved symptom and journal progress plus approximate recipe adherence.
- `/demo`: isolated sample-data exploration; no provider requests or writes to the account.
- `/insights`: sourced goal/function/substrate Diet coach, retained alongside all legacy feature areas.
- `/health-insights`: restored Health, SCFAs, Tips, Track and Trends screens. Legacy calculations are explicitly experimental and are not clinical measurements.
- `/microbiome`: reported composition, report history and selection, comparison between compatible reports, molecule model details, diet-based experimental exploration, research evidence for athletes/long-lived populations and the original illustrative cohort comparison.
- `/upload`: working manual JSON entry and supported JSON/CSV abundance import, notes and report metadata. Sequence uploads can be recorded; taxonomic classification of raw sequences is not implemented.

Existing health, diet-model and adherence APIs remain callable; they no longer return HTTP 410. Meal CRUD paths and response fields remain compatible. Profile editing now checks authentication and account ownership. Individual meal adherence no longer calls a localhost URL without authentication.

## Scientific and implementation boundaries

Nutrition is a database/provider estimate, not lab analysis of a meal. Ambiguous quantities require gram weights; AI cannot invent micronutrient numbers. Food matches need review for preparation/product fit. Partial nutrient coverage is displayed explicitly. Portion labels do not multiply nutrients automatically.

Foods identify supported pathway hypotheses, not measured species abundance, metabolite concentrations or causal health improvement. Recipe servings are practical translations, not study-equivalent treatment doses. The catalogue is versioned and extensible, but does not yet cover arbitrary foods/goals comprehensively.

The original diet-to-bacteria, molecule and health-score models are retained with visible experimental labels. Their numerical indices are unvalidated; historical analyses may include demonstration data. Newly run Python abundance models are deterministic and no longer invent gene counts or random molecule values, but their relative indices and cohort profiles remain illustrative.

Athlete and centenarian study findings are available with primary sources. Real population percentiles require harmonized reference datasets, compatible assays and validation. The app does not claim that resembling a group improves performance or lifespan. The prototype cohort similarity is identified separately.

AI recipe prioritization uses the eligible catalogue only; it does not yet generate unrestricted novel recipes or automatically retrieve and validate new studies. Cuisine context influences optional AI ordering, not deterministic filtering. Full expert-curated knowledge coverage and prospectively validated personalization remain product development work. See `FUNCTIONALITY.md` and `SCIENCE_COACH.md`.

## Validation

```sh
npm run check
npm test
npm run build
python -m unittest discover -s tests -p 'test_*.py'
```

Automated tests additionally cover the precision workflow, genetic import integrity, lab units and trends, supplement safety, source separation, input ownership and authenticated encryption. They also cover preference eligibility, nutrient missingness/scaling, provider failure, ownership, meal context persistence, report parsing, scientific source integrity, AI output validation and unsupported sequence guards. Browser tests use fixture responses; live provider requests and production database migration require credentials and are not verified here. Deployments also need secure sessions, proxy configuration and a shared rate limiter when using multiple instances.

## Neon CLI setup

`neon.ts` declares PostgreSQL-only infrastructure and retains the app's existing authentication. The generated `.neon` project/branch link and all credential files are gitignored. The `production` branch policy does not add an automatic expiry.

```sh
npx neon@latest --no-analytics login
npx neon@latest --no-analytics deploy
```

Complete browser sign-in in the environment running the CLI; signing in on a different computer does not automatically authenticate this workspace. After a successful deployment, the CLI pulls the database environment variables. Review the live schema before applying the Drizzle schema or additive migrations. Neon provisions the database here; this PostgreSQL-only configuration does not host the React/Express app or the separate Python service.

Then configure independent `SESSION_SECRET` and `PRECISION_DATA_KEY` secrets, build and run the app. Do not rotate the precision key after saving data without a re-encryption plan. A passing build alone does not prove the live database integration; verify account creation, session persistence, journal CRUD and encrypted precision record read/write against the provisioned database.

### GitHub-connected Neon setup

When the Neon GitHub integration has created `NEON_API_KEY` (Actions secret) and `NEON_PROJECT_ID` (Actions variable), `.github/workflows/neon_workflow.yml` can provision and test without a local CLI session. For same-repository pull requests it creates `preview/pr-<number>` as a schema-only branch of `production`, applies `neon.ts`, pulls the environment, applies the app schema to that preview, checks types/tests/build, and starts the built app for live PostgreSQL-backed API checks. The preview expires after fourteen days and the workflow requests deletion when the PR closes. Once merged, this workflow remains available to handle later PR lifecycle events. Forks do not receive the secret or run privileged jobs.

`npm run test:neon` is deliberately mutating and requires `BLOOM_SMOKE_ISOLATED=true` plus both database URLs. It is intended for an isolated CI database only, creates synthetic accounts/data, verifies API persistence and encryption, and removes its synthetic records afterward. It never prints connection strings, cookies, passwords or encryption keys. CI uses temporary session/encryption secrets; never reuse these for a persistent deployment. Production data and keys are not modified by the PR workflow.

This integration verifies a database-backed build; it does not publish a public app URL. Configure the persistent database and retained application secrets in the app host (such as Render) for actual use. Render's HTTPS proxy is explicitly trusted for secure session cookies; other hosts need their own proxy configuration.

## Weekly meal planning and evidence network

`/meal-planner` now includes nutrient-constrained weekly planning, portion/meal swaps, prepared-quantity shopping lists, optional validated AI recipe proposals, and encrypted saved plans. See [WEEKLY_PLANNING.md](WEEKLY_PLANNING.md) for the actual scope, data provenance and remaining scientific work. Existing features remain available.

### Metabolite research foundation

Meal plans now include an experimental SCFA scenario/readiness panel and a strict external simulation adapter. No numerical model is bundled or connected. See [RESEARCH_MODEL.md](RESEARCH_MODEL.md) for the service contract, scientific prerequisites and AI activation steps.

### Selected SNP entry

Precision → Genetics supports manual individual genotypes and pasted gene/rsID/genotype tables without a full DNA upload. Users preview and consent before saving. Unreviewed, incompatible or unknown-strand entries remain recorded without interpretation. See [SELECTED_GENETICS.md](SELECTED_GENETICS.md).

Saved genetic entries now have searchable gene/SNP/genotype explanations and source-linked comparison tables for 29 curated educational markers, separate from seven diet-ranking markers. Raw-file preview/consent covers only these 29 retained SNPs. See [GENOTYPE_EXPLANATIONS.md](GENOTYPE_EXPLANATIONS.md) for strand matching, uncertainty and actionability limits.
