import test from 'node:test';
import assert from 'node:assert/strict';
import {exerciseProgression} from '../shared/exercise-progression';
import {completedExerciseHistory} from '../shared/training-set-history';
import {experienceEntrySchema,type ExperienceRecord} from '../shared/experience';
import {exerciseCatalogue,exerciseCatalogueVersion} from '../shared/exercise-catalogue';
import {displayToKg} from '../shared/display-units';
const id=exerciseCatalogue.find(r=>r.name==='Barbell bench press')!.id;
const current={id:'11111111-1111-4111-8111-111111111111',exercise:'Bench press',catalogueRef:{id,version:exerciseCatalogueVersion,match:'selected' as const,confirmed:true},reps:null,loadKg:null,loadUnit:'lb' as const,completed:false,loadContext:{version:1 as const,convention:'barbell-total' as const,equipmentKey:'Synthetic rack A'}};
function row(key:string,kind:'activity'|'session',reps=10,patch:any={}):ExperienceRecord{
 const set={...current,id:crypto.randomUUID(),reps,loadKg:displayToKg(135,'lb'),completed:true,...patch};
 const at=key==='older'?'2026-11-20T12:00:00Z':'2026-11-21T12:00:00Z';
 const payload=kind==='activity'?{title:key,startedAt:at,minutes:null,actualSets:{version:1,sets:[set]}}:{title:key,startsAt:at,minutes:30,intensity:'moderate',discipline:'strength-power',status:'completed',actualSets:{version:1,sets:[set]}};
 return{...experienceEntrySchema.parse({kind,payload}),id:key,createdAt:at,updatedAt:at};
}
function history(records:ExperienceRecord[],available=true){return completedExerciseHistory({ownerId:'synthetic',available,records},{actorId:'synthetic',before:'2026-11-28T12:00:00Z',asOf:'2026-11-28T12:00:00Z'});}
test('RED: verified activity and session history combine across workouts; incompatible same-name equipment cannot supply a target',()=>{
 const h=history([row('older','session',9),row('latest','activity',10),row('wrong','session',12,{loadContext:{...current.loadContext,convention:'per-dumbbell'}})]);
 const result=exerciseProgression(current,h,0);assert.equal(result.status,'COMPARABLE_VERIFIED');assert.equal(result.comparable.length,2);assert.equal(result.previous?.reps,10);assert.equal(result.target?.reps,11);assert.equal(result.target?.loadKg,displayToKg(135,'lb'));
});
test('no history, absent source or missing convention never invent a numeric target; source corrections replace it',()=>{
 assert.equal(exerciseProgression(current,history([])).target,null);
 assert.equal(exerciseProgression(current,history([row('older','session')],false)).status,'SOURCE_UNAVAILABLE');
 const legacy=row('older','session',10,{loadContext:undefined});const ref=exerciseProgression(current,history([legacy]));assert.equal(ref.status,'HISTORY_AVAILABLE_NOT_COMPARABLE');assert.equal(ref.target,null);assert.equal(ref.previous?.reps,10);
 assert.equal(exerciseProgression({...current,catalogueRef:{...current.catalogueRef,confirmed:false}},history([row('older','session')])).target,null);
 const h=history([row('older','session',8)]);assert.equal(exerciseProgression(current,h).target?.reps,9);assert.equal(exerciseProgression(current,history([row('older','session',9)])).target?.reps,10);
});
test('unknown effort and large 30→35 lb steps hold, not compulsory jumps or automatic deloads',()=>{
 const db={...current,loadContext:{...current.loadContext,convention:'per-dumbbell' as const}};
 const h=history([row('latest','session',12,{loadKg:displayToKg(30,'lb'),loadContext:db.loadContext})]);
 const result=exerciseProgression(db,h,0,{nextAvailableLoadKg:displayToKg(35,'lb')});assert.equal(result.decision,'HOLD_LOAD');assert.equal(result.target?.loadKg,displayToKg(30,'lb'));assert.match(result.reason,/10%/);assert.equal(result.previous?.setEffort,null);
 const barbell=exerciseProgression(current,history([row('older','session',12)]),0,{nextAvailableLoadKg:displayToKg(140,'lb')});assert.equal(barbell.target?.loadKg,displayToKg(135,'lb'),'Even a small step needs working-set/effort evidence before load progression');
 assert.equal(exerciseProgression(current,history([row('older','session',6)])).decision,'REPEAT_TARGET');
});
test('planned/cancelled rows and incomplete ordinal positions never shift later set performance into set one',()=>{
 const source=row('older','session',10),payload=source.payload;assert.ok('actualSets' in payload);payload.actualSets!.sets.unshift({...payload.actualSets!.sets[0],id:crypto.randomUUID(),completed:false,state:'planned'});
 const h=history([source]);assert.equal(exerciseProgression(current,h,0).target,null);assert.equal(exerciseProgression(current,h,1).target?.reps,11);
 assert.equal(exerciseProgression({...current,state:'cancelled'},h,1).target,null);
 assert.equal(exerciseProgression({...current,completed:true},h,1).target,null);
 assert.equal(exerciseProgression(current,h,1,{relevantNewOrWorseningPain:true}).decision,'SAFETY_HOLD');
});
test('the pure target helper cannot mutate actual completion, source rows or current draft',()=>{
 const source=row('older','session',10),h=history([source]),before=JSON.stringify([source,h,current]);exerciseProgression(current,h);assert.equal(JSON.stringify([source,h,current]),before);assert.equal(current.completed,false);
 const other={...current,loadContext:{...current.loadContext,equipmentKey:'Different rack'}};assert.equal(exerciseProgression(other,h).target,null);
 assert.equal(exerciseProgression({...current,side:'left'},h).target,null);
});
test('cross-workout working sets support only the actual small equipment step, excluding same-name incompatible equipment',()=>{
 const context={...current.loadContext,setRole:'working',effortRpe:7};
 const h=history([row('older','session',12,{loadContext:context}),row('latest','activity',12,{loadContext:context}),row('wrong','activity',12,{loadContext:{...context,convention:'per-dumbbell'},loadKg:displayToKg(300,'lb')})]);
 const draft={...current,loadContext:context};
 const result=exerciseProgression(draft,h,0,{nextAvailableLoadKg:displayToKg(140,'lb')});assert.equal(result.comparable.length,2);assert.equal(result.decision,'INCREASE_LOAD');assert.equal(result.target?.loadKg,displayToKg(140,'lb'));assert.equal(result.target?.reps,8);
});
test('unknown effort requires three distinct complete top-range exposures; session RPE never fills it',()=>{
 const context={...current.loadContext,setRole:'working'};const draft={...current,loadContext:context};
 const earlier=row('older','session',12,{loadContext:context}),latest=row('latest','activity',12,{loadContext:context});
 const options={nextAvailableLoadKg:displayToKg(140,'lb')};
 assert.equal(exerciseProgression(draft,history([earlier,latest]),0,options).decision,'HOLD_LOAD');
 const third=row('third','session',12,{loadContext:context});third.createdAt=third.updatedAt='2026-11-19T12:00:00Z';if(third.kind==='session'){third.payload.startsAt=third.updatedAt;third.payload.rpe=7;}
 const result=exerciseProgression(draft,history([third,earlier,latest]),0,options);assert.equal(result.decision,'INCREASE_LOAD');assert.equal(result.previous?.setEffort,null);assert.match(result.reason,/effort remains unknown/);
 const duplicateTime={...latest,id:'different-record-same-time'};assert.equal(exerciseProgression(draft,history([earlier,latest,duplicateTime]),0,options).decision,'HOLD_LOAD');
});
test('all working sets, completion and effort constrain equipment progression; warm-ups are separate',()=>{
 const context={...current.loadContext,setRole:'working',effortRpe:7},draft={...current,loadContext:context},options={nextAvailableLoadKg:displayToKg(140,'lb')};
 const older=row('older','session',12,{loadContext:context}),latest=row('latest','activity',12,{loadContext:context});
 const set=latest.payload.actualSets!.sets[0];latest.payload.actualSets!.sets.push({...set,id:crypto.randomUUID(),reps:11});
 assert.equal(exerciseProgression(draft,history([older,latest]),0,options).decision,'HOLD_LOAD');
 latest.payload.actualSets!.sets[1].reps=12;latest.payload.actualSets!.sets[1].completed=false;assert.equal(exerciseProgression(draft,history([older,latest]),0,options).decision,'HOLD_LOAD');
 latest.payload.actualSets!.sets[1].completed=true;assert.equal(exerciseProgression(draft,history([older,latest]),0,options).decision,'INCREASE_LOAD');
 latest.payload.actualSets!.sets.unshift({...set,id:crypto.randomUUID(),loadContext:{...context,setRole:'warm-up'},reps:5});assert.equal(exerciseProgression(draft,history([older,latest]),0,options).decision,'INCREASE_LOAD');
 latest.payload.actualSets!.sets[1].loadContext!.effortRpe=9;assert.equal(exerciseProgression(draft,history([older,latest]),0,options).decision,'HOLD_LOAD');
 for(const nextAvailableLoadKg of [NaN,Infinity,-1,0,2001,displayToKg(130,'lb'),displayToKg(150,'lb')])assert.notEqual(exerciseProgression(draft,history([older,latest]),0,{nextAvailableLoadKg}).decision,'INCREASE_LOAD');
});
