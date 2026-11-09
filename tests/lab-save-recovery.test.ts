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
test("laboratory retries are durable, encrypted, owner-bound and reject a reused key with different source values",async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 const pg=new PGlite();await pg.exec("CREATE TABLE users (id varchar PRIMARY KEY, dietary_preferences jsonb); INSERT INTO users(id) VALUES ('a'),('b');");await pg.exec(readFileSync(new URL("../migrations/0002_precision_nutrition.sql",import.meta.url),"utf8"));
 const store=new PrecisionStorage(drizzle(pg) as any),app=express();app.use(express.json());app.use((req,_res,next)=>{(req as any).session={userId:req.headers['x-user']};next();});
 registerPrecisionRoutes(app,(req,res,next)=>req.session.userId?next():void res.status(401).json({error:"Sign in"}),store as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const address=server.address() as any;
 const post=async(body:unknown,key:string,user="a")=>{const res=await fetch(`http://127.0.0.1:${address.port}/api/precision/records`,{method:"POST",headers:{"content-type":"application/json","x-user":user,"Idempotency-Key":key},body:JSON.stringify(body)});return{status:res.status,data:await res.json()};};
 try{
  const payload=parseLabPaste("LDL, 120","2026-10-01T12:00:00Z","Synthetic retry source").pending[0].payload;
  const body={kind:"lab",payload};
  assert.equal((await post(body,"lab-retry-001","")).status,401);
  assert.equal((await post(body,"bad key")).status,400);
  const first=await post(body,"lab-retry-001");assert.equal(first.status,201);
  // A new storage instance represents a restarted process retaining only the database.
  const restarted=new PrecisionStorage(drizzle(pg) as any);
  const retry=await restarted.insertPrecisionRecord("a","lab",first.data.payload,"lab-retry-001");assert.equal(retry.id,first.data.id);
  const [a,b]=await Promise.all([post(body,"lab-retry-001"),post(body,"lab-retry-001")]);assert.equal(a.data.id,b.data.id);assert.equal(a.data.id,first.data.id);
  assert.equal((await post({kind:"lab",payload:{...payload,value:121,unitReview:{...payload.unitReview,originalValue:121}}},"lab-retry-001")).status,409);
  const other=await post(body,"lab-retry-001","b");assert.equal(other.status,201);assert.notEqual(other.data.id,first.data.id);
  const separate=await post(body,"lab-retry-002");assert.equal(separate.status,201);assert.notEqual(separate.data.id,first.data.id);
  const manual=await post({kind:"lab",payload:{...payload,method:"Synthetic assay",fasting:"yes",sourceInput:{...payload.sourceInput,capture:"manual-report"}}},"manual-source-001");assert.equal(manual.status,201);assert.equal(manual.data.payload.sourceInput.capture,"manual-report");assert.equal(manual.data.payload.method,"Synthetic assay");assert.equal(manual.data.payload.unitReview.status,"pending");
  assert.equal((await store.getPrecisionRecords("a")).length,3);assert.equal((await store.getPrecisionRecords("b")).length,1);
  assert.equal(retry.payload.unitReview.originalValue,120);assert.equal(retry.payload.unitReview.status,"pending");assert.equal(retry.payload.sourceInput.suppliedUnit,null);
  const raw=await pg.query("SELECT encrypted_payload FROM precision_records");assert.ok(raw.rows.every((r:any)=>!JSON.stringify(r).includes("Synthetic retry source")));
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
