import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { ExperienceStorage } from "../server/experience-storage";
import { experienceSettingsSchema, experienceEntrySchema } from "../shared/experience";
test("experience migration, encrypted persistence, mode isolation and owner-scoped updates/deletion survive reload",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 try{await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");const sql=readFileSync(new URL("../migrations/0004_experience.sql",import.meta.url),"utf8");await pg.exec(sql);await pg.exec(sql);const store=new ExperienceStorage(drizzle(pg) as any);
 assert.equal((await store.getExperienceSettings("a")).mode,"everyday");await store.putExperienceSettings("a",{mode:"athlete"});await store.putExperienceSettings("a",{practical:experienceSettingsSchema.parse({practical:{minutes:15}}).practical});assert.equal((await store.getExperienceSettings("a")).mode,"athlete");assert.equal((await store.getExperienceSettings("b")).mode,"everyday");
 const entry=experienceEntrySchema.parse({kind:"session",payload:{title:"Private session",startsAt:"2026-10-18T18:00:00Z",minutes:90,intensity:"hard",discipline:"endurance"}});const row=await store.insertExperienceRecord("a",entry);assert.equal((await store.getExperienceRecords("b")).length,0);assert.equal(await store.updateExperienceRecord("b",row.id,entry),null);assert.equal(await store.deleteExperienceRecord("b",row.id),false);
 const raw=await pg.query<any>("SELECT encrypted_payload FROM experience_records WHERE user_id='a'");assert.equal(JSON.stringify(raw.rows).includes("Private session"),false);
 const check=experienceEntrySchema.parse({kind:"checkin",payload:{mode:"athlete",date:"2026-10-18",energy:5,hunger:5,digestion:5,sleepHours:7,adherence:3}});await store.insertExperienceRecord("a",check);await store.insertExperienceRecord("a",{...check,payload:{...check.payload,energy:8}});assert.equal((await store.getExperienceRecords("a","checkin")).length,1);const reload=new ExperienceStorage(drizzle(pg) as any);assert.equal((await reload.getExperienceRecords("a")).length,2);
 await store.insertExperienceRecord("b",entry);await store.clearExperienceData("a");assert.equal((await store.getExperienceRecords("a")).length,0);assert.equal((await store.getExperienceSettings("a")).mode,"everyday");assert.equal((await store.getExperienceRecords("b")).length,1);
 await pg.exec("DELETE FROM users WHERE id='b'");assert.equal((await pg.query<any>("SELECT count(*)::int AS n FROM experience_records")).rows[0].n,0);
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
