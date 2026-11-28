import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='design/bloom/anatomy/canonical-baseline44-20261126/';
const read=(file:string)=>JSON.parse(readFileSync(root+file,'utf8'));
test('owner canonical package preserves exact source hashes and original 44 bindings',()=>{
 const manifest=read('SOURCE_MANIFEST.json');for(const file of manifest.files){const bytes=readFileSync(root+file.path);assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);}
 const registry=read('canonical_anatomy_registry.json'),crosswalk=read('canonical_to_svg_crosswalk.json');assert.equal(registry.registry_entries.length,44);assert.equal(new Set(registry.registry_entries.map((r:any)=>r.anatomy_id)).size,44);assert.equal(crosswalk.svg_path_bindings.length,44);assert.equal(new Set(crosswalk.svg_path_bindings.map((r:any)=>r.svg_path_id)).size,44);
 for(const view of ['front','back']){const source=readFileSync(`design/bloom/anatomy/stages-1-3/assets/bloom-neutral-${view}.svg`);assert.equal(createHash('sha256').update(source).digest('hex'),registry.source_svg_sha256[`approved-originals/bloom-neutral-${view}.svg`]);const paths=source.toString();for(const bind of crosswalk.svg_path_bindings.filter((r:any)=>r.view===view))assert.ok(paths.includes(`id="${bind.svg_path_id}"`));}
});
test('553 staged exercises keep unreviewed roles and explicit deferred surface mappings',()=>{
 const exercises=read('bloom_exercise_db_staging_canonical_mapped.json'),crosswalk=read('canonical_to_svg_crosswalk.json'),ids=new Set(crosswalk.svg_path_bindings.map((b:any)=>b.anatomy_id));assert.equal(exercises.length,553);assert.equal(new Set(exercises.map((e:any)=>e.exercise_name)).size,553);assert.equal(crosswalk.muscle_descriptor_bindings.length,53);assert.equal(crosswalk.muscle_descriptor_bindings.filter((d:any)=>d.mapping_status==='deferred_unmapped').length,16);
 for(const exercise of exercises){assert.equal(exercise.review_status,'unreviewed');for(const role of ['primary','secondary','stabilizer'])for(const link of exercise.anatomical_map_ids[role]){if(link.mapping_status==='deferred_unmapped')assert.equal(link.map_id,null);else{assert.ok(ids.has(link.map_id));assert.equal(link.do_not_sum_with_same_muscle,true);}}}
});
