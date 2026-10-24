import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { explainNutrientContribution } from "../shared/food-intelligence";
import { explainRecipeBiology } from "../shared/recipe-intelligence";
import { buildPrecisionReport, contextSchema, labSchema, parse23andMe } from "../shared/precision-nutrition";
import { preferenceSchema } from "../shared/meal-intelligence";
import { registerBiologyRoutes } from "../server/biology-routes";
import { buildBiologicalRegistry } from "../shared/biological-model";
import { practicalChoices } from "../shared/practical-planner";
import { weeklyRequestSchema } from "../shared/weekly-planner";
import { practicalPreferencesSchema, athleteProfileSchema } from "../shared/experience";
import { buildAthleteDay } from "../shared/athlete";
import { athleteMealChoices } from "../server/athlete-meals";
import { catalogueFoods } from "../server/food-catalog";

test("portion contributions retain unknowns, distinguish zeros, and respect known intake and selected targets",()=>{
 const rows=explainNutrientContribution({protein_g:30,sodium_mg:800,fiber_g:null,sugar_g:0},{protein_g:{min:150},sodium_mg:{max:2000},fiber_g:{min:35}},{protein_g:100,sodium_mg:1500},{protein_g:{partial:false},sodium_mg:{partial:false}});
 assert.equal(rows.find(r=>r.key==="protein_g")!.percentOfMinimum,20);
 assert.equal(rows.find(r=>r.key==="protein_g")!.remainingMinimum,50);
 assert.equal(rows.find(r=>r.key==="sodium_mg")!.exceedsMaximum,true);
 assert.equal(rows.find(r=>r.key==="fiber_g")!.amount,null);
 assert.equal(rows.find(r=>r.key==="fiber_g")!.percentOfMinimum,null);
 assert.equal(rows.find(r=>r.key==="sugar_g")!.amount,0);
 assert.equal(explainNutrientContribution({sodium_mg:800},{sodium_mg:{max:2000}},{sodium_mg:null}).find(r=>r.key==="sodium_mg")!.exceedsMaximum,null);
 assert.equal(explainNutrientContribution({protein_g:Infinity}).find(r=>r.key==="protein_g")!.amount,null);
});

test("structured planner ingredients share curated relationship traces and never infer biological effects for unreviewed IDs",()=>{
 const prefs=preferenceSchema.parse({}), context=contextSchema.parse({ageGroup:"adult",pregnancy:"no",safetyReviewed:true});
 const date=new Date().toISOString(),lab={id:"own-lab",kind:"lab",createdAt:date,payload:labSchema.parse({marker:"ldl",value:4,unit:"mmol/L",measuredAt:date,referenceLow:0,referenceHigh:3,laboratory:"Synthetic",method:"assay",fasting:"yes"})};
 const report=buildPrecisionReport([lab],context,prefs,null);
 const registry=buildBiologicalRegistry();
 const explanation=explainRecipeBiology(["oats","oats"],report,prefs,registry);
 assert.ok(explanation.relationshipIds.length>0);
 assert.ok(explanation.sources.length>0);
 assert.equal(new Set(explanation.reasons).size,explanation.reasons.length);
 assert.deepEqual(explainRecipeBiology(["oat-cookie","unreviewed"],report,prefs,registry).relationshipIds,[]);
 assert.deepEqual(explainRecipeBiology(["oats"],report,preferenceSchema.parse({exclusions:["gluten"]}),registry).reasons,[]);
 assert.deepEqual(explainRecipeBiology(["oats"],buildPrecisionReport([lab],contextSchema.parse({}),prefs,null),prefs,registry).reasons,[]);
});

