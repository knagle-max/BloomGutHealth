import type {PrecisionReport} from './precision-nutrition';
import {labExplorerEntries,type LabExplorerEntry} from './lab-explorer';
import {assessLabComparability} from './lab-comparability';
import {sourceReferenceIntervalForPlot} from './lab-reference-interval';
import {labReportGroupKey,labDateText} from './lab-history';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
import {labEditorialFor,labEditorialSources} from './biology-labs';
import {goalGuidance} from './goal-guidance';

export const LAB_PANEL_REVIEW_VERSION='recorded-panel-review-2026-11-18-v3';
type Point=PrecisionReport['trends'][number]['points'][number];
export const labReviewFamilies=[
 {id:'lipids',name:'Lipids together',markers:['ldl','apob','hdl','triglycerides','non_hdl'],goals:['metabolic'],question:'Were any medicines changed before this collection?',context:'LDL, ApoB, HDL and triglycerides describe different aspects of the measured lipid picture. A lower triglyceride result alone does not establish an overall benefit.'},
 {id:'glycemic',name:'Glucose & HbA1c',markers:['glucose','hba1c'],goals:['metabolic'],question:'Was the glucose collection fasting?',context:'A glucose result and HbA1c cover different measurement contexts and timescales. One cannot substitute for the other.'},
 {id:'liver',name:'Liver markers together',markers:['alt','ast','ggt','alp','bilirubin','bilirubin_total','bilirubin_direct'],goals:['liver'],question:'Was there an acute illness before this collection?',context:'These are distinct liver and biliary observations. Their values do not establish a diagnosis or demonstrate organ recovery.'},
 {id:'iron-cbc',name:'Iron, nutrients & blood counts',markers:['ferritin','iron','tibc','transferrin','iron_saturation','hemoglobin','hematocrit','rbc','wbc','platelets','neutrophils','lymphocytes','eosinophils','basophils','monocytes','mcv','mch','mchc','mpv','rdw_cv','rdw_sd','b12','folate'],goals:[],question:'Were iron-containing products changed before this collection?',context:'Iron indices, B12, folate and blood counts need their own source context. This review does not establish a deficiency or an iron or vitamin dose.'},
] as const;
export type LabPanelAssessment={
 id:string;name:string;group:LabExplorerEntry['categories'][number];recordCount:number;
 latest:Point|null;previous:Point|null;change:number|null;comparable:boolean;comparisonReasons:ReturnType<typeof assessLabComparability>['reasons'];
 state:'source-review'|'source-bound'|'source-bound-transition'|'not-selected';
 reason:string;sourceId:string|null;position:'above'|'below'|null;
};
const position=(marker:string,point:Point)=>{
 const interval=sourceReferenceIntervalForPlot(marker,point);if(!interval)return null;
 if(interval.low!==null&&(point.value<interval.low||point.value===interval.low&&interval.lowInclusive===false))return 'below' as const;
 if(interval.high!==null&&(point.value>interval.high||point.value===interval.high&&interval.highInclusive===false))return 'above' as const;
 return null;
};
function unchangedBounds(marker:string,a:Point,b:Point){
 const first=sourceReferenceIntervalForPlot(marker,a),second=sourceReferenceIntervalForPlot(marker,b);
 return !!first&&!!second&&first.unit===second.unit&&first.low===second.low&&first.high===second.high&&first.lowInclusive===second.lowInclusive&&first.highInclusive===second.highInclusive;
}
function assess(entry:LabExplorerEntry):LabPanelAssessment{
 const pending=[...entry.pending].sort((a,b)=>Date.parse(b.measuredAt)-Date.parse(a.measuredAt));
 const points=entry.trend?.points||[],times=Array.from(new Set(points.map(point=>Date.parse(point.date)))).sort((a,b)=>b-a);
 const newest=points.filter(point=>Date.parse(point.date)===times[0]),prior=points.filter(point=>Date.parse(point.date)===times[1]);
 // Stored UTC timestamps cannot order two date-only source observations from
 // the same reported day. Preserve both and ask the user to choose a source.
 const hasUnorderedDay=(point:Point)=>points.some(other=>other.id!==point.id&&labDateText(other.date,other.sourceReport,other.dateCorrection)===labDateText(point.date,point.sourceReport,point.dateCorrection)&&[point,other].some(value=>{const context=value.dateCorrection||value.sourceReport;return !!context?.enteredDate&&!context.enteredTime;}));
 const latest=newest.length===1&&!hasUnorderedDay(newest[0])?newest[0]:null,previous=prior.length===1&&!hasUnorderedDay(prior[0])?prior[0]:null;
 const pair=latest&&previous?[previous,latest]:latest?[latest]:[];
 const comparison=assessLabComparability(entry.id,pair);
 const base={id:entry.id,name:entry.name,group:entry.categories[0],recordCount:entry.recordCount,latest,previous,change:comparison.comparable&&latest&&previous?latest.value-previous.value:null,comparable:comparison.comparable,comparisonReasons:comparison.reasons,sourceId:latest?.id||entry.pending[0]?.id||entry.sourceOnly[0]?.id||null,position:latest?position(entry.id,latest):null};
 if(entry.sourceOnly.length)return{...base,state:'source-review',reason:entry.familyIdentity?'The analyte family is recognized; the assay still needs explicit source review.':'The original label is retained without a confirmed canonical analyte.'};
 if(pending.some(row=>!latest||Date.parse(row.measuredAt)>=Date.parse(latest.date)))return{...base,latest:null,previous:null,change:null,comparable:false,position:null,state:'source-review',reason:'A newest source observation needs unit confirmation; an older value is not substituted for it.',sourceId:pending[0].id};
 if(!latest)return{...base,state:'source-review',reason:'The latest source observations cannot be ordered from the recorded date/time context. Choose a source rather than assume they are equivalent.'};
 if(!sourceReferenceIntervalForPlot(entry.id,latest)&&comparison.reasons.includes('assay-identity'))return{...base,state:'source-review',reason:'Assay identity needs source confirmation before interpreting or comparing this marker.'};
 if(base.position)return{...base,state:'source-bound',reason:`The latest observation is outside the ${base.position==='above'?'upper':'lower'} bound supplied with that exact source. Clinical importance and treatment need are not inferred.`};
 if(previous&&comparison.comparable&&position(entry.id,previous)&&unchangedBounds(entry.id,previous,latest))return{...base,state:'source-bound-transition',reason:'The earlier observation was outside its supplied bounds; the latest is not outside the same bounds. This does not establish a clinically significant response.'};
 return{...base,state:'not-selected',reason:sourceReferenceIntervalForPlot(entry.id,latest)?'No source-bound review cue was assigned. Recorded differences alone do not establish clinical significance.':'No usable source bounds were supplied. No normal interval, clinical priority or treatment target was invented.'};
}
function alignedReports(a:LabPanelAssessment,b:LabPanelAssessment){
 if(!a.latest||!a.previous||!b.latest||!b.previous||!a.comparable||!b.comparable)return false;
 const before=labReportGroupKey(a.previous.sourceReport),after=labReportGroupKey(a.latest.sourceReport);
 return !!before&&!!after&&before!==after&&before===labReportGroupKey(b.previous.sourceReport)&&after===labReportGroupKey(b.latest.sourceReport)&&a.previous.date===b.previous.date&&a.latest.date===b.latest.date;
}
/** Source-interval discrepancy, not a diagnostic threshold or proof that HbA1c
 * accurately represents this person's glucose. Keep inside existing family
 * detail pending independent interpretation acceptance. */
