import {useId,useState} from 'react';
import {Link} from 'wouter';
import type {ExperienceRecord} from '@shared/experience';
import type {PrecisionReport} from '@shared/precision-nutrition';
import {labRoutineTiming,timingLabels} from '@shared/lab-routine-timing';
/** Read-only view of existing owner records; never changes a plan or lab result. */
export default function RoutineLabTiming({trends,records,mode}:{trends:PrecisionReport['trends'];records:ExperienceRecord[];mode:'everyday'|'athlete'}){
 const[selected,setSelected]=useState(''),id=useId();
 const trials=records.flatMap(record=>record.kind==='experiment'&&record.payload.mode===mode?[record]:[]).sort((a,b)=>b.payload.startsOn.localeCompare(a.payload.startsOn)||a.id.localeCompare(b.id));
 const record=trials.find(row=>row.id===selected),view=record?labRoutineTiming(record.payload,trends):null;
 return <details className="space-y-3"><summary>Compare recorded dates with a routine trial</summary>
  <p className="panel-note">See dates side by side. Timing alone does not show what caused a change.</p>
  {trials.length?<><label className="block" htmlFor={id}>Saved {mode==='athlete'?'Athlete':'Everyday'} trial</label><select id={id} className="bloom-input w-full" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose a trial</option>{trials.map(row=><option key={row.id} value={row.id}>{row.payload.title} · {row.payload.startsOn}–{row.payload.endsOn}</option>)}</select></>:<p>No saved trials in this mode. <Link className="text-link" href="/weekly-review">Set up a routine trial</Link>.</p>}
  {view&&<div className="space-y-3"><h3>{view.trial.title}</h3><p>{view.trial.startsOn} to {view.trial.endsOn} · Marked {view.trial.status}</p>{view.trial.design&&<p className="panel-note">Stated baseline: {view.trial.design.baselineStartsOn} to {view.trial.design.baselineEndsOn}.</p>}
   {view.rows.length?<div className="lab-source-table" role="region" aria-label="Routine trial and bloodwork calendar context" tabIndex={0}><table className="lab-history-table"><caption className="sr-only">Recorded bloodwork dates relative to the selected self-reported trial</caption><thead><tr><th scope="col">Result</th><th scope="col">Recorded date</th><th scope="col">Calendar context</th></tr></thead><tbody>{view.rows.map(row=><tr key={row.id}><th scope="row">{row.name}</th><td>{row.dateLabel}{row.corrected&&<small className="block">Revised entered date</small>}{!row.calendarDay&&<small className="block">Recorded timestamp: {row.timestamp}</small>}</td><td>{timingLabels[row.phase]}</td></tr>)}</tbody></table></div>:<p>No active laboratory results are available for calendar context.</p>}
   <details><summary>Limits of this comparison</summary><p className="panel-note">Entered dates do not confirm that the action happened or was followed. Calendar overlap does not establish cause or measurement comparability. Dates entered retrospectively are not evidence of a prespecified trial.</p><p className="panel-note">Source-only results and unconfirmed units are excluded. Original source and assay details remain in each bloodwork card.</p><p className="panel-note">Stated action: {view.trial.action}</p>{view.trial.design&&<p className="panel-note">Other changes to track: {view.trial.design.confoundersToTrack}</p>}</details>
  </div>}
 </details>;
}
