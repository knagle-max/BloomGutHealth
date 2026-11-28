import {useState} from 'react';
import {useAuth} from '@/lib/auth';
import {useExperienceRecords} from '@/lib/experience';
import {completedExerciseHistory} from '@shared/training-set-history';
import {exerciseProgression} from '@shared/exercise-progression';
import {kgToDisplay,displayToKg,type WeightUnit} from '@shared/display-units';
import {setLoadContextSchema,type SetLoadContext} from '@shared/training-set-context';
import type {ActualSets} from '@shared/experience';
import {Button} from './ui/button';
const conventions:Record<SetLoadContext['convention'],string>={'barbell-total':'Barbell total','per-dumbbell':'Per dumbbell','combined-dumbbell':'Both dumbbells combined','single-limb':'Single limb','machine-stack':'Machine stack','assistance':'Assistance','bodyweight':'Bodyweight','external-total':'External load total'};
export default function ExerciseSetGuidance({set,ordinal,before,excludeRecordId,onChange}:{set:ActualSets['sets'][number];ordinal:number;before?:string;excludeRecordId?:string;onChange:(patch:Partial<ActualSets['sets'][number]>)=>void}) {
 const{user}=useAuth(),records=useExperienceRecords();
 const [convention,setConvention]=useState<SetLoadContext['convention']|''>(set.loadContext?.convention??''),[equipment,setEquipment]=useState(set.loadContext?.equipmentKey??''),[ignored,setIgnored]=useState(''),[role,setRole]=useState<SetLoadContext['setRole']>(set.loadContext?.setRole??null),[rpe,setRpe]=useState<string>(set.loadContext?.effortRpe==null?'':String(set.loadContext.effortRpe)),[nextLoad,setNextLoad]=useState({value:'',unit:set.loadUnit??'kg'});
 const now=new Date().toISOString(),date=before?new Date(before):new Date(),cutoff=Number.isFinite(+date)?date.toISOString():null;
 const history=user&&cutoff?completedExerciseHistory({ownerId:user.id,available:records.isSuccess&&!records.isError&&records.fetchStatus==='idle'&&!records.isStale,records:records.data??[]},{actorId:user.id,before:cutoff,asOf:now,excludeRecordIds:excludeRecordId?[excludeRecordId]:[]}):null;
 const unit:WeightUnit=set.loadUnit??'kg',nextText=nextLoad.unit===unit?nextLoad.value:'',nextValue=nextText.trim()?Number(nextText):NaN;
 const nextKg=Number.isFinite(nextValue)&&nextValue>0?displayToKg(nextValue,unit):undefined;
 const proposal=history?exerciseProgression(set,history,ordinal,{nextAvailableLoadKg:nextKg}):null;
 const target=proposal?.target,previous=proposal?.previous;
 const amount=(kg:number,u:WeightUnit)=>`${Number(kgToDisplay(kg,u).toFixed(3))} ${u}`;
 const signature=JSON.stringify([user?.id,set.id,proposal?.decision,previous?.key,previous?.sources,target,set.loadContext,set.side]);
 const focusReps=(button:HTMLButtonElement)=>{const input=button.closest('fieldset')?.querySelector<HTMLInputElement>('input[type="number"]');requestAnimationFrame(()=>input?.focus());};
 const context=setLoadContextSchema.safeParse({version:1,convention,equipmentKey:equipment,setRole:role,effortRpe:rpe.trim()?Number(rpe):null});
 return <section className="exercise-set-guidance space-y-2" aria-label="Previous and suggested set">
  <p className="panel-note"><strong>Previous:</strong> {records.isPending?'Loading…':!proposal||proposal.status==='SOURCE_UNAVAILABLE'?'Unavailable':previous?<>{previous.reps===null?'Reps unknown':`${previous.reps} reps`} · {previous.loadKg===null?'Load unknown':amount(previous.loadKg,previous.loadUnit??unit)} <span>· {new Date(previous.occurredAt).toLocaleDateString()}</span>{proposal.status!=='COMPARABLE_VERIFIED'?' · Reference only':''}</>:'No prior completed set'}</p>
  {target&&ignored!==signature?<div className="space-y-2"><p><strong>Suggested:</strong> {target.reps} reps · {amount(target.loadKg,unit)}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="min-h-11 px-3" onClick={e=>{onChange({reps:target.reps,loadKg:target.loadKg,loadUnit:unit});setIgnored(signature);focusReps(e.currentTarget);}}>Use target</Button><Button type="button" variant="ghost" className="min-h-11 px-3" aria-label="Edit target" onClick={e=>focusReps(e.currentTarget)}>Edit</Button><Button type="button" variant="ghost" className="min-h-11 px-3" onClick={e=>{setIgnored(signature);focusReps(e.currentTarget);}}>Ignore</Button></div></div>:target?<p aria-live="polite" className="panel-note">Keep or edit your own draft target.</p>:null}
  <details><summary>Comparison & equipment</summary><div className="space-y-3 pt-2"><p className="panel-note">{proposal?.reason??'Choose a valid activity date to compare history.'}</p>{previous&&<p className="panel-note">{previous.sources[0].title} · Recorded set {previous.sources[0].position}. {proposal?.status==='COMPARABLE_VERIFIED'?'Same confirmed exercise, equipment, load basis and side.':'Historical reference, not a matched training baseline.'}</p>}
   <label className="block">Load basis<select aria-label="Set load basis" className="bloom-input w-full" value={convention} onChange={e=>setConvention(e.target.value as typeof convention)}><option value="">Not recorded</option>{Object.entries(conventions).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   <label className="block">Equipment label<input aria-label="Set equipment label" className="bloom-input w-full" maxLength={120} value={equipment} placeholder="For example, home dumbbell pair" onChange={e=>setEquipment(e.target.value)}/></label>
   <div className="grid gap-3 sm:grid-cols-2"><label className="block">Set role<select aria-label="Set role" className="bloom-input w-full" value={role??''} onChange={e=>setRole((e.target.value||null) as SetLoadContext['setRole'])}><option value="">Not recorded</option><option value="working">Working set</option><option value="warm-up">Warm-up</option></select></label><label className="block">This set’s effort (RPE 1–10)<input aria-label="This set effort RPE" className="bloom-input w-full" inputMode="decimal" maxLength={5} value={rpe} onChange={e=>setRpe(e.target.value)}/></label></div>
   <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="min-h-11" disabled={!context.success} onClick={()=>{if(context.success)onChange({loadContext:context.data});}}>Apply set details</Button>{set.loadContext&&<Button type="button" variant="ghost" className="min-h-11" onClick={()=>{onChange({loadContext:null});setConvention('');setEquipment('');}}>Clear set details</Button>}</div>
   <p className="panel-note">Record effort after performing this set. Session effort is never copied here.</p>
   <label className="block">Next available load ({unit})<input aria-label={`Next available load (${unit})`} className="bloom-input w-full" inputMode="decimal" maxLength={12} value={nextText} placeholder="Only a load your equipment offers" onChange={e=>setNextLoad({value:e.target.value,unit})}/></label>
   {!!nextText&&(nextKg===undefined||nextKg>2000)&&<p role="status" className="panel-note">Enter a positive available load, or leave this guidance field blank.</p>}
   <p className="panel-note">Optional 8–12 rep guidance uses recorded sets, not a recovery estimate. Load steps require repeated complete working sets and available equipment; unknown effort stays unknown. Skip guidance if movement hurts. Using a target only edits this draft; mark actual completion separately.</p>
  </div></details>
 </section>;
}
