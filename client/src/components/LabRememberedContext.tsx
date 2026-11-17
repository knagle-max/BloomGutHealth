import {useEffect,useId,useRef,useState} from 'react';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {LAB_CONTEXT_CHANGED,notifyLabContextChanged} from '@/lib/lab-context-events';
import {labReviewRevision,labReviewRevisionText} from '@shared/lab-source-review';
import {labResponseQuestions,labResponseQuestionText,labResponseContextSaveSchema,type LabResponseQuestionId,type LabResponseContextView,type LabResponseContextSave,type LabResponseContextDelete,type RecalledLabResponseContext} from '@shared/lab-response-context';
import type {Lab} from '@shared/precision-nutrition';

type Family=keyof typeof labResponseQuestions;
type Draft={answer:RecalledLabResponseContext['answer']|'';precision:'unknown'|'day'|'range';from:string;to:string;notes:string};
const blank=():Draft=>({answer:'',precision:'unknown',from:'',to:'',notes:''});
const remembered=(value:RecalledLabResponseContext):Draft=>({answer:value.answer,precision:value.eventWindow?.precision||'unknown',from:value.eventWindow?.from||'',to:value.eventWindow?.to||'',notes:value.notes});
type State={key:string;expanded:boolean;form:boolean;view:LabResponseContextView|null;draft:Draft;draftQuestion:LabResponseQuestionId|null;pending:string|null;error:string;status:string;confirmDelete:boolean};
/** Source-linked recollections remain separate from source laboratory facts
 * and never establish performed behavior or an individual cause. */
