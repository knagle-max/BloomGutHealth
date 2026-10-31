import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {registerPlannerRoutes} from '../server/planner-routes';
import {PrecisionStorage} from '../server/precision-storage';
import {defaultPreferences,recipes,preferenceSchema} from '../shared/meal-intelligence';
import {contextSchema,buildPrecisionReport} from '../shared/precision-nutrition';
import {foodPreferenceMatches} from '../shared/food-preference-policy';
import {eligiblePlanningRecipes} from '../shared/weekly-planner';
test('recipe library and optional prioritization apply the owned allergy context before suggesting foods, without rewriting preferences',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
 const precision=new PrecisionStorage(drizzle(pg)as any),preferences=preferenceSchema.parse({...defaultPreferences,cookingMinutes:180,goals:[...new Set(recipes.flatMap(recipe=>recipe.goals))].slice(0,20)}),store:any={getUser:async(id:string)=>({id,dietaryPreferences:preferences}),getMeals:async()=>[],getPrecisionContext:(id:string)=>precision.getPrecisionContext(id)};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')||'a'}as any;next();});registerPlannerRoutes(app,((_req:any,_res:any,next:any)=>next())as any,store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const request=(path='/api/meal-planner',method='GET',user='a')=>fetch(base+path,{method,headers:{'content-type':'application/json','x-user':user},...(method==='POST'?{body:JSON.stringify({aiConsent:false})}:{})});
 try{
  const initial=await(await request()).json()as any;assert.ok(initial.suggestions.some((recipe:any)=>recipe.ingredients.some((food:any)=>food.tags.includes('dairy'))),'Representative unfiltered library includes dairy');
  await precision.putPrecisionContext('a',contextSchema.parse({allergies:['dairy'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true}));
  const filtered=await(await request()).json()as any;assert.ok(filtered.suggestions.length);assert.ok(filtered.suggestions.every((recipe:any)=>!foodPreferenceMatches(recipe.ingredients,['dairy']).length));assert.deepEqual(filtered.preferences,preferences,'Medical restrictions are not copied into ordinary preference storage/response');
  const ranked=await request('/api/meal-planner/prioritize','POST');assert.equal(ranked.status,200);assert.ok(((await ranked.json())as any).suggestions.every((recipe:any)=>!foodPreferenceMatches(recipe.ingredients,['dairy']).length));
  const other=await(await request('/api/meal-planner','GET','b')).json()as any;assert.ok(other.suggestions.some((recipe:any)=>recipe.ingredients.some((food:any)=>food.tags.includes('dairy'))),'Another account has its own source context');
  await precision.putPrecisionContext('a',contextSchema.parse({allergies:['unmapped-special-ingredient']}));const unknown=await(await request()).json()as any;assert.deepEqual(unknown.suggestions,[]);assert.match(unknown.note,/withheld|Review My Biology/);assert.equal((await request('/api/meal-planner/prioritize','POST')).status,409);
  const getter=store.getPrecisionContext;store.getPrecisionContext=async()=>{throw Error('synthetic unavailable context');};assert.equal((await request()).status,503);store.getPrecisionContext=getter;
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
test('category/name allergy filters cover recipe sources and never classify a warning as allergen certification',()=>{
 assert.deepEqual(foodPreferenceMatches([{name:'Plain yogurt',tags:['dairy']}],['milk']),['milk']);assert.deepEqual(foodPreferenceMatches([{name:'Tahini',tags:[]}],['sesame']),['sesame']);assert.deepEqual(foodPreferenceMatches([{name:'Eggplant',tags:[]}],['egg']),[]);
 const prefs=preferenceSchema.parse({...defaultPreferences,cookingMinutes:180});const context=contextSchema.parse({allergies:['dairy'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true}),report=buildPrecisionReport([],context,prefs,null);
 assert.ok(report.recommendations.every(recipe=>!foodPreferenceMatches(recipe.ingredients,['dairy']).length));assert.ok(eligiblePlanningRecipes(prefs,['dairy']).recipes.every(recipe=>!foodPreferenceMatches(recipe.ingredients,['dairy']).length));
 const unknown=buildPrecisionReport([],contextSchema.parse({...context,allergies:['unmapped-special-ingredient']}),prefs,null);assert.deepEqual(unknown.recommendations,[]);assert.ok(unknown.safetyBlocks.some(note=>/allergies/.test(note)));
});
