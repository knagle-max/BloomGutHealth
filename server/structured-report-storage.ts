import {createHash} from 'node:crypto';
import {and,eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {microbiomeSamples,bacterialComposition,mlAnalyses} from '../shared/schema';
import {reportImportIdentity,ReportSaveConflict,type StructuredReport,type ReportImportFields,type ReportSaveResult} from '../shared/structured-report';
import {saveStructuredReport} from './report-routes';
const stable=(value:unknown):unknown=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,entry])=>entry!==undefined).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,entry])=>[key,stable(entry)])):value;
/** One atomic owned sample and children. Receipt metadata is erased with it. */
export async function importStructuredReportWithReceipt(db:any,userId:string,report:StructuredReport,fields:ReportImportFields,filename:string|null,key:string):Promise<ReportSaveResult>{
 if(!userId||!z.string().uuid().safeParse(key).success)throw Error('INVALID_REPORT_KEY');
 const id='report_'+createHash('sha256').update(reportImportIdentity(userId,key)).digest('hex'),requestHash=createHash('sha256').update(JSON.stringify(stable({userId,source:report.sourceReport,fields,filename}))).digest('hex');
 return db.transaction(async(tx:any)=>{
  // Matches the existing account-erasure lock so an import cannot survive erasure.
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
  const[previous]=await tx.select().from(microbiomeSamples).where(and(eq(microbiomeSamples.id,id),eq(microbiomeSamples.userId,userId)));
  if(previous){
   const stored=previous.structuredData,info=stored?.importInfo;
   if(info?.saveReceipt?.version!==1||info.saveReceipt.requestHash!==requestHash)throw new ReportSaveConflict();
   if(previous.processingStatus!=='completed'||stored.schemaVersion!=='bloom-report-v2'||!Array.isArray(stored.scores)||!Array.isArray(stored.organisms)||!Array.isArray(stored.missingData)||!['import-date','user-provided','report-provided'].includes(info.dateSource))throw Error('REPORT_RECEIPT_UNAVAILABLE');
   return {success:true,sampleId:id,preview:{kind:stored.kind,scores:stored.scores.length,reportedOrganisms:stored.organisms.length,quantifiedTaxa:Object.keys(stored.bacteria_percentages||{}).length,dateSource:info.dateSource,missingData:stored.missingData}};
  }
  const pending:any[]=[];
  return saveStructuredReport({
   insertMicrobiomeSample:async data=>{
    const source=data.structuredData as any;
    const[row]=await tx.insert(microbiomeSamples).values({...data,id,structuredData:{...source,importInfo:{...source.importInfo,saveReceipt:{version:1,requestHash}}}}).returning();return row;
   },
   insertBacterialComposition:async row=>{pending.push(row);},
   insertMlAnalysis:async row=>(await tx.insert(mlAnalyses).values(row).returning({id:mlAnalyses.id}))[0].id,
   updateMicrobiomeSample:async(sampleId,updates)=>{
    if(updates.processingStatus==='completed')for(let index=0;index<pending.length;index+=500)await tx.insert(bacterialComposition).values(pending.slice(index,index+500));
    await tx.update(microbiomeSamples).set(updates).where(and(eq(microbiomeSamples.id,sampleId),eq(microbiomeSamples.userId,userId)));
   },
  },userId,report,fields,filename);
 });
}
