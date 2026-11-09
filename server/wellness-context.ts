import {createHash} from "node:crypto";
import {contextSchema} from "../shared/precision-nutrition";
import {preferenceSchema} from "../shared/meal-intelligence";
import {goalGuidance,goalSources} from "../shared/goal-guidance";
import type {WellnessContext} from "../shared/wellness-context";
import {resolvePlanningContext} from "./planning-context";

const revision=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const has=(value:unknown,key:string)=>!!value&&typeof value==="object"&&Object.hasOwn(value,key);
/** No optional assay, meal, model, provider or third-party read is needed for a
 * saved-goals context. The caller supplies only authenticated account sources. */
export function buildWellnessContext(accountScope:string,rawContext:unknown,user:{id:string;age?:unknown;dietaryPreferences?:unknown},now=new Date()):WellnessContext{
  if(!accountScope||user.id!==accountScope)throw Error("Wellness context account mismatch");
  if(!Number.isFinite(+now))throw Error("Invalid wellness context time");
  const recorded=rawContext===undefined?undefined:contextSchema.parse(rawContext);
  const context=recorded??contextSchema.parse({});
  const resolved=resolvePlanningContext(context,user.age);
  const parsedPreferences=preferenceSchema.safeParse(user.dietaryPreferences);
  const preferences=parsedPreferences.success?parsedPreferences.data:null;
  // Do not turn the parser's default butyrate preference into a saved user goal.
  const profileGoals=preferences&&has(user.dietaryPreferences,"goals")?preferences.goals.filter(g=>!["butyrate","diversity","athletic"].includes(g)):[];
  const goals=Array.from(new Set([...context.goals,...profileGoals])).map(goalGuidance);
  const constraints:WellnessContext["constraints"]={
    ageGroup:resolved.context.ageGroup,pregnancy:context.pregnancy,safetyReviewed:resolved.context.safetyReviewed,
    allergies:has(rawContext,"allergies")?context.allergies:null,
    intolerances:has(rawContext,"intolerances")?context.intolerances??null:null,
    conditions:has(rawContext,"conditions")?context.conditions:null,
    medications:has(rawContext,"medications")?context.medications:null,
  };
  const preferenceView:WellnessContext["preferences"]={
    exclusions:preferences&&has(user.dietaryPreferences,"exclusions")?preferences.exclusions:null,
    dislikes:preferences&&has(user.dietaryPreferences,"dislikes")?preferences.dislikes:null,
    dietaryPattern:preferences&&has(user.dietaryPreferences,"dietaryPattern")?preferences.dietaryPattern:null,
  };
  const missing:string[]=[];
  if(!goals.length)missing.push("saved-goals-not-recorded");
  if(!recorded)missing.push("health-context-not-recorded");
  if(constraints.allergies===null)missing.push("allergy-context-not-recorded");
  if(!preferences)missing.push("dietary-preferences-unavailable");
  if(constraints.ageGroup==="unknown")missing.push("adult-context-not-recorded");
  if(!constraints.safetyReviewed)missing.push("safety-context-not-reviewed");
  const evidenceVersion=revision(["goal-evidence-v1",goalSources]);
  const inputSources:WellnessContext["inputSources"]=[];
  if(recorded)inputSources.push({sourceId:"saved-health-context",revision:revision([accountScope,"health-context",context.goals,constraints]),observedAt:null,dateStatus:"not-recorded",valueKind:"self-reported",permissionScope:"own-account-app"});
  if(has(user,"age")||(user.dietaryPreferences!==undefined&&user.dietaryPreferences!==null&&preferences))inputSources.push({sourceId:"nutrition-profile",revision:revision([accountScope,"nutrition-profile",profileGoals,preferenceView,resolved.ageSources]),observedAt:null,dateStatus:"not-recorded",valueKind:"self-reported",permissionScope:"own-account-app"});
  const sources=goalSources.filter(source=>goals.some(goal=>goal.sourceIds.includes(source.id)));
  const basis={version:"wellness-context-2026-11-07.1" as const,accountScope,purpose:"personal-wellness" as const,evidenceVersion,goals,sources,constraints,preferences:preferenceView,inputSources,missing,conflicts:resolved.blocks};
  return {...basis,revision:revision(basis),asOf:now.toISOString()};
}
