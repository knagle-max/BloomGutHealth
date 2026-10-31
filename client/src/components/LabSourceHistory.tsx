import {useEffect,useRef,useState} from 'react';
import {groupLabHistory,labDateText,labHistoryDates,labHistoryOnDate,reportedLabSections,type AnyLabHistoryRow} from '@shared/lab-history';
import {markerDefinitions,labEnteredContext} from '@shared/precision-nutrition';
import {Button} from './ui/button';
import LabSourceContext from './LabSourceContext';
import LabTrend from './LabTrend';
import type {PrecisionReport} from '@shared/precision-nutrition';
function MarkerHistory({name,trend}:{name:string;trend:PrecisionReport['trends'][number]}){
 const [open,setOpen]=useState(false);
 return <details className="mt-3 min-w-0" onToggle={event=>{if(event.target===event.currentTarget)setOpen(event.currentTarget.open);}}><summary>Recorded history for {name}</summary>{open&&<><p className="panel-note">This chart includes all available dated measurements for this marker, beyond any selected report date. Each point retains its own source; comparison limits appear below.</p><LabTrend trend={trend}/></>}</details>;
}
export default function LabSourceHistory({labs,onDelete,onCorrect,trends=[],focusRequest}:{labs:AnyLabHistoryRow[];onDelete:(row:AnyLabHistoryRow)=>void;onCorrect?:(row:AnyLabHistoryRow)=>void;trends?:PrecisionReport['trends'];focusRequest?:{rowId:string;target?:'row'}|null}){
 const [open,setOpen]=useState(false),[date,setDate]=useState('');
 const root=useRef<HTMLDetailsElement>(null),handled=useRef<typeof focusRequest>(undefined);
 useEffect(()=>{if(focusRequest){setDate('');setOpen(true);if(root.current)root.current.open=true;}},[focusRequest]);
 useEffect(()=>{if(!open||date||!focusRequest||handled.current===focusRequest)return;const heading=focusRequest.target==='row'?document.getElementById(`lab-source-row-${focusRequest.rowId}`):document.getElementById(`lab-source-section-${focusRequest.rowId}`)||document.getElementById(`lab-source-row-${focusRequest.rowId}`);if(!heading||!root.current?.contains(heading))return;let parent=heading.parentElement;while(parent&&parent!==root.current){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}handled.current=focusRequest;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});},[focusRequest,open,date]);
 const dates=labHistoryDates(labs),visible=labHistoryOnDate(labs,date),groups=groupLabHistory(visible);
 const sectionLinks=(items:AnyLabHistoryRow[])=>{const sections=reportedLabSections(items);return sections.length>1?<nav aria-label="Reported sections" className="space-y-2"><p className="panel-note">Go to a reported section. These are source headings, not Bloom clinical categories.</p><div className="flex flex-wrap gap-2">{sections.map(section=><Button key={section.firstId} type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-pre-wrap break-words text-left" onClick={()=>{const heading=document.getElementById(`lab-source-section-${section.firstId}`);heading?.focus();heading?.scrollIntoView({block:'start'});}}>{section.reportedSection===undefined?'Reported section not recorded':section.reportedSection} · {section.rows.length} result(s)</Button>)}</div></nav>:null;};
 const rows=(items:AnyLabHistoryRow[])=>items.map((row,index)=>{
  const raw='sourceOnly' in row,entered=labEnteredContext(row);
  const name=raw?row.reportedAnalyte:markerDefinitions.find(marker=>marker.id===row.marker)?.name||row.marker;
  const pending=!raw&&row.unitReview?.status==='pending';
  const trend=!raw&&!pending?trends.find(trend=>trend.marker===row.marker&&trend.points.some(point=>point.id===row.id)):undefined;
  const value=raw?row.reportedValue:row.unitReview?.status==='pending'?row.unitReview.originalValue:row.value;
  const unit=raw?row.reportedUnit??'(unit not supplied)':row.unitReview?.status==='pending'?row.unitReview.originalUnit||'(unit not supplied)':row.unit;
  const section=row.sourceInput?.reportedSection;
  return <div key={row.id}>
   {(index===0||section!==items[index-1].sourceInput?.reportedSection)&&<h4 id={`lab-source-section-${row.id}`} tabIndex={-1} style={{scrollMarginTop:"6rem"}} className="lab-source-section whitespace-pre-wrap break-words">{section===undefined?'Reported section not recorded':`Reported section: ${section}`}</h4>}
   <article className="precision-observation" id={`lab-source-row-${row.id}`} tabIndex={-1}><div><h4>{name}</h4><p>{value} {unit} · <time dateTime={entered?.enteredDate?`${entered.enteredDate}${entered.enteredTime?`T${entered.enteredTime}`:""}`:row.measuredAt}>{entered?.enteredDate?`${labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)}${entered.enteredTime?` ${entered.enteredTime}`:" · collection time not supplied"}`:row.measuredAt}</time></p>
    {raw&&<p className="evidence-state">Source record only — no interpretation</p>}
    {raw&&row.reportedReferenceInterval!==undefined&&<p className="panel-note whitespace-pre-wrap">Reported reference text: {row.reportedReferenceInterval}</p>}
    {pending&&<p className="evidence-state">Unit provisional — confirm against the report before interpretation.</p>}
    {trend&&<MarkerHistory name={name} trend={trend}/>}
    <details><summary>Source details for {name}</summary><LabSourceContext source={row.sourceInput} report={row.sourceReport} correction={row.dateCorrection}/><p>Stored timestamp: {row.measuredAt}</p><p>{row.laboratory} · {row.method} · fasting {row.fasting}</p></details>
   </div>{onCorrect&&<Button variant="outline" onClick={()=>onCorrect(row)}>Correct result date</Button>}<Button variant="outline" onClick={()=>onDelete(row)}>Delete historical result</Button></article>
  </div>;
 });
 return <details ref={root} id="lab-source-history" className="mt-4" onToggle={event=>{if(event.target===event.currentTarget)setOpen(event.currentTarget.open);}}>
  <summary>Reports & source history ({labs.length} results)</summary>
  {open&&<div className="space-y-4 mt-3">
   <label className="block space-y-2">Report date
    <select aria-label="Report date" className="bloom-input w-full" value={date} onChange={event=>setDate(event.target.value)}>
     <option value="">All recorded dates</option>
     {date&&!dates.includes(date)&&<option value={date}>{date} — no current results</option>}
     {dates.map(value=><option key={value} value={value}>{value}</option>)}
    </select>
   </label>
   <p className="panel-note">Dates reflect entered source calendars or stored timestamps. Source details retain original collection precision.</p>
   {date&&<p role="status">Showing {visible.length} of {labs.length} results for {date}. <button type="button" className="text-link" onClick={()=>setDate('')}>Show all recorded dates</button></p>}
   <p className="panel-note">{groups.imports.length} recorded source group(s), not verified lab panels. Matching dates do not link reports or specimens. Unlinked results stay separate.</p>
   {groups.imports.map(group=><details key={group.key} className="border rounded-xl p-3 break-words">
    <summary>{group.source.reportIdentifier?.trim()?group.source.reportIdentifier:'Imported results'} · {group.rows.length} result(s){group.source.specimenIdentifier?.trim()?` · specimen ${group.source.specimenIdentifier}`:''}</summary>
    <p className="panel-note">Source dates: {Array.from(new Set(group.rows.map(row=>`${labEnteredContext(row)?.enteredDate?'Entered':'Recorded'} ${labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)}`))).join(' · ')}</p>
    {sectionLinks(group.rows)}
    {rows(group.rows)}
   </details>)}
   {!!groups.unlinked.length&&<details className="border rounded-xl p-3"><summary>Results without import identity ({groups.unlinked.length})</summary><p className="panel-note">No report or specimen association is inferred from a matching date.</p>{sectionLinks(groups.unlinked)}{rows(groups.unlinked)}</details>}
   {!visible.length&&<p>{labs.length?'No current source results for this date.':'No laboratory source records yet.'}</p>}
  </div>}
 </details>;
}
