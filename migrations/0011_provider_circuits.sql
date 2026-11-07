-- Shared provider health only; no account, prompt or health-record payloads.
CREATE TABLE IF NOT EXISTS provider_circuits (
 circuit_key text PRIMARY KEY,
 failures integer NOT NULL DEFAULT 0 CONSTRAINT provider_circuit_failures CHECK(failures >= 0),
 open_until timestamptz,
 probe_token text,
 probe_expires_at timestamptz,
 generation bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CONSTRAINT provider_circuit_probe CHECK((probe_token IS NULL AND probe_expires_at IS NULL) OR (probe_token IS NOT NULL AND probe_expires_at IS NOT NULL))
);
-- Apply only through the approved additive migration process; no runtime activation implied.
