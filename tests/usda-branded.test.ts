import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { analyzeMeal, nutritionTotals } from "../server/meal-intelligence";
import { mealNutritionSummary } from "../shared/nutrition-summary";
import { normalizeUSDABranded } from "../server/usda-branded";
import { ProductService, lookupProductNutrition, registerProductRoutes } from "../server/products";
import { productIngredient, type Product } from "../shared/products";
import { normalizeProductQuery, rankProducts } from "../shared/product-search";
export const food={fdcId:101,dataType:"Branded",description:"Kit Kat synthetic original bar",brandName:"Synthetic fixture",brandOwner:"Synthetic owner",gtinUpc:"00012345678905",marketCountry:"United States",publicationDate:"2026-10-01",modifiedDate:"2026-10-02",ingredients:"Synthetic label ingredients",servingSize:40,servingSizeUnit:"g",householdServingFullText:"1 bar (40 g)",foodNutrients:[{nutrient:{id:1008,unitName:"KCAL"},amount:500},{nutrient:{id:1003,unitName:"G"},amount:10},{nutrient:{id:1093,unitName:"MG"},amount:0}]};
const store=()=>{const own=new Map<string,Product[]>();return {getNutritionProducts:async(id:string)=>own.get(id)||[],insertNutritionProduct:async(id:string,p:any)=>{const row={...p,source:"manual" as const,id:"saved-"+id,url:null,retrievedAt:new Date().toISOString(),notes:[]};own.set(id,[row]);return row;},deleteNutritionProduct:async()=>false};};
test("USDA manufacturer labels preserve serving basis, zero/missing nutrients and source version without claiming Canadian identity",()=>{
 const p=normalizeUSDABranded(food);assert.equal(p.perServing.calories,200);assert.equal(p.perServing.protein_g,4);assert.equal(p.perServing.sodium_mg,0);assert.equal(p.perServing.fiber_g,undefined);assert.equal(p.provenance?.marketCountry,"United States");assert.equal(p.provenance?.fdcId,101);assert.match(p.notes.join(" "),/does not establish Canadian/);
 const noMass=normalizeUSDABranded({...food,servingSizeUnit:"mL",labelNutrients:{calories:{value:90}}});assert.equal(noMass.servingGrams,null);assert.equal(noMass.perServing.calories,90);assert.equal(noMass.perServing.protein_g,undefined);
 const per100=normalizeUSDABranded({...food,servingSizeUnit:"mL",labelNutrients:{}});assert.equal(per100.servingGrams,100);assert.equal(per100.perServing.calories,500);assert.match(per100.servingDescription,/100 g/);
 assert.throws(()=>normalizeUSDABranded({...food,dataType:"Survey (FNDDS)"}));
});
test("brand aliases are suggestions, not SKU substitutions; barcode candidates require matching identity",async()=>{
 const calls:Array<{url:string;body:any}>=[];let key:string|undefined="synthetic-key";
 const service=new ProductService(async(url,init)=>{const body=init?.body?JSON.parse(String(init.body)):null;calls.push({url,body});return body?{foods:body.query.includes("michelina")?[{...food,fdcId:201,description:"Michelina’s synthetic macaroni cheese"}]:[{...food,fdcId:102,description:"Kit Kat synthetic dark bar"},food]}:food;},()=>false,()=>key);
 for(const q of ["KitKat","Kit Kat","kit kit bar"]){const r=await service.search(q,"food",store(),"a");assert.ok(r.products.some(p=>p.id==="101"));assert.equal(r.query?.original,q);assert.equal(r.products.find(p=>p.id==="101")?.perServing.calories,undefined);}
 assert.deepEqual(calls[0].body.dataType,["Branded"]);
 for(const q of ["Michelina's","Michelinas"]){const r=await service.search(q,"food",store(),"a");assert.ok(r.products.some(p=>p.id==="201"));}
 assert.equal(normalizeProductQuery("Michelina's"),normalizeProductQuery("Michelinas"));
 const selected=(await service.resolve({source:"usda-branded",id:"101"},store(),"a"))[0];const result=await lookupProductNutrition([productIngredient(selected,1.5)],store(),"a",service);assert.equal(result.nutrients.find(n=>n.key==="calories")?.amount,300);assert.equal(result.productDetails[0].provenance?.modifiedDate,"2026-10-02");
 const ingredient=productIngredient(selected,1.5);const analysis=await analyzeMeal("",false,undefined,{store:store(),userId:"a",products:[{...ingredient,product:{...ingredient.product,query:"kit kit bar"}}],service});const totals=nutritionTotals(analysis.nutritionalData);assert.equal(totals.totalCalories,300);assert.equal(analysis.intelligence.ingredients[0].product?.query,"kit kit bar");assert.equal(analysis.intelligence.productDetails?.[0].provenance?.fdcId,101);assert.equal(mealNutritionSummary([{...totals,intelligence:analysis.intelligence,nutritionalData:analysis.nutritionalData}]).totals.calories,300);
 assert.equal(rankProducts([{...selected,barcode:"4006381333931"},selected],"012345678905").length,1);
 key=undefined;const before=calls.length;await assert.rejects(()=>service.resolve({source:"usda-branded",id:"101"},store(),"a"),/not configured/);const r=await service.search("KitKat","food",store(),"a");assert.equal(calls.length,before);assert.ok(r.warnings.some(w=>/not configured/.test(w)));
});
test("branded failure retains private manual logging and authenticated owner isolation",async()=>{
 const own=store(),service=new ProductService(async()=>{throw Error("Synthetic source outage");},()=>false,()=>"test-key");
 const search=await service.search("kit kit bar","food",own,"a");assert.ok(search.warnings.some(w=>/temporarily unavailable/.test(w)));
 const app=express();app.use(express.json());app.use((req,_res,next)=>{(req as any).session={userId:req.headers['x-user']};next();});registerProductRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),own as any,service);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const port=(server.address() as any).port;
 try{const request=(path:string,user="a",body?:unknown)=>fetch(`http://127.0.0.1:${port}/api/products${path}`,{method:body?"POST":"GET",headers:{"content-type":"application/json","x-user":user},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await request('/search?q=KitKat&kind=food','')).status,401);
 const made=await request('',"a",{name:"Kit Kat synthetic package",brand:"Synthetic",servingDescription:"1 bar",servingGrams:40,perServing:{calories:210,protein_g:3,sodium_mg:0}});assert.equal(made.status,201);const p=await made.json();
 assert.equal((await request(`/manual/${p.id}`,"b")).status,404);assert.equal((await request(`/manual/${p.id}`)).status,200);
 const nutrition=await lookupProductNutrition([productIngredient(p,2)],own,"a",service);assert.equal(nutrition.nutrients.find(n=>n.key==="calories")?.amount,420);assert.equal(nutrition.nutrients.find(n=>n.key==="sodium_mg")?.amount,0);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
test("USDA lookup budget bounds public cache misses and keeps the manual fallback available",async()=>{
 let calls=0;const service=new ProductService(async()=>{calls++;return{foods:[]};},()=>false,()=>"synthetic-key");
 for(let i=0;i<13;i++)await service.search(`kitkat ${i}`,"food",store(),"a");
 assert.equal(calls,12);const cached=await service.search("kitkat 0","food",store(),"a");assert.equal(calls,12);assert.ok(cached.warnings.some(w=>/licensing/.test(w)));
});
test("default product transport rejects oversized streams before decoding the whole response",async()=>{
 const original=globalThis.fetch;let cancelled=false;
 globalThis.fetch=async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(3000001));},cancel(){cancelled=true;}}));
 try{const service=new ProductService(undefined,()=>false,()=>"synthetic-key");const result=await service.search("KitKat","food",store(),"a");assert.ok(result.warnings.some(w=>/temporarily unavailable/.test(w)));assert.equal(cancelled,true);}finally{globalThis.fetch=original;}
});

