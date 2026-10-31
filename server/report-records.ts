import{and,eq,getTableColumns,sql}from'drizzle-orm';import{microbiomeSamples,bacterialComposition,mlAnalyses,type MicrobiomeSample,type InsertBacterialComposition,type InsertMlAnalysis}from'../shared/schema';import type{db}from'./db';
type Database=Pick<typeof db,'select'|'update'|'insert'>;
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

/** INSERT…SELECT authorizes the parent in the same statement, without another lookup or an unowned child write. */
export async function insertOwnedComposition(database:Database,row:InsertBacterialComposition,userId:string):Promise<void>{
 const where=scope(row.sampleId,userId);
 const[inserted]=await database.insert(bacterialComposition).select(database.select({
  id:sql<string>`gen_random_uuid()::text`.as('id'),sampleId:microbiomeSamples.id,
  bacterialName:sql<string>`${row.bacterialName}::text`.as('bacterial_name'),taxonomyLevel:sql<string>`${row.taxonomyLevel}::text`.as('taxonomy_level'),abundance:sql<number>`${row.abundance}::real`.as('abundance'),
  genomeData:(row.genomeData==null?sql`null::jsonb`:sql`${JSON.stringify(row.genomeData)}::jsonb`).as('genome_data'),
 }).from(microbiomeSamples).where(where)).returning({id:bacterialComposition.id});
 if(!inserted)throw Error('Report not found in your account');
}
export async function insertOwnedAnalysis(database:Database,row:InsertMlAnalysis,userId:string):Promise<string>{
 const where=scope(row.sampleId,userId);
 const[inserted]=await database.insert(mlAnalyses).select(database.select({
  id:sql<string>`gen_random_uuid()::text`.as('id'),sampleId:microbiomeSamples.id,analysisType:sql<string>`${row.analysisType}::text`.as('analysis_type'),modelVersion:sql<string>`${row.modelVersion}::text`.as('model_version'),
  results:sql`${JSON.stringify(row.results)}::jsonb`.as('results'),confidence:sql<number|null>`${row.confidence??null}::real`.as('confidence'),
  explainability:(row.explainability==null?sql`null::jsonb`:sql`${JSON.stringify(row.explainability)}::jsonb`).as('explainability'),
  comparedCohorts:(row.comparedCohorts==null?sql`null::text[]`:sql`ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(row.comparedCohorts)}::jsonb))`).as('compared_cohorts'),analyzedAt:sql<Date>`now()`.as('analyzed_at'),
 }).from(microbiomeSamples).where(where)).returning({id:mlAnalyses.id});
 if(!inserted)throw Error('Report not found in your account');return inserted.id;
}
