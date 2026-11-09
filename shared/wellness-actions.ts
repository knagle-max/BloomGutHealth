import {z} from "zod";
import {dateKey,type WellnessChoice} from "./experience";
import type {goalSources} from "./goal-guidance";
export const WELLNESS_ACTION_VERSION="2026-11-07.1";
export const wellnessDaySchema=z.object({date:dateKey,timezoneOffset:z.number().int().min(-840).max(840)}).strict();
export type WellnessDay=z.infer<typeof wellnessDaySchema>;
export const wellnessChoiceCommandSchema=wellnessDaySchema.extend({
 intentId:z.string().uuid(),actionId:z.string().min(1).max(100),choice:z.enum(["try","later","not-relevant","clear"]),
 lifecycleId:z.string().uuid(),requestRevision:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type WellnessChoiceCommand=z.infer<typeof wellnessChoiceCommandSchema>;
export const wellnessHistoryDeleteSchema=z.object({records:z.array(z.object({id:z.string().min(1).max(100),intentId:z.string().uuid(),revision:z.string().regex(/^[a-f0-9]{64}$/)}).strict()).min(1).max(200)}).strict();
export type WellnessHistoryDelete=z.infer<typeof wellnessHistoryDeleteSchema>;
export const wellnessActions=[
 {id:"record-usual-meal",version:WELLNESS_ACTION_VERSION,category:"routine" as const,outputClass:"app-routine" as const,requiredInputs:["signed-account","current-local-day"],curation:"app-behavior",title:"Record a usual meal",description:"Keep the foods and portions you actually eat in your journal. You can review the estimates before saving.",href:"/log-meal",linkLabel:"Add food",effort:"A familiar routine",sourceIds:[] as string[],limitation:"Unlogged intake stays unknown. Recording a meal does not establish a health effect."},
 {id:"balanced-meal-pattern",version:WELLNESS_ACTION_VERSION,category:"food" as const,outputClass:"general-wellness-preview" as const,requiredInputs:["reviewed-adult-context","known-food-restrictions","saved-preferences"],curation:"source-grounded-general-guidance",title:"Choose a balanced meal",description:"Explore a meal pattern with vegetables or fruit, whole grains and suitable protein foods, within your saved restrictions.",href:"/meal-planner?view=recipes",linkLabel:"Explore meal choices",effort:"Use your saved cooking preferences",sourceIds:["goal-general"],limitation:"General eating-pattern guidance. It does not prescribe a calorie deficit, supplement or medical target."},
 {id:"familiar-movement",version:WELLNESS_ACTION_VERSION,category:"movement" as const,outputClass:"general-wellness-preview" as const,requiredInputs:["reviewed-adult-context","current-activity-and-session-source"],curation:"source-grounded-general-guidance",title:"Make room for familiar movement",description:"Choose movement that is familiar and appropriate for you. Record what you actually do afterward.",href:"/activity",linkLabel:"Record activity afterward",effort:"Choose what fits your day",sourceIds:["goal-aging"],limitation:"No intensity, duration or recovery readiness is inferred. A planned or recorded session takes priority over another movement suggestion."},
];
export interface WellnessActionDecision {
 action:typeof wellnessActions[number];eligible:boolean;reason:string;decisionRevision:string;requestRevision:string|null;
 choice:{id:string;choice:WellnessChoice["choice"];chosenAt:string}|null;
}
/** Minimized owned source facts, not a second activity total or readiness score. */
export interface WellnessMovementObservation {
 sourceId:string;sourceKind:"activity"|"session";sourceRevision:string;componentId:string|null;
 valueKind:"self-reported-activity"|"planned-session"|"marked-completed-session"|"cancelled-session";
 startsAt:string;updatedAt:string;temporalStatus:"future-entry"|"elapsed-entry";
 reportedMinutes:number|null;scheduledMinutes:number|null;
 sets:{recorded:number;confirmedCompleted:number;notConfirmed:number;explicitlyCancelled:number}|null;
}
export interface WellnessFoodObservation {
 sourceId:string;sourceKind:"meal";sourceRevision:string;valueKind:"recorded-meal";
 recordedAt:string|null;dateBasis:"meal-record-time"|"not-recorded";
 temporalStatus:"future-entry"|"elapsed-entry"|"unknown";
 genericSourceStatus:"available"|"not-captured"|"unsupported";capturedGenericSources:number|null;
}
export interface WellnessActionView {
 version:"wellness-actions-v1";accountScope:string;day:WellnessDay;contextRevision:string;evidenceVersion:string;
 lifecycleId:string|null;asOf:string;dateCurrent:boolean;actions:WellnessActionDecision[];primaryActionId:string|null;
 sources:typeof goalSources;history:{id:string;intentId:string;actionId:string;date:string;choice:WellnessChoice["choice"];chosenAt:string;revision:string;timezoneOffset:number;lifecycleId:string;requestRevision:string;actionVersion:string;contextRevision:string;evidenceVersion:string}[];
 foodSources?:{version:"wellness-food-sources-v1";status:"available"|"unavailable";purpose:"own-account-app";limited:boolean;observations:WellnessFoodObservation[]};
 movementSources?:{version:"wellness-movement-sources-v1";status:"available"|"unavailable";purpose:"own-account-app";observations:WellnessMovementObservation[]};
}
