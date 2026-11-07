import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {apiRequest} from '@/lib/queryClient';
import {experimentHistorySchema} from '@shared/experience';
import {Button} from './ui/button';

export default function ExperimentSourceHistory({recordId}:{recordId:string}){
 const{user}=useAuth(),[open,setOpen]=useState(false),[shown,setShown]=useState(10);
 const history=useQuery({queryKey:[`/api/experience/records/${recordId}/history`,user?.id],enabled:open&&!!user?.id,queryFn:async()=>{
  const value=experimentHistorySchema.parse(await(await apiRequest('GET',`/api/experience/records/${encodeURIComponent(recordId)}/history`)).json());
  if(value.versions.some(version=>version.recordId!==recordId))throw Error('The previous source versions could not be verified.');return value;
 }});
 const checking=history.isPending||history.fetchStatus!=='idle'||history.isStale,current=!checking&&!history.isError?history.data:undefined;
 return <details className="workspace-disclosure" onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary>Previous saved versions</summary>
  {open&&<div className="space-y-3 pt-3 min-w-0 break-words">
   <p className="panel-note">Earlier saved values and context, before a correction. These are self-reported source records, not verified measurements or proof of an effect. Deleting this focus also deletes its captured versions.</p>
   {!history.isError&&checking&&<p role="status">Checking previous saved versions…</p>}
   {history.isError&&<p role="alert">Previous saved versions could not load. Current observations are unchanged.</p>}
   {(history.isError||history.fetchStatus==='paused'||history.isStale&&history.fetchStatus==='idle')&&<Button type="button" variant="outline" disabled={history.isFetching} onClick={()=>history.refetch()}>Retry previous versions</Button>}
   {current?.status==='not-provisioned'&&<p>Previous saved versions are unavailable here. Current observations remain available.</p>}
   {current?.status==='available'&&<>
    {!current.versions.length?<p>No previous versions have been captured. Earlier edits may not be available.</p>:<>
     <p>Showing {Math.min(shown,current.versions.length)} of {current.versions.length} captured versions, most recent first.</p>
     {current.versions.slice(0,shown).map(version=><details className="workspace-disclosure" key={version.id}>
      <summary>Saved through {version.sourceUpdatedAt}</summary>
      <div className="space-y-2 pt-3"><p>Replaced on {version.supersededAt}. Source record: {version.recordId}.</p>
       <h4>{version.payload.title}</h4><p>{version.payload.action}</p><p>Outcome: {version.payload.outcome}</p>
       <p>Intervention: {version.payload.startsOn}–{version.payload.endsOn} · {version.payload.mode==='athlete'?'Athlete':'Everyday'} · {version.payload.status}</p>
       {version.payload.design?<><p>Baseline: {version.payload.design.baselineStartsOn}–{version.payload.design.baselineEndsOn}</p><p>Method: {version.payload.design.measurementMethod}. Unit: {version.payload.design.metricUnit}.</p><p>Other changes to track: {version.payload.design.confoundersToTrack}</p></>:<p>No measurement design recorded.</p>}
       <ul>{version.payload.observations.map(observation=><li key={observation.date}>{observation.date}: {observation.value} {version.payload.design?.metricUnit||'unit not recorded'} · Adherence: {observation.adherence===null?'not recorded':`${observation.adherence}%`} · {observation.confounders||'Other changes not recorded'}</li>)}</ul>
       {version.payload.rationale&&<p>Rationale: {version.payload.rationale}</p>}{version.payload.reflection&&<p>Reflection: {version.payload.reflection}</p>}
      </div>
     </details>)}
     {shown<current.versions.length&&<Button type="button" variant="outline" onClick={()=>setShown(value=>value+10)}>Show 10 more versions</Button>}
    </>}
   </>}
  </div>}
 </details>;
}
