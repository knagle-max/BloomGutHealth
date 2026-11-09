import { z } from "zod";
import type { BiologicalRegistry, KnowledgeRelationship } from "./biological-model";

/** Shared claim vocabulary. Entered lab values retain reported/unverified provenance;
 * a category never upgrades the quality of an observation or validates a model. */
export const claimKindSchema = z.enum(["measured", "modelled-with-validation", "inferred-association", "experimental", "unknown"]);
export function relationshipClaimKind(edge: KnowledgeRelationship) {
  return "inferred-association" as const;
}
export function evidenceAudit(registry: BiologicalRegistry) {
  return {
    version: registry.version,
    specialistReview: "pending" as const,
    // An implementation date must never masquerade as a scientific review date.
    scientificReviewDate: null,
    relationships: registry.relationships.map(edge => ({
      id: edge.id, claimKind: relationshipClaimKind(edge), outcome: edge.to,
      evidenceClass: edge.evidence, appliesToPersonalEffects: false,
      context: edge.context, limitation: edge.limitation,
      contradictions: edge.contradictions, contradictionReview: edge.contradictionStatus,
      sources: edge.sourceIds.map(id => registry.sources.find(s => s.id === id)!),
      reviewDate: null,
      reviewStatus: "awaiting-specialist-review" as const,
      molecularContext: molecularReferenceContext(edge, registry),
      gaps: ["Independent scientific review and review date outstanding.",
        ...(edge.contradictionStatus === "not-systematically-reviewed" ? ["Competing findings have not been systematically reviewed."] : []),
        ...(edge.sourceIds.some(id => /must be checked/i.test(registry.sources.find(s => s.id === id)?.population || "")) ? ["Source population requires extraction and applicability review."] : [])],
    })),
  };
}

const ref = z.string().min(1).max(150);
const participant = z.object({ entityId:ref, stoichiometry:z.number().finite().positive(), compartment:ref }).strict();
/** Ontology contract only: no reactions become recommendation rules without review. */
export const hostMicrobeReactionSchema = z.object({
  id:ref, name:z.string().min(1).max(300),
  system:z.enum(["host","microbial","cross-feeding"]),
  genes:z.array(ref).max(100), enzymes:z.array(ref).max(100), organisms:z.array(ref).max(100),
  substrates:z.array(participant).min(1).max(100), products:z.array(participant).min(1).max(100),
  cofactors:z.array(ref).max(100), transport:z.array(ref).max(100),
  regulation:z.array(z.object({entityId:ref,direction:z.enum(["activates","inhibits","context-dependent"]),context:z.string().min(1).max(1000)}).strict()).max(100),
  direction:z.enum(["forward","reversible","unknown"]),
  sourceIds:z.array(ref).min(1).max(100), relationshipIds:z.array(ref).max(100),
  measuredMarkerIds:z.array(ref).max(100), actionIds:z.array(ref).max(100),
  reviewStatus:z.enum(["proposed","specialist-reviewed"]), reviewDate:z.string().date().nullable(),
  limitations:z.array(z.string().min(1).max(1000)).min(1).max(30),
}).strict().superRefine((v,ctx)=>{
  if(v.reviewStatus==="specialist-reviewed"&&!v.reviewDate)ctx.addIssue({code:"custom",message:"Reviewed reactions require a review date"});
});
export function reactionEligibility(input:unknown, registry:BiologicalRegistry) {
  const parsed=hostMicrobeReactionSchema.safeParse(input);
  if(!parsed.success)return {eligible:false,reason:"Incomplete reaction contract."};
  const r=parsed.data, nodes=new Set(registry.entities.map(e=>e.id));
  const refs=[...r.genes,...r.enzymes,...r.organisms,...r.cofactors,...r.transport,...r.measuredMarkerIds,...r.actionIds,...r.substrates.map(p=>p.entityId),...r.products.map(p=>p.entityId),...r.regulation.map(p=>p.entityId)];
  if(refs.some(id=>!nodes.has(id))||r.sourceIds.some(id=>!registry.sources.some(s=>s.id===id))||r.relationshipIds.some(id=>!registry.relationships.some(e=>e.id===id)))return {eligible:false,reason:"Unresolved evidence or entity reference."};
  // Schema completeness is deliberately insufficient to activate clinical decisions.
  return {eligible:false,reason:"Reaction research is not an activated or validated personal recommendation model."};
}
export const simulationReadinessSchema=z.object({
  taxonomyCoverage:z.string().min(1), foodSubstrateMapping:z.string().min(1),
  solver:z.string().min(1), organismDatabase:z.string().min(1),
  assumptions:z.array(z.string().min(1)).min(1), independentBenchmarks:z.array(z.string().min(1)).min(1),
  uncertainty:z.string().min(1), abstentionConditions:z.array(z.string().min(1)).min(1),
}).strict();
export function simulationReadiness(input:unknown) {
  return {configured:simulationReadinessSchema.safeParse(input).success, activated:false as const,
    reason:"No independently validated personal flux backend is activated. Scenarios are not measured host concentrations or daily synthesis."};
}

