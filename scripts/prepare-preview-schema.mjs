import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Pool} from 'pg';
// Only the explicitly isolated PR branch. Never run implicitly against app/production URLs.
assert.equal(process.env.BLOOM_SMOKE_ISOLATED,'true');
assert.ok(process.env.DATABASE_URL_UNPOOLED);
const pool=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED,max:1});
try {await pool.query(await readFile(new URL('../migrations/0007_health_sources.sql',import.meta.url),'utf8'));console.log('Applied additive dormant health-source migration to isolated preview.');}finally{await pool.end();}
