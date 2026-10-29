import {activityTimeText} from "@shared/activity";
import {useEffect,useRef,useState} from 'react';
import {Link} from 'wouter';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {refreshExperience,useExperienceRecords} from '@/lib/experience';
import {Button} from '@/components/ui/button';
import {activitySchema,type Activity,type ExperienceRecord} from '@shared/experience';
const localStamp=(date=new Date())=>new Date(+date-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
const zone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||null;
type Draft={title:string;when:string;minutes:string;effort:string;notes:string};
const fresh=():Draft=>({title:'',when:localStamp(),minutes:'',effort:'',notes:''});
type Row=Extract<ExperienceRecord,{kind:'activity'}>;
type Attempt={payload:Activity;id?:string;key:string};
function ActivityWorkspace(){
 const records=useExperienceRecords('activity'),[draft,setDraft]=useState(fresh),[editing,setEditing]=useState<Row|null>(null),[held,setHeld]=useState<Attempt|null>(null),[pending,setPending]=useState(false),[definite,setDefinite]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[removeId,setRemoveId]=useState<string|null>(null);
 const active=useRef(true),busy=useRef(false),titleInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const ready=records.fetchStatus==='idle'&&!records.isError&&!records.isStale&&!!records.data;
 const rows=ready?records.data!.flatMap(row=>row.kind==='activity'?[row]:[]).sort((a,b)=>Date.parse(b.payload.startedAt)-Date.parse(a.payload.startedAt)):[];
 const locked=pending||!!held;
 const change=(key:keyof Draft,value:string)=>setDraft(current=>({...current,[key]:value}));
 async function save(attempt:Attempt){
  if(busy.current||!active.current)return;busy.current=true;setPending(true);setHeld(attempt);setDefinite(false);setError('');setMessage('');
  try{
   const response=await apiRequest(attempt.id?'PUT':'POST',attempt.id?`/api/experience/records/${attempt.id}`:'/api/experience/activities',attempt.id?{kind:'activity',payload:attempt.payload}:attempt.payload,attempt.id?undefined:{'Idempotency-Key':attempt.key});
   const body=await response.json(),parsed=activitySchema.safeParse(body.payload);
   if(body.kind!=='activity'||typeof body.id!=='string'||(attempt.id?body.id!==attempt.id:!/^activity_[a-f0-9]{64}$/.test(body.id))||!parsed.success||JSON.stringify(parsed.data)!==JSON.stringify(attempt.payload))throw Error('The activity save could not be confirmed. Retry this same entry or check your history.');
   if(!active.current)return;setHeld(null);setEditing(null);setDraft(fresh());setMessage(attempt.id?'Activity updated.':'Activity saved.');
  }catch(e){if(active.current){setDefinite(e instanceof ApiRequestError&&e.status>=400&&e.status<500);setError((e as Error).message);}}
  finally{busy.current=false;if(active.current){setPending(false);refreshExperience();}}
 }
 function submit(e:React.FormEvent){e.preventDefault();if(locked)return;setError('');try{
  const unchangedTime=editing&&draft.when===localStamp(new Date(editing.payload.startedAt));
  const payload=activitySchema.parse({title:draft.title,startedAt:unchangedTime?editing.payload.startedAt:new Date(draft.when).toISOString(),timeZone:unchangedTime?editing.payload.timeZone:zone(),minutes:draft.minutes.trim()?Number(draft.minutes):undefined,effort:draft.effort||null,source:'manual',notes:draft.notes});
  void save({payload,key:crypto.randomUUID(),...(editing?{id:editing.id}:{})});
 }catch{setError('Enter an activity, a valid date and duration in minutes.');}}
 function edit(row:Row){setEditing(row);setDraft({title:row.payload.title,when:localStamp(new Date(row.payload.startedAt)),minutes:String(row.payload.minutes),effort:row.payload.effort||'',notes:row.payload.notes});setError('');setMessage('');requestAnimationFrame(()=>{if(active.current)titleInput.current?.focus();});}
 async function remove(id:string){if(busy.current)return;busy.current=true;setPending(true);setError('');try{await apiRequest('DELETE',`/api/experience/records/${id}`);if(!active.current)return;setRemoveId(null);if(editing?.id===id){setEditing(null);setDraft(fresh());}setMessage('Activity deleted.');refreshExperience();}catch(e){if(active.current)setError((e as Error).message);}finally{busy.current=false;if(active.current){setPending(false);refreshExperience();}}}
 return <main className="science-page space-y-5"><div className="science-heading"><p className="eyebrow">MOVE AT YOUR PACE</p><h1>Activity log</h1><p>Record a walk, ride or another activity in your own words.</p></div>
 <section className="bloom-panel space-y-4"><h2>{editing?'Correct activity':'Log activity'}</h2><form className="space-y-4" onSubmit={submit}><fieldset disabled={locked} className="space-y-4">
  <label className="block">Activity<input ref={titleInput} className="bloom-input w-full" value={draft.title} onChange={e=>change('title',e.target.value)} maxLength={120} required placeholder="Walk, cycle, gardening…"/></label>
  <div className="precision-grid"><label>When did you start?<input className="bloom-input w-full" type="datetime-local" value={draft.when} max={localStamp()} onChange={e=>change('when',e.target.value)} required/></label><label>Duration (minutes)<input className="bloom-input w-full" type="number" min={1} max={1440} step={1} value={draft.minutes} onChange={e=>change('minutes',e.target.value)} required/></label></div>
  <details><summary>Add effort or notes (optional)</summary><label className="block" htmlFor="activity-effort">How did it feel?</label><select id="activity-effort" className="bloom-input w-full" value={draft.effort} onChange={e=>change('effort',e.target.value)}><option value="">Not recorded</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select><label className="block">Notes<textarea className="bloom-input w-full" maxLength={1000} value={draft.notes} onChange={e=>change('notes',e.target.value)}/></label></details>
  <Button type="submit">{pending?'Saving activity…':editing?'Save activity correction':'Save activity'}</Button>{editing&&<Button type="button" variant="outline" onClick={()=>{setEditing(null);setDraft(fresh());}}>Cancel correction</Button>}
 </fieldset></form>
 {held&&!pending&&(definite?<Button type="button" variant="outline" onClick={()=>{setHeld(null);setError('');}}>Review details</Button>:<Button type="button" onClick={()=>void save(held)}>Retry same activity</Button>)}
 {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}<p className="panel-note">Manual entries record what you report. They do not estimate calories burned or set workout fueling targets.</p><div className="flex flex-wrap gap-4"><Link className="text-link" href="/">Back to Today</Link><Link className="text-link" href="/progress?view=activity">Review Progress</Link></div></section>
 <section className="bloom-panel space-y-4"><h2>Your activity history</h2>{!ready&&(records.isError?<p role="alert">Activity history could not load. <button type="button" className="text-link" onClick={()=>records.refetch()}>Retry activity history</button></p>:<p role="status">Checking current activity history…</p>)}
 {ready&&!rows.length&&<p>No manual activity entries yet.</p>}{rows.map(row=><article className="precision-observation block space-y-2" key={row.id}><h3>{row.payload.title}</h3><p><time dateTime={row.payload.startedAt}>{activityTimeText(row.payload)}</time> · {row.payload.minutes} minutes{row.payload.effort?` · ${row.payload.effort}`:''}</p>{row.payload.notes&&<p>{row.payload.notes}</p>}<p className="panel-note">Manual entry{row.payload.timeZone?` · ${row.payload.timeZone}`:''}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={locked} onClick={()=>edit(row)}>Correct activity</Button><Button type="button" variant="outline" disabled={locked} onClick={()=>setRemoveId(row.id)}>Delete</Button>{removeId===row.id&&<><Button type="button" disabled={locked} onClick={()=>void remove(row.id)}>Delete activity</Button><Button type="button" variant="outline" disabled={locked} onClick={()=>setRemoveId(null)}>Keep activity</Button></>}</div></article>)}</section></main>;
}
export default function ActivityLog(){const{user}=useAuth();return user?<ActivityWorkspace key={user.id}/>:null;}
