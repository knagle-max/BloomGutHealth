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
 const original=description,syntax=activitySyntax(description);description=syntax.text;
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
 const trailing=body?.match(new RegExp(`^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*(${loadUnits})$`,'i'));
 const inside=parentheses?.[2].trim().match(new RegExp(`^(.*?)\\s*(${loadUnits})$`,'i'));
 const canonicalUnit=(value:string|undefined)=>value?/^(lb|pound)/i.test(value)?'lb' as const:'kg' as const:undefined;
 const outsideUnit=canonicalUnit(parentheses?.[3]||plain?.[3]||trailing?.[3]),insideUnit=canonicalUnit(inside?.[2]),unit=outsideUnit||insideUnit;
 let actualSets:ActivityDraftSets|undefined,needsSetReview=false,namedTitle:string|undefined;
 if(head&&repText&&body){
  const name=(parentheses?.[1]||plain?.[1]||trailing?.[1]||body.split(/[()]/)[0]).replace(/\s+reps?$/i,'').trim();
  const count=bounded(countText,100,true),reps=bounded(repText,1000,true);
  const raw=parentheses?(inside?.[1]??parentheses[2]):plain?.[2]||trailing?.[2];
  const amounts=raw?.split(',').map(value=>value.trim());
  const loads=amounts?.map(value=>/^\d+(?:\.\d+)?$/.test(value)?bounded(String(unit?displayToKg(Number(value),unit):Number(value)),unit?2000:2000/0.45359237):null);
  // Parentheses are an ordered list, never a silently repeated single value.
  const validLoads=loads?loads.every(load=>load!==null)&&(loads.length===count||(!!plain||!!trailing)&&loads.length===1):!/[()\d]/.test(body);
  namedTitle=name.length<=120?name:undefined;choice=activityChoices[5];
  if(name.length>0&&name.length<=120&&count&&reps!==null&&validLoads&&!(outsideUnit&&insideUnit&&outsideUnit!==insideUnit)){
   actualSets={version:1,sets:Array.from({length:count},(_,index)=>({exercise:name,reps,loadKg:loads&&unit?(loads.length===1?loads[0]:loads[index]):null,...(unit?{loadUnit:unit}:loads?{unconfirmedLoad:loads.length===1?loads[0]!:loads[index]!}:{}),completed:false,...(syntax.bodyweight?{bodyweight:true as const}:{}),...(syntax.reportedBout?{reportedBout:true as const}:{}),...(syntax.state?{state:syntax.state}:{})}))};
  }else{needsSetReview=true;actualSets={version:1,sets:[]};}
 }
 // Unsupported counts still retain the written exercise label and a manual review path.
 if(!actualSets&&choice.id==='strength'){
  const unsupported=text.match(/^(?:did\s+)?\S+\s+sets?\s+of\s+(.{1,120})$/i);
  if(unsupported){namedTitle=unsupported[1].trim();needsSetReview=true;actualSets={version:1,sets:[]};}
 }
 const sourceLabel=(choice.id==='other'||choice.id==='strength'&&!namedTitle)?original.trim().replace(/(?:^|\s)(?:for\s+|in\s+)?\d+(?:\.\d+)?\s*(?:minutes?|mins?|km|kilomet(?:er|re)s?|met(?:er|re)s?)\b/gi,' ').replace(/^(?:did|went)\s+/i,'').replace(/\s+(?:for|in)$/i,'').replace(/[.!]$/,'').trim():undefined;
 const reportedLabel=!!sourceLabel&&sourceLabel.length<=120;
 if(sourceLabel){namedTitle=sourceLabel.length<=120?sourceLabel:sourceLabel.slice(0,117)+'…';if(sourceLabel.length>120)needsSetReview=true;}
 const title=namedTitle?namedTitle.charAt(0).toUpperCase()+namedTitle.slice(1):choice.label;
 const capture:NonNullable<Activity['capture']>={version:1,method:'describe',description:original,activityId:choice.id,interpretation:choice.id==='other'||needsSetReview?'unclassified':'rule-suggestion'};
 return {title,minutes:!syntax.state&&minutes&&minutes>0?minutes:null,distanceM:syntax.state?null:distanceM,actualSets,capture,reportedLabel,
  notice:reportedLabel?'The reported activity name is retained; a specific classification has not been assumed.':needsSetReview?'Set counts or amounts could not be matched. Add or correct each set; the original description is retained.':choice.id==='other'?'Choose the activity you meant, or keep Other activity. No specific match was assumed.':'Review this local suggestion. Only quantities you typed were filled; no effort, heart rate or calories were inferred.'};
}

