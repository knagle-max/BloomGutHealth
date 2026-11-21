import {Link,useSearch} from 'wouter';
import {useLabSources,labSourcesKey} from '@/lib/lab-sources';
import {laboratorySourceTitle,type LabManagedSource} from '@shared/lab-report-metadata';
import LabReportManager from './LabReportManager';
import {useLabReportOverlays} from '@/lib/lab-report-overlays';
import{useEffect,useRef,useState}from'react';
import{useAuth}from'@/lib/auth';
import{apiRequest,queryClient}from'@/lib/queryClient';
import{accountContextGuard}from'@/lib/request-actor';
import{resetPlanningInputs,invalidatePlanningInputs}from'@/lib/planning-cache';
import{Button}from'./ui/button';
import{AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel}from'./ui/alert-dialog';
type Source=LabManagedSource;
function LabSourceWorkspace(){
 const{user}=useAuth(),mounted=useRef(true),actor=useRef(user?.id);actor.current=user?.id;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const search=useSearch(),requested=new URLSearchParams(search).get('manageLabSource'),seenRequest=useRef(''),sourceList=useRef<HTMLDetailsElement>(null);
 const key=labSourcesKey(user?.id),sources=useLabSources(),overlays=useLabReportOverlays();
 const[managing,setManaging]=useState<Source|null>(null);
 useEffect(()=>{if(sources.data&&!sources.isError)overlays.hydrate(sources.data);},[sources.data,sources.isError,overlays.hydrate]);
 const[draft,setDraft]=useState<Source|null>(null),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const current=!sources.isError?sources.data:undefined;
 useEffect(()=>{if(!requested){seenRequest.current='';return;}if(!current||seenRequest.current===requested)return;seenRequest.current=requested;const source=current.find(row=>row.id===requested);if(source){if(sourceList.current)sourceList.current.open=true;setManaging(source);}else setNotice('This saved laboratory source is not available in the current account.');},[requested,current]);
 const stale=!!draft&&!!current&&current.some(row=>row.id===draft.id&&row.revision!==draft.revision);
 async function remove(){if(!user||!draft||!confirmed||pending||stale||sources.fetchStatus!=='idle'||sources.isStale)return;const owner=user.id,intent=draft,guard=accountContextGuard();setPending(true);setError('');
  try{await apiRequest('DELETE','/api/precision/labs/sources/'+intent.id,{revision:intent.revision,confirmed:true},{'X-Bloom-Labs-Actor':owner,'X-Bloom-Confirm':'delete-lab-source'});guard();await queryClient.cancelQueries({queryKey:key});guard();queryClient.removeQueries({queryKey:key});
   if(mounted.current&&actor.current===owner){setDraft(null);setNotice('The selected laboratory source and its revisions were deleted. Other sources remain.');requestAnimationFrame(()=>document.getElementById('lab-source-management-heading')?.focus());}
   await resetPlanningInputs();
  }catch{try{guard();if(mounted.current&&actor.current===owner)setError('Deletion could not be confirmed. Retry this exact action if the response was lost, or cancel and reload if the source changed.');await invalidatePlanningInputs();}catch{/* A previous account cannot restore source metadata. */}}
  finally{if(mounted.current&&actor.current===owner)setPending(false);}
 }
 return <section className="bloom-panel space-y-3" aria-labelledby="lab-source-management-heading"><h2 id="lab-source-management-heading" tabIndex={-1}>Saved laboratory sources</h2>
  <p className="panel-note">Reports follow saved import identity and correction history. Matching dates do not combine independent results.</p>
  {notice&&<p role="status">{notice}</p>}{sources.isPending&&<p role="status">Checking saved sources…</p>}{sources.isError&&<p role="alert">Saved sources could not be checked. <Button variant="outline" onClick={()=>sources.refetch()}>Retry source check</Button></p>}
  {current&&<details ref={sourceList}><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Manage {current.length} saved laboratory sources</summary><div className="space-y-3">{current.map(row=><article key={row.id} data-lab-source={row.id} className="border rounded-xl p-3 space-y-2 break-words"><h3>{laboratorySourceTitle(row)}</h3><p className="panel-note">{row.scope==='report'?'Original imported report group':'Independent result; no report group inferred'}</p><p>Original label: {(row.originalLaboratories||[]).join(' · ')||'Unknown original provider'}.</p>{row.metadata?.current?.identity&&<p>{row.metadata.sourceCurrent?'User-confirmed':'Previous confirmation; source changed'}: {row.metadata.current.identity.provider==='other'?row.metadata.current.identity.otherProvider:row.metadata.current.identity.provider} · testing {row.metadata.current.identity.province||'jurisdiction unknown'}{row.metadata.current.identity.location?` · ${row.metadata.current.identity.location}`:''}.</p>}<p>{row.results===null?'Result count unavailable':`${row.results} result(s)`} · {row.records} saved record(s), including revisions</p>{row.manageable===false&&<p>Conflicting source references need individual result review before report deletion.</p>}<p>Recorded dates: {row.dates.join(' · ')||'Not available'}</p>{row.dateContexts?.some(context=>context.precision==='stored-timestamp-only')&&<p className="panel-note">Some dates come from stored timestamps; an original collection date was not captured.</p>}{!!row.reportIdentifiers?.length&&<p>Report identifier: {row.reportIdentifiers.join(' · ')}</p>}{!!row.specimenIdentifiers?.length&&<p>Specimen identifier: {row.specimenIdentifiers.join(' · ')}</p>}<div className="flex flex-wrap gap-2"><Button id={`manage-source-${row.id}`} variant="outline" disabled={row.manageable===false} onClick={()=>setManaging(row)}>Manage laboratory & reference ranges</Button>{row.detailRecordId&&<Link className="text-link inline-flex min-h-11 items-center" href={`/precision?tab=labs&labResult=${encodeURIComponent(row.detailRecordId)}`}>View report results and charts</Link>}</div><Button variant="outline" disabled={row.manageable===false} onClick={()=>{setDraft(row);setConfirmed(false);setError('');setNotice('');}}>{row.scope==='report'?'Delete report':'Delete result source'}</Button></article>)}{!current.length&&<p>No saved laboratory sources.</p>}</div></details>}
  {managing&&<LabReportManager key={user?.id+managing.id} source={managing} onClose={()=>{const id=managing.id;setManaging(null);const url=new URL(window.location.href);url.searchParams.delete('manageLabSource');window.history.replaceState(window.history.state,'',url.pathname+url.search);requestAnimationFrame(()=>document.getElementById(`manage-source-${id}`)?.focus());}}/>}
  <AlertDialog open={!!draft} onOpenChange={open=>{if(!open&&!pending)setDraft(null);}}><AlertDialogContent><AlertDialogTitle>Delete this laboratory {draft?.scope==='report'?'report':'result source'}?</AlertDialogTitle><AlertDialogDescription>This deletes the selected source and all its saved result, unit and date revisions. Other laboratory sources, Genetics, Microbiome and your food journal remain. Known dependent saved plans are removed; current recommendations reload. Unsaved form entries remain unsaved. This cannot be undone here; backup retention is separate.</AlertDialogDescription>
   <p>{draft?.results===null?'Result count unavailable':`${draft?.results} result(s)`} · {draft?.records} saved record(s) · Bloom reference {draft?.id.slice(-8)}</p>
   <label className="flex items-center gap-2 min-h-11"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={pending}/>I confirm deletion of this laboratory source and its revisions.</label>
   {stale&&<p role="alert">This source changed. Cancel and review the updated source before deleting.</p>}{error&&<p role="alert">{error}</p>}<div className="flex flex-wrap gap-2"><AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={!confirmed||pending||stale||sources.fetchStatus!=='idle'||sources.isStale} onClick={remove}>{pending?'Deleting…':'Delete confirmed laboratory source'}</Button></div>
  </AlertDialogContent></AlertDialog>
 </section>;
}

export default function LabSourceManagement(){const {user}=useAuth();return user?<LabSourceWorkspace key={user.id}/>:null;}
