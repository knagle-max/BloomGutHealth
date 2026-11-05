import {z} from "zod";
import type {GenotypeExplanation} from "./genotype-explanations";

export const GENETICS_RELEVANCE_VERSION = "genetics-relevance-2026-11-05.1";
const token=z.string().min(1).max(120);
const statement=z.string().min(1).max(800);
const rsid=z.string().regex(/^rs\d+$/);
const genotype=z.string().regex(/^[ACGT]{2}$/).refine(value=>value===value.split("").sort().join(""));
/** Review is attached to an exact variant–phenotype claim/version, never to an
 * entire gene or to catalogue membership. Unknown science stays null. This
 * registry is code-owned, not accepted from an import, API caller or browser. */
export const geneticHighlightClaimSchema=z.object({
 id:token,version:token,rsid,gene:token,phenotype:statement,meaning:statement,
 scope:z.enum(["education","clinical","pharmacogenetic","sensitive","research-only"]),
 review:z.object({state:z.enum(["pending","approved","withdrawn","retracted"]),reference:token.nullable(),reviewedOn:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()}).strict(),
 placement:z.object({build:z.literal("GRCh37"),chromosome:token,position:z.number().int().positive(),strand:z.literal("+")}).strict(),
 genotypes:z.array(genotype).min(1).max(10),assays:z.array(token).min(1).max(20),
 contrast:z.object({effectAllele:z.enum(["A","C","G","T"]).nullable(),otherAllele:z.enum(["A","C","G","T"]).nullable(),orientation:z.enum(["forward","unknown"])}).strict(),
 population:z.object({description:statement,transportability:z.enum(["reviewed-general","explicit-fit-required","unknown"]),allowedFitIds:z.array(token).max(30)}).strict(),
 evidence:z.object({
  credibility:z.enum(["replicated","supported","limited","unknown"]),design:statement,
  direction:statement.nullable(),effectSize:statement.nullable(),confidenceInterval:statement.nullable(),
  replication:statement.nullable(),contradictions:statement.nullable(),limitations:statement,
  citations:z.array(z.object({title:statement,url:z.string().url().refine(value=>value.startsWith("https://"))}).strict()).min(1).max(20),
 }).strict(),
 independence:z.object({group:token,status:z.enum(["correlated","unknown","reviewed-distinct"]),reference:token.nullable()}).strict(),
 relevance:z.object({goals:z.array(token).max(30),measuredContexts:z.array(token).max(30)}).strict(),
}).strict();
export type GeneticHighlightClaim=z.infer<typeof geneticHighlightClaimSchema>;
export type GeneticHighlightSource={
 id:string;revision:string;consent:boolean;
 calls:readonly {rsid:string;genotype:string;build:string|null;chromosome:string|null;position:number|null;strand:string|null;assay:string|null;assayVerified:boolean;normalizationVerified:boolean;populationFitId:string|null}[];
};
export type GeneticHighlightContext={goals:readonly string[];measuredContexts:readonly string[]};
export type GeneticHighlightExclusion="consent-required"|"source-unavailable"|"claim-review-pending"|"claim-withdrawn"|"restricted-scope"|"not-measured"|"no-readable-call"|"ambiguous-source"|"normalization-unverified"|"placement-incompatible"|"assay-unverified"|"genotype-not-covered"|"population-unverified"|"evidence-incomplete";
export type GeneticHighlight={claim:GeneticHighlightClaim;why:string[];sourceId:string;sourceRevision:string};
export type GeneticHighlightProjection={
 version:typeof GENETICS_RELEVANCE_VERSION;registryVersion:string;
 counts:{catalogued:number;measured:number;matchedEducation:number;interpretable:number;reviewedExplanations:number;personalEligible:number;selected:number};
 highlights:GeneticHighlight[];eligible:GeneticHighlight[];
 exclusions:Array<{claimId:string;reason:GeneticHighlightExclusion}>;
};
// No existing gene description, bibliographic candidate or legacy comparison
// has been independently approved for this new personal-prominence contract.
// Do not infer approval from an old `reviewed` marker or write synthetic test
// claims here. Reviewed additions require an exact source/version change.
export const GENETIC_HIGHLIGHT_REGISTRY_VERSION="genetic-highlight-claims-2026-11-05.1";
export const geneticHighlightClaims:readonly GeneticHighlightClaim[]=[];

