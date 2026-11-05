import test from "node:test";
import assert from "node:assert/strict";
import { parseStructuredReport, parseReportDocument,reportedFoodSuggestions } from "../shared/structured-report";

const fixture = () => ({
  testing_company: "Synthetic provider",
  scores: Array.from({length:22},(_,i)=>({name:`Synthetic assessment ${i+1}`,status:i<15?"Improve":i<19?"Attention":"Maintain"})),
  foods: Array.from({length:299},(_,i)=>({name:`Synthetic food ${i+1}`,reportedCategory:i<240?"Enjoy":i<268?"Superfood":i<290?"Minimize":"Avoid",sourcePage:8+Math.floor(i/60),sourceColumn:1+i%3})),
});
test("synthetic qualitative22/299 source rows retain categories without fabricated measurements and round-trip exactly",()=>{
  const source=fixture(),parsed=parseStructuredReport(source);
  assert.equal(parsed.scores.length,22);assert.equal(parsed.foods?.length,299);
  assert.ok(parsed.scores.every(s=>s.score===null&&s.reportedValue===null&&s.scale===null));
  const count=(values:Array<string|null>)=>values.reduce<Record<string,number>>((all,v)=>{all[String(v)]=(all[String(v)]||0)+1;return all;},{});
  assert.deepEqual(count(parsed.scores.map(s=>s.reportedCategory)),{Improve:15,Attention:4,Maintain:3});
  assert.deepEqual(count(parsed.foods!.map(f=>f.reportedCategory)),{Enjoy:240,Superfood:28,Minimize:22,Avoid:9});
  assert.equal(parsed.kind,"functional-report");assert.equal(parsed.bacteria_percentages,undefined);
  assert.equal(parsed.capabilities.quantitativeAbundance,false);assert.equal(parsed.capabilities.measuredMetabolites,false);assert.equal(parsed.capabilities.measuredGenes,false);
  assert.deepEqual(parsed.sourceReport,source);
  assert.deepEqual(parseStructuredReport(parsed),parsed);
  assert.deepEqual(parseReportDocument(JSON.stringify(parsed),"json").parsed,parsed);
});
test("food-only, missing categories and repeated names remain distinct source facts without allergy or planning authority",()=>{
  const source={food_recommendations:[{name:"Synthetic fish",category:"Avoid",notes:"Provider wording",sourcePage:9},{name:"Synthetic fish",category:"Enjoy",sourcePage:10},{name:"Synthetic unnamed category",quantity:0}]};
  const parsed=parseStructuredReport({data:source});
  assert.equal(parsed.foods?.length,3);
  assert.equal(parsed.foods![0].name,parsed.foods![1].name);
  assert.notEqual(parsed.foods![0].reportedCategory,parsed.foods![1].reportedCategory);
  assert.equal(parsed.foods![2].reportedCategory,null);assert.equal(parsed.foods![2].sourcePage,null);
  assert.deepEqual(Object.keys(parsed.foods![0]).sort(),["name","notes","reportedCategory","sourceColumn","sourcePage"]);
  assert.equal(parsed.scores.length,0);assert.equal(parsed.organisms.length,0);
  assert.equal(parsed.capabilities.functionalScores,false);
  assert.equal("allergies" in parsed,false);assert.equal("foodExclusions" in parsed,false);
  assert.equal("foods" in parseStructuredReport({organisms:["Synthetic organism"]}),false,"Older reports remain genuinely missing food records");
});
test("malformed or oversized food rows fail before persistence with errors that never repeat source contents",()=>{
  for(const foods of [{bad:"not a list"},Array(1001).fill({name:"Synthetic"}),[{name:""}],[{name:"Private canary",reportedCategory:2}],[{name:"Private canary",sourcePage:0}],[{name:"Private canary",sourceColumn:"1"}],[{name:"x".repeat(201)}],[{name:"Private canary",notes:"x".repeat(1001)}]]){
    assert.throws(()=>parseStructuredReport({foods}),error=>error instanceof Error&&!error.message.includes("Private canary"));
  }
});
test("older stored source food rows are browsable without a migration, while canonical clears and invalid legacy formats remain honest",()=>{
  const current=parseStructuredReport(fixture()),{foods,...older}=current;
  assert.deepEqual(reportedFoodSuggestions(older),{status:"available",foods});
  assert.deepEqual(reportedFoodSuggestions({...older,foods:[]}),{status:"available",foods:[]});
  assert.deepEqual(reportedFoodSuggestions({sourceReport:{food_recommendations:{unexpected:"shape"}}}),{status:"unreadable",foods:[]});
  assert.deepEqual(reportedFoodSuggestions({sourceReport:{organisms:["Synthetic"]}}),{status:"not-supplied",foods:[]});
  assert.equal("foods" in older,false,"Reader projection must not rewrite old persisted inputs");
});
