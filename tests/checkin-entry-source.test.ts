import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {readFileSync} from "node:fs";
import {randomBytes} from "node:crypto";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {checkinSchema} from "../shared/precision-nutrition";
import {checkinEntrySourceSchema} from "../shared/checkin-entry-source";
import {PrecisionStorage} from "../server/precision-storage";
import {registerPrecisionRoutes} from "../server/precision-routes";
const source={version:1,capture:"manual-checkin",fields:{weight:{value:"220.000",unit:"lb"},waist:{value:"36.00",unit:"in"},bodyFatPercent:{value:"25.00",unit:"%"},bloating:{value:"0",unit:"0-10"},energy:{value:"7",unit:"0-10"},adherencePercent:{value:"0.0",unit:"%"}}};
const canonical={measuredAt:"2026-10-01T12:00:00Z",weightKg:220/2.2046226218487757,waistCm:36*2.54,bodyFatPercent:25,bloating:0,energy:7,adherencePercent:0,planId:null,notes:"Synthetic body source"};
test("optional original body entry text/units retain precision and zero ratings without changing older canonical records",()=>{
 const older=checkinSchema.parse(canonical),newer=checkinSchema.parse({...canonical,entrySource:source});
 assert.equal(older.entrySource,undefined);assert.deepEqual(newer.entrySource,source);
 const{entrySource,...values}=newer;assert.deepEqual(values,older);
 assert.equal(newer.bloating,0);assert.equal(newer.adherencePercent,0);
 assert.equal(newer.entrySource!.fields.weight!.value,"220.000");
});
test("source metadata cannot invent null observations, mismatch conversions or inject other fields",()=>{
 for(const entrySource of[
  {...source,fields:{weight:{value:"221",unit:"lb"}}},
  {...source,fields:{waist:{value:"36",unit:"cm"}}},
  {...source,fields:{energy:{value:"8",unit:"0-10"}}},
  {...source,fields:{adherencePercent:{value:"0.00000000001",unit:"%"}}},
  {...source,fields:{weight:{value:"220",unit:"unknown"}}},
  {...source,fields:{weight:{value:"220\n",unit:"lb"}}},
  {...source,fields:{weight:{value:"PrivateCanaryValue",unit:"lb"}}},
  {...source,fields:{weight:{value:"1e999",unit:"lb"}}},
  {...source,fields:{}},
  {...source,originalFilename:"not-allowed"},
 ])assert.equal(checkinSchema.safeParse({...canonical,entrySource}).success,false);
 assert.equal(checkinSchema.safeParse({...canonical,weightKg:null,entrySource:source}).success,false);
 assert.equal(checkinSchema.safeParse({...canonical,weightKg:1e-12,entrySource:{...source,fields:{weight:{value:"0.000000000000001",unit:"kg"}}}}).success,false);
 assert.equal(checkinEntrySourceSchema.safeParse({...source,fields:{weight:{value:"1".repeat(129),unit:"kg"}}}).success,false);
});
test("actual authenticated HTTP and encrypted SQL preserve original entries on reload and isolate another owner",async()=>{
 const pg=new PGlite(),previousKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 let server:ReturnType<typeof express.application.listen>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL("../migrations/0002_precision_nutrition.sql",import.meta.url),"utf8"));
  const store=new PrecisionStorage(drizzle(pg) as any),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get("x-user")}as any;next();});
  registerPrecisionRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),{getPrecisionRecords:store.getPrecisionRecords.bind(store),insertPrecisionRecord:store.insertPrecisionRecord.bind(store),getPrecisionContext:store.getPrecisionContext.bind(store),getUser:async(id:string)=>({id}),getUserSamples:async()=>[],getMeals:async()=>[]}as any);
  server=app.listen(0,"127.0.0.1");await new Promise<void>(resolve=>server!.once("listening",resolve));const base=`http://127.0.0.1:${(server.address()as any).port}/api/precision`;
  const response=await fetch(base+"/records",{method:"POST",headers:{"content-type":"application/json","x-user":"a"},body:JSON.stringify({kind:"checkin",payload:{...canonical,entrySource:source}})});assert.equal(response.status,201);
  const saved=await(await fetch(base,{headers:{"x-user":"a"}})).json();assert.deepEqual(saved.checkins[0].entrySource,source);
  const other=await(await fetch(base,{headers:{"x-user":"b"}})).json();assert.deepEqual(other.checkins,[]);
  const raw=await pg.query("SELECT encrypted_payload FROM precision_records");assert.equal(JSON.stringify(raw.rows).includes('"entrySource"'),false);assert.equal(JSON.stringify(raw.rows).includes('"220.000"'),false);
 }finally{if(server){server.closeAllConnections();await new Promise<void>(resolve=>server!.close(()=>resolve()));}await pg.close();if(previousKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previousKey;}
});
