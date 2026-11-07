-- Additive only. Requires application PRECISION_DATA_KEY; back up and retain that key.
CREATE TABLE IF NOT EXISTS precision_profiles (
  user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_context jsonb NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS precision_records (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('genetics','lab','metabolite','checkin','plan')),
  encrypted_payload jsonb NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS precision_records_user_created_idx ON precision_records(user_id, created_at DESC);
