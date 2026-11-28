import AnatomyRegionSelector from './AnatomyRegionSelector';
import {projectTrainingSurfaces} from '@shared/anatomy-training';
import LocalizedSymptomEditor from './LocalizedSymptomEditor';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useExperience} from '@/lib/experience';
import {useAuth} from '@/lib/auth';
import {apiRequest} from '@/lib/queryClient';
import type {MuscleHistory} from '@shared/muscle-history';
/** One account-scoped projection for every workspace. Never copy history into
 * local storage or keep a previous account's query as placeholder data. */
export default function MuscleHistoryPanel({id}:{id?:string}){
 const {user}=useAuth(),{mode}=useExperience();
 return user?<AccountMuscleHistory key={user.id} actor={user.id} mode={mode} id={id}/>:null;
}
function AccountMuscleHistory({actor,mode,id}:{actor:string;mode:'everyday'|'athlete';id?:string}){
 const [days,setDays]=useState<7|14|30>(14),timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 const query=useQuery<MuscleHistory>({queryKey:['/api/experience/muscle-history',actor,days,timeZone,new Date().toLocaleDateString('en-CA',{timeZone})],queryFn:async()=>(await apiRequest('GET','/api/experience/muscle-history?'+new URLSearchParams({days:String(days),timeZone}))).json()});
 // A stale or failed refresh must not present deleted or corrected values as current.
 const history=!query.isError&&!query.isStale&&query.fetchStatus==='idle'?query.data:undefined;
 return <details id={id} className="bloom-panel workspace-disclosure"><summary>Recorded muscle training &amp; symptoms</summary>
  <div className="space-y-4 pt-3">
   <LocalizedSymptomEditor actor={actor} mode={mode}/>
   <label>History window <select value={days} onChange={e=>setDays(Number(e.target.value) as 7|14|30)}>{[7,14,30].map(n=><option key={n} value={n}>{n} days</option>)}</select></label>
   {!history&&<p role="status">{query.isError?'History could not be loaded.':'Checking current records…'} <button type="button" onClick={()=>void query.refetch()}>Refresh history</button></p>}
   {history&&<>
    <details><summary>View training surface outlines</summary><p>Dashed outlines show training associations, separate from the rings used for reported symptoms. Sets with unspecified body side remain in the history table and are not assigned to a side. Some muscles have no matching baseline surface.</p><AnatomyRegionSelector mode={mode} training={projectTrainingSurfaces(history.contributions).surfaces}/></details>
    <p className="panel-note">Preliminary anatomical associations are labelled separately from individually reviewed associations. Updates apply to recorded history without another approval step. All catalogue associations are available descriptively, with preliminary source labels retained.</p>
    <p className="panel-note">{history.from}–{history.to} · {history.timeZone}. Recorded exercise roles, not measured activation. No logs does not mean no training or no symptoms.</p>
    {mode==='athlete'&&<div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Recorded muscle training table"><table><caption>Primary and secondary roles from confirmed completed sets</caption><thead><tr><th scope="col">Muscle</th><th scope="col">Primary set records</th><th scope="col">Secondary set records</th><th scope="col">Recorded days</th><th scope="col">Last recorded</th><th scope="col">External load × repetitions (kg)</th></tr></thead><tbody>{history.muscles.filter(m=>m.directSetRecords||m.secondarySetRecords).map(m=><tr key={m.id}><th scope="row">{m.label}</th><td>{m.directSetRecords}</td><td>{m.secondarySetRecords}</td><td>{m.recordedTrainingDays}<small className="block">{m.reviewedSetRecords} reviewed / {m.preliminarySetRecords} preliminary associations</small></td><td>{m.lastRecordedDate??'Unknown'}{m.calendarDaysSinceLastRecorded!==null?` (${m.calendarDaysSinceLastRecorded} calendar days ago)`:''}</td><td>{m.knownExternalVolumeKgReps??'Unknown'} · {m.volumeCoverage}</td></tr>)}</tbody></table></div>}
    {mode==='everyday'&&<ul className="space-y-2">{history.muscles.filter(m=>m.directSetRecords||m.secondarySetRecords).map(m=><li key={m.id}><strong>{m.label}</strong>: recorded on {m.recordedTrainingDays} {m.recordedTrainingDays===1?'day':'days'} · last recorded {m.lastRecordedDate}. {m.preliminarySetRecords?'Includes preliminary anatomical associations.':''}</li>)}</ul>}
    {!history.contributions.length&&<p>No matched, confirmed completed set records in this window.</p>}
    <p className="panel-note">Counts and volume can contribute to multiple muscles. Do not add muscle rows as whole-workout totals. Stabilizer roles are excluded from the primary and secondary counts. Unknown load is not zero; body mass is not imputed.</p>
    {!!history.unmapped.length&&<p>{history.unmapped.length} completed set records have no exact curated exercise match and are excluded from muscle totals.</p>}
    {!!history.potentialDuplication.length&&<p>Some activity and session records may describe the same exercise. They remain separate unless they share a stable set identity.</p>}
    {!!history.conflictingSharedSetIds.length&&<p>Conflicting shared set records are excluded until corrected.</p>}
    <details><summary>Reported symptoms and dated comparison</summary><p>Same-day records are observations, not evidence that training caused a symptom.</p>{history.symptoms.length?<ul>{history.symptoms.map(s=><li key={s.id}>{s.payload.observedAt} · {s.payload.type} · {s.payload.location.view} {s.payload.location.regionId} · {s.payload.location.laterality} · severity {s.payload.severity===null?'unrated':s.payload.severity+'/10'} · duration {s.payload.durationMinutes===null?'unknown':s.payload.durationMinutes+' minutes'}</li>)}</ul>:<p>No localized symptom observations recorded in this window.</p>}<ul>{history.comparison.filter(day=>day.completedSetRecordKeys.length||day.symptomRecordIds.length).map(day=><li key={day.date}>{day.date}: {day.completedSetRecordKeys.length} completed set records; {day.symptomRecordIds.length} reported symptom observations.</li>)}</ul></details>
   </>}
  </div>
 </details>;
}
