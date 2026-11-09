import {useEffect,useMemo,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useAuth} from "@/lib/auth";
import {viomeImportContext,type ViomeSavedSource} from "@shared/viome-report-context";
import type {ViomeFindings} from "@shared/viome-findings";
export type ViomeImportDecision={reuseExistingReportId?:string;specimenEvent?:ViomeFindings["specimenEvent"]};
export default function ViomeImportChoices({incoming,disabled,onDecision}:{incoming:ViomeFindings;disabled:boolean;onDecision:(decision:ViomeImportDecision|null)=>void}){
 const{user}=useAuth();
 const samples=useQuery<ViomeSavedSource[]>({queryKey:["/api/microbiome/samples",user?.id],enabled:!!user,staleTime:0,refetchOnMount:"always"});
 const context=useMemo(()=>viomeImportContext(incoming,samples.data||[]),[incoming,samples.data]);
 const[mode,setMode]=useState(""),[reuseId,setReuseId]=useState(""),[rootId,setRootId]=useState(""),[confirmed,setConfirmed]=useState(false),[uncheckedSeparate,setUncheckedSeparate]=useState(false);
 useEffect(()=>{setMode("");setReuseId("");setRootId("");setConfirmed(false);setUncheckedSeparate(false);},[incoming]);
 useEffect(()=>{
  if(!user||samples.fetchStatus!=="idle"||samples.isPending){onDecision(null);return;}
  if(samples.isError){onDecision(uncheckedSeparate?{}:null);return;}
  if(context.duplicates.length&&mode!=="separate"&&mode!=="reuse"){onDecision(null);return;}
  if(mode==="reuse"){
   onDecision(context.duplicates.some(({sample})=>sample.id===reuseId)?{reuseExistingReportId:reuseId}:null);return;
  }
  if(rootId){onDecision(confirmed&&context.companions.some(({sample})=>sample.id===rootId)?{specimenEvent:{rootReportId:rootId,confirmed:true}}:null);return;}
  onDecision({});
 },[user?.id,samples.fetchStatus,samples.isPending,samples.isError,uncheckedSeparate,context,mode,reuseId,rootId,confirmed,onDecision]);
 const label=({sample,source}:typeof context.duplicates[number])=>`${source.documentKind==="active-gut-microbes"?"Active microbes":"Assessments & foods"} · collected ${source.biologicalDates.collectedOn||"date unknown"} · uploaded ${sample.uploadedAt?new Date(sample.uploadedAt).toLocaleString():"time unknown"} · Bloom reference ${sample.id.slice(-8)}`;
 return <fieldset disabled={disabled} className="min-w-0 border-0 p-0 space-y-3"><legend className="font-semibold">Existing reports & specimen</legend>
  {(samples.isPending||samples.fetchStatus!=="idle")&&<p role="status">Checking your saved reports…</p>}
  {samples.isError&&<><p role="alert">Saved reports could not be checked.</p><button type="button" className="text-link min-h-11" onClick={()=>samples.refetch()}>Retry report check</button><label className="flex gap-3 min-h-11"><input type="checkbox" checked={uncheckedSeparate} onChange={e=>setUncheckedSeparate(e.target.checked)}/><span>Save as a separate source without checking existing reports.</span></label></>}
  {!samples.isError&&samples.fetchStatus==="idle"&&<>
   {!!context.duplicates.length&&<><p>Matching biological findings are already saved. A different filename or header does not make a new biological result.</p>
    <label className="flex min-h-11 gap-3"><input type="radio" name="viome-existing-choice" checked={mode==="reuse"} onChange={()=>{setMode("reuse");setRootId("");setConfirmed(false);}}/><span>Use an existing report; do not create another observation.</span></label>
    {mode==="reuse"&&<label className="block">Existing report<select className="bloom-input w-full" value={reuseId} onChange={e=>setReuseId(e.target.value)}><option value="">Choose the report you mean</option>{context.duplicates.map(item=><option key={item.sample.id} value={item.sample.id}>{label(item)}</option>)}</select></label>}
    <label className="flex min-h-11 gap-3"><input type="radio" name="viome-existing-choice" checked={mode==="separate"} onChange={()=>{setMode("separate");setReuseId("");}}/><span>This is a separate biological source; save another report.</span></label>
   </>}
   {mode!=="reuse"&&<details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Link a companion report (optional)</summary><div className="space-y-3">
    <p>Reports stay separate. Choose a compatible saved report only if you know they came from the same specimen. Matching dates alone never link them.</p>
    {!incoming.biologicalDates.collectedOn&&<p>Collection date is optional and was not supplied. Use the saved report’s upload date to help choose a companion; this report will retain its own upload date. Confirm that they came from the same specimen.</p>}
    {!context.companions.length?<p>No compatible, unpaired companion is available.</p>:<><label className="block">Companion report<select className="bloom-input w-full" value={rootId} onChange={e=>{setRootId(e.target.value);setConfirmed(false);}}><option value="">Keep this report separate</option>{context.companions.map(item=><option key={item.sample.id} value={item.sample.id}>{label(item)}</option>)}</select></label>
     {!!rootId&&<label className="flex min-h-11 gap-3"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} /><span>I confirm these reports came from the same specimen. No provider test or sample ID will be stored.</span></label>}
    </>}
   </div></details>}
  </>}
 </fieldset>;
}
