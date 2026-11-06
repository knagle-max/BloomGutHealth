import{useEffect,useState}from'react';
import{useQuery}from'@tanstack/react-query';
import{useAuth}from'@/lib/auth';
import{apiRequest}from'@/lib/queryClient';
import{accountContextGuard}from'@/lib/request-actor';
import{resetPlanningInputs}from'@/lib/planning-cache';
import type{MicrobiomeFoodControl,MicrobiomeFoodSource,MicrobiomeFoodTrace}from'@shared/microbiome-food-influence';
import{Button}from'./ui/button';
type Setting={control:MicrobiomeFoodControl;revision:string;sources:MicrobiomeFoodSource[];source:MicrobiomeFoodSource|null};
function useSetting(){const{user}=useAuth();return{user,query:useQuery<Setting>({queryKey:['/api/precision/microbiome-food',user?.id],enabled:!!user,queryFn:async({signal})=>{const data=await(await apiRequest('GET','/api/precision/microbiome-food',undefined,undefined,signal)).json();if(!data||!Array.isArray(data.sources)||!data.control||typeof data.revision!=='string')throw Error('Unconfirmed food preferences');return data;}})};}
const command=(control:MicrobiomeFoodControl)=>({enabled:control.enabled,reportId:control.reportId,reportRevision:control.reportRevision,ignoredFoodIds:control.ignoredFoodIds});
async function save(owner:string,setting:Setting,control:MicrobiomeFoodControl){const guard=accountContextGuard();await apiRequest('PUT','/api/precision/microbiome-food',{control:command(control),revision:setting.revision,confirmed:true},{'X-Bloom-Food-Actor':owner});guard();await resetPlanningInputs();}
export default function MicrobiomeFoodPreferences(){
 const{user,query}=useSetting();const[enabled,setEnabled]=useState(false),[id,setId]=useState(''),[dirty,setDirty]=useState(false),[basis,setBasis]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState(''),[clearIgnored,setClearIgnored]=useState(false);
 const data=query.fetchStatus==='idle'&&!query.isError?query.data:undefined;
 useEffect(()=>{setDirty(false);setEnabled(false);setId('');setBasis('');setError('');setClearIgnored(false);},[user?.id]);
 useEffect(()=>{if(data&&!dirty){setEnabled(data.control.enabled);setId(data.control.reportId||'');setBasis(data.revision);setClearIgnored(false);}},[data,dirty]);
 const selected=data?.sources.find(source=>source.id===id),stale=!!data&&dirty&&basis!==data.revision;
 return <section className="space-y-3" aria-label="Microbiome food preferences"><h3>Microbiome food preferences</h3><p>Let foods listed in your report help personalize meal ideas and food suggestions. This won’t change your nutrient totals or restrict what you can eat.</p>
  {query.isError?<p role="alert">Report preferences could not be checked. <Button variant="outline" onClick={()=>query.refetch()}>Retry</Button></p>:!data?<p role="status">Checking report preferences…</p>:<>
   <label className="flex gap-2 items-center min-h-11"><input type="checkbox" checked={enabled} disabled={pending||!data.sources.length&&!enabled} onChange={e=>{setEnabled(e.target.checked);setDirty(true);}}/>Use my microbiome food recommendations</label>
   <p className="panel-note">{!data.control.enabled?'Report preferences are off. Your saved report is still available.':!data.source?'The selected report is unavailable or changed. No report influence is being applied.':'Your selected report can provide a secondary factor in eligible meal suggestions.'}</p>
   <label className="block">Governing report<select className="bloom-input w-full" value={id} disabled={pending} onChange={e=>{setId(e.target.value);setDirty(true);}}><option value="">Choose a saved reviewed report</option>{data.sources.map(source=><option key={source.id} value={source.id}>{source.provider} · {source.date||'date not supplied'} · Bloom {source.id.slice(-8)}</option>)}</select></label>
   {!data.sources.length&&<p>No eligible reviewed food report is saved. Ordinary Food works without one.</p>}
   {selected&&<p>{selected.foods.length} source food rows · {Array.from(new Set(selected.foods.map(food=>food.reportedCategory))).map(category=>`${category||'Unknown'} ${selected.foods.filter(food=>food.reportedCategory===category).length}`).join(' · ')}. Exact prepared-food matches only; unmatched foods have no effect.</p>}
   {data.control.ignoredFoodIds.length>0&&<div><p>{data.control.ignoredFoodIds.length} canonical food(s) ignored for report influence. These choices survive report changes.</p><Button variant="outline" disabled={pending||clearIgnored} onClick={()=>{setClearIgnored(true);setDirty(true);}}>Restore ignored food influences</Button>{clearIgnored&&<p>Ignored food influences will be restored when you save.</p>}</div>}
   {stale&&<p role="alert">The saved setting changed. Reset to saved preferences before editing again.</p>}{error&&<p role="alert">{error}</p>}
   <div className="flex flex-wrap gap-2"><Button disabled={!dirty||pending||stale||enabled&&!selected} onClick={async()=>{if(!user||!data)return;const guard=accountContextGuard();setPending(true);setError('');try{await save(user.id,data,{enabled,reportId:selected?.id||null,reportRevision:selected?.revision||null,ignoredFoodIds:clearIgnored?[]:data.control.ignoredFoodIds});setDirty(false);}catch{try{guard();setError('Preferences could not be confirmed. Reload and review the current setting.');await query.refetch();}catch{/* Account changed. */}}finally{setPending(false);}}}>{pending?'Saving…':'Save report preferences'}</Button>{dirty&&<Button variant="outline" disabled={pending} onClick={()=>{setDirty(false);setError('');}}>Reset to saved preferences</Button>}</div>
  </>}
 </section>;
}
export function MicrobiomeFoodReason({trace}:{trace:MicrobiomeFoodTrace}){
 const{user,query}=useSetting();const[pending,setPending]=useState(false),[error,setError]=useState('');
 const current=!query.isError&&query.fetchStatus==='idle'&&query.data?.control.enabled&&query.data.source?.id===trace.reportId&&query.data.source?.revision===trace.reportRevision;
 if(!current)return null;
 async function change(ignore:boolean){if(!user||!query.data)return;const guard=accountContextGuard();setPending(true);setError('');try{await save(user.id,query.data,{...query.data.control,...(ignore?{ignoredFoodIds:Array.from(new Set([...query.data.control.ignoredFoodIds,...trace.matches.map(match=>match.foodId)]))}:{enabled:false})});}catch{try{guard();setError('The report preference could not be confirmed. Review your saved setting.');await query.refetch();}catch{/* Account changed. */}}finally{setPending(false);}}
 return <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2"><span className="inline-flex rounded-full border border-border px-2 py-1 text-sm">{trace.contributed?'Microbiome report match':'Listed in your microbiome report'}</span> · Why this suggestion?</summary>
  {trace.contributed&&<p>Your report was one factor in this suggestion.</p>}<p>Source: {trace.provider} · {trace.date||'date not supplied'} · Bloom {trace.reportId.slice(-8)}. Provider categories are opinions; allergies, exclusions and supported goals take priority. No overall recipe grade is inferred.</p>
  <ul>{trace.matches.map(match=><li key={match.foodId}>{match.name}: {match.category}{match.page!==null?` · page ${match.page}`:''}</li>)}</ul><p>Only exact ingredient identities were considered. Unmatched ingredients have no effect.</p>
  {error&&<p role="alert">{error}</p>}<div className="flex flex-wrap gap-2"><Button variant="outline" disabled={pending} onClick={()=>change(true)}>Ignore this suggestion</Button><Button variant="outline" disabled={pending} onClick={()=>change(false)}>Turn off report influence</Button></div>
 </details>;
}