function glycemicSourceDiscrepancy(assessments:LabPanelAssessment[]){
 const a1c=assessments.find(row=>row.id==='hba1c'),glucose=assessments.find(row=>row.id==='glucose');
 if(!a1c?.latest||!glucose?.latest||a1c.state==='source-review'||glucose.state==='source-review')return null;
 const a=a1c.latest,g=glucose.latest,report=labReportGroupKey(a.sourceReport);
 if(!report||report!==labReportGroupKey(g.sourceReport)||a.date!==g.date||g.fasting!=='yes'||!hasConfirmedLabIdentity('hba1c',a)||!hasConfirmedLabIdentity('glucose',g))return null;
 const ar=sourceReferenceIntervalForPlot('hba1c',a),gr=sourceReferenceIntervalForPlot('glucose',g);
 // Both glucose bounds must actually be supplied; no one-sided value becomes
 // a complete interval. Never compare either analyte against the other's units.
 if(!ar||!gr||gr.low===null||gr.high===null||a1c.position!=='above'||glucose.position!==null)return null;
 const profiles=['hba1c','glucose'].map(id=>labEditorialFor(id));if(profiles.some(profile=>!profile))return null;
 const citations=Array.from(new Map(profiles.flatMap(profile=>labEditorialSources(profile!)).map(source=>[source.id,source])).values());
 return{id:'glycemic-source-discrepancy',releaseState:'detail-only' as const,evidenceClass:'source-bound-educational-context' as const,
  finding:'HbA1c is above its source upper bound while fasting glucose from the same report is within its supplied bounds.',
  meaning:'A fasting glucose result describes the collection moment; HbA1c reflects roughly the preceding two to three months. This glucose result does not cancel the HbA1c finding, and the discrepancy does not establish its cause.',
  limitations:'Red-cell turnover, anemia, hemoglobin variants, pregnancy and some medical conditions can affect HbA1c. Their presence is not inferred from this pattern. Source bounds are not a diabetes diagnosis or a treatment target.',
  sourceIds:[a.id,g.id],citations,
  action:{label:'Review original HbA1c result',href:`/precision?tab=labs&labResult=${encodeURIComponent(a.id)}`},
  discussion:'Discuss the paired results and whether HbA1c is representative with your clinician; the appropriate confirmatory assessment depends on the clinical question.',
  sourceEpoch:JSON.stringify([LAB_PANEL_REVIEW_VERSION,a,g]),clinicalSignificance:'not-assessed' as const,personalAttribution:'not-assessed' as const};
}
/** A read-only review projection over the existing report, not a clinical risk,
 * expected-variation or personal causal model. Every original entry is assessed. */
