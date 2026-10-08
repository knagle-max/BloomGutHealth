# Bloom Gut Health

Bloom is a mobile-friendly food journal and microbiome research prototype built with React, TypeScript, Express, PostgreSQL, and a separate Python analysis service.

## Run locally

```sh
npm ci
```

Set environment variables in your shell or deployment platform:

- `DATABASE_URL`: PostgreSQL connection string (the current database adapter uses Neon's WebSocket driver).
- `SESSION_SECRET`: a unique, private session secret. Required operationally for any deployed instance; do not use the built-in development fallback.
- `API_NINJAS_KEY`: nutrition-service key, required to save/analyze meals.
- `ML_SERVICE_URL`: Python service URL; defaults to `http://localhost:8000`.
- `PORT`: Express port; defaults to `5000`.

Create the database schema, then run the app:

```sh
npm run db:push
npm run dev
```

For the separate Python prototype, install the dependencies from `pyproject.toml` using `uv sync` and run `uv run uvicorn ml_service.main:app --host 127.0.0.1 --port 8000`.

## Validation

```sh
npm run check
npm test
npm run build
```

With the Python service dependencies installed, run `python -m unittest discover -s tests -p 'test_*.py'` to check the unsupported-upload guard.

## Enhanced experience

- Responsive overview with warm botanical styling, desktop navigation, and iPhone safe-area support.
- User-specific nutrition totals, today's food journal, and switchable 7/14-day logging history.
- A dedicated `/log-meal` route with server-confirmed save feedback and actionable errors.
- Shared theme state for header and profile, accessible navigation labels, zoom support, and reduced-motion support.
- Explicit loading, empty, disconnected, and retry states for the overview.
- Compatibility fix for the journal's `/api/meals/:userId` requests, preserving user authorization checks.
- Insights use the signed-in user's identity rather than the demo account.

## Analysis limitations

This is a research prototype, not a validated diagnostic product. Dietary bacterial predictions, molecule production, and health scores use hand-written rules. Cohort and metabolite logic still include illustrative assumptions. Food intake does not directly measure a person's bacteria or metabolite concentrations.

The upload-to-analysis pipeline does **not** currently extract bacterial abundance from sequencing files. Its analysis request sends a file path, but the Python endpoint requires structured `raw_data.bacteria_percentages`. Unsupported requests now return an error rather than creating randomized bacterial results. Direct structured abundance requests remain experimental. Existing stored results may have been created by earlier randomized logic and should not be treated as real measurements.

Symptom and portion controls were removed from the dedicated meal form because the database does not persist those fields. Adding them properly needs schema changes and a separate check-in workflow.

Before deployment, configure database, nutrition access, a secure session secret, and reverse-proxy/session settings for your hosting platform. This enhancement does not provision infrastructure or validate scientific models.

## Goal-based Diet coach

Open **Diet coach** (`/insights`) to explore butyrate, diversity, athlete-associated functions, or healthy-ageing research. The new planner shows the biology, food translations, and study links without inferring species or metabolite levels from meals. Athlete/centenarian views expose research and evidence gaps rather than prescribing an unproven microbiome match.

Optional AI prioritization requires `OPENAI_API_KEY` and `OPENAI_SCIENCE_MODEL` (a model supporting structured Responses API outputs). It is off unless the user opts in. Without those settings the cited evidence planner works and is clearly labelled. See [SCIENCE_COACH.md](SCIENCE_COACH.md) for the evidence model, privacy boundaries, remaining scientific work, and validation limits.
