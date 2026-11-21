import{accountContextGuard}from"@/lib/request-actor";
import{useEffect,useRef,useState}from"react";
import{useQuery}from"@tanstack/react-query";
import{useAuth}from"@/lib/auth";
import{apiRequest,ApiRequestError,queryClient}from"@/lib/queryClient";
import{resetPlanningInputs,invalidatePlanningInputs}from"@/lib/planning-cache";
import{GENETIC_SOURCE_CONFIRM,geneticSourceSnapshotSchema,geneticSourceDetailSchema,type GeneticSourceCommand,type GeneticSourceSnapshot,type GeneticDatasetSummary}from"@shared/genetic-source-selection";
import{AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel}from"@/components/ui/alert-dialog";
import{Dialog,DialogContent,DialogTitle,DialogDescription}from"@/components/ui/dialog";
import{Button}from"@/components/ui/button";
type SourceDetail={id:string;readable:boolean;provider:string;collectedAt:string|null;createdAt:string;build:string|null;strand:string;observations:Array<{rsid:string;gene:string|null;genotype:string;original:string|null}>;limitation:string};
export default function GeneticSourceManagement({onChanged,hasDraft}:{hasDraft:boolean;onChanged:(message:string)=>void}){
 const{user}=useAuth(),actor=useRef(user?.id),active=useRef(true);actor.current=user?.id;
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const key=['/api/precision/genetics/sources',user?.id];
 const sources=useQuery<GeneticSourceSnapshot>({queryKey:key,enabled:!!user,queryFn:async({signal})=>geneticSourceSnapshotSchema.parse(await(await apiRequest('GET','/api/precision/genetics/sources',undefined,undefined,signal)).json())});
 const current=sources.fetchStatus==='idle'&&!sources.isError?sources.data:undefined;
 const[draft,setDraft]=useState<GeneticSourceCommand|null>(null),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[viewId,setViewId]=useState<string|null>(()=>new URLSearchParams(window.location.search).get("geneticSource")),[draftCaption,setDraftCaption]=useState('');
 const trigger=useRef<HTMLButtonElement|null>(null);
 const detail=useQuery<SourceDetail>({queryKey:['/api/precision/genetics/source-detail',user?.id,viewId],enabled:!!user&&!!viewId,queryFn:async({signal})=>geneticSourceDetailSchema.parse(await(await apiRequest('GET','/api/precision/genetics/sources/'+encodeURIComponent(viewId!),undefined,undefined,signal)).json())});
 const currentDetail=detail.fetchStatus==='idle'&&!detail.isError&&detail.data?.id===viewId?detail.data:undefined;
 const desiredSatisfied=!!draft&&!!current&&(draft.action==='delete'?!current.sources.some(row=>row.id===draft.sourceId):draft.sourceId===null?current.state==='none':current.activeId===draft.sourceId&&current.sources.find(row=>row.id===draft.sourceId)?.revision===draft.sourceRevision);
 const stale=!!draft&&!!current&&!desiredSatisfied&&(draft.selectionRevision!==current.selectionRevision||!!draft.sourceId&&draft.sourceRevision!==current.sources.find(row=>row.id===draft.sourceId)?.revision);
 const label=(row:GeneticDatasetSummary)=>`${row.provider==='manual'?'Manual SNP entries':row.provider==='23andMe'?'Selected DNA-file calls':'Unrecognized source'} · saved ${new Date(row.createdAt).toLocaleString()} · Bloom reference ${row.id.slice(-8)}`;
 function begin(action:'activate'|'delete',source:GeneticDatasetSummary|null,button:HTMLButtonElement){if(!current)return;trigger.current=button;setDraftCaption(source?label(source)+` · reported ${source.collectedAt?.slice(0,10)||'not supplied'}`+(source.callCount===null?' · call count unavailable':` · ${source.callCount} saved calls`):'No dataset will be active.');setError('');setConfirmed(false);setDraft({action,sourceId:source?.id||null,sourceRevision:source?.revision||null,selectionRevision:current.selectionRevision,confirmed:true});}
 async function commit(){const owner=user?.id;if(!owner||!draft||!confirmed||pending||stale)return;const intent=draft,assertOwner=accountContextGuard();const sameAccount=()=>{try{assertOwner();return true;}catch{return false;}};setPending(true);setError('');
  try{
   const path=intent.action==='delete'?'/api/precision/genetics/sources/'+encodeURIComponent(intent.sourceId!):'/api/precision/genetics/active';
   const result=geneticSourceSnapshotSchema.parse(await(await apiRequest(intent.action==='delete'?'DELETE':'POST',path,intent,{'X-Bloom-Genetics-Actor':owner,'X-Bloom-Confirm':GENETIC_SOURCE_CONFIRM})).json());
   if(!result||!Array.isArray(result.sources)||!['active','none','unavailable'].includes(result.state))throw Error('Unconfirmed source state');
   const isCurrent=()=>active.current&&actor.current===owner;
   await queryClient.cancelQueries({queryKey:key});
   if(!sameAccount()){queryClient.removeQueries({queryKey:key});queryClient.removeQueries({queryKey:["/api/precision/genetics/source-detail",owner]});return;}
   queryClient.setQueryData(key,result);
   queryClient.removeQueries({queryKey:['/api/precision/genetics/source-detail',owner]});
   if(isCurrent()){
    setDraft(null);setViewId(null);onChanged(intent.action==='delete'?'The selected dataset is no longer saved in your account. The current source selection is shown below.':result.state==='active'?'The selected genetic dataset is now active. Other saved datasets remain historical.':'No genetic dataset is active. Saved datasets remain available for deliberate selection.');
   }
   await resetPlanningInputs();
  }catch(cause){if(sameAccount()){if(active.current&&actor.current===owner)setError(cause instanceof ApiRequestError&&[404,409].includes(cause.status)?'The dataset or active selection changed. Reload and review your saved sources.':'This source action could not be confirmed. Retry the same action safely or reload your sources.');await invalidatePlanningInputs();}}
  finally{if(active.current&&actor.current===owner)setPending(false);}
 }
 return <section className="bloom-panel space-y-3" aria-labelledby="genetic-dataset-management-heading"><h2 id="genetic-dataset-management-heading" tabIndex={-1}>Saved genetic datasets</h2>
  {(sources.isPending||sources.fetchStatus!=='idle')&&<p role="status">Checking saved datasets…</p>}
  {sources.isError&&<div role="alert"><p>Saved datasets could not be checked.</p><Button variant="outline" onClick={()=>sources.refetch()}>Retry source check</Button></div>}
  {current&&<><p>{current.state==='none'?'No active genetics dataset':current.state==='unavailable'?'The selected source is unavailable; no older dataset was activated.':'One saved dataset is active. Other datasets remain historical.'}</p>
   {current.state!=='none'&&<Button type="button" variant="outline" onClick={e=>begin('activate',null,e.currentTarget)}>Stop using genetic data</Button>}
   <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Manage {current.sources.length} saved datasets</summary>
    {!current.sources.length?<p>No genetic datasets are saved. You can enter selected SNPs below without uploading a complete DNA file.</p>:<ul className="divide-y divide-border">{current.sources.map(row=><li className="py-4 space-y-2 break-words" key={row.id} data-genetic-source={row.id}><h3 className="font-medium">{label(row)}</h3><p>{row.active?'Active dataset':row.readable?'Historical dataset':'Recorded source; not used for interpretation'} · {row.callCount===null?'Call count unavailable':`${row.callCount} saved calls`} · reported date: {row.collectedAt?.slice(0,10)||'not supplied'}</p><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={e=>{trigger.current=e.currentTarget;setViewId(row.id);}}>View source</Button>{!row.active&&row.readable&&<Button type="button" variant="outline" onClick={e=>begin('activate',row,e.currentTarget)}>Use dataset</Button>}<Button type="button" variant="outline" onClick={e=>begin('delete',row,e.currentTarget)}>Delete dataset</Button></div></li>)}</ul>}
   </details></>}
  <AlertDialog open={!!draft} onOpenChange={open=>{if(!open&&!pending)setDraft(null);}}><AlertDialogContent className="max-h-[90dvh] overflow-y-auto min-w-0 grid-cols-[minmax(0,1fr)] [&>*]:min-w-0 [&_button]:max-w-full [&_button]:whitespace-normal [&_button]:min-h-11 [overflow-wrap:anywhere]" onEscapeKeyDown={e=>{if(pending)e.preventDefault();}} onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus();}}>
   <AlertDialogTitle>{draft?.action==='delete'?'Delete this genetic dataset?':draft?.sourceId?'Use this saved dataset?':'Keep no genetic dataset active?'}</AlertDialogTitle>
   <AlertDialogDescription>{draft?.action==='delete'?'Remove only the selected saved genetic dataset and known derived precision plans. If active, it becomes no active dataset; an older import will not replace it. Other datasets, bloodwork, food, Athlete records and preferences remain. This cannot be undone in Bloom; separate backup retention still applies.':draft?.sourceId?'Use this existing source for supported views and suggestions. This does not verify the assay, enable unapproved personal claims or merge datasets. Derived weekly plans refresh; every saved dataset is retained.':'Stop using genetic data in current views and suggestions. All saved datasets remain available; none will be chosen automatically.'}</AlertDialogDescription>
   <p className="break-words">{draftCaption}</p>
   {hasDraft&&<p className="panel-note">Unsaved SNP entries or file review on this page will be discarded when this action succeeds. Cancel to keep that work.</p>}
   <label className="flex min-h-11 gap-3 items-start"><input type="checkbox" checked={confirmed} disabled={pending||stale} onChange={e=>setConfirmed(e.target.checked)}/><span>{hasDraft?"I confirm this dataset action and discard my unsaved entries.":"I confirm this dataset action."}</span></label>
   {(error||stale)&&<p role="alert">{stale?'The saved source state changed. Reload before confirming.':error}</p>}
   <div className="flex flex-wrap gap-3"><AlertDialogCancel asChild><Button type="button" variant="outline" disabled={pending}>Cancel</Button></AlertDialogCancel><Button type="button" variant={draft?.action==='delete'?'destructive':'default'} disabled={!confirmed||pending||stale} onClick={commit}>{pending?'Updating source…':draft?.action==='delete'?'Delete confirmed dataset':draft?.sourceId?'Use confirmed dataset':'Confirm no active dataset'}</Button>{(error||stale)&&<Button type="button" variant="outline" disabled={pending} onClick={()=>{setDraft(null);sources.refetch();}}>Reload saved sources</Button>}</div>
  </AlertDialogContent></AlertDialog>
  <Dialog open={!!viewId} onOpenChange={open=>{if(!open)setViewId(null);}}><DialogContent className="max-h-[90dvh] overflow-y-auto min-w-0" onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus();}}><DialogTitle>Saved genetic source</DialogTitle><DialogDescription>Viewing source facts does not activate this dataset or change a plan. Sensitive storage-only markers remain withheld.</DialogDescription>
   {(detail.isPending||detail.fetchStatus!=='idle')&&<p role="status">Loading saved source…</p>}{detail.isError&&<div role="alert"><p>This source could not be loaded.</p><Button onClick={()=>detail.refetch()}>Retry source details</Button></div>}
   {currentDetail&&<><p>{currentDetail.provider==='manual'?'Manual entries':currentDetail.provider==='23andMe'?'Selected DNA-file calls':'Unrecognized source'} · reported date {currentDetail.collectedAt?.slice(0,10)||'not supplied'}</p><p className="panel-note">Build: {currentDetail.build||'not supplied'} · strand: {currentDetail.strand}. {currentDetail.limitation}</p>{!currentDetail.readable?<p>The saved source format is not supported for interpretation. It remains individually deletable.</p>:<ul className="divide-y divide-border">{currentDetail.observations.map(call=><li key={call.rsid} className="py-2 break-words"><p>{call.gene||'Recorded marker'} · {call.rsid}: {call.genotype==='--'?'Source reports no call':call.genotype}</p><p className="panel-note">Original call: {call.original||'not recorded'}</p></li>)}</ul>}</>}
  </DialogContent></Dialog>
 </section>;
}
