import type {Activity,ActualSets,ActivityComponent} from './experience';

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
 let actualSets:ActualSets|undefined;
 if(strength){const count=bounded(strength[1],100,true),reps=bounded(strength[2],1000,true),loadKg=bounded(strength[4],2000);if(count&&reps!==null&&loadKg!==null){actualSets={version:1,sets:Array.from({length:count},()=>({exercise:strength[3],reps,loadKg,completed:false}))};choice=activityChoices[5];}}
 const capture:NonNullable<Activity['capture']>={version:1,method:'describe',description,activityId:choice.id,interpretation:choice.id==='other'?'unclassified':'rule-suggestion'};
 return {title:choice.label,minutes:minutes&&minutes>0?minutes:null,distanceM,actualSets,capture,
  notice:choice.id==='other'?'Choose the activity you meant, or keep Other activity. No specific match was assumed.':'Review this local suggestion. Only quantities you typed were filled; no effort, heart rate or calories were inferred.'};
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
export function describeActivityParts(description:string,id=()=>crypto.randomUUID()):ActivityComponent[]{
 const chunks=description.split(/,\s*(?:then\s+)(?:did\s+)?|\s+then\s+(?:did\s+)?/i).map(value=>value.trim()).filter(Boolean);
 if(!chunks.length||chunks.length>20)throw Error('Review one to twenty activities at a time.');
 return chunks.map(chunk=>{const parsed=describeActivity(chunk),sets=parsed.actualSets;
  return {id:id(),title:sets?.sets[0]?.exercise?sets.sets[0].exercise.charAt(0).toUpperCase()+sets.sets[0].exercise.slice(1):parsed.title,activityId:parsed.capture.activityId,match:parsed.capture.interpretation==='unclassified'?'unclassified':'suggested',minutes:parsed.minutes,distanceM:parsed.distanceM,...(sets?{actualSets:{version:1 as const,sets:sets.sets.map(set=>({...set,id:id(),loadUnit:'kg' as const}))}}:{})};
 });
}
/** Compatibility projections; the child observations remain the source of truth. */
export function activityProjection(items:readonly ActivityComponent[]){
 const minutes=items.flatMap(part=>part.minutes===null?[]:[part.minutes]),distance=items.flatMap(part=>part.distanceM===null?[]:[part.distanceM]);
 const sets=items.flatMap(part=>part.actualSets?.sets||[]);
 return {title:items.length===1?items[0].title:`${items.length} activities`,minutes:minutes.length?minutes.reduce((a,b)=>a+b,0):null,distanceM:distance.length?distance.reduce((a,b)=>a+b,0):null,actualSets:{version:1 as const,sets}};
}
