import{reportDeletionRevision}from"./report-records";
import{ReportDeletionConflict,viomeRelationshipCommandSchema,type ViomeRelationshipCommand,type ViomeRelationshipResult}from"../shared/report-management";
import {createHash,randomUUID} from 'node:crypto';
import {and,eq,ne,inArray,asc,sql} from 'drizzle-orm';
import {z} from 'zod';
import {microbiomeSamples,bacterialComposition,mlAnalyses,metabolites,healthImpacts,recommendations} from '../shared/schema';
import {reportImportIdentity,ReportSaveConflict,parseStructuredReport,type StructuredReport,type ReportImportFields,type ReportSaveResult} from '../shared/structured-report';
import {saveStructuredReport} from './report-routes';
import {assertViomeImportMetadata} from '../shared/viome-findings';
import {viomeSource,compatibleViomeCompanion,sameViomeBiologicalFacts,ViomeReportContextError,withViomeSpecimenEvent} from '../shared/viome-report-context';
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
   const linked=await tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),sql`COALESCE(${microbiomeSamples.structuredData}->'sourceReport'->'specimenEvent'->>'rootReportId',${microbiomeSamples.structuredData}->'specimenEvent'->>'rootReportId') = ${rootId}`));
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
export async function deleteOwnedMicrobiomeReport(db:any,userId:string,id:string,expectedRevision?:string){
 if(!userId)throw Error('Account context is required');
 return db.transaction(async(tx:any)=>{
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
  const[owned]=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId))).for("update");
  if(!owned)return false;
  if(expectedRevision&&reportDeletionRevision(owned)!==expectedRevision)throw new ReportDeletionConflict();
  const linked=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),sql`COALESCE(${microbiomeSamples.structuredData}->'sourceReport'->'specimenEvent'->>'rootReportId',${microbiomeSamples.structuredData}->'specimenEvent'->>'rootReportId') = ${id}`));
  for(const row of linked){if(!viomeSource(row.structuredData))continue;const data=withViomeSpecimenEvent(row.structuredData);await tx.update(microbiomeSamples).set({structuredData:data}).where(and(eq(microbiomeSamples.id,row.id),eq(microbiomeSamples.userId,userId)));}
  const remainingOwned=tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),ne(microbiomeSamples.id,id)));
  const sourceBacteria=tx.select({id:bacterialComposition.id}).from(bacterialComposition).where(eq(bacterialComposition.sampleId,id));
  const sourceAnalyses=tx.select({id:mlAnalyses.id}).from(mlAnalyses).where(eq(mlAnalyses.sampleId,id));
  const sourceMetabolites=tx.select({id:metabolites.id}).from(metabolites).where(eq(metabolites.sampleId,id));
  // Shared nullable references in independently retained owned reports are
  // unlinked, never cascaded. Unexpected foreign references fail/roll back.
  await tx.update(metabolites).set({bacterialId:null}).where(and(inArray(metabolites.sampleId,remainingOwned),inArray(metabolites.bacterialId,sourceBacteria)));
  await tx.update(recommendations).set({analysisId:null}).where(and(inArray(recommendations.sampleId,remainingOwned),inArray(recommendations.analysisId,sourceAnalyses)));
  await tx.delete(recommendations).where(eq(recommendations.sampleId,id));
  await tx.delete(healthImpacts).where(inArray(healthImpacts.metaboliteId,sourceMetabolites));
  await tx.delete(metabolites).where(eq(metabolites.sampleId,id));
  await tx.delete(bacterialComposition).where(eq(bacterialComposition.sampleId,id));
  await tx.delete(mlAnalyses).where(eq(mlAnalyses.sampleId,id));
  await tx.delete(microbiomeSamples).where(and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId)));return true;
 });
}

/** Existing source metadata remains the relationship truth. A bounded latest
 * operation receipt in importInfo protects retries without a parallel store. */
