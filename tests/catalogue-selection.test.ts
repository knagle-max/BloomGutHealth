import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMeal, resolveLoggedIngredient } from "../server/meal-intelligence";
import { catalogueFoods } from "../server/food-catalog";
import { ingredientSchema } from "../shared/meal-intelligence";
test("explicit catalogue selections use the server record and mass, never reparsed or client supplied composition",async()=>{
 const foods=[catalogueFoods.find(f=>/salmon/i.test(f.description))!,catalogueFoods.find(f=>/rice/i.test(f.description))!];
 for(const food of foods){const ingredient=ingredientSchema.parse({name:"untrusted alternate description",grams:150,preparation:"wrong prep",assumption:"client",catalogue:{source:"usda-fndds",fdcId:food.fdcId}});const result=await analyzeMeal("different food text",false,[ingredient]);assert.equal(result.intelligence.foodMatches[0].fdcId,food.fdcId);assert.equal(result.intelligence.foodMatches[0].grams,150);assert.equal(result.intelligence.ingredients[0].name,food.description.slice(0,120));const protein=result.intelligence.nutrients.find(n=>n.key==="protein_g");if(typeof food.per100g["1003"]==="number")assert.ok(Math.abs(protein!.amount!-food.per100g["1003"]*1.5)<0.011);}
 assert.throws(()=>resolveLoggedIngredient(ingredientSchema.parse({name:"forged",grams:100,preparation:"",assumption:"",catalogue:{source:"usda-fndds",fdcId:999999999999}})));
 assert.equal(ingredientSchema.strict().safeParse({name:"forged",grams:100,preparation:"",assumption:"",catalogue:{source:"usda-fndds",fdcId:foods[0].fdcId,protein_g:999}}).success,false);
});
