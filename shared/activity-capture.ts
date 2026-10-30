import type {Activity,ActualSets,ActivityComponent} from './experience';
import {displayToKg} from './display-units';

/** Unresolved unitless quantities exist only in the editable draft, never canonical storage. */
export type ActivityDraftSet = ActualSets['sets'][number] & {unconfirmedLoad?:number};
export type ActivityDraftSets = {version:1;sets:ActivityDraftSet[]};
export type ActivityDraftComponent = Omit<ActivityComponent,'actualSets'> & {actualSets?:ActivityDraftSets};
export function confirmDraftLoadUnit(set:ActivityDraftSet,unit:'kg'|'lb'):ActivityDraftSet {
 const {unconfirmedLoad,...confirmed}=set;
 return {...confirmed,loadUnit:unit,...(unconfirmedLoad!==undefined?{loadKg:displayToKg(unconfirmedLoad,unit)}:{})};
}
export const unresolvedActivityLoads=(items:readonly ActivityDraftComponent[])=>items.reduce((total,item)=>total+(item.actualSets?.sets.filter(set=>set.unconfirmedLoad!==undefined).length||0),0);

/** App-authored menu labels, not a licensed MET or physiological taxonomy. */
export const activityChoices = [
 {id:'walk',label:'Walking',words:/\b(walk|walked|walking)\b/i},
 {id:'run',label:'Running',words:/\b(run|ran|running|jog|jogged|jogging)\b/i},
 {id:'cycle',label:'Cycling',words:/\b(cycle|cycled|cycling|bike|biked|biking)\b/i},
 {id:'swim',label:'Swimming',words:/\b(swim|swam|swimming)\b/i},
 {id:'garden',label:'Gardening',words:/\b(garden|gardened|gardening)\b/i},
 {id:'strength',label:'Strength exercise',words:/\b(sets?|reps?|bench press|squat|deadlift)\b/i},
 {id:'other',label:'Other activity',words:/$a/},
] as const;
export type ActivityChoice = typeof activityChoices[number]['id'];
const bounded=(text:string|undefined,max:number,integer=false)=>{if(text===undefined)return null;const n=Number(text);return Number.isFinite(n)&&n>=0&&n<=max&&(!integer||Number.isInteger(n))?n:null;};

/** Local, bounded suggestions from explicit words and quantities. Never a save. */
export function describeActivity(description:string) {
 const matches=activityChoices.filter(choice=>choice.words.test(description));
 let choice=matches.length===1?matches[0]:activityChoices[6];
 const durations=Array.from(description.matchAll(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\b/gi));
 const minutes=durations.length===1&&matches.length<=1?bounded(durations[0][1],1440,true):null;
 const distances=Array.from(description.matchAll(/(?:^|\s)(\d+(?:\.\d+)?)\s*(km|kilomet(?:er|re)s?|met(?:er|re)s?)\b/gi));
 const distance=distances.length===1&&matches.length<=1?distances[0]:undefined;
 const distanceM=distance?bounded(String(Number(distance[1])*(/^k/i.test(distance[2])?1000:1)),1000000):null;
 const reordered=description.trim().match(/^(?:did\s+)?(\d+)\s+sets?\s+of\s+(.{1,120}?)\s+at\s+(\d+(?:\.\d+)?)\s*kg\s+for\s+(\d+)\s+reps?[.!]?$/i);
 const strength=reordered?[reordered[0],reordered[1],reordered[4],reordered[2],reordered[3]]:description.trim().match(/^(\d+)\s*(?:sets?\s+of|[x×])\s*(\d+)\s+(.{1,120}?)\s+at\s+(\d+(?:\.\d+)?)\s*kg[.!]?$/i);
 const suffixed=description.trim().match(/^(?:did\s+)?(\d+)\s+sets?\s+of\s+(\d+)\s+reps?\s+of\s+(.{1,120}?)\s+(?:for|at)\s+(.+?)\s*(kg|kgs|kilograms?|lb|lbs|pounds?)[.!]?$/i);
 const parenthesized=description.trim().match(/^(?:did\s+)?(\d+)\s+sets?\s+of\s+(\d+)\s+reps?\s+of\s+(.{1,120}?)\s*\(([^()]+)\)\s*(kg|kgs|kilograms?|lb|lbs|pounds?)?[.!]?$/i);
 const listed=suffixed||parenthesized;
 let actualSets:ActivityDraftSets|undefined,needsSetReview=false,namedTitle:string|undefined;
 if(listed){
  const count=bounded(listed[1],100,true),reps=bounded(listed[2],1000,true),unit=listed[5]?/^(lb|pound)/i.test(listed[5])?'lb' as const:'kg' as const:undefined;
  const amounts=listed[4].split(',').map(value=>value.trim());
  const loads=amounts.map(value=>/^\d+(?:\.\d+)?$/.test(value)?bounded(String(unit?displayToKg(Number(value),unit):Number(value)),unit?2000:2000/0.45359237):null);
  namedTitle=listed[3].trim();choice=activityChoices[5];
  if(count&&reps!==null&&loads.every(load=>load!==null)&&(loads.length===count||!!suffixed&&loads.length===1&&amounts.length===1)){
   actualSets={version:1,sets:Array.from({length:count},(_,index)=>({exercise:namedTitle!,reps,loadKg:unit?(loads.length===1?loads[0]:loads[index]):null,...(unit?{loadUnit:unit}:{unconfirmedLoad:loads.length===1?loads[0]!:loads[index]!}),completed:false}))};
  }else{needsSetReview=true;actualSets={version:1,sets:[]};}
 }else if(strength){const count=bounded(strength[1],100,true),reps=bounded(strength[2],1000,true),loadKg=bounded(strength[4],2000);if(count&&reps!==null&&loadKg!==null){actualSets={version:1,sets:Array.from({length:count},()=>({exercise:strength[3],reps,loadKg,completed:false}))};choice=activityChoices[5];}}
 // A named but unsupported strength phrase must lead to manual correction, not a generic success.
 if(!actualSets&&choice.id==='strength'&&/\bbench press\b/i.test(description)){namedTitle='Bench press';needsSetReview=true;actualSets={version:1,sets:[]};}
 const title=namedTitle?namedTitle.charAt(0).toUpperCase()+namedTitle.slice(1):choice.label;
 const capture:NonNullable<Activity['capture']>={version:1,method:'describe',description,activityId:choice.id,interpretation:choice.id==='other'||needsSetReview?'unclassified':'rule-suggestion'};
 return {title,minutes:minutes&&minutes>0?minutes:null,distanceM,actualSets,capture,
  notice:needsSetReview?'Set counts or amounts could not be matched. Add or correct each set; the original description is retained.':choice.id==='other'?'Choose the activity you meant, or keep Other activity. No specific match was assumed.':'Review this local suggestion. Only quantities you typed were filled; no effort, heart rate or calories were inferred.'};
}