export function activityAmountText(activity:Pick<Activity,'minutes'|'distanceM'|'components'|'steps'|'stepScope'|'routineSource'>){
 const stepObservations=activity.components?activity.components.items:[activity];
 const stepText=stepObservations.filter(part=>part.steps!==undefined||part.stepScope!==undefined).map(part=>`${part.steps==null?'Step count not recorded':`${part.steps.toLocaleString('en-CA')} steps`} (${part.stepScope==='whole-day'?'whole day, manual':part.stepScope==='session'?'session, manual':'scope not recorded'})`).join(' · ');
 const missing=activity.components?.items.filter(part=>part.minutes===null).length||0;
 const sets=activity.components?.items.flatMap(part=>part.actualSets?.sets||[]);
 return `${activity.minutes===null?'Duration not recorded':`${activity.minutes} minutes`}${missing&&activity.minutes!==null?` known · ${missing} duration(s) unrecorded`:''}${activity.distanceM==null?'':` · ${Number((activity.distanceM/1000).toFixed(3))} km reported`}${sets?.length?` · ${sets.length} set rows (completion recorded separately)`:''}${stepText?` · ${stepText}`:''}${activity.routineSource?` · Logged time, start not recorded · Routine: ${activity.routineSource.planSnapshot.name}${activity.routineSource.scheduledDate!==activity.routineSource.localDate?` (moved from ${activity.routineSource.scheduledDate})`:''}`:''}`;
}

