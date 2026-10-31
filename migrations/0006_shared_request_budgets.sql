-- Additive; contains keyed hashes and request counts, never health payloads.
CREATE TABLE IF NOT EXISTS request_budgets (
  identity text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS request_budgets_expiry ON request_budgets (expires_at);
-- Rollback: keep the table for older application compatibility; remove only after
-- every process using shared budgets has been retired. No personal rows touched.
