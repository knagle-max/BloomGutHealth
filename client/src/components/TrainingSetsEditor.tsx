import {useId,useRef,useState} from 'react';
import {SetCompletionRow} from './ActivitySetEditor';
import {Check,Minus} from 'lucide-react';
import {activitySetSummary,activityCompletionSummary} from '@shared/activity-capture';
import {previousTrainingSets} from '@shared/training-set-history';
import {Button} from '@/components/ui/button';
import {kgToDisplay,displayToKg,type WeightUnit} from '@shared/display-units';
import type {ActualSets,TrainingSession} from '@shared/experience';
const shown=(value:number,unit:WeightUnit)=>Number(kgToDisplay(value,unit).toFixed(3));
export function RecordedSets({value,unit}:{value:ActualSets;unit:WeightUnit}) {
 const groups:ActualSets['sets'][]=[];
 for(const set of value.sets){const last=groups.at(-1);if(last&&last[0].exercise===set.exercise)last.push(set);else groups.push([set]);}
 return <div className="space-y-3">{groups.map((sets,groupIndex)=><section key={groupIndex}><h4>{sets[0].exercise}</h4><p className="panel-note">{activitySetSummary(sets,unit)} · {activityCompletionSummary(sets)}</p><ol>{sets.map((set,index)=><li key={set.id||index} className="activity-set-compact"><span className={`activity-set-toggle ${set.completed?'is-completed':''}`}><span className="activity-set-circle" aria-hidden="true">{set.completed?<Check size={15}/>:set.state==='cancelled'?<Minus size={15}/>:null}</span><span className="sr-only">{set.state==='cancelled'?'Cancelled':set.state==='planned'?'Planned':set.completed?'Completed':'Completion not confirmed'}</span></span><span>{index+1}</span><span>{set.reps===null?<span aria-label="Repetitions unknown">—</span>:`${set.reps} reps`}</span><span>{set.loadKg===null?<span aria-label="Load unknown">—</span>:`${shown(set.loadKg,set.loadUnit||unit)} ${set.loadUnit||unit}`}</span></li>)}</ol></section>)}</div>;
}
export default function TrainingSetsEditor({value,onChange,unit,history,before,historyReady,entryType="session"}:{value:ActualSets|undefined;onChange:(value:ActualSets)=>void;unit:WeightUnit;history?:TrainingSession[];before?:string;historyReady?:boolean;entryType?:"session"|"activity"}) {
 const legacyIds=useRef(new WeakMap<object,string>()),prefix=useId();
 const [editing,setEditing]=useState<Set<string>>(()=>new Set());
 // Assign legacy rows a stable draft identity without modifying the source object.
 const sets=(value?.sets||[]).map(set=>{if(set.id)return set;let id=legacyIds.current.get(set);if(!id){id=crypto.randomUUID();legacyIds.current.set(set,id);}return {...set,id};});
 const previous=historyReady&&history&&before?previousTrainingSets(sets,history,before):[];
 const change=(id:string,patch:Partial<ActualSets['sets'][number]>)=>onChange({version:1,sets:sets.map(set=>set.id===id?{...set,...patch}:set)});
 const editorId=(id:string)=>`${prefix}-training-set-${id}`;
 const reveal=(id:string)=>setEditing(old=>new Set([...Array.from(old),id]));
 const append=()=>{const id=crypto.randomUUID();reveal(id);onChange({version:1,sets:[...sets,{id,exercise:'',reps:null,loadKg:null,loadUnit:unit,completed:false}]});requestAnimationFrame(()=>document.getElementById(editorId(id))?.querySelector('input')?.focus());};
 const exerciseKey=(name:string)=>name.trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
 return <details className="space-y-3 training-sets-editor" onInvalidCapture={event=>{for(let node=(event.target as HTMLElement).parentElement;node;node=node.parentElement){if(node instanceof HTMLDetailsElement)node.open=true;if(node===event.currentTarget)break;}}}><summary>Actual exercise sets (optional)</summary>
  <p className="panel-note">Record each set yourself. Blank values stay unknown; completion is never inferred. Sets do not change {entryType==="activity"?"other records":"session status"}, estimate training load or alter nutrition targets.</p>
  {historyReady!==undefined&&<details><summary>About previous sets</summary><p className="panel-note">Previous shows the most recent completed set with matching exercise text and position among that exercise’s sets, before this session and now. Names are matched without case or extra spaces; variations are not assumed equivalent. Dates and recorded units are shown for reference, not a recommendation. Nothing is copied into your new sets.</p></details>}
  {!!sets.length&&<p aria-live="polite">{activityCompletionSummary(sets)}</p>}
  {sets.map((set,index)=>{
   const id=set.id!,number=index+1,open=editing.has(id),loadUnit=set.loadUnit||unit;
   const first=index===0||exerciseKey(sets[index-1].exercise)!==exerciseKey(set.exercise);
   let end=index+1;while(end<sets.length&&exerciseKey(sets[end].exercise)===exerciseKey(set.exercise))end++;
   return <div key={id} data-training-set-id={id} className="activity-set-row">
    {first&&<div className="training-exercise-heading"><h4>{set.exercise.trim()||'Name this exercise'}</h4><p className="panel-note">{activitySetSummary(sets.slice(index,end),unit)}</p></div>}
    <SetCompletionRow set={set} number={number} unit={unit} open={open} editorId={editorId(id)} onToggle={()=>setEditing(old=>{const next=new Set(old);if(open)next.delete(id);else next.add(id);return next;})} onCompletion={()=>change(id,{completed:!set.completed})}/>
    {historyReady!==undefined&&<div className="panel-note training-set-previous" aria-label={`Previous set ${number}`}>{!historyReady?<p>Previous unavailable — saved set history is not currently available.</p>:previous[index]?<details><summary><strong>Previous:</strong> {previous[index]!.set.reps===null?'Reps not recorded':`${previous[index]!.set.reps} reps`} · {previous[index]!.set.loadKg===null?'Load not recorded':`${shown(previous[index]!.set.loadKg!,previous[index]!.set.loadUnit||unit)} ${previous[index]!.set.loadUnit||unit}`}</summary><p>{previous[index]!.title} · <time dateTime={previous[index]!.startsAt}>{new Date(previous[index]!.startsAt).toLocaleString()}</time> · Recorded set {previous[index]!.position}</p></details>:<p>No prior set</p>}</div>}
    <fieldset id={editorId(id)} hidden={!open} className="activity-set-detail space-y-3" onInvalidCapture={event=>{const input=event.target as HTMLInputElement;reveal(id);requestAnimationFrame(()=>input.focus());}}><legend>Edit set {number}</legend>
     <label className="block">Exercise {number}<input className="bloom-input w-full" value={set.exercise} maxLength={120} required onChange={e=>change(id,{exercise:e.target.value})}/></label>
     <div className="activity-set-fields"><label>Reps {number}<input className="bloom-input w-full" type="number" min={0} max={1000} step={1} value={set.reps??''} onChange={e=>change(id,{reps:e.target.value===''?null:Number(e.target.value)})}/></label><label>Load {number} ({loadUnit})<input className="bloom-input w-full" type="number" min={0} max={kgToDisplay(2000,loadUnit)} step="any" value={set.loadKg===null?'':shown(set.loadKg,loadUnit)} onChange={e=>change(id,{loadKg:e.target.value===''?null:displayToKg(Number(e.target.value),loadUnit)})}/></label><label>Unit<select aria-label={`Training load unit ${number}`} className="bloom-input w-full" value={loadUnit} onChange={e=>change(id,{loadUnit:e.target.value as WeightUnit})}><option value="kg">kg</option><option value="lb">lb</option></select></label></div>
     <details><summary>Set state & side</summary><label className="block">Set state<select aria-label={`Training set state ${number}`} className="bloom-input w-full" value={set.state||'described'} onChange={e=>change(id,{state:e.target.value as 'described'|'planned'|'cancelled',...(e.target.value!=='described'?{completed:false}:{})})}><option value="described">Described / reported</option><option value="planned">Planned</option><option value="cancelled">Cancelled</option></select></label><label className="block">Side<select aria-label={`Training set side ${number}`} className="bloom-input w-full" value={set.side||''} onChange={e=>change(id,{side:e.target.value?e.target.value as 'left'|'right'|'both':null})}><option value="">Not recorded</option><option value="left">Left</option><option value="right">Right</option><option value="both">Both</option></select></label></details>
     <Button type="button" variant="ghost" onClick={()=>{const next=sets[index+1]?.id||sets[index-1]?.id;onChange({version:1,sets:sets.filter(old=>old.id!==id)});requestAnimationFrame(()=>{const root=next?document.getElementById(editorId(next))?.parentElement:document.getElementById(`${prefix}-add-set`);(root?.querySelector<HTMLButtonElement>('.activity-set-edit')||root)?.focus();});}}>Remove set {number}</Button>
    </fieldset>
   </div>;
  })}
  <Button id={`${prefix}-add-set`} type="button" variant="outline" disabled={sets.length>=100} onClick={append}>Add actual set</Button>
 </details>;
}
