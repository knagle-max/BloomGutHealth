-- Owned source history only; no medical/research capability activation.
CREATE TABLE IF NOT EXISTS experiment_versions (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 record_id varchar NOT NULL REFERENCES experience_records(id) ON DELETE CASCADE,
 encrypted_payload jsonb NOT NULL,
 source_created_at timestamp NOT NULL,
 source_updated_at timestamp NOT NULL,
 superseded_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experiment_versions_record_idx ON experiment_versions(record_id,superseded_at);
CREATE OR REPLACE FUNCTION bloom_experiment_version_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP = 'UPDATE' OR EXISTS (SELECT 1 FROM experience_records WHERE id=OLD.record_id) THEN
  RAISE EXCEPTION 'Saved routine versions cannot be changed independently of their source' USING ERRCODE='55000';
 END IF;
 RETURN OLD;
END $$;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='experiment_versions_immutable' AND tgrelid='experiment_versions'::regclass) THEN
  CREATE TRIGGER experiment_versions_immutable BEFORE UPDATE OR DELETE ON experiment_versions
  FOR EACH ROW EXECUTE FUNCTION bloom_experiment_version_immutable();
 END IF;
END $$;

CREATE OR REPLACE FUNCTION bloom_experiment_versions_no_truncate() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
 RAISE EXCEPTION 'Saved routine versions cannot be truncated' USING ERRCODE='55000';
END $$;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='experiment_versions_no_truncate' AND tgrelid='experiment_versions'::regclass) THEN
  CREATE TRIGGER experiment_versions_no_truncate BEFORE TRUNCATE ON experiment_versions
  FOR EACH STATEMENT EXECUTE FUNCTION bloom_experiment_versions_no_truncate();
 END IF;
END $$;
