import {z} from 'zod';
import {createHash} from 'node:crypto';
const paths=z.array(z.string().regex(/^(client\/src|server|shared|ml_service)\/(?!.*(?:\.\.|\\))[A-Za-z0-9_./-]+\.(?:ts|tsx|py)$/)).max(20);
const entry=z.object({featureId:z.string(),implementation:z.enum(['PREVIEW_SOURCE_PATHS','DENIED_SOURCE_PATHS','INCIDENT_RETIRED_SOURCE_PATHS','MIXED_REQUIRES_REVIEW','NOT_IMPLEMENTED']),surfaces:z.object({ui:paths,api:paths,logicOrJobs:paths,storedOrExported:paths,cache:paths}).strict(),observation:z.string().min(20),authorizationReview:z.literal('REVIEW_REQUIRED')}).strict();
const schema=z.object({version:z.literal(1),registryVersion:z.string(),scope:z.string().min(20),entries:z.array(entry),sourceHashes:z.record(z.string(),z.string().regex(/^[a-f0-9]{64}$/)).optional()}).strict();
/** Trace coverage, never runtime permission. Source is read as text, not imported. */
export async function inspectCapabilityCrosswalk(input:unknown,registry:{version:string;features:{feature_id:string}[]},read:(path:string)=>Promise<string>){
 const map=schema.parse(input),expected=new Set(registry.features.map(row=>row.feature_id)),ids=map.entries.map(row=>row.featureId);
 if(map.registryVersion!==registry.version||ids.length!==expected.size||new Set(ids).size!==ids.length||ids.some(id=>!expected.has(id)))throw Error('Capability crosswalk must cover the current registry exactly once');
 const hashes:Record<string,string>={};
 const sources=new Set(map.entries.flatMap(row=>Object.values(row.surfaces).flat()));
 for(const path of [...sources].sort())hashes[path]=createHash('sha256').update(await read(path)).digest('hex');
 return {map,hashes,unchanged:JSON.stringify(map.sourceHashes)===JSON.stringify(hashes)};
}
