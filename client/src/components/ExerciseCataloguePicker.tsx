import {useState} from 'react';
import {exerciseCatalogue,exerciseCatalogueVersion,searchExerciseCatalogue,recentlyPerformedCatalogueIds} from '@shared/exercise-catalogue';
import {useExperience,useExperienceRecords} from '@/lib/experience';
import type {ActivityComponent} from '@shared/experience';
type Choice={id:string;name:string;category:string};
export default function ExerciseCataloguePicker({onChoose}:{onChoose:(choice:Choice,ref:NonNullable<ActivityComponent['catalogueRef']>)=>void}){
 const {settings,patchAsync,ready,saving}=useExperience(),records=useExperienceRecords();
 const [limit,setLimit]=useState(40),[query,setQuery]=useState(''),[equipment,setEquipment]=useState(''),[muscle,setMuscle]=useState(''),[category,setCategory]=useState(''),[filter,setFilter]=useState('all'),[customName,setCustomName]=useState(''),[error,setError]=useState('');
 const prefs=settings.exerciseCatalogue,favourites=new Set(prefs.favourites),recent=new Set(recentlyPerformedCatalogueIds(!records.isError&&!records.isStale&&records.fetchStatus==='idle'?records.data??[]:[]));
 const custom=prefs.custom.filter(e=>e.name.toLowerCase().includes(query.toLowerCase())).map(e=>({...e,id:'custom.'+e.id}));
 const matches:Choice[]=[...searchExerciseCatalogue({query,equipment,muscle,category}),...(!equipment&&!muscle&&!category?custom:[])].filter(e=>filter==='favourites'?favourites.has(e.id):filter==='recent'?recent.has(e.id):filter==='custom'?e.id.startsWith('custom.'):true);
 async function favourite(id:string){try{setError('');await patchAsync({exerciseCatalogue:{...prefs,favourites:favourites.has(id)?prefs.favourites.filter(key=>key!==id):[...prefs.favourites,id]}});}catch{setError('Favourite could not be saved. Refresh settings before retrying.');}}
 async function addCustom(){try{setError('');const name=customName.trim();if(!name)return;await patchAsync({exerciseCatalogue:{...prefs,custom:[...prefs.custom,{id:crypto.randomUUID(),name,aliases:[],category:'Custom exercise',equipment:[]}]}});setCustomName('');setFilter('custom');setQuery('');}catch{setError('Custom exercise could not be saved. Your name is retained.');}}
 const options=(key:'category'|'equipment'|'muscleDescriptors')=>Array.from(new Set(exerciseCatalogue.flatMap(e=>key==='category'?[e.category]:e[key]))).sort();
 return <section className="space-y-3" aria-label="Shared exercise catalogue">
  <h3>Find an exercise</h3><p>All {exerciseCatalogue.length} catalogue exercises are available in both modes. Muscle associations may be preliminary; that does not prevent logging.</p>
  <label className="block">Search exercise names or alternatives<input className="bloom-input w-full" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <label>Show <select className="bloom-input w-full" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All exercises</option><option value="recent">Recently performed</option><option value="favourites">Favourites</option><option value="custom">My custom exercises</option></select></label>
  <details><summary>Filter by category, equipment or muscle</summary><div className="grid gap-3">
   <label>Category <select className="bloom-input w-full" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Any category</option>{options('category').map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Equipment <select className="bloom-input w-full" value={equipment} onChange={e=>setEquipment(e.target.value)}><option value="">Any equipment</option>{options('equipment').map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Muscle association <select className="bloom-input w-full" value={muscle} onChange={e=>setMuscle(e.target.value)}><option value="">Any muscle</option>{options('muscleDescriptors').map(v=><option key={v}>{v}</option>)}</select></label><p>Muscle filters include labelled preliminary catalogue associations, not measured activation.</p>
  </div></details>
  <p role="status">{matches.length} matching exercises{matches.length>limit?` · Showing the first ${limit}`:''}.</p>
  <ul className="space-y-2">{matches.slice(0,limit).map(e=><li key={e.id} className="flex flex-wrap gap-2"><button type="button" className="text-link min-h-11" onClick={()=>onChoose(e,{id:e.id,version:e.id.startsWith('custom.')?'account-custom-v1':exerciseCatalogueVersion,match:'selected',confirmed:true})}>Select {e.name}</button><button type="button" className="min-h-11" disabled={!ready||saving} aria-pressed={favourites.has(e.id)} aria-label={`${favourites.has(e.id)?'Remove':'Add'} favourite ${e.name}`} onClick={()=>void favourite(e.id)}>{favourites.has(e.id)?'★ Favourite':'☆ Favourite'}</button></li>)}</ul>
  {matches.length>limit&&<button type="button" onClick={()=>setLimit(n=>n+40)}>Show more exercises</button>}
  <details><summary>Add a custom exercise</summary><label>Exercise name<input className="bloom-input w-full" maxLength={120} value={customName} onChange={e=>setCustomName(e.target.value)}/></label><button type="button" disabled={!ready||saving||!customName.trim()} onClick={()=>void addCustom()}>Save custom exercise</button><p>Custom exercises belong to your account. No muscle mapping is guessed.</p></details>
  {error&&<p role="alert">{error}</p>}
 </section>;
}
