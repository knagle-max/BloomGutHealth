import {createHash} from 'node:crypto';
import {and,eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {microbiomeSamples,bacterialComposition,mlAnalyses} from '../shared/schema';
import {reportImportIdentity,ReportSaveConflict,type StructuredReport,type ReportImportFields,type ReportSaveResult} from '../shared/structured-report';
import {saveStructuredReport} from './report-routes';
import {assertViomeImportMetadata} from '../shared/viome-findings';
import {viomeSource,compatibleViomeCompanion,sameViomeBiologicalFacts,ViomeReportContextError} from '../shared/viome-report-context';
const stable=(value:unknown):unknown=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,entry])=>entry!==undefined).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,entry])=>[key,stable(entry)])):value;
/** One atomic owned sample and children. Receipt metadata is erased with it. */
export async function importStructuredReportWithReceipt(db:any,userId:string,report:StructuredReport,fields:ReportImportFields,filename:string|null,key:string,reuseExistingReportId?:string):Promise<ReportSaveResult>{
 if(!userId||!z.string().uuid().safeParse(key).success)throw Error('INVALID_REPORT_KEY');
 assertViomeImportMetadata(report.sourceReport,fields,filename);
 const id='report_'+createHash('sha256').update(reportImportIdentity(userId,key)).digest('hex'),requestHash=createHash('sha256').update(JSON.stringify(stable({userId,source:report.sourceReport,fields,filename}))).digest('hex');
 return db.transaction(async(tx:any)=>{
  // Matches the existing account-erasure lock so an import cannot survive erasure.
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
  const source=viomeSource(report.sourceReport);
  const[previous]=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId)));
  if(reuseExistingReportId){
   if(previous)throw new ReportSaveConflict();
   if(!source||source.specimenEvent||Object.keys(fields).length||filename)throw new ViomeReportContextError('incompatible');
   const[existing]=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.id,reuseExistingReportId),eq(microbiomeSamples.userId,userId)));
   const prior=existing?.processingStatus==='completed'?viomeSource(existing.structuredData):null;
   if(!existing||!prior)throw new ViomeReportContextError('unavailable');
   if(!sameViomeBiologicalFacts(source,prior))throw new ViomeReportContextError('changed');
   const saved=existing.structuredData;
   return{success:true,sampleId:existing.id,reusedExisting:true,preview:{kind:saved.kind,scores:saved.scores.length,reportedOrganisms:saved.organisms.length,quantifiedTaxa:0,dateSource:saved.importInfo.dateSource,missingData:saved.missingData}};
  }
  if(previous){
   const stored=previous.structuredData,info=stored?.importInfo;
   if(info?.saveReceipt?.version!==1||info.saveReceipt.requestHash!==requestHash)throw new ReportSaveConflict();
   if(previous.processingStatus!=='completed'||stored.schemaVersion!=='bloom-report-v2'||!Array.isArray(stored.scores)||!Array.isArray(stored.organisms)||!Array.isArray(stored.missingData)||!['import-date','user-provided','report-provided'].includes(info.dateSource))throw Error('REPORT_RECEIPT_UNAVAILABLE');
   return {success:true,sampleId:id,preview:{kind:stored.kind,scores:stored.scores.length,reportedOrganisms:stored.organisms.length,quantifiedTaxa:Object.keys(stored.bacteria_percentages||{}).length,dateSource:info.dateSource,missingData:stored.missingData}};
  }
  if(source?.specimenEvent){
   const rootId=source.specimenEvent.rootReportId;
   const[root]=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.id,rootId),eq(microbiomeSamples.userId,userId)));
   const rootSource=root?.processingStatus==='completed'?viomeSource(root.structuredData):null;
   if(!rootSource)throw new ViomeReportContextError('unavailable');
   if(!compatibleViomeCompanion(source,rootSource))throw new ViomeReportContextError('incompatible');
   const linked=await tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),sql`${microbiomeSamples.structuredData}->'sourceReport'->'specimenEvent'->>'rootReportId' = ${rootId}`));
   if(linked.length)throw new ViomeReportContextError('occupied');
  }
  const pending:any[]=[];
  return saveStructuredReport({
   insertMicrobiomeSample:async data=>{
    const source=data.structuredData as any;
    const[row]=await tx.insert(microbiomeSamples).values({...data,id,structuredData:{...source,importInfo:{...source.importInfo,saveReceipt:{version:1,requestHash}}}}).returning();return row;
   },
   insertBacterialComposition:async(row,owner)=>{if(owner!==userId||row.sampleId!==id)throw Error('REPORT_OWNER_MISMATCH');pending.push(row);},
   insertMlAnalysis:async(row,owner)=>{if(owner!==userId||row.sampleId!==id)throw Error('REPORT_OWNER_MISMATCH');return(await tx.insert(mlAnalyses).values(row).returning({id:mlAnalyses.id}))[0].id;},
   updateMicrobiomeSample:async(sampleId,updates,owner)=>{
    if(owner!==userId||sampleId!==id)throw Error('REPORT_OWNER_MISMATCH');
    if(updates.processingStatus==='completed')for(let index=0;index<pending.length;index+=500)await tx.insert(bacterialComposition).values(pending.slice(index,index+500));
    await tx.update(microbiomeSamples).set(updates).where(and(eq(microbiomeSamples.id,sampleId),eq(microbiomeSamples.userId,userId)));
   },
  },userId,report,fields,filename);
 });
}

/** User-requested owned deletion. Only relationship metadata is removed from
 * surviving companions; their biological findings/manual data are preserved. */
export async function deleteOwnedViomeReport(db:any,userId:string,id:string){
 if(!userId)throw Error('Account context is required');
 return db.transaction(async(tx:any)=>{
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
  const[owned]=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId)));
  if(!owned||!viomeSource(owned.structuredData))return false;
  const linked=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),sql`${microbiomeSamples.structuredData}->'sourceReport'->'specimenEvent'->>'rootReportId' = ${id}`));
  for(const row of linked){if(!viomeSource(row.structuredData))continue;const data=structuredClone(row.structuredData);delete data.sourceReport.specimenEvent;await tx.update(microbiomeSamples).set({structuredData:data}).where(and(eq(microbiomeSamples.id,row.id),eq(microbiomeSamples.userId,userId)));}
  await tx.delete(bacterialComposition).where(eq(bacterialComposition.sampleId,id));await tx.delete(mlAnalyses).where(eq(mlAnalyses.sampleId,id));
  await tx.delete(microbiomeSamples).where(and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId)));return true;
 });
}
