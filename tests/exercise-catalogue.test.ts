import test from 'node:test';import assert from 'node:assert/strict';
import {exerciseCatalogue,searchExerciseCatalogue,matchCatalogueExercises} from '../shared/exercise-catalogue';
test('all553identities remain selectable independent of pending role/SVG review',()=>{assert.equal(exerciseCatalogue.length,553);assert.equal(searchExerciseCatalogue({}).length,553);assert.equal(new Set(exerciseCatalogue.map(e=>e.id)).size,553);assert.ok(exerciseCatalogue.every(e=>e.associationReview==='unreviewed'));for(const e of exerciseCatalogue){assert.ok(searchExerciseCatalogue({query:e.name}).some(found=>found.id===e.id));assert.ok(matchCatalogueExercises(e.name).some(found=>found.id===e.id));}});
test('shared discovery supports aliases/equipment/muscle filters and avoids inventing matches',()=>{const bench=exerciseCatalogue.find(e=>e.name==='Barbell bench press')!;assert.ok(bench);assert.ok(matchCatalogueExercises('did 3 sets of barbell bench press').some(e=>e.id===bench.id));assert.ok(searchExerciseCatalogue({equipment:bench.equipment[0],muscle:'Pectoralis major'}).some(e=>e.id===bench.id));assert.equal(matchCatalogueExercises('nonexistent moon exercise').length,0);assert.equal(searchExerciseCatalogue({category:'invented category'}).length,0);});

test('catalogue identity survives canonical review/save without implying set completion',async()=>{
 const {describeActivityParts,canonicalActivityParts}=await import('../shared/activity-capture');
 const {activityComponentSchema}=await import('../shared/experience');
 const parts=describeActivityParts('3 sets of 10 barbell bench press');const found=parts.find(p=>p.catalogueRef);assert.ok(found);assert.equal(found.catalogueRef?.confirmed,false);
 const reviewed=canonicalActivityParts(parts);assert.equal(reviewed.find(p=>p.catalogueRef)?.catalogueRef?.confirmed,true);for(const set of reviewed.flatMap(p=>p.actualSets?.sets??[]))assert.equal(set.completed,false);
 for(const part of reviewed)assert.equal(activityComponentSchema.safeParse(part).success,true);
});

test('account custom identities use the same natural-language matcher without guessed roles',async()=>{
 const {customCatalogueChoices}=await import('../shared/exercise-catalogue');const custom=customCatalogueChoices([{id:'11111111-1111-4111-8111-111111111111',name:'Synthetic cable reach',aliases:['Synthetic reach'],category:'Custom exercise',equipment:[]}]);assert.equal(matchCatalogueExercises('did synthetic reach',custom)[0]?.id,custom[0].id);assert.equal(matchCatalogueExercises('did synthetic reach').length,0);assert.deepEqual(custom[0].muscleDescriptors,[]);
});

test('performed recents exclude planned/cancelled work and unconfirmed identity',async()=>{
 const {recentlyPerformedCatalogueIds}=await import('../shared/exercise-catalogue');const {experienceEntrySchema}=await import('../shared/experience');const ref={id:exerciseCatalogue[0].id,version:'synthetic-index',match:'selected',confirmed:true};const entry=experienceEntrySchema.parse({kind:'activity',payload:{title:'Synthetic exercise',startedAt:'2026-11-26T10:00:00Z',minutes:null,notes:'',actualSets:{version:1,sets:[{exercise:'Synthetic exercise',reps:null,loadKg:null,completed:true,catalogueRef:ref}]}}});const row={...entry,id:'synthetic-record',createdAt:'2026-11-26T10:00:00Z',updatedAt:'2026-11-26T10:00:00Z'};assert.deepEqual(recentlyPerformedCatalogueIds([row]),[ref.id]);if(row.kind!=='activity')throw Error('fixture');for(const state of ['planned','cancelled']as const)assert.deepEqual(recentlyPerformedCatalogueIds([{...row,payload:{...row.payload,actualSets:{version:1,sets:[{...row.payload.actualSets!.sets[0],state}]}}}]),[]);
});
