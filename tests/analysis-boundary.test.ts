import test from "node:test";
import assert from "node:assert/strict";
import {reportedAbundanceAnalysis,historicalAnalysisMetadata} from "../server/analysis-boundary";
test("server boundary uses reported percentages and withholds unsupported effects even from historical analyses",()=>{
 const result=reportedAbundanceAnalysis("synthetic",{Roseburia:3.2,"Reported genus":10});
 assert.equal(result.bacterial_composition[0].abundance,3.2);assert.equal(result.confidence,null);assert.deepEqual(result.metabolites,[]);assert.deepEqual(result.recommendations,[]);assert.deepEqual(result.health_impacts,[]);assert.deepEqual(result.cohort_comparisons,{});
 assert.equal(reportedAbundanceAnalysis("synthetic",{Roseburia:0}).diversity_index,null);
 const output=historicalAnalysisMetadata([{id:"old",modelVersion:"prototype",confidence:.99,results:{predicted_concentration:37,impact_score:99,dose:"10 billion CFU"}}]);
 assert.equal(output[0].results,null);assert.equal(output[0].confidence,null);assert.equal(JSON.stringify(output).includes("10 billion CFU"),false);
 assert.throws(()=>reportedAbundanceAnalysis("synthetic",{Roseburia:101}));
});
