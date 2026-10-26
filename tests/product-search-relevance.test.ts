import test from 'node:test';
import assert from 'node:assert/strict';
import {ProductService} from '../server/products';
import {rankProducts} from '../shared/product-search';
import type {Product} from '../shared/products';
const product=(id:string,name:string):Product=>({source:'dsld',id,name,brand:'Synthetic',servingGrams:null,servingDescription:'Review label',perServing:{},url:null,retrievedAt:'2026-10-26T00:00:00Z',notes:[]});
test('unrelated provider candidates cannot fill a no-match product search',()=>{
 assert.deepEqual(rankProducts([product('1','Vitamin C'),product('2','Calcium')],'Kit Kat'),[]);
 const hits=rankProducts([product('1','Vitamin C'),product('2','Kit Kat synthetic candidate')],'Kit Kat');assert.deepEqual(hits.map(p=>p.id),['2']);
});
test('numeric identifiers never fall through to fuzzy product or supplement search',async()=>{
 const calls:string[]=[];const fixture={fdcId:101,dataType:'Branded',description:'Synthetic original bar',gtinUpc:'00012345678905',servingSize:40,servingSizeUnit:'g',foodNutrients:[]};
 const service=new ProductService(async(url)=>{calls.push(url);if(url.includes('foods/search'))return {foods:[fixture]};return {hits:[{_id:'99',_source:{fullName:'Unrelated supplement',brandName:'Synthetic'}}]};},()=>false,()=> 'synthetic-key');
 const store:any={getNutritionProducts:async()=>[]};
 const invalid=await service.search('00012345678906','all',store,'a');assert.equal(invalid.products.length,0);assert.equal(calls.length,0,'Invalid identifier must not spend provider budget or become a name query');assert.ok(invalid.warnings.some(w=>/barcode|identifier/i.test(w)));
 const exact=await service.search('00012345678905','all',store,'a');assert.equal(exact.products.length,1);assert.equal(exact.products[0].source,'usda-branded');assert.equal(calls.length,1);assert.ok(calls.every(url=>url.includes('api.nal.usda.gov')));
});
