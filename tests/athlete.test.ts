import test from "node:test";
import assert from "node:assert/strict";
import { athleteProfileSchema, experienceSettingsSchema, trainingSessionSchema, hydrationSchema, dateKey } from "../shared/experience";
import { sessionFuel, sweatEstimate, buildAthleteDay } from "../shared/athlete";
import { localDayBounds } from "../shared/nutrition-summary";
import { weeklyReview } from "../shared/practical-planner";
const p=athleteProfileSchema.parse({weightKg:70,adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true});
const session=(minutes=90,extras={})=>trainingSessionSchema.parse({title:"Synthetic ride",startsAt:"2026-10-18T18:00:00Z",minutes,intensity:"moderate",discipline:"endurance",...extras});
test("athlete mode defaults to everyday and requires independently confirmed adult context",()=>{
 assert.equal(experienceSettingsSchema.parse({}).mode,"everyday");
 assert.equal(sessionFuel(session(),athleteProfileSchema.parse({weightKg:70})).carbsGHour,null);
 assert.equal(buildAthleteDay({...p,adult:false},[session()],[],[]).targets.proteinG,null);
 assert.equal(buildAthleteDay({...p,needsClinicalReview:true},[session()],[],[]).blocked,true);
 assert.equal(athleteProfileSchema.safeParse({...p,carbGkgMin:8,carbGkgMax:4}).success,false);
 assert.equal(athleteProfileSchema.safeParse({...p,carbGkgMin:8}).success,false);
 assert.equal(dateKey.safeParse("2026-02-30").success,false);
});
test("session fueling differentiates duration and discipline and never assumes high rates are gut-trained",()=>{
 assert.equal(sessionFuel(session(30),p).carbsGHour,null);
 assert.deepEqual(sessionFuel(session(90),p).carbsGHour,[30,60]);
 assert.deepEqual(sessionFuel(session(200),p).carbsGHour,[30,60]);
 assert.deepEqual(sessionFuel(session(200),{...p,gutTrained:true}).carbsGHour,[60,90]);
 assert.equal(sessionFuel(session(90,{discipline:"strength-power"}),p).carbsGHour,null);
 assert.equal(sessionFuel(session(),p).recoveryProteinG,21);
 assert.equal(sessionFuel(session(),p).timeline[2].at,"2026-10-18T19:30:00.000Z");
});
test("athlete days support high energy/team ranges without inheriting everyday caps and do not duplicate session fuel notes",()=>{
 const day=buildAthleteDay({...p,energyKcal:6500,carbGkgMin:8,carbGkgMax:12},[session(240,{carbsG:240,fluidMl:2000}),session(90,{status:"cancelled"})],[],[]);
 assert.equal(day.targets.energyKcal,6500);assert.deepEqual(day.targets.carbohydratesG,[560,840]);assert.equal(day.minutes,240);assert.equal(day.sessions,1);assert.equal(day.consumed.carbs,0);assert.equal(day.consumed.calories,0);
 const partial=buildAthleteDay(p,[session()],[{totalCalories:600,intelligence:{nutrients:[{key:"carbohydrates_total_g",amount:90,coverage:1}] }},{totalCalories:null}],[]);
 assert.equal(partial.consumed.calories,600);assert.equal(partial.partial,true);assert.equal(partial.consumed.carbs,90);
 const conflict=buildAthleteDay({...p,energyKcal:1200},[session(240)],[],[]);assert.equal(conflict.blocked,true);assert.equal(conflict.targets.carbohydratesG,null);assert.equal(conflict.remaining.proteinG,null);
});
test("overnight sessions contribute only the workload inside the selected local day and keep their real recovery time",()=>{
 const s=session(240,{startsAt:"2026-10-18T04:00:00Z"}), bounds=localDayBounds("2026-10-18",360);
 const d=buildAthleteDay(p,[s],[],[],{start:bounds.startOfDay,end:bounds.endOfDay});
 assert.equal(d.minutes,120);assert.equal(d.fueling[0].endsAt,"2026-10-18T08:00:00.000Z");
});
test("sweat calculations distinguish fluid balance, invalid measurements and unknown sodium",()=>{
 const v={minutes:60,preKg:70,postKg:69,drankMl:500,urineMl:100,sweatSodiumMgL:null};
 assert.equal(sweatEstimate(v).litresHour,1.4);assert.equal(sweatEstimate(v).sodiumLossMgHour,null);
 assert.equal(sweatEstimate({...v,sweatSodiumMgL:800}).sodiumLossMgHour,1120);
 assert.equal(sweatEstimate({...v,postKg:72}).valid,false);
 assert.equal(hydrationSchema.safeParse({...v,date:"2026-10-18",climate:"temperate",sweatSodiumMgL:800}).success,false);
});
test("recent gut discomfort prevents an unsupported higher-rate assumption and recorded load needs actual RPE",()=>{
 const s=session(200,{status:"completed",gutComfort:2,rpe:7}),d=buildAthleteDay({...p,gutTrained:true},[s],[],[]);
 assert.deepEqual(d.fueling[0].carbsGHour,[30,60]);assert.equal(d.recordedLoad,1400);assert.equal(d.loadEntries,1);
 assert.equal(buildAthleteDay(p,[session(60)],[],[]).recordedLoad,0);
});
test("weekly reviews separate modes and missing days from zeros and never infer causation",()=>{
 const record=(mode:string,date:string,energy:number)=>({id:date+mode,kind:"checkin",payload:{mode,date,energy,hunger:5,digestion:8,sleepHours:8,adherence:4,professionalReview:false},createdAt:date,updatedAt:date}) as any;
 const r=weeklyReview([record("athlete","2026-10-18",2),record("athlete","2026-10-17",3),record("everyday","2026-10-18",10),record("athlete","2026-10-19",10)],"athlete","2026-10-18");
 assert.equal(r.entries,2);assert.equal(r.metrics[0].current,2.5);assert.equal(r.metrics[0].previous,null);assert.match(r.next,/sports dietitian or clinician/);assert.match(r.note,/not proof/);
});

