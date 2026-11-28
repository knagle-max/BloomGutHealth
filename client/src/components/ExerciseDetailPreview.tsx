import {useState} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {catalogueExercise,type CatalogueExercise} from '@shared/exercise-catalogue';
import {descriptiveMuscles} from '@shared/exercise-muscles';
import {exerciseRoleSurfaces} from '@shared/exercise-catalogue-associations';
import AnatomyRegionSelector from './AnatomyRegionSelector';
import {useExperience} from '@/lib/experience';
import frontBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-front.png';
import backBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-back.png';
import '@/styles/exercise-detail-preview.css';

type Choice=Pick<CatalogueExercise,'id'|'name'|'category'>;
/** Identity preview only: the caller owns canonical review and explicit save. */
export default function ExerciseDetailPreview({choice,actionLabel,open,onOpenChange,onLog,onCloseAutoFocus}:{choice:Choice;actionLabel:string;open:boolean;onOpenChange:(open:boolean)=>void;onLog:()=>void;onCloseAutoFocus:(event:Event)=>void}){
 const [view,setView]=useState<'front'|'back'>('front'),[imageFailed,setImageFailed]=useState(false);
 const canonical=catalogueExercise(choice.id),projection=exerciseRoleSurfaces(choice.id),{mode}=useExperience();
 const associations=projection.data?.associations??[];
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="exercise-detail-preview" onCloseAutoFocus={onCloseAutoFocus}>
  <DialogHeader><DialogTitle>{choice.name}</DialogTitle><DialogDescription>{choice.category}</DialogDescription></DialogHeader>
  <div className="exercise-detail-scroll"><div className="exercise-detail-layout">
   <section className="exercise-detail-anatomy" aria-label="Anatomy context">{projection.surfaces.length?<><AnatomyRegionSelector compact lockedLayer="muscles" mode={mode} initialView={projection.surfaces.filter(s=>s.view==='back'&&s.roles.includes('primary')).length>projection.surfaces.filter(s=>s.view==='front'&&s.roles.includes('primary')).length?'back':'front'} exerciseRoles={projection.surfaces}/><p className="panel-note">Primary: solid · Secondary: dashed · Stabilizing: dotted. Anatomical associations, not activation measurements.</p></>:<><div role="group" aria-label="Body view" className="exercise-detail-views">{(['front','back'] as const).map(side=><button type="button" key={side} aria-pressed={view===side} onClick={()=>{setView(side);setImageFailed(false);}}>{side==='front'?'Front':'Back'}</button>)}</div>{imageFailed?<p role="status">Body illustration unavailable. Exercise details and logging remain available.</p>:<img src={view==='front'?frontBody:backBody} alt={`Neutral ${view} body illustration; no mapped surface regions`} width={320} height={820} onError={()=>setImageFailed(true)}/>}</>}</section>
   <div className="exercise-detail-information">
    <section aria-label="Muscle associations"><h3>Muscle involvement</h3>{associations.length?<><p className="panel-note">{projection.data?.row.review_status==='reviewed'?'Reviewed anatomical associations':'Preliminary anatomical associations'}</p><ul>{associations.map(a=><li key={a.role+':'+a.muscle}>{descriptiveMuscles[a.muscle].label} · {({primary:'Primary',secondary:'Secondary',stabilizers:'Stabilizing'})[a.role]}{projection.textOnly.some(t=>t.muscle===a.muscle)?' · Text only':''}</li>)}</ul></>:<p>Muscle details unavailable for this exercise.</p>}</section>
    {canonical&&<section><h3>Equipment</h3><p>{canonical.equipment.length?canonical.equipment.join(' · '):'Not specified in the catalogue'}</p></section>}
    <details><summary>Names & source details</summary>{canonical?.aliases.length?<p>Also known as: {canonical.aliases.join(' · ')}</p>:null}<p>Catalogue identity supports logging. Preliminary associations retain their source review labels. The illustration does not show activation or recovery.</p></details>
   </div>
  </div></div>
  <button type="button" className="exercise-detail-log" onClick={onLog}>{actionLabel}</button>
 </DialogContent></Dialog>;
}
