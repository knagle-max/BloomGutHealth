import {z} from "zod";
import bibliography from "./data/genetics-candidate-bibliography";
import { genotypeAnnotations, type GenotypeExplanation } from "./genotype-explanations";
import reference from "./data/genotype-reference.json";

export const GENETICS_CATALOGUE_VERSION = "genetics-catalogue-2026-11-05.2";
export const geneticsDomains = [
  { id: "liver", title: "Hepatic fat / MASLD" },
  { id: "lipids", title: "LDL, ApoB & lipoproteins" },
  { id: "glucose", title: "Glucose, insulin & adiposity" },
  { id: "pufa", title: "PUFA processing" },
  { id: "vitamin-a", title: "Vitamin A" },
  { id: "vitamin-d", title: "Vitamin D" },
  { id: "one-carbon", title: "Folate, B12 & one-carbon" },
  { id: "minerals", title: "Iron & minerals" },
  { id: "gut", title: "Food tolerance, gut & immune" },
  { id: "exercise", title: "Muscle & exercise" },
  { id: "bone", title: "Bone & connective tissue" },
  { id: "circadian", title: "Circadian, appetite & taste" },
  { id: "exposure", title: "Oxidative & exposure biology" },
  { id: "immune", title: "Immunity & inflammation" },
  { id: "aging", title: "Healthy aging" },
  { id: "pgx", title: "Pharmacogenetics" },
  { id: "lpa", title: "Lp(a) structural biology" },
] as const;
export type GeneticsDomain = typeof geneticsDomains[number]["id"];
// Candidate representation is not assay support. Current import remains the
// existing 29 SNVs; no rs-only call can create any complex candidate's result.
export type CandidateIdentity =
  | { kind: "snv"; rsid: string; placement: { assembly: "GRCh37"; chromosome: string; position: number; strand: "forward"; referenceAlleles: string[] } | null }
  | { kind: "insertion"; rsid: string; placement: null }
  | { kind: "deletion" | "copy-number" | "repeat" | "haplotype" | "hla-typing" | "structural-repeat" | "star-allele"; designation: string }
  | { kind: "gene" };
export type GeneticsCandidate = {
  id: string;
  gene: string;
  label: string;
  domains: readonly GeneticsDomain[];
  identity: CandidateIdentity;
  content: { status: "existing-education"; explanationRsid: string } | { status: "review-pending" };
  sensitivity: "genetic" | "sensitive";
  requirementSource: "existing-catalogue" | "architect-2026-11-04" | "bibliographic-source-2026-11-05";
  bibliography?:Array<{pmid:string;title:string;scope:string;checkedOn:string;review:"pending"}>;
  assayRequirement: string;
};

