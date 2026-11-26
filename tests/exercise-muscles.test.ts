import test from 'node:test';import assert from 'node:assert/strict';
import {curatedExercises,descriptiveMuscles,matchCuratedExercise,exerciseMuscleCatalogVersion} from '../shared/exercise-muscles';
test('curated anatomical catalogue has stable unique identities, referenced muscles and disjoint roles',()=>{
 assert.equal(new Set(curatedExercises.map(e=>e.id)).size,curatedExercises.length);assert.ok(curatedExercises.length>=20);assert.match(exerciseMuscleCatalogVersion,/v1/);
 for(const e of curatedExercises){assert.ok(e.primary.length);assert.equal(new Set([...e.primary,...e.secondary,...e.stabilizers]).size,e.primary.length+e.secondary.length+e.stabilizers.length);for(const id of [...e.primary,...e.secondary])assert.match(descriptiveMuscles[id].reference,/^https:\/\/openstax\.org\//);for(const alias of [e.label,...e.aliases])assert.equal(matchCuratedExercise(alias)?.id,e.id);assert.ok(e.note);}
});
test('exercise matching is case/spacing tolerant but never invents identity for a new variant or clinical task',()=>{
 assert.equal(matchCuratedExercise('  BENCH   PRESS ')?.id,'bench_press');assert.deepEqual(matchCuratedExercise('bench press')?.primary,['pectoralis_major']);assert.ok(matchCuratedExercise('bench press')?.secondary.includes('triceps_brachii'));
 for(const text of ['pain while benching','unreviewed mystery movement','decline unstable single-arm press','bench','completed workout'])assert.equal(matchCuratedExercise(text),null);
 assert.ok(!matchCuratedExercise('squat')?.primary.includes('gastrocnemius'));assert.ok(matchCuratedExercise('rdl')?.primary.includes('hamstrings'));
});

test('Amendment A reviews apply per association and revision, independently of visual coverage',async()=>{
 const {exerciseAssociations,curatedExercises,exerciseMuscleCatalogVersion}=await import('../shared/exercise-muscles');const bench=curatedExercises.find(e=>e.id==='bench_press')!;
 const original=exerciseAssociations(bench);assert.ok(original.associations.every(a=>a.state==='preliminary'));
 const changed=exerciseAssociations({...bench,associationReviews:[{role:'primary',muscle:'pectoralis_major',state:'reviewed',exerciseRevision:exerciseMuscleCatalogVersion,reviewId:'synthetic-review-only',sourceReferences:['synthetic-test-source']},{role:'secondary',muscle:'anterior_deltoid',state:'rejected',exerciseRevision:exerciseMuscleCatalogVersion,reviewId:'synthetic-correction-only',sourceReferences:['synthetic-test-source']}]});
 assert.equal(changed.associations.find(a=>a.muscle==='pectoralis_major')?.state,'reviewed');assert.ok(changed.primary.includes('pectoralis_major'));assert.ok(!changed.secondary.includes('anterior_deltoid'));assert.ok(changed.secondary.includes('triceps_brachii'));assert.equal(changed.associations.find(a=>a.muscle==='triceps_brachii')?.state,'preliminary');
 const stale=exerciseAssociations({...bench,revision:'corrected-revision',associationReviews:[{role:'primary',muscle:'pectoralis_major',state:'reviewed',exerciseRevision:exerciseMuscleCatalogVersion,reviewId:'synthetic-old-review',sourceReferences:['synthetic-test-source']}]});assert.equal(stale.associations[0].state,'preliminary');
});
