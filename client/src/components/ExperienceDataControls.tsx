import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { refreshExperience } from "@/lib/experience";
import { WorkspaceExport } from "./WeeklyReview";
function HealthSourceControls(){
 const [confirmation,setConfirmation]=useState("");
 const queryClient=useQueryClient();
 const status=useQuery<{connections:Array<{provider:string;state:string;note:string}>}>({queryKey:["/api/health-sources"],queryFn:async()=>{const r=await fetch("/api/health-sources",{credentials:"include"});if(!r.ok)throw Error("Health source status unavailable");return r.json();}});
 const remove=useMutation({mutationFn:async(provider:string)=>{const r=await fetch("/api/health-sources/"+provider,{method:"DELETE",credentials:"include",headers:{"x-bloom-confirm":"delete-health-source"}});if(!r.ok)throw Error("Health-source deletion failed");},onSuccess:()=>{setConfirmation("");queryClient.invalidateQueries({queryKey:["/api/health-sources"]});}});
 return <details><summary>External health data and device connections</summary><p className="panel-note">Apple Health and Android Health Connect are not connected. Bloom cannot access device data through this browser. The records below are private and are not proof of an active connection.</p>
 {status.isLoading?<p>Checking device connection status…</p>:status.error?<p role="alert">Connection status unavailable.</p>:<ul>{status.data?.connections.map(c=><li key={c.provider}><strong>{c.provider==="apple_health"?"Apple Health":"Health Connect"}</strong> — Not connected</li>)}</ul>}
 <p><a href="/api/health-sources/export" download="bloom-health-observations.json">Export stored health source data (JSON)</a></p>
 <label className="block">Delete data for a provider<select className="bloom-input w-full" value={confirmation} onChange={e=>setConfirmation(e.target.value)}><option value="">Select a source</option><option value="apple_health">Apple Health</option><option value="health_connect">Health Connect</option></select></label>
 <Button variant="destructive" disabled={!confirmation||remove.isPending} onClick={()=>remove.mutate(confirmation)}>Delete selected source data</Button>{remove.error&&<p role="alert">{remove.error.message}</p>}
 </details>;
}
export default function ExperienceDataControls(){const[confirm,setConfirm]=useState(""),[,navigate]=useLocation();const remove=useMutation({mutationFn:async()=>{const r=await fetch("/api/experience",{method:"DELETE",credentials:"include",headers:{"x-bloom-confirm":"delete-experience-data"}});if(!r.ok)throw Error("Experience data could not be deleted.");},onSuccess:()=>{refreshExperience();navigate("/");}});return <details className="bloom-panel workspace-disclosure"><summary>Training, saved meals & experience privacy</summary><WorkspaceExport/><HealthSourceControls/><p className="panel-note">The private export includes athlete settings, training, check-ins, saved meals, remembered corrections and supplement-review records. Bloom does not save uploaded images in these records. External provider retention rules are separate. You decide whether to share the export.</p><details><summary>Delete experience records</summary><p>This deletes athlete settings, practical planning preferences, sessions, check-ins, saved meals and remembered corrections. Journal meals and precision biology records have separate controls.</p><label className="block">Type DELETE EXPERIENCE to confirm<input className="bloom-input w-full" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><Button variant="destructive" disabled={confirm!=="DELETE EXPERIENCE"||remove.isPending} onClick={()=>remove.mutate()}>Delete experience records</Button>{remove.error&&<p role="alert">{remove.error.message}</p>}</details></details>;}
