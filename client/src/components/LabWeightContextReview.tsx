import {useState} from 'react';
import {Link} from 'wouter';
import type {PrecisionReport} from '@shared/precision-nutrition';
import type {LabPanelAssessment} from '@shared/lab-panel-review';
import {labWeightContext,labWeightDiscussion} from '@shared/lab-response-events';

/** Existing owned report measurements; no extra fetch, storage or inference. */
export default function LabWeightContextReview({pairs,observations}:{pairs:LabPanelAssessment[];observations:PrecisionReport['checkins']}){
 const[open,setOpen]=useState(false),[selected,setSelected]=useState('');
 const choices=pairs.filter(pair=>pair.latest&&pair.previous&&(pair.id==='ldl'||pair.id==='triglycerides'));
 const pair=choices.find(pair=>pair.id===selected)||choices[0];if(!pair)return null;
 const context=open?labWeightContext(pair,observations):null,discussion=context&&labWeightDiscussion(pair,context);
 return <details className="lab-panel-review-family" onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary className="min-h-11">Recorded weight context</summary>
  {open&&<div className="space-y-3 min-w-0 [overflow-wrap:anywhere]">
   <label className="block">Marker for recorded weight context<select aria-label="Marker for recorded weight context" className="bloom-input w-full min-h-11" value={pair.id} onChange={event=>setSelected(event.target.value)}>{choices.map(pair=><option key={pair.id} value={pair.id}>{pair.name}</option>)}</select></label>
   {context?.status!=='available'||!context.window?<p>Confirm the collection dates and current source records before relating weight observations to these results.</p>:<>
    {discussion&&<section aria-label={`Weight discussion for ${pair.name}`} className="space-y-3"><h4>How weight records can add context</h4><p>{discussion.generalContext}</p><p>{discussion.nextStep}</p><a className="text-link inline-flex min-h-11 items-center" href={discussion.evidence.url} target="_blank" rel="noopener noreferrer">{discussion.evidence.title}</a></section>}
    <p>Recorded-date window: {context.window.from} to {context.window.to}.</p>
    {context.observations.length?<ul className="lab-panel-review-list">{context.observations.map(row=><li key={row.id} data-weight-source-id={row.id}><strong>{row.weight.value} {row.weight.unit}</strong><p><time dateTime={row.measuredAt}>{row.date}</time> · {row.weight.basis==='original-entry'?'Original entered weight':'Stored weight; original entry unit unavailable'}</p><Link className="text-link inline-flex min-h-11 items-center" href={`/precision?tab=progress&observation=${encodeURIComponent(row.id)}`}>Review dated observation</Link></li>)}</ul>:<p>No saved weight observations fall strictly between these collection dates. Unlogged measurements stay unknown.</p>}
    <p className="panel-note">Collection-day ordering, measurement methods and logging coverage are not established. These records do not show what caused a laboratory change.</p>
   </>}
  </div>}
 </details>;
}
