import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Pool} from 'pg';
// Only the explicitly isolated PR branch. Never run implicitly against app/production URLs.
assert.equal(process.env.BLOOM_SMOKE_ISOLATED,'true');
assert.ok(process.env.DATABASE_URL_UNPOOLED);
const pool=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED,max:1});
try {for(const file of ['0007_health_sources.sql','0008_capability_preferences.sql','0009_ai_spend_ledger.sql','0010_ai_usage_receipts.sql','0011_provider_circuits.sql','0012_feature_control_history.sql'])await pool.query(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));console.log('Applied additive support migrations to isolated preview.');}finally{await pool.end();}
