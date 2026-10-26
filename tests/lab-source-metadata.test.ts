import test from 'node:test';
import assert from 'node:assert/strict';
import {labSchema} from '../shared/precision-nutrition';
import {parseLabPaste} from '../shared/lab-paste';
const date='2026-10-15T12:00:00Z';
test('lab reader accepts exact optional reported heading and row order without inventing taxonomy or changing legacy payloads',()=>{
 const original=structuredClone(parseLabPaste('LDL, 3.20, mmol/L',date).valid[0].payload);
 delete original.sourceInput!.reportedSection;delete original.sourceInput!.rowOrder;
 assert.equal(Object.hasOwn(original.sourceInput!,'reportedSection'),false);assert.equal(Object.hasOwn(original.sourceInput!,'rowOrder'),false);
 const input={...original,sourceInput:{...original.sourceInput,reportedSection:'  [ LIPIDS & CARDIOVASCULAR — source label ]  ',rowOrder:12}};
 const read=labSchema.parse(input);assert.deepEqual(read,input);assert.equal(read.marker,original.marker);assert.equal(read.value,3.2);assert.equal(read.sourceInput?.number,'3.20');
 for(const bad of [{rowOrder:-1},{rowOrder:1.5},{rowOrder:30001},{reportedSection:'x'.repeat(1001)},{canonicalCategory:'invented interpretation'}])assert.equal(labSchema.safeParse({...input,sourceInput:{...input.sourceInput,...bad}}).success,false);
 assert.deepEqual(labSchema.parse(original),original);
});

test('encrypted lab source metadata survives authenticated save, source-unit confirmation, reload and owner isolation',async()=>{
 const express=(await import('express')).default;const {PGlite}=await import('@electric-sql/pglite');const {drizzle}=await import('drizzle-orm/pglite');const {readFileSync}=await import('node:fs');const{randomBytes}=await import('node:crypto');const {PrecisionStorage}=await import('../server/precision-storage');const {registerPrecisionRoutes}=await import('../server/precision-routes');const {decryptPrecision}=await import('../server/precision-crypto');
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
 const store=new PrecisionStorage(drizzle(pg) as any),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')} as any;next();});registerPrecisionRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401)) as any,store as any);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 const request=async(path:string,body:unknown,user='a')=>{const res=await fetch(`http://127.0.0.1:${(server.address() as any).port}/api/precision${path}`,{method:'POST',headers:{'content-type':'application/json','x-user':user},body:JSON.stringify(body)});return {status:res.status,body:await res.json().catch(()=>null)};};
 try{
  const pending=parseLabPaste('LDL, 120',date).pending[0].payload;const payload={...pending,sourceInput:{...pending.sourceInput,reportedSection:'[ UNKNOWN ORIGINAL GROUP ]',rowOrder:4}};
  assert.equal((await request('/records',{kind:'lab',payload},'')).status,401);const saved=await request('/records',{kind:'lab',payload});assert.equal(saved.status,201);assert.deepEqual(saved.body.payload.sourceInput,payload.sourceInput);
  const endpoint=`/labs/${saved.body.id}/confirm-unit`;assert.equal((await request(endpoint,{unit:'mg/dL'},'b')).status,404);const confirmed=await request(endpoint,{unit:'mg/dL'});assert.equal(confirmed.status,201);assert.deepEqual(confirmed.body.payload.sourceInput,payload.sourceInput);assert.equal(confirmed.body.payload.value,120);assert.equal(confirmed.body.payload.unitReview.supersedes,saved.body.id);
  const own=await store.getPrecisionRecords('a');assert.equal(own.length,2);for(const row of own)assert.deepEqual((row.payload as any).sourceInput,payload.sourceInput);assert.equal((await store.getPrecisionRecords('b')).length,0);
  const encrypted=await pg.query('SELECT encrypted_payload FROM precision_records');for(const row of encrypted.rows as any[]){assert.equal(JSON.stringify(row.encrypted_payload).includes('UNKNOWN ORIGINAL'),false);assert.deepEqual((decryptPrecision(row.encrypted_payload,'a') as any).sourceInput,payload.sourceInput);assert.throws(()=>decryptPrecision(row.encrypted_payload,'b'));}
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
