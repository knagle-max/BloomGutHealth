import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {exerciseCatalogue,exerciseCatalogueVersion} from '../shared/exercise-catalogue';
import {catalogueMuscleAssociations,exerciseRoleSurfaces} from '../shared/exercise-catalogue-associations';
import {buildMuscleHistory} from '../shared/muscle-history';
import {experienceEntrySchema} from '../shared/experience';
import {projectTrainingSurfaces} from '../shared/anatomy-training';
import crosswalk from '../design/bloom/anatomy/canonical-baseline44-20261126/canonical_to_svg_crosswalk.json';
test('all553identities expose all3102source roles without promoting review or inventing deep surfaces',()=>{
 let roles=0;const allowed=new Set(crosswalk.svg_path_bindings.map(b=>b.svg_path_id));
 for(const e of exerciseCatalogue){const result=exerciseRoleSurfaces(e.id);assert.ok(result.data);roles+=result.data.associations.length;assert.ok(result.data.associations.every(a=>a.state==='preliminary'));for(const surface of result.surfaces)assert.ok(allowed.has(surface.svg_path_id));}
 assert.equal(roles,3102);assert.equal(crosswalk.svg_path_bindings.length,44);assert.equal(crosswalk.muscle_descriptor_bindings.filter(d=>d.mapping_status==='canonical_baseline').length,37);assert.equal(crosswalk.muscle_descriptor_bindings.filter(d=>d.mapping_status!=='canonical_baseline').length,16);
 const all=exerciseCatalogue.flatMap(e=>exerciseRoleSurfaces(e.id).textOnly);for(const id of ['rotator_cuff','lower_trapezius','transversus_abdominis'])assert.ok(all.some(a=>a.muscle===id));
 assert.equal(catalogueMuscleAssociations('custom.synthetic'),null);
 const copenhagen=exerciseCatalogue.find(e=>e.name==='Copenhagen plank')!;assert.ok(exerciseRoleSurfaces(copenhagen.id).surfaces.some(s=>s.roles.includes('stabilizers')));
});
test('all553confirmed canonical sets flow into the shared history; missing load/completion and deletions remain honest',()=>{
 const at='2026-11-27T10:00:00Z',options={asOf:'2026-11-27T12:00:00Z',timeZone:'UTC',days:7 as const};
 const rows=exerciseCatalogue.map((e,i)=>({...experienceEntrySchema.parse({kind:'activity',payload:{startedAt:at,title:e.name,minutes:null,notes:'',actualSets:{version:1,sets:[{id:randomUUID(),exercise:e.name,reps:10,loadKg:null,completed:true,side:'both',catalogueRef:{id:e.id,version:exerciseCatalogueVersion,match:'selected',confirmed:true}}]}}}),id:'synthetic-'+i,createdAt:at,updatedAt:at}));
 const before=JSON.stringify(rows),history=buildMuscleHistory(rows,options);assert.equal(history.contributions.length,553);assert.equal(history.unmapped.length,0);assert.equal(history.contributions.reduce((n,c)=>n+c.associationStates.length,0),3102);assert.ok(history.contributions.every(c=>c.externalVolumeKgReps===null));assert.equal(JSON.stringify(rows),before);assert.ok(projectTrainingSurfaces(history.contributions).surfaces.length);assert.equal(buildMuscleHistory([],options).contributions.length,0);
 const row=rows[0];if(row.kind!=='activity')throw Error('fixture');
 const custom=structuredClone(row);custom.payload.actualSets!.sets[0].catalogueRef!.id='custom.'+randomUUID();assert.equal(buildMuscleHistory([custom],options).contributions.length,0,'Custom identity cannot inherit same-named canonical roles');
 row.payload.actualSets!.sets[0].completed=false;assert.equal(buildMuscleHistory([row],options).contributions.length,0);
});

test('surface browsing uses explicit baseline bindings and never guesses deferred or provisional targets',async()=>{
 const {catalogueIdsForSurfacePath}=await import('../shared/exercise-catalogue-associations');
 const bench=exerciseCatalogue.find(e=>e.name==='Barbell bench press')!;
 assert.ok(catalogueIdsForSurfacePath('bloom-front-chest-01').includes(bench.id));assert.ok(catalogueIdsForSurfacePath('bloom-front-chest-02').includes(bench.id));
 assert.deepEqual(catalogueIdsForSurfacePath('bloom-extra-front-serratus-anterior-left'),[]);assert.deepEqual(catalogueIdsForSurfacePath('unknown-region'),[]);
 for(const binding of crosswalk.svg_path_bindings)for(const id of catalogueIdsForSurfacePath(binding.svg_path_id))assert.ok(exerciseCatalogue.some(e=>e.id===id));
});
