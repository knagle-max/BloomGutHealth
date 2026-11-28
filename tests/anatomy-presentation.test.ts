import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {muscleTargets,ANATOMY_PRESENTATION_VERSION} from '../client/src/lib/anatomy-muscle-presentation';
const read=(p:string)=>readFileSync(p),json=(p:string)=>JSON.parse(read(p).toString());
const art='design/bloom/anatomy/presentation-20261126/',refs='design/bloom/anatomy/interaction-v433/';
const baseline=json('client/src/content/anatomy-source-geometry.json'),projection=json('client/src/content/anatomy-presentation-source.json'),manifest=json(art+'SOURCE_MANIFEST.json');
const hash=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
test('reviewed source manifest binds every shipped visual and interaction input',()=>{
 for(const[name,entry]of Object.entries(manifest.files)as [string,{sha256:string}][])assert.equal(hash(read(art+name)),entry.sha256);
 for(const[name,digest]of Object.entries(manifest.interactionFiles))assert.equal(hash(read(refs+name)),digest);
 assert.match(ANATOMY_PRESENTATION_VERSION,/separate/);
});
test('default exposes exactly the44 original paths, not provisional yellow targets',()=>{
 for(const view of ['front','back']as const){const targets=muscleTargets(view,false);assert.equal(targets.length,view==='front'?24:20);assert.deepEqual(targets.map(t=>t.id),baseline.views[view].map((t:any)=>t.id));assert.ok(targets.every(t=>!t.provisional&&!t.independent&&!t.listOnly));for(const t of targets)assert.equal(t.d,baseline.views[view].find((p:any)=>p.id===t.id).d);}
});
test('detailed source projection preserves actual serialized hit boundaries and fill rules',()=>{
 let total=0;for(const view of ['front','back']as const){const svg=read(refs+view+'-everyday.svg').toString();const targets=muscleTargets(view,true).filter(t=>!t.listOnly);assert.equal(targets.length,view==='front'?34:28);total+=targets.length;for(const t of targets){const path=svg.match(new RegExp('<(?:[A-Za-z_][\\w.-]*:)?path\\b[^>]*\\sid="'+t.id+'"[^>]*>'))?.[0];assert.ok(path,t.id);assert.equal(path.match(/\bd="([^"]+)"/)?.[1],t.d);assert.equal(path.match(/fill-rule="([^"]+)"/)?.[1]??'nonzero',t.fillRule);assert.equal(projection.views[view].find((r:any)=>r.id===t.id).canonicalId,null);}}assert.equal(total,62);
});
test('six residuals retain exact native labels and separately clipped passive previews',()=>{
 const original=json(refs+'LIST_ONLY_RESIDUALS.json');let count=0;for(const view of ['front','back']as const)for(const t of muscleTargets(view,true).filter(t=>t.listOnly)){const source=original.find((r:any)=>r.proposed_id===t.id);assert.equal(t.ariaLabel,source.screen_reader_label);assert.equal(t.parentClipD,source.parentClipD);assert.equal(t.d,source.previewPathD);assert.equal(t.fillRule,'evenodd');count++;}assert.equal(count,6);
});
test('expanded trapezius remains unparented and provisional instead of rolling into narrow legacy parent',()=>{
 const targets=muscleTargets('back',true).filter(t=>t.id.includes('trapezius-upper-'));assert.equal(targets.length,2);assert.ok(targets.every(t=>t.parentId===null&&t.parentageUnresolved&&t.provisional));
});
test('full blue parent geometry and original raster remain beneath noninteractive yellow art',()=>{
 for(const view of ['front','back'])for(const theme of ['everyday','athlete']){const svg=read(art+view+'-'+theme+'.svg').toString();assert.ok(svg.indexOf('presentation-only-baseline-blue-grey')<svg.indexOf('presentation-only-yellow-overlay'));assert.doesNotMatch(svg,/<(?:\w+:)?(?:script|foreignObject|mask|clipPath)\b|\bon\w+=|\btabindex=/i);const image=svg.match(/href="data:image\/png;base64,([^"]+)"/);assert.ok(image);assert.deepEqual(Buffer.from(image[1],'base64'),read('design/bloom/anatomy/stages-1-3/assets/body-'+view+'.png'));for(const path of baseline.views[view])assert.ok(svg.includes(path.d),'Original full parent missing: '+path.id);}
});
test('mode/layer transitions cannot introduce duplicate or canonical target identities',()=>{
 for(const view of ['front','back']as const)for(const detailed of [false,true]){const rows=muscleTargets(view,detailed);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);if(detailed)assert.ok(rows.every(r=>r.provisional));}assert.equal(projection.views.front.length,36);assert.equal(projection.views.back.length,32);
});
