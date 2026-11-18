import {ProductService,fetchProductSource,ProductSourceError} from '../../server/products.ts';
import {canonicalBarcode} from '../../shared/barcodes.ts';
import assert from 'node:assert/strict';
const codes=['777672010360','023249090021','623543753242','665553200101'],sourceShapes=[],failures=[];
const source=new ProductService(async url=>{
 try{const data=await fetchProductSource(url);sourceShapes.push({endpoint:url.includes('/search-filter')?'quoted-search':'full-label',rootKeys:data&&typeof data==='object'?Object.keys(data).slice(0,20):[],upcSkuType:typeof data?.upcSku,upcSkuArray:Array.isArray(data?.upcSku)});return data;}
 catch(error){failures.push({category:error instanceof ProductSourceError?error.category:'unclassified',status:error instanceof ProductSourceError?error.status??null:null});throw error;}
},()=>false,()=>undefined);
const store={getNutritionProducts:async()=>[]},results=[];
for(const code of codes){const result=await source.search(code,'supplement',store,'public-source-contract-probe');assert.ok(result.products.every(product=>product.source==='dsld'&&canonicalBarcode(product.barcode)===canonicalBarcode(code)));results.push({originalBarcode:code,status:result.barcodeLookup?.status??'not-yet-checked',products:result.products.map(product=>({sourceId:product.id,name:product.name,brand:product.brand,serving:product.servingDescription,barcode:product.barcode,retrievedAt:product.retrievedAt,notes:product.notes,originalDeclarationsCaptured:product.labelDeclarations?.length??0})),warnings:result.warnings});}
console.log(JSON.stringify({kind:'public-source-contract-observation',checkedAt:new Date().toISOString(),results,sourceShapes,failures,limitations:'Actual NIH source outcomes only; unavailable and no-match do not establish absence. No Canadian NPN linkage, independent package certification, clinical validation or account intake is asserted. No private source, USDA key or OFF request is used.'},null,2));
