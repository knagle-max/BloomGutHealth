import test from 'node:test';
import assert from 'node:assert/strict';
import {completedExerciseHistory} from '../shared/training-set-history';
import {experienceEntrySchema, type ActualSets, type ExperienceRecord} from '../shared/experience';
import {exerciseCatalogue,exerciseCatalogueVersion} from '../shared/exercise-catalogue';
const ownerId='synthetic-history-a';
const options={actorId:ownerId,before:'2026-11-28T12:00:00Z',asOf:'2026-11-28T13:00:00Z'};
const ref={id:exerciseCatalogue.find(row=>row.name==='Barbell bench press')!.id,version:exerciseCatalogueVersion,match:'selected' as const,confirmed:true};
const uuid=(n:number)=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const set=(n:number,patch:Partial<ActualSets['sets'][number]>={}):ActualSets['sets'][number]=>({id:uuid(n),exercise:'Reported press',catalogueRef:{...ref},reps:10,loadKg:45,loadUnit:'kg',completed:true,...patch});
function record(id:string,kind:'activity'|'session',sets:ActualSets['sets'],at='2026-11-20T12:00:00Z',patch:any={}):ExperienceRecord{
 const actualSets={version:1,sets};
 const payload=kind==='activity'?{title:id,startedAt:at,minutes:null,actualSets,...patch}:{title:id,startsAt:at,minutes:30,intensity:'moderate',discipline:'strength-power',status:'completed',actualSets,...patch};
 return{...experienceEntrySchema.parse({kind,payload}),id,createdAt:at,updatedAt:at};
}
const project=(records:ExperienceRecord[],available=true)=>completedExerciseHistory({ownerId,available,records},options);
test('one source projection spans completed activity and session templates, preserves exact facts and never declares v1 conventions comparable',()=>{
 const rows=[record('Upper A','session',[set(1)],'2026-11-20T12:00:00Z',{rpe:9}),record('Freestyle','activity',[set(2)],'2026-11-21T12:00:00Z'),record('Full B','session',[set(3)],'2026-11-22T12:00:00Z')];
 const before=JSON.stringify(rows),result=project(rows);
 assert.equal(result.status,'HISTORY_AVAILABLE_NOT_COMPARABLE');assert.equal(result.observations.length,3);
 assert.deepEqual(result.observations.map(o=>o.sources[0].recordId),['Full B','Freestyle','Upper A']);
 for(const fact of result.observations){assert.equal(fact.catalogueRef?.id,ref.id);assert.equal(fact.loadConvention,null);assert.equal(fact.equipmentInstance,null);assert.equal(fact.setEffort,null);assert.equal(fact.setRole,null);assert.equal(fact.sources[0].updatedAt,fact.occurredAt);}
 assert.equal(JSON.stringify(rows),before);result.observations[0].catalogueRef!.confirmed=false;assert.equal(rows[2].payload.actualSets!.sets[0].catalogueRef!.confirmed,true);
});
test('component children are authoritative; aggregate parents, planned/cancelled sources and incomplete sets cannot inflate performance',()=>{
 const child=set(1),parent=record('mixed','activity',[child,set(2,{completed:false}),set(3,{completed:false,state:'planned'}),set(4,{completed:false,state:'cancelled'})],undefined,{components:{version:1,items:[{id:uuid(90),title:'Press',activityId:'strength',match:'reported',minutes:null,distanceM:null,actualSets:{version:1,sets:[child,set(2,{completed:false}),set(3,{completed:false,state:'planned'}),set(4,{completed:false,state:'cancelled'})]}}]}});
 const result=project([parent,record('plan','session',[set(6)],undefined,{status:'planned'}),record('cancel','session',[set(7)],undefined,{status:'cancelled'}),record('future','activity',[set(8)],'2026-11-29T12:00:00Z')]);
 assert.equal(result.observations.length,1);assert.equal(result.observations[0].setId,child.id);assert.equal(result.observations[0].sources[0].componentId,uuid(90));assert.equal(result.observations[0].sources[0].position,1);
});
test('stable shared set IDs deduplicate once while similar unlinked work remains distinct',()=>{
 const shared=set(1),a=record('activity','activity',[shared]),b=record('session','session',[shared]);
 const result=project([b,a]);assert.equal(result.observations.length,1);assert.deepEqual(result.observations[0].sources.map(s=>s.recordId),['activity','session']);assert.deepEqual(result,project([a,b]));
 assert.equal(project([a,record('separate','session',[set(2)])]).observations.length,2);
 const conflict=project([a,record('session','session',[set(1,{loadKg:50})])]);assert.deepEqual(conflict.observations,[]);assert.deepEqual(conflict.conflictingSetKeys,['set:'+uuid(1)]);
 const disputed=project([a,record('session','session',[set(1,{completed:false})])]);assert.deepEqual(disputed.observations,[]);assert.equal(disputed.status,'HISTORY_AVAILABLE_NOT_COMPARABLE');
 assert.equal(project([a,record('plan','session',[set(1,{completed:false})],undefined,{status:'planned'})]).observations.length,1,'An unperformed plan is not an actual completion assertion');
});
test('current revisions replace old facts, deletion removes them and equally timed contradictory revisions withhold instead of selecting input order',()=>{
 const old=record('same','activity',[set(1)]),corrected={...record('same','activity',[set(1,{loadKg:0,reps:0})]),updatedAt:'2026-11-21T12:00:00Z'};
 const olderConflict={...old,payload:{...old.payload,title:'Older conflicting revision'}} as ExperienceRecord;
 assert.equal(project([old,olderConflict,corrected]).observations[0].loadKg,0);assert.deepEqual(project([corrected,olderConflict,old]),project([old,olderConflict,corrected]));
 assert.equal(project([old,corrected]).observations[0].loadKg,0);assert.equal(project([corrected,old]).observations[0].reps,0);
 assert.equal(project([]).status,'NO_CONFIRMED_HISTORY');
 const ambiguous={...corrected,payload:{...corrected.payload,title:'Conflicting source'}} as ExperienceRecord;
 assert.deepEqual(project([corrected,ambiguous]).observations,[]);assert.deepEqual(project([ambiguous,corrected]),project([corrected,ambiguous]));
 assert.deepEqual(project([old,{...corrected,updatedAt:'unknown'}]).observations,[]);
});
test('scope, unavailable sources, cutoff and current-entry exclusions fail closed without reusing cached observations',()=>{
 const row=record('one','activity',[set(1)]);
 assert.throws(()=>completedExerciseHistory({ownerId:'other',available:true,records:[row]},options),/SCOPE/);
 assert.throws(()=>project([{...row,userId:'other'} as ExperienceRecord]),/SCOPE/);
 const unavailable=project([row],false);assert.equal(unavailable.status,'SOURCE_UNAVAILABLE');assert.deepEqual(unavailable.observations,[]);
 assert.deepEqual(completedExerciseHistory({ownerId,available:true,records:[row]},{...options,excludeRecordIds:['one']}).observations,[]);
 assert.throws(()=>completedExerciseHistory({ownerId,available:true,records:[]},{...options,before:'2026-11-28'}),/TIME_REQUIRED/);
 assert.deepEqual(project([record('equal','activity',[set(1)],options.before)]).observations,[]);
 assert.deepEqual(project([{...row,updatedAt:'2026-11-29T12:00:00Z'}]).observations,[]);
});
test('missing IDs, names, units and loads stay source facts rather than equipment, effort or identity guesses',()=>{
 const result=project([record('legacy','activity',[set(1,{id:undefined,catalogueRef:undefined,exercise:'Barbell bench press',loadKg:null,loadUnit:undefined,reps:null}),set(2,{catalogueRef:{...ref,confirmed:false},side:'left',bodyweight:true,loadKg:0,reps:0})])]);
 const legacy=result.observations.find(o=>o.setId===null)!;assert.equal(legacy.catalogueRef,null);assert.equal(legacy.loadKg,null);assert.equal(legacy.loadUnit,null);assert.equal(legacy.reps,null);
 const second=result.observations.find(o=>o.setId===uuid(2))!;assert.equal(second.catalogueRef?.confirmed,false);assert.equal(second.loadKg,0);assert.equal(second.reps,0);assert.equal(second.side,'left');assert.equal(second.bodyweight,true);assert.equal(second.loadConvention,null);
 assert.equal('suggestedTarget' in result,false);
});

test('day-only routine log times are not precise workout times and bounded input never silently truncates',()=>{
 const plan={version:1,revision:uuid(200),name:'Synthetic routine',components:{version:1,items:[{id:uuid(201),title:'Planned press',activityId:'strength',match:'reported',minutes:null,distanceM:null}]},weekdays:[1],timeZone:'UTC',effectiveFrom:'2026-11-01',effectiveTo:null,preferredTime:null,paused:false,stepTarget:null};
 const row=record('routine','activity',[set(1)],undefined,{routineSource:{routineId:'synthetic-routine',revision:uuid(200),localDate:'2026-11-19',scheduledDate:'2026-11-19',occurrenceRevision:null,timeZone:'UTC',confirmedPerformed:true,timestampBasis:'log-time',planSnapshot:plan}});
 const result=project([row]);assert.deepEqual(result.observations,[]);assert.equal(result.status,'HISTORY_AVAILABLE_NOT_COMPARABLE');assert.equal(result.excluded[0].reason,'reported-day-not-exact-time');
 assert.throws(()=>project(Array(5001).fill(record('many','activity',[set(2)]))),/HISTORY_LIMIT/);
});
