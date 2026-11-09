import type {Express,RequestHandler} from 'express';
import {z} from 'zod';
// Preserve the existing adult formula only for actual, supported profile inputs.
// These are estimates, never confirmed individual requirements or clinical clearance.
const profile=z.object({
 age:z.number().int().min(18).max(120),sex:z.enum(['male','female']),
 heightCm:z.number().finite().positive().max(250),weightKg:z.number().finite().positive().max(500),
 activityLevel:z.enum(['sedentary','light','moderate','active','very_active']),
});
const multipliers={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,very_active:1.9};
// Existing journal reference values, now explicit examples instead of guessed demographics.
const example=Object.freeze({calories:2000,protein:120,carbs:225,fat:67,fiber:30,sodium:2300,potassium:3500,cholesterol:300,sugar:50});
export function nutritionTargetReference(input:unknown){
 const parsed=profile.safeParse(input);
 if(!parsed.success)return {...example,basis:{kind:'example-reference' as const,usesProfile:false,inputsNeedingReview:Array.from(new Set(parsed.error.issues.map(issue=>String(issue.path[0] ?? "profile")))),note:'Example references only; not calculated from your profile or confirmed as your personal requirements.'}};
 const {age,sex,heightCm,weightKg,activityLevel}=parsed.data;
 const bmr=10*weightKg+6.25*heightCm-5*age+(sex==='male'?5:-161),tdee=bmr*multipliers[activityLevel];
 if(tdee<=0)return {...example,basis:{kind:'example-reference' as const,usesProfile:false,inputsNeedingReview:['age','heightCm','weightKg'],note:'Example references only; profile inputs cannot support a positive adult energy estimate.'}};
 return {calories:Math.round(tdee),protein:Math.round(weightKg*1.6),carbs:Math.round(tdee*0.45/4),fat:Math.round(tdee*0.3/9),fiber:30,sodium:2300,potassium:3500,cholesterol:300,sugar:50,basis:{kind:'profile-estimate' as const,usesProfile:true,inputsNeedingReview:[] as string[],note:'Adult energy and macro estimates use available profile fields. Fixed nutrient references are general examples, not confirmed personal requirements.',energyMethod:'Mifflin-St Jeor with recorded activity multiplier; estimate only'}};
}
export function registerNutritionTargetRoutes(app:Express,requireAuth:RequestHandler,store:{getUser(userId:string):Promise<unknown>}){
 app.get('/api/nutrition/targets/:userId',requireAuth,async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.params.userId!==req.session.userId)return void res.status(403).json({error:'Access denied'});
  try{
   const user=await store.getUser(req.session.userId!);
   if(!user)return void res.status(404).json({error:'User not found'});
   res.json(nutritionTargetReference(user));
  }catch{res.status(503).json({error:'Planning references could not load. Recorded nutrition remains available.'});}
 });
}
