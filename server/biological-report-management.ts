import{and,eq,asc,sql}from'drizzle-orm';
import{microbiomeSamples,precisionRecords,users}from'../shared/schema';
import{biologicalReportCategorySchema,biologicalReportDeleteSchema,BiologicalReportConflict,type BiologicalReportCategory,type BiologicalReportSnapshot,type BiologicalReportDelete}from'../shared/biological-report-management';
import{reportDeletionRevision}from'./report-records';
import{viomeSource}from'../shared/viome-report-context';
import{PrecisionStorage}from'./precision-storage';
import{deleteOwnedMicrobiomeReport}from'./structured-report-storage';
const iso=(value:unknown)=>{if(!value)return null;const date=new Date(value as string);return Number.isFinite(+date)?date.toISOString():null;};
/** Read adapters over existing canonical stores; no new source or deletion model. */
export async function getBiologicalReports(database:any,userId:string,category:BiologicalReportCategory):Promise<BiologicalReportSnapshot>{
 if(!userId||!biologicalReportCategorySchema.safeParse(category).success)throw new BiologicalReportConflict();
 const precision=new PrecisionStorage(database);
 if(category==='genetics'){const snapshot=await precision.getGeneticSources(userId);return{category,selectionRevision:snapshot.selectionRevision,selectionState:snapshot.state,reports:snapshot.sources.map(row=>({id:row.id,revision:row.revision,type:'dataset',source:row.provider==='manual'?'Manual SNP entries':row.provider==='23andMe'?'Selected DNA-file calls':'Unrecognized genetic source',status:row.active?'Active dataset':row.readable?'Historical dataset':'Source format unavailable',sourceDate:row.collectedAt,sourceDateKind:row.collectedAt?'collection':null,deletable:true,uploadedAt:row.createdAt,observations:row.callCount,versions:1,active:row.active,viewHref:'/precision?tab=genetics&geneticSource='+encodeURIComponent(row.id)}))};}
 if(category==='bloodwork'){const sources=await precision.getLabSources(userId);return{category,reports:sources.map(source=>({id:source.id,revision:source.revision,type:source.scope,source:source.scope==='report'?'Imported laboratory source':'Independent laboratory result',status:source.manageable===false?'Conflicting source references; review individual results':source.results===null?'Source format unavailable':'Saved source',sourceDate:source.dates.length===1?source.dates[0]:null,sourceDateKind:source.dates.length===1?'recorded':null,deletable:source.manageable!==false,uploadedAt:source.savedAt||null,observations:source.results,versions:source.records,viewHref:source.detailRecordId?'/precision?tab=labs&labResult='+encodeURIComponent(source.detailRecordId):null}))};}
 const rows=await database.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,userId));
 return{category,reports:rows.map((row:any)=>{const native=viomeSource(row.structuredData);return{id:row.id,revision:reportDeletionRevision(row),type:'report',source:native?native.documentKind==='active-gut-microbes'?'Viome organism report':'Viome assessments & foods':typeof row.testingCompany==='string'&&row.testingCompany.trim()?row.testingCompany.trim().slice(0,150):'Microbiome report',status:row.processingStatus,sourceDate:native?.biologicalDates.collectedOn||null,sourceDateKind:native?.biologicalDates.collectedOn?'collection':null,deletable:true,uploadedAt:iso(row.uploadedAt),observations:native?native.organisms.length+native.assessments.length+native.foods.length:null,versions:null,viewHref:'/microbiome?sample='+encodeURIComponent(row.id)};})};
}
/** Validate the whole intent first; canonical services run within one owned transaction. */
export async function deleteBiologicalReports(database:any,userId:string,input:BiologicalReportDelete){
 const parsed=biologicalReportDeleteSchema.safeParse(input);if(!userId||!parsed.success)throw new BiologicalReportConflict();const command=parsed.data;
 return database.transaction(async(tx:any)=>{
  const[owner]=await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for('share');if(!owner)throw new BiologicalReportConflict();
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
  // Parent locks also fence legacy row writers that predate the account lock.
  if(command.category==='microbiome')await tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(eq(microbiomeSamples.userId,userId)).orderBy(asc(microbiomeSamples.id)).for('update');
  else await tx.select({id:precisionRecords.id}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,command.category==='genetics'?'genetics':'lab'))).orderBy(asc(precisionRecords.id)).for('update');
  const snapshot=await getBiologicalReports(tx,userId,command.category),byId=new Map(snapshot.reports.map(row=>[row.id,row]));
  const present=command.reports.filter(row=>byId.has(row.id));
  if(!present.length&&(!snapshot.reports.length||command.scope==='selected'))return{success:true as const,state:'not-present' as const};
  if(present.length!==command.reports.length||command.scope==='category'&&snapshot.reports.length!==command.reports.length||command.category==='genetics'&&command.selectionRevision!==snapshot.selectionRevision||command.reports.some(row=>byId.get(row.id)?.revision!==row.revision||!byId.get(row.id)?.deletable))throw new BiologicalReportConflict();
  const precision=new PrecisionStorage(tx);
  for(const row of command.reports){
   if(command.category==='microbiome')await deleteOwnedMicrobiomeReport(tx,userId,row.id);
   else if(command.category==='bloodwork')await precision.deleteLabSource(userId,row.id,row.revision);
   else{const current=await precision.getGeneticSources(userId),source=current.sources.find(source=>source.id===row.id);if(!source)throw new BiologicalReportConflict();await precision.changeGeneticSource(userId,{action:'delete',sourceId:row.id,sourceRevision:source.revision,selectionRevision:current.selectionRevision,confirmed:true});}
  }
  return{success:true as const,state:'deleted' as const};
 });
}
