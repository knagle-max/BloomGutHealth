import {useEffect,useRef,useState,useId} from 'react';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {refreshExperience} from '@/lib/experience';
import {Button} from '@/components/ui/button';
import {checkinFeedbackViewSchema,focusFeedbackResponses,type CheckinFeedbackView,type FocusFeedbackRequest,type ExperienceRecord} from '@shared/experience';
const labels:Record<typeof focusFeedbackResponses[number],string>={liked:'Liked it',disliked:'Disliked it',intolerant:'Could not tolerate it','not-applicable':'Not applicable',helped:'It seemed to help','no-benefit':'No benefit noticed'};
type Attempt={body:FocusFeedbackRequest;key:string};
function parseView(input:unknown){const result=checkinFeedbackViewSchema.safeParse(input);if(!result.success)throw Error('The saved focus response could not be verified. Please retry.');return result.data;}
function Editor({id,actor,opened}:{id:string;actor:string;opened:boolean}){
 const[source,setSource]=useState<CheckinFeedbackView|null>(null),[loading,setLoading]=useState(true),[pending,setPending]=useState(false),[choice,setChoice]=useState(''),[attempt,setAttempt]=useState<Attempt|null>(null),[definite,setDefinite]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const choiceId=useId();
 const active=useRef(true),epoch=useRef(0),heading=useRef<HTMLHeadingElement>(null),busy=useRef(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false;epoch.current++;};},[id,actor]);
 // Opening rechecks an untouched source. Drafts and uncertain attempts keep their
 // reviewed basis; the server revision check prevents silent retargeting.
 useEffect(()=>{if(opened&&!busy.current&&!attempt&&!choice)void load(false);},[opened,id,actor]);
 async function load(reset:boolean){
  const current=++epoch.current;setLoading(true);setError('');
  try{const value=parseView(await(await apiRequest('GET',`/api/experience/checkins/${id}/feedback`)).json());
   if(!active.current||epoch.current!==current)return;
   if(value.source?.id!==id||!/^[a-f0-9]{64}$/.test(value.revision))throw Error('The current focus could not be verified.');
   setSource(value);if(reset){setAttempt(null);setDefinite(false);setChoice('');}heading.current?.focus();
  }catch(e){if(active.current&&epoch.current===current){setSource(null);setError((e as Error).message);}}
  finally{if(active.current&&epoch.current===current)setLoading(false);}
 }
 async function save(next:Attempt){
  if(busy.current||loading)return;busy.current=true;setPending(true);setAttempt(next);setError('');setMessage('');
  try{
   const receipt=parseView(await(await apiRequest('POST',`/api/experience/checkins/${id}/feedback`,next.body,{'Idempotency-Key':next.key})).json());
   const target=next.body.response===null?source?.feedback:source?.source;
   if(!target||receipt.source.id!==id||receipt.feedback?.response!==next.body.response||receipt.feedback.focus!==target.focus||receipt.feedback.date!==target.date||receipt.feedback.mode!==target.mode)throw Error('The response save could not be confirmed. Retry the same response.');
   if(!active.current)return;
   setAttempt(null);setChoice('');setMessage(next.body.response===null?'Response cleared.':'Response saved.');refreshExperience();await load(false);
  }catch(e){if(active.current){setDefinite(e instanceof ApiRequestError&&e.status>=400&&e.status<500);setError((e as Error).message);}}
  finally{busy.current=false;if(active.current)setPending(false);}
 }
 const disabled=loading||pending||!!attempt;
 return <div className="space-y-3" aria-busy={loading||pending}>
  <h3 ref={heading} tabIndex={-1}>Response to your saved focus</h3>
  {loading?<p role="status">Checking the current focus…</p>:source&&<>
   <p>{source.source.date} · {source.source.mode==='athlete'?'Athlete':'Everyday'} · {source.source.focus||'No focus recorded'}</p>
   {source.feedback&&<p className="panel-note">{source.feedback.response===null?'Previous response cleared':`Your response: ${labels[source.feedback.response]}`} · For “{source.feedback.focus}” ({source.feedback.date}, {source.feedback.mode}).</p>}
   <p className="panel-note">Your impression of this routine. This does not diagnose an allergy or prove a health effect, and does not automatically change your recommendations.</p>
   <div><label className="block" htmlFor={choiceId}>How was this focus for you?</label><select id={choiceId} className="bloom-input w-full" value={choice} disabled={disabled||!source.source.focus} onChange={e=>setChoice(e.target.value)}><option value="">Choose a response</option>{focusFeedbackResponses.map(value=><option key={value} value={value}>{labels[value]}</option>)}</select></div>
   <div className="flex flex-wrap gap-2"><Button type="button" disabled={disabled||!choice||!source.source.focus} onClick={()=>void save({body:{response:choice as typeof focusFeedbackResponses[number],sourceRevision:source.revision},key:crypto.randomUUID()})}>Save response</Button>
   {source.feedback?.response!=null&&<Button type="button" variant="outline" disabled={disabled} onClick={()=>void save({body:{response:null,sourceRevision:source.revision},key:crypto.randomUUID()})}>Clear response</Button>}</div>
  </>}
  {error&&<p role="alert">{error}{attempt?' Your selection is retained.':''}</p>}
  {attempt&&!definite&&<Button type="button" variant="outline" disabled={loading||pending} onClick={()=>void save(attempt)}>Retry same response</Button>}
  {!pending&&!loading&&(definite||!source)&&<Button type="button" variant="outline" onClick={()=>void load(true)}>Review current focus</Button>}
  {message&&<p role="status">{message}</p>}
 </div>;
}
function ResponseList({records,mode,actor}:{records:ExperienceRecord[];mode:'everyday'|'athlete';actor:string}){
 const[selected,setSelected]=useState(''),[opened,setOpened]=useState(false),selectId=useId();
 const options=records.flatMap(r=>r.kind==='checkin'&&r.payload.mode===mode?[r]:[]).sort((a,b)=>b.payload.date.localeCompare(a.payload.date));
 // Only the selected owner/mode mounts an editor; closed drafts stay intact.
 return <details className="bloom-panel space-y-3" onToggle={e=>setOpened(e.currentTarget.open)}><summary>Review responses to saved focuses</summary><p className="panel-note">Choose a saved check-in to record or change your impression.</p><div><label className="block" htmlFor={selectId}>Saved check-in</label><select id={selectId} className="bloom-input w-full" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose a check-in</option>{options.map(r=><option key={r.id} value={r.id}>{r.payload.date} · {r.kind==='checkin'?r.payload.focus||'No focus recorded':''}</option>)}</select></div>{selected&&options.some(r=>r.id===selected)&&<Editor key={selected} id={selected} actor={actor} opened={opened}/>}</details>;
}
export default function FocusFeedback({records,mode}:{records:ExperienceRecord[];mode:'everyday'|'athlete'}){const{user}=useAuth();return user?<ResponseList key={`${user.id}:${mode}`} records={records} mode={mode} actor={user.id}/>:null;}
