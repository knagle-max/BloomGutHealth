-- Proposed knowledge ingestion only. Requires proposed 0018; not app startup.
-- Exact approved provenance metadata only, never model prose or personal facts.
CREATE TABLE biology_scientific_candidate_receipts (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{64}$'),
 candidate_digest text NOT NULL CHECK (candidate_digest ~ '^[a-f0-9]{64}$'),
 receipt jsonb NOT NULL, created_at timestamp NOT NULL DEFAULT now()
);
CREATE TRIGGER biology_scientific_candidate_receipt_immutable
BEFORE UPDATE OR DELETE ON biology_scientific_candidate_receipts
FOR EACH ROW EXECUTE FUNCTION biology_protect_scientific_history();
