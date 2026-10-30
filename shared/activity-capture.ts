import type {Activity,ActualSets,ActivityComponent} from './experience';
import {kgToDisplay,displayToKg} from './display-units';

/** Unresolved unitless quantities exist only in the editable draft, never canonical storage. */
export type ActivityDraftSet = ActualSets['sets'][number] & {unconfirmedLoad?:number;defaultedLoadUnit?:true};
export type ActivityDraftSets = {version:1;sets:ActivityDraftSet[]};
export type ActivityDraftComponent = Omit<ActivityComponent,'actualSets'> & {actualSets?:ActivityDraftSets};
export function confirmDraftLoadUnit(set:ActivityDraftSet,unit:'kg'|'lb'):ActivityDraftSet {
 const {unconfirmedLoad,defaultedLoadUnit,...confirmed}=set;
 return {...confirmed,loadUnit:unit,...(unconfirmedLoad!==undefined?{loadKg:displayToKg(unconfirmedLoad,unit)}:{})};
}
export const unresolvedActivityLoads=(items:readonly ActivityDraftComponent[])=>items.reduce((total,item)=>total+(item.actualSets?.sets.filter(set=>set.unconfirmedLoad!==undefined&&!set.loadUnit).length||0),0);

/** A saved body-weight unit supplies an editable default, not a unit reported in text. */
export function defaultActivityLoadUnits(items:ActivityDraftComponent[],unit:'kg'|'lb'):ActivityDraftComponent[] {
 if(!unresolvedActivityLoads(items))return items;
 return items.map(item=>({...item,...(item.actualSets?{actualSets:{version:1 as const,sets:item.actualSets.sets.map(set=>set.unconfirmedLoad!==undefined&&!set.loadUnit?{...set,loadUnit:unit,loadKg:displayToKg(set.unconfirmedLoad,unit),defaultedLoadUnit:true as const}:set)}}:{})}));
}
/** Remove browser-only source quantities only after their unit is resolved/defaulted. */
export function canonicalActivityParts(items:readonly ActivityDraftComponent[]):ActivityComponent[] {
 if(unresolvedActivityLoads(items))throw Error('Resolve reported load units before saving.');
 return items.map(item=>({...item,...(item.actualSets?{actualSets:{version:1 as const,sets:item.actualSets.sets.map(set=>{const {unconfirmedLoad,defaultedLoadUnit,...canonical}=set;return {...canonical,...(unconfirmedLoad!==undefined?{loadKg:displayToKg(unconfirmedLoad,canonical.loadUnit!)}:{})};})}}:{})}));
}

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
 const text=description.trim(),loadUnits='kg|kgs|kilograms?|lb|lbs|pounds?';
 // Parse quantities independently of the exercise vocabulary. Identity stays source text.
 const head=text.match(/^(?:did\s+)?(\d+)\s*(?:sets?\s+of|[x×])\s*(.+?)[.!]?$/i);
 const repFirst=head?.[2].match(/^(\d+)\s+(?:reps?\s+(?:of\s+)?)?(.+)$/i);
 const nameFirst=head?.[2].match(/^(.+?)\s+(?:for\s+)?(\d+)\s+reps?\s+(.+)$/i);
 let countText=head?.[1],repText=repFirst?.[1]||nameFirst?.[2],body=repFirst?.[2]||(nameFirst?`${nameFirst[1]} ${nameFirst[3]}`:undefined);
 // Existing name/load-before-repetitions phrasing remains supported by the same load parser.
 const reordered=head&&!repFirst&&!nameFirst?head[2].match(/^(.+?)\s+(?:for|at)\s+(.+?)\s+for\s+(\d+)\s+reps?$/i):null;
 if(reordered){repText=reordered[3];body=`${reordered[1]} at ${reordered[2]}`;}
 const parentheses=body?.match(new RegExp(`^(.+?)\\s*\\(([^()]+)\\)\\s*(${loadUnits})?$`,'i'));
 const plain=body?.match(new RegExp(`^(.+?)\\s+(?:for|at)\\s+(.+?)\\s*(${loadUnits})?$`,'i'));
 const inside=parentheses?.[2].trim().match(new RegExp(`^(.*?)\\s*(${loadUnits})$`,'i'));
 const canonicalUnit=(value:string|undefined)=>value?/^(lb|pound)/i.test(value)?'lb' as const:'kg' as const:undefined;
 const outsideUnit=canonicalUnit(parentheses?.[3]||plain?.[3]),insideUnit=canonicalUnit(inside?.[2]),unit=outsideUnit||insideUnit;
 let actualSets:ActivityDraftSets|undefined,needsSetReview=false,namedTitle:string|undefined;
 if(head&&repText&&body){
  const name=(parentheses?.[1]||plain?.[1]||body.split(/[()]/)[0]).replace(/\s+reps?$/i,'').trim();
  const count=bounded(countText,100,true),reps=bounded(repText,1000,true);
  const raw=parentheses?(inside?.[1]??parentheses[2]):plain?.[2];
  const amounts=raw?.split(',').map(value=>value.trim());
  const loads=amounts?.map(value=>/^\d+(?:\.\d+)?$/.test(value)?bounded(String(unit?displayToKg(Number(value),unit):Number(value)),unit?2000:2000/0.45359237):null);
  // Parentheses are an ordered list, never a silently repeated single value.
  const validLoads=loads?loads.every(load=>load!==null)&&(loads.length===count||!!plain&&loads.length===1):!/[()\d]/.test(body);
  namedTitle=name.length<=120?name:undefined;choice=activityChoices[5];
  if(name.length>0&&name.length<=120&&count&&reps!==null&&validLoads&&!(outsideUnit&&insideUnit&&outsideUnit!==insideUnit)){
   actualSets={version:1,sets:Array.from({length:count},(_,index)=>({exercise:name,reps,loadKg:loads&&unit?(loads.length===1?loads[0]:loads[index]):null,...(unit?{loadUnit:unit}:loads?{unconfirmedLoad:loads.length===1?loads[0]!:loads[index]!}:{}),completed:false}))};
  }else{needsSetReview=true;actualSets={version:1,sets:[]};}
 }
 // Unsupported counts still retain the written exercise label and a manual review path.
 if(!actualSets&&choice.id==='strength'){
  const unsupported=text.match(/^(?:did\s+)?\S+\s+sets?\s+of\s+(.{1,120})$/i);
  if(unsupported){namedTitle=unsupported[1].trim();needsSetReview=true;actualSets={version:1,sets:[]};}
 }
 const sourceLabel=choice.id==='other'?text.replace(/(?:^|\s)(?:for\s+|in\s+)?\d+(?:\.\d+)?\s*(?:minutes?|mins?|km|kilomet(?:er|re)s?|met(?:er|re)s?)\b/gi,' ').replace(/^(?:did|went)\s+/i,'').replace(/\s+(?:for|in)$/i,'').replace(/[.!]$/,'').trim():undefined;
 const reportedLabel=!!sourceLabel&&sourceLabel.length<=120;
 if(reportedLabel)namedTitle=sourceLabel;
 const title=namedTitle?namedTitle.charAt(0).toUpperCase()+namedTitle.slice(1):choice.label;
 const capture:NonNullable<Activity['capture']>={version:1,method:'describe',description,activityId:choice.id,interpretation:choice.id==='other'||needsSetReview?'unclassified':'rule-suggestion'};
 return {title,minutes:minutes&&minutes>0?minutes:null,distanceM,actualSets,capture,reportedLabel,
  notice:reportedLabel?'The reported activity name is retained; a specific classification has not been assumed.':needsSetReview?'Set counts or amounts could not be matched. Add or correct each set; the original description is retained.':choice.id==='other'?'Choose the activity you meant, or keep Other activity. No specific match was assumed.':'Review this local suggestion. Only quantities you typed were filled; no effort, heart rate or calories were inferred.'};
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
 const chunks:string[]=[];let depth=0,start=0;
 const separators=/(?:,\s*|\s+)then\s+(?:did\s+)?|;\s*(?:then\s+)?(?:did\s+)?|(?:\s+and\s+|,\s*)(?:did\s+)?(?=\d+\s*(?:sets?\s+of|[x×]))/gi;
 const levels:number[]=[];for(let index=0;index<description.length;index++){levels[index]=depth;if(description[index]==='(')depth++;else if(description[index]===')')depth=Math.max(0,depth-1);}
 for(const match of Array.from(description.matchAll(separators))){if(levels[match.index!]!==0)continue;const chunk=description.slice(start,match.index).trim();if(chunk)chunks.push(chunk);start=match.index!+match[0].length;}
 const last=description.slice(start).trim();if(last)chunks.push(last);
 if(!chunks.length||chunks.length>20)throw Error('Review one to twenty activities at a time.');
 return chunks.map(chunk=>{const parsed=describeActivity(chunk),sets=parsed.actualSets;
  return {id:id(),title:sets?.sets[0]?.exercise?sets.sets[0].exercise.charAt(0).toUpperCase()+sets.sets[0].exercise.slice(1):parsed.title,activityId:parsed.capture.activityId,match:parsed.reportedLabel?'reported':parsed.capture.interpretation==='unclassified'?'unclassified':'suggested',minutes:parsed.minutes,distanceM:parsed.distanceM,...(sets?{actualSets:{version:1 as const,sets:sets.sets.map(set=>({...set,id:id(),...(set.loadUnit?{loadUnit:set.loadUnit}:{})}))}}:{})};
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

/** Parent facts use reviewed children only; never infer completion or fill missing metrics. */
export function activitySetSummary(sets:readonly ActivityDraftSet[],fallbackUnit:'kg'|'lb') {
 const parts=[`${sets.length} ${sets.length===1?'set':'sets'}`];
 if(sets.length&&sets.every(set=>set.reps!==null&&set.reps===sets[0].reps))parts.push(`${sets[0].reps} reps each`);
 const unit=sets[0]?.loadUnit||fallbackUnit;
 if(sets.length&&sets.every(set=>(set.loadUnit||fallbackUnit)===unit&&set.loadKg!==null&&!(set.unconfirmedLoad!==undefined&&!set.loadUnit))){
  const amounts=sets.map(set=>Number((set.unconfirmedLoad??kgToDisplay(set.loadKg!,unit)).toFixed(3))),min=Math.min(...amounts),max=Math.max(...amounts);
  parts.push(`${min===max?min:`${min}–${max}`} ${unit}`);
 }
 return parts.join(' · ');
}
export function activityCompletionSummary(sets:readonly ActivityDraftSet[]) {
 return `${sets.filter(set=>set.completed&&set.state!=='planned'&&set.state!=='cancelled').length} of ${sets.length} completed`;
}
