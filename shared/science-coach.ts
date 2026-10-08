import { z } from "zod";

export const EVIDENCE_VERSION = "2026-10-08.1";
export const goalIds = [
  "butyrate",
  "diversity",
  "athletic",
  "longevity",
] as const;
export type GoalId = (typeof goalIds)[number];
export const exclusionIds = [
  "dairy",
  "gluten",
  "legumes",
  "alliums",
  "fermented",
] as const;
export type ExclusionId = (typeof exclusionIds)[number];
export const coachRequestSchema = z
  .object({
    goals: z
      .array(z.enum(goalIds))
      .min(1)
      .max(4)
      .transform((values) => Array.from(new Set(values))),
    exclusions: z.array(z.enum(exclusionIds)).max(5).default([]),
    sensitiveGut: z.boolean().default(false),
    aiConsent: z.boolean().default(false),
    preferences: z.string().trim().max(600).default(""),
  })
  .strict();
export type CoachRequest = z.infer<typeof coachRequestSchema>;

export interface EvidenceSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  url: string;
  doi: string;
  design: string;
  finding: string;
  limitation: string;
}
export const evidenceSources: EvidenceSource[] = [
  {
    id: "fiber-2024",
    title:
      "Investigating the response of the butyrate production potential to major fibers in dietary intervention studies",
    authors: "Van-Wehle & Vital",
    year: 2024,
    doi: "10.1038/s41522-024-00533-5",
    url: "https://www.nature.com/articles/s41522-024-00533-5",
    design: "Pooled reanalysis of 14 human fiber intervention datasets",
    finding:
      "Inulin-type fructans increased inferred butyrate-production potential; resistant starch showed a weaker trend. Responses depended on the starting community.",
    limitation:
      "Inferred pathways are not measured butyrate flux. Different fibers and studies were pooled; the findings do not establish exact effects of whole-food servings.",
  },
  {
    id: "resistant-starch-2012",
    title:
      "Ruminococcus bromii is a keystone species for the degradation of resistant starch in the human colon",
    authors: "Ze et al.",
    year: 2012,
    doi: "10.1038/ismej.2012.4",
    url: "https://www.nature.com/articles/ismej20124",
    design: "Human-derived bacterial cultures and community experiments",
    finding:
      "R. bromii can unlock resistant starch for other community members through cross-feeding.",
    limitation:
      "Mechanistic experiments do not establish a clinical benefit or a reliable way to acquire a missing organism by eating a particular food.",
  },
  {
    id: "fermented-2021",
    title: "Gut-microbiota-targeted diets modulate human immune status",
    authors: "Wastyk et al.",
    year: 2021,
    doi: "10.1016/j.cell.2021.06.019",
    url: "https://pubmed.ncbi.nlm.nih.gov/34256014/",
    design:
      "17-week randomized prospective study; 18 participants per diet arm",
    finding:
      "The fermented-food arm increased microbial diversity and reduced several inflammatory markers. The high-fiber arm had heterogeneous immune responses.",
    limitation:
      "Small study of generally healthy adults. Benefits were not attributed to a single strain, and eating a fermented food does not guarantee durable colonization.",
  },
  {
    id: "athletes-2019",
    title:
      "Meta-omics analysis of elite athletes identifies a performance-enhancing microbe that functions via lactate metabolism",
    authors: "Scheiman et al.",
    year: 2019,
    doi: "10.1038/s41591-019-0485-4",
    url: "https://pubmed.ncbi.nlm.nih.gov/31235964/",
    design: "Human athlete observations plus mechanistic mouse experiments",
    finding:
      "Veillonella-associated lactate-to-propionate pathways were enriched after exercise; V. atypica improved running performance in mice.",
    limitation:
      "This is not proof that feeding or supplementing Veillonella improves performance in humans. Exercise-derived lactate is not a dietary substrate prescription.",
  },
  {
    id: "centenarians-2021",
    title:
      "Novel bile acid biosynthetic pathways are enriched in the microbiome of centenarians",
    authors: "Sato et al.",
    year: 2021,
    doi: "10.1038/s41586-021-03832-5",
    url: "https://pubmed.ncbi.nlm.nih.gov/34325466/",
    design: "Japanese centenarian cohort plus bacterial culture experiments",
    finding:
      "Centenarian microbiomes were enriched for specific secondary bile-acid pathways; some Odoribacteraceae isolates produced isoalloLCA.",
    limitation:
      "Association with exceptional age does not establish causation. No diet shown here makes a person live longer or reproduces that cohort microbiome.",
  },
];