const existingDomains: Record<string, GeneticsDomain[]> = {
  rs1801133: ["one-carbon"], rs1801131: ["one-carbon"], rs1801394: ["one-carbon"],
  rs1805087: ["one-carbon"], rs234706: ["one-carbon"], rs601338: ["one-carbon", "gut"],
  rs174547: ["pufa"], rs174550: ["pufa"], rs12934922: ["vitamin-a"],
  rs10741657: ["vitamin-d"], rs10877012: ["vitamin-d"],
  rs1800562: ["minerals"], rs1799945: ["minerals"], rs855791: ["minerals"],
  rs7903146: ["glucose"], rs10830963: ["glucose", "circadian"],
  rs33972313: ["exposure"], rs9939609: ["glucose", "circadian"],
  rs17782313: ["circadian"], rs838133: ["circadian"], rs4880: ["exposure"],
  rs429358: ["lipids"], rs7412: ["lipids"], rs5400: ["glucose"], rs5082: ["lipids"],
  rs738409: ["liver"], rs58542926: ["liver", "lipids"], rs1260326: ["liver", "glucose"],
  rs4988235: ["gut"],
};
const existing: GeneticsCandidate[] = genotypeAnnotations.map(a => {
  const mapping = reference.variants.find(r => r.rsid === a.rsid)!.mappings[0];
  return {
    id: `variant:${a.rsid}`, gene: a.gene, label: `${a.gene} · ${a.rsid}`,
    domains: existingDomains[a.rsid],
    identity: { kind: "snv", rsid: a.rsid, placement: { assembly: "GRCh37", chromosome: mapping.chromosome, position: mapping.position, strand: "forward", referenceAlleles: mapping.alleles.split("/") } },
    content: { status: "existing-education", explanationRsid: a.rsid },
    sensitivity: ["rs429358", "rs7412"].includes(a.rsid) ? "sensitive" : "genetic",
    requirementSource: "existing-catalogue", assayRequirement: "Confirmed source build, placement and forward orientation; study-pair coverage required for an explanation. A common SNP is not a structural or haplotype assay.",
  };
});
function pending(gene: string, label: string, domains: GeneticsDomain[], identity: CandidateIdentity, assayRequirement: string, sensitivity: "genetic" | "sensitive" = "genetic"): GeneticsCandidate {
  const key = "rsid" in identity ? identity.rsid : "designation" in identity ? `${gene}:${identity.designation}` : gene;
  return { id: `${identity.kind}:${key}`, gene, label, domains, identity, content: { status: "review-pending" }, sensitivity, requirementSource: "architect-2026-11-04", assayRequirement };
}
const namedCandidates: GeneticsCandidate[] = [
  pending("COMT", "COMT · rs4680", ["one-carbon", "exposure"], { kind: "snv", rsid: "rs4680", placement: null }, "Build, placement, alleles and evidence have not been curated here. Current raw import does not retain this candidate."),
  pending("HSD17B13", "HSD17B13 · rs72613567 insertion", ["liver"], { kind: "insertion", rsid: "rs72613567", placement: null }, "Validated insertion representation and assay-specific typing; not a two-letter SNP call."),
  pending("ACE", "ACE I/D", ["exercise"], { kind: "deletion", designation: "I/D" }, "Validated insertion/deletion assay; no imputation from an ordinary tag SNP."),
  pending("GSTM1", "GSTM1 deletion / copy number", ["exposure"], { kind: "copy-number", designation: "deletion/CNV" }, "Validated deletion/copy-number assay; an absent SNP is not evidence of a deletion."),
  pending("GSTT1", "GSTT1 deletion / copy number", ["exposure"], { kind: "copy-number", designation: "deletion/CNV" }, "Validated deletion/copy-number assay; an absent SNP is not evidence of a deletion."),
  pending("UGT1A1", "UGT1A1 *28 repeat", ["pgx"], { kind: "repeat", designation: "*28" }, "Validated repeat/allele typing and separately approved clinical interpretation; no medication dose advice.", "sensitive"),
  pending("NAT2", "NAT2 acetylator haplotype", ["exposure", "pgx"], { kind: "haplotype", designation: "acetylator haplotype" }, "Validated phase-aware multi-variant typing; single rsIDs do not establish an acetylator phenotype.", "sensitive"),
  pending("HLA-DQ", "HLA-DQ typing", ["gut", "immune"], { kind: "hla-typing", designation: "HLA-DQ" }, "Validated HLA typing and appropriate resolution; a tag SNP cannot establish a diagnosis.", "sensitive"),
  pending("LPA", "LPA KIV-2 structural repeat", ["lipids", "lpa"], { kind: "structural-repeat", designation: "KIV-2" }, "Validated structural-repeat assay; an absent LPA tag does not mean normal measured Lp(a).", "sensitive"),
];
const geneTopics: Array<[string, GeneticsDomain[]]> = [
  ["MBOAT7", ["liver"]], ["MTARC1", ["liver"]], ["GPAM", ["liver"]],
  ["SORT1", ["lipids"]], ["CETP", ["lipids"]], ["APOA5", ["lipids"]],
  ["SLC30A8", ["glucose"]], ["PPARG", ["glucose"]], ["KCNJ11", ["glucose"]],
  ["FADS2", ["pufa"]], ["ELOVL2", ["pufa"]], ["GC", ["vitamin-d"]],
  ["DHCR7", ["vitamin-d"]], ["ACTN3", ["exercise"]], ["AMPD1", ["exercise"]],
];
const bibliographySchema=z.object({version:z.literal("genetics-bibliography-2026-11-05.1"),sourceCheck:z.string().min(1),publications:z.array(z.object({pmid:z.string().regex(/^\d{6,9}$/),title:z.string().min(1).max(350),scope:z.string().min(1).max(350),checkedOn:z.literal("2026-11-05"),review:z.literal("pending")}).strict()).min(1).max(250),candidates:z.array(z.object({rsid:z.string().regex(/^rs\d+$/),gene:z.string().min(1).max(40),label:z.string().min(1).max(100),domains:z.array(z.enum(geneticsDomains.map(d=>d.id)as[GeneticsDomain,...GeneticsDomain[]])).min(1).max(4),pmids:z.array(z.string().regex(/^\d{6,9}$/)).min(1).max(4)}).strict()).min(1).max(250)}).strict();
const checkedBibliography=bibliographySchema.parse(bibliography);
const publicationMap=new Map(checkedBibliography.publications.map(p=>[p.pmid,p]));
if(publicationMap.size!==checkedBibliography.publications.length||new Set(checkedBibliography.candidates.map(c=>c.rsid)).size!==checkedBibliography.candidates.length)throw Error("Duplicate genetics bibliography identity");
const sourceCandidates:GeneticsCandidate[]=checkedBibliography.candidates.map(c=>({
 id:`snv:${c.rsid}`,gene:c.gene,label:`${c.label} · ${c.rsid}`,domains:c.domains,identity:{kind:"snv",rsid:c.rsid,placement:null},content:{status:"review-pending"},sensitivity:"genetic",requirementSource:"bibliographic-source-2026-11-05",
 assayRequirement:"Bibliographic candidate only. Reference build, alleles, strand, source assay and evidence interpretation are not curated here. The current raw importer does not retain this candidate. No personal rule is enabled.",
 bibliography:c.pmids.map(pmid=>{const source=publicationMap.get(pmid);if(!source)throw Error("Unknown genetics bibliography reference");return source;}),
}));
export const geneticsCatalogue: readonly GeneticsCandidate[] = [
  ...existing, ...namedCandidates,
  ...geneTopics.map(([gene, domains]) => pending(gene, `${gene} · gene research topic`, domains, { kind: "gene" }, "Gene-only topic: no specific variant, allele or measured result is registered for this topic. Separate sourced variant entries may exist; no result is implied. Evidence review pending.")),
  ...sourceCandidates,
];
export function searchGeneticsCatalogue(query: string, domain: GeneticsDomain | "all" = "all") {
  const normalized = query.trim().toLowerCase();
  return geneticsCatalogue.filter(c => (domain === "all" || c.domains.includes(domain)) && `${c.label} ${c.gene} ${c.identity.kind}`.toLowerCase().includes(normalized));
}
export function geneticsCatalogueCounts(explanations: GenotypeExplanation[]) {
  // Only active source projections count; catalogue presence never means assayed.
  const saved = new Map(explanations.map(e => [e.rsid, e]));
  const candidates = geneticsCatalogue.filter(c => c.identity.kind !== "gene");
  return {
    candidates: candidates.length, geneTopics: geneticsCatalogue.length - candidates.length,
    existingExplanations: existing.length,
    pendingCandidates: candidates.filter(c => c.content.status === "review-pending").length,
    savedCalls: saved.size,
    matchedExplanations: Array.from(saved.values()).filter(e => e.status === "matched").length,
    independentlyReviewedNewCandidates: 0, newPersonalActionRules: 0,
    targetMinimum: 150, targetMaximum: 250, shortfall: Math.max(0, 150 - candidates.length),
  };
}

