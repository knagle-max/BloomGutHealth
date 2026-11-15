import {Link} from 'wouter';
import {ChevronRight} from 'lucide-react';
import type {PrecisionReport} from '@shared/precision-nutrition';
import {labCategories,labExplorerEntries,type LabCategoryId} from '@shared/lab-explorer';
import EditorialMedia from './EditorialMedia';
import type {EditorialMediaSlot} from '@/content/editorial-media';
import LabCategoryIcon from './LabCategoryIcon';

const systemArt:Partial<Record<LabCategoryId,EditorialMediaSlot>>={heart:'bloodwork-heart',sugar:'bloodwork-sugar',liver:'bloodwork-liver',nutrients:'bloodwork-iron','blood-count':'bloodwork-iron',bone:'bloodwork-bone'};

/** Navigation lens over the existing canonical explorer; no result, category,
 * interpretation, trend or source ledger is copied or written here. */
export default function BloodworkAtlas({report}:{report?:PrecisionReport}){
 const entries=report?labExplorerEntries(report):[];
 const records=report?new Set([...report.labHistory,...report.pendingLabs,...report.sourceOnlyLabs].map(row=>row.id)).size:null;
 return <section className="bloodwork-atlas" aria-labelledby="bloodwork-atlas-title">
  <header className="bloodwork-atlas-hero">
   <EditorialMedia slot="bloodwork-hero" sizes="(max-width:767px) 100vw, 1000px" showCaption={false}/>
   <div className="bloodwork-atlas-intro"><p className="eyebrow">YOUR BIOLOGY, WITH CONTEXT</p><h1 id="bloodwork-atlas-title" tabIndex={-1}>Bloodwork</h1><p>Explore your results, with dates, units and source details.</p>
    {records!==null&&<p className="bloodwork-atlas-count">{records} recorded {records===1?'result':'results'}</p>}
    <div className="bloodwork-atlas-actions">{report&&<a className="hero-button" href="#add-labs-title" onClick={()=>requestAnimationFrame(()=>{const target=document.getElementById('add-labs-title');target?.setAttribute('tabindex','-1');target?.focus();})}>Add lab results</a>}<Link className="text-link" href="/biology/reports">Manage reports</Link></div>
   </div>
  </header>
  {report&&entries.length>0&&<nav className="bloodwork-system-list" aria-label="Bloodwork systems">{labCategories.map(category=>{
   const items=entries.filter(entry=>entry.categories.includes(category.id));if(!items.length)return null;
   const count=items.reduce((sum,entry)=>sum+entry.recordCount,0),slot=systemArt[category.id];
   return <Link className="bloodwork-system-link" key={category.id} href={`/progress?view=biology&group=${encodeURIComponent(category.id)}`}>
    {slot?<EditorialMedia slot={slot} sizes="72px" showCaption={false}/>:<LabCategoryIcon categoryId={category.id}/>}
    <span><strong>{category.name}</strong><small>{items.length} {category.id==='other'?'source labels':'markers'} · {count} source {count===1?'record':'records'}</small></span><ChevronRight size={20} aria-hidden="true"/>
   </Link>;
  })}</nav>}
  {report&&!entries.length&&<p className="panel-note">Add laboratory results to browse your recorded markers. Missing measurements are not treated as zero.</p>}
  {report&&entries.length>0&&<p className="panel-note">Systems help you browse; they are not diagnoses. Some markers appear in more than one system. Original reports and every recorded result remain below.</p>}
  <Link className="text-link" href="/meal-planner">Food preferences & meal planner</Link>
 </section>;
}