export function activityParts(activity:Activity,id=()=>crypto.randomUUID()):ActivityComponent[]{
 if(activity.components)return structuredClone(activity.components.items);
 return [{id:id(),title:activity.title,activityId:activity.capture?.activityId||'other',match:activity.capture?.interpretation==='rule-suggestion'?'suggested':activity.capture?.interpretation==='unclassified'?'unclassified':'reported',minutes:activity.minutes,distanceM:activity.distanceM??null,...(activity.steps!==undefined?{steps:activity.steps}:{}),...(activity.stepScope!==undefined?{stepScope:activity.stepScope}:{}),...(activity.actualSets?{actualSets:{version:1 as const,sets:activity.actualSets.sets.map(set=>({...set,id:set.id||id()}))}}:{})}];
}
/** Structural fallback, not an exercise dictionary or an AI model. All clauses survive. */
export function activityDescriptionSpans(description:string){
 if(description.length>2000)throw Error('This description is longer than 2,000 characters. Your text is unchanged; split it into separate entries before reviewing.');
 const spans:Array<{start:number;end:number;text:string}>=[];let start=0,depth=0,quote='';
 const add=(end:number)=>{let a=start,b=end;while(a<b&&/[\s,;.]/.test(description[a]))a++;while(b>a&&/[\s,;.]/.test(description[b-1]))b--;if(a<b)spans.push({start:a,end:b,text:description.slice(a,b)});};
 for(let index=0;index<description.length;index++){
  const c=description[index];if(quote){if(c===quote)quote='';continue;}
  if(c==='"'||c==='“'){quote=c==='“'?'”':c;continue;}
  if(c==='('||c==='['){depth++;continue;}if(c===')'||c===']'){depth=Math.max(0,depth-1);continue;}if(depth)continue;
  const tail=description.slice(index),left=description.slice(start,index);
  let length=0;
  if(c===';')length=1;
  else if(c===','&&!(/\d(?:\.\d+)?[\s,]*$/.test(left)&&/^,[,\s]*[-+]?\d/.test(tail)))length=1;
  else{const then=tail.match(/^\b(?:then|followed by)\s+(?:did\s+)?/i);if(then)length=then[0].length;
   else{const and=tail.match(/^\band\s+/i);if(and){const right=tail.slice(and[0].length);if(/^(?:did\s+)?\d/.test(right)||/^did\s+/i.test(right)||/\d/.test(left)&&/^[^,;]{1,120}?\s+\d+\s*(?:sets?\b|[x×]|reps?\b|mins?\b|minutes?\b)/i.test(right))length=and[0].length;}}
  }
  if(length){add(index);index+=length-1;start=index+1;}
 }
 add(description.length);if(!spans.length||spans.length>20)throw Error('Review one to twenty activities at a time. No activities were discarded; split a longer description into separate entries.');return spans;
}
/** Normalize syntax only. Unknown movement names remain source-named and editable. */
function activitySyntax(source:string){
 let text=source.trim().replace(/[,.!;]+$/,'').trim(),reportedBout=false,bodyweight=false;
 const state=/^(?:I\s+)?(?:skipped|did\s+not|didn't|didn’t|not\s+performed)\b/i.test(text)?'cancelled' as const:/^(?:I\s+)?(?:will|plan(?:ned)?\s+to|planning\s+to)\b/i.test(text)?'planned' as const:undefined;
 if(state)text=text.replace(/^(?:I\s+)?(?:skipped|did\s+not|didn't|didn’t|not\s+performed|will|plan(?:ned)?\s+to|planning\s+to)\s+(?:do\s+)?/i,'');
 text=text.replace(/^(?:I\s+)?(?:did|performed|completed)\s+/i,'');
 const named=text.match(/^(.+?)\s+(?:for\s+)?(\d+)\s*(?:sets?\s+(?:of\s+)?|[x×]\s*)(\d+)\s*(?:reps?\s*)?(.*)$/i);
 if(named)text=`${named[2]} sets of ${named[3]} reps of ${named[1].trim()}${named[4]?' '+named[4]:''}`;
 if(!/^\d+\s*(?:sets?\b|[x×])/i.test(text)){
  const counted=text.match(/^(\d+)\s+(?:(?:reps?|repetitions?)\s+(?:of\s+)?)?(.+)$/i),namedReps=text.match(/^(.+?)\s+(\d+)\s+(?:reps?|repetitions?)$/i);
  const name=counted?.[2]||namedReps?.[1],count=counted?.[1]||namedReps?.[2];
  if(name&&count&&!/^(?:min(?:ute)?s?|secs?|seconds?|hours?|h|km|m|mi|miles?|meters?|metres?|kilo(?:meters?|metres?)|kg|kgs|lbs?|pounds?|rounds?|laps?|steps?|floors?|flights?|calories?|bpm|watts?)\b/i.test(name)){
   const movement=name.replace(/^push[ -]?ups?\b/i,match=>/s$/i.test(match)?'push-ups':'push-up');
   text=`1 set of ${count} reps of ${movement}`;reportedBout=true;
  }
 }
 bodyweight=/\bbody[ -]?weight\b/i.test(source)||/\bpush[ -]?ups?\b/i.test(source)&&!/(?:\bweighted\b|\d\s*(?:kg|lbs?|pounds?))/i.test(source);
 return{text,reportedBout,bodyweight,state};
}

export function describeActivityParts(description:string,id=()=>crypto.randomUUID()):ActivityDraftComponent[]{
 return activityDescriptionSpans(description).map(span=>{const parsed=describeActivity(span.text),sets=parsed.actualSets;
  return {id:id(),title:sets?.sets[0]?.exercise?sets.sets[0].exercise.charAt(0).toUpperCase()+sets.sets[0].exercise.slice(1):parsed.title,activityId:parsed.capture.activityId,match:parsed.reportedLabel?'reported':parsed.capture.interpretation==='unclassified'?'unclassified':'suggested',minutes:parsed.minutes,distanceM:parsed.distanceM,sourceSpan:{start:span.start,end:span.end},...(sets?{actualSets:{version:1 as const,sets:sets.sets.map(set=>({...set,id:id(),...(set.loadUnit?{loadUnit:set.loadUnit}:{})}))}}:{})};
 });
}
/** Compatibility projections; the child observations remain the source of truth. */
export function activityProjection(items:readonly ActivityComponent[]){
 const minutes=items.flatMap(part=>part.minutes===null?[]:[part.minutes]),distance=items.flatMap(part=>part.distanceM===null?[]:[part.distanceM]);
 const sets=items.flatMap(part=>part.actualSets?.sets||[]);
 return {steps:items.length===1?items[0].steps??null:null,stepScope:items.length===1?items[0].stepScope??null:null,title:items.length===1?items[0].title:`${items.length} activities`,minutes:minutes.length?minutes.reduce((a,b)=>a+b,0):null,distanceM:distance.length?distance.reduce((a,b)=>a+b,0):null,actualSets:{version:1 as const,sets}};
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
 const bout=sets.length===1&&sets[0].reportedBout;const parts=[bout?'1 reported bout':`${sets.length} ${sets.length===1?'set':'sets'}`];
 if(sets.length&&sets.every(set=>set.reps!==null&&set.reps===sets[0].reps))parts.push(`${sets[0].reps} reps${bout?'':' each'}`);
 if(sets.length&&sets.every(set=>set.bodyweight&&set.loadKg===null))parts.push('bodyweight');
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

/** Repeat is a fresh observation, never a copy of a prior actual count. */
export function repeatActivityParts(activity:Activity,id=()=>crypto.randomUUID()):ActivityComponent[]{
 return activityParts(activity,id).map(part=>({...part,id:id(),...(part.steps!==undefined?{steps:null}:{}),...(part.actualSets?{actualSets:{version:1 as const,sets:part.actualSets.sets.map(set=>({...set,id:id(),completed:false,state:'described' as const}))}}:{})}));
}