/** Factual, owner-projected source calls with existing general gene education
 * are not personalized biological-effect claims. Reuse the existing record
 * and sources; never expose resultAdvice/comparison as the selected takeaway.
 * Ambiguous/no-call/unsupported source states remain in the complete source
 * reader, not presented as a confirmed observed genotype here. */
export function selectObservedGeneticEducation(entries:readonly GenotypeExplanation[]){
 const supported=entries.filter(entry=>/^[ACGT]{2}$/.test(entry.genotype)&&entry.referenceCompatibility==="compatible"&&
  (entry.status==="matched"||entry.status==="outside-studied-pair")&&!!entry.geneRole&&!!entry.sources.length&&
  !["rs429358","rs7412","rs1800562","rs1799945"].includes(entry.rsid));
 const ambiguous=new Set(entries.filter((entry,index)=>entries.findIndex(e=>e.rsid===entry.rsid)!==index).map(entry=>entry.rsid));
 const all=supported.filter(entry=>!ambiguous.has(entry.rsid)).sort((a,b)=>alphabetical(a.gene,b.gene)||alphabetical(a.rsid,b.rsid));
 const selected:GenotypeExplanation[]=[],seen=new Set<string>();
 for(const entry of all){const group=fads.has(entry.rsid)?"related-fads-pathway":entry.rsid;if(seen.has(group))continue;seen.add(group);selected.push(entry);if(selected.length===5)break;}
 return{all,selected};
}

function exclusion(claim:GeneticHighlightClaim,source:GeneticHighlightSource|null):GeneticHighlightExclusion|null{
 if(!source)return "source-unavailable";
 if(!source.consent)return "consent-required";
 if(claim.review.state==="withdrawn"||claim.review.state==="retracted")return "claim-withdrawn";
 if(claim.review.state!=="approved"||!claim.review.reference||!claim.review.reviewedOn)return "claim-review-pending";
 // Ordinary wellness highlights cannot unlock sensitive/PGx/clinical content.
 // APOE never becomes an isoform result from a one-marker claim, even if a
 // malformed registry entry labels it ordinary education.
 if(claim.scope!=="education"||["rs429358","rs7412"].includes(claim.rsid))return "restricted-scope";
 const calls=source.calls.filter(call=>call.rsid===claim.rsid);
 if(!calls.length)return "not-measured";
 if(calls.length!==1)return "ambiguous-source";
 const call=calls[0];
 if(!/^[ACGT]{2}$/.test(call.genotype))return "no-readable-call";
 if(!call.normalizationVerified||call.genotype!==call.genotype.split("").sort().join(""))return "normalization-unverified";
 if(call.build!==claim.placement.build||call.strand!==claim.placement.strand||call.chromosome!==claim.placement.chromosome||call.position!==claim.placement.position)return "placement-incompatible";
 if(!call.assayVerified||!call.assay||!claim.assays.includes(call.assay))return "assay-unverified";
 if(!claim.genotypes.includes(call.genotype))return "genotype-not-covered";
 if(!claim.contrast.effectAllele||!claim.contrast.otherAllele||claim.contrast.effectAllele===claim.contrast.otherAllele||claim.contrast.orientation!=="forward")return "evidence-incomplete";
 if(!call.genotype.split("").every(allele=>allele===claim.contrast.effectAllele||allele===claim.contrast.otherAllele))return "genotype-not-covered";
 if(claim.population.transportability==="unknown"||claim.population.transportability==="explicit-fit-required"&&(!call.populationFitId||!claim.population.allowedFitIds.includes(call.populationFitId)))return "population-unverified";
 if(claim.evidence.credibility==="unknown"||!claim.evidence.direction||!claim.evidence.replication||!claim.evidence.contradictions)return "evidence-incomplete";
 return null;
}
const fads=new Set(["rs174547","rs174550","rs174576","rs1535"]);
const alphabetical=(a:string,b:string)=>a<b?-1:a>b?1:0;
/** A fresh, deterministic read projection. No cache, source mutation, numeric
 * health/risk score, prevalence/rarity bonus or personal action generation.
 * Context is supplied by the owned canonical projection, never inferred from
 * genotypes. Missing labs/goals do not manufacture context or disqualify an
 * otherwise reviewed educational claim. */
