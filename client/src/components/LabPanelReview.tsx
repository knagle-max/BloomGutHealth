import type {PrecisionReport} from '@shared/precision-nutrition';
import LabRememberedContext from './LabRememberedContext';
import {hasConfirmedLabIdentity} from '@shared/lab-assay-identity';
import {recordedLabPanelReview,type LabPanelAssessment} from '@shared/lab-panel-review';
import {formatRecordedLabNumber,labDateText} from '@shared/lab-history';
import {labComparabilityReasons} from '@shared/lab-comparability';
import {referenceIntervalText,sourceReferenceIntervalForPlot} from '@shared/lab-reference-interval';
import type {LabCategoryId} from '@shared/lab-explorer';

/** Source-bound review cues, not a diagnosis, clinical ranking or causal response.
 * No independent cache: source edits, removal and owner changes replace the report. */
export default function LabPanelReview({report,onSelect}:{report:PrecisionReport;onSelect:(group:LabCategoryId|null,marker:string|null)=>void}){
 const review=recordedLabPanelReview(report);
 if(!review.originalRecords)return null;
 const marker=(row:LabPanelAssessment)=><button type="button" className="text-link inline-flex min-h-11 items-center text-left" onClick={()=>onSelect(row.group,row.id)}>Explore {row.name} &amp; original records</button>;
 const observation=(row:LabPanelAssessment)=>{
  const point=row.latest,range=point?sourceReferenceIntervalForPlot(row.id,point):null;
  return <li key={row.id} className="lab-panel-review-observation">
   <strong>{row.name}</strong>
   {point&&<p>{formatRecordedLabNumber(point.value)} {point.unit} · {labDateText(point.date,point.sourceReport,point.dateCorrection)}{range&&<> · Source bounds: {referenceIntervalText(range.low,range.high,range.unit,range)}</>}</p>}
   <p className="panel-note">{row.reason}</p>
   {point&&row.previous&&<p className="panel-note">{row.comparable?`Recorded difference: ${formatRecordedLabNumber(row.change!)} ${point.unit} since ${labDateText(row.previous.date,row.previous.sourceReport,row.previous.dateCorrection)}. Clinical significance is not assessed.`:`Comparison withheld: ${row.comparisonReasons.map(reason=>labComparabilityReasons[reason]).join(' ')}`}</p>}
   {marker(row)}
  </li>;
 };
 return <section className="bloom-panel lab-panel-review" aria-labelledby="lab-panel-review-title">
  <h2 id="lab-panel-review-title">Your panel, together</h2>
  <p>{review.originalRecords} recorded results across {review.assessments.length} markers or source labels reviewed.</p>
  <p className="panel-note">Cues use original source bounds, not medical urgency, diagnosis or treatment response.</p>
  {review.lipidTradeoffs.length>0&&<p className="lab-panel-review-tradeoff">Triglycerides decreased while {review.lipidTradeoffs.map(tradeoff=>review.assessments.find(row=>row.id===tradeoff.higher)!.name).join(' and ')} increased and are outside their latest source upper bounds. The paired reports align; an overall benefit or cause is not established.</p>}
  {review.selected.length===0&&review.otherCues.length===0&&<p>No source-bound review cues were assigned. Missing bounds or unresolved source details can limit this review; this does not mean all results are normal.</p>}
  {review.selected.map(family=><details key={family.id} className="lab-panel-review-family">
   <summary>{family.name} · {family.cues.length} review {family.cues.length===1?'cue':'cues'}{family.goalRelevant?' · related to a recorded goal':''}</summary>
   <p>{family.context}</p>
   <ul className="lab-panel-review-list">{family.cues.map(observation)}</ul>
   {family.members.some(row=>!family.cues.includes(row))&&<details><summary>Other recorded markers in this family</summary><ul className="lab-panel-review-list">{family.members.filter(row=>!family.cues.includes(row)).map(observation)}</ul></details>}
   <LabRememberedContext family={family.id} sources={report.labHistory.filter(row=>family.members.some(member=>member.latest?.id===row.id||member.previous?.id===row.id)&&hasConfirmedLabIdentity(row.marker,row))}/>
   <p>Review the original reports and collection context with your clinician if you have questions about these findings. Do not change medicine or supplement doses based on this view.</p>
  </details>)}
  {review.otherCues.length>0&&<details><summary>Other source-bound review cues · {review.otherCues.length}</summary><ul className="lab-panel-review-list">{review.otherCues.map(observation)}</ul></details>}
  <details><summary>How each marker was reviewed</summary>
   <p className="panel-note">Every recorded marker or source label is listed. Related families appear together; families relevant to recorded goals appear first, followed alphabetically. No percentage-change leaderboard or personal cause is inferred. Original records, assay context and educational sources are available through each marker.</p>
   <ul className="lab-panel-review-list">{review.assessments.map(observation)}</ul>
  </details>
 </section>;
}
