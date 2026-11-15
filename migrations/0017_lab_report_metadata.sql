-- Additive, account-private annotations; precision_records clinical kinds stay unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS lab_report_metadata_versions (
 id varchar PRIMARY KEY,
 user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 source_id varchar NOT NULL,
 source_record_ids text[] NOT NULL,
 encrypted_payload jsonb NOT NULL,
 created_at timestamp NOT NULL DEFAULT now(),
 CONSTRAINT lab_report_metadata_source_id CHECK (source_id ~ '^[a-f0-9]{64}$'),
 CONSTRAINT lab_report_metadata_members CHECK (cardinality(source_record_ids)>0 AND array_position(source_record_ids,NULL) IS NULL)
);
CREATE INDEX IF NOT EXISTS lab_report_metadata_owner_source_idx ON lab_report_metadata_versions(user_id,source_id,created_at DESC);
CREATE INDEX IF NOT EXISTS lab_report_metadata_members_idx ON lab_report_metadata_versions USING gin(source_record_ids);
CREATE OR REPLACE FUNCTION bloom_lab_report_metadata_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='LAB_REPORT_METADATA_IMMUTABLE'; END;
$$;
DROP TRIGGER IF EXISTS lab_report_metadata_immutable ON lab_report_metadata_versions;
CREATE TRIGGER lab_report_metadata_immutable BEFORE UPDATE ON lab_report_metadata_versions
 FOR EACH ROW EXECUTE FUNCTION bloom_lab_report_metadata_immutable();

-- Keeps source erasure safe even for an older application version. A report's
-- annotation history remains while any source fact in its versioned basis exists.
CREATE OR REPLACE FUNCTION bloom_lab_report_metadata_cleanup() RETURNS trigger LANGUAGE plpgsql
 SET search_path=public,pg_temp AS $$
BEGIN
 IF OLD.kind='lab' THEN
  DELETE FROM public.lab_report_metadata_versions target
   WHERE target.user_id=OLD.user_id
   AND target.source_id IN (
    SELECT basis.source_id FROM public.lab_report_metadata_versions basis
     WHERE basis.user_id=OLD.user_id AND basis.source_record_ids @> ARRAY[OLD.id]::text[]
   )
   AND NOT EXISTS (
    SELECT 1 FROM public.lab_report_metadata_versions basis
     JOIN public.precision_records fact ON fact.user_id=basis.user_id
      AND fact.kind='lab' AND fact.id=ANY(basis.source_record_ids)
     WHERE basis.user_id=target.user_id AND basis.source_id=target.source_id
   );
 END IF;
 RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS lab_report_metadata_source_cleanup ON precision_records;
CREATE TRIGGER lab_report_metadata_source_cleanup AFTER DELETE ON precision_records
 FOR EACH ROW EXECUTE FUNCTION bloom_lab_report_metadata_cleanup();
COMMIT;
