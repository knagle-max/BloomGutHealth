import { downloadAccountFile } from "@/lib/account-download";
import { accountFetch, ACCOUNT_CONTEXT_MESSAGE } from "@/lib/request-actor";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { refreshExperience } from "@/lib/experience";
import { WorkspaceExport } from "./WeeklyReview";
function HealthSourceControls(){
 const [confirmation,setConfirmation]=useState("");
 const [deleteText,setDeleteText]=useState("");
 const queryClient=useQueryClient();
 const download=useMutation({mutationFn:()=>downloadAccountFile("/api/health-sources/export","bloom-health-observations.json")});

 const remove=useMutation({mutationFn:async(provider:string)=>{
 const all=provider==="all";
 const r=await accountFetch(all?"/api/health-sources":"/api/health-sources/"+provider,{method:"DELETE",credentials:"include",headers:{"x-bloom-confirm":all?"delete-all-health-sources":"delete-health-source"}});
 if(r.status===409&&((await r.clone().json().catch(()=>null))?.code==="ACCOUNT_CONTEXT_CHANGED"))throw Error(ACCOUNT_CONTEXT_MESSAGE);if(!r.ok)throw Error("Health-source deletion failed");
 },onSuccess:()=>{setConfirmation("");setDeleteText("");queryClient.invalidateQueries({queryKey:["/api/health-sources"]});queryClient.invalidateQueries({queryKey:["device-observations"]});}});
 return <details><summary>Stored health-source records</summary><p className="panel-note">Export or remove records stored in Bloom. These actions do not connect a device or change provider permissions.</p>
 <p><Button variant="outline" disabled={download.isPending} onClick={()=>download.mutate()}>Export stored health source data (JSON)</Button></p>{download.error&&<p role="alert">{download.error.message}</p>}
 <label className="block">Delete data for a provider<select className="bloom-input w-full" value={confirmation} onChange={e=>setConfirmation(e.target.value)}><option value="">Select a source</option><option value="apple_health">Apple Health</option><option value="health_connect">Health Connect</option><option value="all">All device source data</option></select></label>
 <label className="block">Type DELETE SOURCE to confirm permanent removal of stored source records<input className="bloom-input w-full" autoComplete="off" value={deleteText} onChange={e=>setDeleteText(e.target.value)}/></label>
 <Button variant="destructive" disabled={!confirmation||deleteText!=="DELETE SOURCE"||remove.isPending} onClick={()=>remove.mutate(confirmation)}>Delete selected source data</Button>{remove.isSuccess&&<p role="status">Stored source records deleted. Native device permissions, if any, must be changed in device settings.</p>}{remove.error&&<p role="alert">{remove.error.message}</p>}
 </details>;
}
export default function ExperienceDataControls(){const[confirm,setConfirm]=useState(""),[,navigate]=useLocation();const remove=useMutation({mutationFn:async()=>{const r=await accountFetch("/api/experience",{method:"DELETE",credentials:"include",headers:{"x-bloom-confirm":"delete-experience-data"}});if(r.status===409&&((await r.clone().json().catch(()=>null))?.code==="ACCOUNT_CONTEXT_CHANGED"))throw Error(ACCOUNT_CONTEXT_MESSAGE);if(!r.ok)throw Error("Experience data could not be deleted.");},onSuccess:()=>{refreshExperience();navigate("/");}});return <details className="bloom-panel workspace-disclosure"><summary>Training, saved meals & experience privacy</summary><WorkspaceExport/><HealthSourceControls/><p className="panel-note">The private export includes athlete settings, training, check-ins, saved meals, remembered corrections and supplement-review records. Bloom does not save uploaded images in these records. External provider retention rules are separate. You decide whether to share the export.</p><details><summary>Delete experience records</summary><p>This deletes athlete settings, practical planning preferences, sessions, check-ins, saved meals and remembered corrections. Journal meals and precision biology records have separate controls.</p><label className="block">Type DELETE EXPERIENCE to confirm<input className="bloom-input w-full" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><Button variant="destructive" disabled={confirm!=="DELETE EXPERIENCE"||remove.isPending} onClick={()=>remove.mutate()}>Delete experience records</Button>{remove.error&&<p role="alert">{remove.error.message}</p>}</details></details>;}