export default function LabRememberedContext({family,sources}:{family:Family;sources:Array<Lab&{id:string}>}){
 const {user}=useAuth(),id=useId(),heading=useRef<HTMLHeadingElement>(null),opener=useRef<HTMLButtonElement>(null),answerInput=useRef<HTMLSelectElement>(null);
 const key=JSON.stringify([user?.id,family,sources.map(source=>[source.id,labReviewRevisionText(source)])]);
 const currentKey=useRef(key);currentKey.current=key;
 const initial=():State=>({key,expanded:false,form:false,view:null,draft:blank(),draftQuestion:null,pending:null,error:'',status:'',confirmDelete:false});
 const[state,setState]=useState<State>(initial),active=state.key===key?state:initial(),serial=useRef(0),controller=useRef<AbortController|null>(null);
 const attempt=useRef<{key:string;command:LabResponseContextSave}|null>(null),deletion=useRef<{key:string;command:LabResponseContextDelete}|null>(null);
 const changedDuringRequest=useRef(false),focusWhenReady=useRef<'answer'|'heading'|null>(null);
 useEffect(()=>()=>{serial.current++;controller.current?.abort();},[]);
 const patch=(value:Partial<State>)=>setState(previous=>({...(previous.key===key?previous:initial()),...value}));
 const selection={family,sourceIds:sources.map(source=>source.id)},path='/api/experience/lab-response-context';
 const run=async(stage:string,work:(request:(method:string,suffix:string,body:unknown,headers?:Record<string,string>)=>Promise<any>,assertCurrent:()=>void)=>Promise<void>)=>{
  const ticket=++serial.current;changedDuringRequest.current=false;controller.current?.abort();const abort=new AbortController();controller.current=abort;patch({expanded:true,pending:stage,error:''});
  const same=()=>currentKey.current===key&&serial.current===ticket;
  try{
   const actor=accountContextGuard(user?.id),assertCurrent=()=>{actor();if(!same())throw Error('Context changed');};assertCurrent();
   const request=async(method:string,suffix:string,body:unknown,headers?:Record<string,string>)=>{assertCurrent();const response=await apiRequest(method,path+suffix,body,{'X-Bloom-Lab-Question-Protocol':'1',...headers},abort.signal);const data=response.status===204?null:await response.json();assertCurrent();return data;};
   await work(request,assertCurrent);if(same())patch({pending:null,...(changedDuringRequest.current?{view:null,error:'Saved context changed elsewhere. Reload and review it before saving.'}:{})});
  }catch(error){if(same())patch({pending:null,error:error instanceof ApiRequestError?error.message:'Context could not be confirmed. Your draft is retained.',...(stage==='loading'||error instanceof ApiRequestError&&[404,409].includes(error.status)?{view:null}:{})});}
 };
 const load=()=>run('loading',async request=>{const view=await request('POST','/view',selection);attempt.current=null;focusWhenReady.current='heading';patch({view,status:'Saved context loaded.'});});
 const begin=()=>run('preparing',async(request,assertCurrent)=>{
  const sourceReferences=await Promise.all(sources.map(async source=>({id:source.id,revision:await labReviewRevision(source)})));assertCurrent();
  const view:LabResponseContextView=await request('POST','/prepare',{family,sourceReferences});attempt.current=null;
  const target=view.questionId??labResponseQuestions[family].id;
  focusWhenReady.current='answer';patch({view,form:true,draftQuestion:target,confirmDelete:false,status:'',draft:active.form&&active.draftQuestion===target?active.draft:view.latest?.sourceCurrent&&view.latest.record.payload.question===target?remembered(view.latest.record.payload):blank()});
 });
 const edit=(value:Partial<Draft>)=>{attempt.current=null;patch({draft:{...active.draft,...value},error:'',status:''});};
 const save=()=>{
  if(active.draftQuestion!==(active.view?.questionId??labResponseQuestions[family].id)){patch({error:'The question changed. Review it before saving this answer.'});return;}
  if(!active.draft.answer){patch({error:'Choose an answer before saving.'});answerInput.current?.focus();return;}
  if(!active.view?.generationId){patch({error:'Review the current sources before saving this draft.'});return;}
  void run('saving',async(request,assertCurrent)=>{
   let command=attempt.current?.key===key?attempt.current.command:null;
   if(!command){
    const sourceReferences=await Promise.all(sources.map(async source=>({id:source.id,revision:await labReviewRevision(source)})));assertCurrent();
    const draft=active.draft,yes=draft.answer==='yes',eventWindow=yes&&draft.precision!=='unknown'?{from:draft.from,to:draft.precision==='day'?draft.from:draft.to,precision:draft.precision}:null;
    const parsed=labResponseContextSaveSchema.safeParse({family,sourceReferences,expectedQuestion:active.draftQuestion,intentId:crypto.randomUUID(),generationId:active.view!.generationId,expectedCurrentId:active.view!.latest?.record.id||null,answer:draft.answer,eventWindow,datePrecision:yes?draft.precision:'not-applicable',notes:draft.answer==='prefer-not-answer'?'':draft.notes});
    if(!parsed.success){patch({error:'Review the remembered day or date range before saving.'});return;}
    command=parsed.data;attempt.current={key,command};
   }
   const saved=await request('POST','/save',command),view:LabResponseContextView=await request('POST','/view',selection);attempt.current=null;
   focusWhenReady.current='heading';patch({view,form:false,status:saved.isLatest&&view.latest?.sourceCurrent&&view.latest.record.id===saved.record.id&&view.latest.record.payload.question===(view.questionId??labResponseQuestions[family].id)?'Remembered context saved. It does not establish what caused a result.':'Your answer was recorded. Review the latest source and context before using it.'});
   notifyLabContextChanged(id,view.scopeHash);
  });
 };
 const remove=()=>run('deleting',async request=>{
  if(!active.view?.generationId)return;
  const command=deletion.current?.key===key?deletion.current.command:{...selection,intentId:crypto.randomUUID(),generationId:active.view.generationId,expectedHistoryRevision:active.view.historyRevision};deletion.current={key,command};
  await request('DELETE','',command,{'X-Bloom-Confirm':'delete-lab-response-context-history'});const view:LabResponseContextView=await request('POST','/view',selection);deletion.current=null;attempt.current=null;
  focusWhenReady.current='heading';patch({view,form:false,draft:blank(),draftQuestion:null,confirmDelete:false,status:view.historyCount?'Earlier answers were deleted. Newer answers remain.':'Remembered answers deleted.'});
  notifyLabContextChanged(id,view.scopeHash);
 });
 // Focus only after React commits the enabled control. A frame scheduled
 // during preparation can run while the new select is still disabled.
 useEffect(()=>{
  if(!active.expanded||active.pending||state.key!==key||!focusWhenReady.current)return;
  const target=focusWhenReady.current==='answer'?answerInput.current:heading.current;
  if(!target||!target.isConnected||'disabled'in target&&target.disabled||!target.getClientRects().length)return;
  target.focus();if(document.activeElement===target)focusWhenReady.current=null;
 },[key,active.expanded,active.pending,active.form,active.view?.historyRevision]);
 useEffect(()=>{
  const changed=(event:Event)=>{const detail=(event as CustomEvent).detail;if(!active.expanded||detail?.origin===id||active.view&&detail?.scopeHash!==active.view.scopeHash)return;if(active.pending){changedDuringRequest.current=true;return;}if(active.form){attempt.current=null;patch({view:null,error:'Saved context changed elsewhere. Your draft is retained; reload and review before saving.'});}else void load();};
  window.addEventListener(LAB_CONTEXT_CHANGED,changed);return()=>window.removeEventListener(LAB_CONTEXT_CHANGED,changed);
 },[key,active.expanded,active.form,active.pending,active.view?.scopeHash]);
 const latest=active.view?.latest,record=latest?.record.payload,busy=active.pending!==null,questionId=active.form&&active.draftQuestion?active.draftQuestion:active.view?.questionId??labResponseQuestions[family].id;
 const questionChanged=active.form&&active.draftQuestion!==(active.view?.questionId??labResponseQuestions[family].id);
 if(!user||!sources.length)return null;
 return <section className="lab-remembered-context" aria-label="Remembered context">
  <button ref={opener} type="button" className="text-link inline-flex min-h-11 items-center" aria-expanded={active.expanded} aria-controls={id} onClick={()=>{if(active.expanded){serial.current++;controller.current?.abort();patch({expanded:false,pending:null});opener.current?.focus();}else void load();}}>Review remembered context</button>
  {active.expanded&&<div id={id}>
   <h4 ref={heading} tabIndex={-1}>Added from memory</h4>
   <p>{labResponseQuestionText[questionId]}</p>
   <p className="panel-note">Remembered dates and the date you add an answer are kept separately. An answer does not change the original report or confirm a cause.</p>
   {active.pending&&<p role="status">{active.pending==='saving'?'Saving remembered context…':active.pending==='deleting'?'Deleting remembered answers…':'Loading source context…'}</p>}
   {active.error&&<p role="alert">{active.error}</p>}
   {active.status&&<p role="status">{active.status}</p>}
   {!active.pending&&!active.error&&record&&<div>
    <p><strong>{!latest!.sourceCurrent?'Source changed · recollection needs review':record.question===questionId?'Saved recollection':'Question changed · recollection needs review'}</strong></p>
    {record.question!==questionId&&<p>Saved question: {labResponseQuestionText[record.question]}</p>}
    <p>Answer: {{yes:'Yes',no:'No',unknown:'Unknown','not-tracked':'Not tracked','prefer-not-answer':'Prefer not to answer'}[record.answer]}</p>
    <p>Remembered event date: {record.eventWindow?record.eventWindow.from+(record.eventWindow.to!==record.eventWindow.from?' to '+record.eventWindow.to:''):record.datePrecision==='unknown'?'Unknown':'Not applicable'}</p>
    <p>Added from memory on {record.recordedAt.slice(0,10)}.</p>
    <p className="panel-note">Review dates: {record.reviewWindow.from?record.reviewWindow.from+' to ':''}{record.reviewWindow.to}. {record.reviewWindow.basis==='source-date'?'Dates recorded with the source.':'Collection dates are not confirmed; stored or mixed source dates are retained.'}</p>
    {record.notes&&<p className="whitespace-pre-wrap break-words">{record.notes}</p>}
   </div>}
   <div className="flex flex-wrap gap-3">
    <button type="button" className="text-link inline-flex min-h-11 items-center" disabled={busy} onClick={()=>void load()}>Reload saved context</button>
    {!active.form&&<button type="button" className="hero-button min-h-11" disabled={busy||!active.view} onClick={()=>void begin()}>{record?'Review or update answer':'Add an answer'}</button>}
   </div>
   {active.form&&<form className="space-y-3" onSubmit={event=>{event.preventDefault();save();}}>
    <label className="block">Your answer<select aria-label="Your answer" ref={answerInput} className="bloom-input w-full min-h-11" value={active.draft.answer} disabled={busy} onChange={event=>{const answer=event.target.value as Draft['answer'];edit({answer,...(answer!=='yes'?{precision:'unknown',from:'',to:''}:{}),...(answer==='prefer-not-answer'?{notes:''}:{})});}}><option value="">Choose an answer</option><option value="yes">Yes</option><option value="no">No</option><option value="unknown">Unknown</option><option value="not-tracked">Not tracked</option><option value="prefer-not-answer">Prefer not to answer</option></select></label>
    {active.draft.answer==='yes'&&<>
     <label className="block">Remembered date precision<select aria-label="Remembered date precision" className="bloom-input w-full min-h-11" value={active.draft.precision} disabled={busy} onChange={event=>edit({precision:event.target.value as Draft['precision']})}><option value="unknown">Date not remembered</option><option value="day">A specific day</option><option value="range">A date range</option></select></label>
     {active.draft.precision!=='unknown'&&<label className="block">{active.draft.precision==='day'?'Remembered day':'Earliest remembered day'}<input type="date" className="bloom-input w-full min-h-11" value={active.draft.from} disabled={busy} onChange={event=>edit({from:event.target.value})}/></label>}
     {active.draft.precision==='range'&&<label className="block">Latest remembered day<input type="date" className="bloom-input w-full min-h-11" value={active.draft.to} disabled={busy} onChange={event=>edit({to:event.target.value})}/></label>}
    </>}
    {active.draft.answer!=='prefer-not-answer'&&<label className="block">Optional context<textarea aria-label="Optional context" className="bloom-input w-full" maxLength={1000} value={active.draft.notes} disabled={busy} onChange={event=>edit({notes:event.target.value})}/></label>}
    {(!active.view?.generationId||questionChanged)&&<button type="button" className="text-link min-h-11" disabled={busy} onClick={()=>void begin()}>Review sources for this draft</button>}
    <button type="submit" className="hero-button min-h-11" disabled={busy||!active.view?.generationId||questionChanged}>Save remembered context</button>
   </form>}
   {active.view&&active.view.historyCount>0&&!active.confirmDelete&&<button type="button" className="text-link inline-flex min-h-11 items-center" disabled={busy} onClick={()=>{deletion.current=null;patch({confirmDelete:true});}}>Delete remembered answers</button>}
   {active.confirmDelete&&<div role="group" aria-label="Confirm remembered context deletion"><p>Delete all {active.view?.historyCount} remembered answers for these source results?</p><div className="flex flex-wrap gap-3"><button type="button" className="hero-button min-h-11" disabled={busy} onClick={()=>void remove()}>Delete answers</button><button type="button" className="text-link min-h-11" disabled={busy} onClick={()=>{deletion.current=null;patch({confirmDelete:false});}}>Keep answers</button></div></div>}
  </div>}
 </section>;
}
