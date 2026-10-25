import {invalidatePlanningInputs} from "@/lib/planning-cache";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { markerDefinitions, type PrecisionReport } from "@shared/precision-nutrition";
import { Button } from "./ui/button";
export default function LabUnitReview({labs}:{labs:PrecisionReport["pendingLabs"]}) {
  const [choices,setChoices]=useState<Record<string,string>>({}),[confirmed,setConfirmed]=useState<Record<string,boolean>>({});
  const save=useMutation({mutationFn:async(id:string)=>apiRequest("POST",`/api/precision/labs/${id}/confirm-unit`,{unit:choices[id]}),onSuccess:()=>invalidatePlanningInputs()});
  if(!labs.length)return save.isSuccess ? <p role="status">Source unit confirmed.</p> : null;
  return <section className="bloom-panel space-y-4" aria-label="Laboratory unit review"><h2>{labs.length} result(s) need unit confirmation</h2><p>These original values are saved for review. They are excluded from nutrition recommendations, range flags and trend calculations.</p>
    {labs.map(l=><article className="lab-review-row" key={l.id}><span className="evidence-state">Unit assumed — confirm</span><h3>{markerDefinitions.find(m=>m.id===l.marker)?.name}</h3><p className="insight-value">{l.unitReview!.originalValue} <span className="text-base">· unit unconfirmed</span></p><p>{l.measuredAt.slice(0,10)} · {l.laboratory}</p><p className="panel-note lab-source-text">Original row: {l.unitReview!.originalText}</p><p>System guess — confirm: {l.unitReview!.suggestedUnit}. Check the original report; this suggestion does not establish the source unit.</p>
      <label>Source unit for {markerDefinitions.find(m=>m.id===l.marker)?.name}<select aria-label={`Source unit for ${markerDefinitions.find(m=>m.id===l.marker)?.name}`} className="bloom-input" value={choices[l.id]||""} onChange={e=>{setChoices({...choices,[l.id]:e.target.value});setConfirmed({...confirmed,[l.id]:false});}}><option value="">Choose the unit printed on your report</option>{markerDefinitions.find(m=>m.id===l.marker)!.units.map(u=><option key={u}>{u}</option>)}</select></label>
      <label><input type="checkbox" checked={!!confirmed[l.id]} onChange={e=>setConfirmed({...confirmed,[l.id]:e.target.checked})}/>I checked this number and unit against my report.</label>
      <Button disabled={!choices[l.id]||!confirmed[l.id]||save.isPending} onClick={()=>save.mutate(l.id)}>Confirm source unit</Button>
      <p className="panel-note">Confirmation reinterprets {l.unitReview!.originalValue} in your selected source unit. The original input and confirmation timestamp remain in your private records. This does not verify the laboratory measurement or provide a diagnosis.</p>
    </article>)}{save.error&&<p role="alert">{save.error.message}</p>}{save.isSuccess&&<p role="status">Source unit confirmed.</p>}
  </section>;
}
