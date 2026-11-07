import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {assertScientificArtworkSvg,escapeBareSvgAmpersands} from './lib/scientific-artwork-svg.mjs';
const registry=JSON.parse(readFileSync('shared/data/scientific-visual-assets.json','utf8'));
const roots=['client/public',...(process.argv.includes('--built')?['dist/public']:[])];
const sha=(bytes)=>createHash('sha256').update(bytes).digest('hex');
const blob=(bytes)=>createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex');
const assets=[...registry.organismIllustrations.flatMap(entry=>[entry.portrait,entry.thumbnail]),...registry.bloodworkIllustrations.map(entry=>entry.asset),...registry.moleculeIllustrations.map(entry=>entry.asset),...registry.pathwayIllustrations.map(entry=>entry.asset)];
let count=0;
for(const asset of assets){
 if(!/^\/science\/(?:organisms-v4\/(?:organisms|thumbnails)|bloodwork-v4|structures-v4|pathways-v4)\/[a-z-]+\.svg$/.test(asset.src))throw Error('Unsafe scientific asset path');
 let expectedSource;
 if(asset.sourceArchive){
  if(asset.sourceArchive!==asset.originalPath||!/^design\/bloom\/scientific-iconography\/2026-10-30\/library-v4\/(?:bloodwork|structures|pathways)\/[a-z-]+\.svg$/.test(asset.sourceArchive))throw Error('Unsafe original asset path');
  const original=readFileSync(asset.sourceArchive);if(sha(original)!==asset.originalSha256||blob(original)!==asset.sourceGitBlob)throw Error('Original scientific source fingerprint mismatch');
  if(!['none','xml-escape-bare-ampersands'].includes(asset.repair))throw Error('Unsupported artwork transformation');
  expectedSource=asset.repair==='none'?original:Buffer.from(escapeBareSvgAmpersands(original.toString('utf8')));
 }
 for(const root of roots){
  const bytes=readFileSync(resolve(root,'.'+asset.src));
  if(sha(bytes)!==asset.sha256||expectedSource&&!bytes.equals(expectedSource)||!expectedSource&&blob(bytes)!==asset.sourceGitBlob)throw Error('Scientific asset fingerprint mismatch');
  assertScientificArtworkSvg(bytes.toString('utf8'));count++;
 }
}
console.log(`Verified ${count} scientific SVG copies: original source fingerprints, declared XML repairs, passive XML and SHA256${roots.length>1?', source/build parity':''}. No diagnosis or independent scientific approval inferred.`);