export async function changeOwnedViomeRelationship(db:any,userId:string,id:string,command:ViomeRelationshipCommand,expectedRevision:string):Promise<ViomeRelationshipResult>{
 if(!userId)throw Error("Account context is required");
 if(!viomeRelationshipCommandSchema.safeParse(command).success||!/^[a-f0-9]{64}$/.test(expectedRevision)||id===command.companionId)throw new ViomeReportContextError("incompatible");
 return db.transaction(async(tx:any)=>{
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
  const rows=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),inArray(microbiomeSamples.id,[id,command.companionId]))).orderBy(asc(microbiomeSamples.id)).for("update");
  const selected=rows.find((row:any)=>row.id===id),other=rows.find((row:any)=>row.id===command.companionId);
  if(!selected||!other)throw new ViomeReportContextError("unavailable");
  const a=selected.processingStatus==="completed"?viomeSource(selected.structuredData):null,b=other.processingStatus==="completed"?viomeSource(other.structuredData):null;
  if(!a||!b)throw new ViomeReportContextError("incompatible");
  const aToB=a.specimenEvent?.rootReportId===other.id,bToA=b.specimenEvent?.rootReportId===selected.id,paired=aToB||bToA;
  const compatible=compatibleViomeCompanion({...a,specimenEvent:undefined},{...b,specimenEvent:undefined});
  // This hash identifies an internal mutation command, never source PDF bytes,
  // provider identity or a semantic report-deduplication fingerprint.
  const requestHash=createHash('sha256').update(JSON.stringify([userId,id,expectedRevision,command.action,command.companionId,command.companionRevision])).digest('hex');
  const replay=rows.every((row:any)=>{
   const receipt=row.structuredData?.importInfo?.relationshipReceipt;
   if(receipt?.version!==1||receipt.requestHash!==requestHash)return false;
   const data=structuredClone(row.structuredData);delete data.importInfo.relationshipReceipt;
   return receipt.stateRevision===reportDeletionRevision({...row,structuredData:data});
  });
  if(replay){
   if(command.action==="link"?paired&&compatible:!aToB&&!bToA)return{success:true,state:command.action==="link"?"linked":"unlinked"};
   throw new ViomeReportContextError("changed");
  }
  if(reportDeletionRevision(selected)!==expectedRevision||reportDeletionRevision(other)!==command.companionRevision)throw new ViomeReportContextError("changed");
  if(a.specimenEvent&&!aToB||b.specimenEvent&&!bToA)throw new ViomeReportContextError("occupied");
  let childId:string|undefined;
  if(command.action==="link"){
   if(!compatible)throw new ViomeReportContextError("incompatible");
   const linked=await tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),sql`COALESCE(${microbiomeSamples.structuredData}->'sourceReport'->'specimenEvent'->>'rootReportId',${microbiomeSamples.structuredData}->'specimenEvent'->>'rootReportId') IN (${id},${command.companionId})`));
   if(linked.some((row:any)=>row.id!==id&&row.id!==command.companionId))throw new ViomeReportContextError("occupied");
   childId=aToB?selected.id:bToA?other.id:a.documentKind==="active-gut-microbes"?other.id:selected.id;
  }
  const mutationId=randomUUID();
  for(const row of rows){
   // Normalize only already-recognized native findings to the existing wrapper.
   // All original biological fields remain in sourceReport without alteration.
   const envelope=row.structuredData?.sourceReport?row.structuredData:parseStructuredReport(row.structuredData);
   const data=withViomeSpecimenEvent(envelope,command.action==="link"&&row.id===childId?{rootReportId:row.id===selected.id?other.id:selected.id,confirmed:true}:undefined);
   data.importInfo={...data.importInfo,relationshipRevision:mutationId};delete data.importInfo.relationshipReceipt;
   const stateRevision=reportDeletionRevision({...row,structuredData:data});
   data.importInfo.relationshipReceipt={version:1,requestHash,stateRevision};
   await tx.update(microbiomeSamples).set({structuredData:data}).where(and(eq(microbiomeSamples.id,row.id),eq(microbiomeSamples.userId,userId)));
  }
  return{success:true,state:command.action==="link"?"linked":"unlinked"};
 });
}
