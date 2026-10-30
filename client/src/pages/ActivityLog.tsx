import {activityTimeText} from '@shared/activity';
import {activityChoices,describeActivityParts,activityParts,activityProjection,activityAmountText,unresolvedActivityLoads,defaultActivityLoadUnits,canonicalActivityParts,type ActivityDraftComponent} from '@shared/activity-capture';
import {useEffect,useRef,useState} from 'react';
import {Link} from 'wouter';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {refreshExperience,useExperience,useExperienceRecords} from '@/lib/experience';
import {Button} from '@/components/ui/button';
import ActivityReview from '@/components/ActivityReview';
import {RecordedSets} from '@/components/TrainingSetsEditor';
import {activitySchema,type Activity,type ExperienceRecord} from '@shared/experience';
const localStamp=(date=new Date())=>new Date(+date-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
const zone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||null;
type Draft={when:string;effort:string;notes:string};
const fresh=():Draft=>({when:localStamp(),effort:'',notes:''});
type Row=Extract<ExperienceRecord,{kind:'activity'}>;
type Attempt={payload:Activity;id?:string;key:string};
function ActivityWorkspace(){
 const {settings,ready:settingsReady}=useExperience(),records=useExperienceRecords('activity');
 const [method,setMethod]=useState<'describe'|'select'|'repeat'>('select'),[description,setDescription]=useState(''),[composerOpen,setComposerOpen]=useState(true);
 const [parts,setParts]=useState<ActivityDraftComponent[]>([]),[capture,setCapture]=useState<Activity['capture']>(),[reviewKey,setReviewKey]=useState(0);
 const [draft,setDraft]=useState(fresh),[editing,setEditing]=useState<Row|null>(null),[held,setHeld]=useState<Attempt|null>(null),[pending,setPending]=useState(false),[definite,setDefinite]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[removeId,setRemoveId]=useState<string|null>(null);
 useEffect(()=>{if(settingsReady)setParts(items=>defaultActivityLoadUnits(items,settings.displayUnits.bodyWeight));},[settingsReady,settings.displayUnits.bodyWeight]);
 const active=useRef(true),busy=useRef(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const ready=records.fetchStatus==='idle'&&!records.isError&&!records.isStale&&!!records.data;
 const rows=ready?records.data!.flatMap(row=>row.kind==='activity'?[row]:[]).sort((a,b)=>Date.parse(b.payload.startedAt)-Date.parse(a.payload.startedAt)):[];
 const locked=pending||!!held,unreviewed=method==='describe'&&composerOpen&&!editing&&description!==(capture?.description||'');
 const change=(key:keyof Draft,value:string)=>setDraft(current=>({...current,[key]:value}));
 const focusReview=()=>requestAnimationFrame(()=>document.getElementById('activity-review-heading')?.focus());
 function reset(){setDraft(fresh());setParts([]);setCapture(undefined);setDescription('');setComposerOpen(true);setReviewKey(value=>value+1);}
 function review(items:ActivityDraftComponent[],source:NonNullable<Activity['capture']>){setParts(settingsReady?defaultActivityLoadUnits(items,settings.displayUnits.bodyWeight):items);setCapture(source);setComposerOpen(false);setError('');setMessage('');setReviewKey(value=>value+1);focusReview();}
 function describe(){try{review(describeActivityParts(description),{version:1,method:'describe',description,activityId:'other',interpretation:'rule-suggestion'});}catch(e){setError((e as Error).message);}}
 function select(id:typeof activityChoices[number]['id']){const choice=activityChoices.find(choice=>choice.id===id)!;review([{id:crypto.randomUUID(),title:choice.label,activityId:id,match:id==='other'?'unclassified':'reported',minutes:null,distanceM:null,...(id==='strength'?{actualSets:{version:1 as const,sets:[]}}:{})}],{version:1,method:'select',description:choice.label,activityId:id,interpretation:'user-selected'});}
 function repeat(row:Row){const items=activityParts(row.payload).map(part=>({...part,id:crypto.randomUUID(),...(part.actualSets?{actualSets:{version:1 as const,sets:part.actualSets.sets.map(set=>({...set,id:crypto.randomUUID(),completed:false,state:'described' as const}))}}:{})}));setDraft(fresh());review(items,{version:1,method:'repeat',description:row.payload.capture?.description||row.payload.title,activityId:row.payload.capture?.activityId||'other',interpretation:'user-selected'});}
 async function save(attempt:Attempt){
  if(busy.current||!active.current)return;busy.current=true;setPending(true);setHeld(attempt);setDefinite(false);setError('');setMessage('');
  try{
   const response=await apiRequest(attempt.id?'PUT':'POST',attempt.id?`/api/experience/records/${attempt.id}`:'/api/experience/activities',attempt.id?{kind:'activity',payload:attempt.payload}:attempt.payload,attempt.id?undefined:{'Idempotency-Key':attempt.key});
   const body=await response.json(),parsed=activitySchema.safeParse(body.payload);
   if(body.kind!=='activity'||typeof body.id!=='string'||(attempt.id?body.id!==attempt.id:!/^activity_[a-f0-9]{64}$/.test(body.id))||!parsed.success||JSON.stringify(parsed.data)!==JSON.stringify(attempt.payload))throw Error('The activity save could not be confirmed. Retry this same entry or check your history.');
   if(!active.current)return;setHeld(null);setEditing(null);reset();setMessage(attempt.id?'Activity updated.':'Activity saved.');
  }catch(e){if(active.current){setDefinite(e instanceof ApiRequestError&&e.status>=400&&e.status<500);setError((e as Error).message);}}
  finally{busy.current=false;if(active.current){setPending(false);refreshExperience();}}
 }
 function submit(e:React.FormEvent){e.preventDefault();if(locked||unreviewed||!parts.length||!capture)return;setError('');if(unresolvedActivityLoads(parts)){setError('Confirm a unit for each reported load, or clear that load before saving.');return;}try{
  const canonical=canonicalActivityParts(parts);
  const unchangedTime=editing&&draft.when===localStamp(new Date(editing.payload.startedAt));
  const payload=activitySchema.parse({...activityProjection(canonical),components:{version:1,items:canonical},capture:{...capture,activityId:parts.length===1?parts[0].activityId:'other'},startedAt:unchangedTime?editing.payload.startedAt:new Date(draft.when).toISOString(),timeZone:unchangedTime?editing.payload.timeZone:zone(),effort:draft.effort||null,source:'manual',notes:draft.notes});
  void save({payload,key:crypto.randomUUID(),...(editing?{id:editing.id}:{})});
 }catch{setError('Check activity names, date, amounts and set identities. Leave unknown quantities blank.');}}
 function edit(row:Row){setEditing(row);setDraft({when:localStamp(new Date(row.payload.startedAt)),effort:row.payload.effort||'',notes:row.payload.notes});review(activityParts(row.payload),row.payload.capture||{version:1,method:'select',description:row.payload.title,activityId:'other',interpretation:'user-selected'});}
 async function remove(id:string){if(busy.current)return;busy.current=true;setPending(true);setError('');try{await apiRequest('DELETE',`/api/experience/records/${id}`);if(!active.current)return;setRemoveId(null);if(editing?.id===id){setEditing(null);reset();}setMessage('Activity deleted.');refreshExperience();}catch(e){if(active.current)setError((e as Error).message);}finally{busy.current=false;if(active.current){setPending(false);refreshExperience();}}}
 return <main className="science-page activity-workspace space-y-5"><div className="science-heading"><p className="eyebrow">MOVE AT YOUR PACE</p><h1 id="activity-review-heading" tabIndex={-1}>{capture?"Review your activity":"Activity log"}</h1><p>{capture?(parts.length?capture.method==="describe"&&parts.every(part=>part.match!=="unclassified")?`${parts.length} ${parts.length===1?"activity":"activities"} recognized`:`${parts.length} activity row(s) to review`:"No activities in this draft. Add another activity to continue."):"Describe, select or repeat. Review once, then save."}</p></div>
  <details hidden={!composerOpen&&!!capture} open={composerOpen} onToggle={e=>{if(e.target===e.currentTarget)setComposerOpen(e.currentTarget.open);}} className="bloom-panel space-y-4 workspace-disclosure" aria-label="Choose activity entry"><summary>Add activity — describe, select or repeat</summary>
   <fieldset disabled={locked||!!editing} className="space-y-3"><div className="flex flex-wrap gap-2">{(['describe','select','repeat'] as const).map(value=><Button type="button" key={value} variant={method===value?'default':'outline'} aria-pressed={method===value} onClick={()=>setMethod(value)}>{({describe:'Describe',select:'Select activity',repeat:'Repeat previous'})[value]}</Button>)}</div>
    {method==='describe'&&<><label className="block">Describe your activity<textarea aria-label="Describe your activity" className="bloom-input w-full" value={description} maxLength={2000} onChange={e=>setDescription(e.target.value)}/></label><Button type="button" disabled={!description.trim()} onClick={describe}>Review description</Button><p className="panel-note">Local text matching; no AI or external provider. Reviewing again replaces the current rows; Back alone keeps your edits.</p></>}
    {method==='select'&&<div className="flex flex-wrap gap-2">{activityChoices.map(choice=><Button type="button" variant="outline" key={choice.id} onClick={()=>select(choice.id)}>{choice.label}</Button>)}</div>}
    {method==='repeat'&&<div className="space-y-3">{!ready?<p>Current history is unavailable. Use Select activity, or retry when connected.</p>:rows.length?rows.slice(0,5).map(row=><Button type="button" variant="outline" className="max-w-full whitespace-normal h-auto min-h-11 text-left justify-start" key={row.id} onClick={()=>repeat(row)}>Repeat {row.payload.title}</Button>):<p>No saved activities to repeat yet.</p>}</div>}
   </fieldset>
  </details>
  {capture&&<section className="bloom-panel activity-review space-y-4">
   {!editing&&<Button type="button" variant="ghost" disabled={locked} onClick={()=>setComposerOpen(true)}>Back to methods</Button>}
   <form className="space-y-4" onSubmit={submit}><fieldset disabled={locked} className="space-y-4">
    <label className="block activity-source-description">Original description<textarea aria-label="Original description" rows={3} className="bloom-input w-full" maxLength={2000} value={capture.reviewedDescription??capture.description} onChange={e=>setCapture(current=>current?{...current,reviewedDescription:e.target.value}:current)}/></label>
    <p className="panel-note">Description edits keep reviewed rows; they do not silently change amounts. Your first source text stays recorded.</p>
    <label className="block">When did you start?<input aria-label="When did you start?" className="bloom-input w-full" type="datetime-local" value={draft.when} max={localStamp()} onChange={e=>change('when',e.target.value)} required/></label>
    <ActivityReview key={reviewKey} items={parts} onChange={setParts} unit={settings.displayUnits.bodyWeight} details={<details><summary>Review details & assumptions</summary><p className="panel-note">Calories not estimated. No heart rate, muscle effect or recovery score is inferred. Suggested identity is not a verified exercise match. Quantities are reported; missing fields remain unknown.</p><p className="break-words whitespace-pre-wrap">First source text: {capture.description}</p><p>Capture: {({describe:'Described by you',select:'Selected by you',repeat:'Repeated from your history'})[capture.method]}.</p><label className="block">How did it feel?<select aria-label="How did it feel?" className="bloom-input w-full" value={draft.effort} onChange={e=>change('effort',e.target.value)}><option value="">Not recorded</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select></label><label className="block">Notes<textarea className="bloom-input w-full" maxLength={1000} value={draft.notes} onChange={e=>change('notes',e.target.value)}/></label></details>}/>
    {unreviewed&&<p role="status">Review the latest description before saving.</p>}
    <Button type="submit" disabled={unreviewed||!parts.length}>{pending?'Saving activity…':editing?'Save activity correction':'Save activity'}</Button>{editing&&<Button type="button" variant="outline" onClick={()=>{setEditing(null);reset();}}>Cancel correction</Button>}
   </fieldset></form>
  </section>}
  {held&&!pending&&<p role="status">Save not confirmed. Your draft stays on this page. Retry safely or check history; leaving may lose the draft.</p>}
  {held&&!pending&&(definite?<Button type="button" variant="outline" onClick={()=>{setHeld(null);setError('');}}>Review details</Button>:<Button type="button" onClick={()=>void save(held)}>Retry same activity</Button>)}
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  <div className="flex flex-wrap gap-4"><Link className="text-link" href="/">Back to Today</Link><Link className="text-link" href="/progress?view=activity">Review Progress</Link></div>
  <section hidden={!!capture&&!held} className="bloom-panel space-y-4"><h2>Your activity history</h2>{!ready&&(records.isError?<p role="alert">Activity history could not load. <button type="button" className="text-link" onClick={()=>records.refetch()}>Retry activity history</button></p>:<p role="status">Checking current activity history…</p>)}
   {ready&&!rows.length&&<p>No manual activity entries yet.</p>}{rows.map(row=><article className="precision-observation block space-y-2" key={row.id}><h3 className="break-words">{row.payload.title}</h3><p><time dateTime={row.payload.startedAt}>{activityTimeText(row.payload)}</time> · {activityAmountText(row.payload)}{row.payload.effort?` · ${row.payload.effort}`:''}</p>
    {row.payload.components&&(row.payload.components.items.length>1||row.payload.components.items.some(part=>part.actualSets))&&<ul className="space-y-2">{row.payload.components.items.map(part=><li key={part.id}>{row.payload.components!.items.length>1&&<><strong>{part.title}</strong> · {part.minutes===null?'Duration not recorded':`${part.minutes} minutes`}</>}{part.actualSets&&<details><summary>{part.actualSets.sets.length} recorded set rows</summary><RecordedSets value={part.actualSets} unit={settings.displayUnits.bodyWeight}/></details>}</li>)}</ul>}
    {row.payload.capture&&<details><summary>Original description & source</summary><p className="break-words whitespace-pre-wrap">{row.payload.capture.description}</p>{row.payload.capture.reviewedDescription!==undefined&&<p>Reviewed description: {row.payload.capture.reviewedDescription}</p>}<p>Manual entry · {({describe:'Described by you',select:'Selected by you',repeat:'Repeated from your history'})[row.payload.capture.method]} · {row.payload.timeZone||'Time zone not recorded'}</p></details>}
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={locked} onClick={()=>edit(row)}>Correct activity</Button><Button type="button" variant="outline" disabled={locked} onClick={()=>setRemoveId(row.id)}>Delete</Button>{removeId===row.id&&<><Button type="button" disabled={locked} onClick={()=>void remove(row.id)}>Delete activity</Button><Button type="button" variant="outline" disabled={locked} onClick={()=>setRemoveId(null)}>Keep activity</Button></>}</div></article>)}
  </section>
 </main>;
}
export default function ActivityLog(){const{user}=useAuth();return user?<ActivityWorkspace key={user.id}/>:null;}
