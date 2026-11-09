-- Ephemeral authentication receipts, not release approvals or control state.
CREATE TABLE IF NOT EXISTS public.feature_control_step_up_receipts (
  proof_key text PRIMARY KEY CHECK (proof_key ~ '^[a-f0-9]{64}$'),
  session_key text NOT NULL CHECK (session_key ~ '^[a-f0-9]{64}$'),
  actor_key text NOT NULL CHECK (actor_key ~ '^[a-f0-9]{64}$'),
  intent_key text NOT NULL CHECK (intent_key ~ '^[a-f0-9]{64}$'),
  grant_key text NOT NULL CHECK (grant_key ~ '^[a-f0-9]{64}$'),
  service_id text NOT NULL CHECK (service_id ~ '^srv-[a-z0-9]+$'),
  environment text NOT NULL CHECK (environment IN ('development-review','isolated-synthetic')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  CHECK (expires_at > created_at AND expires_at <= created_at + interval '120 seconds'),
  CHECK (consumed_at IS NULL OR consumed_at >= created_at)
);
CREATE INDEX IF NOT EXISTS feature_control_step_up_expiry ON public.feature_control_step_up_receipts(expires_at);
