import {organismBiography,organismBiographies} from './biology-content';
export type ReportExplanation = {
  label: string;
  meaning: string;
  why: string;
  takeaway: string;
  sources: { title: string; url: string }[];
};
const pub = (id: string, title = "Research study") => ({
  title,
  url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
});
const vendor = {
  title: "How Viome describes its scores",
  url: "https://www.viome.com/blog/you-decoded-guide-viomes-health-intelligence-test-scores",
};
const gas = {
  title: "NIDDK: Gas and digestion",
  url: "https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/symptoms-causes",
};
const stones = {
  title: "NIDDK: Kidney stones and diet",
  url: "https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/eating-diet-nutrition",
};
const probiotic = {
  title: "NIH: Probiotics and their limits",
  url: "https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety",
};
type Organism = ReportExplanation & { names: string[] };
const biographyExplanation=(biography:NonNullable<ReturnType<typeof organismBiography>>):ReportExplanation=>({label:biography.coverageStatus==='unresolved_identity'?'Identity unresolved':'Biology context',meaning:biography.firstLayer.meetThisOrganism,why:biography.firstLayer.whyResearchersStudyIt,takeaway:biography.firstLayer.foodMetabolicConnections,sources:biography.citations});
/** Compatibility projection, never a second authored scientific registry. */
export const organismExplanations:Organism[]=organismBiographies.map(biography=>({...biographyExplanation(biography),names:[biography.reportedName,...(biography.aliases||[])]}));
export function explainOrganism(name:string,taxonomyLevel?:string|null):ReportExplanation{
 const biography=organismBiography(name,taxonomyLevel);
 return biography?biographyExplanation(biography):{label:'Identity unresolved',meaning:`The label “${name}” needs a resolved taxonomic identity before Bloom can describe its biology.`,why:'',takeaway:'',sources:[]};
}

