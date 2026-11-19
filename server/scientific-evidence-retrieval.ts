import { createHash } from 'node:crypto';
import { z } from 'zod';
import { biologicalRegistrySchema, type BiologicalRegistry, type KnowledgeRelationship } from '../shared/biological-model';

const id=z.string().min(1).max(128),sha=z.string().regex(/^[a-f0-9]{64}$/);
/** Additive review overlay on the existing registry. Metadata/DOI presence and
 * model agreement do not create this record. Source acquisition and independent
 * review must supply original accessible content, exact finding and rights. */
export const scientificRetrievalReviewSchema=z.object({
  id,relationshipId:id,sourceId:id,registryBinding:sha,
  sourceVersion:id,contentDigest:sha,locator:z.string().min(1).max(500),
  excerpt:z.string().min(12).max(3200),excerptDigest:sha,
  findingDirection:z.enum(['supporting','contrary','null','harm','uncertain']),
  studyDesign:z.string().min(3).max(400),population:z.string().min(3).max(600),
  measurementContext:z.string().min(3).max(600),applicabilityLimits:z.array(z.string().min(3).max(600)).min(1).max(8),
  review:z.object({id,reviewerId:id,disposition:z.literal('independently-source-verified'),scope:z.literal('nonpersonal-scientific-retrieval'),validUntil:z.string().datetime()}).strict(),
  rights:z.object({id,revision:id,license:z.string().min(1).max(400),sourceUrl:z.string().url(),retrievalEligible:z.literal(true),modelTrainingEligible:z.literal(false),validUntil:z.string().datetime()}).strict(),
}).strict();
export type ScientificRetrievalReview=z.infer<typeof scientificRetrievalReviewSchema>;
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const scientificExcerptDigest=(excerpt:string)=>digest(excerpt);
export function scientificRegistryBinding(registry:BiologicalRegistry,relationship:KnowledgeRelationship,sourceId:string){
  return digest([registry.version,relationship,registry.sources.find(source=>source.id===sourceId)??null]);
}
const querySchema=z.object({entityIds:z.array(id).min(1).max(4)}).strict();
export type ScientificWithdrawals={relationshipIds:ReadonlySet<string>;sourceIds:ReadonlySet<string>;reviewIds:ReadonlySet<string>;rightsIds:ReadonlySet<string>};
/** Local, bounded, provider-independent retrieval. No HTTP call or clinical
 * release. A current withdrawal overlay is mandatory, including during rollback.
 * Never promote all registry relationships merely because the IDs exist. */
export function retrieveReviewedScientificEvidence(input:{
  registry:unknown;reviews:readonly unknown[];withdrawals:ScientificWithdrawals;
  query:unknown;now?:number;
}){
  const registry=biologicalRegistrySchema.parse(input.registry),query=querySchema.parse(input.query),now=input.now??Date.now();
  if(!Number.isFinite(now)||input.reviews.length>2000||registry.relationships.length>10000)throw Error('EVIDENCE_RETRIEVAL_LIMIT');
  const entities=new Set(registry.entities.map(entity=>entity.id));
  if(query.entityIds.some(id=>!entities.has(id)))throw Error('UNKNOWN_EVIDENCE_ENTITY');
  const requested=new Set(query.entityIds),eligible=registry.relationships.filter(relationship=>requested.has(relationship.from)||requested.has(relationship.to));
  if(entities.size!==registry.entities.length||registry.relationships.some(row=>new Set(row.sourceIds).size!==row.sourceIds.length)||new Set(registry.relationships.map(row=>row.id)).size!==registry.relationships.length||new Set(registry.sources.map(row=>row.id)).size!==registry.sources.length)throw Error('AMBIGUOUS_REGISTRY_IDENTITY');
  const parsed=input.reviews.map(value=>scientificRetrievalReviewSchema.safeParse(value));
  const reviewCounts=new Map<string,number>();
  for(const row of parsed)if(row.success)reviewCounts.set(row.data.id,(reviewCounts.get(row.data.id)??0)+1);
  const cards:Array<{relationship:KnowledgeRelationship;source:BiologicalRegistry['sources'][number];review:ScientificRetrievalReview}>=[];
  let withheld=0;
  for(const relationship of eligible){
    for(const sourceId of relationship.sourceIds){
      const source=registry.sources.find(row=>row.id===sourceId);
      const matches=parsed.flatMap(row=>row.success&&row.data.relationshipId===relationship.id&&row.data.sourceId===sourceId?[row.data]:[]);
      // Ambiguous review versions cannot be selected by array order.
      if(!source||matches.length!==1){withheld++;continue;}
      const review=matches[0],withdrawn=input.withdrawals;
      if(reviewCounts.get(review.id)!==1||withdrawn.relationshipIds.has(relationship.id)||withdrawn.sourceIds.has(sourceId)||withdrawn.reviewIds.has(review.id)||withdrawn.rightsIds.has(review.rights.id)||
        Date.parse(review.review.validUntil)<=now||Date.parse(review.rights.validUntil)<=now||
        review.registryBinding!==scientificRegistryBinding(registry,relationship,sourceId)||review.excerptDigest!==scientificExcerptDigest(review.excerpt)||review.rights.sourceUrl!==source.url){withheld++;continue;}
      cards.push({relationship,source,review});
    }
  }
  cards.sort((a,b)=>a.relationship.id.localeCompare(b.relationship.id)||a.source.id.localeCompare(b.source.id));
  // Refuse over-budget retrieval rather than silently dropping contrary/null
  // findings to keep only convenient supporting papers.
  if(cards.length>12||Buffer.byteLength(JSON.stringify(cards),'utf8')>40_000)throw Error('EVIDENCE_RETRIEVAL_LIMIT');
  return {version:'reviewed-science-retrieval-v1' as const,registryVersion:registry.version,cards:structuredClone(cards),withheld,
    opposingEvidenceStatus:cards.some(card=>['contrary','null','harm'].includes(card.review.findingDirection))?'included' as const:'not-established' as const,
    clinicalReleasePermitted:false as const,modelTrainingPermitted:false as const,
    evidenceVersion:digest([registry.version,cards,Array.from(input.withdrawals.relationshipIds).sort(),Array.from(input.withdrawals.sourceIds).sort(),Array.from(input.withdrawals.reviewIds).sort(),Array.from(input.withdrawals.rightsIds).sort()])};
}
