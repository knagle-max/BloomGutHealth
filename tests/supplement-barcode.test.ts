import test from 'node:test';
import assert from 'node:assert/strict';
import {ProductService,ProductSourceError} from '../server/products';
import {canonicalBarcode} from '../shared/barcodes';
const codes=['777672010360','023249090021','623543753242','665553200101'];
const store={getNutritionProducts:async()=>[],insertNutritionProduct:async()=>{throw Error('No writes during lookup');},deleteNutritionProduct:async()=>{throw Error('No writes during lookup');}};
function full(code:string,id=321){return{id,fullName:'Synthetic source label',brandName:'Synthetic',entryDate:'2026-01-01',offMarket:0,upcSku:code,servingSizes:[{order:1,minQuantity:1,maxQuantity:1,unit:'Capsule(s)',notes:''}],ingredientRows:[{name:'Vitamin C',quantity:[{quantity:1000,unit:'mg',operator:'=',servingSizeOrder:1,servingSizeQuantity:1}],nestedRows:[]},{name:'Protein',quantity:[{quantity:0,unit:'g',operator:'=',servingSizeOrder:1,servingSizeQuantity:1}],nestedRows:[]},{name:'Bromelain activity',quantity:[{quantity:1200,unit:'GDU',operator:'=',servingSizeOrder:1,servingSizeQuantity:1}],nestedRows:[]}]};}
test('all four owner UPCs dispatch a quoted NIH search and verify full label upcSku before exact rank; no label or intake writes',async()=>{
 for(const code of codes){let queries=0,labels=0;const service=new ProductService(async raw=>{const url=new URL(raw);assert.equal(url.host,'api.ods.od.nih.gov');if(url.pathname.endsWith('/search-filter')){queries++;assert.equal(url.searchParams.get('q'),`"${code}"`);return{hits:[{_id:'321',_source:{fullName:'Untrusted hit name'}}]};}assert.equal(url.pathname,'/dsld/v9/label/321');labels++;return full(code);},()=>false,()=>undefined);
 const result=await service.search(code,'supplement',store as any,'a');assert.equal(queries,1);assert.equal(labels,1);assert.equal(result.products.length,1);assert.equal(canonicalBarcode(result.products[0].barcode!),canonicalBarcode(code));assert.equal(result.products[0].name,'Synthetic source label');assert.equal(result.products[0].perServing.vitamin_c_mg,1000);assert.equal(result.products[0].perServing.protein_g,0);assert.equal(result.products[0].perServing.iron_mg,undefined);assert.equal(result.products[0].otherNutrients?.find(row=>row.name==='Bromelain activity')?.unit,'GDU');
 }
});
test('matching name, hit code or NPN never substitutes for absent or conflicting authoritative upcSku; failures remain unavailable',async()=>{
 const code=codes[1];for(const upcSku of [undefined,'777672010360','NPN 80012345']){const service=new ProductService(async raw=>raw.includes('/search-filter')?{hits:[{_id:'321',_source:{fullName:'Sports Research Vitamin C',upcSku:code,npn:'80012345'}}]}:{...full(code),upcSku},()=>false,()=>undefined);const result=await service.search(code,'supplement',store as any,'a');assert.deepEqual(result.products,[]);}
 const service=new ProductService(async()=>{throw new ProductSourceError('http',429);},()=>false,()=>undefined);assert.deepEqual((await service.search(code,'supplement',store as any,'a')).products,[]);
});
test('grouped and padded source codes verify only valid GS1 values; variants remain distinct and native ingredient units survive',async()=>{
 const code=codes[1];const service=new ProductService(async raw=>raw.includes('/search-filter')?{hits:[{_id:'321'},{_id:'322'}]}:{...full(code,raw.endsWith('/322')?322:321),upcSku:['0 23249 09002 1','00023249090021'],offMarket:raw.endsWith('/322')?1:0},()=>false,()=>undefined);
 const result=await service.search(code,'supplement',store as any,'a');assert.equal(result.barcodeLookup?.status,'exact-barcode-verified');assert.equal(result.products.length,2);assert.notEqual(result.products[0].id,result.products[1].id);assert.ok(result.products.some(product=>product.notes.some(note=>/historical/i.test(note))));
 assert.equal(result.products[0].labelDeclarations?.find(row=>row.name==='Bromelain activity')?.unit,'GDU');assert.equal(result.products[0].labelDeclarations?.find(row=>row.name==='Protein')?.amount,0);
});
test('selection refreshes the authoritative label and cannot retain a stale barcode or substitute a different returned ID',async()=>{
 const code=codes[1];let changed=false,reads=0;const service=new ProductService(async raw=>{if(raw.includes('/search-filter'))return{hits:[{_id:'321'}]};reads++;return full(changed?codes[0]:code);},()=>false,()=>undefined);
 const result=await service.search(code,'supplement',store as any,'a');assert.equal(result.products.length,1);changed=true;
 await assert.rejects(()=>service.resolve({source:'dsld',id:result.products[0].id,query:code},store as any,'a'));assert.equal(reads,2,'Selection performs a new source read instead of returning the cached earlier label');
 const mismatch=new ProductService(async raw=>raw.includes('/search-filter')?{hits:[{_id:'321'}]}:full(code,999),()=>false,()=>undefined);
 assert.equal((await mismatch.search(code,'supplement',store as any,'a')).barcodeLookup?.status,'provider-unavailable');
});
test('private saved code wins before any provider budget, and public caching cannot carry another account label',async()=>{
 const code=codes[1],privateLabel={source:'manual',id:'owned',name:'Private label',barcode:code,brand:'',servingDescription:'1 capsule',servingGrams:null,perServing:{iron_mg:10},notes:[],url:null,retrievedAt:'2026-11-17T12:00:00Z'};let calls=0;
 const scoped={...store,getNutritionProducts:async(actor:string)=>actor==='a'?[privateLabel]:[]};const service=new ProductService(async()=>{calls++;return{hits:[]};},()=>false,()=>undefined);
 const own=await service.search(code,'supplement',scoped as any,'a');assert.equal(own.barcodeLookup?.status,'saved-private-label');assert.equal(calls,0);
 const other=await service.search(code,'supplement',scoped as any,'b');assert.deepEqual(other.products,[]);assert.equal(other.barcodeLookup?.status,'no-authoritative-match');assert.equal(calls,1);assert.equal((await service.search(code,'supplement',scoped as any,'a')).products[0].id,'owned');
});
test('empty, unavailable and unverified hits stay different; source request/label budgets are bounded',async()=>{
 const code=codes[1];for(const response of [undefined,{}, {hits:null}]){const service=new ProductService(async()=>response,()=>false,()=>undefined);assert.equal((await service.search(code,'supplement',store as any,'a')).barcodeLookup?.status,'provider-unavailable');}
 for(const failure of [new ProductSourceError('http',404),new ProductSourceError('http',403),new ProductSourceError('http',429),new ProductSourceError('http',500),new ProductSourceError('timeout'),new ProductSourceError('network')]){const service=new ProductService(async()=>{throw failure;},()=>false,()=>undefined);assert.equal((await service.search(code,'supplement',store as any,'a')).barcodeLookup?.status,'provider-unavailable');}
 let labelReads=0;const service=new ProductService(async raw=>{if(raw.includes('/search-filter'))return{hits:Array.from({length:10},(_,index)=>({_id:String(index+1)}))};labelReads++;return full(codes[0],Number(raw.split('/').at(-1)));},()=>false,()=>undefined);
 const result=await service.search(code,'supplement',store as any,'a');assert.equal(labelReads,3);assert.equal(result.barcodeLookup?.status,'possible-not-verified');assert.deepEqual(result.products,[]);
});