const normalized=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const s = (
  label: string,
  meaning: string,
  why: string,
  takeaway: string,
  sources: ReportExplanation["sources"] = [vendor],
): ReportExplanation => ({ label, meaning, why, takeaway, sources });
export const scoreExplanations: Record<string, ReportExplanation> = {
  "digestive efficiency": s(
    "Digestion overview",
    "A combined report topic about how the gut microbial community processes food.",
    "It is not a direct measurement of how many calories or nutrients you absorb.",
    "Use symptoms, meal records and relevant clinical assessment rather than changing intake from this number alone.",
  ),
  "gas production": s(
    "Gas and fermentation",
    "Some gas is a normal result of microbes breaking down food.",
    "Bloating also depends on swallowed air, food tolerance and how gas moves through the gut.",
    "Track symptoms and increase fiber gradually as tolerated; a score alone does not diagnose an intolerance.",
    [gas],
  ),
  "gut lining health": s(
    "The gut’s protective barrier",
    "The intestinal lining helps absorb nutrients while keeping a controlled boundary with gut contents.",
    "This proprietary topic is not a direct test for a “leaky gut” diagnosis.",
    "A sustained, tolerated diet and clinical evaluation of ongoing symptoms are more useful than a single opaque score.",
  ),
  "inflammatory activity": s(
    "Microbial signals and inflammation",
    "Some microbial products can influence immune signaling.",
    "A report score is not a blood inflammatory marker and cannot diagnose gut inflammation.",
    "Interpret alongside symptoms and clinically appropriate tests; do not infer a need for detox products.",
    [pub("27133167", "Study of microbial products and immune signaling")],
  ),
  "metabolic fitness": s(
    "A broad metabolism topic",
    "This combines microbial features the provider relates to metabolism.",
    "It is not a measured glucose level, insulin-sensitivity test or liver-health diagnosis.",
    "Track measurable goals such as meal quality, strength and relevant laboratory results.",
  ),
  "microbiome induced stress": s(
    "A proprietary stress-related topic",
    "Microbes can interact with pathways related to the body’s signaling systems.",
    "This score does not measure cortisol or diagnose anxiety, depression or psychological stress.",
    "Use sleep, symptoms and appropriate health support as real-world context; do not choose a supplement solely from this score.",
  ),
  "protein fermentation": s(
    "Microbes processing leftover protein",
    "Some protein components reach gut microbes, which can turn them into several different compounds.",
    "The products depend on protein source, other food and the microbial community. Protein intake alone cannot predict them.",
    "Balance an appropriate protein goal with tolerated plant foods; do not assume protein is inherently harmful.",
    [pub("28903954", "Controlled human protein-feeding trial")],
  ),
  "ammonia production": s(
    "A product of nitrogen metabolism",
    "Microbes can release ammonia while processing nitrogen-containing compounds.",
    "A pathway score is not an ammonia measurement in stool or blood.",
    "Review protein intake in the context of your overall diet; this score does not establish excess ammonia.",
    [pub("28903954", "Human study of dietary protein and microbial products")],
  ),
  "bile acid metabolism": s(
    "Microbes modifying digestive bile acids",
    "Your body makes bile acids to help digest fats; microbes can change some into other bile acids.",
    "Different bile acids have different effects, so this is not simply a process to maximize or eliminate.",
    "No bile-acid concentration or targeted diet can be inferred from this score.",
    [pub("25337874", "Experimental bile-acid study")],
  ),
  "biofilm chemotoxicity virulence": s(
    "Microbial communities and potential harm-related functions",
    "Biofilms are communities of microbes on surfaces. Virulence refers to abilities that can contribute to illness.",
    "These broad terms are not proof of an infection or a measured toxin. “Chemotoxicity” is not specific enough here to identify a particular chemical.",
    "Check the original provider explanation; do not use this score to self-treat an infection.",
  ),
  "butyrate production": s(
    "Making a fuel for colon cells",
    "Butyrate is a fermentation product that can help fuel cells lining the colon.",
    "A pathway score does not tell us how much butyrate you make, absorb or excrete.",
    "Tolerated fiber-containing foods are a practical general approach; the score does not prescribe a butyrate supplement.",
    [pub("15466518", "Experimental study of butyrate production")],
  ),
  "flagellar assembly": s(
    "Building bacterial movement structures",
    "Flagella are tail-like structures some bacteria use to move.",
    "Movement is a normal microbial ability; a score is not a count of harmful bacteria or evidence of infection.",
    "No food restriction or antimicrobial treatment follows from this score.",
    [pub("36608151", "Experimental study of commensal bacterial flagellins")],
  ),
  "lps biosynthesis": s(
    "Building part of some bacterial outer coats",
    "LPS is a component of the outer surface of many bacteria. Different forms can interact differently with immune signaling.",
    "A score of 90 does not mean 90% toxins, and a high score cannot be read as high toxin exposure without the provider’s scoring direction.",
    "Keep the provider’s reported category separate from a measured LPS concentration. Do not infer “detox” treatment.",
    [
      pub(
        "27133167",
        "Human and experimental study of different microbial LPS forms",
      ),
    ],
  ),
  "methane production": s(
    "Microbes making methane gas",
    "Some gut microbes can convert other fermentation gases into methane.",
    "This pathway score is not a breath test or a diagnosis of intestinal methanogen overgrowth.",
    "If symptoms matter, discuss appropriate assessment rather than trying to eliminate all gas-producing microbes.",
    [pub("36114762", "Human observational methane/sulfide study"), gas],
  ),
  "oxalate metabolism": s(
    "Processing an oxalate-related compound",
    "Oxalate occurs in some foods and is also made in the body. Microbial pathways may involve its breakdown or other transformations.",
    "The pathway name alone does not establish the direction, urine oxalate level or kidney-stone risk.",
    "Do not cut out nutritious foods from this score alone; stone-specific diet advice depends on actual findings.",
    [stones],
  ),
  "putrescine production": s(
    "Making a small molecule from amino acids",
    "Putrescine is a polyamine: a small molecule made by cells and some microbes that participates in normal biological processes.",
    "Amount and location matter; its name is not proof of harmful “putrefaction” or toxic exposure.",
    "This score cannot establish an unsafe concentration or a supplement need.",
    [pub("33833232", "Experimental study of microbial polyamines")],
  ),
  "salt stress": s(
    "Microbes responding to salty surroundings",
    "This topic concerns microbial responses to their chemical environment.",
    "It is not a measurement of your dietary sodium intake or blood sodium.",
    "Use logged food labels and your chosen sodium limit to review salt intake.",
  ),
  "sulfide gas production": s(
    "Making sulfur-containing compounds",
    "Some microbes make hydrogen sulfide while processing sulfur-containing substances.",
    "Effects vary with concentration and location; this is not a measured gas level or a diagnosis.",
    "Do not remove all protein or sulfur-containing vegetables because of this score.",
    [pub("11101476", "Controlled human feeding and sulfide study")],
  ),
  "tma production": s(
    "A microbial step related to TMAO",
    "Some microbes make trimethylamine (TMA) from dietary compounds. The body can convert TMA into TMAO.",
    "This score does not measure blood TMAO or predict your personal cardiovascular risk.",
    "Keep the focus on your overall dietary pattern and measured risk factors, not eliminating an entire food group.",
    [pub("32544852", "Human high-protein/TMAO trial")],
  ),
  "uric acid metabolism": s(
    "Processing a compound related to purines",
    "Uric acid is linked with the breakdown of purines, compounds found in the body and foods.",
    "A gut pathway score is not a blood urate result and cannot diagnose gout or a uric-acid stone.",
    "Use actual clinical measurements before following a restrictive low-purine or stone-specific diet.",
    [stones],
  ),
};
export function explainScore(name: string): ReportExplanation {
  const key = normalized(name)
    .replace(/^microbial /, "")
    .replace(/ (?:pathways?|score)$/, "");
  return (
    scoreExplanations[key] ||
    s(
      "Provider-defined score",
      "Bloom does not yet have a reviewed explanation for this score name.",
      "The provider’s method and scoring direction are needed before interpreting its value.",
      "Keep the source category and ask the provider for the original definition; no food or supplement prescription is inferred.",
    )
  );
}
export function reportedStatusMeaning(
  status: string | null,
  hasAmount: boolean,
) {
  // Recognize explicit source tokens without rewriting the retained source label.
  const label=(status||"").replace(/[_-]+/g," ");
  if (/not detected|not listed/i.test(label))
    return "Not detected or not listed does not prove complete absence; it depends on the sample, method and reporting threshold.";
  if (!hasAmount && /high|low|elevated|reduced/i.test(label))
    return "This is a qualitative source label. Without a numeric amount and an appropriate reference, Bloom cannot quantify an excess or shortage.";
  return "This preserves what the source says. A listed or detected name does not establish its amount, current activity or an effect on your health.";
}
