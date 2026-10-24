-- Additive, initially unused: no provider activation or default monetary allowance.
-- No prompts, health data, raw account IDs or credentials belong here.
CREATE TABLE IF NOT EXISTS ai_spend_requests (
 request_key text PRIMARY KEY,
 account_key text NOT NULL,
 feature text NOT NULL,
 provider text NOT NULL,
 model text NOT NULL,
 tariff_reference text NOT NULL,
 reserved_micro_usd bigint NOT NULL CONSTRAINT ai_spend_reserved_positive CHECK (reserved_micro_usd > 0),
 settled_micro_usd bigint CONSTRAINT ai_spend_settled_nonnegative CHECK (settled_micro_usd >= 0),
 state text NOT NULL CONSTRAINT ai_spend_state CHECK (state IN ('reserved','settled','released')),
 billing_basis text CONSTRAINT ai_spend_basis CHECK (billing_basis IN ('actual','estimated')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 settled_at timestamptz,
 CONSTRAINT ai_spend_consistency CHECK ((state = 'reserved' AND settled_micro_usd IS NULL AND billing_basis IS NULL AND settled_at IS NULL)
  OR (state = 'settled' AND settled_micro_usd IS NOT NULL AND billing_basis IS NOT NULL AND settled_at IS NOT NULL)
  OR (state = 'released' AND settled_micro_usd = 0 AND billing_basis IS NULL AND settled_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ai_spend_account_time ON ai_spend_requests(account_key,created_at);
CREATE INDEX IF NOT EXISTS ai_spend_provider_time ON ai_spend_requests(provider,created_at);
-- Rollback: stop all consumers before removing additive objects. Never erase unresolved reservations.
