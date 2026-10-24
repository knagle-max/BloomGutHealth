import { abundanceSchema } from "../shared/report-import";
const limitation="Relative organism percentages do not establish gene activity, metabolite concentrations, personal health scores, supplement doses or a biologically optimal range.";
/** Defense in depth: even an older processing service cannot reintroduce prototype effects. */
export function reportedAbundanceAnalysis(sampleId:string,reported:unknown){
 const percentages=abundanceSchema.parse(reported);
 const positive=Object.values(percentages).filter(v=>v>0),total=positive.reduce((a,b)=>a+b,0);
 const diversity=total>0?-positive.reduce((n,v)=>n+(v/total)*Math.log(v/total),0):null;
 return {sample_id:sampleId,status:"completed",model_version:"reported-abundance-v3",interpretation_status:"reported_composition_only",confidence:null,diversity_index:diversity,
  bacterial_composition:Object.entries(percentages).map(([bacterial_name,abundance])=>({bacterial_name,abundance,taxonomy_level:"reported taxon",genome_data:{gene_count:null,metabolic_pathways:[]}})),
  metabolites:[] as any[],health_impacts:[],recommendations:[] as any[],cohort_comparisons:{},limitations:[limitation,"Shannon diversity describes the supplied relative composition; a higher value does not establish better health."]};
}
/** Retain historical metadata without returning unsupported numerical effect payloads. */
export function historicalAnalysisMetadata(analyses:any[]){return analyses.map(a=>({id:a.id,sampleId:a.sampleId,analysisType:a.analysisType,modelVersion:a.modelVersion,createdAt:a.createdAt,confidence:null,results:null,interpretationStatus:"historical_model_outputs_withheld",limitation}));}

/** Historical original file paths are server metadata, never browser API fields. */
export function publicSample<T extends { rawDataPath?: unknown }>(sample:T) {
  const {rawDataPath: _privatePath, ...visible}=sample;
  return visible;
}
