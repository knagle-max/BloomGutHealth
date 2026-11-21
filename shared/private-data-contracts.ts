import {z} from 'zod';
import {labSchema} from './precision-nutrition';
import {recognizedMealTimeZone} from './meal-time';

export const PRIVATE_DATA_PROTOCOL='private-data-prototype-v1' as const;
const opaque=z.string().min(1).max(128).regex(/^[A-Za-z0-9:_-]+$/);
export const privateDataContextSchema=z.object({
 actorId:opaque,purpose:z.literal('synthetic-reference'),sourceEpoch:opaque,
 consentEpoch:opaque,policyRevision:opaque,
}).strict();
/** Codec validation is not authentication, scientific review or real-data consent. */
export const privateSourceSchema=z.object({
 ownerId:opaque,id:opaque,revision:opaque,kind:z.literal('lab'),
 timeZone:z.string().min(1).max(100).refine(recognizedMealTimeZone).nullable(),
 provenance:z.object({scope:z.literal('synthetic-reference'),sourceId:opaque,sourceVersion:opaque}).strict(),
 payload:labSchema,
}).strict();
export const privateDataRequestSchema=z.object({
 version:z.literal(PRIVATE_DATA_PROTOCOL),operation:z.literal('read-source'),
 context:privateDataContextSchema,sourceId:opaque,sourceRevision:opaque,
}).strict();
export const privateDataResponseSchema=z.discriminatedUnion('status',[
 z.object({version:z.literal(PRIVATE_DATA_PROTOCOL),status:z.literal('available'),source:privateSourceSchema,
  context:privateDataContextSchema,externalTransferPermitted:z.literal(false)}).strict(),
 z.object({version:z.literal(PRIVATE_DATA_PROTOCOL),status:z.literal('unavailable')}).strict(),
]);
export type PrivateDataRequest=z.infer<typeof privateDataRequestSchema>;
export type PrivateDataResponse=z.infer<typeof privateDataResponseSchema>;
export type PrivateSource=z.infer<typeof privateSourceSchema>;
export interface DataExecutionTransport {
 readonly mode:'bloom_cloud'|'local_private'|'customer_gateway';
 execute(request:PrivateDataRequest):Promise<PrivateDataResponse>;
}
/** Explicit client/process composition only. No global database or mode mutation.
 * Cloud is returned unchanged, even when an optional prototype was supplied. */
export function selectDataExecutionTransport(input:{
 cloud:DataExecutionTransport;mode?:DataExecutionTransport['mode'];
 prototypeEnabled?:boolean;localPrototype?:DataExecutionTransport;
}):DataExecutionTransport{
 if(input.cloud.mode!=='bloom_cloud')throw Error('CLOUD_TRANSPORT_REQUIRED');
 if(input.mode===undefined||input.mode==='bloom_cloud')return input.cloud;
 if(input.mode!=='local_private'||input.prototypeEnabled!==true||input.localPrototype?.mode!=='local_private')
  throw Error('PRIVATE_TRANSPORT_UNAVAILABLE');
 return input.localPrototype;
}
