import {Button} from '@/components/ui/button';
import {kgToDisplay,displayToKg,type WeightUnit} from '@shared/display-units';
import type {ActualSets,TrainingSession} from '@shared/experience';
const shown=(value:number,unit:WeightUnit)=>Number(kgToDisplay(value,unit).toFixed(3));
export function RecordedSets({value,unit}:{value:ActualSets;unit:WeightUnit}) {
 return <ol className="space-y-2">{value.sets.map((set,index)=><li key={index}><strong>{index+1}. {set.exercise}</strong> · {set.reps===null?'Reps not recorded':`${set.reps} reps`} · {set.loadKg===null?'Load not recorded':`${shown(set.loadKg,unit)} ${unit}`} · {set.completed?'Marked completed':'Not marked completed'}</li>)}</ol>;
}
export default function TrainingSetsEditor({value,onChange,unit,reference,historyReady}:{value:ActualSets|undefined;onChange:(value:ActualSets)=>void;unit:WeightUnit;reference?:TrainingSession;historyReady?:boolean}) {
 const sets=value?.sets||[];
 const change=(index:number,patch:Partial<ActualSets['sets'][number]>)=>onChange({version:1,sets:sets.map((set,i)=>i===index?{...set,...patch}:set)});
 return <details className="space-y-3"><summary>Actual exercise sets (optional)</summary>
  <p className="panel-note">Record what you actually performed. Blank values stay unknown; zero is a recorded zero. Mark each completed set yourself. Set entries do not change session status, estimate training load or alter nutrition targets. Load uses your mass preference ({unit}).</p>
  {historyReady!==undefined&&<details><summary>Recorded reference session</summary>{!historyReady?<p>Saved set history is not currently available.</p>:reference?.actualSets?<><p>{reference.title} · {new Date(reference.startsAt).toLocaleString()}. Reference only; these values are not copied into this session.</p><RecordedSets value={reference.actualSets} unit={unit}/></>:<p>No completed session with recorded sets is available.</p>}</details>}
  {sets.map((set,index)=><fieldset className="bloom-panel space-y-2" key={index}><legend>Set {index+1}</legend><label className="block">Exercise {index+1}<input className="bloom-input w-full" value={set.exercise} maxLength={120} required onChange={e=>change(index,{exercise:e.target.value})}/></label><div className="precision-grid"><label>Reps {index+1}<input className="bloom-input w-full" type="number" min={0} max={1000} step={1} value={set.reps??''} onChange={e=>change(index,{reps:e.target.value===''?null:Number(e.target.value)})}/></label><label>Load {index+1} ({unit})<input className="bloom-input w-full" type="number" min={0} max={kgToDisplay(2000,unit)} step="any" value={set.loadKg===null?'':shown(set.loadKg,unit)} onChange={e=>change(index,{loadKg:e.target.value===''?null:displayToKg(Number(e.target.value),unit)})}/></label></div><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={set.completed} onChange={e=>change(index,{completed:e.target.checked})}/>Set {index+1} completed</label><Button type="button" variant="ghost" onClick={()=>onChange({version:1,sets:sets.filter((_,i)=>i!==index)})}>Remove set {index+1}</Button></fieldset>)}
  <Button type="button" variant="outline" disabled={sets.length>=100} onClick={()=>onChange({version:1,sets:[...sets,{exercise:'',reps:null,loadKg:null,completed:false}]})}>Add actual set</Button>
 </details>;
}
