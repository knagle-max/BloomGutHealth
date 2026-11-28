import source from './data/exercise-selection.json';
export const exerciseCatalogueVersion=source.version;
export const exerciseCatalogue=source.records;
export type CatalogueExercise=typeof exerciseCatalogue[number];
export const normalizeExercise=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[–—]/g,'-').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
export function catalogueExercise(id:string){return exerciseCatalogue.find(e=>e.id===id)??null;}
/** Same identities for manual discovery and local natural-language proposals.
 * Return ambiguity rather than guessing between variants. Review stays editable. */
export function matchCatalogueExercises(text:string,additional:readonly CatalogueExercise[]=[]){
 const normalized=normalizeExercise(text),padded=' '+normalized+' ';
 const matches=[...exerciseCatalogue,...additional].flatMap(exercise=>{const names=[exercise.name,...exercise.aliases].map(normalizeExercise);const exact=names.some(n=>n===normalized);const longest=Math.max(0,...names.filter(n=>n&&padded.includes(' '+n+' ')).map(n=>n.length));return exact||longest?[{exercise,exact,score:exact?100000:longest}]:[];}).sort((a,b)=>b.score-a.score||a.exercise.name.localeCompare(b.exercise.name));
 return matches.filter(m=>m.score===matches[0]?.score).map(m=>m.exercise);
}
/** Discovery order describes text relevance only, never effectiveness or muscle
 * activation. Account custom choices are supplied by the caller, never cached. */
export function searchExerciseCatalogue({query='',category='',equipment='',muscle=''}:{query?:string;category?:string;equipment?:string;muscle?:string},additional:readonly CatalogueExercise[]=[]){
 const normalized=normalizeExercise(query),words=normalized.split(' ').filter(Boolean);
 const candidates=[...exerciseCatalogue,...additional].filter(e=>(!category||e.category===category)&&(!equipment||e.equipment.includes(equipment))&&(!muscle||e.muscleDescriptors.includes(muscle))&&words.every(word=>normalizeExercise([e.name,...e.aliases].join(' ')).includes(word)));
 if(!normalized)return candidates;
 const rank=(e:CatalogueExercise)=>{const names=[e.name,...e.aliases].map(normalizeExercise);return names.includes(normalized)?0:names.some(name=>name.startsWith(normalized))?1:2;};
 return candidates.sort((a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name,'en')||a.id.localeCompare(b.id,'en'));
}

export function customCatalogueChoices(custom:readonly {id:string;name:string;aliases:string[];category:string;equipment:string[]}[]):CatalogueExercise[]{return custom.map(e=>({...e,id:'custom.'+e.id,muscleDescriptors:[],associationReview:'custom-unmapped'}));}

/** Recents are confirmed performance, never planned sessions or merely selected
 * names. Component aggregate copies are not independent exercises. */
export function recentlyPerformedCatalogueIds(records:readonly import('./experience').ExperienceRecord[],asOf=new Date().toISOString()){
 const ids=new Set<string>();
 const at=(row:typeof records[number])=>row.kind==='activity'?row.payload.startedAt:row.kind==='session'?row.payload.startsAt:row.createdAt;
 for(const row of [...records].filter(row=>Date.parse(at(row))<=Date.parse(asOf)).sort((a,b)=>Date.parse(at(b))-Date.parse(at(a))||b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id))){
  const sets=row.kind==='activity'?(row.payload.components?row.payload.components.items.flatMap(p=>p.actualSets?.sets??[]):row.payload.actualSets?.sets??[]):row.kind==='session'&&row.payload.status==='completed'?row.payload.actualSets?.sets??[]:[];
  for(const set of sets)if(set.completed&&set.state!=='planned'&&set.state!=='cancelled'&&set.catalogueRef?.confirmed)ids.add(set.catalogueRef.id);
 }
 return Array.from(ids);
}
