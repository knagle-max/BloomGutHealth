/** Core legacy FK graph for isolated tests using the production deletion path. */
export const reportDerivedTablesSql=`
CREATE TABLE metabolites(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),bacterial_id varchar REFERENCES bacterial_composition(id),metabolite_name text NOT NULL,pathway_id text,predicted_concentration real,confidence real,production_genes text[]);
CREATE TABLE health_impacts(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),metabolite_id varchar NOT NULL REFERENCES metabolites(id),impact_category text NOT NULL,impact_description text NOT NULL,impact_score real,evidence_level text,affected_systems text[],mechanism_of_action text);
CREATE TABLE recommendations(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),analysis_id varchar REFERENCES ml_analyses(id),recommendation_type text NOT NULL,category text NOT NULL,item_name text NOT NULL,reasoning text NOT NULL,details text,priority integer,expected_impact real,target_bacteria text[],target_metabolites text[],is_active boolean NOT NULL DEFAULT true,created_at timestamp NOT NULL DEFAULT now());`;
/** Opaque independent records in canonical category tables; their interpretation
 * and encryption keys are deliberately irrelevant to report deletion. */
export const reportIndependentTablesSql=`
CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar REFERENCES users(id),meal_text text NOT NULL,meal_type text,logged_at timestamp DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);
CREATE TABLE precision_records(id varchar PRIMARY KEY,user_id varchar REFERENCES users(id),kind text NOT NULL,encrypted_payload jsonb NOT NULL,created_at timestamp DEFAULT now());
CREATE TABLE experience_records(id varchar PRIMARY KEY,user_id varchar REFERENCES users(id),kind text NOT NULL,encrypted_payload jsonb NOT NULL,created_at timestamp DEFAULT now(),updated_at timestamp DEFAULT now());
INSERT INTO meals(id,user_id,meal_text) SELECT 'kept-meal',id,'Synthetic journal entry' FROM users ORDER BY id LIMIT 1;
INSERT INTO precision_records(id,user_id,kind,encrypted_payload) SELECT 'kept-lab',id,'lab','{"opaqueSynthetic":"lab"}' FROM users ORDER BY id LIMIT 1;
INSERT INTO precision_records(id,user_id,kind,encrypted_payload) SELECT 'kept-genetics',id,'genetics','{"opaqueSynthetic":"genetics"}' FROM users ORDER BY id LIMIT 1;
INSERT INTO experience_records(id,user_id,kind,encrypted_payload) SELECT 'kept-athlete',id,'session','{"opaqueSynthetic":"athlete"}' FROM users ORDER BY id LIMIT 1;`;
export const independentReportRecordIdsSql='SELECT id FROM meals UNION ALL SELECT id FROM precision_records UNION ALL SELECT id FROM experience_records';
