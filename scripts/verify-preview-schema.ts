import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {schemaReadinessAudit} from '../server/schema-readiness';
// This verifier never applies migrations. Its only permitted target is the explicit
// isolated PR URL supplied by the CI schema-only branch action.
assert.equal(process.env.BLOOM_SMOKE_ISOLATED,'true');
assert.ok(process.env.DATABASE_URL_UNPOOLED);
const pool=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED,max:1});
try {
 const result=await schemaReadinessAudit(pool);
 console.log(JSON.stringify(result));
 assert.equal(result.status,'catalog-ready','Required application schema is incomplete; do not qualify this deployment');
} finally {await pool.end();}
