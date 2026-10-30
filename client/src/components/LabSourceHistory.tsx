import {useState} from 'react';
import {groupLabHistory,labDateText,labHistoryDates,labHistoryOnDate,type AnyLabHistoryRow} from '@shared/lab-history';
import {markerDefinitions,labEnteredContext} from '@shared/precision-nutrition';
import {Button} from './ui/button';
import LabSourceContext from './LabSourceContext';
export default function LabSourceHistory({labs,onDelete,onCorrect}:{labs:AnyLabHistoryRow[];onDelete:(row:AnyLabHistoryRow)=>void;onCorrect?:(row:AnyLabHistoryRow)=>void}){
 const [open,setOpen]=useState(false),[date,setDate]=useState('');
 const dates=labHistoryDates(labs),visible=labHistoryOnDate(labs,date),groups=groupLabHistory(visible);
 const rows=(items:AnyLabHistoryRow[])=>items.map((row,index)=>{
  const raw='sourceOnly' in row,entered=labEnteredContext(row);
  const name=raw?row.reportedAnalyte:markerDefinitions.find(marker=>marker.id===row.marker)?.name||row.marker;
  const pending=!raw&&row.unitReview?.status==='pending';
  const value=raw?row.reportedValue:row.unitReview?.status==='pending'?row.unitReview.originalValue:row.value;
  const unit=raw?row.reportedUnit??'(unit not supplied)':row.unitReview?.status==='pending'?row.unitReview.originalUnit||'(unit not supplied)':row.unit;
  const section=row.sourceInput?.reportedSection;
  return <div key={row.id}>
   {(index===0||section!==items[index-1].sourceInput?.reportedSection)&&<h4 className="lab-source-section whitespace-pre-wrap break-words">{section===undefined?'Reported section not recorded':`Reported section: ${section}`}</h4>}
   <article className="precision-observation"><div><h4>{name}</h4><p>{value} {unit} · <time dateTime={entered?.enteredDate?`${entered.enteredDate}${entered.enteredTime?`T${entered.enteredTime}`:""}`:row.measuredAt}>{entered?.enteredDate?`${labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)}${entered.enteredTime?` ${entered.enteredTime}`:" · collection time not supplied"}`:row.measuredAt}</time></p>
    {raw&&<p className="evidence-state">Source record only — no interpretation</p>}
    {raw&&row.reportedReferenceInterval!==undefined&&<p className="panel-note whitespace-pre-wrap">Reported reference text: {row.reportedReferenceInterval}</p>}
    {pending&&<p className="evidence-state">Unit provisional — confirm against the report before interpretation.</p>}
    <details><summary>Source details for {name}</summary><LabSourceContext source={row.sourceInput} report={row.sourceReport} correction={row.dateCorrection}/><p>Stored timestamp: {row.measuredAt}</p><p>{row.laboratory} · {row.method} · fasting {row.fasting}</p></details>
   </div>{onCorrect&&<Button variant="outline" onClick={()=>onCorrect(row)}>Correct result date</Button>}<Button variant="outline" onClick={()=>onDelete(row)}>Delete historical result</Button></article>
  </div>;
 });
 return <details id="lab-source-history" className="mt-4" onToggle={event=>{if(event.target===event.currentTarget)setOpen(event.currentTarget.open);}}>
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
    {rows(group.rows)}
   </details>)}
   {!!groups.unlinked.length&&<details className="border rounded-xl p-3"><summary>Results without import identity ({groups.unlinked.length})</summary><p className="panel-note">No report or specimen association is inferred from a matching date.</p>{rows(groups.unlinked)}</details>}
   {!visible.length&&<p>{labs.length?'No current source results for this date.':'No laboratory source records yet.'}</p>}
  </div>}
 </details>;
}
