import {markerDefinitions} from "@shared/precision-nutrition";
import {FileText, ChevronRight} from 'lucide-react';
import {groupLabHistory,reportedLabSections,labDateText,type AnyLabHistoryRow} from '@shared/lab-history';

/** Navigation over saved source rows; source headings never become clinical categories. */
export default function BloodworkSourceOverview({labs,onOpen}:{labs:AnyLabHistoryRow[];onOpen:(rowId:string,target?:"row")=>void}){
 if(!labs.length)return null;
 const grouped=groupLabHistory(labs),reports=[...grouped.imports.map(group=>({key:group.key,title:group.source.reportIdentifier?.trim()?group.source.reportIdentifier:'Imported results',rows:group.rows,specimen:group.source.specimenIdentifier})),...(grouped.unlinked.length?[{key:'unlinked',title:'Results without import identity',rows:grouped.unlinked,specimen:undefined}]:[])];
 return <section id="bloodwork-source-overview" className="bloodwork-source-overview space-y-4" aria-labelledby="bloodwork-source-title">
  <div><p className="eyebrow">YOUR ORIGINAL REPORTS</p><h2 id="bloodwork-source-title" tabIndex={-1}>Browse your bloodwork</h2><p className="panel-note">Choose a result name to open its dated details, or browse an original reported section. These are saved source headings, not a health score or a Bloom clinical classification.</p></div>
  <div className="bloodwork-report-grid">{reports.map(report=>{
   const dates=Array.from(new Set(report.rows.map(row=>labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)))).sort().reverse();
   return <article className="bloodwork-report-card" key={report.key}><div className="bloodwork-report-heading"><FileText size={22} aria-hidden="true"/><div><h3>{report.title}</h3><p>{report.rows.length} recorded result(s)</p></div></div><p className="panel-note">Source/stored dates: {dates.slice(0,2).join(' · ')}{dates.length>2?` · ${dates.length-2} more`:''}{report.specimen?` · specimen ${report.specimen}`:''}</p>
    <div className="bloodwork-section-links">{reportedLabSections(report.rows).map(section=><div key={section.firstId}><button type="button" onClick={()=>onOpen(section.firstId)}><span><strong>{section.reportedSection===undefined?'Reported section not recorded':section.reportedSection}</strong><small>{section.rows.length} result(s) · view original values</small></span><ChevronRight size={18} aria-hidden="true"/></button>
     <ul className="bv-marker-list">{section.rows.map(row=>{const raw='sourceOnly' in row,pending=!raw&&row.unitReview?.status==='pending';const name=raw?row.reportedAnalyte:markerDefinitions.find(m=>m.id===row.marker)?.name||row.marker;const value=raw?row.reportedValue:pending?row.unitReview!.originalValue:row.value;const unit=raw?row.reportedUnit:pending?row.unitReview!.originalUnit:row.unit;return <li key={row.id}><button type="button" className="bv-marker-trigger" onClick={()=>onOpen(row.id,'row')} aria-controls="lab-marker-details"><span><strong>{name}</strong><small>{value} {unit||'(unit not supplied)'} · {labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)}{pending?' · Unit provisional':raw?' · Source record only':''}</small></span><span className="bv-marker-affordance">View details <ChevronRight size={16} aria-hidden="true"/></span></button></li>;})}</ul>
    </div>)}</div>
   </article>;
  })}</div>
  <p className="panel-note">Dates do not establish a shared report or specimen. Results without import identity remain separate from identified reports.</p>
 </section>;
}
