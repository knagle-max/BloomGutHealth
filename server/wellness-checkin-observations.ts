import {z} from 'zod';
import {createHash} from 'node:crypto';
import {checkinSchema as weeklySchema} from '../shared/experience';
import {checkinSchema as bodySchema} from '../shared/precision-nutrition';
import {wellnessDaySchema,type WellnessDay} from '../shared/wellness-actions';
import type {CheckinSources,CheckinSourceGroup,CheckinSourceObservation} from '../shared/wellness-checkin-sources';
export type OwnedCheckinRow={id:string;userId:string;payload:unknown;createdAt:string;updatedAt?:string};
const unavailable=(limited:boolean):CheckinSourceGroup=>({status:'unavailable',limited,observations:[]});
const revision=(account:string,kind:string,row:OwnedCheckinRow)=>createHash('sha256').update(JSON.stringify(['wellness-checkin-source-v1',account,kind,row])).digest('hex');
/** Source dates and field presence only. Native records retain all numeric values,
 * original entry units and private notes; no averaging or causal attribution. */
export function checkinSourceObservations(account:string,day:WellnessDay,weekly:readonly OwnedCheckinRow[]|null,body:readonly OwnedCheckinRow[]|null,weeklyLimited=false,bodyLimited=false,now=new Date()):CheckinSources{
 day=wellnessDaySchema.parse(day);const end=Date.parse(day.date+'T00:00:00Z'),start=Math.max(Date.parse('0000-01-01T00:00:00Z'),end-27*86400000),from=new Date(start).toISOString().slice(0,10),within=(date:string)=>date>=from&&date<=day.date;
 const project=(kind:'weekly-checkin'|'dated-measurement',rows:readonly OwnedCheckinRow[]|null,limited:boolean):CheckinSourceGroup=>{
  if(!account||!rows||limited||rows.some(row=>row.userId!==account))return unavailable(limited);
  const observations:CheckinSourceObservation[]=[];
  for(const row of rows){
   const parsed=kind==='weekly-checkin'?weeklySchema.safeParse(row.payload):bodySchema.safeParse(row.payload);if(!parsed.success)return unavailable(false);
   const payload=parsed.data;
   const reportedOn='date'in payload?payload.date:new Date(Date.parse(payload.measuredAt)-day.timezoneOffset*60000).toISOString().slice(0,10);if(!within(reportedOn))continue;
   const recordedFields='date'in payload?['energy','hunger','digestive comfort','sleep hours','adherence days',...(payload.soreness===null?[]:['soreness'])]:[['weight',payload.weightKg],['body fat',payload.bodyFatPercent],['waist',payload.waistCm],['bloating',payload.bloating],['energy',payload.energy],['adherence percent',payload.adherencePercent]].filter(([,value])=>value!==null).map(([name])=>String(name));
   observations.push({sourceId:row.id,sourceKind:kind,sourceRevision:revision(account,kind,row),reportedOn,recordedAt:'measuredAt'in payload?payload.measuredAt:null,savedAt:z.iso.datetime({offset:true}).safeParse(row.createdAt).success?row.createdAt:null,updatedAt:row.updatedAt&&z.iso.datetime({offset:true}).safeParse(row.updatedAt).success?row.updatedAt:null,temporalStatus:!Number.isFinite(+now)?'unknown':('measuredAt'in payload?Date.parse(payload.measuredAt)>+now:payload.date>new Date(+now-day.timezoneOffset*60000).toISOString().slice(0,10))?'future-entry':'elapsed-entry',mode:'mode'in payload?payload.mode:null,recordedFields});
  }
  return{status:'available',limited:false,observations:observations.sort((a,b)=>b.reportedOn.localeCompare(a.reportedOn)||a.sourceId.localeCompare(b.sourceId))};
 };
 return{version:'wellness-checkin-sources-v1',purpose:'own-account-app',from,to:day.date,weekly:project('weekly-checkin',weekly,weeklyLimited),body:project('dated-measurement',body,bodyLimited)};
}
