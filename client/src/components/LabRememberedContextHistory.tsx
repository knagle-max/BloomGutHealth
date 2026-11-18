import {LAB_RESPONSE_CONTEXT_PROTOCOL} from '@shared/lab-response-context';
import {useEffect,useId,useRef,useState} from 'react';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {LAB_CONTEXT_CHANGED,notifyLabContextChanged} from '@/lib/lab-context-events';
import {labResponseQuestionText,type LabResponseContextHistory,type LabResponseContextDelete} from '@shared/lab-response-context';

/** Privacy controls remain discoverable when a source correction or deletion
 * removes the corresponding marker from the current panel. */
export default function LabRememberedContextHistory({sourceKey}:{sourceKey:string}){
 const{user}=useAuth(),id=useId(),key=JSON.stringify([user?.id,sourceKey]),current=useRef(key);current.current=key;
 const blank=()=>({key,open:false,rows:[] as LabResponseContextHistory,pending:false,error:'',status:'',confirm:null as string|null});
 const[state,setState]=useState(blank),active=state.key===key?state:blank(),serial=useRef(0),abort=useRef<AbortController|null>(null),dirty=useRef(false);
 const deletion=useRef<{key:string;scope:string;command:LabResponseContextDelete}|null>(null);
 const patch=(value:Partial<ReturnType<typeof blank>>)=>setState(old=>({...(old.key===key?old:blank()),...value}));
 useEffect(()=>()=>{serial.current++;abort.current?.abort();},[]);
 const run=async(work:(request:(method:string,path:string,body:unknown,headers?:Record<string,string>)=>Promise<any>)=>Promise<void>)=>{
  const ticket=++serial.current;dirty.current=false;abort.current?.abort();const controller=new AbortController();abort.current=controller;patch({open:true,pending:true,error:''});
  const same=()=>current.current===key&&serial.current===ticket;
  try{const actor=accountContextGuard(user?.id),request=async(method:string,path:string,body:unknown,headers?:Record<string,string>)=>{actor();if(!same())throw Error('Context changed');const response=await apiRequest(method,'/api/experience/lab-response-context'+path,body,{'X-Bloom-Lab-Question-Protocol':LAB_RESPONSE_CONTEXT_PROTOCOL,...headers},controller.signal);const value=response.status===204?null:await response.json();actor();if(!same())throw Error('Context changed');return value;};await work(request);if(same())patch({pending:false,...(dirty.current?{rows:[],error:'Remembered context changed. Reload the history.'}:{})});}
  catch(error){if(same())patch({pending:false,rows:[],error:error instanceof ApiRequestError?error.message:'History could not be confirmed. Reload before using it.'});}
 };
 const load=()=>run(async request=>{const rows=await request('POST','/history',{});patch({rows,status:'',confirm:null});});
 const remove=(entry:LabResponseContextHistory[number])=>run(async request=>{
  if(!entry.view.generationId)return;const command=deletion.current?.key===key&&deletion.current.scope===entry.view.scopeHash?deletion.current.command:{...entry.selection,intentId:crypto.randomUUID(),generationId:entry.view.generationId,expectedHistoryRevision:entry.view.historyRevision};deletion.current={key,scope:entry.view.scopeHash,command};
  await request('DELETE','',command,{'X-Bloom-Confirm':'delete-lab-response-context-history'});const rows=await request('POST','/history',{});deletion.current=null;patch({rows,confirm:null,status:'The selected remembered answers were deleted.'});notifyLabContextChanged(id,entry.view.scopeHash);
 });
 useEffect(()=>{const changed=(event:Event)=>{if(!active.open||(event as CustomEvent).detail?.origin===id)return;if(active.pending)dirty.current=true;else void load();};window.addEventListener(LAB_CONTEXT_CHANGED,changed);return()=>window.removeEventListener(LAB_CONTEXT_CHANGED,changed);},[key,active.open,active.pending]);
 if(!user)return null;
 return <section className="bloom-panel lab-panel-review" aria-label="Remembered context history">
  <button type="button" className="text-link inline-flex min-h-11 items-center" aria-expanded={active.open} aria-controls={id} onClick={()=>{if(active.open){serial.current++;abort.current?.abort();patch({open:false,pending:false});}else void load();}}>Manage remembered lab context</button>
  {active.open&&<div id={id}>
   <p className="panel-note">Answers added from memory remain available here when lab results are corrected or removed. Review or delete their history separately from the original reports.</p>
   {active.pending&&<p role="status">Loading remembered context…</p>}{active.error&&<p role="alert">{active.error}</p>}{active.status&&<p role="status">{active.status}</p>}
   <button type="button" className="text-link inline-flex min-h-11 items-center" disabled={active.pending} onClick={()=>void load()}>Reload remembered history</button>
   {!active.pending&&!active.error&&!active.rows.length&&<p>No remembered lab answers are saved.</p>}
   {!active.pending&&!active.error&&active.rows.map(entry=>{const record=entry.view.latest?.record.payload;if(!record)return null;return <article key={entry.view.scopeHash} className="lab-panel-review-observation">
    <h3>{labResponseQuestionText[record.question]}</h3>
    <p>{entry.view.latest!.sourceCurrent?'Linked lab records are unchanged.':'Source changed or removed · this recollection needs review.'}</p>
    <p>Review dates: {record.reviewWindow.from?record.reviewWindow.from+' to ':''}{record.reviewWindow.to} · {entry.view.historyCount} remembered {entry.view.historyCount===1?'answer':'answers'}</p>
    <p>Latest answer: {{yes:'Yes',no:'No',unknown:'Unknown','not-tracked':'Not tracked','prefer-not-answer':'Prefer not to answer'}[record.answer]} · added from memory on {record.recordedAt.slice(0,10)}</p>
    {record.eventWindow&&<p>Remembered date: {record.eventWindow.from}{record.eventWindow.to!==record.eventWindow.from?' to '+record.eventWindow.to:''}</p>}
    {record.notes&&<p className="whitespace-pre-wrap break-words">{record.notes}</p>}
    {active.confirm!==entry.view.scopeHash?<button type="button" className="text-link inline-flex min-h-11 items-center" disabled={active.pending} onClick={()=>{deletion.current=null;patch({confirm:entry.view.scopeHash});}}>Delete this answer history</button>:<div role="group" aria-label="Confirm selected context history deletion"><p>Delete all {entry.view.historyCount} remembered answers for this review?</p><button type="button" className="hero-button min-h-11" disabled={active.pending} onClick={()=>void remove(entry)}>Delete selected answers</button><button type="button" className="text-link min-h-11" disabled={active.pending} onClick={()=>{deletion.current=null;patch({confirm:null});}}>Keep answers</button></div>}
   </article>;})}
  </div>}
 </section>;
}
