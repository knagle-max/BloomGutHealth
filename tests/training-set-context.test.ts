import {repeatActivityParts} from '../shared/activity-capture';
import {routinePlannedParts} from '../shared/activity-routines';
import test from 'node:test';
import assert from 'node:assert/strict';
import {z} from 'zod';
import {activitySchema,activityRoutinePlanSchema,actualSetsSchema} from '../shared/experience';
import {mergeSetLoadContexts,legacySetContextView,setLoadContextSchema,freshSetLoadContext} from '../shared/training-set-context';
const id='10000000-0000-4000-8000-000000000001';
const context={version:1 as const,convention:'per-dumbbell' as const,equipmentKey:'synthetic-home-dumbbells'};
const row={id,exercise:'Press',loadKg:15,loadUnit:'kg' as const,reps:10,completed:true};
const sets=(value:any)=>actualSetsSchema.parse({version:1,sets:[value]});
test('additive context remains absent for legacy sets and requires a stable ID plus bounded explicit meaning',()=>{
 assert.equal(sets(row).sets[0].loadContext,undefined);assert.deepEqual(sets({...row,loadContext:context}).sets[0].loadContext,context);
 assert.equal(sets({...row,loadContext:null}).sets[0].loadContext,null);
 for(const bad of [{...context,version:2},{...context,convention:'guessed'},{...context,equipmentKey:''},{...context,equipmentKey:'x'.repeat(121)},{...context,equipmentKey:'A\nB'},{...context,secret:'not-allowed'}])assert.equal(setLoadContextSchema.safeParse(bad).success,false);
 assert.equal(actualSetsSchema.safeParse({version:1,sets:[{...row,id:undefined,loadContext:context}]}).success,false);
});
test('unaware edits preserve unique stable-set metadata; clear/delete/identity changes never resurrect it',()=>{
 const previous=sets({...row,loadContext:context}),snapshot=JSON.stringify(previous);
 assert.deepEqual(mergeSetLoadContexts(previous,sets({...row,reps:12}))?.sets[0].loadContext,context);
 assert.equal(mergeSetLoadContexts(previous,sets({...row,loadContext:null}))?.sets[0].loadContext,null);
 assert.deepEqual(mergeSetLoadContexts(previous,{version:1,sets:[]})?.sets,[]);
 assert.equal(mergeSetLoadContexts(previous,sets({...row,id:'10000000-0000-4000-8000-000000000002'}))?.sets[0].loadContext,undefined);
 assert.equal(mergeSetLoadContexts(previous,sets({...row,exercise:'Different press'}))?.sets[0].loadContext,undefined);
 assert.equal(mergeSetLoadContexts(previous,sets({...row,id:undefined}))?.sets[0].loadContext,undefined);
 const duplicate={version:1 as const,sets:[previous.sets[0],previous.sets[0]]};assert.equal(mergeSetLoadContexts(duplicate,sets(row))?.sets[0].loadContext,undefined);
 const copied=mergeSetLoadContexts(previous,undefined)!;copied.sets[0].loadContext!.equipmentKey='changed';assert.equal(JSON.stringify(previous),snapshot);
});
test('legacy views strip only added set context in records/plans/nested responses without mutating originals or losing Date values',()=>{
 const actualSets=sets({...row,loadContext:context}),plan={components:{version:1,items:[{id:'part',actualSets}]}},record={id:'record',kind:'activity',createdAt:new Date('2026-11-20T12:00:00Z'),payload:{actualSets,components:plan.components,routineSource:{planSnapshot:plan}}};
 const payload={records:[record],routine:{kind:'activity-routine',payload:{plan,priorPlans:[plan]}}},before=JSON.stringify(payload),old=legacySetContextView(payload);
 assert.equal(old.records[0].payload.actualSets?.sets[0].loadContext,undefined);assert.equal(JSON.stringify(old).includes('equipmentKey'),false);assert.equal(JSON.stringify(payload),before);assert.equal(old.records[0].createdAt,record.createdAt);
 const legacy=z.object({version:z.literal(1),sets:z.array(z.object({id:z.string(),exercise:z.string(),reps:z.number().nullable(),loadKg:z.number().nullable(),loadUnit:z.enum(['kg','lb']),completed:z.boolean()}).strict())}).strict();
 assert.equal(legacy.safeParse(actualSets).success,false);assert.equal(legacy.safeParse(old.records[0].payload.actualSets).success,true);
 const exported={format:'bloom-experience-v1',...payload};assert.equal(legacySetContextView(exported),exported);assert.equal(JSON.stringify(exported).includes('equipmentKey'),true);
});
test('role and per-set effort remain optional source facts and survive older context-aware writers',()=>{
 const modern=sets({...row,loadContext:{...context,setRole:'working',effortRpe:7}});
 assert.deepEqual(mergeSetLoadContexts(modern,sets({...row,loadContext:context}))?.sets[0].loadContext,modern.sets[0].loadContext);
 assert.equal(mergeSetLoadContexts(modern,sets({...row,loadContext:{...context,setRole:null,effortRpe:null}}))?.sets[0].loadContext?.effortRpe,null);
 assert.equal(mergeSetLoadContexts(modern,sets({...row,loadContext:{...context,equipmentKey:'Synthetic other pair'}}))?.sets[0].loadContext?.effortRpe,undefined);
 for(const patch of [{setRole:'guessed'},{effortRpe:0},{effortRpe:11},{effortRpe:NaN}])assert.equal(setLoadContextSchema.safeParse({...context,...patch}).success,false);
});

test('new occurrences never inherit reported effort from performed sets',()=>{const old={...context,setRole:'working' as const,effortRpe:9};assert.equal(freshSetLoadContext(old)?.effortRpe,null);assert.equal(freshSetLoadContext(old)?.setRole,'working');assert.equal(old.effortRpe,9);});

test('repeat and routine templates retain equipment/role but never copy completed effort into a new occurrence',()=>{
 const original=activitySchema.parse({title:'Synthetic press',startedAt:'2026-11-20T12:00:00Z',minutes:null,actualSets:sets({...row,loadContext:{...context,setRole:'working',effortRpe:9}})});
 const repeated=repeatActivityParts(original);assert.equal(repeated[0].actualSets?.sets[0].loadContext?.effortRpe,null);assert.equal(repeated[0].actualSets?.sets[0].completed,false);assert.notEqual(repeated[0].actualSets?.sets[0].id,row.id);
 const planned=routinePlannedParts(repeated);assert.equal(planned[0].actualSets?.sets[0].loadContext?.setRole,'working');assert.equal(planned[0].actualSets?.sets[0].loadContext?.effortRpe,null);assert.equal(original.actualSets!.sets[0].loadContext?.effortRpe,9);
 const plan={version:1,revision:crypto.randomUUID(),name:'Synthetic routine',components:{version:1,items:planned},weekdays:[1],timeZone:'UTC',effectiveFrom:'2026-11-01',effectiveTo:null,preferredTime:null,paused:false,stepTarget:null};assert.equal(activityRoutinePlanSchema.safeParse(plan).success,true);planned[0].actualSets!.sets[0].loadContext!.effortRpe=9;assert.equal(activityRoutinePlanSchema.safeParse(plan).success,false);
});
