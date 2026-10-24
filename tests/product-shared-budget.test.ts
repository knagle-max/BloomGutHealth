import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
import {SharedRateLimiter,usdaSharedRequestLimit} from '../server/shared-rate-limit';import {ProductService} from '../server/products';
const store:any={getNutritionProducts:async()=>[],insertNutritionProduct:async()=>{throw Error('not used');},deleteNutritionProduct:async()=>false};
test('two product replicas share the existing provider quota atomically while cache and manual fallback remain available',async()=>{
 const pg=new PGlite(),warn=console.warn;console.warn=()=>{};try{const limiter=new SharedRateLimiter(pg as any,'synthetic-stable-secret');await limiter.initialize();let calls=0;
 const services=[0,1].map(()=>{const service=new ProductService(async()=>{calls++;return {foods:[]};},()=>false,()=> 'synthetic-key');service.setSharedSourceBudget(source=>limiter.consume('provider:'+source,'shared',12,60));return service;});
 const results=await Promise.all(Array.from({length:14},(_,i)=>services[i%2].search('synthetic '+i,'food',store,'account-'+i)));assert.equal(calls,12);assert.equal(results.filter(r=>r.warnings.some(w=>/request limit reached/.test(w))).length,2);
 await services[0].search('synthetic 0','food',store,'other-account');assert.equal(calls,12);
 await pg.exec("UPDATE request_budgets SET expires_at=now()-interval '1 second'");await services[0].search('new query','food',store,'a');assert.equal(calls,13);
 const raw=JSON.stringify((await pg.query('SELECT * FROM request_budgets')).rows);assert.equal(/synthetic-key|account-/.test(raw),false);
 }finally{console.warn=warn;await pg.close();}
});
test('unavailable shared budget prevents provider calls and preserves private saved labels',async()=>{
 const warn=console.warn;console.warn=()=>{};try{let calls=0;const service=new ProductService(async()=>{calls++;return{foods:[]};},()=>false,()=> 'synthetic-key');service.setSharedSourceBudget(async()=>{throw Error('private database details');});const result=await service.search('synthetic','food',{...store,getNutritionProducts:async()=>[{source:'manual',id:'private',name:'synthetic label',brand:'',servingDescription:'1 tray',servingGrams:null,perServing:{calories:200},notes:[],url:null,retrievedAt:'2026-10-24T00:00:00Z'}]},'a');assert.equal(calls,0);assert.ok(result.products.some(p=>p.id==='private'));assert.equal(JSON.stringify(result).includes('private database details'),false);}finally{console.warn=warn;}
});

test('shared provider allowance retains existing default and denies malformed configuration',()=>{assert.equal(usdaSharedRequestLimit(''),12);assert.equal(usdaSharedRequestLimit('24'),24);for(const value of ['0','-1','12garbage','1001','1.5'])assert.equal(usdaSharedRequestLimit(value),0);});
