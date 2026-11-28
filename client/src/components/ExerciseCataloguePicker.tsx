import {useRef,useState} from 'react';
import ExerciseDetailPreview from './ExerciseDetailPreview';
import {Star,Plus} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import AnatomyRegionSelector from './AnatomyRegionSelector';
import {catalogueIdsForSurfacePath} from '@shared/exercise-catalogue-associations';
import frontEveryday from '../../../design/bloom/anatomy/presentation-20261126/front-everyday.svg';
import frontAthlete from '../../../design/bloom/anatomy/presentation-20261126/front-athlete.svg';
import backEveryday from '../../../design/bloom/anatomy/presentation-20261126/back-everyday.svg';
import backAthlete from '../../../design/bloom/anatomy/presentation-20261126/back-athlete.svg';
import '@/styles/exercise-catalogue-picker.css';
import {exerciseCatalogue,exerciseCatalogueVersion,customCatalogueChoices,searchExerciseCatalogue,recentlyPerformedCatalogueIds} from '@shared/exercise-catalogue';
import {useExperience,useExperienceRecords} from '@/lib/experience';
import type {ActivityComponent} from '@shared/experience';
type Choice={id:string;name:string;category:string};
export default function ExerciseCataloguePicker({onChoose,actionLabel='Log exercise'}:{actionLabel?:string;onChoose:(choice:Choice,ref:NonNullable<ActivityComponent['catalogueRef']>)=>void}){
 const {settings,mode,patchAsync,ready,saving}=useExperience(),records=useExperienceRecords();
 const [limit,setLimit]=useState(10),[query,setQuery]=useState(''),[equipment,setEquipment]=useState(''),[muscle,setMuscle]=useState(''),[category,setCategory]=useState(''),[filter,setFilter]=useState('all'),[customName,setCustomName]=useState(''),[error,setError]=useState('');
 const [detail,setDetail]=useState<Choice|null>(null),[detailOpen,setDetailOpen]=useState(false);
 const detailOrigin=useRef<HTMLElement|null>(null),pendingChoice=useRef<Choice|null>(null);
 const [allOpen,setAllOpen]=useState(false),[browseOpen,setBrowseOpen]=useState(false),[surface,setSurface]=useState<{id:string;label:string}|null>(null),[browseError,setBrowseError]=useState('');
 const searchInput=useRef<HTMLInputElement>(null),browseOrigin=useRef<HTMLElement|null>(null);
 const recordsReady=!records.isError&&!records.isStale&&records.fetchStatus==='idle'&&!!records.data;
 const prefs=settings.exerciseCatalogue,favourites=new Set(prefs.favourites),recent=new Set(recentlyPerformedCatalogueIds(recordsReady?records.data??[]:[]));
 const custom=customCatalogueChoices(prefs.custom);
 const surfaceIds=surface?new Set(catalogueIdsForSurfacePath(surface.id)):null;
 const defaultBrowse=!allOpen&&filter==='all'&&!query.trim()&&!equipment&&!muscle&&!category&&!surface;
 const recentChoices=Array.from(recent).flatMap(id=>{const row=[...exerciseCatalogue,...custom].find(e=>e.id===id);return row?[row]:[];});
 const matches:Choice[]=searchExerciseCatalogue({query,equipment,muscle,category},custom).filter(e=>!surfaceIds||surfaceIds.has(e.id)).filter(e=>filter==='favourites'?favourites.has(e.id):filter==='recent'?recent.has(e.id):filter==='custom'?e.id.startsWith('custom.'):true);
 async function favourite(id:string){try{setError('');await patchAsync({exerciseCatalogue:{...prefs,favourites:favourites.has(id)?prefs.favourites.filter(key=>key!==id):[...prefs.favourites,id]}});}catch{setError('Favourite could not be saved. Refresh settings before retrying.');}}
 async function addCustom(){try{setError('');const name=customName.trim();if(!name)return;await patchAsync({exerciseCatalogue:{...prefs,custom:[...prefs.custom,{id:crypto.randomUUID(),name,aliases:[],category:'Custom exercise',equipment:[]}]}});setCustomName('');setFilter('custom');setQuery('');}catch{setError('Custom exercise could not be saved. Your name is retained.');}}
 const choose=(e:Choice)=>onChoose(e,{id:e.id,version:e.id.startsWith('custom.')?'account-custom-v1':exerciseCatalogueVersion,match:'selected',confirmed:true});
 const reset=()=>{setAllOpen(false);setSurface(null);setQuery('');setCategory('');setEquipment('');setMuscle('');setFilter('all');setLimit(10);};
 const options=(key:'category'|'equipment'|'muscleDescriptors')=>Array.from(new Set(exerciseCatalogue.flatMap(e=>key==='category'?[e.category]:e[key]))).sort();
 const renderRows=(choices:Choice[])=><ul className="exercise-results">{choices.map(e=><li key={e.id}>
   <button type="button" className="exercise-result-name" aria-label={`View ${e.name}`} onClick={event=>{detailOrigin.current=event.currentTarget;setDetail(e);setDetailOpen(true);}}><strong>{e.name}</strong><span>{e.category}</span></button>
   <button type="button" className="exercise-result-add" aria-label={`Review ${e.name}`} onClick={()=>choose(e)}><Plus size={18} aria-hidden="true"/><span>Add</span></button>
   <button type="button" className="exercise-result-favourite" disabled={!ready||saving} aria-pressed={favourites.has(e.id)} aria-label={`${favourites.has(e.id)?'Remove':'Add'} favourite ${e.name}`} onClick={()=>void favourite(e.id)}><Star size={18} fill={favourites.has(e.id)?'currentColor':'none'} aria-hidden="true"/></button>
  </li>)}</ul>;
 return <section className="exercise-picker space-y-3" aria-label="Shared exercise catalogue">
  <h3>Find an exercise</h3>
  <label className="exercise-search">Search exercises<input ref={searchInput} type="search" className="bloom-input w-full" placeholder="Name or alternative name" value={query} onChange={e=>{setQuery(e.target.value);setLimit(10);}}/></label>
  <div className="exercise-chips" role="group" aria-label="Exercise category">{[['','All'],['Resistance training','Strength'],['Cardiovascular / aerobic','Cardio'],['Mobility & flexibility','Mobility']].map(([value,label])=><button key={label} type="button" aria-pressed={category===value} onClick={()=>{setCategory(value);setLimit(10);}}>{label}</button>)}</div>
  <div className="exercise-chips exercise-collections" role="group" aria-label="Exercise collection">{[['all','Catalogue'],['recent','Recent'],['favourites','Favourites'],['custom','Custom']].map(([value,label])=><button key={value} type="button" aria-pressed={filter===value} onClick={()=>{setFilter(value);setAllOpen(true);setLimit(10);}}>{label}</button>)}</div>
  <details><summary>More filters</summary><div className="grid gap-3">
   <label>Category <select className="bloom-input w-full" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Any category</option>{options('category').map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Equipment <select className="bloom-input w-full" value={equipment} onChange={e=>setEquipment(e.target.value)}><option value="">Any equipment</option>{options('equipment').map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Muscle association <select className="bloom-input w-full" value={muscle} onChange={e=>setMuscle(e.target.value)}><option value="">Any muscle</option>{options('muscleDescriptors').map(v=><option key={v}>{v}</option>)}</select></label><p>Muscle filters include labelled preliminary catalogue associations, not measured activation.</p>
  </div></details>
  {(category||equipment||muscle||surface)&&<div className="exercise-chips" aria-label="Applied filters">{surface&&<button type="button" onClick={()=>setSurface(null)}>Clear {surface.label} ×</button>}{category&&<button type="button" onClick={()=>setCategory('')}>Clear {category} ×</button>}{equipment&&<button type="button" onClick={()=>setEquipment('')}>Clear {equipment} ×</button>}{muscle&&<button type="button" onClick={()=>setMuscle('')}>Clear {muscle} ×</button>}</div>}
  {defaultBrowse?<div className="exercise-discovery-default">
   <button type="button" className="exercise-browse-teaser" onClick={event=>{browseOrigin.current=event.currentTarget;setBrowseError('');setBrowseOpen(true);}}><span><strong>Explore by muscle</strong><small>Find exercises by body region</small><span aria-hidden="true">→</span></span><span className="exercise-browse-art" aria-hidden="true"><img src={mode==='athlete'?frontAthlete:frontEveryday} alt="" width={70} height={180}/><img src={mode==='athlete'?backAthlete:backEveryday} alt="" width={70} height={180}/></span></button>
   <section aria-label="Recent exercises"><div className="exercise-recent-heading"><h4>Recent exercises</h4>{recordsReady&&recentChoices.length>0&&<button type="button" className="text-link min-h-11" onClick={()=>{setFilter('recent');setAllOpen(true);}}>See all</button>}</div>
    {!recordsReady?<p role="status">{records.isError?'Recent exercises could not load.':'Checking recent exercises…'}{records.isError&&<button type="button" className="text-link min-h-11" onClick={()=>void records.refetch()}>Retry history</button>}</p>:recentChoices.length?renderRows(recentChoices.slice(0,3)):<div className="exercise-empty"><p>Find your first exercise</p><button type="button" className="text-link min-h-11" onClick={()=>searchInput.current?.focus()}>Search exercises</button></div>}
    <button type="button" className="text-link min-h-11" onClick={()=>setAllOpen(true)}>Browse all {exerciseCatalogue.length} exercises</button>
   </section>
  </div>:filter==='recent'&&!recordsReady?<p role="status">{records.isError?'Recent exercises could not load.':'Checking recent exercises…'} <button type="button" className="text-link min-h-11" onClick={()=>void records.refetch()}>Retry history</button></p>:<>
   <p role="status" className="panel-note">{matches.length} {matches.length===1?'exercise':'exercises'}{matches.length>limit?` · Showing ${limit}`:''}</p>
   {matches.length===0&&<div className="exercise-empty"><p>{filter==='recent'&&!query?'No performed exercises recorded yet.':filter==='favourites'&&!query?'No favourites saved yet.':'No matching exercises.'}</p><button type="button" className="text-link min-h-11" onClick={reset}>Clear search & filters</button></div>}
   {renderRows((filter==='recent'&&!query?recentChoices.filter(e=>matches.some(m=>m.id===e.id)):matches).slice(0,limit))}
   {matches.length>limit&&<button type="button" className="text-link min-h-11" onClick={()=>setLimit(n=>n+10)}>Show more exercises</button>}
  </>}
  <Dialog open={browseOpen} onOpenChange={setBrowseOpen}><DialogContent className="exercise-browse-dialog" onCloseAutoFocus={event=>{event.preventDefault();if(browseOrigin.current?.isConnected)browseOrigin.current.focus();else searchInput.current?.focus();}}><DialogHeader><DialogTitle>Explore by muscle</DialogTitle><DialogDescription>Select a broad surface to find associated exercises.</DialogDescription></DialogHeader><div className="exercise-browse-scroll"><AnatomyRegionSelector compact lockedLayer="muscles" mode={mode} onSelect={selection=>{if(!selection?.sourceTargetId)return;const ids=catalogueIdsForSurfacePath(selection.sourceTargetId);if(!ids.length){setBrowseError('Choose an overview region with catalogue associations.');return;}setSurface({id:selection.sourceTargetId,label:selection.label});setAllOpen(true);setFilter('all');setBrowseOpen(false);setLimit(10);}}/></div>{browseError&&<p role="status">{browseError}</p>}</DialogContent></Dialog>
  <details><summary>Add a custom exercise</summary><label>Exercise name<input className="bloom-input w-full" maxLength={120} value={customName} onChange={e=>setCustomName(e.target.value)}/></label><button type="button" disabled={!ready||saving||!customName.trim()} onClick={()=>void addCustom()}>Save custom exercise</button><p>Custom exercises belong to your account. No muscle mapping is guessed.</p></details>
  <details><summary>About the catalogue</summary><p>All {exerciseCatalogue.length} catalogue exercises are available in both modes. Muscle associations may be preliminary; that does not prevent logging.</p></details>
  {detail&&<ExerciseDetailPreview key={detail.id} choice={detail} actionLabel={actionLabel} open={detailOpen} onOpenChange={setDetailOpen} onLog={()=>{pendingChoice.current=detail;setDetailOpen(false);}} onCloseAutoFocus={event=>{event.preventDefault();detailOrigin.current?.focus({preventScroll:true});const choice=pendingChoice.current;pendingChoice.current=null;if(choice)choose(choice);}}/>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
