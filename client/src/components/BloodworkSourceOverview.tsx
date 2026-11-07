import {FileText, ChevronRight} from 'lucide-react';
import {groupLabHistory,reportedLabSections,labDateText,type AnyLabHistoryRow} from '@shared/lab-history';

/** Navigation over saved source rows; source headings never become clinical categories. */
export default function BloodworkSourceOverview({labs,onOpen}:{labs:AnyLabHistoryRow[];onOpen:(rowId:string)=>void}){
 if(!labs.length)return null;
 const grouped=groupLabHistory(labs),reports=[...grouped.imports.map(group=>({key:group.key,title:group.source.reportIdentifier?.trim()?group.source.reportIdentifier:'Imported results',rows:group.rows,specimen:group.source.specimenIdentifier})),...(grouped.unlinked.length?[{key:'unlinked',title:'Results without import identity',rows:grouped.unlinked,specimen:undefined}]:[])];
 return <section id="bloodwork-source-overview" className="bloodwork-source-overview space-y-4" aria-labelledby="bloodwork-source-title">
  <div><p className="eyebrow">YOUR ORIGINAL REPORTS</p><h2 id="bloodwork-source-title">Browse your bloodwork</h2><p className="panel-note">Choose a reported section to view its dated results. These are saved source headings, not a health score or a Bloom clinical classification.</p></div>
  <div className="bloodwork-report-grid">{reports.map(report=>{
   const dates=Array.from(new Set(report.rows.map(row=>labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)))).sort().reverse();
   return <article className="bloodwork-report-card" key={report.key}><div className="bloodwork-report-heading"><FileText size={22} aria-hidden="true"/><div><h3>{report.title}</h3><p>{report.rows.length} recorded result(s)</p></div></div><p className="panel-note">Source/stored dates: {dates.slice(0,2).join(' · ')}{dates.length>2?` · ${dates.length-2} more`:''}{report.specimen?` · specimen ${report.specimen}`:''}</p>
    <div className="bloodwork-section-links">{reportedLabSections(report.rows).map(section=><button type="button" key={section.firstId} onClick={()=>onOpen(section.firstId)}><span><strong>{section.reportedSection===undefined?'Reported section not recorded':section.reportedSection}</strong><small>{section.rows.length} result(s) · view original values</small></span><ChevronRight size={18} aria-hidden="true"/></button>)}</div>
   </article>;
  })}</div>
  <p className="panel-note">Dates do not establish a shared report or specimen. Results without import identity remain separate from identified reports.</p>
 </section>;
}
