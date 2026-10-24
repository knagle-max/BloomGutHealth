import {decryptPrecision} from "../server/precision-crypto";
import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {readFileSync} from "node:fs";
import {randomBytes} from "node:crypto";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {PrecisionStorage} from "../server/precision-storage";
import {registerPrecisionRoutes} from "../server/precision-routes";
import {parseLabPaste} from "../shared/lab-paste";
test("lab unit confirmation is authenticated, encrypted, owner-bound and transactionally idempotent",async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 const pg=new PGlite();await pg.exec("CREATE TABLE users (id varchar PRIMARY KEY, dietary_preferences jsonb); INSERT INTO users(id) VALUES ('a'),('b');");await pg.exec(readFileSync(new URL("../migrations/0002_precision_nutrition.sql",import.meta.url),"utf8"));
 const store=new PrecisionStorage(drizzle(pg) as any),app=express();app.use(express.json());app.use((req,_res,next)=>{(req as any).session={userId:req.headers['x-user']};next();});
 registerPrecisionRoutes(app,(req,res,next)=>req.session.userId?next():void res.status(401).json({error:"Sign in"}),store as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const address=server.address() as any;
 const request=async(path:string,body:any,user="a")=>{const res=await fetch(`http://127.0.0.1:${address.port}/api/precision${path}`,{method:"POST",headers:{"content-type":"application/json","x-user":user},body:JSON.stringify(body)});return{status:res.status,data:await res.json()};};
 try{
  const payload=parseLabPaste("LDL, 120","2026-10-01T12:00:00.000Z","Synthetic lab").pending[0].payload;
  assert.equal((await request('/records',{kind:'lab',payload},'')).status,401);
  const source=await request('/records',{kind:'lab',payload});assert.equal(source.status,201);
  const endpoint=`/labs/${source.data.id}/confirm-unit`;
  assert.equal((await request(endpoint,{unit:'mg/dL'},'b')).status,404);
  assert.equal((await request(endpoint,{unit:'U/L'})).status,400);
  assert.equal((await request('/records',{kind:'lab',payload:{...payload,unitReview:{...payload.unitReview,status:'confirmed',confirmedAt:new Date().toISOString()}}})).status,400);
  const [a,b]=await Promise.all([request(endpoint,{unit:'mg/dL'}),request(endpoint,{unit:'mg/dL'})]);
  assert.ok([200,201].includes(a.status));assert.ok([200,201].includes(b.status));assert.equal(a.data.id,b.data.id);
  assert.equal(a.data.payload.value,120);assert.equal(a.data.payload.unit,'mg/dL');assert.equal(a.data.payload.unitReview.originalValue,120);
  assert.equal(a.data.payload.unitReview.supersedes,source.data.id);assert.ok(a.data.payload.unitReview.confirmedAt);
  const retry=await request(endpoint,{unit:'mg/dL'});assert.equal(retry.data.id,a.data.id);
  assert.equal((await store.getPrecisionRecords('a')).length,2);assert.equal((await store.getPrecisionRecords('b')).length,0);
  const raw=await pg.query('SELECT encrypted_payload FROM precision_records');for(const row of raw.rows as any[]){const envelope=row.encrypted_payload;assert.ok([1,2].includes(envelope.version));assert.ok(Object.keys(envelope).every(key=>['version','keyId','iv','tag','ciphertext'].includes(key)));assert.equal(Object.hasOwn(envelope,'value'),false);assert.equal((decryptPrecision(envelope,'a') as any).value,120);assert.throws(()=>decryptPrecision(envelope,'b'));}
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