export interface BiologicalPathway {
  id: string;
  molecules: string[];
  microbialFunction: string;
  organisms: string[];
  substrate: string;
  relationship: string;
  sourceIds: string[];
  evidence: string;
}
export const pathways: BiologicalPathway[] = [
  {
    id: "starch-butyrate",
    molecules: ["Butyrate", "Acetate (cross-feeding co-substrate)"],
    microbialFunction:
      "Resistant-starch degradation → fermentation → butyrate pathways",
    organisms: [
      "Ruminococcus bromii (primary degrader)",
      "Agathobacter spp. (butyrate producers)",
      "Other community-specific butyrate producers",
    ],
    substrate: "Resistant starch reaching the colon",
    relationship:
      "A degrader can release substrates used by other organisms. Feeding this network may support butyrate production; it does not prove a named bacterium is low or guarantee its increase.",
    sourceIds: ["fiber-2024", "resistant-starch-2012"],
    evidence:
      "Human intervention reanalysis + mechanistic evidence; variable response",
  },
  {
    id: "fructan-butyrate",
    molecules: ["Acetate", "Lactate", "Butyrate"],
    microbialFunction: "Fructan fermentation with community cross-feeding",
    organisms: [
      "Bifidobacterium spp. (acetate/lactate contributors)",
      "Anaerostipes spp.",
      "Faecalibacterium spp.",
    ],
    substrate: "Inulin-type fructans",
    relationship:
      "Some fructans support bifidobacteria and butyrate-associated taxa. The response varies with species, strain, starting community, and substrate; Bifidobacterium is not being presented as a direct butyrate producer.",
    sourceIds: ["fiber-2024"],
    evidence:
      "Human intervention reanalysis; pathway potential rather than measured production",
  },
  {
    id: "fermented-diversity",
    molecules: ["No single causal metabolite established"],
    microbialFunction:
      "Community response to a varied fermented-food dietary pattern",
    organisms: ["No single organism established as the causal target"],
    substrate:
      "A mixture of fermented foods, rather than a selective fuel for one species",
    relationship:
      "The human study supports a dietary pattern and community outcome. It does not establish that every yogurt contains Bifidobacterium or that food microbes permanently colonize the gut.",
    sourceIds: ["fermented-2021"],
    evidence: "Small human randomized study; mixed-food intervention",
  },
  {
    id: "athlete-lactate",
    molecules: ["Propionate"],
    microbialFunction: "Lactate-to-propionate fermentation",
    organisms: ["Veillonella atypica and related Veillonella"],
    substrate: "Exercise-associated lactate (research mechanism)",
    relationship:
      "An athlete-associated functional signal with mouse causal experiments. No validated food prescription to recreate it or improve human performance is available in this evidence set.",
    sourceIds: ["athletes-2019"],
    evidence:
      "Human association + mouse experiments; no supported dietary action",
  },
  {
    id: "longevity-bile",
    molecules: ["isoalloLCA and other specific secondary bile acids"],
    microbialFunction: "Specific bile-acid transformations",
    organisms: ["Some Odoribacteraceae isolates"],
    substrate: "Host-derived bile-acid intermediates",
    relationship:
      "These pathways were found in a particular centenarian cohort. There is no established food-to-pathway-to-lifespan intervention here. More total secondary bile acids is not a goal.",
    sourceIds: ["centenarians-2021"],
    evidence:
      "Human association + culture experiments; no supported dietary action",
  },
];

export const goals: Array<{
  id: GoalId;
  label: string;
  description: string;
  pathwayIds: string[];
  boundary: string;
}> = [
  {
    id: "butyrate",
    label: "Support butyrate production",
    description: "Explore substrates and cross-feeding networks.",
    pathwayIds: ["starch-butyrate", "fructan-butyrate"],
    boundary:
      "Food choices can support production potential. This app does not estimate your butyrate concentration or identify missing organisms from meals.",
  },
  {
    id: "diversity",
    label: "Support microbial diversity",
    description: "Explore a human-tested fermented-food pattern.",
    pathwayIds: ["fermented-diversity"],
    boundary:
      "Diversity is context-dependent, not a universal health score. A small trial does not predict your individual response.",
  },
  {
    id: "athletic",
    label: "Athlete-inspired research",
    description: "Understand athlete-associated microbial functions.",
    pathwayIds: ["athlete-lactate"],
    boundary:
      "There is no single athlete microbiome. Training, diet, sport, geography, and test methods confound comparisons. No human performance claim or Veillonella supplement is recommended.",
  },
  {
    id: "longevity",
    label: "Healthy-ageing research",
    description: "Understand centenarian-associated pathways.",
    pathwayIds: ["longevity-bile"],
    boundary:
      "Association is not a longevity intervention. This app does not prescribe bile-acid manipulation or promise to reproduce a centenarian microbiome.",
  },
];