export function selectGeneticHighlights(input:{
 claims:readonly GeneticHighlightClaim[];registryVersion:string;source:GeneticHighlightSource|null;
 context:GeneticHighlightContext;catalogued:number;matchedEducation:number;
}):GeneticHighlightProjection{
 const claims=z.array(geneticHighlightClaimSchema).max(1000).parse(input.claims);
 if(new Set(claims.map(c=>c.id)).size!==claims.length)throw Error("Duplicate genetic claim identity");
 const exclusions:GeneticHighlightProjection["exclusions"]=[],eligible:GeneticHighlight[]=[];
 for(const claim of claims){
  const reason=exclusion(claim,input.source);
  if(reason){exclusions.push({claimId:claim.id,reason});continue;}
  const why=["An exact reviewed educational claim covers this observed call, source placement and verified assay."];
  if(claim.relevance.goals.some(goal=>input.context.goals.includes(goal)))why.push("This topic matches a goal you recorded; the goal does not change the scientific claim.");
  if(claim.relevance.measuredContexts.some(context=>input.context.measuredContexts.includes(context)))why.push("A separately recorded measurement adds context; it is not inferred from your genotype.");
  why.push("Educational association only; no diagnosis, supplement dose or genotype-specific plan is generated.");
  eligible.push({claim,why,sourceId:input.source!.id,sourceRevision:input.source!.revision});
 }
 const evidenceOrder={replicated:0,supported:1,limited:2,unknown:3};
 const goalMatch=(c:GeneticHighlightClaim)=>c.relevance.goals.some(g=>input.context.goals.includes(g));
 const measuredMatch=(c:GeneticHighlightClaim)=>c.relevance.measuredContexts.some(g=>input.context.measuredContexts.includes(g));
 eligible.sort((a,b)=>evidenceOrder[a.claim.evidence.credibility]-evidenceOrder[b.claim.evidence.credibility]||Number(goalMatch(b.claim))-Number(goalMatch(a.claim))||Number(measuredMatch(b.claim))-Number(measuredMatch(a.claim))||alphabetical(a.claim.gene,b.claim.gene)||alphabetical(a.claim.id,b.claim.id));
 const groups=new Set<string>(),variants=new Set<string>(),highlights:GeneticHighlight[]=[];
 for(const finding of eligible){
  const claim=finding.claim;
  const distinct=claim.independence.status==="reviewed-distinct"&&!!claim.independence.reference;
  const group=fads.has(claim.rsid)&&!distinct?"related-fads-pathway":!distinct?claim.independence.group:claim.id;
  if(groups.has(group)||variants.has(claim.rsid))continue;
  groups.add(group);variants.add(claim.rsid);highlights.push(finding);
  if(highlights.length===5)break;
 }
 const measured=input.source?.consent?new Set(input.source.calls.filter(c=>/^[ACGT]{2}$/.test(c.genotype)).map(c=>c.rsid)).size:0;
 return{version:GENETICS_RELEVANCE_VERSION,registryVersion:input.registryVersion,
  counts:{catalogued:input.catalogued,measured,matchedEducation:input.source?.consent?input.matchedEducation:0,interpretable:new Set(eligible.map(e=>e.claim.rsid)).size,
   reviewedExplanations:claims.filter(c=>c.review.state==="approved"&&c.review.reference&&c.review.reviewedOn&&c.scope==="education").length,personalEligible:eligible.length,selected:highlights.length},
  highlights,eligible,exclusions};
}
