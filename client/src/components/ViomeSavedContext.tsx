import{useEffect,useRef,useState}from"react";
import{useAuth}from"@/lib/auth";
import{apiRequest,ApiRequestError,queryClient}from"@/lib/queryClient";
import{resetPlanningInputs}from"@/lib/planning-cache";
import{savedViomeCompanions,viomeSource,type ViomeSavedSource}from"@shared/viome-report-context";
import type{ViomeRelationshipResult}from"@shared/report-management";
import{AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel}from"@/components/ui/alert-dialog";
import{Button}from"@/components/ui/button";
type Draft={action:"link"|"unlink";selectedRevision?:string;companionId:string;companionRevision?:string;confirmed:boolean};
export default function ViomeSavedContext({sample,samples,onSelect,onReload,onChanged}:{sample:ViomeSavedSource;samples:ViomeSavedSource[];onSelect:(id:string)=>void;onReload:()=>unknown;onChanged:(state:"linked"|"unlinked")=>void}){
 const{user}=useAuth(),actor=useRef(user?.id),active=useRef(true);actor.current=user?.id;
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const[draft,setDraft]=useState<Draft|null>(null),[pending,setPending]=useState(false),[error,setError]=useState("");
 const context=savedViomeCompanions(sample,samples),chosen=draft?samples.find(row=>row.id===draft.companionId):undefined;
 const stale=!!draft&&(draft.selectedRevision!==sample.deletionRevision||!!draft.companionId&&draft.companionRevision!==chosen?.deletionRevision);
 const versionMissing=!!draft&&(!draft.selectedRevision||!!draft.companionId&&!draft.companionRevision);
 const trigger=useRef<HTMLButtonElement|null>(null);
 const label=(row:ViomeSavedSource)=>{const source=viomeSource(row.structuredData);return`${source?.documentKind==="active-gut-microbes"?"Active microbes":"Assessments & foods"} · collected ${source?.biologicalDates.collectedOn||"date unknown"} · saved ${row.uploadedAt?new Date(row.uploadedAt).toLocaleString():"time unknown"} · Bloom reference ${row.id.slice(-8)}`;};
 function begin(action:"link"|"unlink",button:HTMLButtonElement,other?:ViomeSavedSource){trigger.current=button;setError("");setDraft({action,selectedRevision:sample.deletionRevision,companionId:other?.id||"",companionRevision:other?.deletionRevision,confirmed:false});}
 async function save(){const owner=user?.id;if(!owner||!draft||!draft.confirmed||pending||stale||!draft.selectedRevision||!draft.companionRevision)return;const intent=draft;setPending(true);setError("");
  try{
   const response=await apiRequest('POST','/api/microbiome/reports/'+encodeURIComponent(sample.id)+'/relationship',{action:intent.action,companionId:intent.companionId,companionRevision:intent.companionRevision,confirmed:true},{'X-Bloom-Report-Actor':owner,'If-Match':'"'+intent.selectedRevision+'"'});
   const result=await response.json()as ViomeRelationshipResult;if(result?.success!==true||result.state!==(intent.action==="link"?"linked":"unlinked"))throw Error('Unconfirmed relationship');
   const current=()=>active.current&&actor.current===owner,ownedKeys=new Set([owner,...samples.map(row=>row.id)]);
   const ownedReports=(q:{queryKey:readonly unknown[]})=>String(q.queryKey[0]).startsWith('/api/microbiome')&&ownedKeys.has(String(q.queryKey[1]));
   await queryClient.cancelQueries({predicate:ownedReports});
   if(current()){setDraft(null);onChanged(result.state);}
   await Promise.all([queryClient.resetQueries({predicate:ownedReports}),current()?resetPlanningInputs():Promise.resolve()]);
  }catch(cause){if(active.current&&actor.current===owner)setError(cause instanceof ApiRequestError&&[404,409].includes(cause.status)?"These reports changed or are no longer compatible. Reload and review them before changing the link.":"The report link could not be confirmed. Retry the same action safely, or reload both reports.");}
  finally{if(active.current&&actor.current===owner)setPending(false);}
 }
 if(!context.source)return <p className="panel-note mt-3">{context.reason}</p>;
 return <section className="space-y-3 mt-4" aria-label="Viome source relationship"><h3 className="font-semibold">Companion reports</h3>
  <p>{context.linked.length?"You confirmed these separate reports came from the same specimen. Their values and categories remain separate.":context.source.specimenEvent?context.reason:"This is a standalone source. Matching dates do not establish a shared specimen."}</p>
  {!!context.reason&&!context.linked.length&&!context.source.specimenEvent&&<p className="panel-note">{context.reason}</p>}
  <div className="flex flex-wrap gap-3">{context.linked.length?context.linked.map(other=><div key={other.id} className="flex flex-wrap gap-3"><Button variant="outline" type="button" className="min-h-11" onClick={()=>onSelect(other.id)}>View companion</Button><Button variant="outline" type="button" className="min-h-11" onClick={e=>begin("unlink",e.currentTarget,other)}>Unlink reports</Button></div>):<Button variant="outline" type="button" className="min-h-11" onClick={e=>begin("link",e.currentTarget)}>Link companion report</Button>}</div>
  <AlertDialog open={!!draft} onOpenChange={open=>{if(!open&&!pending)setDraft(null);}}><AlertDialogContent className="max-h-[90dvh] overflow-y-auto" onEscapeKeyDown={e=>{if(pending)e.preventDefault();}} onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus();}}>
   <AlertDialogTitle>{draft?.action==="unlink"?"Unlink these reports?":"Link a saved companion report"}</AlertDialogTitle><AlertDialogDescription>{draft?.action==="unlink"?"Both saved reports and all biological findings remain. Only their specimen relationship is removed.":"Choose the other saved report only if you know both came from the same stool specimen. Dates alone cannot confirm this. Reports and findings stay separate; provider identifiers are not used."}</AlertDialogDescription>
   {draft?.action==="link"?(context.eligible.length?<label className="block">Saved companion report<select className="bloom-input w-full" disabled={pending} value={draft.companionId} onChange={e=>{const other=context.eligible.find(row=>row.id===e.target.value);setDraft({...draft,companionId:other?.id||"",companionRevision:other?.deletionRevision,confirmed:false});}}><option value="">Choose a saved report</option>{context.eligible.map(row=><option key={row.id} value={row.id}>{label(row)}</option>)}</select></label>:<p>{context.reason}</p>):chosen&&<p className="break-words">{label(chosen)}</p>}
   {(draft?.companionId)&&<label className="flex min-h-11 gap-3 items-start"><input type="checkbox" disabled={pending||stale||versionMissing} checked={draft.confirmed} onChange={e=>setDraft({...draft,confirmed:e.target.checked})}/><span>{draft.action==="link"?"I confirm these two reports came from the same stool specimen.":"Unlink these reports and keep both reports and their findings."}</span></label>}
   {(versionMissing||stale||error)&&<p role="alert">{versionMissing?"Reload both reports to check their current versions.":stale?"A report changed. Reload both reports before confirming.":error}</p>}
   <div className="flex flex-wrap gap-3"><AlertDialogCancel asChild><Button type="button" variant="outline" disabled={pending}>Cancel</Button></AlertDialogCancel><Button type="button" disabled={pending||!draft?.confirmed||!draft.companionRevision||!draft.selectedRevision||stale} onClick={save}>{pending?"Saving relationship…":draft?.action==="unlink"?"Unlink confirmed reports":"Link confirmed reports"}</Button>{(error||stale||versionMissing)&&<Button type="button" variant="outline" disabled={pending} onClick={()=>{setDraft(null);onReload();}}>Reload reports</Button>}</div>
  </AlertDialogContent></AlertDialog>
 </section>;
}
