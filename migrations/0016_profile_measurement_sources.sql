-- Optional encrypted metadata; existing canonical Profile columns stay unchanged.
CREATE TABLE IF NOT EXISTS profile_measurement_sources (
 user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 revision uuid NOT NULL,
 encrypted_payload jsonb NOT NULL
);
