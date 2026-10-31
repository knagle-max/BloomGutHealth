import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {registerPlannerRoutes} from '../server/planner-routes';
import {getOwnedMeal,updateOwnedMeal} from '../server/meal-records';
import {insertMealWithReceipt} from '../server/meal-save';
import {analyzeMeal,nutritionTotals} from '../server/meal-intelligence';
import {ProductService} from '../server/products';
import {productIngredient,type Product} from '../shared/products';

test('journal metadata edits retain confirmed product, preparation and corrected portions; changed text is reparsed',async()=>{
 const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)`);
 const database=drizzle(pg);
 const label:Product={source:'manual',id:'reviewed',name:'Reviewed private meal',brand:'Synthetic',servingDescription:'1 serving (40g)',servingGrams:40,perServing:{calories:200,protein_g:0},url:null,retrievedAt:'2026-10-28T00:00:00Z',notes:[]};
 const service=new ProductService(async()=>({hits:[]}),()=>false,()=>undefined);
 let sourceAvailable=true;
 const store={getMeal:(id:string,owner:string)=>getOwnedMeal(database as any,id,owner),updateMeal:(id:string,changes:any,owner:string)=>updateOwnedMeal(database as any,id,changes,owner),getNutritionProducts:async()=>{if(!sourceAvailable)throw Error('Source unavailable after original save');return[label];},getExperienceRecords:async()=>[]};
 const analyzer=(text:string,consent?:boolean,ingredients?:any[],options?:any)=>analyzeMeal(text,consent,ingredients,{...options,service});
 const original=await analyzer('My reviewed lunch',false,[{...productIngredient(label,2.5),preparation:'As labelled; warmed'}],{userId:'a',store});
 const meal=await insertMealWithReceipt(database as any,{userId:'a',mealText:'My reviewed lunch',mealType:'lunch',mealContext:{timeZone:'America/Regina'},intelligence:original.intelligence,nutritionalData:original.nutritionalData,...nutritionTotals(original.nutritionalData)} as any);
 const app=express();app.use(express.json());registerPlannerRoutes(app,((req:any,res:any,next:any)=>{req.session={userId:req.get('x-user')};if(!req.session.userId)return res.sendStatus(401);next();}) as any,store as any,analyzer as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 const put=async(body:any,owner='a')=>{const response=await fetch(`http://127.0.0.1:${(server.address() as any).port}/api/meals/${meal.id}`,{method:'PUT',headers:{'content-type':'application/json','x-user':owner},body:JSON.stringify(body)});return{status:response.status,data:await response.json()};};
 try{
  sourceAvailable=false;
  const noop=await put({mealText:meal.mealText});assert.equal(noop.status,200);assert.equal(noop.data.totalCalories,500);
  const edited=await put({mealText:meal.mealText,mealType:'dinner'});assert.equal(edited.status,200);assert.equal(edited.data.totalCalories,500);assert.equal(edited.data.totalProtein,0);assert.deepEqual(edited.data.intelligence.ingredients,original.intelligence.ingredients);assert.equal(edited.data.mealType,'dinner');assert.deepEqual(edited.data.mealContext,meal.mealContext);assert.equal(new Date(edited.data.loggedAt).toISOString(),meal.loggedAt.toISOString());
  const repeated=await put({mealText:meal.mealText,mealType:'dinner'});assert.equal(repeated.data.totalCalories,500);assert.deepEqual(repeated.data.intelligence.ingredients,original.intelligence.ingredients);
  assert.equal((await put({mealText:meal.mealText,mealType:'snack'},'b')).status,404);
  sourceAvailable=true;const corrected=await put({mealText:meal.mealText,ingredients:[{...original.intelligence.ingredients[0],grams:120,product:{...original.intelligence.ingredients[0].product!,servings:3}}]});assert.equal(corrected.status,200);assert.equal(corrected.data.totalCalories,600);
  const changed=await put({mealText:'100 g banana',mealType:'dinner'});assert.equal(changed.status,200);assert.equal(changed.data.intelligence.ingredients[0].product,undefined);assert.equal(changed.data.intelligence.ingredients[0].grams,100);assert.notEqual(changed.data.totalCalories,500);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();}
});
