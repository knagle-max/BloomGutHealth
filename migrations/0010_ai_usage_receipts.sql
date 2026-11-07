-- Additive usage receipt, no prompts, user text or raw provider request identifiers.
ALTER TABLE ai_spend_requests ADD COLUMN IF NOT EXISTS provider_usage jsonb;
-- Runtime activation remains OFF until reviewed policy, identity key and migration are provisioned.