export function recordedLabPanelReview(report:Pick<PrecisionReport,'trends'|'pendingLabs'|'sourceOnlyLabs'|'context'>){
 const entries=labExplorerEntries(report),assessments=entries.map(assess),goals=report.context.goals.map(goal=>goalGuidance(goal).id);
 const families=labReviewFamilies.map(family=>{
  const members=assessments.filter(row=>(family.markers as readonly string[]).includes(row.id));
  const cues=members.filter(row=>row.state==='source-bound'||row.state==='source-bound-transition');
  return{...family,members,cues,goalRelevant:(family.goals as readonly string[]).some(id=>goals.includes(id)),selected:cues.length>0};
 }).filter(family=>family.members.length).sort((a,b)=>Number(b.goalRelevant)-Number(a.goalRelevant)||a.name.localeCompare(b.name));
 const glycemicDiscrepancy=glycemicSourceDiscrepancy(assessments);
 const selected=families.filter(family=>family.selected),tg=assessments.find(row=>row.id==='triglycerides');
 const lipidTradeoffs=tg&&tg.change!==null&&tg.change<0?assessments.filter(row=>['ldl','apob'].includes(row.id)&&row.change!==null&&row.change>0&&alignedReports(tg,row)).map(row=>({lower:tg.id,higher:row.id,sourceIds:[tg.previous!.id,tg.latest!.id,row.previous!.id,row.latest!.id],text:`Triglycerides decreased while ${row.name} increased. The paired reports align; an overall benefit or cause is not established.`})):[];
 const covered=new Set(families.flatMap(family=>family.members.map(row=>row.id)));
 const otherCues=assessments.filter(row=>!covered.has(row.id)&&(row.state==='source-bound'||row.state==='source-bound-transition'));
 return{version:LAB_PANEL_REVIEW_VERSION,glycemicDiscrepancy,assessments,families,selected,otherCues,sourceReview:assessments.filter(row=>row.state==='source-review'),notSelected:assessments.filter(row=>row.state==='not-selected'),lipidTradeoffs,originalRecords:new Set(entries.flatMap(entry=>[...(entry.trend?.points.map(point=>point.id)||[]),...entry.pending.map(row=>row.id),...entry.sourceOnly.map(row=>row.id)])).size,clinicalSignificance:'not-assessed' as const,personalAttribution:'not-assessed' as const};
}
