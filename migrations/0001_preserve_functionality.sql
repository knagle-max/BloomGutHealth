-- Additive migration: existing meals, users and reports are preserved.
ALTER TABLE users ADD COLUMN IF NOT EXISTS dietary_preferences jsonb;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS meal_context jsonb;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS intelligence jsonb;
ALTER TABLE microbiome_samples ADD COLUMN IF NOT EXISTS structured_data jsonb;
ALTER TABLE microbiome_samples ADD COLUMN IF NOT EXISTS notes text;
