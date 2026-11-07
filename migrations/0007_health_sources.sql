-- v0.5: dormant encrypted device observation storage. No connector is enabled by this migration.
CREATE TABLE IF NOT EXISTS health_source_consents (
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('apple_health', 'health_connect')),
  encrypted_payload jsonb NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, provider)
);
CREATE TABLE IF NOT EXISTS health_observations (
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_key text NOT NULL,
  encrypted_payload jsonb NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, source_key)
);
CREATE INDEX IF NOT EXISTS health_observations_user_updated_idx ON health_observations(user_id, updated_at DESC);
