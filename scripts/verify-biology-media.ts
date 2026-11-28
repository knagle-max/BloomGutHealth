import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
import {editorialMedia} from '../client/src/content/editorial-media';
import {editorialVisualAssetIds} from '../client/src/content/visual-asset-ids';

const raw=await readFile(new URL('../design/visual-system/biology-text-safe/DELIVERY_MANIFEST.json',import.meta.url));
const hash=(value:Uint8Array)=>createHash('sha256').update(value).digest('hex');
if(hash(raw)!=='60e9ddc4e3d0003922b97544789666145561d8c5178901550167ee237f0ab0ed')throw Error('Biology source manifest changed; review the exact original delivery before updating this verification');
const manifest=JSON.parse(raw.toString('utf8'));
const slots={'BVA-0032':'biology-bloodwork','BVA-0033':'biology-gut','BVA-0034':'biology-genetics','BVA-0035':'biology-measurements'} as const;
if(manifest.assets.length!==4||new Set(manifest.assets.map((asset:{id:string})=>asset.id)).size!==4)throw Error('Expected four independent Biology scenes');
let bytes=0,files=0;
const remote=process.env.BLOOM_BIOLOGY_MEDIA_BASE_URL;
if(remote&&remote!=='https://bloomguthealth.onrender.com')throw Error('Biology media verification is limited to the authorized review service');
for(const [id,slot] of Object.entries(slots)){
 const source=manifest.assets.find((asset:{id:string})=>asset.id===id),asset=editorialMedia[slot];
 if(!source||editorialVisualAssetIds[slot]!==id)throw Error(`Biology source binding mismatch: ${id}`);
 for(const [index,variant] of source.webpVariants.entries()){
  if(variant.path!==`webp/${basename(variant.path)}`||![['1x',1086,362],['2x',2172,724]].some(([name,w,h])=>variant.variant===name&&variant.width===w&&variant.height===h))throw Error('Invalid Biology variant source path/geometry');
  const path='/images/editorial/biology/'+basename(variant.path);
  if(path!==(index===0?asset.raster.src:asset.raster.src2x))throw Error(`Biology responsive source mismatch: ${slot}`);
  for(const root of process.argv.includes('--built')?['client/public','dist/public']:['client/public']){
   const data=await readFile(new URL(`../${root}${path}`,import.meta.url));
   if(data.length!==variant.bytes||hash(data)!==variant.sha256)throw Error(`Biology original bytes changed: ${root}${path}`);
  }
  if(remote){const response=await fetch(remote+path,{redirect:'error',signal:AbortSignal.timeout(30000)});if(!response.ok||!response.headers.get('content-type')?.startsWith('image/webp'))throw Error(`Biology public image unavailable: ${path}`);const body=new Uint8Array(await response.arrayBuffer());if(body.length!==variant.bytes||hash(body)!==variant.sha256)throw Error(`Biology public image original-byte mismatch: ${path}`);}
  files++;bytes+=variant.bytes;
 }
 if(source.webpVariants.length!==2)throw Error('Both original responsive variants are required');
}
console.log(`Biology media PASS: ${files} supplied WebPs / ${bytes} bytes; exact independent manifest, original hashes,1x/2x source geometry and four stable UI bindings${process.argv.includes('--built')?', including built copies':''}${remote?', public unauthenticated HTTP bytes verified':''}. No image generation or clinical validation inferred.`);
