import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dimensions} from './lib/raster-dimensions.mjs';
const hash=data=>createHash('sha256').update(data).digest('hex');
const manifestBytes=readFileSync('design/visual-system/morphology-v1/DELIVERY_MANIFEST.json');
assert.equal(hash(manifestBytes),'f33739f2bf0bf7562ec482d20b6e2933ef6c1d23a6e20366ea8f32d05a36fbd6');
const mappingBytes=readFileSync('design/visual-system/morphology-v1/SOURCE_MAPPING.json');
assert.equal(hash(mappingBytes),'15494dcb3f4d5a555aec6813ccd66d7ed6cc04c2efd6823cc7ec09d3587e5dbe');
const manifest=JSON.parse(manifestBytes),mapping=JSON.parse(mappingBytes),crosswalk=JSON.parse(readFileSync('shared/data/microbe-morphology-crosswalk-v1.json'));
assert.equal(crosswalk.styles.length,11);assert.equal(crosswalk.entries.length,94);
for(const entry of crosswalk.entries){const matches=mapping.entries.filter(row=>row.sourceOrdinal===entry.sourceOrdinal&&row.reportedName===entry.reportedName&&row.reportedGroup===entry.reportedGroup&&row.artworkId===entry.artworkStyleId&&row.morphologyEvidence===entry.morphologyEvidence);assert.equal(matches.length,1,'Exact original observation mapping retained');}
const remote=process.env.BLOOM_BIOLOGY_MEDIA_BASE_URL;
if(remote&&remote!=='https://bloomguthealth.onrender.com')throw Error('Only the authorized review service may be verified');
let count=0,bytes=0;
for(const style of crosswalk.styles){const source=manifest.assets.find(asset=>asset.styleId===style.id);assert.ok(source);
 for(const size of ['thumbnail','portrait']){const asset=style[size],original=source[size];
  assert.equal(asset.archiveMember,original.path);assert.equal(asset.sha256,original.sha256);assert.equal(asset.bytes,original.bytes);
  assert.equal(asset.publicPath,`/science/morphology-v1/${style.id.toLowerCase()}/${style.id}-${style.registryAssetId}-${size}.webp`);
  for(const root of process.argv.includes('--built')?['client/public','dist/public']:['client/public']){const data=readFileSync(root+asset.publicPath);assert.equal(data.length,original.bytes);assert.equal(hash(data),original.sha256);assert.deepEqual(dimensions(data),size==='thumbnail'?[256,256]:[1024,1024]);}
  if(remote){const response=await fetch(remote+asset.publicPath,{redirect:'error',signal:AbortSignal.timeout(30000)});assert.ok(response.ok);assert.match(response.headers.get('content-type')||'',/^image\/webp/);assert.equal(response.headers.get('set-cookie'),null);const data=Buffer.from(await response.arrayBuffer());assert.equal(hash(data),original.sha256);assert.equal(data.length,original.bytes);}
  count++;bytes+=original.bytes;
 }
}
assert.equal(count,22);console.log(`Morphology media PASS:22 original WebPs/${bytes} bytes,11 styles,94 exact source mappings${process.argv.includes('--built')?', built parity':''}${remote?', unauthenticated HTTP bytes':''}. Conceptual forms; no actual account coverage, shape verification or clinical approval inferred.`);
