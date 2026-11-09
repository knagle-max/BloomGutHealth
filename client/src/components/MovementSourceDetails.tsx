import {Link} from "wouter";
import type {WellnessActionView} from "@shared/wellness-actions";

/** Keep the native disclosure mounted while invalidated source facts withdraw. */
export default function MovementSourceDetails({sources,date,loading}:{sources:WellnessActionView["movementSources"];date:string;loading:boolean}){
 return <details className="mt-3">
  <summary className="min-h-11 cursor-pointer">Movement source details</summary>
  <div className="space-y-2 py-2">
   <p className="panel-note">Sources for {date}. These are your entries, not a readiness assessment. Session durations remain scheduled amounts, even when marked completed.</p>
   {!sources?<p className="panel-note" role="status">{loading?"Checking current movement sources…":"Movement source details are unavailable. You can still record or review your activity."}</p>:sources.status==="unavailable"?<p className="panel-note">Activity sources are unavailable. You can still record or review your activity.</p>:sources.observations.length===0?<p className="panel-note">No activity or session entries for this day. Unrecorded movement stays unknown.</p>:<ul className="space-y-3">{sources.observations.map(row=><li key={`${row.sourceId}:${row.componentId??"parent"}`} className="break-words">
    <strong>{row.valueKind==="self-reported-activity"?"Activity entry":row.valueKind==="planned-session"?"Planned session":row.valueKind==="marked-completed-session"?"Session marked completed":"Cancelled session"}</strong>
    <p className="panel-note">{row.reportedMinutes!==null?`${row.reportedMinutes} reported min`:row.scheduledMinutes!==null?`${row.scheduledMinutes} scheduled min`:"Duration unknown"}{row.temporalStatus==="future-entry"?" · future-dated entry":""}</p>
    {row.sets&&<p className="panel-note">{row.sets.confirmedCompleted} of {row.sets.recorded} sets confirmed completed · {row.sets.notConfirmed} not confirmed · {row.sets.explicitlyCancelled} explicitly cancelled</p>}
    <p className="panel-note break-all">Entered start: <time dateTime={row.startsAt}>{row.startsAt}</time>. Source updated: <time dateTime={row.updatedAt}>{row.updatedAt}</time>.</p>
   </li>)}</ul>}
   <Link className="text-link" href="/activity">Review activity records</Link>
   <Link className="text-link ml-4" href={"/athlete?date="+date}>Review sessions</Link>
  </div>
 </details>;
}
