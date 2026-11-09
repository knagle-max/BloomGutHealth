import test from "node:test";
import assert from "node:assert/strict";
import { buildBiologicalRegistry } from "../shared/biological-model";
import { claimKindSchema, evidenceAudit, hostMicrobeReactionSchema, reactionEligibility, simulationReadiness } from "../shared/scientific-contracts";
import { experimentSchema } from "../shared/experience";
import { reviewExperiment } from "../shared/experiment-review";
import { publicSample } from "../server/analysis-boundary";

test("evidence audit exposes all references, incomplete applicability and pending review without certifying effects",()=>{
  const registry=buildBiologicalRegistry(),audit=evidenceAudit(registry);
  assert.equal(audit.relationships.length,registry.relationships.length);
  assert.equal(audit.scientificReviewDate,null);
  assert.ok(audit.relationships.every(e=>e.sources.length&&e.sources.every(s=>s.population&&s.design&&s.limitation)&&e.reviewDate===null&&!e.appliesToPersonalEffects&&claimKindSchema.safeParse(e.claimKind).success));
  assert.ok(audit.relationships.some(e=>e.gaps.some(g=>/population/.test(g))));
  assert.ok(audit.relationships.some(e=>e.contradictions.length));
  assert.ok(audit.relationships.every(e=>e.claimKind!==("measured" as string)));
});
test("reaction ontology requires stoichiometry, compartments, evidence and review; completeness never activates inference",()=>{
  const r={id:"synthetic",name:"Synthetic contract only",system:"host",genes:[],enzymes:[],organisms:[],substrates:[{entityId:"nutrient:beta-glucan",stoichiometry:1,compartment:"gut"}],products:[{entityId:"biomarker:ldl",stoichiometry:1,compartment:"plasma"}],cofactors:[],transport:[],regulation:[],direction:"unknown",sourceIds:["oat-viscosity-trial"],relationshipIds:[],measuredMarkerIds:[],actionIds:[],reviewStatus:"proposed",reviewDate:null,limitations:["Synthetic, not a biochemical assertion"]};
  assert.ok(hostMicrobeReactionSchema.safeParse(r).success);
  assert.ok(!hostMicrobeReactionSchema.safeParse({...r,reviewStatus:"specialist-reviewed"}).success);
  assert.ok(!hostMicrobeReactionSchema.safeParse({...r,substrates:[{entityId:"id",stoichiometry:0}]}).success);
  assert.equal(reactionEligibility(r,buildBiologicalRegistry()).eligible,false);
  assert.match(reactionEligibility({...r,sourceIds:["missing"]},buildBiologicalRegistry()).reason,/Unresolved/);
  assert.equal(simulationReadiness({}).configured,false);
  assert.equal(simulationReadiness({taxonomyCoverage:"test",foodSubstrateMapping:"test",solver:"test",organismDatabase:"test",assumptions:["test"],independentBenchmarks:["test"],uncertainty:"test",abstentionConditions:["test"]}).activated,false);
});
const experiment={mode:"everyday",title:"Routine",startsOn:"2026-10-10",endsOn:"2026-10-17",action:"One familiar food change",outcome:"Self-rated comfort",design:{baselineStartsOn:"2026-10-01",baselineEndsOn:"2026-10-07",metricUnit:"rating 0–10",measurementMethod:"Same question each morning",expectedDirection:"observe",confoundersToTrack:"Sleep, illness, training and medicines"},observations:[]};
test("experiments keep insufficient data first-class and report only descriptive changes with adherence and confounding limits",()=>{
  assert.equal(reviewExperiment(experiment).status,"insufficient-data");
  assert.equal(reviewExperiment({...experiment,design:null}).change,null);
  const observations=[1,2,3].map((n)=>({date:`2026-10-0${n}`,value:n,adherence:null,confounders:""})).concat([10,11,12].map(n=>({date:`2026-10-${n}`,value:n-6,adherence:null,confounders:""})));
  const result=reviewExperiment({...experiment,observations});
  assert.equal(result.status,"observed-change");assert.equal(result.baseline,2);assert.equal(result.followup,5);assert.equal(result.change,3);
  assert.match(result.note,/adherence is incomplete/);assert.match(result.caveat,/cannot establish cause/);
  assert.ok(!experimentSchema.safeParse({...experiment,observations:[observations[0],observations[0]]}).success);
  assert.ok(!experimentSchema.safeParse({...experiment,observations:[{...observations[0],date:"2026-10-09"}]}).success);
  assert.ok(!experimentSchema.safeParse({...experiment,design:{...experiment.design,baselineEndsOn:"2026-10-10"}}).success);
});
test("legacy raw-file paths are withheld while original records and report observations remain intact",()=>{
  const sample={id:"a",rawDataPath:"/private/original.fastq",structuredData:{organisms:["Example"]}};
  assert.equal("rawDataPath" in publicSample(sample),false);
  assert.equal(sample.rawDataPath,"/private/original.fastq");assert.deepEqual(publicSample(sample).structuredData,sample.structuredData);
});
