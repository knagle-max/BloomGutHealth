import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExperienceMutation } from "@/lib/experience";
import type { ExperienceRecord } from "@shared/experience";
import { reviewExperiment } from "@shared/experiment-review";
export default function ExperimentObservations({record,sourceCurrent}:{record:Extract<ExperienceRecord,{kind:"experiment"}>;sourceCurrent:boolean}) {
  const save=useExperienceMutation(),[error,setError]=useState("");
  const payload=record.payload,review=reviewExperiment(payload);
  const baselineCount=payload.design?payload.observations.filter(o=>o.date>=payload.design!.baselineStartsOn&&o.date<=payload.design!.baselineEndsOn).length:0;
  const followupCount=payload.observations.filter(o=>o.date>=payload.startsOn&&o.date<=payload.endsOn).length;
  return <details className="space-y-3"><summary>Measurements & comparison</summary>
    {!sourceCurrent&&<p role="status">Current focus measurements could not be checked. Saved comparisons are unavailable; your observation draft is retained.</p>}
    {sourceCurrent&&<><p><strong>{review.status==="insufficient-data"?"Insufficient data":`Observed median change: ${Number(review.change!.toFixed(3))} ${review.unit}`}</strong></p>
    <p className="panel-note">{review.note} {review.caveat}</p>
    </>}
    {payload.design&&<>
      {sourceCurrent&&<><dl className="experiment-periods">
        <div><dt>Baseline</dt><dd>{payload.design.baselineStartsOn}–{payload.design.baselineEndsOn}</dd><dd>{baselineCount} recorded days</dd><dd>Median: {review.baseline===null?"Not enough observations":`${review.baseline} ${payload.design.metricUnit}`}</dd></div>
        <div><dt>Follow-up</dt><dd>{payload.startsOn}–{payload.endsOn}</dd><dd>{followupCount} recorded days</dd><dd>Median: {review.followup===null?"Not enough observations":`${review.followup} ${payload.design.metricUnit}`}</dd></div>
      </dl>
      <p>Outcome: {payload.outcome}. Method: {payload.design.measurementMethod}. Unit: {payload.design.metricUnit}.</p>
      <p>Other changes to track: {payload.design.confoundersToTrack}</p></>}
      <details className="workspace-disclosure"><summary>Add or correct an observation</summary><form className="space-y-3 pt-3" onSubmit={e=>{e.preventDefault();if(!sourceCurrent||save.isPending)return;setError("");const d=new FormData(e.currentTarget),date=String(d.get("date")),value=Number(d.get("value"));
        if(!String(d.get("value")||"").trim()||!Number.isFinite(value)){setError("Enter a numeric measurement.");return;}
        const observation={date,value,adherence:d.get("adherence")===""?null:Number(d.get("adherence")),confounders:String(d.get("confounders")||"")};
        save.mutate({id:record.id,entry:{kind:"experiment",payload:{...payload,observations:[...payload.observations.filter(o=>o.date!==date),observation]}}});
      }}>
        <fieldset disabled={save.isPending||!sourceCurrent} className="space-y-3"><legend className="sr-only">Observation details</legend><div className="precision-grid">
          <label>Observation date<input name="date" type="date" className="bloom-input w-full" required min={payload.design.baselineStartsOn} max={payload.endsOn}/></label>
          <label>Value ({payload.design.metricUnit})<input name="value" type="number" step="any" className="bloom-input w-full" required/></label>
          <label>Followed the action (%) — optional<input name="adherence" type="number" min="0" max="100" className="bloom-input w-full"/></label>
        </div>
        <label className="block">Sleep, illness, training, medicines or other changes<textarea name="confounders" maxLength={1000} className="bloom-input w-full"/></label>
        <p className="panel-note">Saving the same date replaces its observation. Missing adherence remains unknown.</p>
        <Button disabled={save.isPending||!sourceCurrent}>Save observation</Button></fieldset>
        {(error||save.error)&&<p role="alert">{error||save.error?.message}</p>}{save.isSuccess&&<p role="status">Observation saved.</p>}
      </form></details>
      {sourceCurrent&&<><h4>Recorded observations</h4>{!payload.observations.length&&<p>No observations recorded. Missing values are not zero.</p>}<ul>{payload.observations.map(o=><li key={o.date}>{o.date}: {o.value} {payload.design!.metricUnit} · Adherence: {o.adherence===null?"not recorded":`${o.adherence}%`} · {o.confounders||"Other changes not recorded"}</li>)}</ul></>}
    </>}
  </details>;
}
