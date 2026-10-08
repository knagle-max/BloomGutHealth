# Bloom Gut Health

Bloom combines a food and symptom journal, nutrition estimates, microbiome reports, experimental research views, and an evidence-linked meal planner. React/TypeScript, Express, PostgreSQL and a separate Python prototype service.

## Run locally

```sh
npm ci
npm run db:push
npm run dev
```

Configure `DATABASE_URL` (Neon-compatible PostgreSQL), `SESSION_SECRET`, and optional provider settings:

- `USDA_FDC_API_KEY`: USDA FoodData Central lookup for ingredient-level macros, vitamins and minerals. Records are scaled from per-100g data using explicitly supplied ingredient weights. Automatic food matches are displayed for review; missing nutrient values are not zero-filled.
- `API_NINJAS_KEY`: existing natural-language nutrition provider, retained as fallback. Without either provider, meals and symptoms still save with nutrition unavailable.
- `OPENAI_API_KEY` and `OPENAI_SCIENCE_MODEL`: optional structured ingredient parsing and evidence-constrained recipe/action prioritization. The user must opt in; the app works with curated rules otherwise.
- `ML_SERVICE_URL`: Python prototype service, defaults to `http://localhost:8000`.
- `PORT`: Express port, defaults to 5000.

Before running the revised server against an existing database, apply the **additive** SQL in `migrations/0001_preserve_functionality.sql`, or use `npm run db:push` after reviewing the proposed schema changes. New JSON columns store preferences, meal context, nutrition provenance and structured report data; existing records are preserved. No production migration is applied by this PR.

For Python, install `pyproject.toml` dependencies with `uv sync`, then `uv run uvicorn ml_service.main:app --host 127.0.0.1 --port 8000`.

## Feature map

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

Automated tests cover preference eligibility, nutrient missingness/scaling, provider failure, ownership, meal context persistence, report parsing, scientific source integrity, AI output validation and unsupported sequence guards. Browser tests use fixture responses; live provider requests and production database migration require credentials and are not verified here. Deployments also need secure sessions, proxy configuration and a shared rate limiter when using multiple instances.
