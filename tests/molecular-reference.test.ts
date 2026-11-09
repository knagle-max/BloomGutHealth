import test from "node:test";
import assert from "node:assert/strict";
import {buildBiologicalRegistry} from "../shared/biological-model";
import {evidenceAudit,molecularEvidenceStateSchema,molecularReferenceContext} from "../shared/scientific-contracts";

test("existing graph projects typed source-backed molecular reference, never personal production or a second registry",()=>{
 const registry=buildBiologicalRegistry();
 const refs=evidenceAudit(registry).relationships.flatMap(row=>row.molecularContext?[row.molecularContext]:[]);
 assert.ok(refs.length>=3);
 for(const row of refs){
  assert.ok(molecularEvidenceStateSchema.safeParse(row.evidenceState).success);
  assert.equal(row.scope,"reference");assert.equal(row.quantity,null);assert.equal(row.unit,null);
  assert.equal(row.personalActivityVerified,false);assert.equal(row.applyToUser,false);assert.equal(row.modelReuse,"not-assessed");
  assert.ok(row.sourceRefs.every(s=>s.version===registry.version&&s.rights==="citation-metadata-only"&&registry.sources.some(source=>source.id===s.id)));
  for(const kind of ["strain","gene","enzyme-ec","reaction-rhea","consumed-molecule","host-compartment"]){assert.equal(row.chain.find(link=>link.kind===kind)?.entityIds,null);}
 }
 assert.ok(refs.some(row=>row.evidenceState==="curated_pathway_possible"));
 assert.ok(refs.some(row=>row.evidenceState==="human_intervention_effect"));
 assert.ok(refs.some(row=>row.evidenceState==="human_association"));
});
test("withdrawn source, unresolved entity, forged relationship and composition-only evidence abstain",()=>{
 const registry=buildBiologicalRegistry(),edge=registry.relationships.find(e=>e.evidence==="mechanistic")!;
 assert.ok(molecularReferenceContext(edge,registry));
 assert.equal(molecularReferenceContext(edge,{...registry,sources:registry.sources.filter(s=>s.id!==edge.sourceIds[0])}),null);
 assert.equal(molecularReferenceContext(edge,{...registry,entities:registry.entities.filter(e=>e.id!==edge.from)}),null);
 assert.equal(molecularReferenceContext({...edge,claim:"Invented flux"},registry),null);
 const composition=registry.relationships.find(e=>e.evidence==="composition")!;
 assert.equal(molecularReferenceContext(composition,registry),null);
});