export function activityAmountText(activity:Pick<Activity,'minutes'|'distanceM'|'components'>){
 const missing=activity.components?.items.filter(part=>part.minutes===null).length||0;
 const sets=activity.components?.items.flatMap(part=>part.actualSets?.sets||[]);
 return `${activity.minutes===null?'Duration not recorded':`${activity.minutes} minutes`}${missing&&activity.minutes!==null?` known · ${missing} duration(s) unrecorded`:''}${activity.distanceM==null?'':` · ${Number((activity.distanceM/1000).toFixed(3))} km reported`}${sets?.length?` · ${sets.length} set rows (completion recorded separately)`:''}`;
}

export function activityParts(activity:Activity,id=()=>crypto.randomUUID()):ActivityComponent[]{
 if(activity.components)return structuredClone(activity.components.items);
 return [{id:id(),title:activity.title,activityId:activity.capture?.activityId||'other',match:activity.capture?.interpretation==='rule-suggestion'?'suggested':activity.capture?.interpretation==='unclassified'?'unclassified':'reported',minutes:activity.minutes,distanceM:activity.distanceM??null,...(activity.actualSets?{actualSets:{version:1 as const,sets:activity.actualSets.sets.map(set=>({...set,id:set.id||id()}))}}:{})}];
}
export function describeActivityParts(description:string,id=()=>crypto.randomUUID()):ActivityDraftComponent[]{
 const chunks=description.split(/,\s*(?:then\s+)(?:did\s+)?|\s+then\s+(?:did\s+)?/i).map(value=>value.trim()).filter(Boolean);
 if(!chunks.length||chunks.length>20)throw Error('Review one to twenty activities at a time.');
 return chunks.map(chunk=>{const parsed=describeActivity(chunk),sets=parsed.actualSets;
  return {id:id(),title:sets?.sets[0]?.exercise?sets.sets[0].exercise.charAt(0).toUpperCase()+sets.sets[0].exercise.slice(1):parsed.title,activityId:parsed.capture.activityId,match:parsed.capture.interpretation==='unclassified'?'unclassified':'suggested',minutes:parsed.minutes,distanceM:parsed.distanceM,...(sets?{actualSets:{version:1 as const,sets:sets.sets.map(set=>({...set,id:id(),...(set.unconfirmedLoad!==undefined?{}:{loadUnit:set.loadUnit||'kg' as const})}))}}:{})};
 });
}
/** Compatibility projections; the child observations remain the source of truth. */
export function activityProjection(items:readonly ActivityComponent[]){
 const minutes=items.flatMap(part=>part.minutes===null?[]:[part.minutes]),distance=items.flatMap(part=>part.distanceM===null?[]:[part.distanceM]);
 const sets=items.flatMap(part=>part.actualSets?.sets||[]);
 return {title:items.length===1?items[0].title:`${items.length} activities`,minutes:minutes.length?minutes.reduce((a,b)=>a+b,0):null,distanceM:distance.length?distance.reduce((a,b)=>a+b,0):null,actualSets:{version:1 as const,sets}};
}

/** Calendar-window observations only; missing days are never zero movement. */
export function recordedActivityWeek(records:readonly {payload:Activity}[],now:Date){
 const start=new Date(+now);start.setHours(0,0,0,0);start.setDate(start.getDate()-6);
 const day=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const rows=records.filter(row=>{const at=Date.parse(row.payload.startedAt);return at>=+start&&at<=+now;});
 const minutes=rows.flatMap(row=>row.payload.components?row.payload.components.items.map(part=>part.minutes):[row.payload.minutes]);
 const known=minutes.filter((value):value is number=>value!==null);
 const types=Array.from(new Set(rows.flatMap(row=>row.payload.components?row.payload.components.items.map(part=>part.activityId):[row.payload.capture?.activityId||'unclassified'])));
 return {from:day(start),to:day(now),entries:rows.length,recordedDays:new Set(rows.map(row=>day(new Date(row.payload.startedAt)))).size,
  knownMinutes:known.length?known.reduce((a,b)=>a+b,0):null,missingDurations:minutes.length-known.length,
  labels:types.map(id=>id==='unclassified'?'Not classified':activityChoices.find(choice=>choice.id===id)!.label)};
}
