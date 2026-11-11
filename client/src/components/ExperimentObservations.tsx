import {localDate} from "@/lib/experience";
import ExperimentSourceHistory from "./ExperimentSourceHistory";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExperienceMutation,refreshExperience } from "@/lib/experience";
import type { ExperienceRecord } from "@shared/experience";
import { reviewExperiment } from "@shared/experiment-review";
export default function ExperimentObservations({record,sourceCurrent}:{record:Extract<ExperienceRecord,{kind:"experiment"}>;sourceCurrent:boolean}) {
  const save=useExperienceMutation(),remove=useExperienceMutation(),[error,setError]=useState("");
  const payload=record.payload,review=reviewExperiment(payload,localDate());
  const baselineCount=payload.design?review.coverage?.baseline.recordedDays??0:0;
  const followupCount=review.coverage?.followup.recordedDays??0;
  return <details className="space-y-3"><summary>Measurements & comparison</summary>
    {!sourceCurrent&&<p role="status">Current focus measurements could not be checked. Saved comparisons are unavailable; your observation draft is retained.</p>}
    {sourceCurrent&&<><p><strong>{review.status==="insufficient-data"?"Insufficient data":`Observed median change: ${new Intl.NumberFormat(undefined,{maximumSignificantDigits:6}).format(review.change!)} ${review.unit}`}</strong></p>
    <p className="panel-note">{review.note} {review.caveat}</p>
    </>}
    {payload.design&&<>
      {sourceCurrent&&<><dl className="experiment-periods">
        <div><dt>Baseline</dt><dd>{payload.design.baselineStartsOn}–{payload.design.baselineEndsOn}</dd><dd>{baselineCount} recorded days</dd><dd>Median: {review.baseline===null?"Not enough observations":`${review.baseline} ${payload.design.metricUnit}`}</dd></div>
        <div><dt>Follow-up</dt><dd>{payload.startsOn}–{payload.endsOn}</dd><dd>{followupCount} recorded days</dd><dd>Median: {review.followup===null?"Not enough observations":`${review.followup} ${payload.design.metricUnit}`}</dd></div>
      </dl>
      {review.coverage&&<details className="workspace-disclosure"><summary className="min-h-11 cursor-pointer">Observation coverage & limits</summary><div className="space-y-2 py-2 [overflow-wrap:anywhere]">
        <p>Reviewed through {review.coverage.asOf}. {review.coverage.futureEntries} future-dated entries excluded. Saved source values are unchanged.</p>
        {(['baseline','followup'] as const).map(period=>{const value=review.coverage![period];return <p key={period}>{period==='baseline'?'Baseline':'Follow-up'}: {value.recordedDays} recorded of {value.elapsedDays} elapsed days; {value.missingDays} days without an entry. Recorded values: {value.low===null?'not available':`${value.low}–${value.high} ${payload.design!.metricUnit}`}.</p>;})}
        <p>Follow-up adherence: {review.coverage.adherence.reportedDays} days reported, {review.coverage.adherence.missingDays} recorded days unknown, {review.coverage.adherence.zeroDays} explicitly zero. An intention or missing entry is not completed behavior.</p>
        <p>Other-change notes on {review.coverage.contextNotesDays} recorded days. Notes do not establish absence of confounding. Recorded minimum–maximum is descriptive spread, not measurement error or a confidence interval.</p>
        <p>No automatic plan change is supported by this comparison. Review the original observations and measurement method.</p>
      </div></details>}
      <p>Outcome: {payload.outcome}. Method: {payload.design.measurementMethod}. Unit: {payload.design.metricUnit}.</p>
      <p>Other changes to track: {payload.design.confoundersToTrack}</p></>}
      <details className="workspace-disclosure"><summary>Add or correct an observation</summary><form className="space-y-3 pt-3" onSubmit={e=>{e.preventDefault();if(!sourceCurrent||save.isPending||remove.isPending)return;setError("");const d=new FormData(e.currentTarget),date=String(d.get("date")),value=Number(d.get("value"));
        if(!String(d.get("value")||"").trim()||!Number.isFinite(value)){setError("Enter a numeric measurement.");return;}
        const observation={date,value,adherence:d.get("adherence")===""?null:Number(d.get("adherence")),confounders:String(d.get("confounders")||"")};
        save.mutate({id:record.id,entry:{kind:"experiment",payload:{...payload,observations:payload.observations.some(o=>o.date===date)?payload.observations.map(o=>o.date===date?observation:o):[...payload.observations,observation]}}});
      }}>
        <fieldset disabled={save.isPending||remove.isPending||!sourceCurrent} className="space-y-3"><legend className="sr-only">Observation details</legend><div className="precision-grid">
          <label>Observation date<input name="date" type="date" className="bloom-input w-full" required min={payload.design.baselineStartsOn} max={payload.endsOn}/></label>
          <label>Value ({payload.design.metricUnit})<input name="value" type="number" step="any" className="bloom-input w-full" required/></label>
          <label>Followed the action (%) — optional<input name="adherence" type="number" min="0" max="100" className="bloom-input w-full"/></label>
        </div>
        <label className="block">Sleep, illness, training, medicines or other changes<textarea name="confounders" maxLength={1000} className="bloom-input w-full"/></label>
        <p className="panel-note">Saving the same date corrects its current observation. Earlier saved values may remain in Previous saved versions; deleting this focus removes its captured history. Missing adherence remains unknown.</p>
        <Button disabled={save.isPending||remove.isPending||!sourceCurrent}>Save observation</Button></fieldset>
        {(error||save.error)&&<p role="alert">{error||save.error?.message}</p>}{save.isSuccess&&<p role="status">Observation saved.</p>}
      </form></details>
      {sourceCurrent&&<><h4>Recorded observations</h4>{!payload.observations.length&&<p>No observations recorded. Missing values are not zero.</p>}<ul>{payload.observations.map(o=><li key={o.date}>{o.date>localDate()?"Future-dated entry — excluded from comparison · ":""}{o.date}: {o.value} {payload.design!.metricUnit} · Adherence: {o.adherence===null?"not recorded":`${o.adherence}%`} · {o.confounders||"Other changes not recorded"}</li>)}</ul></>}
    </>}
    {sourceCurrent&&<ExperimentSourceHistory recordId={record.id}/>}
    {sourceCurrent&&<details className="workspace-disclosure"><summary>Delete this focus</summary><p className="panel-note">Delete “{payload.title}”, its observations and captured previous versions from your account. Download your private review first if you want a copy.</p><Button type="button" variant="destructive" disabled={save.isPending||remove.isPending} onClick={()=>remove.mutate({id:record.id,remove:true},{onError:()=>{void refreshExperience();}})}>{remove.isPending?"Deleting…":"Delete focus and history"}</Button>{remove.isError&&<p role="alert">The deletion could not be confirmed. Check your current records before retrying.</p>}</details>}
  </details>;
}
