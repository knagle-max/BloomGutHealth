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
export default function GiCheckinSource({actor,id,onSaved,female=false}:{actor:string;id:string;onSaved:()=>unknown;female?:boolean}){
 const[source,setSource]=useState<Source|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function load(){const guard=accountContextGuard(actor);setBusy(true);try{const [raw,sharingRaw]=await Promise.all([apiRequest('GET',`/api/precision/checkins/${encodeURIComponent(id)}/source`).then(r=>r.json()),apiRequest('GET','/api/precision/investigation-sharing').then(r=>r.json())]);const sharing=investigationSharingSchema.parse(sharingRaw);if(!stillCurrent(guard))return;const payload=checkinSchema.parse(raw.record.payload);if(typeof raw.revision!=='string')throw Error();setSource({revision:raw.revision,sharingRevision:sharing.revision,gi:payload.gi??null});setOpen(true);setNotice('');}catch{if(!stillCurrent(guard))return;setNotice('Source could not be loaded. Reload the current journal before editing.');}finally{if(!stillCurrent(guard))return;setBusy(false);}}
 async function save(form:HTMLFormElement){if(!source?.gi)return;const guard=accountContextGuard(actor);let gi:GiSourceContext;try{gi=correctGiSource(source.gi,new FormData(form));}catch{setNotice('Check reported values and time precision. Counts need a period, amounts need their original units, and condition assertions must match the entries.');return;}setBusy(true);try{await apiRequest('PUT',`/api/precision/checkins/${encodeURIComponent(id)}/context`,{revision:source.revision,sharingRevision:source.sharingRevision,gi,confirmed:true});if(!stillCurrent(guard))return;setSource(null);setOpen(false);setNotice('Source correction saved. Reload details to review the new revision.');void onSaved();}catch{if(!stillCurrent(guard))return;setNotice('Correction not confirmed. Reload the source and review current privacy choices.');}finally{if(!stillCurrent(guard))return;setBusy(false);}}
 return <div><button className="text-link min-h-11" type="button" disabled={busy} onClick={()=>open?setOpen(false):void load()}>{open?'Close reported context':'Review reported context'}</button>{notice&&<p role="status">{notice}</p>}{open&&source&&<div>{source.gi?<><p className="panel-note">Self-reported context. Dates and unknowns retain the precision recorded by the source. This is not a diagnosis.</p><dl>{Object.entries(source.gi).filter(([key])=>key!=='version').map(([key,value])=><div key={key}><dt>{key.replace(/([A-Z])/g,' $1')}</dt><dd>{display(value)}</dd></div>)}</dl><form onSubmit={e=>{e.preventDefault();void save(e.currentTarget);}}><fieldset disabled={busy}><legend>Correct reported source context</legend><label>Bristol stool type<select name="bristol" className="bloom-input w-full" defaultValue={source.gi.bowel?.bristol??''}><option value="">Not recorded</option>{[1,2,3,4,5,6,7].map(n=><option key={n}>{n}</option>)}</select></label><label>Straining<select name="straining" className="bloom-input w-full" defaultValue={source.gi.bowel?.straining??''}><option value="">Not recorded</option>{['unknown','yes','no'].map(value=><option key={value}>{value}</option>)}</select></label><fieldset className="precision-grid"><legend>Bowel frequency and context</legend><NumberField prefix="bowel." field="count" label="Reported bowel movement count" value={source.gi.bowel?.frequency?.count}/><NumberField prefix="bowel." field="periodDays" label="Over how many days" value={source.gi.bowel?.frequency?.periodDays}/>
 <Choice prefix="bowel." field="incompleteEmptying" label="Incomplete emptying" value={source.gi.bowel?.incompleteEmptying??''} options={['','unknown','yes','no']}/>
 <Choice prefix="bowel." field="reliefAfterBowelMovement" label="Relief after bowel movement" value={source.gi.bowel?.reliefAfterBowelMovement??''} options={['','unknown','yes','no','partial']}/>
 <SourceTimeFields prefix="bowel." value={source.gi.bowel?.effective} label="Bowel observation effective time"/></fieldset>
 {source.gi.warnings&&<fieldset className="precision-grid"><legend>Reported warning indicators</legend>{(['bloodInStool','majorActiveBleeding','fainting','severePersistentPain','persistentNewBowelChange'] as const).map(key=><Choice key={key} prefix="warning." field={key} label={warningLabels[key]} value={source.gi!.warnings![key]??''} options={['','unknown','yes','no']}/>)}<SourceTimeFields prefix="warning." value={source.gi.warnings.effective} label="Warning observation effective time"/><p className="panel-note">This form is not monitored or an emergency assessment. Seek urgent medical help for major bleeding, fainting or severe persistent pain.</p></fieldset>}
 {source.gi.weightLoss&&<fieldset className="precision-grid"><legend>Reported weight-loss context</legend><Choice prefix="weight." field="intent" label="Weight-loss intent" value={source.gi.weightLoss.intent} options={['unknown','intentional','unintentional']}/><NumberField prefix="weight." field="amount" label="Reported amount lost" value={source.gi.weightLoss.amount}/><Choice prefix="weight." field="unit" label="Original weight-loss unit" value={source.gi.weightLoss.unit??''} options={['','kg','lb']}/><NumberField prefix="weight." field="overDays" label="Reported weight-loss period in days" value={source.gi.weightLoss.overDays}/><SourceTimeFields prefix="weight." value={source.gi.weightLoss.effective} label="Weight-loss effective time"/></fieldset>}
 {source.gi.menstrualPelvic&&<PelvicFields value={source.gi.menstrualPelvic} female={female}/>}
 {source.gi.symptoms?.map(event=><SymptomFields key={event.id} event={event}/>)}
 {source.gi.conditions&&<fieldset><legend>Reported condition context</legend><Choice prefix="condition." field="assertion" label="Condition assertion" value={source.gi.conditions.assertion} options={['unknown','none-reported','reported']}/>{source.gi.conditions.entries.map(event=><ConditionFields key={event.id} event={event}/>)}</fieldset>}
{source.gi.exposures?.map(event=><ExposureFields key={event.id} event={event}/>)}<button type="submit" className="text-link min-h-11">Save source correction</button></fieldset></form></>:<p>No additional GI context was recorded for this check-in.</p>}</div>}</div>;
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

function Choice({prefix,field,label,value,options}:{prefix:string;field:string;label:string;value:string;options:readonly string[]}){
 return <label>{label}<select className="bloom-input w-full" name={prefix+field} defaultValue={value}>{options.map(option=><option key={option} value={option}>{option?option.replaceAll('-',' '):'Not recorded'}</option>)}</select></label>;
}
function SourceTimeFields({prefix,value,label}:{prefix:string;value?:NonNullable<GiSourceContext['symptoms']>[number]['onset'];label:string}){
 return <fieldset className="precision-grid"><legend>{label}</legend><Choice prefix={prefix} field="precision" label="Reported time precision" value={value?.precision??'not-recorded'} options={['not-recorded','unknown','date','timestamp']}/>
 <label>Reported date (date precision)<input className="bloom-input w-full" type="date" name={prefix+'date'} defaultValue={value?.precision==='date'?value.date:''}/></label>
 <label>Reported timestamp with UTC offset (timestamp precision)<input className="bloom-input w-full" name={prefix+'at'} defaultValue={value?.precision==='timestamp'?value.at:''} maxLength={50}/></label>
 <label>Recorded time zone (if known)<input className="bloom-input w-full" name={prefix+'timeZone'} defaultValue={value&&'timeZone'in value?value.timeZone??'':''} maxLength={100}/></label></fieldset>;
}
function SymptomFields({event}:{event:NonNullable<GiSourceContext['symptoms']>[number]}){
 const prefix=`symptom.${event.id}.`;
 return <fieldset className="precision-grid"><legend>Reported symptom: {event.type.replaceAll('-',' ')}</legend>
 <Choice prefix={prefix} field="type" label="Symptom type" value={event.type} options={['bloating','gas','abdominal-pain','constipation','diarrhea','nausea','other']}/>
 <label>Reported severity (0–10)<input className="bloom-input w-full" name={prefix+'severity'} type="number" min="0" max="10" step="1" defaultValue={event.severity??''}/></label>
 <label>Reported duration (minutes)<input className="bloom-input w-full" name={prefix+'duration'} type="number" min="0" step="any" defaultValue={event.durationMinutes??''}/></label>
 <Choice prefix={prefix} field="recurrence" label="Recurrence" value={event.recurrence??''} options={['','unknown','single','intermittent','persistent']}/>
 <SourceTimeFields prefix={prefix} value={event.onset} label="Reported symptom onset"/>
 <label><input type="checkbox" name={prefix+'remove'} value="yes"/>Remove this symptom from this source when saving</label></fieldset>;
}
function ConditionFields({event}:{event:NonNullable<GiSourceContext['conditions']>['entries'][number]}){
 const prefix=`condition.${event.id}.`;
 return <fieldset className="precision-grid"><legend>Reported condition: {event.name}</legend><label>Condition name<input className="bloom-input w-full" name={prefix+'name'} defaultValue={event.name} maxLength={160} required/></label>
 <Choice prefix={prefix} field="state" label="Reported condition state" value={event.state} options={['unknown','user-reported-diagnosis','suspected','user-reported-ruled-out']}/>
 <SourceTimeFields prefix={prefix} value={event.effective} label="Reported condition effective time"/>
 <label><input type="checkbox" name={prefix+'remove'} value="yes"/>Remove this condition from this source when saving</label><p className="panel-note">Removing an entry does not assert no conditions. Choose the assertion separately; a user-reported diagnosis is not clinically verified here.</p></fieldset>;
}

const warningLabels={bloodInStool:'Blood in stool',majorActiveBleeding:'Major active bleeding',fainting:'Fainting',severePersistentPain:'Severe persistent pain',persistentNewBowelChange:'Persistent new bowel change'};
function NumberField({prefix,field,label,value}:{prefix:string;field:string;label:string;value?:number|null}){
 return <label>{label}<input className="bloom-input w-full" name={prefix+field} type="number" min="0" step="any" defaultValue={value??''}/></label>;
}
function PelvicFields({value,female}:{value:NonNullable<GiSourceContext['menstrualPelvic']>;female:boolean}){
 return <fieldset className="precision-grid"><legend>Reported pelvic context</legend><NumberField prefix="pelvic." field="pelvicPain" label="Reported pelvic pain (0–10)" value={value.pelvicPain}/>
 {female&&<><Choice prefix="pelvic." field="bleeding" label="Reported bleeding" value={value.bleeding??''} options={['','unknown','yes','no']}/><Choice prefix="pelvic." field="dysmenorrhea" label="Reported painful periods" value={value.dysmenorrhea??''} options={['','unknown','yes','no']}/><NumberField prefix="pelvic." field="reportedCycleDay" label="Reported cycle day" value={value.reportedCycleDay}/>{value.periods?.map((period,index)=><fieldset key={index}><legend>Reported period {index+1}</legend><label>Reported start<input className="bloom-input w-full" type="date" name={`pelvic.period.${index}.startedOn`} defaultValue={period.startedOn}/></label><label>Reported end (if known)<input className="bloom-input w-full" type="date" name={`pelvic.period.${index}.endedOn`} defaultValue={period.endedOn??''}/></label><label><input type="checkbox" name={`pelvic.period.${index}.remove`} value="yes"/>Remove this reported period when saving</label></fieldset>)}</>}
 <SourceTimeFields prefix="pelvic." value={value.effective} label="Pelvic observation effective time"/><p className="panel-note">Reported cycle timing is not an inferred phase or clinical conclusion.</p></fieldset>;
}
