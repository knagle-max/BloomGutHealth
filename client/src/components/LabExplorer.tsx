import LabCategoryIcon from './LabCategoryIcon';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Link} from 'wouter';
import {type PrecisionReport} from '@shared/precision-nutrition';
import {labCategories,labExplorerEntries,normalizeLabSearch,type LabCategoryId} from '@shared/lab-explorer';
import {labDateText} from '@shared/lab-history';
import LabTrend from './LabTrend';
import LabMarkerEducation from './LabMarkerEducation';
import type {LabPointSelection} from '@shared/lab-history';

export default function LabExplorer({report,owner,marker,group,onSelect,selection,onSelectionChange}:{report?:PrecisionReport;owner:string;marker:string|null;group:string|null;onSelect:(group:LabCategoryId|null,marker:string|null)=>void;selection:LabPointSelection;onSelectionChange:(patch:Partial<LabPointSelection>)=>void}){
 const [search,setSearch]=useState(''),focused=useRef<string|null>(null);
 const entries=useMemo(()=>report?labExplorerEntries(report):[],[report]);
 const selected=entries.find(e=>e.id===marker);
 const activeGroup=selected?(selected.categories.find(c=>c===group)||selected.categories[0]):labCategories.find(c=>c.id===group)?.id;
 const key=normalizeLabSearch(search),matching=entries.filter(e=>!key||e.searchKey.includes(key));
 useEffect(()=>{if(!marker){focused.current=null;return;}if(!report)return;if(!selected){focused.current=null;return;}const request=`${owner}:${activeGroup}:${marker}`;if(focused.current===request)return;const frame=requestAnimationFrame(()=>{const target=document.getElementById(`lab-marker-${encodeURIComponent(marker)}`)?.querySelector<HTMLElement>('button[data-marker-toggle]');if(target&&!document.activeElement?.matches('input,textarea,select')){target.focus({preventScroll:true});target.scrollIntoView({block:'start'});focused.current=request;}});return()=>cancelAnimationFrame(frame);},[owner,marker,activeGroup,selected,report]);
 if(!report)return null;
 return <section className="lab-explorer space-y-4" aria-label="Grouped bloodwork explorer">
  <p className="panel-note">Categories help you browse source records; they are not diagnoses. Unclassified results retain their original labels and units.</p>
  <label className="block">Find a marker or source label<input type="search" className="bloom-input w-full" value={search} onChange={e=>setSearch(e.target.value)} maxLength={200}/></label>
  <p role="status" className="panel-note">{matching.filter(e=>!e.sourceOnly.length).length} recognized markers · {matching.filter(e=>e.sourceOnly.length).length} unclassified source labels</p>
  {marker&&!selected&&<p role="alert">The requested marker is not available in your current laboratory records. <Link className="text-link" href="/precision?tab=labs">Open source review</Link></p>}
  {!matching.length&&entries.length>0&&<p>No matching marker or source label. Clear the search to review all records.</p>}
  {labCategories.map(category=>{const rows=matching.filter(e=>e.categories.includes(category.id));if(!rows.length)return null;return <details key={category.id} className="bloom-panel lab-explorer-category" open={activeGroup===category.id}>
   <summary onClick={e=>{e.preventDefault();onSelect(activeGroup===category.id?null:category.id,null);}}><span className="lab-explorer-category-title"><LabCategoryIcon categoryId={category.id}/><strong>{category.name}</strong></span><span>{rows.length} {category.id==='other'?'source labels':'markers'} · {rows.filter(e=>e.recordCount>1).length} with multiple records</span></summary>
   <div className="lab-explorer-markers">{rows.map(entry=>{const expanded=activeGroup===category.id&&marker===entry.id;const id=expanded?`lab-marker-${encodeURIComponent(entry.id)}`:undefined;return <div key={entry.id} id={id} data-lab-marker={entry.id} className="lab-explorer-marker scroll-mt-24">
    <button type="button" data-marker-toggle="true" className="lab-explorer-marker-toggle" aria-expanded={expanded} onClick={()=>onSelect(category.id,expanded?null:entry.id)}><span><strong>{entry.name}</strong><small>{entry.recordCount} source record(s){entry.pending.length?` · ${entry.pending.length} need unit review`:''}{entry.sourceOnly.length?' · marker not identified':''}</small></span><span aria-hidden="true">{expanded?'−':'+'}</span></button>
    {expanded&&<section className="lab-explorer-detail space-y-4" aria-label={`${entry.name} recorded detail`}>
     <LabMarkerEducation markerId={entry.id} points={entry.trend?.points||[]} selectedPointId={selection.point}/>
     {entry.trend&&<LabTrend key={owner+":"+entry.id} selection={selection} onSelectionChange={onSelectionChange} trend={entry.trend} latestLabel="Your results · latest recorded" directionLabel="Recorded direction" sourceLabel="Evidence & original report"/>}
     {entry.pending.map(row=><article key={row.id} className="space-y-2"><h4>Unit review needed</h4><p>{row.unitReview?.originalText||row.sourceInput?.text||'Original source row not supplied'}</p><p>{labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)} · {row.laboratory}</p><Link className="text-link inline-flex min-h-11 items-center" href={`/precision?tab=labs&labResult=${encodeURIComponent(row.id)}`}>Review original source unit</Link></article>)}
     {entry.sourceOnly.map(row=><article key={row.id} className="space-y-2"><h4>Original source observation</h4><p>{row.reportedValue} {row.reportedUnit||'Unit not reported'} · {labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)}</p><p>{row.laboratory} · {row.method||'Method not reported'}</p>{row.reportedReferenceInterval&&<p>Source reference interval: {row.reportedReferenceInterval}</p>}<p className="panel-note">Marker identity is not confirmed. No numeric trend or interpretation is calculated.</p><Link className="text-link inline-flex min-h-11 items-center" href={`/precision?tab=labs&labResult=${encodeURIComponent(row.id)}`}>Review original source record</Link></article>)}
    </section>}
   </div>;})}</div>
  </details>;})}
 </section>;
}
