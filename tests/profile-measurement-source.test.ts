import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {eq} from "drizzle-orm";
import {readFileSync} from "node:fs";
import {randomBytes} from "node:crypto";
import {users} from "../shared/schema";
import {updateProfileWithRevision,profileRevision,ProfileRevisionConflict} from "../server/profile-source";
import {readProfileMeasurementSource,ProfileMeasurementUnavailable} from "../server/profile-measurement-source";
import {profileMeasurementWriteSchema} from "../shared/profile-measurement-source";
import {registerProfileRoutes} from "../server/profile-routes";
const ddl="CREATE TABLE users(id varchar PRIMARY KEY,username text NOT NULL,password text NOT NULL,sex text,age integer,height_cm real,weight_kg real,activity_level text,dietary_preferences jsonb);INSERT INTO users VALUES('a','a','private-password','female',30,170,65,'moderate',NULL),('b','b','private-password','female',30,170,65,'moderate',NULL)";
const fields={height:{unit:"ft-in",primary:"5",inches:"9.000"},weight:{unit:"lb",value:"150.000"}} as const;
test("Profile original entries are optional, bounded and strict; unsupported or invalid source tokens never persist",()=>{
 const valid={version:1,expectedRevision:"none",fields};assert.equal(profileMeasurementWriteSchema.safeParse(valid).success,true);
 for(const invalid of[{...valid,filename:"private"},{...valid,fields:{weight:{unit:"lb",value:"NaN"}}},{...valid,fields:{height:{unit:"ft-in",primary:"5",inches:"12"}}},{...valid,fields:{weight:{unit:"kg",value:"1".repeat(129)}}}])assert.equal(profileMeasurementWriteSchema.safeParse(invalid).success,false);
});
test("Profile source metadata updates atomically with REAL canonical values, owner isolation, revisions, encryption, legacy invalidation and missing-storage compatibility",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");await pg.exec(ddl);const db=drizzle(pg),read=async(id="a")=>(await db.select().from(users).where(eq(users.id,id)))[0];
 try{
  assert.deepEqual(await readProfileMeasurementSource(db,"a",await read()),{available:false});
  await assert.rejects(updateProfileWithRevision(db,"a",{weightKg:70},profileRevision(await read()),{version:1,expectedRevision:"none",fields:{weight:{unit:"kg",value:"70.00"}}}),ProfileMeasurementUnavailable);
  assert.equal((await read()).weightKg,65,"failed metadata write rolls back canonical change");
  await updateProfileWithRevision(db,"a",{age:31});assert.equal((await read()).age,31);
  await pg.exec(readFileSync(new URL("../migrations/0016_profile_measurement_sources.sql",import.meta.url),"utf8"));
  await updateProfileWithRevision(db,"a",{heightCm:69*2.54,weightKg:150/2.2046226218487757},profileRevision(await read()),{version:1,expectedRevision:"none",fields});
  const saved=await read(),source=await readProfileMeasurementSource(db,"a",saved);assert.ok(source.available);assert.deepEqual(source.fields,fields);assert.notEqual(source.revision,"none");
  assert.deepEqual(await readProfileMeasurementSource(db,"b",await read("b")),{available:true,revision:"none",fields:{}});
  const raw=await pg.query("SELECT encrypted_payload FROM profile_measurement_sources");assert.equal(JSON.stringify(raw.rows).includes("150.000"),false);
  await assert.rejects(updateProfileWithRevision(db,"a",{age:99},profileRevision(saved),{version:1,expectedRevision:"none",fields:{}}),ProfileRevisionConflict);assert.equal((await read()).age,31);
  await assert.rejects(updateProfileWithRevision(db,"a",{age:99},profileRevision(saved),{version:1,expectedRevision:source.revision,fields:{weight:{unit:"kg",value:"99"}}}));assert.equal((await read()).age,31);
  await updateProfileWithRevision(db,"a",{age:32});assert.deepEqual(await readProfileMeasurementSource(db,"a",await read()),source,"unrelated changes preserve provenance");
  await updateProfileWithRevision(db,"a",{weightKg:80});await updateProfileWithRevision(db,"a",{weightKg:saved.weightKg});const cleared=await readProfileMeasurementSource(db,"a",await read());assert.ok(cleared.available);assert.equal(cleared.fields.weight,undefined,"legacy round trip cannot resurrect old origins");assert.deepEqual(cleared.fields.height,fields.height);
  await pg.exec("DELETE FROM users WHERE id='a'");assert.equal((await pg.query("SELECT * FROM profile_measurement_sources")).rows.length,0);
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
test("actual Profile HTTP source capture requires canonical revision, rejects stale/other-owner/mismatched updates, reads originals without password",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");await pg.exec(ddl);await pg.exec(readFileSync(new URL("../migrations/0016_profile_measurement_sources.sql",import.meta.url),"utf8"));const db=drizzle(pg);
 const store:any={getUser:async(id:string)=>(await db.select().from(users).where(eq(users.id,id)))[0],getProfileMeasurementSource:(id:string,p:any)=>readProfileMeasurementSource(db,id,p),updateUserProfile:(id:string,p:any,r?:string,s?:any)=>updateProfileWithRevision(db,id,p,r,s)};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get("x-user")}as any;next();});registerProfileRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),store);
 const server=app.listen(0,"127.0.0.1");await new Promise<void>(resolve=>server.once("listening",resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const request=(method="GET",body?:unknown,revision?:string,user="a",target="a")=>fetch(base+(method==="GET"?"/api/profile":`/api/user/${target}/profile`),{method,headers:{"content-type":"application/json","x-user":user,...(revision?{"If-Match":`"${revision}"`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 try{
  const first=await(await request()).json();assert.equal(first.password,undefined);assert.deepEqual(first.measurementSource,{available:true,revision:"none",fields:{}});
  const payload={weightKg:150/2.2046226218487757,measurementSource:{version:1,expectedRevision:"none",fields:{weight:fields.weight}}};
  assert.equal((await request("PATCH",payload)).status,400);assert.equal((await request("PATCH",payload,first.profileRevision,"a","b")).status,403);
  assert.equal((await request("PATCH",payload,first.profileRevision)).status,200);const saved=await(await request()).json();assert.deepEqual(saved.measurementSource.fields.weight,fields.weight);
  assert.equal((await request("PATCH",payload,saved.profileRevision)).status,409);
  const retyped={weightKg:saved.weightKg,measurementSource:{version:1,expectedRevision:saved.measurementSource.revision,fields:{weight:{unit:"lb",value:"150.0"}}}};
  assert.equal((await request("PATCH",retyped,saved.profileRevision)).status,200);
  const sameCanonical=await(await request()).json();assert.equal(sameCanonical.profileRevision,saved.profileRevision);assert.notEqual(sameCanonical.measurementSource.revision,saved.measurementSource.revision);
  assert.equal((await request("PATCH",retyped,saved.profileRevision)).status,409,"source-only concurrent changes remain fenced even with unchanged canonical revision");

  assert.equal((await request("PATCH",{weightKg:80,measurementSource:{...payload.measurementSource,expectedRevision:sameCanonical.measurementSource.revision}},saved.profileRevision)).status,400);
  assert.equal((await(await request("GET",undefined,undefined,"b")).json()).measurementSource.revision,"none");
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
