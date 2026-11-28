import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PrecisionStorage} from '../server/precision-storage';
import {encryptPrecision} from '../server/precision-crypto';
import {precisionRecords} from '../shared/schema';
import {buildPrecisionReport,contextSchema,labSchema,sourceOnlyLabSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
const measuredAt='2026-10-15T12:00:00Z';
const source=sourceOnlyLabSchema.parse({sourceOnly:true,reportedAnalyte:'Hemoglobin',reportedValue:'0',reportedUnit:'g/dL',reportedReferenceInterval:'12–16',measuredAt,laboratory:'Synthetic laboratory',method:'unknown',fasting:'unknown',sourceInput:{text:'Hemoglobin, 0, g/dL, 12–16',number:'0',suppliedUnit:'g/dL',capture:'pasted-report',reportedSection:'Original CBC',rowOrder:3}});
const audit={version:1 as const,supersedes:'raw',previousRevision:'a'.repeat(64),reviewedAt:'2026-11-09T12:00:00Z',reason:'Reviewed against original report',requestFingerprint:'b'.repeat(64),original:{kind:'source-only' as const,reportedAnalyte:source.reportedAnalyte,reportedValue:source.reportedValue,reportedUnit:source.reportedUnit,reportedReferenceInterval:source.reportedReferenceInterval!,referenceLow:null,referenceHigh:null,method:source.method}};
const reviewed=labSchema.parse({marker:'hemoglobin',value:0,unit:'g/dL',measuredAt,laboratory:source.laboratory,method:source.method,fasting:source.fasting,referenceLow:12,referenceHigh:16,sourceInput:source.sourceInput,sourceCorrection:audit});
test('source-review reader retains original facts, promotes only an explicit revision and traverses owned source ancestry',()=>{
 const records=[{id:'raw',kind:'lab',payload:source,createdAt:measuredAt},{id:'reviewed',kind:'lab',payload:reviewed,createdAt:measuredAt}];
 const report=buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null);
 assert.equal(report.sourceOnlyLabs.length,0);assert.equal(report.labHistory.length,1);
 assert.equal(report.labHistory[0].value,0);assert.equal(report.trends[0].points[0].value,0);
 assert.deepEqual(report.trends[0].points[0].supersededIds,['raw']);
 assert.deepEqual(report.trends[0].points[0].sourceCorrection,audit);
 assert.deepEqual(report.labHistory[0].sourceInput,source.sourceInput);
 assert.equal(buildPrecisionReport(records.slice(0,1),contextSchema.parse({}),defaultPreferences,null).sourceOnlyLabs.length,1,'A new catalog alone never silently promotes historical source-only data');
 for(const invalid of [{supersedes:''},{previousRevision:'bad'},{reason:' '},{original:{...audit.original,referenceLow:-1}}])assert.equal(labSchema.safeParse({...reviewed,sourceCorrection:{...audit,...invalid}}).success,false);
 assert.deepEqual(records[0].payload,source);
});
test('reader-first encrypted review ancestry is account-scoped, grouped as one logical result and deleted together',async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
 const db=drizzle(pg),store=new PrecisionStorage(db as any);
 try{
  for(const [id,payload]of [['raw',source],['reviewed',reviewed]] as const)await db.insert(precisionRecords).values({id,userId:'a',kind:'lab',encryptedPayload:encryptPrecision(payload,'a')});
  const groups=await store.getLabSources('a');assert.equal(groups.length,1);assert.equal(groups[0].results,1);assert.equal(groups[0].records,2);
  assert.equal((await store.getLabSources('b')).length,0);
  await assert.rejects(()=>store.insertPrecisionRecord('a','lab',reviewed));
  await store.deleteLabEntry('b','reviewed');assert.equal((await store.getPrecisionRecords('a')).length,2);
  await assert.rejects(()=>store.deleteLabEntry('a','raw'),/LAB_SOURCE_CHANGED/);
  await store.deleteLabEntry('a','reviewed');assert.equal((await store.getPrecisionRecords('a')).length,0);
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
