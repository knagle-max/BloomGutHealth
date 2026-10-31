import type {Express,RequestHandler} from 'express';
import {z} from 'zod';
import {mealNutritionSummary} from '../shared/nutrition-summary';
const year=z.string().regex(/^\d{4}$/).transform(Number).pipe(z.number().int().min(1970).max(9998)).optional();
const month=z.string().regex(/^(?:0?[0-9]|1[01])$/).transform(Number).optional();
/** Existing recorded nutrient provenance/coverage is authoritative for every period. */
export function recordedNutritionPeriod(meals:any[]){
 const daysWithMeals=new Set(meals.map(meal=>new Date(meal.loggedAt).toISOString().slice(0,10))).size;
 const summary=mealNutritionSummary(meals);
 return {totalMeals:meals.length,daysWithMeals,totals:summary.totals,nutritionCoverage:summary.coverage,isPartial:summary.isPartial,dailyAverages:daysWithMeals?Object.fromEntries(Object.entries(summary.totals).map(([key,value])=>[key,value===null?null:Math.round(value/daysWithMeals*100)/100])):null};
}
export function registerNutritionHistoryRoutes(app:Express,requireAuth:RequestHandler,store:{getMeals(userId:string):Promise<any[]>}){
 const handler=(period:'monthly'|'yearly'):RequestHandler=>async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.params.userId!==req.session.userId)return void res.status(403).json({error:'Access denied'});
  const parsed=(period==='monthly'?z.object({year,month}).strict():z.object({year}).strict()).safeParse(req.query);
  if(!parsed.success)return void res.status(400).json({error:'Choose a valid calendar year and month.'});
  const now=new Date(),targetYear=parsed.data.year??now.getUTCFullYear(),targetMonth=period==='monthly'&&'month' in parsed.data&&typeof parsed.data.month==='number'?parsed.data.month:period==='monthly'?now.getUTCMonth():0;
  const start=Date.UTC(targetYear,targetMonth,1),end=Date.UTC(targetYear,period==='monthly'?targetMonth+1:12,1);
  try{
   const meals=(await store.getMeals(req.session.userId!)).filter(meal=>{const time=+new Date(meal.loggedAt);return Number.isFinite(time)&&time>=start&&time<end;});
   const summary=recordedNutritionPeriod(meals);
   const common={year:targetYear,calendar:'UTC' as const,...summary,note:'Known recorded contributions per UTC day with a meal. Unlogged meals/days and unavailable nutrients are not measured zeros; these estimates do not establish total intake or adequacy.'};
   if(period==='monthly')return void res.json({...common,month:targetMonth,totalDays:(end-start)/86400000});
   const monthlyBreakdown=Array.from({length:12},(_,month)=>{
    const rows=meals.filter(meal=>new Date(meal.loggedAt).getUTCMonth()===month),part=recordedNutritionPeriod(rows);
    return {month,monthName:new Date(Date.UTC(targetYear,month,1)).toLocaleDateString('en-US',{month:'long',timeZone:'UTC'}),mealsLogged:rows.length,daysWithMeals:part.daysWithMeals,avgCalories:part.dailyAverages?.calories??null,avgProtein:part.dailyAverages?.protein??null,nutritionCoverage:part.nutritionCoverage};
   }).filter(row=>row.mealsLogged>0);
   res.json({...common,monthlyBreakdown});
  }catch{res.status(503).json({error:'Nutrition history could not load. Your records are not treated as empty.'});}
 };
 app.get('/api/nutrition/monthly/:userId',requireAuth,handler('monthly'));
 app.get('/api/nutrition/yearly/:userId',requireAuth,handler('yearly'));
}