test("authenticated catalogue scales every food server-side and rejects injected selectors and invalid portions",async()=>{
 const app=express();
 registerBiologyRoutes(app,((req:any,res:any,next:any)=>req.headers["x-user"]?next():res.sendStatus(401)) as any,{} as any,{} as any);
 const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.on("listening",r));
 const root=`http://127.0.0.1:${(server.address() as any).port}/api/biology/catalogue`,headers={"x-user":"synthetic"};
 try{
  assert.equal((await fetch(root+"?q=salmon")).status,401);
  const response=await fetch(root+"?q=salmon",{headers}), result=await response.json();
  assert.equal(response.headers.get("cache-control"),"no-store");assert.equal(result.totalFoods,catalogueFoods.length);assert.ok(result.totalFoods>5000&&result.foods.length>0);
  const id=result.foods[0].fdcId;
  const hundred=await(await fetch(root+`/${id}?grams=100`,{headers})).json(),double=await(await fetch(root+`/${id}?grams=200`,{headers})).json();
  const protein=(d:any)=>d.contributions.find((n:any)=>n.key==="protein_g").amount;
  assert.equal(protein(double),protein(hundred)*2);assert.ok(protein(hundred)>0);
  assert.ok(double.limits.some((s:string)=>s.includes("does not predict")));
  assert.equal(double.relationshipEffects,undefined);
  for(const suffix of [`/${id}?grams=0`,`/${id}?grams=3001`,`/${id}?grams=NaN`,`/${id}?userId=other`,"?q=salmon&userId=other"])assert.equal((await fetch(root+suffix,{headers})).status,400);
  assert.equal((await fetch(root+"/999999999999",{headers})).status,404);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});


test("selected targets stay distinct from maxima and partial intake never gives below-limit clearance",()=>{
 const select=(rows:ReturnType<typeof explainNutrientContribution>,key:string)=>rows.find(r=>r.key===key)!;
 const targets={calories:{target:2500},protein_g:{target:150},fiber_g:{min:30},sodium_mg:{max:2300}};
 const known={calories:1800,protein_g:100,fiber_g:18,sodium_mg:1000};
 const partial=explainNutrientContribution({calories:800,protein_g:35,fiber_g:8,sodium_mg:600},targets,known,{calories:{partial:true},protein_g:{partial:true},fiber_g:{partial:true},sodium_mg:{partial:true}});
 assert.equal(select(partial,"calories").percentOfTarget,32);
 assert.equal(select(partial,"calories").percentOfMaximum,null);
 assert.equal(select(partial,"calories").exceedsMaximum,null);
 assert.doesNotMatch(select(partial,"calories").explanation,/selected daily limit/);
 assert.equal(select(partial,"calories").targetRemaining,null);
 assert.equal(select(partial,"calories").provisionalRemainingTarget,700);
 assert.equal(select(partial,"fiber_g").remainingMinimum,null);
 assert.equal(select(partial,"fiber_g").provisionalRemainingMinimum,12);
 assert.equal(select(partial,"sodium_mg").exceedsMaximum,null);
 assert.match(select(partial,"sodium_mg").explanation,/not confirmed/);
 const complete=select(explainNutrientContribution({sodium_mg:600},targets,known,{sodium_mg:{partial:false}}),"sodium_mg");
 assert.equal(complete.exceedsMaximum,false);assert.equal(complete.intakeStatus,"complete");
 assert.equal(select(explainNutrientContribution({sodium_mg:1600},targets,known,{sodium_mg:{partial:true}}),"sodium_mg").exceedsMaximum,true);
 assert.equal(select(explainNutrientContribution({sodium_mg:2400},targets),"sodium_mg").exceedsMaximum,true);
 assert.equal(select(explainNutrientContribution({sodium_mg:100},targets,{sodium_mg:0}),"sodium_mg").exceedsMaximum,null);
 assert.equal(select(explainNutrientContribution({sodium_mg:0},{sodium_mg:{max:0}},{sodium_mg:0},{sodium_mg:{partial:false}}),"sodium_mg").exceedsMaximum,false);
});

