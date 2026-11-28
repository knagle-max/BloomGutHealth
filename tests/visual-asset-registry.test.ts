import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import registry from '../docs/visual-assets/visual-asset-registry.json';
import {visualAssetRegistrySchema,editorialVisualProjection} from '../shared/visual-asset-registry';
import {editorialMedia} from '../client/src/content/editorial-media';
import {editorialVisualAssetIds} from '../client/src/content/visual-asset-ids';

test('permanent visual IDs bind every existing editorial slot to the original master without claiming approval or integrating unavailable art',()=>{
 const parsed=visualAssetRegistrySchema.parse(registry),projection=editorialVisualProjection(registry);
 assert.deepEqual(projection.bindings,editorialVisualAssetIds);
 assert.deepEqual(Object.keys(projection.bindings).sort(),Object.keys(editorialMedia).sort());
 for(const[slot,id]of Object.entries(editorialVisualAssetIds)){
  const entry=parsed.assets.find(asset=>asset.id===id)!;assert.equal(entry.sourceRelation.existingSlot,slot);
  const asset=editorialMedia[slot as keyof typeof editorialMedia];
  if('reserved' in asset&&!('raster' in asset)){assert.deepEqual(entry.filePaths,[]);assert.equal(entry.integration.verified,false);assert.ok(asset.reserved.width>0&&asset.reserved.height>0);continue;}
  if('reserved' in asset&&'raster' in asset){assert.ok(entry.filePaths.includes(asset.raster.src));if('src2x' in asset.raster&&typeof asset.raster.src2x==='string')assert.ok(entry.filePaths.includes(asset.raster.src2x));assert.ok(asset.reserved.width>0&&asset.reserved.height>0);for(const path of entry.filePaths)assert.ok(readFileSync('client/public'+path).length>0);continue;}
  assert.equal(entry.lifecycle,['BVA-0001','BVA-0002','BVA-0003','BVA-0004','BVA-0005','BVA-0051'].includes(entry.id)?'Approved':'Identified','Current owner-approved hero status remains separate from integration');assert.ok(entry.filePaths.includes('raster'in asset?asset.raster.src:asset.svg.src));
  for(const path of entry.filePaths)assert.ok(readFileSync('client/public'+path).length>0);
 }
 assert.equal(parsed.assets.filter(asset=>asset.integration.verified).length,0,'Static delivery mapping is not independent rendered approval');
});
test('registry rejects reused or ambiguous permanent IDs, false integration and nonlocal public image paths',()=>{
 for(const alter of [
  (r:any)=>r.assets.push(structuredClone(r.assets[0])),
  (r:any)=>r.retiredAssetIds.push(r.assets[0].id),
  (r:any)=>r.assets[1].sourceRelation.existingSlot=r.assets[0].sourceRelation.existingSlot,
  (r:any)=>{r.assets[8].lifecycle='Integrated';r.assets[8].filePaths=[];},
  (r:any)=>r.assets[0].filePaths=['https://example.invalid/prototype.webp'],
  (r:any)=>r.assets[0].filePaths=['/images/../private/source.png'],
 ]){const copy=structuredClone(registry);alter(copy);assert.equal(visualAssetRegistrySchema.safeParse(copy).success,false);}
});

test('historical owner decisions do not gate new development candidates; actual rejected renditions stay excluded',()=>{
 const parsed=visualAssetRegistrySchema.parse(registry),projection=editorialVisualProjection(registry);
 for(const id of ['BVA-0022','BVA-0025','BVA-0026','BVA-0027','BVA-0028']){
  const asset=parsed.assets.find(row=>row.id===id)!;assert.ok(projection.ids.includes(id));assert.equal(asset.lifecycle,id==='BVA-0025'?'Approved':'Briefed');assert.equal(asset.ownerApproval?.approved,id==='BVA-0025');assert.deepEqual(asset.filePaths,[]);
  const copy:any=structuredClone(registry),row=copy.assets.find((asset:any)=>asset.id===id)!;row.lifecycle='Integrated';row.filePaths=['/images/editorial/heroes/replacement-candidate.webp'];row.currentRendition={id:id+'-replacement',status:'candidate'};assert.equal(visualAssetRegistrySchema.safeParse(copy).success,true,'Owner reviews the assembled RC, not each new development candidate');
  row.currentRendition.status='rejected';assert.equal(visualAssetRegistrySchema.safeParse(copy).success,false,'Explicit rejection follows the rendition, not the scene requirement');
 }
 for(const [id,lifecycle] of [['BVA-0023','Integrated'],['BVA-0024','Approved']]){
  const asset=parsed.assets.find(row=>row.id===id)!;
  assert.equal(asset.lifecycle,lifecycle,'Runner is rendered; Coach remains staged without role activation');
  assert.equal(asset.ownerApproval?.approved,true,'Original historical owner decision stays intact after integration');
  assert.equal(asset.sourceRelation.integrationSourceByteVerified,true);
  for(const path of asset.filePaths)assert.ok(readFileSync('client/public'+path).length>0);
 }
});

test('BVA0051 delivery retains exact original and supplied responsive bytes without claiming independent acceptance',()=>{
 const root='design/bloom/microbiome/bva-0051-20261121/',manifest=JSON.parse(readFileSync(root+'manifest.json','utf8'));
 assert.equal(manifest.assetId,'BVA-0051');assert.equal(manifest.files.length,7);
 for(const file of manifest.files){const data=readFileSync(root+file.path);assert.equal(data.length,file.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256);if(file.path.endsWith('.webp'))assert.deepEqual(readFileSync('client/public/images/editorial/microbiome/bva-0051/'+file.path),data);}
 const row=registry.assets.find(asset=>asset.id==='BVA-0051')!;assert.equal(row.integration.verified,false);assert.equal(row.filePaths.length,5);assert.equal(row.sha256,'2d5f8873c3643abd43f5f43ae015213a1afab4641ddd2fd62fb910a5a0bddc00');
});