export interface FoodAction {
  id: string;
  title: string;
  pathwayId: string;
  goals: GoalId[];
  excludedBy: ExclusionId[];
  sensitiveGut: boolean;
  practicalStep: string;
  scientificBasis: string;
  translationLimit: string;
  sourceIds: string[];
  evidenceType: "human-intervention" | "mechanistic-translation";
  monitoring: string;
  keywords: string[];
}
export const foodActions: FoodAction[] = [
  {
    id: "starch-potato",
    title: "Try a modest potato-based meal",
    pathwayId: "starch-butyrate",
    goals: ["butyrate"],
    excludedBy: [],
    sensitiveGut: false,
    practicalStep:
      "If potatoes suit you, try a small side of cooked potato that was cooled safely in the refrigerator. This is a food experiment, not a therapeutic resistant-starch dose.",
    scientificBasis:
      "Resistant-starch utilization can depend on primary degraders and downstream butyrate producers.",
    translationLimit:
      "Resistant-starch content varies by variety, cooking, storage, and reheating. A food serving is not equivalent to the purified starch used in a study. Refrigerate promptly and follow local food-safety guidance.",
    sourceIds: ["fiber-2024", "resistant-starch-2012"],
    evidenceType: "mechanistic-translation",
    monitoring:
      "Change one food at a time; note the serving, preparation, bloating, stool pattern, and comfort. Symptoms do not measure butyrate.",
    keywords: ["potato", "potatoes"],
  },
  {
    id: "fructan-alliums",
    title: "Explore tolerated onion or garlic",
    pathwayId: "fructan-butyrate",
    goals: ["butyrate"],
    excludedBy: ["alliums"],
    sensitiveGut: true,
    practicalStep:
      "If you already tolerate alliums, include a small amount of onion or garlic in a familiar meal. Increase gradually rather than starting a concentrated inulin supplement.",
    scientificBasis:
      "Human fructan interventions support some bifidobacterial and butyrate-pathway responses.",
    translationLimit:
      "This whole-food suggestion is an extrapolation from fiber studies, not a validated dose. Fructans can worsen symptoms in sensitive people. No grams of inulin are inferred from cloves or onion portions.",
    sourceIds: ["fiber-2024"],
    evidenceType: "mechanistic-translation",
    monitoring:
      "Reduce or pause the change if discomfort increases. A low-FODMAP reintroduction is best individualized with a dietitian.",
    keywords: ["onion", "onions", "garlic"],
  },
  {
    id: "fermented-yogurt",
    title: "Add a fermented dairy option",
    pathwayId: "fermented-diversity",
    goals: ["diversity"],
    excludedBy: ["dairy", "fermented"],
    sensitiveGut: false,
    practicalStep:
      "If dairy suits you, try a small serving of plain yogurt or kefir as one option in a varied fermented-food pattern.",
    scientificBasis:
      "Yogurt and kefir were among foods used in a small human fermented-food intervention.",
    translationLimit:
      "The study tested a combination of foods, not this serving alone. Products and cultures differ; this does not guarantee specific strains or a permanent microbiome change.",
    sourceIds: ["fermented-2021"],
    evidenceType: "human-intervention",
    monitoring:
      "Check ingredients and lactose tolerance; record whether the food is comfortable and practical to keep eating.",
    keywords: ["yogurt", "yoghurt", "kefir"],
  },
  {
    id: "fermented-vegetables",
    title: "Try a fermented vegetable option",
    pathwayId: "fermented-diversity",
    goals: ["diversity"],
    excludedBy: ["fermented", "alliums"],
    sensitiveGut: true,
    practicalStep:
      "If tolerated, try a small amount of fermented cabbage such as sauerkraut alongside a meal. Choose a product that fits your ingredient restrictions.",
    scientificBasis:
      "Fermented vegetables were part of the human fermented-food dietary pattern.",
    translationLimit:
      "The mixture of foods was studied; this does not establish a sauerkraut-specific effect or the dose needed. Added garlic, sodium, and other ingredients vary by product.",
    sourceIds: ["fermented-2021"],
    evidenceType: "human-intervention",
    monitoring:
      "Start small. Check product ingredients, salt content, and tolerance; stop if symptoms worsen.",
    keywords: ["sauerkraut", "kimchi"],
  },
];

