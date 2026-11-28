import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{execFileSync}from'node:child_process';
const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url));
const base='design/bloom/anatomy/stages-1-3/';
const geometry=JSON.parse(read('client/src/content/anatomy-source-geometry.json').toString());
test('approved28-member anatomy handoff remains byte-identical to original manifest',()=>{
 const manifest=JSON.parse(read(base+'PACKAGE_MANIFEST.json').toString());
 const entries=manifest.files;assert.equal(entries.length,28);
 for(const file of entries){const bytes=read(base+file.path);assert.equal(bytes.length,file.bytes??file.size_bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);}
});
test('derived44 paths and embedded PNG parity are checked against fixed source SHA',()=>{
 assert.match(execFileSync('python3',['scripts/anatomy-source-geometry.py','--check'],{encoding:'utf8'}),/44 exact source paths/);
 assert.equal(geometry.views.front.length,24);assert.equal(geometry.views.back.length,20);
 assert.equal(new Set([...geometry.views.front,...geometry.views.back].map((p:any)=>p.id)).size,44);
 assert.equal(geometry.status,'PROVISIONAL_VISUAL_KEYS_NOT_CANONICAL_ANATOMY');
});
test('15 visual groups stay provisional, not silently equated with reviewed exercise identities',()=>{
 const supplied=JSON.parse(read(base+'visual-groups-provisional.json').toString());
 assert.equal(supplied.taxonomy_status,'provisional');
 assert.deepEqual([...new Set([...geometry.views.front,...geometry.views.back].map((p:any)=>p.group))].sort(),supplied.visual_group_keys.sort());
});
test('symptom geometry preserves source laterality, coordinates and separate front/back namespaces',()=>{
 for(const view of ['front','back']){const rows=JSON.parse(read(`design/bloom/anatomy/unified-symptom/v1/assets/${view}-regions-provisional.json`).toString());assert.equal(rows.length,view==='front'?23:26);assert.equal(new Set(rows.map((r:any)=>r.id)).size,rows.length);for(const row of rows){assert.ok(row.anchor.x>=0&&row.anchor.x<=320&&row.anchor.y>=0&&row.anchor.y<=820);if(view==='front')assert.ok(['left','right','midline'].includes(row.side));else assert.equal(row.side,undefined,'Posterior source omits typed laterality: do not invent an approved mapping');assert.ok(row.d.startsWith('M '));}assert.deepEqual(read(base+`assets/body-${view}.png`),read(`design/bloom/anatomy/unified-symptom/v1/assets/body-${view}.png`));}
});