/** More precise than claimKind: a literature pathway, source observation and
 * synthetic flux are different facts, even when they mention the same molecule. */
export const molecularEvidenceStateSchema=z.enum([
  "source_observed_taxon","measured_abundance","measured_gene","measured_transcript",
  "measured_protein","measured_metabolite","measured_flux","published_strain_capacity",
  "curated_pathway_possible","modelled_reaction_flux","modelled_community_exchange",
  "hypothetical_food_substrate_scenario","human_association","human_intervention_effect",
  "approved_everyday_action","clinical_claim_withheld",
]);
export const molecularChainKinds=["taxon","strain","genome","gene","protein","enzyme-ec","reaction-rhea","substrate","cofactor","transport","produced-molecule","consumed-molecule","community-exchange","host-compartment","food-substrate"] as const;
export const molecularReferenceContextSchema=z.object({
  version:z.literal("molecular-reference-v1"),registryVersion:ref,
  relationshipId:ref,evidenceState:z.enum(["curated_pathway_possible","human_association","human_intervention_effect"]),
  scope:z.literal("reference"),sourceRefs:z.array(z.object({id:ref,version:ref,url:z.string().url(),rights:z.literal("citation-metadata-only")}).strict()).min(1),
  chain:z.array(z.object({kind:z.enum(molecularChainKinds),entityIds:z.array(ref).nullable()}).strict()),
  quantity:z.null(),unit:z.null(),personalActivityVerified:z.literal(false),
  modelReuse:z.literal("not-assessed"),applyToUser:z.literal(false),limitations:z.array(z.string()).min(1),
}).strict();
/** Project the ONE existing graph. Unknown chain links stay null, never inferred
 * from a species/genus label. Citation metadata is not a model/data licence. */
export function molecularReferenceContext(edge:KnowledgeRelationship,registry:BiologicalRegistry){
  if(!["mechanistic","association","human-intervention"].includes(edge.evidence))return null;
  const canonical=registry.relationships.find(row=>row.id===edge.id);
  if(!canonical||JSON.stringify(canonical)!==JSON.stringify(edge))return null;
  const sources=edge.sourceIds.map(id=>registry.sources.find(s=>s.id===id));
  if(!sources.length||sources.some(s=>!s))return null;
  const endpoints=[edge.from,edge.to].map(id=>registry.entities.find(e=>e.id===id));
  if(endpoints.some(e=>!e))return null;
  return molecularReferenceContextSchema.parse({
    version:"molecular-reference-v1",registryVersion:registry.version,relationshipId:edge.id,
    evidenceState:edge.evidence==="mechanistic"?"curated_pathway_possible":edge.evidence==="association"?"human_association":"human_intervention_effect",
    scope:"reference",sourceRefs:sources.map(s=>({id:s!.id,version:registry.version,url:s!.url,rights:"citation-metadata-only"})),
    // Existing broad mechanism links do not specify molecular stoichiometry,
    // reaction identifiers, strains, transport, consumption or host compartments.
    chain:molecularChainKinds.map(kind=>{const ids=kind==="substrate"?endpoints.filter(e=>e!.kind==="substrate").map(e=>e!.id):[];return{kind,entityIds:ids.length?ids:null};}),
    quantity:null,unit:null,personalActivityVerified:false,modelReuse:"not-assessed",applyToUser:false,
    limitations:[edge.limitation,"A cited pathway or human study is not a measured personal flux, strain/gene finding or model reuse permission. Unspecified chain links remain unknown."],
  });
}
