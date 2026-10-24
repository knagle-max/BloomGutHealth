CREATE TABLE IF NOT EXISTS experience_settings (
  user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_payload jsonb NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS experience_records (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  encrypted_payload jsonb NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experience_records_user_kind_idx ON experience_records(user_id,kind);