test("planner traces use only the supplied registry and nutrient-only choices survive unavailable biology",()=>{
 const preferences=preferenceSchema.parse({cookingMinutes:60}),context=contextSchema.parse({ageGroup:"adult",pregnancy:"no",safetyReviewed:true});
 const report=buildPrecisionReport([],context,preferences,null);
 const registry={...buildBiologicalRegistry(),version:"synthetic-reviewed-registry"};
 assert.equal(explainRecipeBiology(["oats"],report,preferences,registry).version,registry.version);
 const missing=explainRecipeBiology(["oats"],report,preferences);
 assert.equal(missing.available,false);assert.equal(missing.version,null);assert.deepEqual(missing.relationshipIds,[]);assert.deepEqual(missing.reasons,[]);
 const request=weeklyRequestSchema.parse({days:1,targets:{calories:2200,protein:100,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:20}}),practical=practicalPreferencesSchema.parse({minutes:60});
 const unlogged=[{mealText:"Unresolved food",intelligence:{nutrients:[]},nutritionalData:[]}];
 const result=practicalChoices(unlogged,preferences,report,request,practical,false,"dinner");
 assert.ok(result.choices.length>0);assert.equal(result.biologyAvailable,false);assert.match(result.note,/temporarily unavailable/);
 for(const choice of result.choices){
  assert.deepEqual(choice.relationshipIds,[]);assert.equal(choice.biologyVersion,null);
  assert.ok(choice.limitChecks.some(c=>c.status==="unverified"));
  assert.ok(choice.reasons.some(r=>r.includes("compliance is unverified")));
  assert.equal(choice.contributions.find(n=>n.key==="sodium_mg")!.exceedsMaximum,null);
 }
 const supplied=practicalChoices([],preferences,report,request,practical,false,"dinner",registry);
 assert.ok(supplied.choices.length>0);assert.ok(supplied.choices.every(c=>c.biologyVersion===registry.version));
});

test("athlete food contributions retain performance targets and incomplete-log uncertainty",()=>{
 const profile=athleteProfileSchema.parse({weightKg:70,adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true,energyKcal:2800});
 const day=buildAthleteDay(profile,[],[{mealText:"Unresolved",intelligence:{nutrients:[]}}],[]);
 const preferences=preferenceSchema.parse({}),report=buildPrecisionReport([],contextSchema.parse({ageGroup:"adult",pregnancy:"no",safetyReviewed:true}),preferences,null);
 const result=athleteMealChoices(day,preferences,report);assert.ok(result.choices.length>0);
 for(const choice of result.choices){
  const energy=choice.contributions.find(n=>n.key==="calories")!,protein=choice.contributions.find(n=>n.key==="protein_g")!;
  assert.ok(energy.percentOfTarget!==null);assert.equal(energy.percentOfMaximum,null);assert.equal(energy.exceedsMaximum,null);
  assert.ok(protein.percentOfTarget!==null);assert.equal(protein.percentOfMinimum,null);
  assert.match(choice.confidence,/Provisional/);assert.match(energy.explanation,/incomplete or unavailable/);
 }
 assert.match(result.note,/not a clinical upper limit/);
});


test("an MTHFR call alone does not change food or recipe priorities or create a nutrient deficiency",()=>{
 const preferences=preferenceSchema.parse({}),context=contextSchema.parse({ageGroup:"adult",pregnancy:"no",safetyReviewed:true});
 const date=new Date(Date.now()-86400000).toISOString();
 const raw="# This data file generated by 23andMe\n# reference human assembly build 37\n# rsid chromosome position genotype\nrs1801133\t1\t11856378\tAA";
 const genetic={id:"synthetic-genotype",kind:"genetics",createdAt:date,payload:parse23andMe(raw,date)};
 const base=buildPrecisionReport([],context,preferences,null),withGenotype=buildPrecisionReport([genetic],context,preferences,null);
 const priorities=(rows:Array<{id:string;priority:number}>)=>rows.map(r=>({id:r.id,priority:r.priority}));
 assert.deepEqual(priorities(withGenotype.foods),priorities(base.foods));
 assert.deepEqual(priorities(withGenotype.recommendations),priorities(base.recommendations));
 assert.equal(withGenotype.labs.length,0);assert.equal(withGenotype.supplements.length,0);
 const lab={id:"own-lab",kind:"lab",createdAt:date,payload:labSchema.parse({marker:"ldl",value:4,unit:"mmol/L",measuredAt:date,referenceLow:0,referenceHigh:3,laboratory:"Synthetic",method:"assay",fasting:"yes"})};
 const measured=buildPrecisionReport([lab],context,preferences,null),measuredWithGenotype=buildPrecisionReport([lab,genetic],context,preferences,null);
 assert.ok(measured.foods.length>0);
 assert.deepEqual(priorities(measuredWithGenotype.foods),priorities(measured.foods));
 assert.deepEqual(priorities(measuredWithGenotype.recommendations),priorities(measured.recommendations));
});
