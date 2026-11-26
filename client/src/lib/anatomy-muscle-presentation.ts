import baseline from '@/content/anatomy-source-geometry.json';
import source from '@/content/anatomy-presentation-source.json';
import{muscleInspectorCrosswalk}from'./anatomy-inspector-crosswalk';
export type AnatomyView='front'|'back';
export type MuscleTarget={id:string;visualKey:string;label:string;ariaLabel:string;d:string;fillRule:'evenodd'|'nonzero';parentClipD?:string;parentId:string|null;parentageUnresolved:boolean;independent:boolean;listOnly:boolean;provisional:boolean};
export const ANATOMY_PRESENTATION_VERSION=source.version;
const names:Record<string,string>={deltoid_anterior:'Anterior deltoid area',deltoid_lateral:'Lateral deltoid area',deltoid_posterior:'Posterior deltoid area',serratus_anterior:'Serratus anterior',adductors:'Thigh adductor area',sternocleidomastoid:'Sternocleidomastoid',gluteus_medius:'Gluteus medius',forearm_flexor_area:'Forearm flexor area',forearm_extensor_area:'Forearm extensor area',trapezius_upper:'Upper trapezius area',trapezius_middle:'Middle trapezius area'};
function bounds(d:string){const n=(d.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)||[]).map(Number);return[Math.min(...n.filter((_,i)=>i%2===0)),Math.min(...n.filter((_,i)=>i%2===1)),Math.max(...n.filter((_,i)=>i%2===0)),Math.max(...n.filter((_,i)=>i%2===1))];}
export function baselineMusclePath(view:AnatomyView,id:string){return baseline.views[view].find(path=>path.id===id);}
function diagramLocation(view:AnatomyView,id:string){
 const path=baselineMusclePath(view,id);if(!path)return'';
 // Literal image geography, not an inferred patient-side or muscle-head ID.
 const core:Record<string,string>={'01':'upper centre, diagram left','02':'upper centre, diagram right','03':'middle centre, diagram left','04':'middle centre, diagram right','05':'lower centre, diagram left','06':'lower centre, diagram right','07':'outer section, diagram left','08':'outer section, diagram right'};
 if(path.group==='core')return core[path.id.split('-').at(-1)!]??'core area';
 const siblings=baseline.views[view].filter(row=>row.group===path.group).sort((a,b)=>{const x=bounds(a.d),y=bounds(b.d);return(x[0]+x[2])-(y[0]+y[2]);});
 return siblings[0]?.id===id?'diagram left':'diagram right';
}
export function muscleTargets(view:AnatomyView,detailed:boolean):MuscleTarget[]{
 if(!detailed)return baseline.views[view].map(path=>{const group=muscleInspectorCrosswalk.find(row=>row.svgRegionId===path.id)!;const label=`${group.displayLabel} · ${diagramLocation(view,path.id)}`;return{id:path.id,visualKey:path.group,label,ariaLabel:label,d:path.d,fillRule:'nonzero',parentId:null,parentageUnresolved:false,independent:false,listOnly:false,provisional:false};});
 return source.views[view].map(row=>{
  const parent=muscleInspectorCrosswalk.find(path=>path.svgRegionId===(row.parentSourceId??row.id));
  const name=names[row.muscle]??parent?.displayLabel??row.muscle.replaceAll('-',' ').replaceAll('_',' ');
  const original=baselineMusclePath(view,row.parentSourceId??row.id);
  const label=('label'in row?row.label:undefined)??`${row.sourceKind==='residual'&&row.id!==row.parentSourceId?'Remaining ':''}${name} · ${original&&row.sourceKind==='residual'?diagramLocation(view,original.id):'source '+row.subjectSide}`;
  return{id:row.id,visualKey:row.id,label,ariaLabel:('ariaLabel'in row?row.ariaLabel:undefined)??label,d:row.d,fillRule:row.fillRule as 'evenodd'|'nonzero',parentClipD:'parentClipD'in row?row.parentClipD:undefined,parentId:row.parentSourceId,parentageUnresolved:row.parentageUnresolved,independent:row.independent,listOnly:row.listOnly,provisional:true};
 });
}
