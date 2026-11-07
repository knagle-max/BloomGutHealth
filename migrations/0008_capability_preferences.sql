-- Additive, no account is provisioned or enabled by this migration.
CREATE TABLE IF NOT EXISTS capability_preferences (
  user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  grant_fingerprint text NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);
