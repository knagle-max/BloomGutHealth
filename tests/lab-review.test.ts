import test from "node:test";
import assert from "node:assert/strict";
import {parseLabPaste} from "../shared/lab-paste";
import {buildPrecisionReport,canonicalLab,contextSchema,labSchema} from "../shared/precision-nutrition";
import {defaultPreferences} from "../shared/meal-intelligence";
import {experienceSettingsSchema,settingsPatchSchema} from "../shared/experience";
import {buildAthleteDay} from "../shared/athlete";
const date="2026-10-01T12:00:00.000Z",ctx=contextSchema.parse({}),now=Date.parse("2026-10-18T12:00:00Z");
const record=(id:string,payload:any)=>({id,kind:"lab",payload,createdAt:date});
const report=(records:any[])=>buildPrecisionReport(records,ctx,defaultPreferences,null,now);
test("mixed lab import keeps valid rows, queues source numbers with unknown units, and never fabricates zero",()=>{
 const r=parseLabPaste("LDL, 120\nALT, 73, U/L\nUnknown test, 8\nVitamin D, 0",date,"Synthetic lab");
 assert.equal(r.valid.length,1);assert.equal(r.pending.length,2);assert.equal(r.errors.length,1);
 assert.equal(r.pending[0].payload.unitReview?.originalValue,120);assert.equal(r.pending[1].payload.value,0);
 assert.equal(r.pending[0].payload.unitReview?.originalUnit,null);assert.equal(r.pending[0].payload.unitReview?.confirmedAt,null);
 assert.equal(r.valid[0].payload.value,73);
 assert.equal(r.valid[0].payload.sourceInput?.suppliedUnit,"U/L");
 assert.equal(r.pending[0].payload.sourceInput?.number,"120");
});
test("unconfirmed unit results cannot normalize, flag or affect recommendations and trends",()=>{
 const p=parseLabPaste("LDL, 120",date).pending[0].payload;
 assert.throws(()=>canonicalLab(p),/Confirm the source unit/);
 const a=report([record("pending",{...p,referenceHigh:1})]),b=report([]);
 assert.equal(a.pendingLabs.length,1);assert.deepEqual(a.labs,[]);assert.deepEqual(a.trends,[]);
 assert.deepEqual(a.foodPriorities,b.foodPriorities);assert.deepEqual(a.supplements,b.supplements);
});
test("confirmation reinterprets source number, excludes the pending original, and preserves provenance",()=>{
 const p=parseLabPaste("LDL, 120",date).pending[0].payload;
 const confirmed=labSchema.parse({...p,unit:"mg/dL",unitReview:{...p.unitReview,status:"confirmed",confirmedAt:date,supersedes:"pending"}});
 const r=report([record("pending",p),record("confirmed",confirmed)]);
 assert.equal(r.pendingLabs.length,0);assert.equal(r.labs.length,1);assert.equal(r.labs[0].value,120);
 assert.ok(Math.abs(r.labs[0].canonical.value-120/38.67)<1e-8);
 assert.equal(r.trends[0].points[0].sourceValue,120);assert.equal(r.trends[0].points[0].sourceUnit,"mg/dL");
 assert.equal(r.labs[0].unitReview?.originalText,"LDL, 120");
});
test("every plotted intermediate laboratory result must have a compatible method and dates",()=>{
 const lab=labSchema.parse({marker:"ldl",value:3,unit:"mmol/L",measuredAt:date,laboratory:"Synthetic",method:"assay-A",fasting:"yes",referenceLow:null,referenceHigh:null});
 const rows=[record("a",{...lab,measuredAt:"2026-08-01T12:00:00Z"}),record("b",{...lab,method:"assay-B",measuredAt:"2026-09-01T12:00:00Z"}),record("c",lab)];
 assert.equal(report(rows).trends[0].comparable,false);
 rows[1].payload.method="assay-A";assert.equal(report(rows).trends[0].comparable,true);
 rows[1].payload.method="Not supplied";assert.equal(report(rows).trends[0].comparable,false);
});
test("skipping setup never grants safety clearance, consent or athlete targets",()=>{
 const initial=experienceSettingsSchema.parse({});assert.equal(initial.onboarding.status,"not-started");
 const patch=settingsPatchSchema.parse({onboarding:{status:"skipped"}});
 const s=experienceSettingsSchema.parse({...initial,...patch});assert.equal(s.athlete.healthReviewed,false);assert.equal(s.athlete.adult,false);
 assert.equal(buildAthleteDay(s.athlete,[],[],[]).blocked,true);
 assert.equal(settingsPatchSchema.safeParse({onboarding:{status:"complete",consent:true}}).success,false);
});
test("the same instant with different UTC offsets cannot create a laboratory trend; original source context is retained",()=>{
 const lab=labSchema.parse({marker:"glucose",value:0,unit:"mg/dL",measuredAt:"2026-09-30T23:30:00Z",laboratory:"Synthetic",method:"assay-A",fasting:"yes",referenceLow:0,referenceHigh:100});
 const rows=[record("utc",lab),record("offset",{...lab,value:100,measuredAt:"2026-10-01T01:30:00+02:00",referenceLow:null,referenceHigh:null})];
 const trend=report(rows).trends[0];
 assert.equal(trend.comparable,false);assert.equal(trend.change,null);
 assert.equal(trend.points.length,2);assert.equal(trend.points[1].date,"2026-10-01T01:30:00+02:00");
 assert.equal(trend.points[0].sourceValue,0);assert.equal(trend.points[0].referenceLow,0);assert.equal(trend.points[0].referenceHigh,100);
 assert.equal(trend.points[0].sourceUnit,"mg/dL");assert.equal(trend.points[0].unit,"mmol/L");assert.equal(trend.points[0].fasting,"yes");
 assert.equal(trend.points[1].referenceLow,null);assert.equal(trend.points[1].referenceHigh,null);
 rows[1].payload.measuredAt="2026-10-02T01:30:00+02:00";
 assert.equal(report(rows).trends[0].comparable,true);
});
