CREATE TABLE IF NOT EXISTS nutrition_products (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 encrypted_payload jsonb NOT NULL,
 created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nutrition_products_user_idx ON nutrition_products(user_id);
