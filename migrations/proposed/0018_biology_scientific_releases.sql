-- Proposed knowledge-only additive migration. Not installed by app startup.
-- No private observations, prompts, provider transcripts or model weights.
CREATE TABLE biology_scientific_releases (
 id text PRIMARY KEY, digest text NOT NULL UNIQUE, manifest jsonb NOT NULL,
 created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE biology_scientific_withdrawals (
 kind text NOT NULL CHECK(kind IN ('relationship','source','review','rights')),
 target_id text NOT NULL, PRIMARY KEY(kind,target_id),
 created_at timestamp NOT NULL DEFAULT now()
);
-- Application rollback may select an earlier manifest; it must not rewrite
-- immutable history or erase current withdrawals. A complete database reset
-- still requires the independently current withdrawal authority at restore.
CREATE FUNCTION biology_protect_scientific_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'Scientific history is append-only';
END;
$$;
CREATE TRIGGER biology_scientific_release_immutable BEFORE UPDATE OR DELETE ON biology_scientific_releases FOR EACH ROW EXECUTE FUNCTION biology_protect_scientific_history();
CREATE TRIGGER biology_scientific_withdrawal_monotone BEFORE UPDATE OR DELETE ON biology_scientific_withdrawals FOR EACH ROW EXECUTE FUNCTION biology_protect_scientific_history();
