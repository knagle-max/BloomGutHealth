import {athleteBlockers,athleteBlockerMessage} from "./athlete-eligibility";
import type { AthleteProfile, TrainingSession, ExperienceRecord } from "./experience";
import { mealNutritionSummary } from "./nutrition-summary";
export const ATHLETE_VERSION = "athlete-2026-10-25.1";
export const athleteSources = [
 {id:"ais-fuel",title:"AIS — carbohydrate during exercise",url:"https://www.ausport.gov.au/ais/nutrition/supplements/group_a/sports-foods2/sports-drink/how-and-when-do-i-use-it"},
 {id:"nih-protein",title:"NIH ODS — exercise nutrition and protein",url:"https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"},
 {id:"nlm-fuel",title:"MedlinePlus — nutrition and athletic performance",url:"https://medlineplus.gov/ency/article/002458.htm"},
 {id:"ais-energy",title:"AIS — energy availability",url:"https://www.ausport.gov.au/ais/nutrition/energy-availability"},
 {id:"usada",title:"USADA — supplement risk and certification",url:"https://www.usada.org/substances/supplement-connect/"},
 {id:"wada",title:"WADA — current prohibited list",url:"https://www.wada-ama.org/en/prohibited-list"},
];
export function sessionFuel(s: TrainingSession, p: AthleteProfile, minimumCarbsGkg?: number) {
 const endurance = ["endurance","team","mixed"].includes(s.discipline);
 const minimum=minimumCarbsGkg??(endurance&&s.minutes>150?6:s.minutes>60?5:3);
 const blockers=athleteBlockers(p,minimum),eligible=blockers.length===0;
 let range: [number,number] | null = null;
 if(eligible && endurance && s.minutes >= 60) range = s.minutes > 150 && p.gutTrained ? [60,90] : [30,60];
 const start = +new Date(s.startsAt), end = start+s.minutes*60000;
 const notes = [
  ...blockers.map(reason=>athleteBlockerMessage[reason]),
  ...(s.minutes > 150 && !p.gutTrained ? ["Higher carbohydrate rates need gradual gut training and a rehearsed individual plan; do not first try them on race day."] : []),
  ...(s.minutes > 240 ? ["Long events need an individualized plan for access, tolerability, fluid and total energy with the support team."] : []),
  ...(s.climate === "hot" ? ["Heat changes fluid needs. Rehearse cooling and fluid access; do not infer a sodium dose from temperature alone."] : []),
  "These are guideline ranges, not a measured individual requirement. Sport rules and opportunities to eat matter.",
 ];
 return {title:s.title,startsAt:s.startsAt,endsAt:new Date(end).toISOString(),minutes:s.minutes,eligible,blockers,
  carbsGHour:range, totalCarbsG:range?.map(v=>Math.round(v*s.minutes/60)) ?? null,
  recoveryProteinG:eligible ? Math.round(p.weightKg!*.3) : null,
  timeline:[
    {at:new Date(start-3*3600000).toISOString(),title:"Before training",action:"Plan a familiar carbohydrate-containing meal. Adjust food volume, fat and fiber to your own gut tolerance."},
    {at:s.startsAt,title:"During training",action:range ? `Rehearsal range: ${range[0]}–${range[1]} g carbohydrate per hour. Split into familiar portions at available breaks.` : !eligible ? "Numerical fueling is withheld until the listed review items are resolved. Recording food and fluid remains available." : "For shorter or non-endurance sessions, prioritize the overall day’s meals and comfortable fluid access; no automatic carbohydrate dose is assigned."},
    {at:new Date(end).toISOString(),title:"After training",action:eligible ? `Include a familiar meal or snack with carbohydrate and approximately ${Math.round(p.weightKg!*.3)} g protein. Consider the next session’s timing.` : "Record recovery food, appetite and gut comfort; review individual needs with your support team."},
  ], notes, sourceIds:["ais-fuel","nih-protein"]};
}
export function sweatEstimate(v:{minutes:number;preKg:number;postKg:number;drankMl:number;urineMl:number;sweatSodiumMgL:number|null}) {
 const litres=v.preKg-v.postKg+v.drankMl/1000-v.urineMl/1000, hours=v.minutes/60;
 if(litres<0 || litres/hours>4) return {valid:false,litres:null,litresHour:null,sodiumLossMgHour:null,bodyMassChangePercent:100*(v.postKg-v.preKg)/v.preKg,note:"Check the measurements, timing and unrecorded food or fluid. No sweat estimate can be assigned from these inputs."};
 return {valid:true,litres:Math.round(litres*100)/100,litresHour:Math.round(litres/hours*100)/100,sodiumLossMgHour:v.sweatSodiumMgL===null?null:Math.round(litres/hours*v.sweatSodiumMgL),bodyMassChangePercent:Math.round(1000*(v.postKg-v.preKg)/v.preKg)/10,note:"An estimate from body mass and fluid balance, not a laboratory measurement or a replacement prescription. Use similar clothing/scales and repeat under comparable conditions. Weight gain can indicate excess drinking or measurement differences."};
}
export function buildAthleteDay(p:AthleteProfile, sessions:TrainingSession[], meals:any[], records:ExperienceRecord[], bounds?:{start:Date;end:Date}) {
 const active=sessions.filter(s=>s.status!=="cancelled"), duration=(s:TrainingSession)=>bounds?Math.max(0,(Math.min(+new Date(s.startsAt)+s.minutes*60000,+bounds.end+1)-Math.max(+new Date(s.startsAt),+bounds.start))/60000):s.minutes, minutes=Math.round(active.reduce((n,s)=>n+duration(s),0)), summary=mealNutritionSummary(meals);
 const enduranceMinutes=active.filter(s=>["endurance","team","mixed"].includes(s.discipline)).reduce((n,s)=>n+duration(s),0);
 const load=enduranceMinutes>150?"high":minutes>60?"moderate":"light";
 const automaticBand=load==="high"?[6,10]:load==="moderate"?[5,7]:[3,5];
 const band=p.carbGkgMin!==null&&p.carbGkgMax!==null?[p.carbGkgMin,p.carbGkgMax]:automaticBand;
 const blockers=athleteBlockers(p,band[0]),gated=blockers.length>0;
 const carbs=gated?null:band.map(v=>Math.round(v*p.weightKg!)), protein=gated?null:Math.round(p.weightKg!*p.proteinGkg);
 const checkins=records.filter(r=>r.kind==="checkin"&&r.payload.mode==="athlete");
 const concern=checkins.some(r=>r.kind==="checkin"&&(r.payload.energy<=3||r.payload.hunger>=8||r.payload.professionalReview));
 const recentGutConcern=sessions.filter(s=>s.status==="completed"&&s.gutComfort!==null&&s.gutComfort<=3).length>0;
 const recordedLoad=active.filter(s=>s.status==="completed"&&s.rpe!==null).reduce((n,s)=>n+duration(s)*s.rpe!,0);
 return {version:ATHLETE_VERSION,load,recordedLoad:Math.round(recordedLoad),loadEntries:active.filter(s=>s.status==="completed"&&s.rpe!==null).length,minutes,sessions:active.length,blocked:gated,blockers,
  targets:{energyKcal:gated?null:p.energyKcal,carbohydratesG:gated?null:carbs,proteinG:gated?null:protein},
  consumed:summary.totals,coverage:summary.coverage,partial:summary.isPartial,
  remaining:{energyKcal:gated||p.energyKcal===null||summary.totals.calories===null?null:Math.max(0,p.energyKcal-summary.totals.calories),proteinG:gated||protein===null||summary.totals.protein===null?null:Math.max(0,protein-summary.totals.protein),carbohydratesG:gated||carbs===null||summary.totals.carbs===null?null:carbs.map(v=>Math.max(0,v-summary.totals.carbs!))},
  fueling:active.map(s=>sessionFuel(s,recentGutConcern?{...p,gutTrained:false}:p,band[0])),
  notices:[...(recentGutConcern?["A recorded session had low gut comfort. Higher carbohydrate rates are not assumed tolerable; review your rehearsed strategy before escalating."]:[]),...(["competition","taper"].includes(p.trainingPhase)?["Competition phase: prioritize familiar, rehearsed foods and confirm practical access in your competition checklist."]:[]),...(["professional","olympic-paralympic"].includes(p.level)?["Elite workflow: document team-reviewed targets, medication/TUE checks and exact supplement batch checks. Level alone does not establish a different physiological requirement."]:[]),...blockers.map(reason=>athleteBlockerMessage[reason]),...(p.energyKcal===null?["No energy target has been set. Bloom does not infer an exact energy requirement from a workout or wearable."]:[]),...(concern?["Your recent check-ins suggest that fueling or recovery deserves review. These entries cannot diagnose REDs; speak with a qualified sports clinician or dietitian if concerns persist."]:[]),...(minutes>240?["This is a high-volume day. Review total food, fuel access and recovery with the support team; a generic calorie cap is not applied."]:[]),...(summary.isPartial?["Some logged nutrients are missing. Known intake is retained; remaining amounts are provisional."]:[])],
  methodology:"Daily carbohydrate ranges use reviewed custom values when supplied, otherwise a simple duration-based workload heuristic and protein uses the reviewed profile setting. They are starting points for individual planning, not an elite performance prescription. Fuel consumed during a session is counted in daily nutrition only when logged as food or drink; session notes do not add it again.",sources:athleteSources};
}

// Performance meal selection has no everyday calorie/fiber/sodium cap.
// Individual clinical restrictions and food exclusions are still prerequisites.
