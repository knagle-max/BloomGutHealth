import {useEffect,useId,useRef,useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {invalidatePlanningInputs} from '@/lib/planning-cache';
import {markerDefinitions} from '@shared/precision-nutrition';
import {exactLabSourceNumber,labReviewRevision,labSourceReviewSchema,type LabSourceReview} from '@shared/lab-source-review';
import {parseSourceReference} from '@shared/lab-source-reference';
import type {AnyLabHistoryRow} from '@shared/lab-history';
import {Button} from './ui/button';
import {AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter} from './ui/alert-dialog';
export default function LabSourceReviewDialog({source,onClose}:{source:AnyLabHistoryRow;onClose:()=>void}){
 const {user}=useAuth(),actor=useRef(user?.id),currentActor=useRef(user?.id),active=useRef(true),receipt=useRef(crypto.randomUUID()),id=useId();currentActor.current=user?.id;
 const raw='sourceOnly'in source,initialBounds=raw?parseSourceReference(source.reportedReferenceInterval||''):{low:source.referenceLow,high:source.referenceHigh};
 const [marker,setMarker]=useState(raw||source.marker==='bilirubin'?'':source.marker),[unit,setUnit]=useState(raw?'':source.unit),[low,setLow]=useState(initialBounds?.low?.toString()??''),[high,setHigh]=useState(initialBounds?.high?.toString()??''),[method,setMethod]=useState(source.method),[reason,setReason]=useState(''),[reviewed,setReviewed]=useState(false),[revision,setRevision]=useState(''),[revisionError,setRevisionError]=useState(false),[frozen,setFrozen]=useState<{input:LabSourceReview;key:string}|null>(null);
 useEffect(()=>{active.current=true;labReviewRevision(source).then(value=>{if(active.current)setRevision(value);}).catch(()=>{if(active.current)setRevisionError(true);});return()=>{active.current=false;};},[source]);
 const owns=!!user&&actor.current===user.id,definition=markerDefinitions.find(item=>item.id===marker),value=exactLabSourceNumber(source);
 const request=labSourceReviewSchema.safeParse({expectedRevision:revision,marker,unit,referenceLow:low.trim()?Number(low):null,referenceHigh:high.trim()?Number(high):null,method,reason,reviewed});
 const unchanged=!raw&&marker===source.marker&&unit===source.unit&&method===source.method&&(low.trim()?Number(low):null)===source.referenceLow&&(high.trim()?Number(high):null)===source.referenceHigh&&source.unitReview?.status!=='pending';
 const save=useMutation({mutationFn:async(command:{input:LabSourceReview;key:string})=>{
  if(!active.current||!actor.current||actor.current!==currentActor.current)throw Error('Your account changed. Reopen the result in your current account.');
  return apiRequest('POST',`/api/precision/labs/${encodeURIComponent(source.id)}/review-source`,command.input,{'Idempotency-Key':command.key,'X-Bloom-Confirm':'review-lab-source'});
 },onSuccess:async()=>{if(active.current&&actor.current===currentActor.current){await invalidatePlanningInputs();if(active.current&&actor.current===currentActor.current)onClose();}},onError:async()=>{if(active.current&&actor.current===currentActor.current)await invalidatePlanningInputs();}});
 const locked=!!frozen||!owns,knownFailure=save.isError&&save.error instanceof ApiRequestError&&[400,401,403,404,409].includes(save.error.status),changed=()=>{setReviewed(false);save.reset();};
 return <AlertDialog open onOpenChange={open=>{if(!open&&!save.isPending)onClose();}}><AlertDialogContent className="max-h-[90dvh] overflow-y-auto min-w-0 grid-cols-[minmax(0,1fr)] [&>*]:min-w-0 [&_input]:min-w-0 [&_select]:min-w-0 [&_textarea]:min-w-0 [&_button]:whitespace-normal [&_button]:min-h-11 [overflow-wrap:anywhere]">
 <AlertDialogHeader><AlertDialogTitle>Review marker & reference range</AlertDialogTitle><AlertDialogDescription>Check the original report to identify this result and its unit. Add only the reference limits supplied by that report. The original entry and numeric value are retained; current recommendations reload and source-linked saved plans are cleared.</AlertDialogDescription></AlertDialogHeader>
 <p>Original result: {raw?source.reportedAnalyte:markerDefinitions.find(item=>item.id===source.marker)?.name} · {raw?source.reportedValue:source.value} {raw?source.reportedUnit??'(unit not supplied)':source.unit}</p>
 <p className="panel-note whitespace-pre-wrap">Original report row: {source.sourceInput?.text??'Not recorded'}</p>
 {value===null?<p role="alert">This source does not contain an exact numeric result. Thresholds and qualitative findings remain available as source-only records.</p>:<p>Recorded number: {value} (preserved)</p>}
 <label className="block" htmlFor={id+'-marker'}>Reported marker</label><select id={id+'-marker'} className="clinical-input w-full" value={marker} disabled={locked} onChange={event=>{setMarker(event.target.value);setUnit('');changed();}}><option value="">Choose the identity shown on the report</option>{markerDefinitions.filter(item=>item.id!=='bilirubin').map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
 <label className="block" htmlFor={id+'-unit'}>Reported unit</label><select id={id+'-unit'} className="clinical-input w-full" value={unit} disabled={locked||!definition} onChange={event=>{setUnit(event.target.value);changed();}}><option value="">Choose the unit shown on the report</option>{definition?.units.map(value=><option key={value} value={value}>{value}</option>)}</select>
 <p className="panel-note">Percentages and absolute cell counts are different measurements. Changing the unit preserves the number; it does not convert it. Reference limits must use the selected source unit.</p>
 <div className="grid gap-3 sm:grid-cols-2"><label className="block">Report lower limit (optional)<input type="number" min="0" step="any" className="clinical-input w-full" value={low} disabled={locked} onChange={event=>{setLow(event.target.value);changed();}}/></label><label className="block">Report upper limit (optional)<input type="number" min="0" step="any" className="clinical-input w-full" value={high} disabled={locked} onChange={event=>{setHigh(event.target.value);changed();}}/></label></div>
 <p className="panel-note">Leave absent limits empty. A report reference interval is not a personal treatment target.</p>
 <label className="block">Reported method / assay<input className="clinical-input w-full" maxLength={200} value={method} disabled={locked} onChange={event=>{setMethod(event.target.value);changed();}}/></label>
 <div><label className="block" htmlFor={id+'-reason'}>Review reason</label><textarea id={id+'-reason'} className="clinical-input w-full" maxLength={300} value={reason} disabled={locked} onChange={event=>{setReason(event.target.value);changed();}}/></div>
 <label className="block"><input type="checkbox" checked={reviewed} disabled={locked} onChange={event=>setReviewed(event.target.checked)}/> I checked the marker, number, unit and reference limits against the original report.</label>
 {reviewed&&!request.success&&revision&&<p role="alert">{request.error.issues[0]?.message}</p>}
 {unchanged&&<p className="panel-note">Choose a changed source detail before saving a review.</p>}
 {revisionError&&<p role="alert">This source could not be prepared for review. Cancel and reopen the current result.</p>}
 {!owns&&<p role="alert">Your account changed. Cancel and reopen this result.</p>}
 {save.isError&&<p role="alert">{save.error.message} If the response was lost, retry the same review. If the source changed, cancel and reopen the current result.</p>}
 <AlertDialogFooter><Button variant="outline" disabled={save.isPending} onClick={onClose}>Cancel</Button><Button disabled={!owns||save.isPending||knownFailure||value===null||revisionError||(!frozen&&(!request.success||unchanged))} onClick={()=>{const command=frozen||(request.success?{input:request.data,key:receipt.current}:null);if(command){setFrozen(command);save.mutate(command);}}}>{save.isPending?'Saving…':frozen?'Retry source review':'Save reviewed result'}</Button></AlertDialogFooter>
 </AlertDialogContent></AlertDialog>;
}