test("live transport classifies denied access, throttling, timeout and malformed data without leaking credentials",async()=>{
 const original=globalThis.fetch,warn=console.warn,logs:string[]=[];console.warn=(message)=>logs.push(String(message));
 try {
  for(const [status,phrase] of [[403,/access was denied/],[429,/request limit reached/]] as const){globalThis.fetch=async()=>new Response('private upstream text',{status});const service=new ProductService(undefined,()=>false,()=>"synthetic-secret");const r=await service.search('private query','food',store(),'a');assert.ok(r.warnings.some(w=>phrase.test(w)));}
  globalThis.fetch=async()=>{throw new DOMException('URL with secret','TimeoutError');};assert.ok((await new ProductService(undefined,()=>false,()=>"synthetic-secret").search('private query','food',store(),'a')).warnings.some(w=>/timed out/.test(w)));
  globalThis.fetch=async()=>Response.json({unexpected:'shape'});assert.ok((await new ProductService(undefined,()=>false,()=>"synthetic-secret").search('private query','food',store(),'a')).warnings.some(w=>/temporarily unavailable/.test(w)));
  assert.equal(logs.some(x=>/synthetic-secret|private query|private upstream|URL/.test(x)),false);
 }finally{globalThis.fetch=original;console.warn=warn;}
});
test("fixed public startup check reuses the product search cache without account data",async()=>{
 let calls=0;const info=console.info;console.info=()=>{};
 try{const service=new ProductService(async(_url,init)=>{calls++;assert.equal(JSON.parse(String(init?.body)).query,'kit kat');return {foods:[food]};},()=>false,()=>"synthetic-key");await service.verifyUSDABrandedSource();const result=await service.search('Kit Kat','food',store(),'a');assert.equal(calls,1);assert.ok(result.products.some(p=>p.id==='101'));}finally{console.info=info;}
});
test("USDA gateway diagnostics allowlist error codes and exclude raw provider text",async()=>{
 const original=globalThis.fetch,warn=console.warn,logs:string[]=[];console.warn=message=>logs.push(String(message));
 try{for(const code of ['API_KEY_INVALID','API_KEY_UNVERIFIED','upstream-secret-value']){
  globalThis.fetch=async()=>Response.json({error:{code,message:'private response'}},{status:403});
  await new ProductService(undefined,()=>false,()=>"synthetic-key").verifyUSDABrandedSource();
 }assert.ok(logs.some(l=>l.includes('API_KEY_INVALID')));assert.ok(logs.some(l=>l.includes('API_KEY_UNVERIFIED')));assert.equal(logs.some(l=>/upstream-secret-value|private response|synthetic-key/.test(l)),false);}finally{globalThis.fetch=original;console.warn=warn;}
});
