# Bloom Gut Health

> **Development project — browser/PWA-first v0.5.** Working features and external integrations vary by branch, configuration, permissions and source availability. The README describes the application and development process; it is **not** evidence that every planned capability has shipped or been independently accepted.

Bloom is a personalized nutrition and health-information application connecting everyday meal and activity logging, nutrition estimates, goals, dated bloodwork, genetics and microbiome reports, and an optional Athlete experience. Its primary goal is a useful, trustworthy daily workflow: **capture → review/correct → save → see meaningful results**.

## Start here — current development priorities (October 28, 2026)

**The product owner's binding direction is core functionality first.** Complete and verify normal user journeys before broad edge-case hardening, extra infrastructure or cosmetic redesign. Record noncritical exceptions for a later stabilization pass; address confirmed privacy, security, data-integrity, nutritional-accuracy and medical-safety issues immediately.

- **Food:** Canadian-aware generic/branded/homemade search → dynamically editable ingredients and portions → accurate macro overview/details → canonical saved journal and Today totals; preserve working KitKat search and reliable manual entry.
- **Everyday:** Goal-linked Today, simple activity logging and dated Progress.
- **My Biology:** Safe, provenance-preserving bloodwork and microbiome/genetics file imports, dynamic histories and educational explanations, with clinician follow-up for potentially concerning findings rather than diagnosis.
- **Athlete:** Basic workout logging, actual performance history and relevant fueling; optional advanced adaptation later.
- **Delivery:** Browser/PWA first. Apple Health, Health Connect and wearables remain future native/hybrid work, not functioning connections in v0.5.

