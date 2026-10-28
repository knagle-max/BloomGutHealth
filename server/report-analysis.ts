import type {RequestHandler} from 'express';
import type {IStorage} from './storage';
import {abundanceSchema} from '../shared/report-import';
import {reportedAbundanceAnalysis} from './analysis-boundary';
type Store=Pick<IStorage,'getMicrobiomeSample'|'updateMicrobiomeSample'|'insertMlAnalysis'|'getBacterialComposition'|'insertBacterialComposition'>;
/** Describes only supplied relative abundances. No sidecar/model/provider transfer. */
export function analyzeReportedComposition(store:Store):RequestHandler{
 return async(req,res)=>{
  let authorizedSampleId:string|undefined,authorizedOwner:string|undefined;
  try{
   const userId=req.session?.userId;if(!userId)return void res.status(401).json({error:'Authentication required'});
   const sampleId=String(req.params.sampleId),sample=await store.getMicrobiomeSample(sampleId,userId);
   if(!sample)return void res.status(404).json({error:'Sample not found'});
   if(sample.userId!==userId)return void res.status(403).json({error:'Access denied'});
   const reported=abundanceSchema.safeParse((sample.structuredData as any)?.bacteria_percentages);
   if(!reported.success)return void res.status(422).json({error:'This report has no supported quantitative bacterial percentages. Functional scores and organism detection are viewable report data, not inputs for abundance-based modelling. No analysis was run.'});
   authorizedSampleId=sampleId;authorizedOwner=userId;
   await store.updateMicrobiomeSample(sampleId,{processingStatus:'processing'},userId);
   const result=reportedAbundanceAnalysis(sampleId,reported.data);
   const analysisId=await store.insertMlAnalysis({sampleId,analysisType:'reported-composition',modelVersion:result.model_version,results:result,confidence:null,comparedCohorts:[]});
   const existing=await store.getBacterialComposition(sampleId,userId);
   for(const bacteria of result.bacterial_composition){
    if(existing.some(row=>row.bacterialName===bacteria.bacterial_name))continue;
    await store.insertBacterialComposition({sampleId,bacterialName:bacteria.bacterial_name,taxonomyLevel:bacteria.taxonomy_level,abundance:bacteria.abundance,genomeData:null});
   }
   await store.updateMicrobiomeSample(sampleId,{diversityIndex:result.diversity_index,processingStatus:'completed'},userId);
   res.json({success:true,analysisId,results:result});
  }catch{
   if(authorizedSampleId&&authorizedOwner)await store.updateMicrobiomeSample(authorizedSampleId,{processingStatus:'failed'},authorizedOwner).catch(()=>{});
   console.error('Reported composition could not be summarized.');
   res.status(503).json({error:'Report summary could not be completed. Please retry later.'});
  }
 };
}
