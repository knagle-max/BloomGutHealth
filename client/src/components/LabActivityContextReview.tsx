import {useState} from 'react';
import {Link} from 'wouter';
import {useAuth} from '@/lib/auth';
import {useExperienceRecords} from '@/lib/experience';
import {labActivityContext,labActivityDiscussion} from '@shared/lab-response-events';
import {labEditorialFor,labEditorialSources} from '@shared/biology-labs';
import type {LabPanelAssessment} from '@shared/lab-panel-review';

function RecordedActivity({pair}:{pair:LabPanelAssessment}){
 const {user}=useAuth(),records=useExperienceRecords('activity');
 if(!user)return null;
 if(records.isError)return <div role="alert"><p>Activity context could not be confirmed. Your original laboratory results remain available.</p><button type="button" className="text-link min-h-11" onClick={()=>void records.refetch()}>Retry activity context</button></div>;
 if(!records.data||records.fetchStatus!=='idle'||records.isStale)return <p role="status">Checking recorded activity…</p>;
 const context=labActivityContext(pair,records.data),education=labEditorialFor(pair.id),discussion=labActivityDiscussion(pair,context);
 const chronology=context.window?<>
   <p>Recorded-date window: {context.window.from} to {context.window.to}.</p>
   {context.observations.length?<ul className="lab-panel-review-list">{context.observations.map(event=><li key={event.id} data-activity-source-id={event.id}><strong>{event.kind==='walking'?'Walking logged':'Activity logged'}</strong><p>{event.date} · {event.minutes===null?'Duration not recorded':`${event.minutes} minutes`}</p><p className="panel-note">Added to your log on {event.recordedAt.slice(0,10)}.</p></li>)}</ul>:<p>No saved activity falls strictly between these recorded dates. Unlogged activity remains unknown.</p>}
   <p className="panel-note">These are calendar matches, not verified pre-collection exposures. Logging coverage is unknown: this list does not establish increased activity, regular adherence or what caused a result to change.</p>
  </>:<p>Confirm the original collection dates and comparison context before relating activity to these results. A stored timestamp alone may be an upload or logging date.</p>;
 const action=<Link href="/activity" className="hero-button inline-flex min-h-11 items-center">Review or add activity</Link>;
 return <div className="space-y-3">
  {discussion&&<section className="bloom-panel space-y-3" aria-label={`Activity discussion for ${pair.name}`}>
   <h4>How activity can add context</h4><p>{discussion.generalContext}</p><p>{discussion.personalContext}</p>
   {discussion.counterContext&&<p>{discussion.counterContext}</p>}
   <h4>A practical next step</h4><p>{discussion.nextStep}</p>
   <p className="panel-note">General test-reference evidence; your causes remain unknown. Other changes and collection conditions may also matter.</p>
   {action}
  </section>}
  {discussion?<details><summary className="min-h-11">Recorded dates &amp; activity</summary>{chronology}</details>:chronology}
  {education&&<section aria-label={`General ${pair.name} test guidance`}><h4>What generally helps clarify these results</h4><p>{education.whatToDiscuss}</p>{labEditorialSources(education).map(source=><a key={source.id} className="text-link inline-flex min-h-11 items-center" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>)}</section>}
  {!discussion&&action}
 </div>;
}

/** Existing owned activity records and canonical editorial citations only.
 * No new observations, causal weights, clinical target or duplicate chart. */
export default function LabActivityContextReview({pairs}:{pairs:LabPanelAssessment[]}){
 const[open,setOpen]=useState(false),[selected,setSelected]=useState('');
 const choices=pairs.filter(pair=>pair.latest&&pair.previous),pair=choices.find(choice=>choice.id===selected)||choices[0];
 if(!pair)return null;
 return <details className="lab-panel-review-family" onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary>Recorded activity context</summary>
  {open&&<><label className="block">Marker for recorded activity context<select aria-label="Marker for recorded activity context" className="bloom-input w-full min-h-11" value={pair.id} onChange={event=>setSelected(event.target.value)}>{choices.map(choice=><option key={choice.id} value={choice.id}>{choice.name}</option>)}</select></label><RecordedActivity pair={pair}/></>}
 </details>;
}
