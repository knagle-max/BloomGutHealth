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
export const organismExplanations: Organism[] = [
  {
    names: ["faecalibacterium prausnitzii"],
    label: "Often helpful",
    meaning:
      "A gut resident that can turn nutrients from the microbial food web into butyrate, a fuel used by cells lining the colon.",
    why: "Often studied alongside gut-barrier and inflammation-related health. Association does not prove that adding this bacterium treats a condition.",
    takeaway:
      "A varied, fiber-containing diet can support fermentation generally. This record does not tell us your butyrate output or a required bacterial amount.",
    sources: [
      pub(
        "24021287",
        "Human observational study of butyrate-producing bacteria",
      ),
    ],
  },
  {
    names: ["akkermansia muciniphila"],
    label: "Context matters",
    meaning:
      "Lives near the gut’s mucus lining and uses components of that mucus as food. Mucus use is part of its normal biology, not automatic evidence of damage.",
    why: "Specific preparations have been studied for metabolic health, including a small human trial. Effects depend on the preparation and person.",
    takeaway:
      "More is not always better, and detection does not establish a need for an Akkermansia supplement.",
    sources: [pub("31263284", "Small human Akkermansia trial")],
  },
  {
    names: ["anaerobutyricum hallii", "eubacterium hallii"],
    label: "Often helpful",
    meaning:
      "Can use lactate and acetate made by other microbes to produce butyrate. Think of it as reusing the products of neighboring bacteria.",
    why: "This sharing of nutrients can support the community’s fermentation network. A species name alone cannot measure how active that network is.",
    takeaway:
      "Use food diversity and tolerance as practical guides; no individual dose or guaranteed meal response follows from its name.",
    sources: [
      pub("15466518", "Laboratory study of lactate-to-butyrate cross-feeding"),
    ],
  },
  {
    names: ["roseburia hominis"],
    label: "Often helpful",
    meaning:
      "A gut bacterium known for making butyrate, which helps fuel the colon’s lining.",
    why: "Lower levels have been observed in some gut-disease studies, but this does not make absence a diagnosis or prove that more is always better.",
    takeaway:
      "Support a varied diet with tolerated fiber rather than trying to reach an invented Roseburia percentage.",
    sources: [pub("24021287", "Human study of Roseburia and Faecalibacterium")],
  },
  {
    names: ["christensenella minuta"],
    label: "Promising; still being studied",
    meaning:
      "A gut resident that produces fermentation products including acetate. Researchers are studying how particular strains interact with gut and metabolic health.",
    why: "Some findings come from laboratory and animal experiments, so they cannot be assumed to predict your response.",
    takeaway:
      "There is no validated personal target or food prescription for raising this organism from this record.",
    sources: [pub("34075098", "Laboratory and animal Christensenella study")],
  },
  {
    names: ["coprococcus comes"],
    label: "Often helpful",
    meaning:
      "A carbohydrate-fermenting gut bacterium that can produce butyrate and other fermentation products.",
    why: "Its activity depends on available food and neighboring microbes. Detecting its name does not measure those products.",
    takeaway:
      "Fiber-containing foods may support fermentation broadly; no specific mood, energy or health benefit can be predicted from this record.",
    sources: [
      {
        title: "Experimental study of microbial fermentation pathways",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4030238/",
      },
    ],
  },
  {
    names: ["dysosmobacter welbionis"],
    label: "Promising; still being studied",
    meaning: "A recently studied gut bacterium that can make butyrate.",
    why: "Research includes human associations and mouse experiments involving metabolic health. Those findings do not establish a treatment effect in you.",
    takeaway:
      "Do not use its presence or absence as a reason to buy an experimental supplement or assume improved liver health.",
    sources: [
      pub(
        "34108237",
        "Dysosmobacter laboratory, human-association and mouse study",
      ),
    ],
  },
  {
    names: ["bifidobacterium pseudocatenulatum"],
    label: "Often helpful",
    meaning:
      "Uses certain carbohydrates and can produce acetate and lactate. Other microbes can use these products in the gut food web.",
    why: "Members of this species vary in the carbohydrates they use and their effects; benefits cannot be assigned to every strain.",
    takeaway:
      "Choose tolerated fiber-containing foods. A low or missing qualitative entry is not a deficiency or an automatic probiotic indication.",
    sources: [
      pub(
        "10612749",
        "Experimental study of bifidobacterial carbohydrate fermentation",
      ),
    ],
  },
  {
    names: ["clostridium perfringens"],
    label: "Can cause illness",
    meaning:
      "Some strains produce toxins and can cause food poisoning or other infections. Finding a species name does not show whether a toxin-producing strain is present.",
    why: "The original test method, toxin testing and symptoms matter. An unverified reconstruction is not an infection diagnosis.",
    takeaway:
      "Verify the original result with the reporting laboratory or clinician if it is a concern; do not try to eradicate it through a diet or supplement plan.",
    sources: [
      {
        title: "CDC: About C. perfringens",
        url: "https://www.cdc.gov/clostridium-perfringens/about/",
      },
    ],
  },
  {
    names: ["ruminococcus gnavus", "mediterraneibacter gnavus"],
    label: "Context matters",
    meaning:
      "A common gut resident that can use sugars from mucus and other sources. Strains differ in how they interact with the immune system.",
    why: "Some strains or increases have been linked with inflammation in research. Its presence by itself does not diagnose inflammatory bowel disease.",
    takeaway:
      "No validated “eliminate this bacterium” diet follows from a listed name. Symptoms and clinical findings are more useful for care decisions.",
    sources: [
      pub("31182571", "Study of an inflammatory microbial polysaccharide"),
      pub("33972416", "Study of strain differences and immune responses"),
    ],
  },
  {
    names: ["streptococcus pyogenes"],
    label: "Can cause illness",
    meaning:
      "Also called group A strep, this bacterium is known for infections such as strep throat and skin infections.",
    why: "A reconstructed microbiome entry is not enough to establish infection, its location or a need for treatment.",
    takeaway:
      "Check an unexpected result against the original laboratory report and clinical context. Do not treat this as a diet-optimization target.",
    sources: [
      {
        title: "CDC: Group A strep",
        url: "https://www.cdc.gov/group-a-strep/about/index.html",
      },
    ],
  },
  {
    names: ["clostridium scindens"],
    label: "Context matters",
    meaning:
      "Changes some primary bile acids into secondary bile acids. Bile acids help with fat digestion and also affect other gut microbes.",
    why: "This activity can help resist some infections in research, while bile-acid effects vary by molecule and context.",
    takeaway:
      "There is no simple “raise it” or “lower it” recommendation without actual bile-acid measurements and the clinical picture.",
    sources: [
      pub(
        "25337874",
        "Experimental study of bile acids and colonization resistance",
      ),
    ],
  },
  {
    names: ["sutterella"],
    label: "Context matters",
    meaning:
      "A group of bacteria found in human guts. Researchers study how different species interact with the gut lining and immune defenses.",
    why: "Some species can have unfavorable effects in particular experimental settings, yet they can also be present without disease.",
    takeaway:
      "An “elevated” label without quantities or a validated reference range does not prove harm or identify a diet treatment.",
    sources: [pub("42324633", "Study of Sutterella and gut immune signaling")],
  },
  {
    names: ["alistipes"],
    label: "Context matters",
    meaning:
      "A group of gut bacteria whose species can interact differently with metabolism and immune activity.",
    why: "Findings vary by species and setting; some experimental strains have shown anti-inflammatory effects. The genus cannot be labelled uniformly good or bad.",
    takeaway:
      "A genus-level entry does not support a specific food restriction or a target percentage.",
    sources: [
      pub("40497338", "Experimental Alistipes strain study"),
      pub("36804134", "Mouse study of a specific Alistipes strain"),
    ],
  },
  {
    names: ["bacteroides vulgatus", "phocaeicola vulgatus"],
    label: "Context matters",
    meaning:
      "A common gut resident with enzymes that help process certain carbohydrates.",
    why: "Its interactions can be helpful or unfavorable depending on strain and surroundings. Some research concerns its interaction with other microbes or inflammation.",
    takeaway:
      "“Reported elevated” does not establish a harmful amount, especially when no numeric abundance or reference interval is available.",
    sources: [
      pub("17579514", "Study of gut Bacteroides genomes"),
      pub("31925306", "Experimental study of microbial carbohydrate sharing"),
    ],
  },
  {
    names: ["lactobacillus reuteri", "limosilactobacillus reuteri"],
    label: "Some strains can be helpful",
    meaning:
      "A lactic-acid-producing bacterium. Particular strains are used in probiotic research and products.",
    why: "A benefit studied for one strain, age group or condition does not apply automatically to every L. reuteri product.",
    takeaway:
      "“Not detected” does not mean you need a probiotic. Product strain, reason for use and personal safety matter.",
    sources: [
      {
        title: "NIH: A specific L. reuteri strain trial",
        url: "https://www.nccih.nih.gov/research/research-results/investigating-the-safety-of-the-probiotic-lactobacillus-reuteri-in-infants-with-colic",
      },
      probiotic,
    ],
  },
  {
    names: ["bifidobacterium group", "bifidobacterium spp", "bifidobacterium"],
    label: "Often helpful; species vary",
    meaning:
      "A broad group of carbohydrate-using gut bacteria. Many make acetate and lactate that participate in the gut’s microbial food web.",
    why: "Species and strains have different functions. A group-level label cannot identify a particular probiotic effect.",
    takeaway:
      "A qualitative “low” label is not a measured deficiency. Tolerated plant variety is a more practical starting point than chasing a bacterial target.",
    sources: [
      pub("9430608", "Experimental study of bifidobacterial fermentation"),
      probiotic,
    ],
  },
  {
    names: [
      "eptesicus fuscus gammaherpesvirus",
      "eptesicus fuscus herpesvirus",
    ],
    label: "Unconfirmed; not an established human gut marker",
    meaning:
      "This name refers to a virus studied in big brown bats, not a beneficial human gut bacterium.",
    why: "An unexpected reconstructed or sequencing annotation does not establish infection or disease in a person.",
    takeaway:
      "Confirm the original report and the laboratory’s identification method. Bloom cannot assign a human diet or treatment meaning to this record.",
    sources: [
      pub("29407381", "Original bat-virus isolation study"),
      pub("38619093", "Bat-virus tissue study"),
    ],
  },
  {
    names: ["bacteroides fragilis"],
    label: "Context matters",
    meaning:
      "Some strains normally live in the gut; other strains carry toxin-related functions and can cause problems in specific settings.",
    why: "A species-level name cannot distinguish these strains or establish infection.",
    takeaway:
      "Protein or fiber intake cannot tell Bloom whether this organism is present or beneficial in you.",
    sources: [
      pub("29398651", "Experimental study of toxin-producing B. fragilis"),
    ],
  },
];
const normalized = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function explainOrganism(name: string): ReportExplanation {
  const key = normalized(name);
  const match = organismExplanations.find((o) =>
    o.names.some(
      (n) => key === normalized(n) || key.startsWith(normalized(n) + " "),
    ),
  );
  return (
    match || {
      label: "Not reviewed",
      meaning:
        "Bloom does not yet have a reviewed plain-language description for this organism.",
      why: "The name alone is not enough to classify it as beneficial or harmful. Species, strain, method and clinical context can change the meaning.",
      takeaway:
        "Keep the original report and ask the testing provider for its identification and interpretation. No diet or supplement action is inferred.",
      sources: [
        {
          title: "Search this organism in PubMed",
          url:
            "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(name),
        },
      ],
    }
  );
}
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
  if (/not detected|not listed/i.test(status || ""))
    return "Not detected or not listed does not prove complete absence; it depends on the sample, method and reporting threshold.";
  if (!hasAmount && /high|low|elevated|reduced/i.test(status || ""))
    return "This is a qualitative source label. Without a numeric amount and an appropriate reference, Bloom cannot quantify an excess or shortage.";
  return "This preserves what the source says. A listed or detected name does not establish its amount, current activity or an effect on your health.";
}
