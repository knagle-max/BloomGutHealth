import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {assertScientificArtworkSvg} from './lib/scientific-artwork-svg.mjs';
const registry=JSON.parse(readFileSync('shared/data/scientific-visual-assets.json','utf8'));
const roots=['client/public',...(process.argv.includes('--built')?['dist/public']:[])];
let count=0;
for(const entry of registry.organismIllustrations)for(const size of ['portrait','thumbnail']){
 const asset=entry[size];if(!/^\/science\/organisms-v4\/(organisms|thumbnails)\/[a-z-]+\.svg$/.test(asset.src))throw Error('Unsafe scientific asset path');
 for(const root of roots){const bytes=readFileSync(resolve(root,'.'+asset.src));if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256||createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex')!==asset.sourceGitBlob)throw Error('Scientific asset fingerprint mismatch');assertScientificArtworkSvg(bytes.toString('utf8'));count++;}
}
console.log(`Verified ${count} original scientific SVG copies: exact source blobs, passive XML and SHA256${roots.length>1?', source/build parity':''}. No scientific or independent rights approval inferred.`);
