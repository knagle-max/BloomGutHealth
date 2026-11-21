import {createHash} from 'node:crypto';
import {z} from 'zod';
import {biologicalRegistrySchema,knowledgeEntitySchema,knowledgeSourceSchema,knowledgeRelationshipSchema} from '../shared/biological-model';
import {scientificRetrievalReviewSchema,retrieveReviewedScientificEvidence,type ScientificWithdrawals} from './scientific-evidence-retrieval';

/** Strictly public scientific subset of the existing graph. Arbitrary metadata,
 * personal observations, prompts/provider transcripts and model weights cannot
 * be serialized into this release format. Free prose still needs independent
 * original-source/publication review; a schema is not a privacy classifier. */
const releaseRegistrySchema=biologicalRegistrySchema.extend({
 entities:z.array(knowledgeEntitySchema.extend({metadata:z.object({}).strict()}).strict()).max(200),
 sources:z.array(knowledgeSourceSchema.strict()).max(100),
 relationships:z.array(knowledgeRelationshipSchema.strict()).max(200),
}).strict();
const releasePayloadSchema=z.object({
 schemaVersion:z.literal('nonpersonal-scientific-release-v1'),
 id:z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/),
 scope:z.literal('reviewed-nonpersonal-science'),
 registry:releaseRegistrySchema,
 reviews:z.array(scientificRetrievalReviewSchema).min(1).max(300),
}).strict();
const publicationSchema=z.object({
 id:z.string().min(1).max(128),reviewerId:z.string().min(1).max(128),
 scope:z.literal('independent-nonpersonal-source-and-publication-review'),
 approvedPayloadDigest:z.string().regex(/^[a-f0-9]{64}$/),
 validUntil:z.string().datetime(),
}).strict();
export const scientificReleaseSchema=z.object({
 payload:releasePayloadSchema,publication:publicationSchema,
 digest:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type ScientificRelease=z.infer<typeof scientificReleaseSchema>;
/** Canonical keys; semantic record collections sorted below. No timestamps or
 * unstable database IDs are generated during packaging/restoration. */
function canonical(value:unknown):string{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical((value as Record<string,unknown>)[key])).join(',')+'}';
}
const digest=(value:unknown)=>createHash('sha256').update(canonical(value)).digest('hex');
function canonicalPayload(untrusted:unknown){
 const payload=releasePayloadSchema.parse(untrusted);
 payload.registry.entities.sort((a,b)=>(a.id<b.id?-1:a.id>b.id?1:0));
 payload.registry.sources.sort((a,b)=>(a.id<b.id?-1:a.id>b.id?1:0));
 payload.registry.relationships.sort((a,b)=>(a.id<b.id?-1:a.id>b.id?1:0));
 payload.reviews.sort((a,b)=>(a.id<b.id?-1:a.id>b.id?1:0));
 return payload;
}
export function scientificReleasePayloadDigest(untrusted:unknown){return digest(canonicalPayload(untrusted));}
/** Packaging requires an already supplied independent publication disposition;
 * it never invents one or promotes a Gemini candidate. Current withdrawals are
 * not packaged as historical truth: mandatory fresh authority is separate. */
export function verifyScientificRelease(untrusted:unknown,current:{withdrawals:ScientificWithdrawals;now:number}){
 const parsed=scientificReleaseSchema.parse(untrusted),payload=canonicalPayload(parsed.payload),publication=parsed.publication;
 if(!Number.isFinite(current.now)||Date.parse(publication.validUntil)<=current.now||publication.approvedPayloadDigest!==digest(payload)||parsed.digest!==digest({payload,publication}))throw Error('SCIENTIFIC_RELEASE_INTEGRITY');
 const registry=payload.registry;
 const entityIds=new Set(registry.entities.map(row=>row.id));
 if(entityIds.size!==registry.entities.length||!registry.relationships.length||registry.relationships.some(row=>!entityIds.has(row.from)||!entityIds.has(row.to)))throw Error('SCIENTIFIC_RELEASE_GRAPH');
 const relationships=new Set(registry.relationships.map(row=>row.id)),sources=new Set(registry.sources.map(row=>row.id));
 if(payload.reviews.some(review=>!relationships.has(review.relationshipId)||!sources.has(review.sourceId)))throw Error('SCIENTIFIC_RELEASE_ORPHAN_REVIEW');
 const pages=[];
 for(const entity of registry.entities){
  const result=retrieveReviewedScientificEvidence({registry,reviews:payload.reviews,withdrawals:current.withdrawals,query:{entityIds:[entity.id]},now:current.now});
  pages.push(result);
 }
 // Withdrawal hides current use, but an absent/invalid original review must
 // not be legitimized by packaging. Validate against no historical removals,
 // independently of the current overlay, without granting current retrieval.
 const empty:ScientificWithdrawals={relationshipIds:new Set(),sourceIds:new Set(),reviewIds:new Set(),rightsIds:new Set()};
 for(const entity of registry.entities){
  const original=retrieveReviewedScientificEvidence({registry,reviews:payload.reviews,withdrawals:empty,query:{entityIds:[entity.id]},now:current.now});
  if(original.withheld)throw Error('SCIENTIFIC_RELEASE_UNREVIEWED_CLAIM');
 }
 return {release:{payload,publication,digest:parsed.digest},currentEvidenceVersion:digest(pages.map(page=>page.evidenceVersion)),clinicalReleasePermitted:false as const,modelTrainingPermitted:false as const};
}
/** Immutable canonical bytes; publication approval remains mandatory input. */
export function serializeScientificRelease(payload:unknown,publication:unknown,current:{withdrawals:ScientificWithdrawals;now:number}){
 const normalized=canonicalPayload(payload),approved=publicationSchema.parse(publication);
 const release={payload:normalized,publication:approved,digest:digest({payload:normalized,publication:approved})};
 verifyScientificRelease(release,current);
 return canonical(release)+'\n';
}
