import {
 PRIVATE_DATA_PROTOCOL,privateDataContextSchema,privateDataRequestSchema,privateDataResponseSchema,privateSourceSchema,
 type DataExecutionTransport,type PrivateDataResponse,
} from '../shared/private-data-contracts';
import type {z} from 'zod';
type Context=z.infer<typeof privateDataContextSchema>;
export type SyntheticPrivateAuthority=Context&{permitted:boolean};
const unavailable=():PrivateDataResponse=>({version:PRIVATE_DATA_PROTOCOL,status:'unavailable'});
const sameContext=(a:Context,b:Context)=>a.actorId===b.actorId&&a.purpose===b.purpose
 &&a.sourceEpoch===b.sourceEpoch&&a.consentEpoch===b.consentEpoch&&a.policyRevision===b.policyRevision;
/** Bounded read-only fixture adapter, never a vault, gateway or authentication
 * system. No HTTP route, browser registration, file persistence, URLs or keys.
 * Authority is supplied by trusted composition, never by request/model arguments.
 * Write/correction/export/recovery and real-data enrollment remain unsupported. */
export function createSyntheticPrivateTransport(input:{
 enabled?:boolean;fixtures:readonly unknown[];fixtureContext?:Context;
 authority:()=>Promise<SyntheticPrivateAuthority>;
}):DataExecutionTransport{
 // Disabled mode does not parse fixtures, query authority or install anything.
 if(input.enabled!==true)return{mode:'local_private',execute:async()=>unavailable()};
 if(input.fixtures.length>20||Buffer.byteLength(JSON.stringify(input.fixtures),'utf8')>65536)
  throw Error('PRIVATE_FIXTURE_UNAVAILABLE');
 const captured=privateDataContextSchema.parse(input.fixtureContext);
 const fixtures=input.fixtures.map(row=>privateSourceSchema.parse(row));
 if(fixtures.some(row=>row.ownerId!==captured.actorId))throw Error('PRIVATE_FIXTURE_UNAVAILABLE');
 let revoked=false;
 if(new Set(fixtures.map(row=>JSON.stringify([row.ownerId,row.id]))).size!==fixtures.length)
  throw Error('PRIVATE_FIXTURE_UNAVAILABLE');
 const authority=async()=>{
  const raw=await input.authority();
  if(raw.permitted!==true){revoked=true;throw Error('PRIVATE_FIXTURE_UNAVAILABLE');}
  const current=privateDataContextSchema.parse({actorId:raw.actorId,purpose:raw.purpose,
   sourceEpoch:raw.sourceEpoch,consentEpoch:raw.consentEpoch,policyRevision:raw.policyRevision});
  if(!sameContext(current,captured)){revoked=true;throw Error('PRIVATE_FIXTURE_UNAVAILABLE');}
  return current;
 };
 return{mode:'local_private',async execute(untrusted){
  try{
   if(revoked||Buffer.byteLength(JSON.stringify(untrusted),'utf8')>16384)return unavailable();
   const request=privateDataRequestSchema.parse(untrusted);
   if(!sameContext(request.context,captured))return unavailable();
   const before=await authority();
   if(!sameContext(request.context,before))return unavailable();
   const source=fixtures.find(row=>row.ownerId===before.actorId&&row.id===request.sourceId
    &&row.revision===request.sourceRevision);
   if(!source)return unavailable();
   const response=privateDataResponseSchema.parse({version:PRIVATE_DATA_PROTOCOL,status:'available',
    source:structuredClone(source),context:before,externalTransferPermitted:false});
   if(Buffer.byteLength(JSON.stringify(response),'utf8')>65536)return unavailable();
   const after=await authority();
   if(revoked||!sameContext(before,after))return unavailable();
   return response;
  }catch{return unavailable();}
 }};
}
