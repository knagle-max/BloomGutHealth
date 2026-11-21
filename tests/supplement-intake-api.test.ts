import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ExperienceStorage} from '../server/experience-storage';
import {PrivateProductStorage} from '../server/private-product-storage';
import {SupplementIntakeStorage} from '../server/supplement-intake-storage';
import {registerExperienceRoutes} from '../server/experience-routes';

test('actual private HTTP review/confirm/correct/remove separates product plans, preserves source after removal, recovers commits and denies stale reset processing',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
  for(const file of ['0003_nutrition_products.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const database=drizzle(pg),experience=new ExperienceStorage(database as any),labels=new PrivateProductStorage(database as any),intakes=new SupplementIntakeStorage(database as any,()=>new Date('2026-11-18T12:00:00Z'));
  await pg.exec('CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)');
  let lookups=0,outage=false;
  const store=new Proxy(experience,{get(target,key){if(key==='getMeals')return async()=>[];if(key==='supplementIntakes')return intakes;if(key==='getNutritionProducts')return async(actor:string)=>{lookups++;if(outage)throw Error('Synthetic source outage');return labels.getNutritionProducts(actor);};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
  const app=express();app.use(express.json());registerExperienceRoutes(app,((req:any,res:any,next:any)=>{const actor=req.get('x-synthetic-owner');if(!['a','b'].includes(actor))return res.sendStatus(401);req.session={userId:actor};next();})as any,store as any,undefined as any);
  server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server!.once('listening',r));const root=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
  const request=async(path:string,method='GET',body?:unknown,actor='a',extra:Record<string,string>={})=>{
   const response=await fetch(root+path,{method,headers:{'content-type':'application/json','x-synthetic-owner':actor,...extra},...(body!==undefined?{body:JSON.stringify(body)}:{})});
   return{status:response.status,headers:response.headers,data:await response.json().catch(()=>null)};
  };
  assert.equal((await request('/supplement-intakes','GET',undefined,'')).status,401);
  assert.equal((await request('/recorded-intake-sources?date=2026-11-18&timeZone=UTC&nutrientKey=iron_mg','GET',undefined,'')).status,401);
  assert.equal((await request('/recorded-intake-sources?date=2026-02-30&timeZone=UTC&nutrientKey=iron_mg')).status,400);
  assert.equal((await request('/recorded-intake-sources?date=2026-11-18&timeZone=UTC&nutrientKey=iron_mg&userId=b')).status,400);
  const emptySources=await request('/recorded-intake-sources?date=2026-11-18&timeZone=UTC&nutrientKey=iron_mg');assert.equal(emptySources.status,200);assert.equal(emptySources.data.userId,'a');assert.deepEqual(emptySources.data.events,[]);assert.equal(emptySources.headers.get('cache-control'),'no-store');
  const label=await labels.insertNutritionProduct('a',{name:'Synthetic exact label',brand:'Synthetic',servingDescription:'1 tablet',servingGrams:null,perServing:{iron_mg:10,vitamin_c_mg:30}});
  assert.equal((await request('/records','POST',{kind:'supplement-review',payload:{name:'Planned product; not taken'}})).status,201);
  const empty=await request('/supplement-intakes');assert.equal(empty.data.total,0);assert.equal(empty.headers.get('x-bloom-supplement-reader'),'supplement-intake-v1');assert.equal(empty.headers.get('cache-control'),'no-store');
  const draft={takenAt:'2026-11-18T10:00:00Z',servings:2,source:{kind:'label',product:{source:'manual',id:label.id}},
   mineralBasis:{iron_mg:'elemental-label',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}};
  const preview=await request('/supplement-intakes/review','POST',{draft});assert.equal(preview.status,200);assert.equal(preview.data.previewOnly,true);assert.equal(preview.data.ingestionRecorded,false);assert.equal((await request('/supplement-intakes')).data.total,0);
  const command={intentId:randomUUID(),lifecycleId:preview.data.lifecycleId,reviewRevision:preview.data.reviewRevision,confirmedTaken:true,draft};
  assert.equal((await request('/supplement-intakes/confirm','POST',{...command,confirmedTaken:false})).status,400);
  const first=await request('/supplement-intakes/confirm','POST',command);assert.equal(first.status,200);const saved=first.data,afterCreate=lookups;
  // The original successful response can be lost; replay needs no new lookup.
  const replay=await request('/supplement-intakes/confirm','POST',command);assert.equal(replay.status,200);assert.equal(replay.data.id,saved.id);assert.equal(lookups,afterCreate);
  assert.equal((await request('/supplement-intakes/confirm','POST',{...command,intentId:randomUUID()})).status,200);
  assert.equal((await request('/supplement-intakes')).data.total,2,'Only the2 confirmed events, never the product review');
  assert.equal((await request(`/supplement-intakes/${saved.id}`,'GET',undefined,'b')).status,404);
  assert.equal((await request('/supplement-intakes','GET',undefined,'b')).data.total,0);
  assert.equal((await request('/supplement-intakes?userId=b')).status,400);
  await labels.deleteNutritionProduct('a',label.id);outage=true;
  const changed={...draft,servings:1},review=await request('/supplement-intakes/review','POST',{draft:changed,target:{id:saved.id,revision:saved.payload.revision}});
  assert.equal(review.status,200,'A correction can explicitly retain its own captured label after catalogue removal');const beforeEdit=lookups;
  const edit={editId:randomUUID(),expectedRevision:saved.payload.revision,lifecycleId:review.data.lifecycleId,reviewRevision:review.data.reviewRevision,confirmedTaken:true,draft:changed};
  const corrected=await request(`/supplement-intakes/${saved.id}/confirm`,'PUT',edit);assert.equal(corrected.status,200);assert.equal(corrected.data.payload.current.servings,1);assert.equal(corrected.data.payload.original.servings,2);assert.equal(corrected.data.payload.corrections.length,1);
  assert.equal((await request(`/supplement-intakes/${saved.id}/confirm`,'PUT',edit)).data.payload.corrections.length,1);assert.equal(lookups,beforeEdit);
  const failedRefresh=await request('/supplement-intakes/review','POST',{draft:changed,target:{id:saved.id,revision:corrected.data.payload.revision},refreshSource:true});assert.equal(failedRefresh.status,503);
  const loaded=await request(`/supplement-intakes/${saved.id}`);assert.equal(loaded.data.payload.current.servings,1);assert.equal(loaded.data.payload.current.label.name,label.name);
  assert.equal((await request(`/supplement-intakes/${saved.id}`,'DELETE',{expectedRevision:saved.payload.revision})).status,409);
  const remove={expectedRevision:corrected.data.payload.revision};assert.equal((await request(`/supplement-intakes/${saved.id}`,'DELETE',remove)).status,204);assert.equal((await request(`/supplement-intakes/${saved.id}`,'DELETE',remove)).status,204);
  assert.equal((await request('/supplement-intakes/confirm','POST',command)).data.code,'SUPPLEMENT_INTAKE_DELETED');assert.equal((await request('/supplement-intakes')).data.total,1);
  const unknownDraft={...draft,servings:null,source:{kind:'unlabelled',description:{name:'Reported supplement',servingDescription:null}},mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'}};
  const unknownReview=await request('/supplement-intakes/review','POST',{draft:unknownDraft});assert.equal(unknownReview.status,200);
  const unknown=await request('/supplement-intakes/confirm','POST',{...command,intentId:randomUUID(),draft:unknownDraft,lifecycleId:unknownReview.data.lifecycleId,reviewRevision:unknownReview.data.reviewRevision});assert.equal(unknown.status,200);assert.equal(unknown.data.payload.current.label,null);assert.equal(unknown.data.payload.current.servings,null);
  assert.equal((await request('','DELETE',undefined,'a',{'X-Bloom-Confirm':'delete-experience-data'})).status,204);
  const beforeStale=lookups;const stale=await request('/supplement-intakes/confirm','POST',command);assert.equal(stale.status,409);assert.equal(lookups,beforeStale,'An erased epoch is rejected before any provider/source lookup');assert.equal((await request('/supplement-intakes')).data.total,0);
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server!.close(()=>r()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
