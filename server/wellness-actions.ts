import {foodSourceObservations} from './wellness-food-observations';
import type {Meal} from '../shared/schema';
import {createHash} from "node:crypto";
import {movementSourceObservations} from "./wellness-observations";
import {goalSources} from "../shared/goal-guidance";
import {wellnessActions,wellnessDaySchema,type WellnessDay,type WellnessActionView} from "../shared/wellness-actions";
import type {WellnessContext} from "../shared/wellness-context";
import type {ExperienceRecord,ExperienceSettings} from "../shared/experience";
export class WellnessChoiceConflict extends Error {
 constructor(readonly code:"source-changed"|"date-changed"|"not-eligible"|"intent-conflict"|"scope"|"limit"|"dedicated-action"){
  super(code==="limit"?"Your action choice history is full. Export or remove earlier choices; ordinary food and activity logging remain available.":code==="dedicated-action"?"Use the action choice controls to clear or delete this history.":"This action or its source changed. Review the current suggestion before saving a new choice.");
 }
}
export const wellnessDigest=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const wellnessChoiceId=(userId:string,intentId:string)=>"choice_"+wellnessDigest(["wellness-intent-v1",userId,intentId.toLowerCase()]);
export const wellnessChoiceRevision=(userId:string,payload:unknown)=>wellnessDigest(["wellness-choice-source-v1",userId,payload]);
const dateAt=(value:Date,offset:number)=>new Date(+value-offset*60000).toISOString().slice(0,10);
export function buildWellnessActionView({context,settings,day,sessions,activities,choices,food=null,now=new Date()}:{context:WellnessContext;settings:ExperienceSettings;day:WellnessDay;sessions:ExperienceRecord[]|null;activities:ExperienceRecord[]|null;choices:ExperienceRecord[];food?:{records:Meal[];limited:boolean}|null;now?:Date}):WellnessActionView{
 day=wellnessDaySchema.parse(day);
 const dateCurrent=Number.isFinite(+now)&&dateAt(now,day.timezoneOffset)===day.date;
 const lifecycleId=settings.lifecycleId??null;
 const records=choices.filter((r):r is ExperienceRecord&{kind:"wellness-choice"}=>r.kind==="wellness-choice");
 const history=records.filter(r=>r.payload.date===day.date).map(r=>({id:r.id,intentId:r.payload.intentId,actionId:r.payload.actionId,date:r.payload.date,choice:r.payload.choice,chosenAt:r.payload.chosenAt,revision:wellnessChoiceRevision(context.accountScope,r.payload),timezoneOffset:r.payload.timezoneOffset,lifecycleId:r.payload.lifecycleId,requestRevision:r.payload.requestRevision,actionVersion:r.payload.actionVersion,contextRevision:r.payload.contextRevision,evidenceVersion:r.payload.evidenceVersion}));
 const calendarKnown=sessions!==null&&activities!==null;
 const calendar=[...(sessions??[]),...(activities??[])].filter(r=>r.kind==="session"||r.kind==="activity").filter(r=>dateAt(new Date(r.kind==="session"?r.payload.startsAt:r.payload.startedAt),day.timezoneOffset)===day.date);
 const calendarVersion=wellnessDigest(calendar.map(r=>({id:r.id,kind:r.kind,updatedAt:r.updatedAt,payload:r.payload})).sort((a,b)=>a.id.localeCompare(b.id)));
 const hasSession=calendar.some(r=>r.kind==="session"&&r.payload.status!=="cancelled"&&dateAt(new Date(r.payload.startsAt),day.timezoneOffset)===day.date);
 const hasActivity=calendar.some(r=>r.kind==="activity"&&dateAt(new Date(r.payload.startedAt),day.timezoneOffset)===day.date);
 const adultContext=context.constraints.ageGroup==="adult"&&context.constraints.pregnancy==="no"&&context.constraints.safetyReviewed&&context.constraints.conditions!==null&&context.constraints.conditions.length===0&&context.constraints.medications!==null&&context.constraints.medications.length===0&&!settings.athlete.needsClinicalReview;
 const actions=wellnessActions.map(action=>{
  let eligible=dateCurrent,reason=action.category==="routine"?"A journal entry keeps actual intake separate from guesses. No optional tests or device are needed.":"This is general guidance for your recorded context, not a predicted personal outcome.";
  if(!["app-routine","general-wellness-preview"].includes(action.outputClass)){eligible=false;reason="This action class is unavailable.";}
  else if(!dateCurrent)reason="The local day changed. Refresh the suggestion before saving a choice.";
  else if(action.sourceIds.some(id=>!goalSources.some(s=>s.id===id))){eligible=false;reason="The source for this suggestion is unavailable.";}
  else if(action.category!=="routine"&&!adultContext){eligible=false;reason="Review your saved adult health context before selecting a routine change. Ordinary logging remains available.";}
  else if(action.category==="food"&&(context.constraints.allergies===null||context.preferences.exclusions===null||context.preferences.dietaryPattern===null)){eligible=false;reason="Review your food restrictions and preferences before choosing meal options.";}
  else if(action.category==="movement"&&!calendarKnown){eligible=false;reason="Your activity or session source is unavailable. You can still record what you actually do.";}
  else if(action.category==="movement"&&(hasSession||hasActivity)){eligible=false;reason="A session or activity is already listed for this day. Review that record instead of adding another movement suggestion.";}
  const decisionRevision=wellnessDigest(["wellness-decision-v1",context.accountScope,day,context.revision,context.evidenceVersion,action,action.category==="movement"?[calendarKnown,calendarVersion]:action.category==="food"?settings.practical:null,eligible]);
  const previous=records.find(r=>r.payload.date===day.date&&r.payload.actionId===action.id&&r.payload.actionVersion===action.version&&r.payload.decisionRevision===decisionRevision);
  return {action,eligible,reason,decisionRevision,requestRevision:lifecycleId?wellnessDigest(["wellness-command-v1",decisionRevision,lifecycleId]):null,choice:previous?{id:previous.id,choice:previous.payload.choice,chosenAt:previous.payload.chosenAt}:null};
 });
 const digestive=context.goals.some(g=>g.id==="digestive");
 const order=digestive?["record-usual-meal","balanced-meal-pattern","familiar-movement"]:["balanced-meal-pattern","familiar-movement","record-usual-meal"];
 const selected=records.find(r=>actions.some(a=>a.eligible&&a.choice?.id===r.id&&(a.choice.choice==="try"||a.choice.choice==="later")));
 const primary=selected?actions.find(a=>a.choice?.id===selected.id):order.map(id=>actions.find(a=>a.action.id===id)).find(a=>a?.eligible&&a.choice?.choice!=="not-relevant");
 return{version:"wellness-actions-v1",accountScope:context.accountScope,day,contextRevision:context.revision,evidenceVersion:context.evidenceVersion,lifecycleId,asOf:now.toISOString(),dateCurrent,actions,primaryActionId:primary?.action.id??null,sources:goalSources.filter(s=>actions.some(a=>a.action.sourceIds.includes(s.id))),history,
  foodSources:{version:"wellness-food-sources-v1",status:food?"available":"unavailable",purpose:"own-account-app",limited:food?.limited??false,observations:food?foodSourceObservations(context.accountScope,food.records,now):[]},
  movementSources:{version:"wellness-movement-sources-v1",status:calendarKnown?"available":"unavailable",purpose:"own-account-app",observations:calendarKnown?movementSourceObservations(context.accountScope,calendar,now):[]}};
}
