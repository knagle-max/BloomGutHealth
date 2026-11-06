import{useEffect,useRef,useState}from'react';
import{useQuery}from'@tanstack/react-query';
import{z}from'zod';
import{useAuth}from'@/lib/auth';
import{apiRequest,queryClient}from'@/lib/queryClient';
import{accountContextGuard}from'@/lib/request-actor';
import{resetPlanningInputs,invalidatePlanningInputs}from'@/lib/planning-cache';
import{Button}from'./ui/button';
import{AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel}from'./ui/alert-dialog';
const schema=z.array(z.object({id:z.string().regex(/^[a-f0-9]{64}$/),revision:z.string().regex(/^[a-f0-9]{64}$/),scope:z.enum(['report','result']),results:z.number().int().nonnegative().nullable(),records:z.number().int().positive(),dates:z.array(z.string())}));
type Source=z.infer<typeof schema>[number];
export default function LabSourceManagement(){
 const{user}=useAuth(),mounted=useRef(true),actor=useRef(user?.id);actor.current=user?.id;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const key=['/api/precision/labs/sources',user?.id];
 const sources=useQuery({queryKey:key,enabled:!!user,queryFn:async({signal})=>schema.parse(await(await apiRequest('GET','/api/precision/labs/sources',undefined,undefined,signal)).json())});
 const[draft,setDraft]=useState<Source|null>(null),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const current=sources.fetchStatus==='idle'&&!sources.isError?sources.data:undefined;
 const stale=!!draft&&!!current&&current.some(row=>row.id===draft.id&&row.revision!==draft.revision);
 async function remove(){if(!user||!draft||!confirmed||pending||stale)return;const owner=user.id,intent=draft,guard=accountContextGuard();setPending(true);setError('');
  try{await apiRequest('DELETE','/api/precision/labs/sources/'+intent.id,{revision:intent.revision,confirmed:true},{'X-Bloom-Labs-Actor':owner,'X-Bloom-Confirm':'delete-lab-source'});guard();await queryClient.cancelQueries({queryKey:key});guard();queryClient.removeQueries({queryKey:key});
   if(mounted.current&&actor.current===owner){setDraft(null);setNotice('The selected laboratory source and its revisions were deleted. Other sources remain.');requestAnimationFrame(()=>document.getElementById('lab-source-management-heading')?.focus());}
   await resetPlanningInputs();
  }catch{try{guard();if(mounted.current&&actor.current===owner)setError('Deletion could not be confirmed. Retry this exact action if the response was lost, or cancel and reload if the source changed.');await invalidatePlanningInputs();}catch{/* A previous account cannot restore source metadata. */}}
  finally{if(mounted.current&&actor.current===owner)setPending(false);}
 }
 return <section className="bloom-panel space-y-3" aria-labelledby="lab-source-management-heading"><h2 id="lab-source-management-heading" tabIndex={-1}>Saved laboratory sources</h2>
  <p className="panel-note">Reports follow saved import identity and correction history. Matching dates do not combine independent results.</p>
  {notice&&<p role="status">{notice}</p>}{sources.isPending&&<p role="status">Checking saved sources…</p>}{sources.isError&&<p role="alert">Saved sources could not be checked. <Button variant="outline" onClick={()=>sources.refetch()}>Retry source check</Button></p>}
  {current&&<details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Manage {current.length} saved laboratory sources</summary><div className="space-y-3">{current.map(row=><article key={row.id} data-lab-source={row.id} className="border rounded-xl p-3 space-y-2 break-words"><h3>{row.scope==='report'?'Imported laboratory source':'Independent laboratory result'} · {row.id.slice(-8)}</h3><p>{row.results===null?'Result count unavailable':`${row.results} result(s)`} · {row.records} saved record(s), including revisions</p><p>Recorded dates: {row.dates.join(' · ')||'Not available'}</p><Button variant="outline" onClick={()=>{setDraft(row);setConfirmed(false);setError('');setNotice('');}}>{row.scope==='report'?'Delete report':'Delete result source'}</Button></article>)}{!current.length&&<p>No saved laboratory sources.</p>}</div></details>}
  <AlertDialog open={!!draft} onOpenChange={open=>{if(!open&&!pending)setDraft(null);}}><AlertDialogContent><AlertDialogTitle>Delete this laboratory {draft?.scope==='report'?'report':'result source'}?</AlertDialogTitle><AlertDialogDescription>This deletes the selected source and all its saved result, unit and date revisions. Other laboratory sources, Genetics, Microbiome and your food journal remain. Known dependent saved plans are removed; current recommendations reload. Unsaved form entries remain unsaved. This cannot be undone here; backup retention is separate.</AlertDialogDescription>
   <p>{draft?.results===null?'Result count unavailable':`${draft?.results} result(s)`} · {draft?.records} saved record(s) · Bloom reference {draft?.id.slice(-8)}</p>
   <label className="flex items-center gap-2 min-h-11"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={pending}/>I confirm deletion of this laboratory source and its revisions.</label>
   {stale&&<p role="alert">This source changed. Cancel and review the updated source before deleting.</p>}{error&&<p role="alert">{error}</p>}<div className="flex flex-wrap gap-2"><AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={!confirmed||pending||stale} onClick={remove}>{pending?'Deleting…':'Delete confirmed laboratory source'}</Button></div>
  </AlertDialogContent></AlertDialog>
 </section>;
}
