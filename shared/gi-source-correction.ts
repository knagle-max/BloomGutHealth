import {giSourceContextSchema,giSourceTimeSchema,type GiSourceContext} from './gi-source-context';

type Fields={get:(key:string)=>unknown};
/** Source corrections preserve stable event identities and all untouched context.
 * Form blanks never become numeric zero or an inferred effective timestamp. */
export function correctGiSource(original:GiSourceContext,fields:Fields):GiSourceContext {
 const next=structuredClone(original);
 const text=(key:string)=>String(fields.get(key)??'').trim();
 const number=(key:string)=>text(key)===''?null:Number(text(key));
 const bristol=text('bristol'),straining=text('straining');
 if(bristol!==''||straining!==''||next.bowel){
  const bowel={...next.bowel};
  if(bristol!=='')bowel.bristol=Number(bristol);
  else if(Object.hasOwn(bowel,'bristol'))bowel.bristol=null;
  if(straining!=='')bowel.straining=straining as 'yes'|'no'|'unknown';
  else delete bowel.straining;
  next.bowel=bowel;
 }
 if(next.exposures)next.exposures=next.exposures.flatMap(event=>{
  const prefix=`exposure.${event.id}.`;
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