test("practical alternatives obey next-meal slot, restrictions, equipment, known limits and household shopping scaling",async()=>{
 const {practicalChoices}=await import("../shared/practical-planner");const {preferenceSchema}=await import("../shared/meal-intelligence");const {buildPrecisionReport,contextSchema}=await import("../shared/precision-nutrition");const {weeklyRequestSchema}=await import("../shared/weekly-planner");const {practicalPreferencesSchema}=await import("../shared/experience");
 const preferences=preferenceSchema.parse({cookingMinutes:60}),report=buildPrecisionReport([],contextSchema.parse({ageGroup:"adult",pregnancy:"no",safetyReviewed:true}),preferences,null),request=weeklyRequestSchema.parse({days:1,targets:{calories:2200,protein:100,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:20}}),practical=practicalPreferencesSchema.parse({minutes:60});
 const one=practicalChoices([],preferences,report,request,practical,false,"dinner");assert.equal(one.choices.length,3);assert.ok(one.choices.every(c=>c.recipe.mealType==="main"));assert.equal(new Set(one.choices.map(c=>c.recipe.ingredients.map(i=>i.name).sort().join("|"))).size,3);
 const family=practicalChoices([],preferences,report,request,{...practical,household:3},false,"dinner");assert.equal(family.choices[0].nutrients.calories,one.choices[0].nutrients.calories);assert.ok(Math.abs(family.choices[0].shopping[0].grams-one.choices[0].shopping[0].grams*3)<=2);
 assert.equal(practicalChoices([],preferences,report,request,practical,true).choices.length,0);const snack=practicalChoices([],preferences,report,request,practical,false,"snack");assert.ok(snack.choices.every(c=>c.recipe.mealType==="snack"));
 const full=practicalChoices([{totalCalories:request.targets.calories*1.1}],preferences,report,request,practical);assert.equal(full.choices.length,0);
 const cold=practicalChoices([],preferences,report,request,{...practical,equipment:["none"]});assert.ok(cold.choices.every(c=>!c.recipe.ingredients.some(i=>/chicken|salmon|egg|barley|rice|potato|lentil/.test(i.name.toLowerCase()))));
});


test("reviewed incompatible targets have the same explicit conflict in daily and session outputs without a false incomplete-profile diagnosis",()=>{
 const reviewed={...p,energyKcal:1200,carbGkgMin:8,carbGkgMax:10};
 const day=buildAthleteDay(reviewed,[session(90)],[],[]),fuel=sessionFuel(session(90),reviewed);
 assert.deepEqual(day.blockers,["target_conflict"]);assert.deepEqual(fuel.blockers,["target_conflict"]);
 assert.equal(day.blocked,true);assert.equal(fuel.eligible,false);assert.deepEqual(day.targets,{energyKcal:null,carbohydratesG:null,proteinG:null});assert.equal(fuel.carbsGHour,null);assert.equal(fuel.recoveryProteinG,null);
 assert.ok(day.notices.some(note=>note.includes("energy and macro targets conflict")));assert.ok(fuel.notes.some(note=>note.includes("energy and macro targets conflict")));assert.equal([...day.notices,...fuel.notes].some(note=>/finish.*profile|confirm.*health context/i.test(note)),false);
 assert.equal(fuel.timeline[1].action.includes("shorter"),false);assert.equal(day.sessions,1);assert.equal(day.minutes,90);assert.equal(day.consumed.calories,0);assert.equal(reviewed.targetsConfirmed,true);
});
test("Athlete blocker reasons preserve distinct eligibility causes and workload-compatible threshold semantics",()=>{
 const cases=[[{healthReviewed:false},"profile_unreviewed"],[{weightKg:null},"reference_mass_missing"],[{needsClinicalReview:true},"health_context_requires_review"],[{targetsConfirmed:false},"targets_unconfirmed"],[{adult:false},"unsupported_context"],[{pregnancyNo:false},"unsupported_context"]] as const;
 for(const [change,reason]of cases){const profile={...p,...change};assert.ok(buildAthleteDay(profile,[session()],[],[]).blockers.includes(reason));assert.ok(sessionFuel(session(),profile).blockers.includes(reason));}
 const exact={...p,energyKcal:1610,carbGkgMin:3,carbGkgMax:5};assert.deepEqual(buildAthleteDay(exact,[session()],[],[]).blockers,[]);assert.deepEqual(sessionFuel(session(),exact).blockers,[]);assert.deepEqual(buildAthleteDay({...exact,energyKcal:1609},[session()],[],[]).blockers,["target_conflict"]);
 const workload={...p,energyKcal:2000};const day=buildAthleteDay(workload,[session(200)],[],[]);assert.deepEqual(day.blockers,["target_conflict"]);assert.deepEqual(day.fueling[0].blockers,day.blockers);assert.equal(day.fueling[0].carbsGHour,null);
});
