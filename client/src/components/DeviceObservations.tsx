import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useExperience } from "@/lib/experience";
import { kgToDisplay, quantityFromCanonical } from "@shared/display-units";
import type { HealthObservation } from "@shared/health-ingestion";

type Result = { observations: HealthObservation[]; returned:number; hasMore:boolean; total:number; offset:number; limit:number; interpretation:string };
const labels: Record<HealthObservation["kind"],string> = {
 steps:"Steps", heart_rate:"Heart rate", body_mass:"Body weight", sleep:"Sleep",
 distance:"Distance",hydration:"Recorded hydration",
};
function measurement(o:HealthObservation, weightUnit:"kg"|"lb",hydrationUnit:"mL"|"L"|"US-fl-oz"){
 if(o.kind==="body_mass")return `${Number(kgToDisplay(o.value,weightUnit).toFixed(1))} ${weightUnit}`;
 if(o.kind==="hydration")return `${Number(quantityFromCanonical("hydration",o.value,hydrationUnit).toFixed(1))} ${hydrationUnit}`;
 if(o.kind==="sleep")return `${o.value} min (${o.stage})`;
 return `${o.value} ${o.unit}`;
}
export default function DeviceObservations() {
 const {user}=useAuth();
 const {settings}=useExperience();
 const [kind,setKind]=useState("all");
 const [provider,setProvider]=useState("all"),[page,setPage]=useState(0);
 const q=useQuery<Result>({queryKey:["device-observations",user?.id,kind,provider,page],
   enabled:!!user,
   queryFn:async()=>{
     const params=new URLSearchParams({limit:"50",offset:String(page*50)});
     if(kind!=="all")params.set("kind",kind);
     if(provider!=="all")params.set("provider",provider);
     return (await apiRequest("GET","/api/health-sources/observations?"+params.toString())).json();
   }});
 return <section className="bloom-panel space-y-3" aria-labelledby="device-observation-title">
   <h2 id="device-observation-title">Device observations</h2>
   <p className="panel-note">Imported source measurements are displayed individually. Overlapping records are not combined into daily totals. A device connection is not currently available in this browser.</p>
   <label className="block">Measurement
     <select className="bloom-input" value={kind} onChange={e=>{setKind(e.target.value);setPage(0);}}>
       <option value="all">All measurements</option>
       {Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
     </select>
   </label>
   <label className="block">Source
     <select className="bloom-input" value={provider} onChange={e=>{setProvider(e.target.value);setPage(0);}}>
       <option value="all">All device sources</option><option value="apple_health">Apple Health</option><option value="health_connect">Health Connect</option>
     </select>
   </label>
   {q.isPending && <p role="status">Loading source observations…</p>}
   {q.isError && <p role="alert">Device observations could not load. <button type="button" className="text-link" onClick={()=>q.refetch()}>Retry</button></p>}
   {q.data && (q.data.observations.length===0
    ? <p>No imported observations for this selection. This does not mean your measurement is zero.</p>
    : <div className="overflow-x-auto"><table className="w-full text-left">
      <caption className="sr-only">Source observations, not deduplicated daily totals</caption>
      <thead><tr><th scope="col">Date</th><th scope="col">Measurement</th><th scope="col">Value</th><th scope="col">Source</th></tr></thead>
      <tbody>{q.data.observations.map((o,i)=><tr key={`${o.source.provider}:${o.source.deviceId}:${o.source.recordId}:${i}`}>
        <td>{new Date(o.endAt).toLocaleString()}</td><td>{labels[o.kind]}</td>
        <td>{measurement(o,settings.displayUnits.bodyWeight,settings.displayUnits.hydration)}</td>
        <td>{o.source.provider==="apple_health"?"Apple Health":o.source.provider==="health_connect"?"Health Connect":"Manual"}
        <details><summary>Record source</summary>
          <span className="block">Device: {o.source.deviceId}</span>
          <span className="block">Record: {o.source.recordId}</span>
          <span className="block">Revision: {o.source.sourceRevision}</span>
          <span className="block">Received: {new Date(o.receivedAt).toLocaleString()}</span>
        </details>
        </td>
      </tr>)}</tbody>
    </table></div>)}
   {q.data && q.data.total>0 && <nav aria-label="Device observation pages" className="flex flex-wrap items-center gap-3">
     <button type="button" className="text-link" disabled={page===0||q.isFetching} onClick={()=>setPage(p=>Math.max(0,p-1))}>Previous page</button>
     <span className="panel-note">Records {q.data.offset+1}–{q.data.offset+q.data.returned} of {q.data.total}, not aggregated daily totals.</span>
     <button type="button" className="text-link" disabled={!q.data.hasMore||q.isFetching} onClick={()=>setPage(p=>p+1)}>Next page</button>
   </nav>}
 </section>;
}