/** Display the active source projection, including rsIDs outside the research
 * catalogue. Gene-only topics never establish an assayed variant. Conflicting
 * supplied calls remain visible rather than choosing one by array order. */
export function recordedGeneticsCatalogue(explanations:GenotypeExplanation[],query='',domain:GeneticsDomain|'all'='all'){
 const grouped=new Map<string,GenotypeExplanation[]>();
 for(const explanation of explanations){const group=grouped.get(explanation.rsid)??[];if(!group.some(e=>e.genotype===explanation.genotype&&e.sourceCall?.original===explanation.sourceCall?.original&&e.submittedGene===explanation.submittedGene))group.push(explanation);grouped.set(explanation.rsid,group);}
 const normalized=query.trim().toLowerCase();
 return Array.from(grouped).flatMap(([rsid,calls])=>{
  const candidate=geneticsCatalogue.find(c=>'rsid'in c.identity&&c.identity.rsid===rsid)??null;
  if(domain!=='all'&&!candidate?.domains.includes(domain))return[];
  if(!`${rsid} ${candidate?.label??''} ${calls.map(e=>`${e.gene} ${e.submittedGene} ${e.topic??''} ${e.genotype} ${e.sourceCall?.original??''}`).join(' ')}`.toLowerCase().includes(normalized))return[];
  return[{rsid,candidate,calls,hasReadableCall:calls.some(e=>/^[ACGT]{2}$/.test(e.genotype)),conflicting:new Set(calls.filter(e=>/^[ACGT]{2}$/.test(e.genotype)).map(e=>e.genotype)).size>1}];
 });
}
