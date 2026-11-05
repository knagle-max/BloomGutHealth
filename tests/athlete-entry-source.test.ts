import test from "node:test";
import assert from "node:assert/strict";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {randomBytes,randomUUID} from "node:crypto";
import {readFileSync} from "node:fs";
import {athleteProfileSchema,trainingSessionSchema,hydrationSchema} from "../shared/experience";
import {ExperienceStorage} from "../server/experience-storage";
const reference={version:1,capture:"athlete-reference",fields:{weightKg:{value:"154.000",unit:"lb"},energyKcal:{value:"10460.00",unit:"kJ"}}};
const sessionSource={version:1,capture:"manual-session",fields:{fluidMl:{value:"1.500",unit:"L"}}};
const hydrationSource={version:1,capture:"manual-hydration",fields:{preKg:{value:"70.000",unit:"kg"},postKg:{value:"69.00",unit:"kg"},drankMl:{value:"1.25",unit:"L"},urineMl:{value:"0.0",unit:"mL"}}};
const session={title:"Synthetic ride",startsAt:"2026-11-05T12:00:00Z",minutes:60,intensity:"easy",discipline:"endurance",fluidMl:1500};
const hydration={date:"2026-11-05",minutes:60,preKg:70,postKg:69,drankMl:1250,urineMl:0,climate:"temperate"};
test("optional Athlete source contracts preserve lexical units, integer target semantics and historical unknowns",()=>{
 assert.equal(athleteProfileSchema.parse({}).entrySource,undefined);assert.equal(trainingSessionSchema.parse(session).entrySource,undefined);assert.equal(hydrationSchema.parse(hydration).entrySource,undefined);
 assert.deepEqual(athleteProfileSchema.parse({weightKg:154/2.2046226218487757,energyKcal:2500,entrySource:reference}).entrySource,reference);
 assert.deepEqual(trainingSessionSchema.parse({...session,entrySource:sessionSource}).entrySource,sessionSource);
 assert.deepEqual(hydrationSchema.parse({...hydration,entrySource:hydrationSource}).entrySource,hydrationSource);
 assert.equal(athleteProfileSchema.parse({energyKcal:2500,entrySource:{version:1,capture:"athlete-reference",fields:{energyKcal:{value:"10460.1",unit:"kJ"}}}}).energyKcal,2500,"retain existing rounded integer target, not a new target rule");
});
test("source metadata cannot mismatch units/null/zero, invent measured fields or carry arbitrary metadata",()=>{
 for(const source of[{...sessionSource,fields:{}},{...sessionSource,filename:"PrivateCanary"},{...sessionSource,fields:{fluidMl:{value:"1.500",unit:"mL"}}},{...sessionSource,fields:{fluidMl:{value:"1e999",unit:"L"}}},{...sessionSource,fields:{fluidMl:{value:"1\n",unit:"L"}}},{...sessionSource,fields:{fluidMl:{value:"1".repeat(129),unit:"L"}}},{...sessionSource,fields:{weightKg:{value:"70",unit:"kg"}}}])assert.equal(trainingSessionSchema.safeParse({...session,entrySource:source}).success,false);
 assert.equal(trainingSessionSchema.safeParse({...session,fluidMl:null,entrySource:sessionSource}).success,false);
 assert.equal(hydrationSchema.safeParse({...hydration,entrySource:{...hydrationSource,fields:{urineMl:{value:"1e-15",unit:"mL"}}}}).success,false);
 assert.equal(athleteProfileSchema.safeParse({weightKg:70,entrySource:reference}).success,false);
 assert.equal(hydrationSchema.safeParse({...hydration,entrySource:{...hydrationSource,fields:{urineMl:{value:"1e-999",unit:"mL"}}}}).success,false);
});
test("actual encrypted experience storage round-trips original fields, preserves receipts/exports, and isolates owners without extra observations",async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL("../migrations/0004_experience.sql",import.meta.url),"utf8"));const store=new ExperienceStorage(drizzle(pg)as any);
 try{
  await store.putExperienceSettings("a",{athlete:athleteProfileSchema.parse({weightKg:154/2.2046226218487757,energyKcal:2500,entrySource:reference})});assert.deepEqual((await store.getExperienceSettings("a")).athlete.entrySource,reference);assert.equal((await store.getExperienceSettings("b")).athlete.entrySource,undefined);
  const payload=trainingSessionSchema.parse({...session,entrySource:sessionSource}),key=randomUUID();const first=await store.createSession("a",payload,key),retry=await store.createSession("a",payload,key);assert.equal(first.id,retry.id);
  await store.insertExperienceRecord("a",{kind:"hydration",payload:hydrationSchema.parse({...hydration,entrySource:hydrationSource})});
  const reloaded=await store.getExperienceRecords("a");assert.equal(reloaded.length,2);assert.deepEqual(reloaded.find(row=>row.kind==="session")?.payload.entrySource,sessionSource);assert.deepEqual(reloaded.find(row=>row.kind==="hydration")?.payload.entrySource,hydrationSource);assert.deepEqual(await store.getExperienceRecords("b"),[]);
  const exported=await store.exportExperience("a");assert.equal(exported.records.length,2);assert.deepEqual(exported.settings.athlete.entrySource,reference);
  const raw=await pg.query("SELECT encrypted_payload FROM experience_records UNION ALL SELECT encrypted_payload FROM experience_settings");assert.equal(JSON.stringify(raw.rows).includes('"entrySource"'),false);assert.equal(JSON.stringify(raw.rows).includes('"154.000"'),false);
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