export interface PlanAction extends FoodAction {
  alreadyMentioned: boolean;
  personalization: string;
}
export interface SciencePlan {
  evidenceVersion: string;
  generatedAt: string;
  mode: "evidence-rules" | "ai-ranked";
  aiStatus: string;
  goals: typeof goals;
  pathways: BiologicalPathway[];
  actions: PlanAction[];
  sources: EvidenceSource[];
  exclusionsApplied: ExclusionId[];
  sensitiveGut: boolean;
  withheldActions: number;
  baseline: { loggedMeals: number; windowDays: number; note: string };
  cohortStatus: string;
  measurementStatus: string;
  nextSteps: string[];
}

export function buildSciencePlan(
  request: CoachRequest,
  mealDescriptions: string[] = [],
  now = new Date(),
): SciencePlan {
  const selectedGoals = goals.filter((goal) => request.goals.includes(goal.id));
  const selectedPathways = pathways.filter((path) =>
    selectedGoals.some((goal) => goal.pathwayIds.includes(path.id)),
  );
  const candidates = foodActions.filter((action) =>
    action.goals.some((goal) => request.goals.includes(goal)),
  );
  const eligible = candidates.filter(
    (action) =>
      !action.excludedBy.some((group) => request.exclusions.includes(group)) &&
      !(request.sensitiveGut && action.sensitiveGut),
  );
  const actions = eligible
    .map((action) => {
      const alreadyMentioned = mealDescriptions.some((description) =>
        action.keywords.some((keyword) =>
          new RegExp(`\\b${keyword}\\b`, "i").test(description),
        ),
      );
      return {
        ...action,
        alreadyMentioned,
        personalization: alreadyMentioned
          ? "This food appears in your recent journal. Consider preparation and tolerance before adding more."
          : "This food was not mentioned in the recent entries reviewed; that does not prove you never eat it.",
      };
    })
    .sort((a, b) => Number(a.alreadyMentioned) - Number(b.alreadyMentioned));
  const sourceIds = new Set([
    ...selectedPathways.flatMap((path) => path.sourceIds),
    ...actions.flatMap((action) => action.sourceIds),
  ]);
  return {
    evidenceVersion: EVIDENCE_VERSION,
    generatedAt: now.toISOString(),
    mode: "evidence-rules",
    aiStatus:
      "Curated evidence plan. AI ranking is optional and is not active for this plan.",
    goals: selectedGoals,
    pathways: selectedPathways,
    actions,
    sources: evidenceSources.filter((source) => sourceIds.has(source.id)),
    exclusionsApplied: request.exclusions,
    sensitiveGut: request.sensitiveGut,
    withheldActions: candidates.length - eligible.length,
    baseline: {
      loggedMeals: mealDescriptions.length,
      windowDays: 14,
      note: "Recent meal text informs food familiarity only. Missing entries are not zero intake, and meals do not measure bacteria.",
    },
    cohortStatus:
      "Research themes only. No cohort dataset, matched reference population, or microbiome similarity score is available.",
    measurementStatus:
      "No validated microbial-function or metabolite measurement is connected to this coach. Species presence alone would not establish strain functions or metabolite production.",
    nextSteps: [
      "Choose one feasible dietary change, record its amount and preparation, and observe tolerance before adding another.",
      "Track adherence and comfort over 2–4 weeks. This is a practical review window, not a promise of biological change.",
      "To evaluate the target function, use appropriate laboratory measurements and expert interpretation; stool SCFA alone is not a direct measure of production or absorption.",
    ],
  };
}

export function applyAIRanking(plan: SciencePlan, ids: string[]): SciencePlan {
  // The model can reorder approved actions only. It cannot add advice, rewrite evidence,
  // invent citations, remove restrictions, or promote cohort mechanisms to treatments.
  const valid = new Set(plan.actions.map((action) => action.id));
  if (
    ids.length !== valid.size ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !valid.has(id))
  ) {
    throw new Error(
      "AI output does not exactly match the eligible evidence-backed actions",
    );
  }
  return {
    ...plan,
    mode: "ai-ranked",
    aiStatus:
      "AI prioritized the eligible food actions using your goals and preferences. Biological explanations, limitations, and citations come from the curated evidence set.",
    actions: ids.map((id) => plan.actions.find((action) => action.id === id)!),
  };
}
