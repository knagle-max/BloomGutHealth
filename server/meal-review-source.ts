import {createHash} from "node:crypto";
import type {analyzeMeal} from "./meal-intelligence";
type Analysis=Awaited<ReturnType<typeof analyzeMeal>>;
// Retrieval time and aggregate display names do not change nutrition. Preserve all
// ingredient/source identities, versions, amounts, units, zero/missing and coverage.
function stable(value:unknown):unknown{
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).filter(([key])=>key!=="retrievedAt"&&key!=="analyzedAt").sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,item])=>[key,stable(item)]));
 return value;
}
export function mealReviewRevision(userId:string,result:Analysis){
 const i=result.intelligence;
 return createHash("sha256").update(JSON.stringify(stable({userId,ingredients:i.ingredients,nutrients:i.nutrients,foodMatches:i.foodMatches,productDetails:i.productDetails||[],status:i.status,pathways:i.pathways,sources:i.sources,nutritionalData:result.nutritionalData.map(({name,...facts}:any)=>facts)}))).digest("hex");
}
