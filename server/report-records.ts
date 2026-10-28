import{and,eq,getTableColumns}from'drizzle-orm';import{microbiomeSamples,bacterialComposition,mlAnalyses,type MicrobiomeSample}from'../shared/schema';import type{db}from'./db';
type Database=Pick<typeof db,'select'|'update'>;
export type SampleUpdates=Partial<Omit<MicrobiomeSample,'id'|'userId'>>;
function scope(id:string,userId:string){if(typeof userId!=='string'||!userId)throw Error('Account context is required');return and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId));}
export async function getOwnedSample(database:Database,id:string,userId:string){
 const where=scope(id,userId);const[sample]=await database.select().from(microbiomeSamples).where(where);return sample;
}
export async function updateOwnedSample(database:Database,id:string,updates:SampleUpdates,userId:string):Promise<void>{
 const where=scope(id,userId);if(Object.hasOwn(updates,'id')||Object.hasOwn(updates,'userId'))throw Error('Report ownership cannot be changed');
 const[updated]=await database.update(microbiomeSamples).set(updates).where(where).returning({id:microbiomeSamples.id});if(!updated)throw Error('Report not found in your account');
}
export async function getOwnedComposition(database:Database,sampleId:string,userId:string){
 const where=scope(sampleId,userId);return database.select(getTableColumns(bacterialComposition)).from(bacterialComposition).innerJoin(microbiomeSamples,eq(bacterialComposition.sampleId,microbiomeSamples.id)).where(where);
}
export async function getOwnedAnalyses(database:Database,sampleId:string,userId:string){
 const where=scope(sampleId,userId);return database.select(getTableColumns(mlAnalyses)).from(mlAnalyses).innerJoin(microbiomeSamples,eq(mlAnalyses.sampleId,microbiomeSamples.id)).where(where);
}
