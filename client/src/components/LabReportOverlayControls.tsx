import {Link} from 'wouter';
import {sourceOverlayKey,reportIdentityBasis} from '@shared/lab-report-metadata';
import {useLabSources} from '@/lib/lab-sources';
import {useEffect,useId,useMemo} from 'react';
import {groupLabHistory,labDateText,type AnyLabHistoryRow} from '@shared/lab-history';
import {emptyLabOverlayChoice,labOverlaySourceVersion,labSourceDisplayContext} from '@shared/lab-overlay-preference';
import {sourceReferenceIntervalForPlot} from '@shared/lab-reference-interval';
import {displayProviderRanges,publishedLabRanges,providerContextMatchesSource} from '@shared/lab-provider-ranges';
import type {PrecisionReport} from '@shared/precision-nutrition';
import {useLabReportOverlays} from '@/lib/lab-report-overlays';
import LabRangeSelector from './LabRangeSelector';
import {Button} from './ui/button';
type Group=ReturnType<typeof groupLabHistory>['imports'][number];
export function useLabOverlaySources(labs:AnyLabHistoryRow[]){
 const overlays=useLabReportOverlays(),sources=useLabSources(),groups=useMemo(()=>groupLabHistory(labs).imports,[labs]);
 useEffect(()=>{if(sources.data&&!sources.isError)overlays.hydrate(sources.data);},[sources.data,sources.isError,overlays.hydrate]);
 const identity=JSON.stringify([Array.from(new Set([...groups.map(group=>group.key),...(sources.data||[]).filter(source=>source.groupKey||source.scope==='result').map(sourceOverlayKey)])).sort(),labs.map(row=>row.id).sort()]);
 useEffect(()=>{const[keys,ids]=JSON.parse(identity)as[string[],string[]];overlays.reconcile(keys,ids);},[identity,overlays.reconcile]);
 return groups;
}
export function LabReportOverlayControls({group,trends=[]}:{group:Group;trends?:PrecisionReport['trends']}){
 const overlays=useLabReportOverlays(),sources=useLabSources(),managed=sources.data?.find(source=>source.groupKey===group.key),metadataBasis=managed?.metadata?.available?(sources.fetchStatus==='idle'&&!sources.isError?reportIdentityBasis(managed.revision,managed.metadata.current):'source-metadata-unavailable'):undefined,id=useId(),preference=overlays.state.preferences[group.key]??emptyLabOverlayChoice(),value={...emptyLabOverlayChoice(),...preference};
 const ids=new Set(group.rows.map(row=>row.id)),points=trends.flatMap(trend=>trend.points.filter(point=>ids.has(point.id)).map(point=>({marker:trend.marker,point}))),original=points.filter(({marker,point})=>sourceReferenceIntervalForPlot(marker,point)).length;
 const published=preference.provider==='LifeLabs'||preference.provider==='other';
 const matched=published?points.filter(({marker,point})=>{const saved=overlays.state.contexts[point.id],context={...emptyLabOverlayChoice().context,...(saved?.version===labOverlaySourceVersion(point,metadataBasis)?saved.context:{}),...labSourceDisplayContext(point)};return displayProviderRanges({provider:preference.provider==='other'?preference.otherProvider:'LifeLabs',province:preference.province,markerId:marker,...context,sourceUnit:point.sourceUnit,plotUnit:point.unit,sourceInput:point.sourceInput},publishedLabRanges,!!saved?.confirmed&&saved.version===labOverlaySourceVersion(point,metadataBasis),providerContextMatchesSource(point,context)).length>0;}).length:0;
 return <section className="space-y-3 min-w-0 [overflow-wrap:anywhere]" aria-label="Reference overlay for this source report">
  <h4>Reference overlay for this report</h4><p className="panel-note">One display choice for this import and its original report/specimen identity. Other reports, including separate imports on the same date, keep their own choices. Collection context stays specific to each result.</p>
  <Button type="button" variant="outline" className="min-h-11 max-w-full whitespace-normal" aria-pressed={overlays.state.active===group.key} onClick={()=>overlays.activate(group.key)}>Use this report for chart references</Button>
  {managed&&<Link className="text-link inline-flex min-h-11 items-center" href={`/precision?tab=labs&manageLabSource=${managed.id}`}>Manage laboratory & reference ranges</Link>}
  <LabRangeSelector id={id} value={value} selected={true} preferenceOnly onChange={next=>overlays.preference(group.key,next)}/>
  <p role="status">{preference.provider==='none'?`Reference overlays hidden for this report; all ${group.rows.length} source results remain visible.`:`${original} of ${group.rows.length} source results supply a usable original interval.`}</p>
  {published&&<p role="status">{matched} of {group.rows.length} source results have an available {preference.provider==='other'?preference.otherProvider||'provider':preference.provider} {preference.province||'(province not selected)'} comparison (provisional values included). {matched===0?'Reference unavailable for unmatched results; no range is invented.':''} Original report intervals retain priority.</p>}
  <p className="panel-note">Comparison controls preview this report only. Save the reference preference in Saved laboratory sources → Manage laboratory & reference ranges to retain it after reload. Collection-specific comparison checks stay in this session and require reconfirmation. Original observations and clinical flags stay unchanged.</p>
 </section>;
}
export default function LabReportOverlayPanel({labs,trends}:{labs:AnyLabHistoryRow[];trends:PrecisionReport['trends']}){
 const groups=useLabOverlaySources(labs),overlays=useLabReportOverlays();if(!groups.length)return <p className="panel-note">Report grouping was not captured for these results. Choose an original recorded result for its own limits; matching dates do not establish one report.</p>;
 const selected=groups.find(group=>group.key===overlays.state.active)||(groups.length===1?groups[0]:undefined);
 return <details className="bloom-panel space-y-3 min-w-0 [overflow-wrap:anywhere]" aria-label="Report reference overlay preferences"><summary className="min-h-11 cursor-pointer">Reference overlays by source report</summary><label className="block">Report used for reference overlays<select className="bloom-input w-full min-h-11" value={selected?.key||''} onChange={event=>event.target.value&&overlays.activate(event.target.value)}><option value="">Choose an imported source report</option>{groups.map((group,index)=><option key={group.key} value={group.key}>{index+1} · {group.source.reportIdentifier||'Imported source'} · {Array.from(new Set(group.rows.map(row=>labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)))).join(', ')} · {group.rows.length} results</option>)}</select></label>{selected?<LabReportOverlayControls group={selected} trends={trends}/>:<p className="panel-note">Choose the original source group once. Each eligible marker chart uses its corresponding result from that report.</p>}</details>;
}
