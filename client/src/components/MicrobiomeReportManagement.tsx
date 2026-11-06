import{accountContextGuard}from"@/lib/request-actor";
import{useEffect,useRef,useState}from"react";
import{useAuth}from"@/lib/auth";
import{apiRequest,ApiRequestError,queryClient}from"@/lib/queryClient";
import{resetPlanningInputs}from"@/lib/planning-cache";
import{REPORT_DELETE_CONFIRM,type MicrobiomeDeleteResult}from"@shared/report-management";
import{reportDateText}from"@shared/report-dates";
import{AlertDialog,AlertDialogTrigger,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel}from"@/components/ui/alert-dialog";
import{Button}from"@/components/ui/button";
type SavedReport={id:string;deletionRevision?:string;testingCompany?:string;processingStatus:string;testDate?:string|Date;structuredData?:any;uploadedAt?:string|Date};
export default function MicrobiomeReportManagement({sample,samples,onDeleted,onReload}:{sample:SavedReport;samples:SavedReport[];onDeleted:()=>void;onReload:()=>unknown}){
 const{user}=useAuth(),actor=useRef(user?.id),active=useRef(true);actor.current=user?.id;
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const[open,setOpen]=useState(false),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(""),[version,setVersion]=useState<string>();
 useEffect(()=>{if(open&&sample.deletionRevision!==version){setConfirmed(false);setError("This report changed. Close this dialog and review the current report before deleting.");}},[open,sample.deletionRevision,version]);
 const openChange=(next:boolean)=>{if(pending)return;if(next){setVersion(sample.deletionRevision);setConfirmed(false);setError("");}setOpen(next);};
 async function remove(){const owner=user?.id;if(!owner||!confirmed||pending||!version||version!==sample.deletionRevision)return;const assertOwner=accountContextGuard(),sameAccount=()=>{try{assertOwner();return true;}catch{return false;}};setPending(true);setError("");
  try{
   const response=await apiRequest('DELETE','/api/microbiome/reports/'+encodeURIComponent(sample.id),undefined,{'X-Bloom-Report-Actor':owner,'X-Bloom-Confirm':REPORT_DELETE_CONFIRM,'If-Match':'"'+version+'"'});
   const result=await response.json() as MicrobiomeDeleteResult;if(result?.success!==true||!['deleted','not-present'].includes(result.state))throw Error('Unconfirmed deletion');
   const current=()=>active.current&&actor.current===owner,ownedKeys=new Set([owner,...samples.map(row=>row.id)]);
   const ownedReports=(query:{queryKey:readonly unknown[]})=>String(query.queryKey[0]).startsWith('/api/microbiome')&&ownedKeys.has(String(query.queryKey[1]));
   await queryClient.cancelQueries({predicate:ownedReports});
   if(!sameAccount()){queryClient.removeQueries({predicate:ownedReports});return;}
   queryClient.setQueryData<SavedReport[]>(['/api/microbiome/samples',owner],rows=>rows?.filter(row=>row.id!==sample.id));
   queryClient.removeQueries({predicate:q=>String(q.queryKey[0])==='/api/microbiome/results'&&q.queryKey[1]===sample.id});
   if(current())onDeleted();
   await Promise.all([queryClient.resetQueries({predicate:ownedReports}),resetPlanningInputs()]);
  }catch(cause){if(active.current&&actor.current===owner)setError(cause instanceof ApiRequestError&&cause.status===409?"This report changed. Reload and review it before deleting.":"Deletion could not be confirmed. Retry the same deletion safely, or reload your reports to check their current state.");}
  finally{if(active.current&&actor.current===owner)setPending(false);}
 }
 return <div className="mt-4" aria-label="Manage selected report">
  <AlertDialog open={open} onOpenChange={openChange}><AlertDialogTrigger asChild><Button variant="outline" className="min-h-11" type="button">Delete report</Button></AlertDialogTrigger>
   <AlertDialogContent className="max-h-[90dvh] overflow-y-auto" onEscapeKeyDown={e=>{if(pending)e.preventDefault();}}>
    <AlertDialogTitle>Delete this saved report?</AlertDialogTitle>
    <AlertDialogDescription>This removes one selected microbiome report and records derived only from it. A surviving companion keeps its own findings and becomes unlinked. Other reports, food logs, Athlete records, bloodwork, genetics and preferences remain.</AlertDialogDescription>
    <p className="break-words">{sample.testingCompany||"Saved microbiome report"} · {reportDateText(sample)} · {sample.processingStatus}</p>
    <p className="text-sm">This cannot be undone in Bloom. Backups and copies held by a provider follow their separate retention policies. Dependent report views and suggestions will refresh from remaining sources.</p>
    {!version&&<p role="alert">Reload your saved reports to check the current version before deleting.</p>}
    <label className="flex min-h-11 gap-3 items-start"><input type="checkbox" checked={confirmed} disabled={pending||!version||version!==sample.deletionRevision} onChange={e=>setConfirmed(e.target.checked)}/><span>Delete this report from my account.</span></label>
    {error&&<p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-3"><AlertDialogCancel asChild><Button type="button" variant="outline" disabled={pending}>Cancel</Button></AlertDialogCancel><Button type="button" variant="destructive" disabled={!confirmed||pending||!version||version!==sample.deletionRevision} onClick={remove}>{pending?"Deleting report…":"Delete confirmed report"}</Button>{(error||!version)&&<Button variant="outline" type="button" disabled={pending} onClick={()=>{setOpen(false);setConfirmed(false);onReload();}}>Reload reports</Button>}</div>
   </AlertDialogContent>
  </AlertDialog>
 </div>;
}
