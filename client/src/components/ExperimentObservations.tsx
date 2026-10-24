import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExperienceMutation } from "@/lib/experience";
import type { ExperienceRecord } from "@shared/experience";
import { reviewExperiment } from "@shared/experiment-review";
export default function ExperimentObservations({record}:{record:Extract<ExperienceRecord,{kind:"experiment"}>}) {
  const save=useExperienceMutation(),[error,setError]=useState("");
  const payload=record.payload,review=reviewExperiment(payload);
  return <details className="space-y-3"><summary>Measurements & comparison</summary>
    <p><strong>{review.status==="insufficient-data"?"Insufficient data":`Observed median change: ${Number(review.change!.toFixed(3))} ${review.unit}`}</strong></p>
    <p className="panel-note">{review.note} {review.caveat}</p>
    {payload.design&&<>
      <p>Baseline: {payload.design.baselineStartsOn}–{payload.design.baselineEndsOn}. Method: {payload.design.measurementMethod}. Unit: {payload.design.metricUnit}.</p>
      <p>Other changes to track: {payload.design.confoundersToTrack}</p>
      <form className="space-y-3" onSubmit={e=>{e.preventDefault();setError("");const d=new FormData(e.currentTarget),date=String(d.get("date")),value=Number(d.get("value"));
        if(!Number.isFinite(value)){setError("Enter a numeric measurement.");return;}
        const observation={date,value,adherence:d.get("adherence")===""?null:Number(d.get("adherence")),confounders:String(d.get("confounders")||"")};
        save.mutate({id:record.id,entry:{kind:"experiment",payload:{...payload,observations:[...payload.observations.filter(o=>o.date!==date),observation]}}});
      }}>
        <div className="precision-grid">
          <label>Observation date<input name="date" type="date" className="bloom-input w-full" required min={payload.design.baselineStartsOn} max={payload.endsOn}/></label>
          <label>Value ({payload.design.metricUnit})<input name="value" type="number" step="any" className="bloom-input w-full" required/></label>
          <label>Followed the action (%) — optional<input name="adherence" type="number" min="0" max="100" className="bloom-input w-full"/></label>
        </div>
        <label className="block">Sleep, illness, training, medicines or other changes<textarea name="confounders" maxLength={1000} className="bloom-input w-full"/></label>
        <p className="panel-note">Saving the same date replaces its observation. Missing adherence remains unknown.</p>
        <Button disabled={save.isPending}>Save observation</Button>
        {(error||save.error)&&<p role="alert">{error||save.error?.message}</p>}{save.isSuccess&&<p role="status">Observation saved.</p>}
      </form>
      <ul>{payload.observations.map(o=><li key={o.date}>{o.date}: {o.value} {payload.design!.metricUnit} · Adherence: {o.adherence===null?"not recorded":`${o.adherence}%`} · {o.confounders||"Other changes not recorded"}</li>)}</ul>
    </>}
  </details>;
}
