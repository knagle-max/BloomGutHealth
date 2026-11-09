import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrecisionStorage } from '../server/precision-storage';
import { registerPrecisionRoutes } from '../server/precision-routes';
import { buildPrecisionReport, contextSchema } from '../shared/precision-nutrition';
import { defaultPreferences } from '../shared/meal-intelligence';
import { parseLabPaste } from '../shared/lab-paste';

test('explicit logical lab deletion is atomic, owned, idempotent and cannot resurrect unit revisions', async () => {
  const previous = process.env.PRECISION_DATA_KEY;
  process.env.PRECISION_DATA_KEY = randomBytes(32).toString('base64');
  const pg = new PGlite();
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql', import.meta.url), 'utf8'));
  const store = new PrecisionStorage(drizzle(pg) as any), app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { userId: req.get('x-user') } as any; next(); });
  registerPrecisionRoutes(app, ((req: any, res: any, next: any) => req.session.userId ? next() : res.sendStatus(401)) as any, store as any);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}/api/precision`;
  const del = (id: string, user = 'a', confirm = 'delete-lab-entry-and-revisions') => fetch(`${base}/labs/${id}/entry`, { method: 'DELETE', headers: { ...(user ? { 'x-user': user } : {}), 'x-bloom-confirm': confirm } });
  const pending = parseLabPaste('LDL, 120', '2026-10-15T12:00:00Z').pending[0].payload;
  const report = async () => buildPrecisionReport(await store.getPrecisionRecords('a'), contextSchema.parse({}), defaultPreferences, null);
  const pair = async () => {
    const original = await store.insertPrecisionRecord('a', 'lab', pending);
    const confirmed = await store.insertPrecisionRecord('a', 'lab', { ...pending, unit: 'mg/dL', unitReview: { ...pending.unitReview!, status: 'confirmed', confirmedAt: '2026-10-16T12:00:00Z', supersedes: original.id } });
    return { original, confirmed };
  };
  try {
    // The generic row-only API must not bypass logical lineage deletion.
    const legacy = await pair();
    await assert.rejects(store.deletePrecisionRecord('a', legacy.confirmed.id), /LAB_LOGICAL_DELETE_REQUIRED/);
    assert.equal((await fetch(`${base}/records/${legacy.confirmed.id}`,{method:'DELETE',headers:{'x-user':'a'}})).status,409);
    assert.equal((await report()).pendingLabs.some(row => row.id === legacy.original.id), false);
    await store.deleteLabEntry('a', legacy.confirmed.id);
    const { original, confirmed } = await pair();
    const other = await store.insertPrecisionRecord('a', 'lab', parseLabPaste('ALT, 20, U/L', '2026-10-15T12:00:00Z').valid[0].payload);
    const foreign = await store.insertPrecisionRecord('b', 'lab', pending);
    const plan = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    assert.equal((await del(confirmed.id, '')).status, 401);
    assert.equal((await del(confirmed.id, 'a', '')).status, 400);
    assert.equal((await del(confirmed.id, 'a', 'delete-precision-data')).status, 400);
    assert.equal((await del(confirmed.id, 'b')).status, 204);
    assert.equal((await del(original.id)).status, 409, 'Stale pending target cannot erase a newly confirmed result');
    assert.equal((await store.getPrecisionRecords('a')).length, 4);
    assert.equal((await del(confirmed.id)).status, 204);
    assert.equal((await del(confirmed.id)).status, 204, 'Lost-response retry is harmless');
    const remaining = await store.getPrecisionRecords('a');
    assert.deepEqual(new Set(remaining.map(row => row.id)),new Set([other.id,plan.id]));
    assert.equal(remaining.some(row => row.id === plan.id), true,'Unknown-lineage history remains historical instead of being blanket-erased');
    assert.equal((await report()).pendingLabs.length, 0, 'Original pending source cannot reappear');
    assert.deepEqual((await store.getPrecisionRecords('b')).map(row => row.id), [foreign.id]);
    const saved = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    const pendingOnly = await store.insertPrecisionRecord('a', 'lab', pending);
    await store.deleteLabEntry('a', pendingOnly.id);
    const raw = await store.insertPrecisionRecord('a', 'lab', { sourceOnly: true, reportedAnalyte: 'Unknown assay', reportedValue: '<0.6', reportedUnit: null, measuredAt: '2026-10-15T12:00:00Z', laboratory: 'Unknown', method: 'Unknown', fasting: 'unknown', sourceInput: { text: 'Unknown assay, <0.6', number: '<0.6', suppliedUnit: null, capture: 'pasted-report' } });
    await store.deleteLabEntry('a', raw.id);
    assert.ok((await store.getPrecisionRecords('a')).some(row => row.id === saved.id), 'Nonclinical source deletion preserves plans');
    const malformed = await store.insertPrecisionRecord('a', 'lab', { unrecognized: true });
    assert.equal((await del(other.id)).status, 409);
    assert.equal((await store.getPrecisionRecords('a')).length, 4, 'Unclassified lineage causes no partial deletion');
    await store.deletePrecisionRecord('a', malformed.id);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pg.close();
    if (previous === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = previous;
  }
});

test('whole laboratory source deletion follows import provenance, protects revisions and preserves independent sources',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id)VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));const store=new PrecisionStorage(drizzle(pg)as any),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerPrecisionRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store as any);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address()as any).port}/api/precision/labs/sources`;
 const provenance={importId:'11111111-1111-4111-8111-111111111111',enteredDate:'2026-10-15'};
 const payload=parseLabPaste('ALT,20,U/L','2026-10-15T12:00:00Z').valid[0].payload;
 const del=(id:string,revision:string,owner='a',confirm='delete-lab-source',actor=owner)=>fetch(base+'/'+id,{method:'DELETE',headers:{'content-type':'application/json','x-user':owner,'X-Bloom-Labs-Actor':actor,'X-Bloom-Confirm':confirm},body:JSON.stringify({revision,confirmed:true})});
 try{
  const one=await store.insertPrecisionRecord('a','lab',{...payload,sourceReport:provenance});const pending=parseLabPaste('LDL,120','2026-10-15T12:00:00Z').pending[0].payload;const root=await store.insertPrecisionRecord('a','lab',{...pending,sourceReport:provenance});const fixed=await store.insertPrecisionRecord('a','lab',{...pending,sourceReport:provenance,unit:'mg/dL',unitReview:{...pending.unitReview!,status:'confirmed',confirmedAt:'2026-10-16T12:00:00Z',supersedes:root.id}});
  const independent=await store.insertPrecisionRecord('a','lab',payload);const foreign=await store.insertPrecisionRecord('b','lab',{...payload,sourceReport:provenance});const unrelated=await store.insertPrecisionRecord('a','genetics',{legacy:true});const ownPlan=await store.insertPrecisionRecord('a','plan',{type:'historical-other-plan'});
  let sources=await store.getLabSources('a');assert.equal(sources.length,2);const group=sources.find(s=>s.scope==='report')!;assert.equal(group.results,2);assert.equal(group.records,3);
  assert.equal((await del(group.id,group.revision,'a','')).status,400);assert.equal((await del(group.id,group.revision,'a','delete-lab-source','b')).status,409);assert.equal((await del(group.id,group.revision,'b')).status,204);assert.equal((await store.getLabSources('a')).length,2);
  const added=await store.insertPrecisionRecord('a','lab',{...payload,value:21,sourceReport:provenance});assert.equal((await del(group.id,group.revision)).status,409);sources=await store.getLabSources('a');const fresh=sources.find(s=>s.id===group.id)!;assert.equal(fresh.records,4);assert.equal(fresh.results,3);
  // Persist an existing historical weekly-plan shape directly: only explicit input lineage is relevant to deletion.
  const{encryptPrecision}=await import('../server/precision-crypto');await pg.query('INSERT INTO precision_records(id,user_id,kind,encrypted_payload)VALUES($1,$2,$3,$4)',['dependent','a','plan',encryptPrecision({type:'weekly-plan',inputGuard:{sourceRecordIds:[one.id]}},'a')]);await pg.query('INSERT INTO precision_records(id,user_id,kind,encrypted_payload)VALUES($1,$2,$3,$4)',['independent-plan','a','plan',encryptPrecision({type:'weekly-plan',inputGuard:{sourceRecordIds:[independent.id]}},'a')]);
  assert.equal((await del(fresh.id,fresh.revision)).status,204);assert.equal((await del(fresh.id,fresh.revision)).status,204);const retained=await store.getPrecisionRecords('a');assert.ok([independent.id,unrelated.id,ownPlan.id,'independent-plan'].every(id=>retained.some(r=>r.id===id)));assert.ok([one.id,root.id,fixed.id,added.id,'dependent'].every(id=>!retained.some(r=>r.id===id)));assert.equal((await store.getPrecisionRecords('b'))[0].id,foreign.id);assert.equal((await store.getLabSources('a'))[0].scope,'result');
  // A late new import with the same explicit identity changes the revision; an old delete cannot remove it.
  await store.insertPrecisionRecord('a','lab',{...payload,sourceReport:provenance});assert.equal((await del(fresh.id,fresh.revision)).status,409);
  const opaque=await store.insertPrecisionRecord('a','lab',{unrecognizedLegacy:true});const opaqueGroup=(await store.getLabSources('a')).find(s=>s.results===null)!;assert.equal(opaqueGroup.scope,'result');assert.equal(opaqueGroup.records,1);assert.equal((await del(opaqueGroup.id,opaqueGroup.revision)).status,204);assert.equal((await store.getPrecisionRecords('a')).some(r=>r.id===opaque.id),false);
  await store.insertPrecisionRecord('a','lab',{...payload,sourceReport:{...provenance,reportIdentifier:'Separate recorded source'}});assert.equal((await store.getLabSources('a')).filter(s=>s.scope==='report').length,2,'Conflicting explicit report context stays separate even with the same import ID');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
