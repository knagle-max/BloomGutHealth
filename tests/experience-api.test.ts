import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { ExperienceStorage } from "../server/experience-storage";
import { registerExperienceRoutes } from "../server/experience-routes";
import { registerPrecisionRoutes } from "../server/precision-routes";
import { contextSchema } from "../shared/precision-nutrition";
import { preferenceSchema } from "../shared/meal-intelligence";
import { analyzeMeal } from "../server/meal-intelligence";
test("experience HTTP routes enforce auth, mode gates, strict settings, owner-scoped templates, validation and private exports",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL("../migrations/0004_experience.sql",import.meta.url),"utf8"));
 const experience=new ExperienceStorage(drizzle(pg) as any),meals:any[]=[];
 const store:any={getPrecisionContext:async()=>contextSchema.parse({ageGroup:"adult",pregnancy:"no",safetyReviewed:true}),getPrecisionRecords:async()=>[],getUser:async(id:string)=>({id,age:35,sex:"male",heightCm:175,weightKg:70,activityLevel:"active",dietaryPreferences:preferenceSchema.parse({})}),getUserSamples:async()=>[],getMeals:async(id:string)=>meals.filter(m=>m.userId===id),getMeal:async(id:string)=>meals.find(m=>m.id===id),getNutritionProducts:async()=>[],insertMeal:async(data:any)=>{const r={id:String(meals.length),...data};meals.push(r);return r;}};
 for(const key of Object.getOwnPropertyNames(ExperienceStorage.prototype).filter(k=>k!=="constructor"))store[key]=(experience as any)[key].bind(experience);
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.headers["x-user"] as string} as any;next();});const auth:any=(req:any,res:any,next:any)=>req.session.userId?next():res.status(401).json({error:"Sign in"});const precision=registerPrecisionRoutes(app,auth,store);registerExperienceRoutes(app,auth,store,precision);const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.on("listening",r));const port=(server.address() as any).port;
 const request=async(path:string,method="GET",body?:unknown,user="a",expected=200)=>{const res=await fetch(`http://127.0.0.1:${port}/api/experience${path}`,{method,headers:{"content-type":"application/json",...(user?{"x-user":user}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});assert.equal(res.status,expected,`${method} ${path}`);assert.equal(res.headers.get("cache-control"),expected===401?null:"no-store");return res.status===204?null:res.json();};
 try{
  await request("/settings","GET",undefined,"",401);assert.equal((await request("/settings")).mode,"everyday");await request("/settings","PATCH",{mode:"athlete",userId:"b"},"a",400);
  const clock={date:"2026-10-18",timezoneOffset:360,hour:18};await request("/athlete-day","POST",clock,"a",409);await request("/settings","PATCH",{mode:"athlete"});const blocked=await request("/athlete-day","POST",clock);assert.equal(blocked.blocked,true);assert.equal(blocked.targets.proteinG,null);await request("/day-choices","POST",clock,"a",409);
  const entry={kind:"session",payload:{title:"Private ride",startsAt:"2026-10-18T18:00:00Z",minutes:180,intensity:"hard",discipline:"endurance"}};const row=await request("/records","POST",entry,"a",201);await request("/records/"+row.id,"PUT",entry,"b",404);await request("/records/"+row.id,"DELETE",undefined,"b",404);assert.equal((await request("/export","GET",undefined,"b")).records.length,0);assert.equal((await request("/export")).records.length,1);
  await request("/records","POST",{kind:"hydration",payload:{date:"2026-02-30"}},"a",400);await request("/scan","POST",{kind:"label",consent:false,image:"data:image/png;base64,AAAA"},"a",400);
  meals.push({id:"source",userId:"a",mealText:"100 g banana",loggedAt:new Date(),...await analyzeMeal("100 g banana",false)});const template=await request("/templates/from-meal","POST",{mealId:"source",name:"Banana"},"a",201);await request("/templates/from-meal","POST",{mealId:"source",name:"Foreign"},"b",404);await request(`/templates/${template.id}/log`,"POST",{servings:2,mealType:"snack",eatenAt:"2026-10-18T18:00:00Z"},"b",404);const logged=await request(`/templates/${template.id}/log`,"POST",{servings:2,mealType:"snack",eatenAt:"2026-10-18T18:00:00Z"},"a",201);assert.equal(logged.userId,"a");assert.equal(logged.loggedAt,"2026-10-18T18:00:00.000Z");assert.ok(logged.totalCalories>150&&logged.totalCalories<250);
  await request("","DELETE",undefined,"a",400);assert.equal((await request("/records")).length,2);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
