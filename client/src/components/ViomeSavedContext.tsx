import {useEffect,useRef,useState} from "react";
import {useAuth} from "@/lib/auth";
import {apiRequest,queryClient} from "@/lib/queryClient";
import {invalidatePlanningInputs} from "@/lib/planning-cache";
import {viomeSource,compatibleViomeCompanion,type ViomeSavedSource} from "@shared/viome-report-context";

export default function ViomeSavedContext({sample,samples,onSelect,onDeleted}:{sample:ViomeSavedSource;samples:ViomeSavedSource[];onSelect:(id:string)=>void;onDeleted:()=>void}){
 const{user}=useAuth(),actor=useRef(user?.id),active=useRef(true);actor.current=user?.id;
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState("");
 useEffect(()=>{setConfirmed(false);setError("");},[sample.id]);
 const source=viomeSource(sample.structuredData);if(!source)return null;
 const parent=source.specimenEvent?samples.find(row=>row.id===source.specimenEvent!.rootReportId):null;
 const parentSource=parent?viomeSource(parent.structuredData):null;
 const companions=source.specimenEvent?(parent&&parentSource&&compatibleViomeCompanion(source,parentSource)?[parent]:[]):samples.filter(row=>{const linked=viomeSource(row.structuredData);return linked?.specimenEvent?.rootReportId===sample.id&&compatibleViomeCompanion(linked,source);});
 async function remove(){const owner=user?.id;if(!owner||!confirmed||pending)return;setPending(true);setError("");
  try{const response=await apiRequest('DELETE','/api/microbiome/reports/'+encodeURIComponent(sample.id),undefined,{'X-Bloom-Report-Actor':owner});if((await response.json())?.success!==true)throw Error('Unconfirmed deletion');
   const current=active.current&&actor.current===owner,ownedKeys=new Set([owner,...samples.map(row=>row.id)]);
   const planning=current?invalidatePlanningInputs():Promise.resolve();
   if(current)onDeleted();
   // Clear the deleted owner's report variants even if changing the selected
   // report unmounted this component while DELETE was in flight. A new
   // account's unrelated queries are outside this predicate.
   await Promise.all([queryClient.resetQueries({predicate:query=>String(query.queryKey[0]).startsWith('/api/microbiome')&&ownedKeys.has(String(query.queryKey[1]))}),planning]);
  }catch{if(active.current&&actor.current===owner)setError("The report deletion could not be confirmed. Reload your saved reports before trying again.");}
  finally{if(active.current&&actor.current===owner)setPending(false);}
 }
 return <section className="bloom-panel space-y-3" aria-label="Viome source relationship">
  <h2>Source relationship</h2><p>{companions.length?"You confirmed these separate reports came from the same specimen. Their values and categories remain separate.":source.specimenEvent?"The linked report is no longer available. This report's own findings remain available.":"This is a standalone source. Matching dates do not establish a shared specimen."}</p>
  {companions.map(row=><button key={row.id} className="text-link min-h-11 focus-visible:outline focus-visible:outline-2" type="button" onClick={()=>onSelect(row.id)}>Open companion report</button>)}
  <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Delete this Viome source</summary><div className="space-y-3"><p>Remove this report and its derived records. Any surviving companion keeps its biological findings and becomes unlinked. Other reports and manual records are retained.</p>
   <label className="flex min-h-11 gap-3"><input type="checkbox" checked={confirmed} disabled={pending} onChange={e=>setConfirmed(e.target.checked)}/><span>Delete this report from my account.</span></label>
   <button className="text-link min-h-11 disabled:opacity-50" type="button" disabled={!confirmed||pending} onClick={remove}>{pending?"Deleting report…":"Delete confirmed report"}</button>{error&&<p role="alert">{error}</p>}
  </div></details>
 </section>;
}
