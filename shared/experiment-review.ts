import { experimentSchema } from "./experience";
/** Descriptive minimum only. Three entries is not a power calculation or proof
 * of reliability, significance, effectiveness or a causal intervention effect. */
export function reviewExperiment(input: unknown) {
  const parsed=experimentSchema.safeParse(input);
  const caveat="Self-reported before/after observations cannot establish cause. Measurement variability, medicines, sleep, illness, exercise and other changes may explain differences.";
  if(!parsed.success||!parsed.data.design)return {status:"insufficient-data" as const,change:null,baseline:null,followup:null,unit:null,note:"Define a baseline, one outcome, units and a consistent measurement method.",caveat};
  const {design,observations,startsOn}=parsed.data;
  const before=observations.filter(o=>o.date<startsOn),after=observations.filter(o=>o.date>=startsOn);
  if(before.length<3||after.length<3)return {status:"insufficient-data" as const,change:null,baseline:null,followup:null,unit:design.metricUnit,note:`Recorded ${before.length} baseline and ${after.length} intervention days. At least three distinct days in each period are needed for this descriptive display; this does not establish scientific adequacy.`,caveat};
  const median=(entries:typeof observations)=>{const values=entries.map(o=>o.value).sort((a,b)=>a-b),m=Math.floor(values.length/2);return values.length%2?values[m]:(values[m-1]+values[m])/2;};
  return {status:"observed-change" as const,change:median(after)-median(before),baseline:median(before),followup:median(after),unit:design.metricUnit,
    note:`Median values across ${before.length} baseline and ${after.length} intervention days. ${after.some(o=>o.adherence===null)?"Intervention adherence is incomplete.":"Adherence was self-reported."} ${observations.some(o=>!o.confounders)?"Other changes were not recorded for every observation.":"Review the recorded confounders."} No statistical or clinical significance is inferred.`,caveat};
}
