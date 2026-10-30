import {Button} from './ui/button';
import {kgToDisplay,displayToKg,type WeightUnit} from '@shared/display-units';
import type {ActualSets} from '@shared/experience';

export default function ActivitySetEditor({exercise,value,onChange,unit,canAdd}:{exercise:string;value:ActualSets;onChange:(value:ActualSets)=>void;unit:WeightUnit;canAdd:boolean}){
 const change=(id:string,patch:Partial<ActualSets['sets'][number]>)=>onChange({version:1,sets:value.sets.map(set=>set.id===id?{...set,...patch}:set)});
 const append=()=>onChange({version:1,sets:[...value.sets,{id:crypto.randomUUID(),exercise:exercise||'Other activity',reps:null,loadKg:null,loadUnit:unit,completed:false}]});
 return <div className="space-y-3">
  <p className="panel-note">Source-described values are starting values, not verified performance. Edit each set; completion is never inferred.</p>
  {!value.sets.length&&<p role="status">No sets recorded. Add each reported set; leave unknown amounts blank. Check the original description when counts or amounts could not be matched.</p>}
  {value.sets.map((set,index)=>{const shownUnit=set.loadUnit||unit;return <fieldset key={set.id} data-set-id={set.id} className="activity-set-row"><legend>Set {index+1}</legend>
   {set.exercise.toLowerCase()!==exercise.toLowerCase()&&<p className="panel-note">Recorded exercise: {set.exercise}</p>}
   <div className="activity-set-fields">
    <label>Reps<input aria-label={`Reps for set ${index+1}`} className="bloom-input w-full" type="number" min={0} max={1000} step={1} value={set.reps??''} onChange={e=>change(set.id!,{reps:e.target.value===''?null:Number(e.target.value)})}/></label>
    <label>Load<input aria-label={`Load for set ${index+1}`} className="bloom-input w-full" type="number" min={0} max={kgToDisplay(2000,shownUnit)} step="any" value={set.loadKg===null?'':Number(kgToDisplay(set.loadKg,shownUnit).toFixed(3))} onChange={e=>change(set.id!,{loadKg:e.target.value===''?null:displayToKg(Number(e.target.value),shownUnit)})}/></label>
    <label>Unit<select aria-label={`Load unit for set ${index+1}`} className="bloom-input w-full" value={shownUnit} onChange={e=>change(set.id!,{loadUnit:e.target.value as WeightUnit})}><option value="kg">kg</option><option value="lb">lb</option></select></label>
   </div>
   <p className="panel-note">{set.reps===null?'Reps not recorded. ':''}{set.loadKg===null?'Load not recorded. ':''}{set.state==='cancelled'?'Cancelled':set.state==='planned'?'Planned':set.completed?'Completion confirmed by you':'Completion not confirmed'}</p>
   <details><summary>Set status & side (optional)</summary>
    <label className="block">Set state<select aria-label={`State for set ${index+1}`} className="bloom-input w-full" value={set.state||'described'} onChange={e=>change(set.id!,{state:e.target.value as 'described'|'planned'|'cancelled',...(e.target.value!=='described'?{completed:false}:{})})}><option value="described">Described / reported</option><option value="planned">Planned</option><option value="cancelled">Cancelled</option></select></label>
    <label className="block">Side<select aria-label={`Side for set ${index+1}`} className="bloom-input w-full" value={set.side||''} onChange={e=>change(set.id!,{side:e.target.value?e.target.value as 'left'|'right'|'both':null})}><option value="">Not recorded</option><option value="left">Left</option><option value="right">Right</option><option value="both">Both</option></select></label>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" aria-label={`Confirm set ${index+1} completed`} checked={set.completed} disabled={set.state==='planned'||set.state==='cancelled'} onChange={e=>change(set.id!,{completed:e.target.checked})}/>I completed this set</label>
   </details>
   <div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" disabled={!canAdd} onClick={()=>onChange({version:1,sets:value.sets.flatMap(old=>old.id===set.id?[old,{...old,id:crypto.randomUUID(),completed:false}]:[old])})}>Duplicate set {index+1}</Button><Button type="button" variant="ghost" onClick={()=>onChange({version:1,sets:value.sets.filter(old=>old.id!==set.id)})}>Remove set {index+1}</Button></div>
  </fieldset>;})}
  <Button type="button" variant="outline" disabled={!canAdd} onClick={append}>Add set</Button>
 </div>;
}
