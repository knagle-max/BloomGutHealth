import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {users} from '../shared/schema';
import {preferenceSchema,defaultPreferences} from '../shared/meal-intelligence';
import {contextSchema} from '../shared/precision-nutrition';
import {preferenceRevision,updatePreferencesWithRevision} from '../server/preference-source';
import {updateProfileWithRevision} from '../server/profile-source';
import {PrecisionStorage} from '../server/precision-storage';
test('taste and reported intolerance readers stay distinct, optional and source-preserving',()=>{
 assert.equal(defaultPreferences.softDislikes,undefined);assert.equal(contextSchema.parse({}).intolerances,undefined);
 assert.deepEqual(preferenceSchema.parse({...defaultPreferences,dislikes:['mushroom'],softDislikes:['olive']}).dislikes,['mushroom'],'New softer choices cannot reinterpret an existing hard avoid');
 assert.deepEqual(contextSchema.parse({allergies:['peanut'],intolerances:['onion']}).allergies,['peanut']);
 assert.equal(preferenceSchema.safeParse({...defaultPreferences,intolerances:['onion']}).success,false,'Health reports belong in encrypted context, not ordinary preferences');
 assert.equal(contextSchema.safeParse({intolerances:{onion:'diagnosed'}}).success,false);
});
test('unaware preference/context saves retain newer taste and encrypted tolerance data; explicit clears remain owned',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,username text NOT NULL,password text NOT NULL,sex text,age integer,height_cm real,weight_kg real,activity_level text,dietary_preferences jsonb);INSERT INTO users VALUES('a','a','unused','female',30,170,65,'moderate',NULL),('b','b','unused','female',30,170,65,'moderate',NULL)");await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
 const db=drizzle(pg),precision=new PrecisionStorage(db as any),read=async(id='a')=>(await db.select().from(users).where(eq(users.id,id)))[0];
 try{
  await db.update(users).set({dietaryPreferences:{...defaultPreferences,softDislikes:['olive']}}).where(eq(users.id,'a'));
  await updatePreferencesWithRevision(db,'a',{...defaultPreferences,dislikes:['mushroom']},preferenceRevision('a',(await read()).dietaryPreferences));
  let saved=(await read()).dietaryPreferences as any;assert.deepEqual(saved.softDislikes,['olive']);assert.deepEqual(saved.dislikes,['mushroom']);
  const{softDislikes:ignored,...legacy}=saved;await updateProfileWithRevision(db,'a',{dietaryPreferences:{...legacy,dietaryPattern:'vegetarian'}});saved=(await read()).dietaryPreferences as any;assert.deepEqual(saved.softDislikes,['olive']);assert.equal(saved.dietaryPattern,'vegetarian');
  const revision=preferenceRevision('a',saved);await updateProfileWithRevision(db,'a',{age:31});assert.equal(preferenceRevision('a',(await read()).dietaryPreferences),revision);
  await updatePreferencesWithRevision(db,'a',{...preferenceSchema.parse(saved),softDislikes:[]},revision);assert.deepEqual(((await read()).dietaryPreferences as any).softDislikes,[]);assert.equal((await read('b')).dietaryPreferences,null);
  const health=contextSchema.parse({allergies:['peanut'],intolerances:['onion'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true});await precision.putPrecisionContext('a',health);
  const{intolerances,...unaware}=health;await precision.putPrecisionContext('a',{...unaware,medications:['User-entered source']});const current=await precision.getPrecisionContext('a')as any;assert.deepEqual(current.intolerances,['onion']);assert.deepEqual(current.allergies,['peanut']);assert.deepEqual(current.medications,['User-entered source']);assert.equal(await precision.getPrecisionContext('b'),undefined);
  const raw=await pg.query('SELECT encrypted_context FROM precision_profiles');assert.doesNotMatch(JSON.stringify(raw.rows),/onion|peanut/);assert.doesNotMatch(JSON.stringify((await read()).dietaryPreferences),/intolerances|onion/);
  await precision.putPrecisionContext('a',{...current,intolerances:[]});assert.deepEqual((await precision.getPrecisionContext('a')as any).intolerances,[]);
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});

test('soft taste changes ordering without exclusions; reported intolerance warns without becoming allergy',async()=>{
 const {recipes,recommendMeals,preferenceConflicts}=await import('../shared/meal-intelligence');
 const {foodPreferenceMatches,intoleranceWarnings}=await import('../shared/food-preference-policy');
 const {buildPrecisionReport}=await import('../shared/precision-nutrition');
 const {eligiblePlanningRecipes}=await import('../shared/weekly-planner');
 const {analyzeMeal}=await import('../server/meal-intelligence');
 const prefs=preferenceSchema.parse({...defaultPreferences,cookingMinutes:180,goals:[...new Set(recipes.flatMap(r=>r.goals))].slice(0,20)}),baseline=recommendMeals(prefs);
 const target=baseline[0],terms=target.ingredients.map(i=>i.name),tastes={...prefs,softDislikes:terms};
 const ordered=recommendMeals(tastes);assert.deepEqual(new Set(ordered.map(r=>r.id)),new Set(baseline.map(r=>r.id)));
 assert.equal(foodPreferenceMatches(ordered[0].ingredients,terms).length,Math.min(...baseline.map(r=>foodPreferenceMatches(r.ingredients,terms).length)));assert.deepEqual(preferenceConflicts(target,tastes),[]);
 const hard={...tastes,dislikes:[target.ingredients[0].name]};assert.ok(preferenceConflicts(target,hard).length);assert.ok(!recommendMeals(hard).some(r=>r.id===target.id));
 const context=contextSchema.parse({intolerances:['dairy'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true}),report=buildPrecisionReport([],context,prefs,null);
 const dairy=report.recommendations.find(r=>foodPreferenceMatches(r.ingredients,['dairy']).length);assert.ok(dairy,'Intolerance alone leaves matching recipes eligible');assert.ok(dairy.reasons.some(reason=>/reported intolerance: dairy/.test(reason)));
 assert.deepEqual(eligiblePlanningRecipes(tastes,[]).recipes.map(r=>r.id),eligiblePlanningRecipes(prefs,[]).recipes.map(r=>r.id));assert.ok(eligiblePlanningRecipes(tastes,['dairy']).recipes.every(r=>!foodPreferenceMatches(r.ingredients,['dairy']).length));
 assert.deepEqual(intoleranceWarnings([{name:'Banana'}],['dairy']),[]);
 const meal=await analyzeMeal('100 g plain yogurt',false,undefined,{userId:'a',store:{getNutritionProducts:async()=>[],getPrecisionContext:async(id:string)=>{assert.equal(id,'a');return context;}}as any});assert.ok(meal.intelligence.warnings.some(w=>/reported intolerance: dairy/.test(w)));assert.ok(meal.intelligence.ingredients.length,'A report does not prevent recording consumption');
});
