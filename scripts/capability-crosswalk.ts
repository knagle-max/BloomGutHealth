import {readFile,writeFile} from 'node:fs/promises';
import {inspectCapabilityCrosswalk} from './lib/capability-crosswalk';
const target=new URL('../docs/operations/CAPABILITY_EXPOSURE_MAP.json',import.meta.url);
const registry=JSON.parse(await readFile(new URL('../docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json',import.meta.url),'utf8'));
const result=await inspectCapabilityCrosswalk(JSON.parse(await readFile(target,'utf8')),registry,path=>readFile(new URL('../'+path,import.meta.url),'utf8'));
if(process.argv.length!==3||!['--write','--check'].includes(process.argv[2]))throw Error('Use --check or --write (after source review)');
if(process.argv[2]==='--write')await writeFile(target,JSON.stringify({...result.map,sourceHashes:result.hashes},null,2)+'\n');
else if(!result.unchanged)throw Error('Crosswalk source changed; review the affected feature surfaces before refreshing hashes');
console.log(`Source crosswalk: ${result.map.entries.length} registry IDs, ${Object.keys(result.hashes).length} source files; all authorization review remains REQUIRED. No runtime approval inferred.`);
