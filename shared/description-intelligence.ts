import {z} from "zod";
export const DESCRIPTION_CONTRACT_VERSION="description-draft-v1";
export const DESCRIPTION_MAX_CHARS=4000;
export const DESCRIPTION_MAX_CANDIDATE_CHARS=131072;
export const descriptionDomainSchema=z.enum(["food","exercise","lifestyle"]);
export type DescriptionDomain=z.infer<typeof descriptionDomainSchema>;
const span=z.object({start:z.number().int().min(0).max(DESCRIPTION_MAX_CHARS),end:z.number().int().positive().max(DESCRIPTION_MAX_CHARS),quote:z.string().min(1).max(DESCRIPTION_MAX_CHARS)}).strict().refine(s=>s.end>s.start);
const text=z.object({value:z.string().min(1).max(300),source:span}).strict();
const quantity=z.object({value:z.number().finite().nonnegative().max(100000),unit:z.enum(["g","kg","lb","oz","ml","cup","slice","piece","serving","set","rep","min","h","km","m"]).nullable(),source:span,unitSource:span.nullable()}).strict();
const intent={intent:z.enum(["reported","planned","negated","uncertain"]),intentSource:span.nullable()};
const identity={source:span,name:text,...intent};
const food=z.object({...identity,portion:quantity.nullable(),preparation:text.nullable()}).strict();
const exercise=z.object({...identity,sets:quantity.nullable(),reps:quantity.nullable(),load:quantity.nullable(),duration:quantity.nullable(),distance:quantity.nullable(),perSetLoads:z.array(quantity).min(1).max(100).nullable(),completion:z.literal("not-confirmed")}).strict();
const lifestyle=z.object({source:span,description:text,duration:quantity.nullable(),...intent}).strict();
export const descriptionDraftSchema=z.discriminatedUnion("domain",[
 z.object({version:z.literal(DESCRIPTION_CONTRACT_VERSION),domain:z.literal("food"),items:z.array(food).min(1).max(20)}).strict(),
 z.object({version:z.literal(DESCRIPTION_CONTRACT_VERSION),domain:z.literal("exercise"),items:z.array(exercise).min(1).max(20)}).strict(),
 z.object({version:z.literal(DESCRIPTION_CONTRACT_VERSION),domain:z.literal("lifestyle"),items:z.array(lifestyle).min(1).max(20)}).strict(),
]);
export type DescriptionDraft=z.infer<typeof descriptionDraftSchema>;
export type DescriptionValidation={status:"source-grounded-draft";reviewRequired:true;draft:DescriptionDraft}|{status:"needs-review";reviewRequired:true;issues:string[]};
const aliases:Record<string,string[]>={g:["g","gram","grams"],kg:["kg","kgs","kilogram","kilograms"],lb:["lb","lbs","pound","pounds"],oz:["oz","ounce","ounces"],ml:["ml","milliliter","milliliters","millilitre","millilitres"],cup:["cup","cups"],slice:["slice","slices"],piece:["piece","pieces"],serving:["serving","servings"],set:["set","sets"],rep:["rep","reps","repetition","repetitions"],min:["min","mins","minute","minutes"],h:["h","hr","hour","hours"],km:["km","kilometer","kilometers","kilometre","kilometres"],m:["m","meter","meters","metre","metres"]};
const numbers:Record<string,number>={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,half:0.5};
function literalNumber(token:string){const s=token.trim().toLowerCase();if(Object.hasOwn(numbers,s))return numbers[s];if(/^\d+(?:\.\d+)?$/.test(s))return Number(s);const fraction=s.match(/^(\d+)\/(\d+)$/);return fraction&&Number(fraction[2])!==0?Number(fraction[1])/Number(fraction[2]):null;}
/** Structural/source fidelity is necessary, not proof of correct interpretation.
 * No catalogue, guessed mass, nutrients, completion, diagnosis or action output. */
