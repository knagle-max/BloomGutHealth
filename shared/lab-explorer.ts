import {additionalLabMarkers,type AdditionalLabMarkerId} from './additional-lab-markers';
import type {PrecisionReport,SourceOnlyLab,MarkerId} from './precision-nutrition';
import {markerDefinitions} from './precision-nutrition';
import {labMarkerSearchTerms} from './lab-paste';
/** Versioned navigation only. Categories confer no diagnosis, score or clinical
 * interpretation. Independent taxonomy/content acceptance is tracked separately. */
export const LAB_NAVIGATION_VERSION='bloom-lab-navigation-2026-11-04-v1';
export const labCategories=[
 {id:'heart',name:'Heart & cholesterol'}, {id:'sugar',name:'Blood sugar & insulin'},
 {id:'liver',name:'Liver & biliary'}, {id:'kidney',name:'Kidney & electrolytes'},
 {id:'blood-count',name:'Complete blood count'}, {id:'nutrients',name:'Iron & blood nutrients'},
 {id:'hormones',name:'Hormones & thyroid'}, {id:'inflammation',name:'Inflammation & immunity'},
 {id:'bone',name:'Bone & micronutrients'}, {id:'other',name:'Other / needs identification'},
]as const;
export type LabCategoryId=typeof labCategories[number]['id'];
const addedNavigation=Object.fromEntries(additionalLabMarkers.map(marker=>[marker.id,marker.categories])) as unknown as Record<AdditionalLabMarkerId,readonly LabCategoryId[]>;
const navigation:Record<MarkerId,readonly LabCategoryId[]>={...addedNavigation,ldl:['heart'],apob:['heart'],triglycerides:['heart'],hdl:['heart'],alt:['liver'],ast:['liver'],ggt:['liver'],glucose:['sugar'],hba1c:['sugar'],b12:['nutrients'],vitamin_d:['bone'],ferritin:['nutrients'],folate:['nutrients'],homocysteine:['nutrients','heart']};
export type LabExplorerEntry={id:string;name:string;categories:readonly LabCategoryId[];trend?:PrecisionReport['trends'][number];pending:PrecisionReport['pendingLabs'];sourceOnly:(SourceOnlyLab&{id:string})[];recordCount:number;searchKey:string};
const nonSearchCharacter=new RegExp('[^\\p{L}\\p{N}]','gu');
export const normalizeLabSearch=(text:string)=>text.toLowerCase().replace(nonSearchCharacter,'');
/** Read projection: shares canonical trends/records, does not copy or recalculate history. */
export function labExplorerEntries(report:Pick<PrecisionReport,'trends'|'pendingLabs'|'sourceOnlyLabs'>):LabExplorerEntry[]{
 const entries:LabExplorerEntry[]=[];
 for(const definition of markerDefinitions){
  const trend=report.trends.find(t=>t.marker===definition.id),pending=(report.pendingLabs||[]).filter(l=>l.marker===definition.id);
  if(!trend&&!pending.length)continue;
  const recordCount=new Set([...(trend?.points.map(p=>p.id)||[]),...pending.map(p=>p.id)]).size;
  entries.push({id:definition.id,name:definition.name,categories:navigation[definition.id]||['other'],trend,pending,sourceOnly:[],recordCount,searchKey:normalizeLabSearch([...labMarkerSearchTerms(definition.id),...(trend?.points.map(p=>p.sourceInput?.text||'')||[]),...pending.map(p=>p.sourceInput?.text||'')].join(' '))});
 }
 // Exact original labels group source records for browsing, not analyte equivalence.
 const labels=new Map<string,(SourceOnlyLab&{id:string})[]>();for(const row of report.sourceOnlyLabs||[]){const group=labels.get(row.reportedAnalyte)||[];group.push(row);labels.set(row.reportedAnalyte,group);}
 for(const [name,sourceOnly]of Array.from(labels.entries())){const id='source:'+sourceOnly.map(r=>r.id).sort()[0];entries.push({id,name,categories:['other'],pending:[],sourceOnly,recordCount:new Set(sourceOnly.map(r=>r.id)).size,searchKey:normalizeLabSearch([name,...sourceOnly.map(r=>r.sourceInput.text)].join(' '))});}
 return entries;
}
