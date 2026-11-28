import ExerciseCataloguePicker from './ExerciseCataloguePicker';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {apiRequest} from '@/lib/queryClient';
import {refreshExperience,useExperienceRecords} from '@/lib/experience';
import {localizedSymptomKinds,localizedSymptomSides,localizedSymptomSchema,symptomRegionChoices,symptomRegionSource,type LocalizedSymptom} from '@shared/localized-symptoms';
import type {ExperienceRecord} from '@shared/experience';
import AnatomyRegionSelector from './AnatomyRegionSelector';
const localTime=(d=new Date())=>new Date(+d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
/** Parent is keyed by actor. The held command survives uncertain HTTP responses,
 * so Retry sends the same revision rather than creating another observation. */
export default function LocalizedSymptomEditor({actor,mode,contextual=false,initialLocation,initialRecord,onDirtyChange,onBusyChange,onSaved}:{actor:string;mode:'everyday'|'athlete';contextual?:boolean;initialLocation?:{view:'front'|'back';regionId:string};onDirtyChange?:(dirty:boolean)=>void;onBusyChange?:(busy:boolean)=>void;onSaved?:()=>void;initialRecord?:Extract<ExperienceRecord,{kind:'localized-symptom'}>}){
 const records=useExperienceRecords('localized-symptom'),context=useQuery<{lifecycleId:string}>({queryKey:['/api/experience/localized-symptom-context',actor],queryFn:async()=>(await apiRequest('GET','/api/experience/localized-symptom-context')).json()});
 const [editing,setEditing]=useState<Extract<ExperienceRecord,{kind:'localized-symptom'}>|null>(null),[draft,setDraft]=useState(()=>blank()),[pending,setPending]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[choosingMovement,setChoosingMovement]=useState(false);
 useEffect(()=>{if(initialRecord)edit(initialRecord);},[initialRecord?.id]);
 const attempt=useRef<{id?:string;payload:LocalizedSymptom}|null>(null);
 const movementSelect=useRef<HTMLSelectElement>(null),movementChoice=useRef<HTMLButtonElement>(null),movementFocus=useRef<'response'|'choose'|null>(null);
 useLayoutEffect(()=>{const target=movementFocus.current;movementFocus.current=null;if(target==='response')movementSelect.current?.focus();else if(target==='choose')movementChoice.current?.focus();},[draft.movement,choosingMovement]);
 function blank(){return{type:'soreness' as LocalizedSymptom['type'],view:initialLocation?.view??'front' as 'front'|'back',regionId:initialLocation?.regionId??symptomRegionChoices.front[0].id,laterality:'unspecified' as LocalizedSymptom['location']['laterality'],when:localTime(),onset:'',severity:'',duration:'',ongoing:'unknown',notes:'',movement:undefined as LocalizedSymptom['movement']};}
 function change(patch:Partial<typeof draft>){onDirtyChange?.(true);attempt.current=null;setDraft(old=>({...old,...patch}));setError('');setMessage('');}
 function edit(row:Extract<ExperienceRecord,{kind:'localized-symptom'}>){attempt.current=null;setEditing(row);setDraft({type:row.payload.type,view:row.payload.location.view,regionId:row.payload.location.regionId,laterality:row.payload.location.laterality,when:localTime(new Date(row.payload.observedAt)),onset:row.payload.onsetAt?localTime(new Date(row.payload.onsetAt)):'',severity:row.payload.severity===null?'':String(row.payload.severity),duration:row.payload.durationMinutes===null?'':String(row.payload.durationMinutes),ongoing:row.payload.ongoing===null?'unknown':String(row.payload.ongoing),notes:row.payload.notes,movement:row.payload.movement});setChoosingMovement(false);setError('');setMessage('');}
 async function save(){if(pending)return;onDirtyChange?.(true);onBusyChange?.(true);setPending(true);setError('');try{
  if(!attempt.current){if(!context.data||context.isStale||context.isError)throw Error('Refresh the current account context before saving.');
   const unchanged=editing&&draft.when===localTime(new Date(editing.payload.observedAt));
   const unchangedOnset=editing&&draft.onset===(editing.payload.onsetAt?localTime(new Date(editing.payload.onsetAt)):'');
   const payload=localizedSymptomSchema.parse({version:1,lifecycleId:editing?.payload.lifecycleId??context.data.lifecycleId,revision:crypto.randomUUID(),previousRevision:editing?.payload.revision??null,type:draft.type,location:{source:symptomRegionSource,view:draft.view,regionId:draft.regionId,laterality:draft.laterality},observedAt:unchanged?editing!.payload.observedAt:new Date(draft.when).toISOString(),timeZone:unchanged?editing!.payload.timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,onsetAt:unchangedOnset?editing!.payload.onsetAt:draft.onset?new Date(draft.onset).toISOString():null,severity:draft.severity===''?null:Number(draft.severity),durationMinutes:draft.duration===''?null:Number(draft.duration),ongoing:draft.ongoing==='unknown'?null:draft.ongoing==='true',notes:draft.notes,source:'user-reported',...(draft.movement!==undefined?{movement:draft.movement}:{})});
   attempt.current={id:editing?.id,payload};
  }
  const command=attempt.current;await apiRequest(command.id?'PUT':'POST','/api/experience/records'+(command.id?'/'+command.id:''),{kind:'localized-symptom',payload:command.payload});attempt.current=null;setEditing(null);setDraft(blank());setMessage('Observation saved.');onDirtyChange?.(false);refreshExperience();onSaved?.();
 }catch{setError('Save could not be confirmed. Your draft is retained. Retry unchanged to use the same revision. For a conflicting edit, review the latest saved observation before replacing your draft.');refreshExperience();}finally{setPending(false);onBusyChange?.(false);}}
 async function remove(id:string){onBusyChange?.(true);setPending(true);setError('');try{await apiRequest('DELETE','/api/experience/records/'+id);if(editing?.id===id){setEditing(null);attempt.current=null;setDraft(blank());}refreshExperience();setMessage('Observation deleted.');onDirtyChange?.(false);onSaved?.();}catch{setError('Deletion could not be confirmed. Refresh saved observations before retrying.');}finally{setPending(false);onBusyChange?.(false);}}
 const saved=records.fetchStatus==='idle'&&!records.isError&&!records.isStale?records.data:undefined;
 const Container=contextual?'div':'details';
 return <Container className={contextual?'contextual-symptom-editor':undefined}>{!contextual&&<summary>Record or correct a localized symptom</summary>}<div className="space-y-3 pt-3">
  {!contextual&&<p>Self-reported observations, not a diagnosis. Blank severity and duration remain unknown. Laterality describes your body and is always chosen explicitly.</p>}
  {!contextual&&<details><summary>Choose a location on the body</summary><p>Tap a location, then choose the body side.</p><AnatomyRegionSelector initialLayer="locations" lockedLayer="locations" mode={mode} onSelect={selection=>{if(selection?.layer==='locations'&&selection.source==='unified-symptom-v1'&&selection.view&&symptomRegionChoices[selection.view].some(r=>r.id===selection.sourceTargetId))change({view:selection.view,regionId:selection.sourceTargetId!});}}/></details>}
  <form onSubmit={e=>{e.preventDefault();void save();}} className="grid gap-3">
   <fieldset disabled={pending} className="grid gap-3"><legend>{editing?'Correct observation':'New observation'}</legend>
    {contextual?<fieldset className="body-map-sensation"><legend>Sensation</legend>{localizedSymptomKinds.map(type=><button key={type} type="button" aria-pressed={draft.type===type} onClick={()=>change({type})}>{type}</button>)}</fieldset>:<label>Symptom <select className="bloom-input w-full" value={draft.type} onChange={e=>change({type:e.target.value as typeof draft.type})}>{localizedSymptomKinds.map(t=><option key={t}>{t}</option>)}</select></label>}


    <label>Severity (optional, 0–10) <input className="bloom-input w-full" type="number" min="0" max="10" step="1" value={draft.severity} onChange={e=>change({severity:e.target.value})}/></label>
    <details><summary>Movement response (optional)</summary><div className="space-y-3 pt-2">
     <p className="panel-note">Link only a movement you are reporting about. This does not establish cause or injury.</p>
     {draft.movement?<><p className="break-words"><strong>{draft.movement.label}</strong></p><label>How did this movement affect the symptom?<select ref={movementSelect} aria-label="Reported movement response" className="bloom-input w-full" value={draft.movement.response} onChange={e=>{if(draft.movement)change({movement:{...draft.movement,response:e.target.value as NonNullable<LocalizedSymptom['movement']>['response']}});}}><option value="unsure">Unsure</option><option value="better">Better</option><option value="unchanged">Unchanged</option><option value="worse">Worse</option></select></label>{draft.movement.response==='worse'&&<p className="panel-note">Worsening pauses progression suggestions for this movement; actual logging stays available.</p>}<div className="flex flex-wrap gap-2"><button type="button" className="text-link min-h-11" ref={movementChoice} onClick={()=>setChoosingMovement(true)}>Change movement</button><button type="button" className="text-link min-h-11" onClick={()=>{movementFocus.current='choose';change({movement:null});setChoosingMovement(false);}}>Remove movement link</button></div></>:<button type="button" className="text-link min-h-11" ref={movementChoice} onClick={()=>setChoosingMovement(true)}>Choose movement</button>}
     {choosingMovement&&<><ExerciseCataloguePicker selectionOnly onChoose={(choice,exercise)=>{movementFocus.current='response';change({movement:{exercise,label:choice.name,response:'unsure',confirmedByUser:true}});setChoosingMovement(false);}}/><button type="button" className="text-link min-h-11" onClick={()=>{movementFocus.current=draft.movement?'response':'choose';setChoosingMovement(false);}}>Cancel movement search</button></>}
    </div></details>
    <details open={!contextual}><summary>Add details</summary>
    <details open={!contextual}><summary>Change location</summary><label>View <select className="bloom-input w-full" value={draft.view} onChange={e=>{const view=e.target.value as 'front'|'back';change({view,regionId:symptomRegionChoices[view][0].id});}}><option value="front">Front</option><option value="back">Back</option></select></label>
    <label>Location <select className="bloom-input w-full" value={draft.regionId} onChange={e=>change({regionId:e.target.value})}>{symptomRegionChoices[draft.view].map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
    </details>    <details open={!contextual}><summary>Body side: {draft.laterality==='unspecified'?'Not specified':draft.laterality}</summary><label>Your body side <select className="bloom-input w-full" value={draft.laterality} onChange={e=>change({laterality:e.target.value as typeof draft.laterality})}>{localizedSymptomSides.map(s=><option key={s} value={s}>{s}</option>)}</select></label>

    </details>
    <label>Observed at (local time) <input className="bloom-input w-full" required type="datetime-local" value={draft.when} onChange={e=>change({when:e.target.value})}/></label><label>Onset (optional local time) <input className="bloom-input w-full" type="datetime-local" value={draft.onset} onChange={e=>change({onset:e.target.value})}/></label>

    <label>Duration in minutes (optional) <input className="bloom-input w-full" type="number" min="0" max="5256000" step="any" value={draft.duration} onChange={e=>change({duration:e.target.value})}/></label>
    <label>Ongoing? <select className="bloom-input w-full" value={draft.ongoing} onChange={e=>change({ongoing:e.target.value})}><option value="unknown">Not specified</option><option value="true">Yes</option><option value="false">No</option></select></label>
    <label>Notes (optional) <textarea className="bloom-input w-full" maxLength={2000} value={draft.notes} onChange={e=>change({notes:e.target.value})}/></label>
    </details>
   </fieldset>
   <button className="min-h-11 px-3" type="submit" disabled={pending||!context.data}>{pending?'Saving…':editing?'Save correction':'Save observation'}</button>
   {contextual&&editing&&<button className="min-h-11 px-3" type="button" disabled={pending} onClick={()=>{if(window.confirm('Delete this observation?'))void remove(editing.id);}}>Delete observation</button>}
   {editing&&!contextual&&<button className="min-h-11 px-3" type="button" disabled={pending} onClick={()=>{setEditing(null);attempt.current=null;setDraft(blank());setError('');}}>Cancel correction</button>}
  </form>
  {error&&<p role="alert">{error}</p>}<p role="status">{message}</p>
  {!contextual&&<details><summary>Saved observations</summary><button className="min-h-11 px-3" type="button" disabled={pending} onClick={()=>{void records.refetch();void context.refetch();}}>Refresh saved observations</button>
  {!saved?<p role="status">Checking saved observations…</p>:<ul>{saved.flatMap(row=>row.kind==='localized-symptom'?[<li key={row.id}>{row.payload.observedAt} · {row.payload.type} · {symptomRegionChoices[row.payload.location.view].find(r=>r.id===row.payload.location.regionId)?.label} · {row.payload.location.laterality} <button className="min-h-11 px-3" type="button" disabled={pending} onClick={()=>edit(row)}>Edit observation</button> <button className="min-h-11 px-3" type="button" disabled={pending} onClick={()=>void remove(row.id)}>Delete observation</button></li>]:[])}</ul>}
 </details>}</div></Container>;
}