export function validateDescriptionDraft(input:string,domain:DescriptionDomain,candidate:unknown):DescriptionValidation{
 const reject=(issues:string[]):DescriptionValidation=>({status:"needs-review",reviewRequired:true,issues:Array.from(new Set(issues)).slice(0,30)});
 if(typeof input!=="string"||!input.trim()||input.length>DESCRIPTION_MAX_CHARS)return reject(["input-limit"]);
 const parsed=descriptionDraftSchema.safeParse(candidate);if(!parsed.success)return reject(["draft-schema"]);
 const draft=parsed.data;if(draft.domain!==domain)return reject(["domain-mismatch"]);
 const issues:string[]=[];
 const checkSpan=(s:z.infer<typeof span>,parent?:z.infer<typeof span>)=>{
  if(input.slice(s.start,s.end)!==s.quote||s.end>input.length)issues.push("unsupported-source-span");
  if(parent&&(s.start<parent.start||s.end>parent.end))issues.push("source-outside-item");
 };
 const ordered=draft.items.map(i=>i.source).slice().sort((a,b)=>a.start-b.start);
 for(let n=1;n<ordered.length;n++)if(ordered[n].start<ordered[n-1].end)issues.push("overlapping-items");
 for(const item of draft.items){
  checkSpan(item.source);
  if("load"in item&&item.load&&item.perSetLoads)issues.push("ambiguous-load-fields");
  const label="name"in item?item.name:item.description;checkSpan(label.source,item.source);
  if(label.value!==label.source.quote.trim())issues.push("unsupported-identity");
  if(item.intentSource)checkSpan(item.intentSource,item.source);else if(item.intent!=="uncertain")issues.push("intent-source-missing");
  if(/\b(?:not|never|no|didn't|did not|without|skipped)\b/i.test(item.source.quote)&&item.intent!=="negated"&&item.intent!=="uncertain")issues.push("negation-needs-review");
  if(/\b(?:tomorrow|plan|planned|will|intend)\b/i.test(item.source.quote)&&item.intent==="reported")issues.push("future-needs-review");
  if("preparation"in item&&item.preparation){checkSpan(item.preparation.source,item.source);if(item.preparation.value!==item.preparation.source.quote.trim())issues.push("unsupported-preparation");}
  const seenQuantities=new Set<string>();
  for(const field of ["portion","sets","reps","load","duration","distance","perSetLoads"] as const){
   if(!(field in item))continue;const entry=(item as unknown as Record<string,z.infer<typeof quantity>|z.infer<typeof quantity>[]|null>)[field];if(!entry)continue;
   const quantities=Array.isArray(entry)?entry:[entry];
   if(field==="perSetLoads"&&"sets"in item&&(!item.sets||item.sets.value!==quantities.length))issues.push("per-set-count-mismatch");
   for(let index=0;index<quantities.length;index++){const q=quantities[index];if(index&&q.source.start<quantities[index-1].source.end)issues.push("per-set-source-order");
   checkSpan(q.source,item.source);if(literalNumber(q.source.quote)!==q.value)issues.push("unsupported-quantity");
   const position=`${q.source.start}:${q.source.end}`;if(seenQuantities.has(position))issues.push("reused-quantity-source");seenQuantities.add(position);
   const before=input[q.source.start-1]??"",after=input[q.source.end]??"";
   if(/^[a-z]+$/i.test(q.source.quote)?/[a-z]/i.test(before)||/[a-z]/i.test(after):/[0-9.\/−+-]/.test(before)||/[0-9.\/]/.test(after))issues.push("partial-quantity-token");
   if(q.unit===null){if(q.unitSource!==null)issues.push("unit-source-mismatch");if(field!=="load"&&field!=="perSetLoads"&&field!=="portion")issues.push("unit-needs-review");}
   else{if(!q.unitSource)issues.push("unit-source-missing");else{checkSpan(q.unitSource,item.source);if(!aliases[q.unit].includes(q.unitSource.quote.trim().toLowerCase()))issues.push("unsupported-unit");if(/[a-z]/i.test(input[q.unitSource.start-1]??"")||/[a-z]/i.test(input[q.unitSource.end]??""))issues.push("partial-unit-token");}}
   const allowed:Array<string|null>=field==="sets"?["set"]:field==="reps"?["rep"]:field==="duration"?["min","h"]:field==="distance"?["km","m"]:(field==="load"||field==="perSetLoads")?["kg","lb",null]:["g","kg","lb","oz","ml","cup","slice","piece","serving",null];
   if(!allowed.includes(q.unit))issues.push("domain-unit-mismatch");
   if((field==="sets"||field==="reps")&&!Number.isInteger(q.value))issues.push("noninteger-count");
   if(field==="sets"&&(q.value<1||q.value>100)||field==="reps"&&q.value>1000)issues.push("count-bound");
   }
  }
 }
 return issues.length?reject(issues):{status:"source-grounded-draft",reviewRequired:true,draft};
}
