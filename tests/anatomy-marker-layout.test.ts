import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {layoutAnatomyMarkers,markerCountLabel,type MarkerReport} from '../client/src/lib/anatomy-marker-layout';
const regions=JSON.parse(readFileSync(new URL('../design/bloom/anatomy/unified-symptom/v1/assets/front-regions-provisional.json',import.meta.url),'utf8'));
const back=JSON.parse(readFileSync(new URL('../design/bloom/anatomy/unified-symptom/v1/assets/back-regions-provisional.json',import.meta.url),'utf8'));
function report(index:number,severity:number|null=1,count=1):MarkerReport{return{visualKey:regions[index].id,count,severity};}
test('reported severity boundaries preserve approved rings; unknown is hollow and absent is not normal',()=>{
 for(const severity of [1,3,4,6,7,10,null]){const out=layoutAnatomyMarkers(regions,[report(0,severity)]);assert.ok(out.ok);assert.deepEqual(out.markers[0].radii,severity===null?[]:severity<=3?[14]:severity<=6?[10,17]:[8,15,22]);assert.equal(out.badges.length,0);}
 const out=layoutAnatomyMarkers(regions,[]);assert.ok(out.ok);assert.equal(out.markers.length,0);assert.match(markerCountLabel(undefined),/symptoms are unknown/);
});
test('duplicate/unknown keys, out-of-range ratings, and noninteger or unsafe counts fail explicitly',()=>{
 for(const reports of [[report(0),report(0)],[{...report(0),visualKey:'unknown-visual-key'}],[report(0,-1)],[report(0,11)],[report(0,NaN)],[report(0,1,-1)],[report(0,1,1.5)],[report(0,1,Number.MAX_SAFE_INTEGER+1)],[report(0,1,0)]])assert.deepEqual(layoutAnatomyMarkers(regions,reports),{ok:false,reason:'invalid-reports'});
 const out=layoutAnatomyMarkers(regions,[report(0,null,0)]);assert.ok(out.ok);assert.equal(out.markers.length,0);
});
test('invalid anchor geometry never invents placement',()=>{
 for(const anchor of[{x:NaN,y:1},{x:-1,y:0},{x:321,y:820},{x:1,y:821}])assert.deepEqual(layoutAnatomyMarkers([{id:'bad',anchor}],[]),{ok:false,reason:'invalid-regions'});
 assert.deepEqual(layoutAnatomyMarkers([regions[0],regions[0]],[]),{ok:false,reason:'invalid-regions'});
});
test('creation-order permutations preserve marker and badge layout in immutable manifest order',()=>{
 const reports=regions.map((r:any,i:number)=>({visualKey:r.id,count:i%4+1,severity:i%10+1}));
 const original=layoutAnatomyMarkers(regions,reports,regions[0].id,regions[1].id);
 for(let i=0;i<reports.length;i++){const rotated=[...reports.slice(i),...reports.slice(0,i)];assert.deepEqual(layoutAnatomyMarkers(regions,rotated,regions[0].id,regions[1].id),original);}
});
test('dense front/back layouts protect all severity, selection and focus circles and prior badges',()=>{
 for(const source of[regions,back])for(let selected=0;selected<source.length;selected++){
  const reports=source.map((r:any)=>({visualKey:r.id,count:9,severity:10}));const out=layoutAnatomyMarkers(source,reports,source[selected].id,source[(selected+1)%source.length].id);assert.ok(out.ok);
  for(const badge of out.badges){assert.ok(badge.x>=3&&badge.y>=3&&badge.x+badge.w<=317&&badge.y+badge.h<=817);
   for(const marker of out.markers){const x=Math.max(badge.x,Math.min(marker.anchor.x,badge.x+badge.w)),y=Math.max(badge.y,Math.min(marker.anchor.y,badge.y+badge.h));assert.ok(Math.hypot(x-marker.anchor.x,y-marker.anchor.y)>=(marker.focused?31:marker.selected?27.5:22)+4);}
   for(const other of out.badges){if(other===badge)continue;assert.ok(badge.x>=other.x+other.w+4||badge.x+badge.w+4<=other.x||badge.y>=other.y+other.h+4||badge.y+badge.h+4<=other.y);}
  }
  assert.equal(out.badges.length+out.hiddenCounts.length,source.length);assert.equal(out.markers.length,source.length);
 }
});
test('collision or long exact count hides only a pill, preserving full accessible count and explicit uncertainty',()=>{
 const out=layoutAnatomyMarkers(regions,[report(0,null,10000)]);assert.ok(out.ok);assert.equal(out.badges.length,0);assert.deepEqual(out.hiddenCounts,[regions[0].id]);assert.match(markerCountLabel(out.markers[0]),/10000 supplied observations; severity not supplied/);
});
test('source corrections and removal recompute immediately without a cached health projection',()=>{
 const before=layoutAnatomyMarkers(regions,[report(0,10,3)]),after=layoutAnatomyMarkers(regions,[report(0,null,1)]),removed=layoutAnatomyMarkers(regions,[]);assert.ok(before.ok&&after.ok&&removed.ok);assert.equal(before.badges.length,1);assert.equal(after.badges.length,0);assert.deepEqual(after.markers[0].radii,[]);assert.equal(removed.markers.length,0);
});
test('explicit zero severity remains a rated observation, distinct from unrated and absent',()=>{
 const zero=layoutAnatomyMarkers(regions,[report(0,0,2)]),unrated=layoutAnatomyMarkers(regions,[report(0,null,2)]),absent=layoutAnatomyMarkers(regions,[]);
 assert.ok(zero.ok&&unrated.ok&&absent.ok);assert.equal(zero.markers[0].severity,0);assert.equal(zero.markers[0].count,2);assert.deepEqual(zero.markers[0].radii,[]);assert.match(markerCountLabel(zero.markers[0]),/reported severity 0 of 10/);assert.match(markerCountLabel(unrated.markers[0]),/severity not supplied/);assert.equal(absent.markers.length,0);
});
