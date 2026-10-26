import { useId } from "react";
import type { PrecisionReport } from "@shared/precision-nutrition";
import EvidenceInsight from "./EvidenceInsight";
import LabSourceContext from "./LabSourceContext";
export default function LabTrend({trend:t}:{trend:PrecisionReport["trends"][number]}) {
 const id=useId(),points=t.points,unit=points[0].unit;
 const times=points.map(p=>Date.parse(p.date)),values=points.map(p=>p.value),first=Math.min(...times),span=Math.max(...times)-first;
 const lo=Math.min(...values),hi=Math.max(...values),pad=Math.max((hi-lo)*.2,Math.abs(hi)*.05,.01),min=lo-pad,max=hi+pad;
 const plotted=points.map((p,i)=>({x:50+(span?(times[i]-first)/span:0.5)*440,y:135-(p.value-min)/(max-min)*100,p}));
 const change=t.comparable?`Observed change: ${t.change!>0?"+":""}${Number(t.change!.toFixed(3))} ${unit}.`:"Not enough comparable data for a change.";
 return <EvidenceInsight title={t.name} state="reported" meaning={change} limitations={t.note+" A trend does not establish a dietary cause. No clinical urgency or treatment target is inferred."} details={<><p className="panel-note">Original recorded timestamps retain their supplied offsets. Report reference intervals are source context, not personal treatment targets.</p><div className="lab-source-table" role="region" aria-label={`${t.name} recorded source details`} tabIndex={0}><table className="lab-history-table"><caption className="sr-only">{t.name}: user-entered results, source details and original units</caption><thead><tr><th scope="col">Recorded test time</th><th scope="col">Value</th><th scope="col">Report reference interval</th><th scope="col">Source</th><th scope="col">Original report context</th></tr></thead><tbody>{points.map(p=><tr key={p.id}><td><time dateTime={p.date}>{p.date}</time></td><td>{p.sourceValue} {p.sourceUnit}<br/>{p.unit!==p.sourceUnit&&<small>Converted: {Number(p.value.toFixed(3))} {p.unit}</small>}</td><td>{p.referenceLow!=null&&p.referenceHigh!=null?`${p.referenceLow}–${p.referenceHigh} ${p.sourceUnit}`:p.referenceLow!=null?`Lower bound: ${p.referenceLow} ${p.sourceUnit}; upper not supplied`:p.referenceHigh!=null?`Upper bound: ${p.referenceHigh} ${p.sourceUnit}; lower not supplied`:"Not supplied"}</td><td>{p.laboratory}<br/>{p.method}<br/>Fasting: {p.fasting??"unknown"}<br/>{p.provenance}</td><td><LabSourceContext source={p.sourceInput} report={p.sourceReport}/></td></tr>)}</tbody></table></div></>}>
   <p className="insight-value">{points[points.length-1].sourceValue} {points[points.length-1].sourceUnit}</p>
   <p className="panel-note">Latest entry: {points[points.length-1].date.slice(0,10)} · {points[points.length-1].laboratory}</p>
   <p className="panel-note">{points.length} dated result(s) · {unit}. Entered values are not independently verified.</p>
   <svg className="lab-chart" viewBox="0 0 540 180" role="img" aria-labelledby={`${id}-title ${id}-desc`}><title id={`${id}-title`}>{t.name} · {unit}</title><desc id={`${id}-desc`}>{points.map(p=>`${p.date.slice(0,10)}: ${Number(p.value.toFixed(3))} ${p.unit}`).join("; ")}. {t.comparable?"Straight segments join compatible dated observations.":"Points are not connected because comparability is unconfirmed."} The vertical axis is cropped to the labelled range; missing dates are not filled.</desc>
     <line x1="50" y1="35" x2="50" y2="135" stroke="currentColor"/><line x1="50" y1="135" x2="490" y2="135" stroke="currentColor"/>
     <text x="3" y="40">{Number(max.toFixed(2))}</text><text x="3" y="135">{Number(min.toFixed(2))}</text>
     {t.comparable&&<polyline points={plotted.map(p=>`${p.x},${p.y}`).join(" ")} stroke="currentColor" strokeWidth="2" fill="none"/>}
     {plotted.map(({x,y,p})=><circle key={p.id} cx={x} cy={y} r="4" fill="currentColor"/>)}
     <text x="50" y="165">{points[0].date.slice(0,10)}</text>{points.length>1&&<text x="490" y="165" textAnchor="end">{points[points.length-1].date.slice(0,10)}</text>}
   </svg>
 </EvidenceInsight>;
}