**Authoritative coordination and specifications:**
- [Product-owner core-first directive](docs/architecture/CORE_FUNCTIONALITY_EXECUTION_DIRECTIVE_2026-10-26.md)
- [Current developer task index](docs/architecture/PERSISTENT_TASK_INDEX.md)
- [Active execution queue](docs/architecture/ACTIVE_EXECUTION_QUEUE.md)
- [Current v0.5 requirements](docs/architecture/CURRENT_V05_REQUIREMENTS.md)
- [v0.6 consolidated architectural handoff](docs/architecture/V06_HANDOFF.md)
- [Owner's free-first nutrition data decisions](docs/architecture/OWNER_FREE_NUTRITION_DECISIONS_2026-10-28.md)
- [Flagship visual + interaction contract review](docs/architecture/BRANDING_FLAGSHIP_UX_ARCHITECT_REVIEW_2026-10-26.md)
- [Original flagship package transfer receipt](docs/agents/branding-ux/Bloom_Flagship_Developer_Transfer_Receipt_2026-10-28.md)
- [Project decision and specialist workflow](PROJECT_COORDINATION.md)

### Data-source and clinical boundaries

USDA FoodData Central remains an existing nutrition source. Canadian Nutrient File 2026 is being evaluated; Open Food Facts is approved for **controlled engineering evaluation only**, not commercial activation without Legal/Integrations clearance. FatSecret and HealthyFastFood are candidate Canadian restaurant pilots, **not approved production sources**. No new paid subscription is authorized. Sources, country/formulation and missing nutrients must remain transparent, with manual logging available.

Bloom is **not a medical diagnostic or prescribing system**. It may present reported measurements, observed trends and issues worth discussing with a qualified healthcare professional, but it must not make unsupported diagnoses, treatment recommendations, medical-clearance claims or medication-dose changes. Only independently reviewed escalation policies may determine urgency.

### Developer workflow

Work on the existing development branch `enhance/bloom-experience`, preserving source/claims/legal gates. Check whether each feature already exists before coding; finish one end-to-end working slice, validate it in the application, then update the persistent task index with commit SHA, tests, Render verification and remaining blockers. Keep **implemented**, **tested**, **deployed** and **independently accepted** distinct. Do not merge to main or enable restricted integrations without their release approvals.

The approved flagship source archive includes `contracts/UX_BLUEPRINT.md`, `contracts/IMPLEMENTATION_CONTRACT.md`, `prototype/index.html`, `prototype/styles.css`, editable SVGs and original concept PNGs. The [asset-transfer receipt](docs/agents/branding-ux/Bloom_Flagship_Developer_Transfer_Receipt_2026-10-28.md) provides original source location, manifest and checksum; use `scripts/import_flagship_assets.py` for a byte-verified import where the source ZIP is available. **Instructions and receipt alone do not prove the original assets were imported or that the rendered UI was approved.** The UX Blueprint and implementation contract are equally authoritative; images alone are not implementation specs.

---

## Technical overview and existing implementation notes

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

Before running the revised server against an existing database, apply the **additive** SQL in `migrations/0001_preserve_functionality.sql` and `migrations/0002_precision_nutrition.sql`, or use `npm run db:push` after reviewing the proposed schema changes. New JSON columns store preferences, meal context, nutrition provenance and structured report data; existing records are preserved. Apply the reviewed additive migrations required by the deployed version before starting it against an existing database.

For Python, install `pyproject.toml` dependencies with `uv sync`, then `uv run uvicorn ml_service.main:app --host 127.0.0.1 --port 8000`.

## Biological intelligence and barcode entry

The free-core product direction is Today, Explore and Progress, with Athlete planned as a future subscription addition. No billing or paywall is currently implemented. See [PRODUCT_DIRECTION.md](PRODUCT_DIRECTION.md).

Explore also searches the server-side USDA FNDDS catalogue (5,431 generic records), with gram/household portions and all 21 supported nutrients. `/api/biology/catalogue` and `/api/biology/catalogue/:id?grams=100` require authentication and accept no personal-account selector. Composition estimates are separate from the eight reviewed biological food families. Shared `food-intelligence.ts` computes explicit daily-target contributions for Everyday and Athlete meal options; it does not infer clinical effects or missing intake. Practical meal biology explanations now use the same reviewed food assessments and source traces as Explore, rather than a second set of ingredient-name rules. No new database migration is needed for this catalogue expansion.

`/explore` reads the versioned, normalized PostgreSQL biological registry and separates general research from personal observations and actual food-priority rules. `/progress` brings compatible laboratory trends and routine check-ins together. Run the reviewed additive `migrations/0005_biological_registry.sql` on existing databases, or apply the Drizzle schema and then `npm run db:seed:knowledge`. Do not edit a published registry version in place; source/fingerprint checks detect drift. The seed contains only public reference data.

Food and supplement pickers support live UPC/EAN camera scanning and local barcode-photo decoding through a lazy-loaded decoder. Scan from the meal-entry button, confirm the product/formula and servings, then save. Camera frames/photos stay on-device; only the barcode number goes to product lookup. Unknown products can be saved privately with a valid barcode and reused on later scans, including when external sources are unavailable. Actual mobile-camera hardware still requires device testing.

## Everyday and athlete modes

Use the header Experience mode selector for a separate blue Bloom Athlete workspace, training/fueling/recovery/competition tools, and preserved everyday settings. Shared logging, practical next-meal choices and weekly reviews are documented in [ATHLETE_EXPERIENCE.md](ATHLETE_EXPERIENCE.md). The additive `migrations/0004_experience.sql` creates encrypted experience settings/records.

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

### Security and evidence enhancement (18 October 2026)

Production requires a unique random `SESSION_SECRET` of at least 32 characters; startup refuses missing, short or known-default values. Authentication rotates and saves sessions, has bounded sign-in throttles, and uses no-store responses. API logs omit bodies and concrete account identifiers; browser account changes clear pending/cached queries. The current limiter is process-local; use an atomic shared limiter before horizontal scaling.

Optional Python processing now requires matching, unique `ML_SERVICE_TOKEN` values (at least 32 UTF-8 bytes, no whitespace) on Express and Python. `ML_SERVICE_URL` must be an origin, normally HTTPS; loopback HTTP is allowed, and deliberately private internal HTTP additionally requires `ML_SERVICE_ALLOW_PRIVATE_HTTP=true`. No token means no health-data transfer. Interactive docs and wildcard browser CORS are disabled. No existing production key is automatically replaced.

Prototype food-log SCFA, bacterial-gap and health-score endpoints return HTTP 410 instead of unvalidated personalized quantities; `/health-insights` redirects to the sourced Diet coach. Common MTHFR calls no longer independently change food or recipe rank. Energy targets, nutrient minima and explicit limits have distinct labels; partial logged intake cannot certify remaining-limit compliance. See `ENHANCEMENT_REVIEW.md` for the handoff reconciliation and remaining launch requirements.
