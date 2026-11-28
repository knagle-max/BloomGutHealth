import {z} from 'zod';
import type {ActualSets} from './experience';
export const setContextHeader='X-Bloom-Set-Fields';
export const setContextVersion='load-context-v2';
/** User-reported measurement semantics, not measured activation or an equipment inventory. */
export const setLoadContextSchema=z.object({
 version:z.literal(1),
 setRole:z.enum(['working','warm-up']).nullable().optional(),
 effortRpe:z.number().min(1).max(10).nullable().optional(),
 convention:z.enum(['barbell-total','per-dumbbell','combined-dumbbell','single-limb','machine-stack','assistance','bodyweight','external-total']),
 equipmentKey:z.string().trim().min(1).max(120).refine(v=>!/[\u0000-\u001f\u007f]/.test(v),'Use a plain equipment label'),
}).strict();
export type SetLoadContext=z.infer<typeof setLoadContextSchema>;
/** A new occurrence may reuse equipment/role, never the previous occurrence's effort. */
export function freshSetLoadContext(context:SetLoadContext|null|undefined){return context?{...context,effortRpe:null}:context;}


/** Preserve omitted metadata only through a unique stable identity. Null clears;
 * an empty set list deletes; a new exercise never inherits the previous context. */
export function mergeSetLoadContexts(previous:ActualSets|undefined,next:ActualSets|undefined):ActualSets|undefined {
 const clone=(sets:ActualSets):ActualSets=>({...sets,sets:sets.sets.map(s=>({...s,...(s.loadContext?{loadContext:{...s.loadContext}}:{})}))});
 if(next===undefined)return previous?clone(previous):undefined;
 const prior=new Map<string,ActualSets['sets'][number]|null>();
 for(const set of previous?.sets??[]){if(!set.id)continue;const key=set.id.toLowerCase();prior.set(key,prior.has(key)?null:set);}
 return{...next,sets:next.sets.map(set=>{
  const old=set.id?prior.get(set.id.toLowerCase()):null;
  const same=old&&old.exercise===set.exercise&&!(old.catalogueRef&&set.catalogueRef&&old.catalogueRef.id!==set.catalogueRef.id);
  let context=set.loadContext===undefined&&same?old.loadContext:set.loadContext;
  if(context&&same&&old.loadContext?.convention===context.convention&&old.loadContext.equipmentKey===context.equipmentKey){
   context={...context,...(context.setRole===undefined&&old.loadContext.setRole!==undefined?{setRole:old.loadContext.setRole}:{}),...(context.effortRpe===undefined&&old.loadContext.effortRpe!==undefined?{effortRpe:old.loadContext.effortRpe}:{})};
  }
  return{...set,...(context!==undefined?{loadContext:context?{...context}:null}:{})};
 })};
}

/** Old strict clients cannot parse added set fields. Project only the response,
 * never storage. Private exports retain complete originals regardless of reader. */
export function legacySetContextView<T>(body:T):T {
 const plain=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
 const sets=(v:any)=>plain(v)&&Array.isArray(v.sets)?{...v,sets:v.sets.map((s:any)=>{if(!plain(s))return s;const{loadContext,...legacy}=s;return legacy;})}:v;
 const components=(v:any)=>plain(v)&&Array.isArray(v.items)?{...v,items:v.items.map((p:any)=>plain(p)?{...p,...(p.actualSets?{actualSets:sets(p.actualSets)}:{})}:p)}:v;
 const plan=(v:any)=>plain(v)?{...v,...(v.components?{components:components(v.components)}:{})}:v;
 const payload=(v:any,kind:string)=>{
  if(!plain(v))return v;
  return{...v,...(v.actualSets?{actualSets:sets(v.actualSets)}:{}),...(v.components?{components:components(v.components)}:{}),
   ...(v.routineSource?.planSnapshot?{routineSource:{...v.routineSource,planSnapshot:plan(v.routineSource.planSnapshot)}}:{}),
   ...(kind==='activity-routine'?{plan:plan(v.plan),...(Array.isArray(v.priorPlans)?{priorPlans:v.priorPlans.map(plan)}:{})}:{})};
 };
 const walk=(v:any):any=>{
  if(Array.isArray(v))return v.map(walk);
  if(!plain(v))return v;
  if(['activity','session','activity-routine'].includes(v.kind)&&plain(v.payload))return{...v,payload:payload(v.payload,v.kind)};
  return Object.fromEntries(Object.entries(v).map(([k,value])=>[k,walk(value)]));
 };
 if(plain(body)&&body.format==='bloom-experience-v1')return body;
 return walk(body) as T;
}
