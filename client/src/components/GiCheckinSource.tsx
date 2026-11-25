import {useState} from 'react';
import {apiRequest} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {correctGiSource} from '@shared/gi-source-correction';
import {checkinSchema} from '@shared/precision-nutrition';
import {investigationSharingSchema,type GiSourceContext} from '@shared/gi-source-context';
const stillCurrent=(guard:()=>void)=>{try{guard();return true;}catch{return false;}};
type Source={revision:string;sharingRevision:string;gi:GiSourceContext|null};
function display(value:unknown):string{if(value===undefined||value===null)return 'Not recorded';if(Array.isArray(value))return value.length?value.map(display).join('; '):'No entries reported';if(typeof value==='object')return Object.entries(value).filter(([key])=>key!=='id'&&key!=='version').map(([key,item])=>`${key.replace(/([A-Z])/g,' $1')}: ${display(item)}`).join(' · ');return String(value).replaceAll('-',' ');}
/** Owned source drilldown. Canonical detail is fetched only on request and
 * never copied into legacy recommendation reports or external prompts. */
export default function GiCheckinSource({actor,id,onSaved}:{actor:string;id:string;onSaved:()=>unknown}){
 const[source,setSource]=useState<Source|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function load(){const guard=accountContextGuard(actor);setBusy(true);try{const [raw,sharingRaw]=await Promise.all([apiRequest('GET',`/api/precision/checkins/${encodeURIComponent(id)}/source`).then(r=>r.json()),apiRequest('GET','/api/precision/investigation-sharing').then(r=>r.json())]);const sharing=investigationSharingSchema.parse(sharingRaw);if(!stillCurrent(guard))return;const payload=checkinSchema.parse(raw.record.payload);if(typeof raw.revision!=='string')throw Error();setSource({revision:raw.revision,sharingRevision:sharing.revision,gi:payload.gi??null});setOpen(true);setNotice('');}catch{if(!stillCurrent(guard))return;setNotice('Source could not be loaded. Reload the current journal before editing.');}finally{if(!stillCurrent(guard))return;setBusy(false);}}
 async function save(form:HTMLFormElement){if(!source?.gi)return;const guard=accountContextGuard(actor);setBusy(true);try{const gi=correctGiSource(source.gi,new FormData(form));await apiRequest('PUT',`/api/precision/checkins/${encodeURIComponent(id)}/context`,{revision:source.revision,sharingRevision:source.sharingRevision,gi,confirmed:true});if(!stillCurrent(guard))return;setSource(null);setOpen(false);setNotice('Source correction saved. Reload details to review the new revision.');void onSaved();}catch{if(!stillCurrent(guard))return;setNotice('Correction not confirmed. Reload the source and review current privacy choices.');}finally{if(!stillCurrent(guard))return;setBusy(false);}}
 return <div><button className="text-link min-h-11" type="button" disabled={busy} onClick={()=>open?setOpen(false):void load()}>{open?'Close reported context':'Review reported context'}</button>{notice&&<p role="status">{notice}</p>}{open&&source&&<div>{source.gi?<><p className="panel-note">Self-reported context. Dates and unknowns retain the precision recorded by the source. This is not a diagnosis.</p><dl>{Object.entries(source.gi).filter(([key])=>key!=='version').map(([key,value])=><div key={key}><dt>{key.replace(/([A-Z])/g,' $1')}</dt><dd>{display(value)}</dd></div>)}</dl><form onSubmit={e=>{e.preventDefault();void save(e.currentTarget);}}><fieldset disabled={busy}><legend>Correct reported source context</legend><label>Bristol stool type<select name="bristol" className="bloom-input w-full" defaultValue={source.gi.bowel?.bristol??''}><option value="">Not recorded</option>{[1,2,3,4,5,6,7].map(n=><option key={n}>{n}</option>)}</select></label><label>Straining<select name="straining" className="bloom-input w-full" defaultValue={source.gi.bowel?.straining??''}><option value="">Not recorded</option>{['unknown','yes','no'].map(value=><option key={value}>{value}</option>)}</select></label>{source.gi.exposures?.map(event=><ExposureFields key={event.id} event={event}/>)}<button type="submit" className="text-link min-h-11">Save source correction</button></fieldset></form></>:<p>No additional GI context was recorded for this check-in.</p>}</div>}</div>;
}

function ExposureFields({event}:{event:NonNullable<GiSourceContext['exposures']>[number]}){
 const prefix=`exposure.${event.id}.`,time=event.effective;
 const choices=(key:string,label:string,values:readonly string[],value:string)=><label>{label}<select className="bloom-input w-full" name={prefix+key} defaultValue={value}>{values.map(option=><option key={option} value={option}>{option.replaceAll('-',' ')}</option>)}</select></label>;
 return <fieldset className="precision-grid"><legend>Medication or supplement event: {event.name}</legend>
 <label>Name<input className="bloom-input w-full" name={prefix+'name'} defaultValue={event.name} maxLength={160} required/></label>
 {choices('kind','Event type',['medication','supplement'],event.kind)}
 {choices('change','Reported change',['unknown','started','stopped','dose-changed','none-reported'],event.change)}
 {choices('useStatus','Actual use',['unknown','reported-taken','reported-not-taken','prescribed-only','planned'],event.useStatus)}
 <label>Reported dose amount<input className="bloom-input w-full" name={prefix+'amount'} type="number" min="0" step="any" defaultValue={event.dose?.amount??''}/></label>
 <label>Original dose unit<input className="bloom-input w-full" name={prefix+'unit'} defaultValue={event.dose?.unit??''} maxLength={50}/></label>
 <label>Reported label ingredients<textarea className="bloom-input w-full" name={prefix+'ingredient'} defaultValue={event.ingredientSource?.text??''} maxLength={2000}/></label>
 {choices('precision','Effective time precision',['not-recorded','unknown','date','timestamp'],time?.precision??'not-recorded')}
 <label>Effective date (date precision only)<input className="bloom-input w-full" name={prefix+'date'} type="date" defaultValue={time?.precision==='date'?time.date:''}/></label>
 <label>Effective timestamp including UTC offset (timestamp precision only)<input className="bloom-input w-full" name={prefix+'at'} defaultValue={time?.precision==='timestamp'?time.at:''} placeholder="YYYY-MM-DDTHH:mm:ss+00:00" maxLength={50}/></label>
 <label>Recorded time zone (if known)<input className="bloom-input w-full" name={prefix+'timeZone'} defaultValue={time&&'timeZone'in time?time.timeZone??'':''} maxLength={100}/></label>
 <label><input type="checkbox" name={prefix+'remove'} value="yes"/>Remove this event from this source when saving</label>
 <p className="panel-note">A prescription or schedule does not establish actual use. Correcting a reported event does not authorize a medication change.</p>
 </fieldset>;
}
