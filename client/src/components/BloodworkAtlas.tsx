import {Link,useLocation,useSearch} from 'wouter';
import {useAuth} from '@/lib/auth';
import LabExplorer from './LabExplorer';
import type {PrecisionReport} from '@shared/precision-nutrition';
import {labExplorerEntries,type LabCategoryId} from '@shared/lab-explorer';
import EditorialMedia from './EditorialMedia';
import LabPanelReview from './LabPanelReview';
import LabRememberedContextHistory from './LabRememberedContextHistory';

/** Navigation lens over the existing canonical explorer; no result, category,
 * interpretation, trend or source ledger is copied or written here. */
export default function BloodworkAtlas({report}:{report?:PrecisionReport}){
 const entries=report?labExplorerEntries(report):[];
 const {user}=useAuth(),[,navigate]=useLocation(),params=new URLSearchParams(useSearch());
 const marker=params.get('marker'),group=params.get('group');
 const selection={point:params.get('point')||'',first:params.get('firstResult')||'',second:params.get('secondResult')||''};
 const select=(nextGroup:LabCategoryId|null,nextMarker:string|null)=>{
  const next=new URLSearchParams(params);next.set('tab','labs');
  if(nextMarker&&nextMarker!==marker){const ownedIds=report?.trends.find(t=>t.marker===nextMarker)?.points.flatMap(p=>[p.id,...p.supersededIds])||[];const retained=[selection.point,selection.first,selection.second].some(id=>id&&ownedIds.includes(id));if(marker||!retained)for(const name of ['point','firstResult','secondResult'])next.delete(name);}
  if(nextGroup)next.set('group',nextGroup);else next.delete('group');
  if(nextMarker)next.set('marker',nextMarker);else next.delete('marker');
  navigate('/precision?'+next.toString());
 };
 const changeSelection=(patch:Partial<typeof selection>)=>{const next=new URLSearchParams(params);for(const key of ['point','first','second']as const)if(key in patch){const name=key==='first'?'firstResult':key==='second'?'secondResult':'point';if(patch[key])next.set(name,patch[key]!);else next.delete(name);}next.set('tab','labs');if(next.toString()!==params.toString())navigate('/precision?'+next.toString());};
 const records=report?new Set([...report.labHistory,...report.pendingLabs,...report.sourceOnlyLabs].map(row=>row.id)).size:null;
 return <section className="bloodwork-atlas" aria-labelledby="bloodwork-atlas-title">
  <header className="bloodwork-atlas-hero">
   <EditorialMedia slot="bloodwork-hero" sizes="(max-width:767px) 100vw, 1000px" priority showCaption={false}/>
   <div className="bloodwork-atlas-intro"><p className="eyebrow">YOUR BIOLOGY, WITH CONTEXT</p><h1 id="bloodwork-atlas-title" tabIndex={-1}>Bloodwork</h1><p>Explore your results, with dates, units and source details.</p>
    {records!==null&&<p className="bloodwork-atlas-count">{records} recorded {records===1?'result':'results'}</p>}
    <div className="bloodwork-atlas-actions">{report&&<a className="hero-button" href="#add-labs-title" onClick={()=>requestAnimationFrame(()=>{const target=document.getElementById('add-labs-title');target?.setAttribute('tabindex','-1');target?.focus();})}>Add lab results</a>}<Link className="text-link" href="/biology/reports">Manage reports</Link></div>
   </div>
  </header>
  {report&&<LabPanelReview key={`panel:${user?.id||"signed-out"}`} report={report} onSelect={select}/>}
  {report&&<LabRememberedContextHistory sourceKey={JSON.stringify(report.labHistory)}/>}
  <LabExplorer key={`explorer:${user?.id||"signed-out"}`} owner={user?.id||''} report={report} marker={marker} group={group} selection={selection} onSelect={select} onSelectionChange={changeSelection} illustrated/>
  {report&&!entries.length&&<p className="panel-note">Add laboratory results to browse your recorded markers. Missing measurements are not treated as zero.</p>}
  {report&&entries.length>0&&<p className="panel-note">Systems help you browse; they are not diagnoses. Some markers appear in more than one system. Original reports and every recorded result remain below.</p>}
  <Link className="text-link" href="/meal-planner">Food preferences & meal planner</Link>
 </section>;
}
