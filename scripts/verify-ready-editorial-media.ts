import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
const hash=(data:Uint8Array)=>createHash('sha256').update(data).digest('hex');
const manifestHashes:Record<string,string>={
 cbc:'cf5a791a77f8ced0f5b9a611b3a82caf612cf2b2e44e79a067e33c5fb0449fe5',
 'batch-a':'486362d2787a444f2f3457f3f0b5d298132222dc147385a573bd1b615ae1eb16',
 'batch-a-extension':'2727f8ea76f19e5a8c4ae6dd4f061cda4f3f07a1b848c2ee7d9df51d2a6560c4',
 'batch-c':'101fe629abcaeec916cf6438898c77badf1042d7858cd76e6a44f92d007d69e1',
 athlete:'507751d47d965d5f68f2ed26fff66f066556b32dc96a579f85504f370cf5c476',
 coach:'507751d47d965d5f68f2ed26fff66f066556b32dc96a579f85504f370cf5c476',
};
const manifests=new Map<string,unknown>();
for(const [name,expected]of Object.entries(manifestHashes)){
 const raw=await readFile(new URL(`../design/visual-system/ready-20261115/${name}/DELIVERY_MANIFEST.json`,import.meta.url));if(hash(raw)!==expected)throw Error(`Original editorial manifest changed: ${name}`);manifests.set(name,JSON.parse(raw.toString('utf8')));
}
const receipt=JSON.parse(await readFile(new URL('../design/visual-system/ready-20261115/IMPORT_RECEIPT.json',import.meta.url),'utf8'));
const remote=process.env.BLOOM_BIOLOGY_MEDIA_BASE_URL;if(remote&&remote!=='https://bloomguthealth.onrender.com')throw Error('Only the authorized review service may be verified');
let files=0,bytes=0;
for(const row of receipt.optimizedFilesImported){
 const descriptors:Record<string,unknown>[]=[];
 function walk(value:unknown){if(Array.isArray(value)){value.forEach(walk);return;}if(!value||typeof value!=='object')return;const object=value as Record<string,unknown>;if(object.sha256&&object.bytes)descriptors.push(object);Object.values(object).forEach(walk);}
 walk(manifests.get(row.sourceArchive));
 if(!descriptors.some(item=>item.sha256===row.sha256&&item.bytes===row.bytes&&['path','relativePath','file'].some(key=>typeof item[key]==='string'&&basename(item[key] as string)===basename(row.publicPath))))throw Error(`Editorial file is not in its original manifest: ${row.publicPath}`);
 if(!/^\/images\/editorial\/[a-z/-]+\/[^/]+\.(webp|svg)$/.test(row.publicPath)||row.publicPath.includes('..'))throw Error('Unsafe editorial public path');
 for(const root of process.argv.includes('--built')?['client/public','dist/public']:['client/public']){const data=await readFile(new URL(`../${root}${row.publicPath}`,import.meta.url));if(data.length!==row.bytes||hash(data)!==row.sha256)throw Error(`Editorial original bytes changed: ${row.publicPath}`);}
 if(remote){const response=await fetch(remote+row.publicPath,{redirect:'error',signal:AbortSignal.timeout(30000)});const type=row.format==='svg'?'image/svg+xml':'image/webp';if(!response.ok||!response.headers.get('content-type')?.startsWith(type))throw Error(`Editorial public response unavailable: ${row.publicPath}`);const data=new Uint8Array(await response.arrayBuffer());if(data.length!==row.bytes||hash(data)!==row.sha256)throw Error(`Editorial HTTP byte mismatch: ${row.publicPath}`);}
 files++;bytes+=row.bytes;
}
if(files!==26)throw Error('Expected26 optimized supplied editorial files');
console.log(`Ready editorial media PASS: ${files} original files/${bytes} bytes from six immutable source manifests${process.argv.includes('--built')?', built copies':''}${remote?', unauthenticated HTTP bytes':''}. Coach art does not enable Coach access; static artwork never replaces measured graphs.`);
