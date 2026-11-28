import {z} from 'zod';
import {exerciseCatalogueReferenceSchema} from './exercise-catalogue-reference';
import type {ExperienceRecord} from './experience';
export const symptomMovementHeader='X-Bloom-Symptom-Fields';
export const symptomMovementVersion='movement-response-v1';
export const symptomMovementRuleVersion='reported-movement-worsening-v1';
export const symptomMovementSchema=z.object({
 exercise:exerciseCatalogueReferenceSchema.refine(ref=>ref.confirmed,'Confirm the selected movement'),
 label:z.string().trim().min(1).max(120),response:z.enum(['better','unchanged','worse','unsure']),confirmedByUser:z.literal(true),
}).strict();
export type SymptomMovement=z.infer<typeof symptomMovementSchema>;
/** Response projection only. Private exports always retain complete source facts. */
export function legacySymptomMovementView<T>(body:T):T {
 const plain=(v:any):v is Record<string,any>=>!!v&&typeof v==='object'&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
 const walk=(v:any):any=>{if(Array.isArray(v))return v.map(walk);if(!plain(v))return v;if(v.kind==='localized-symptom'&&plain(v.payload)){const{movement,...payload}=v.payload;return{...v,payload};}return Object.fromEntries(Object.entries(v).map(([k,value])=>[k,walk(value)]));};
 if(plain(body)&&body.format==='bloom-experience-v1')return body;
 return walk(body)as T;
}
/** A source-scoped coaching hold, not a diagnosis or causal/anatomical inference.
 * Seven days is a display/relevance window, never medical clearance. Explicitly
 * ongoing worsening persists beyond it until the source is corrected/removed. */
export function movementProgressionSafety(exercise:z.infer<typeof exerciseCatalogueReferenceSchema>|undefined,source:{ownerId:string;available:boolean;records:readonly ExperienceRecord[]},options:{actorId:string;asOf:string}){
 if(!options.actorId.trim()||source.ownerId!==options.actorId)throw Error('SYMPTOM_MOVEMENT_SCOPE');
 const stamp=z.string().datetime({offset:true});if(!stamp.safeParse(options.asOf).success)throw Error('SYMPTOM_MOVEMENT_TIME');
 const matches:{recordId:string;revision:string;observedAt:string;response:'worse'}[]=[];
 const result=(state:'SAFETY_HOLD'|'NO_REPORTED_HOLD'|'SOURCE_UNAVAILABLE')=>({version:symptomMovementRuleVersion,state,matches,qualification:'User-reported movement response only; no injury or cause inferred. No reported hold is not medical clearance.'});
 if(!source.available)return result('SOURCE_UNAVAILABLE');
 if(source.records.length>5000)throw Error('SYMPTOM_MOVEMENT_LIMIT');
 const latest=new Map<string,Extract<ExperienceRecord,{kind:'localized-symptom'}>>(),ambiguous=new Set<string>(),invalid=new Set<string>(),related=new Set<string>();
 for(const record of source.records){
  if((record as ExperienceRecord&{userId?:string}).userId!==undefined&&(record as any).userId!==options.actorId)throw Error('SYMPTOM_MOVEMENT_SCOPE');
  if(record.kind!=='localized-symptom')continue;
  if(exercise?.confirmed&&record.payload.movement?.exercise.id===exercise.id&&record.payload.movement.exercise.version===exercise.version)related.add(record.id);
  if(!stamp.safeParse(record.updatedAt).success){invalid.add(record.id);continue;}
  const old=latest.get(record.id);
  if(!old||Date.parse(record.updatedAt)>Date.parse(old.updatedAt)){latest.set(record.id,record);ambiguous.delete(record.id);}
  else if(record.updatedAt===old.updatedAt&&JSON.stringify(record.payload)!==JSON.stringify(old.payload))ambiguous.add(record.id);
 }
 if(!exercise?.confirmed)return result('NO_REPORTED_HOLD');
 if(Array.from(related).some(id=>ambiguous.has(id)||invalid.has(id)))return result('SOURCE_UNAVAILABLE');
 const now=Date.parse(options.asOf),windowStart=now-7*86400000;
 for(const record of Array.from(latest.values())){
  const p=record.payload,m=p.movement;if(!m?.confirmedByUser||!m.exercise.confirmed||m.exercise.id!==exercise.id||m.exercise.version!==exercise.version)continue;
  if(ambiguous.has(record.id)||Date.parse(record.updatedAt)>now)return result('SOURCE_UNAVAILABLE');
  const observed=Date.parse(p.observedAt);
  if(!stamp.safeParse(p.observedAt).success||observed>now||p.ongoing===false||m.response!=='worse')continue;
  if(observed<windowStart&&p.ongoing!==true)continue;
  matches.push({recordId:record.id,revision:p.revision,observedAt:p.observedAt,response:'worse'});
 }
 matches.sort((a,b)=>b.observedAt.localeCompare(a.observedAt)||a.recordId.localeCompare(b.recordId));
 return result(matches.length?'SAFETY_HOLD':'NO_REPORTED_HOLD');
}
