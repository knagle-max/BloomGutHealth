-- Storage foundation only. Applying this migration does not authorize or install
-- any feature control, reviewer role, approval, runtime adapter or public flag.
CREATE TABLE IF NOT EXISTS feature_control_states (
  service_id text NOT NULL CHECK (service_id ~ '^srv-[a-z0-9]+$'),
  environment text NOT NULL CHECK (environment IN ('development-review','isolated-synthetic')),
  feature_id text NOT NULL,
  revision bigint NOT NULL CHECK (revision > 0 AND revision <= 9007199254740991),
  state text NOT NULL CHECK (state IN ('enabled','paused','disabled','incident-disabled')),
  material_digest text NOT NULL CHECK (material_digest ~ '^[a-f0-9]{64}$'),
  encrypted_control jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (service_id, environment, feature_id)
);
CREATE TABLE IF NOT EXISTS feature_control_audit (
  service_id text NOT NULL CHECK (service_id ~ '^srv-[a-z0-9]+$'),
  environment text NOT NULL CHECK (environment IN ('development-review','isolated-synthetic')),
  feature_id text NOT NULL,
  revision bigint NOT NULL CHECK (revision > 0 AND revision <= 9007199254740991),
  request_id uuid NOT NULL,
  event_digest text NOT NULL CHECK (event_digest ~ '^[a-f0-9]{64}$'),
  encrypted_event jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (service_id, environment, feature_id, revision),
  CONSTRAINT feature_control_audit_request UNIQUE (service_id, environment, request_id)
);
CREATE OR REPLACE FUNCTION bloom_feature_audit_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
  RAISE EXCEPTION 'Feature control audit is append only' USING ERRCODE = '55000';
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'feature_control_audit_immutable'
    AND tgrelid = 'feature_control_audit'::regclass) THEN
    CREATE TRIGGER feature_control_audit_immutable
    BEFORE UPDATE OR DELETE OR TRUNCATE ON feature_control_audit
    FOR EACH STATEMENT EXECUTE FUNCTION bloom_feature_audit_append_only();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='feature_control_state_audit'
    AND conrelid='feature_control_states'::regclass) THEN
    ALTER TABLE feature_control_states ADD CONSTRAINT feature_control_state_audit
      FOREIGN KEY (service_id,environment,feature_id,revision)
      REFERENCES feature_control_audit(service_id,environment,feature_id,revision)
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;

-- Drizzle schema bootstrap can create this FK before SQL migrations run.
-- Always establish the deferred behavior required by the atomic state+audit write.
ALTER TABLE feature_control_states ALTER CONSTRAINT feature_control_state_audit
  DEFERRABLE INITIALLY DEFERRED;
