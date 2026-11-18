import {pathToFileURL} from 'node:url';
import {fetchProductSource,ProductSourceError} from '../../server/products.ts';
import {nutrientDefinitions} from '../../shared/meal-intelligence.ts';
const witnessFood=171688;
export function observeB6Identity(data){
 if(data?.fdcId!==witnessFood||!Array.isArray(data.foodNutrients))return{status:'unverified-contract',reason:'unexpected-food-or-nutrient-shape',identities:[]};
 const prior=new Set(nutrientDefinitions.map(row=>row[3])),identities=new Map();
 for(const row of data.foodNutrients){const nutrient=row?.nutrient;if(typeof nutrient?.name!=='string'||nutrient.name.toLowerCase().replace(/[^a-z0-9]/g,'')!=='vitaminb6')continue;
  if(!Number.isSafeInteger(nutrient.id)||nutrient.id<=0||prior.has(nutrient.id)||typeof nutrient.unitName!=='string'||nutrient.unitName.toLowerCase()!=='mg')return{status:'unverified-contract',reason:'invalid-or-conflicting-identity-or-unit',identities:[]};
  identities.set(nutrient.id,{id:nutrient.id,name:nutrient.name,unitName:nutrient.unitName,number:typeof nutrient.number==='string'?nutrient.number:null});
 }
 return{status:identities.size===1?'identity-observed':'unverified-contract',reason:identities.size===1?null:'absent-or-ambiguous-identity',identities:Array.from(identities.values())};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 let result;try{const data=await fetchProductSource('https://api.nal.usda.gov/fdc/v1/food/171688?api_key=DEMO_KEY');result=observeB6Identity(data);}catch(error){result={status:'source-unavailable',reason:error instanceof ProductSourceError?error.category:'unknown',identities:[]};}
 console.log(JSON.stringify({kind:'public-fdc-b6-identity-observation',checkedAt:new Date().toISOString(),sourceEndpoint:'https://api.nal.usda.gov/fdc/v1/food/171688',access:'documented public USDA demo access; no private credentials',witnessFoodId:witnessFood,...result,limitations:'One bounded public metadata observation only. No food composition/catalogue coverage, original-byte hash, private intake, clinical assessment or runtime mapping change is asserted.'},null,2));
}
