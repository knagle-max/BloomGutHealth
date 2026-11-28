import {useEffect,useRef,useState} from 'react';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError,queryClient} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {labSourcesKey} from '@/lib/lab-sources';
import {labManagedSourceSchema,type LabManagedSource} from '@shared/lab-report-metadata';
import {labReferenceCorrectionCommandSchema,type LabReferenceCorrectionCommand,type LabReferenceCorrectionView,type CopiedLabReference} from '@shared/lab-reference-correction';
import {markerDefinitions} from '@shared/precision-nutrition';
import {referenceIntervalText} from '@shared/lab-reference-interval';
import {Button} from './ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';

export default function LabReferenceCorrectionEditor({source,view,marker,result,sourceUnit,originalLow,originalHigh,onClose,onReturnFocus}:{source:LabManagedSource;view:LabReferenceCorrectionView;marker:string;result:number;sourceUnit:string;originalLow:number|null;originalHigh:number|null;onClose:()=>void;onReturnFocus:()=>void}){
 const {user}=useAuth(),[basis,setBasis]=useState(view),saved=basis.current?.limits;
 const [low,setLow]=useState(saved?.low==null?'':String(saved.low)),[high,setHigh]=useState(saved?.high==null?'':String(saved.high)),[lowOperator,setLowOperator]=useState<'>'|'>='>(saved?.lowOperator??'>='),[highOperator,setHighOperator]=useState<'<'|'<='>(saved?.highOperator??'<='),[unit,setUnit]=useState(saved?.unit??sourceUnit);
 const [context,setContext]=useState({laboratory:saved?.laboratory??'',reportIdentifier:saved?.reportIdentifier??'',population:saved?.population??'',specimen:saved?.specimen??'',assay:saved?.assay??'',method:saved?.method??''}),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[held,setHeld]=useState<{body:LabReferenceCorrectionCommand;receipt:string}|null>(null),[definite,setDefinite]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const active=useRef(true),busy=useRef(false);useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const stale=view.sourceRevision!==basis.sourceRevision||view.current?.revision!==basis.current?.revision,locked=pending||!!held;
 async function save(attempt:{body:LabReferenceCorrectionCommand;receipt:string}){
  if(!user||busy.current||!active.current)return;const owner=user.id,guard=accountContextGuard(owner);busy.current=true;setPending(true);setHeld(attempt);setDefinite(false);setError('');setNotice('');
  try{
   const response=labManagedSourceSchema.parse(await(await apiRequest('POST',`/api/precision/labs/sources/${source.id}/reference-range`,attempt.body,{'Idempotency-Key':attempt.receipt,'X-Bloom-Labs-Actor':owner})).json());guard();
   const current=response.referenceCorrections?.observations.find(row=>row.observationId===basis.observationId);
   if(response.id!==source.id||!current?.available||!current.current)throw Error('The range save could not be confirmed. Retry the same save.');
   await queryClient.cancelQueries({queryKey:labSourcesKey(owner)});guard();queryClient.setQueryData<LabManagedSource[]>(labSourcesKey(owner),old=>old?.map(row=>row.id===response.id?response:row));
   if(active.current){setHeld(null);setBasis(current);setConfirmed(false);setNotice(current.current.revision!==attempt.receipt?'That save was already recorded; a newer range annotation is current.':current.current.limits?'Laboratory range saved for this result. Original observations are unchanged.':'Correction removed. The original report range is used when available.');}
   await queryClient.invalidateQueries({queryKey:labSourcesKey(owner)});
  }catch(error){try{guard();if(active.current){const rejected=error instanceof ApiRequestError&&error.status===400;if(rejected)setHeld(null);setDefinite(error instanceof ApiRequestError&&error.status>=400&&error.status<500&&!rejected);setError(error instanceof Error?error.message:'The save could not be confirmed. Your draft is retained.');}}catch{/* Former-account drafts cannot be restored. */}}
  finally{busy.current=false;if(active.current)setPending(false);}
 }
 function submit(remove=false){
  if(locked||stale||!view.available||!confirmed)return;
  try{
   const number=(value:string)=>{if(!value.trim())return null;if(!/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim()))throw Error();return Number(value);};
   const limits:CopiedLabReference={low:number(low),high:number(high),lowOperator:low.trim()?lowOperator:null,highOperator:high.trim()?highOperator:null,unit,...context};
   const body=labReferenceCorrectionCommandSchema.parse({observationId:basis.observationId,sourceRevision:basis.sourceRevision,expectedCorrectionRevision:basis.current?.revision??null,limits:remove?null:limits,confirmedFromReport:true});
   void save({body,receipt:crypto.randomUUID()});
  }catch{setError('Copy at least one numeric bound, its operator and compatible unit. Leave missing bounds blank and keep the lower bound below the upper bound.');}
 }
 function loadLatest(){setBasis(view);const value=view.current?.limits;setLow(value?.low==null?'':String(value.low));setHigh(value?.high==null?'':String(value.high));setLowOperator(value?.lowOperator??'>=');setHighOperator(value?.highOperator??'<=');setUnit(value?.unit??sourceUnit);setContext({laboratory:value?.laboratory??'',reportIdentifier:value?.reportIdentifier??'',population:value?.population??'',specimen:value?.specimen??'',assay:value?.assay??'',method:value?.method??''});setHeld(null);setDefinite(false);setError('');setConfirmed(false);}
 return <Dialog open onOpenChange={open=>!open&&!pending&&onClose()}><DialogContent onCloseAutoFocus={event=>{event.preventDefault();onReturnFocus();}} className="max-h-[90dvh] overflow-y-auto min-w-0 grid-cols-[minmax(0,1fr)] [&>*]:min-w-0 [&_button]:min-h-11 [&_button]:max-w-full [&_button]:whitespace-normal [&_input]:min-h-11 [&_select]:min-h-11 [overflow-wrap:anywhere]">
  <DialogTitle>Use my laboratory’s range</DialogTitle><DialogDescription>Copy the interval printed for this result. It applies only to this observation; other results and imported source records stay unchanged.</DialogDescription>
  <p>Measured result: <strong>{result} {sourceUnit}</strong>. Original interval: {referenceIntervalText(originalLow,originalHigh,sourceUnit)}.</p>
  {basis.current&&!basis.sourceCurrent&&<p role="status">The source changed after this correction. It is not applied until checked against the current source and saved again.</p>}
  <form onSubmit={event=>{event.preventDefault();submit();}}><fieldset disabled={locked||stale||!view.available} className="space-y-3">
   <label className="block">Lower bound (blank if absent)<input className="bloom-input w-full" inputMode="decimal" value={low} onChange={e=>{setLow(e.target.value);setConfirmed(false);}}/></label>
   <label className="block">Lower bound operator<select aria-label="Lower bound operator" className="bloom-input w-full" value={lowOperator} onChange={e=>{setLowOperator(e.target.value as typeof lowOperator);setConfirmed(false);}}><option value=">">Greater than (&gt;)</option><option value=">=">At least (≥)</option></select></label>
   <label className="block">Upper bound (blank if absent)<input className="bloom-input w-full" inputMode="decimal" value={high} onChange={e=>{setHigh(e.target.value);setConfirmed(false);}}/></label>
   <label className="block">Upper bound operator<select aria-label="Upper bound operator" className="bloom-input w-full" value={highOperator} onChange={e=>{setHighOperator(e.target.value as typeof highOperator);setConfirmed(false);}}><option value="<">Less than (&lt;)</option><option value="<=">At most (≤)</option></select></label>
   <label className="block">Reference unit<select aria-label="Reference unit" className="bloom-input w-full" value={unit} onChange={e=>{setUnit(e.target.value);setConfirmed(false);}}>{markerDefinitions.find(row=>row.id===marker)?.units.map(value=><option key={value}>{value}</option>)}</select></label>
   <details><summary className="min-h-11">Report details (optional)</summary><p className="panel-note">Copy only details supplied on this report. Unknown details stay blank; these annotations do not change the saved assay identity.</p>{([['laboratory','Laboratory on report',160],['reportIdentifier','Report identifier',160],['population','Reference population / age / sex category',300],['specimen','Specimen',100],['assay','Assay',200],['method','Method',200]]as const).map(([key,label,max])=><label className="block" key={key}>{label}<input className="bloom-input w-full" maxLength={max} value={context[key]} onChange={e=>{setContext(old=>({...old,[key]:e.target.value}));setConfirmed(false);}}/></label>)}</details>
   <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I checked this result’s reference range against the original report.</label>
   <Button type="submit" disabled={!confirmed}>Save laboratory range</Button>{basis.current?.limits&&<Button type="button" variant="outline" disabled={!confirmed} onClick={()=>submit(true)}>Remove this correction</Button>}
  </fieldset></form>
  {(stale||definite)&&!pending&&<><p role="alert">The source or saved annotation changed. Your draft is retained. Load the latest values before saving another change.</p><Button variant="outline" onClick={loadLatest}>Load latest saved range (replaces draft)</Button></>}
  {held&&!pending&&!definite&&<Button onClick={()=>void save(held)}>Retry same range save</Button>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {basis.current&&<details><summary className="min-h-11">Range correction history ({basis.historyCount} earlier versions)</summary>{[basis.current,...basis.history].map(row=><p key={row.revision}>{row.recordedAt}: {row.limits?referenceIntervalText(row.limits.low,row.limits.high,row.limits.unit,{lowInclusive:row.limits.lowOperator==='>=',highInclusive:row.limits.highOperator==='<='}):'Correction removed'}.</p>)}{basis.historyCount>basis.history.length&&<p>Showing the latest {basis.history.length} earlier versions. Complete owned history remains in account export.</p>}</details>}
  <p className="panel-note">This is a user-confirmed laboratory correction, not a treatment target or diagnosis. Imported flags remain source-original; conflicting source information needs review.</p>
  <Button variant="ghost" disabled={pending} onClick={onClose}>Close range editor</Button>
 </DialogContent></Dialog>;
}
