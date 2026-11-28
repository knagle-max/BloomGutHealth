import { createHash } from 'node:crypto';
import { z } from 'zod';
import { biologicalRegistrySchema, type BiologicalRegistry, type KnowledgeRelationship } from '../shared/biological-model';

export const SCIENTIFIC_RETRIEVAL_VERSION='reviewed-science-retrieval-v4' as const;
const id=z.string().min(1).max(128),sha=z.string().regex(/^[a-f0-9]{64}$/);
/** Additive review overlay on the existing registry. Metadata/DOI presence and
 * model agreement do not create this record. Source acquisition and independent
 * review must supply original accessible content, exact finding and rights. */
export const scientificRetrievalReviewSchema=z.object({
  id,relationshipId:id,sourceId:id,registryBinding:sha,
  sourceVersion:id,
  publication:z.object({doi:z.string().regex(/^10\.\d{4,9}\/[^\s]+$/i).max(255),studyFamilyId:id}).strict().optional(),
  contentDigest:sha,locator:z.string().min(1).max(500),
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
  const canonical=biologicalRegistrySchema.parse(registry);
  const matched=canonical.relationships.find(row=>row.id===relationship.id);
  return digest([canonical.version,matched??null,canonical.sources.find(source=>source.id===sourceId)??null]);
}
const querySchema=z.object({entityIds:z.array(id).min(1).max(4)}).strict();
/** Only an explicit resolver URL asserts a DOI here. Publisher page URLs are
 * not guessed or fetched; matching identity alone never verifies a finding. */
function sourcePublicationMatches(sourceUrl:string,publication:ScientificRetrievalReview['publication']){
 if(!publication)return true; // Unknown identity remains unknown below.
 const url=new URL(sourceUrl),host=url.hostname.toLowerCase().replace(/\.$/,'');
 if(host!=='doi.org'&&host!=='dx.doi.org')return true;
 try{
  const sourceDoi=decodeURIComponent(url.pathname.slice(1));
  return /^10\.\d{4,9}\/[^\s]+$/i.test(sourceDoi)&&sourceDoi.toLowerCase()===publication.doi.toLowerCase();
 }catch{return false;}
}
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
        review.registryBinding!==scientificRegistryBinding(registry,relationship,sourceId)||review.excerptDigest!==scientificExcerptDigest(review.excerpt)||review.rights.sourceUrl!==source.url||
        !sourcePublicationMatches(source.url,review.publication)){withheld++;continue;}
      cards.push({relationship,source,review});
    }
  }
  cards.sort((a,b)=>(a.relationship.id<b.relationship.id?-1:a.relationship.id>b.relationship.id?1:0)||(a.source.id<b.source.id?-1:a.source.id>b.source.id?1:0));
  // Refuse over-budget retrieval rather than silently dropping contrary/null
  // findings to keep only convenient supporting papers.
  if(cards.length>12||Buffer.byteLength(JSON.stringify(cards),'utf8')>40_000)throw Error('EVIDENCE_RETRIEVAL_LIMIT');
  // Keep every outcome/analysis card, including contrary/null findings, while
  // grouping citations from the same publication or independently reviewed
  // shared cohort. Unknown identity never becomes another independent study.
  const publications=new Map<string,{doi:string;studyFamilyId:string;reviewIds:string[]}>();
  let unidentified=0;
  for(const card of cards){
    const identity=card.review.publication;
    if(!identity){unidentified++;continue;}
    const doi=identity.doi.toLowerCase(),existing=publications.get(doi);
    if(existing&&existing.studyFamilyId!==identity.studyFamilyId)throw Error('SCIENTIFIC_STUDY_IDENTITY_CONFLICT');
    const publication=existing??{doi,studyFamilyId:identity.studyFamilyId,reviewIds:[]};
    publication.reviewIds.push(card.review.id);publications.set(doi,publication);
  }
  const publicationGroups=Array.from(publications.values()).sort((a,b)=>a.doi<b.doi?-1:a.doi>b.doi?1:0);
  const studyFamilyIds=Array.from(new Set(publicationGroups.map(row=>row.studyFamilyId))).sort();
  // Bind the scoped retrieval universe, including withheld context. A stable
  // registry label and unchanged admitted cards do not prove that missing or
  // unreviewed contrary context stayed unchanged during private reasoning.
  // Sorting avoids invalidation caused only by record collection order.
  const byId=<T extends {id:string}>(rows:T[])=>rows.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  const coverageRelationships=byId(eligible.map(row=>({...row,sourceIds:[...row.sourceIds].sort()})));
  const coverageEntityIds=new Set([...Array.from(requested),...eligible.flatMap(row=>[row.from,row.to])]);
  const coverageSourceIds=new Set(eligible.flatMap(row=>row.sourceIds));
  const coverage={queryEntityIds:Array.from(requested).sort(),relationships:coverageRelationships,
    entities:byId(registry.entities.filter(row=>coverageEntityIds.has(row.id))),
    sources:byId(registry.sources.filter(row=>coverageSourceIds.has(row.id))),withheld};
  return {version:SCIENTIFIC_RETRIEVAL_VERSION,registryVersion:registry.version,cards:structuredClone(cards),withheld,
    publicationGroups,studyFamilyIds,unidentifiedPublications:unidentified,
    studyFamilyCount:!cards.length||unidentified||withheld?null:studyFamilyIds.length,
    independence:'not-established-by-publication-count' as const,
    opposingEvidenceStatus:cards.some(card=>['contrary','null','harm'].includes(card.review.findingDirection))?'included' as const:'not-established' as const,
    clinicalReleasePermitted:false as const,modelTrainingPermitted:false as const,
    evidenceVersion:digest([SCIENTIFIC_RETRIEVAL_VERSION,registry.version,coverage,cards,Array.from(input.withdrawals.relationshipIds).sort(),Array.from(input.withdrawals.sourceIds).sort(),Array.from(input.withdrawals.reviewIds).sort(),Array.from(input.withdrawals.rightsIds).sort()])};
}
