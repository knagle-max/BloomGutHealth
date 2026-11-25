import {giSourceContextSchema,giSourceTimeSchema,type GiSourceContext} from './gi-source-context';

type Fields={get:(key:string)=>unknown};
/** Source corrections preserve stable event identities and all untouched context.
 * Form blanks never become numeric zero or an inferred effective timestamp. */
export function correctGiSource(original:GiSourceContext,fields:Fields):GiSourceContext {
 const next=structuredClone(original);
 const text=(key:string)=>String(fields.get(key)??'').trim();
 const number=(key:string)=>text(key)===''?null:Number(text(key));
 const correctedTime=(prefix:string,prior:unknown)=>{
  if(fields.get(prefix+'precision')===null)return prior;
  const precision=text(prefix+'precision');
  if(precision==='not-recorded')return undefined;
  if(precision==='unknown')return {precision:'unknown'};
  return giSourceTimeSchema.parse({precision,...(precision==='date'?{date:text(prefix+'date')}:{at:text(prefix+'at')}),
   ...(text(prefix+'timeZone')?{timeZone:text(prefix+'timeZone')}:(prior&&typeof prior==='object'&&'timeZone'in prior&&prior.timeZone===null?{timeZone:null}:{}))});
 };
 if(next.symptoms)next.symptoms=next.symptoms.flatMap(event=>{
  const prefix=`symptom.${event.id}.`;
  if(fields.get(prefix+'type')===null)return [event];
  if(text(prefix+'remove')==='yes')return [];
  const {onset:_prior,recurrence:_recurrence,...base}=event,onset=correctedTime(prefix,event.onset);
  return [{...base,type:text(prefix+'type'),...(onset!==undefined?{onset}:{}),
   ...(fields.get(prefix+'severity')!==null&&(text(prefix+'severity')!==''||event.severity!==undefined)?{severity:number(prefix+'severity')}:{}),
   ...(fields.get(prefix+'duration')!==null&&(text(prefix+'duration')!==''||event.durationMinutes!==undefined)?{durationMinutes:number(prefix+'duration')}:{}),
   ...(fields.get(prefix+'recurrence')===null?(event.recurrence!==undefined?{recurrence:event.recurrence}:{}):text(prefix+'recurrence')?{recurrence:text(prefix+'recurrence')}:{}),
  }] as typeof next.symptoms;
 });
 if(next.conditions&&fields.get('condition.assertion')!==null){
  next.conditions={...next.conditions,assertion:text('condition.assertion') as typeof next.conditions.assertion,entries:next.conditions.entries.flatMap(event=>{
   const prefix=`condition.${event.id}.`;
   if(fields.get(prefix+'name')===null)return [event];
   if(text(prefix+'remove')==='yes')return [];
   const {effective:_prior,...base}=event,effective=correctedTime(prefix,event.effective);
   return [{...base,name:text(prefix+'name'),state:text(prefix+'state'),...(effective!==undefined?{effective}:{})}] as typeof next.conditions.entries;
  })};
 }
 const bristol=text('bristol'),straining=text('straining');
 if(bristol!==''||straining!==''||next.bowel){
  const bowel={...next.bowel};
  if(fields.get('bristol')!==null){if(bristol!=='')bowel.bristol=Number(bristol);else if(Object.hasOwn(bowel,'bristol'))bowel.bristol=null;}
  if(fields.get('straining')!==null){if(straining!=='')bowel.straining=straining as 'yes'|'no'|'unknown';else delete bowel.straining;}
  next.bowel=bowel;
 }
 if(fields.get('bowel.count')!==null){
  const bowel:any={...next.bowel};
  if(text('bowel.count')!==''||text('bowel.periodDays')!==''){
   if(text('bowel.count')===''||text('bowel.periodDays')==='')throw Error('Provide both bowel frequency and its time period.');
   bowel.frequency={count:Number(text('bowel.count')),periodDays:Number(text('bowel.periodDays'))};
  }else if(bowel.frequency!==undefined)bowel.frequency=null;
  for(const key of ['incompleteEmptying','reliefAfterBowelMovement']){
   if(fields.get('bowel.'+key)===null)continue;
   if(text('bowel.'+key))bowel[key]=text('bowel.'+key);else delete bowel[key];
  }
  const effective=correctedTime('bowel.',bowel.effective);delete bowel.effective;if(effective!==undefined)bowel.effective=effective;
  if(Object.keys(bowel).length)next.bowel=bowel;
 }
 if(next.warnings&&fields.get('warning.bloodInStool')!==null){
  const warnings:any={...next.warnings};
  for(const key of ['bloodInStool','majorActiveBleeding','fainting','severePersistentPain','persistentNewBowelChange']){
   if(fields.get('warning.'+key)===null)continue;
   if(text('warning.'+key))warnings[key]=text('warning.'+key);else delete warnings[key];
  }
  const effective=correctedTime('warning.',warnings.effective);delete warnings.effective;if(effective!==undefined)warnings.effective=effective;
  next.warnings=warnings;
 }
 if(next.weightLoss&&fields.get('weight.intent')!==null){
  const weight:any={...next.weightLoss,intent:text('weight.intent')};
  for(const key of ['amount','overDays'])if(fields.get('weight.'+key)!==null&&(text('weight.'+key)!==''||weight[key]!==undefined))weight[key]=number('weight.'+key);
  if(fields.get('weight.unit')!==null){if(text('weight.unit'))weight.unit=text('weight.unit');else delete weight.unit;}
  const effective=correctedTime('weight.',weight.effective);delete weight.effective;if(effective!==undefined)weight.effective=effective;
  next.weightLoss=weight;
 }
 if(next.menstrualPelvic&&fields.get('pelvic.pelvicPain')!==null){
  const pelvic:any={...next.menstrualPelvic};
  if(text('pelvic.pelvicPain')!==''||pelvic.pelvicPain!==undefined)pelvic.pelvicPain=number('pelvic.pelvicPain');
  // Reproductive controls absent through eligibility keep original values.
  if(fields.get('pelvic.bleeding')!==null){
   for(const key of ['bleeding','dysmenorrhea']){if(fields.get('pelvic.'+key)===null)continue;if(text('pelvic.'+key))pelvic[key]=text('pelvic.'+key);else delete pelvic[key];}
   if(fields.get('pelvic.reportedCycleDay')!==null&&(text('pelvic.reportedCycleDay')!==''||pelvic.reportedCycleDay!==undefined))pelvic.reportedCycleDay=number('pelvic.reportedCycleDay');
   if(pelvic.periods)pelvic.periods=pelvic.periods.flatMap((period:any,index:number)=>{
    const prefix=`pelvic.period.${index}.`;if(fields.get(prefix+'startedOn')===null)return [period];if(text(prefix+'remove')==='yes')return [];
    return [{startedOn:text(prefix+'startedOn'),...(text(prefix+'endedOn')||period.endedOn!==undefined?{endedOn:text(prefix+'endedOn')||null}:{})}];
   });
  }
  const effective=correctedTime('pelvic.',pelvic.effective);delete pelvic.effective;if(effective!==undefined)pelvic.effective=effective;
  next.menstrualPelvic=pelvic;
 }
 if(next.exposures)next.exposures=next.exposures.flatMap(event=>{
  const prefix=`exposure.${event.id}.`;
  if(fields.get(prefix+'name')===null)return [event];
  if(text(prefix+'remove')==='yes')return [];
  const effectivePrecision=text(prefix+'precision');
  const effective=effectivePrecision==='not-recorded'?undefined:effectivePrecision==='unknown'?{precision:'unknown' as const}:giSourceTimeSchema.parse({
   precision:effectivePrecision,
   ...(effectivePrecision==='date'?{date:text(prefix+'date')}:{at:text(prefix+'at')}),
   ...(text(prefix+'timeZone')?{timeZone:text(prefix+'timeZone')}:(event.effective&&'timeZone'in event.effective&&event.effective.timeZone===null?{timeZone:null}:{})),
  });
  const amount=number(prefix+'amount'),unit=text(prefix+'unit')||null,ingredient=text(prefix+'ingredient');
  const dose=event.dose||amount!==null||unit!==null?{amount,unit}:undefined;
  const ingredientSource=ingredient?{provenance:'user-reported-label-text' as const,text:ingredient}:event.ingredientSource===null?null:undefined;
  const {effective:_priorTime,dose:_priorDose,ingredientSource:_priorIngredient,...base}=event;
  return [{...base,name:text(prefix+'name'),kind:text(prefix+'kind') as typeof event.kind,
   change:text(prefix+'change') as typeof event.change,useStatus:text(prefix+'useStatus') as typeof event.useStatus,
   ...(effective!==undefined?{effective}:{}),...(dose!==undefined?{dose}:{}),...(ingredientSource!==undefined?{ingredientSource}:{}),
  }];
 });
 return giSourceContextSchema.parse(next);
}
