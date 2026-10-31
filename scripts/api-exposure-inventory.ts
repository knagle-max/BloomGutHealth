import {extractApiDeclarations,type ApiDeclaration,type UnresolvedDeclaration} from './lib/api-exposure';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Source evidence, not an authorization or runtime reachability proof. No source execution.
const entries:ApiDeclaration[]=[],unresolvedDeclarations:UnresolvedDeclaration[]=[];
const sourceHashes:Record<string,string>={};
for(const file of (await readdir(new URL('../server/',import.meta.url))).filter(file=>file.endsWith('.ts')).sort()){
 const content=await readFile(new URL('../server/'+file,import.meta.url),'utf8');
 const found=extractApiDeclarations('server/'+file,content);entries.push(...found.entries);unresolvedDeclarations.push(...found.unresolved);
 if(found.entries.length||found.unresolved.length)sourceHashes['server/'+file]=createHash('sha256').update(content).digest('hex');
}
const output=JSON.stringify({version:2,scope:'Static string and array /api declarations on app/router receivers in top-level server/*.ts; dynamic paths and unscoped middleware flagged separately',limitations:['USE rows are middleware mounts, not endpoints','Unresolved declarations are source sites, not enumerated endpoint counts; templates/bindings are never evaluated','Nonliteral USE may be global middleware or a dynamic mount; call arguments/inline bodies are omitted from summaries','Receiver aliases, chained/indirect registration, Python, UI, jobs, tools, export fields and caches are not enumerated','In-handler auth, execution guards, family mounts and output filtering require manual review','REVIEW_REQUIRED is an inventory disposition, not a change to release approval or public access'],sourceHashes,entries,unresolvedDeclarations},null,2)+'\n';
const target=new URL('../docs/operations/API_EXPOSURE_INVENTORY.json',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==output)throw Error('API source inventory changed; regenerate and review actual exposure');console.log('API source inventory matches current declarations');}
else{await writeFile(target,output);console.log(`Recorded ${entries.length} static API declarations including mounts, plus ${unresolvedDeclarations.length} unresolved path declarations; authorization review remains open`);}
