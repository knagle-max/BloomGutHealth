import test from "node:test";
import assert from "node:assert/strict";
import {catalogueMassHandoff,readCatalogueMassHandoff} from "../shared/catalogue-mass-handoff";
import {captureIngredientMassEntry} from "../shared/ingredient-mass-capture";
test("catalogue navigation originals require matching owner, source identity, canonical mass and strict known metadata",()=>{
 const source=captureIngredientMassEntry("4.000","oz",113.3980925)!;assert.ok(source);const state=catalogueMassHandoff("owner-a",123,113.3980925,source);
 assert.deepEqual(readCatalogueMassHandoff(state,"owner-a",123,113.3980925),source);
 for(const[owner,id,grams]of[["owner-b",123,113.3980925],[undefined,123,113.3980925],["owner-a",124,113.3980925],["owner-a",123,100]]as const)assert.equal(readCatalogueMassHandoff(state,owner,id,grams),undefined);
 for(const invalid of[null,{},"PrivateCanary",{...state,filename:"not-allowed"},{...state,massEntry:{...source,value:"4.001"}}])assert.equal(readCatalogueMassHandoff(invalid,"owner-a",123,113.3980925),undefined);
 assert.equal(catalogueMassHandoff("owner-a",123,113.3980925,undefined),undefined);assert.equal(catalogueMassHandoff(undefined,123,113.3980925,source),undefined);
});
test("manual portion capture preserves precision/whitespace and never invents absent, zero, nonfinite or mismatched quantities",()=>{
 assert.equal(captureIngredientMassEntry(" 4.000\t","oz",113.3980925)?.value," 4.000\t");assert.equal(captureIngredientMassEntry("1e3","g",1000)?.value,"1e3");
 for(const[value,unit,grams]of[["","g",null],["4.000","oz",null],["0","g",0],["-1","g",1],["1e-999","g",0],["1e999","g",100],["3001","g",3001],["4\n","oz",113.3980925],["4","oz",100]]as const)assert.equal(captureIngredientMassEntry(value,unit,grams),undefined);
});
