import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {analyzeMeal} from '../server/meal-intelligence';
import {parseExplicitIngredients} from '../shared/meal-intelligence';
import {registerPlannerRoutes} from '../server/planner-routes';
const description=(n:number)=>Array.from({length:n},(_,i)=>`1 g distinct food component ${i+1}`).join(', ');
test('ingredient parsing never silently drops extras and unsupported entry size fails before nutrient lookup',async()=>{
 const previous=process.env.API_NINJAS_KEY,previousUSDA=process.env.USDA_FDC_API_KEY;process.env.API_NINJAS_KEY='';process.env.USDA_FDC_API_KEY='';
 try{
  assert.equal(parseExplicitIngredients(description(21)).length,21,'Extraction must not silently discard source text components');
  await assert.rejects(()=>analyzeMeal(description(21),false),/20.*ingredient|ingredient.*20/i);
  for(const count of [0,1,3,5,8,20])assert.equal((await analyzeMeal(description(count),false)).intelligence.ingredients.length,count);
  let lookups=0;const ingredients=Array.from({length:20},(_,i)=>({name:'Food '+i,grams:1,preparation:'As described',assumption:'Synthetic explicit source'}));const product={name:'Selected label',grams:1,preparation:'Selected product label',assumption:'Synthetic selected source',product:{source:'manual' as const,id:'synthetic-label',servings:1}};
  await assert.rejects(()=>analyzeMeal('Explicit source',false,ingredients,{userId:'a',store:{getNutritionProducts:async()=>[]} as any,products:[product],service:{resolve:async()=>{lookups++;return [];}} as any}),/20.*ingredient|ingredient.*20/i);assert.equal(lookups,0);
 }finally{if(previous===undefined)delete process.env.API_NINJAS_KEY;else process.env.API_NINJAS_KEY=previous;if(previousUSDA===undefined)delete process.env.USDA_FDC_API_KEY;else process.env.USDA_FDC_API_KEY=previousUSDA;}
});
test('meal HTTP size failures are actionable400 responses and cannot persist a truncated meal',async()=>{
 let writes=0;const store:any={getMeal:async()=>undefined,getExperienceRecords:async()=>[],insertMeal:async(meal:any)=>{writes++;return {id:'synthetic-meal',...meal};}};const app=express();app.use(express.json());const auth:any=(req:any,_res:any,next:any)=>{req.session={userId:'a'};next();};registerPlannerRoutes(app,auth,store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const root=`http://127.0.0.1:${(server.address() as any).port}`;const previous=process.env.API_NINJAS_KEY,previousUSDA=process.env.USDA_FDC_API_KEY;process.env.API_NINJAS_KEY='';process.env.USDA_FDC_API_KEY='';
 try{
  for(const path of ['/api/meals/analyze','/api/meals']){const response=await fetch(root+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mealText:description(21)})});assert.equal(response.status,400);assert.match((await response.json()).error,/20.*ingredient|ingredient.*20/i);}
  assert.equal(writes,0);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));if(previous===undefined)delete process.env.API_NINJAS_KEY;else process.env.API_NINJAS_KEY=previous;if(previousUSDA===undefined)delete process.env.USDA_FDC_API_KEY;else process.env.USDA_FDC_API_KEY=previousUSDA;}
});
