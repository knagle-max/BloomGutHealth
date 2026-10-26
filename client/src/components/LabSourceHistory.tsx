import {useState} from 'react';
import {groupLabHistory,labDateText,type AnyLabHistoryRow} from '@shared/lab-history';
import {markerDefinitions} from '@shared/precision-nutrition';
import {Button} from './ui/button';
import LabSourceContext from './LabSourceContext';
export default function LabSourceHistory({labs,onDelete}:{labs:AnyLabHistoryRow[];onDelete:(row:AnyLabHistoryRow)=>void}){
 const [open,setOpen]=useState(false),groups=groupLabHistory(labs);
 const rows=(items:AnyLabHistoryRow[])=>items.map((row,index)=>{
  const raw='sourceOnly' in row;
  const name=raw?row.reportedAnalyte:markerDefinitions.find(marker=>marker.id===row.marker)?.name||row.marker;
  const pending=!raw&&row.unitReview?.status==='pending';
  const value=raw?row.reportedValue:row.unitReview?.status==='pending'?row.unitReview.originalValue:row.value;
  const unit=raw?row.reportedUnit??'(unit not supplied)':row.unitReview?.status==='pending'?row.unitReview.originalUnit||'(unit not supplied)':row.unit;
  const section=row.sourceInput?.reportedSection;
  return <div key={row.id}>
   {(index===0||section!==items[index-1].sourceInput?.reportedSection)&&<p className="panel-note whitespace-pre-wrap break-words">{section===undefined?'Reported section not recorded':`Reported section: ${section}`}</p>}
   <article className="precision-observation"><div><h4>{name}</h4><p>{value} {unit} · <time dateTime={row.sourceReport?.enteredDate?`${row.sourceReport.enteredDate}${row.sourceReport.enteredTime?`T${row.sourceReport.enteredTime}`:""}`:row.measuredAt}>{row.sourceReport?.enteredDate?`${labDateText(row.measuredAt,row.sourceReport)}${row.sourceReport.enteredTime?` ${row.sourceReport.enteredTime}`:" · collection time not supplied"}`:row.measuredAt}</time></p>
    {raw&&<p className="evidence-state">Source record only — no interpretation</p>}
    {raw&&row.reportedReferenceInterval!==undefined&&<p className="panel-note whitespace-pre-wrap">Reported reference text: {row.reportedReferenceInterval}</p>}
    {pending&&<p className="evidence-state">Unit provisional — confirm against the report before interpretation.</p>}
    <details><summary>Source details for {name}</summary><LabSourceContext source={row.sourceInput} report={row.sourceReport}/><p>Stored timestamp: {row.measuredAt}</p><p>{row.laboratory} · {row.method} · fasting {row.fasting}</p></details>
   </div><Button variant="outline" onClick={()=>onDelete(row)}>Delete historical result</Button></article>
  </div>;
 });
 return <details id="lab-source-history" className="mt-4" onToggle={event=>{if(event.target===event.currentTarget)setOpen(event.currentTarget.open);}}>
  <summary>Reports & source history ({labs.length} results)</summary>
  {open&&<div className="space-y-4 mt-3">
   <p className="panel-note">{groups.imports.length} recorded source group(s). Import references and user-entered identifiers organize these results; they do not verify laboratory panels or detect reimports. Older unlinked rows remain separate below.</p>
   {groups.imports.map(group=><details key={group.key} className="border rounded-xl p-3 break-words">
    <summary>{group.source.reportIdentifier?.trim()?group.source.reportIdentifier:'Imported results'} · {group.rows.length} result(s){group.source.specimenIdentifier?.trim()?` · specimen ${group.source.specimenIdentifier}`:''}</summary>
    <p className="panel-note">Source dates: {Array.from(new Set(group.rows.map(row=>`${row.sourceReport?.enteredDate?'Entered':'Recorded'} ${labDateText(row.measuredAt,row.sourceReport)}`))).join(' · ')}</p>
    {rows(group.rows)}
   </details>)}
   {!!groups.unlinked.length&&<details className="border rounded-xl p-3"><summary>Results without import identity ({groups.unlinked.length})</summary><p className="panel-note">No report or specimen association is inferred from a matching date.</p>{rows(groups.unlinked)}</details>}
   {!labs.length&&<p>No laboratory source records yet.</p>}
  </div>}
 </details>;
}
