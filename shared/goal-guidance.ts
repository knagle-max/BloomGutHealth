export const goalSources = [
  {
    id: "goal-digestive",
    title: "NIDDK: Individual diet changes and digestive symptoms",
    url: "https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition",
    type: "Public patient information (IBS)",
    limitation: "Condition-specific background, last reviewed November 2017. Choosing a comfort goal does not diagnose IBS or establish that this advice applies; special diets require individual professional review.",
  },
  {
    id: "goal-general",
    title: "Health Canada: Canada’s food guide snapshot",
    url: "https://food-guide.canada.ca/artifacts/CFG-snapshot-EN.pdf",
    type: "Public nutrition guidance",
    limitation: "General eating-pattern guidance, not an individual nutrient prescription or measured health effect.",
  },
  {
    id: "goal-healthy-fats",
    title: "Health Canada: Canada’s Dietary Guidelines — food fats",
    url: "https://food-guide.canada.ca/sites/default/files/artifact-pdf/CanadasDietaryGuidelines.pdf",
    type: "Public nutrition guidance",
    limitation: "Supports food-pattern choices; does not predict an individual laboratory change or replace clinical targets.",
  },
  {
    id: "goal-liver",
    title: "NIDDK: Eating for NAFLD / MASLD",
    url: "https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/eating-diet-nutrition",
    type: "Public clinical guidance",
    limitation:
      "Dietary patterns support care; no recipe establishes reversal.",
  },
  {
    id: "goal-protein",
    title: "Health Canada: Eat protein foods",
    url: "https://food-guide.canada.ca/en/healthy-eating-recommendations/make-it-a-habit-to-eat-vegetables-fruits-whole-grains-and-protein-foods/eat-protein-foods/",
    type: "Public nutrition guidance",
    limitation:
      "Does not establish an individual muscle-building protein dose.",
  },
  {
    id: "goal-aging",
    title: "NIA: What do we know about healthy aging?",
    url: "https://www.nia.nih.gov/health/healthy-aging/what-do-we-know-about-healthy-aging",
    type: "Public research summary",
    limitation:
      "No food or supplement is proven here to extend an individual lifespan.",
  },
];
export function goalGuidance(goal: string) {
  const g = goal.toLowerCase();
  if (/\b(nafld|nash|masld|mash)\b|fatty liver|liver health/.test(g))
    return {
      goal,
      id: "liver",
      mapping: "Liver-supporting dietary pattern",
      actions: [
        "Choose vegetables, whole grains, legumes and lean protein; replace saturated fats with unsaturated fats.",
        "Reduce sugar-sweetened drinks and large amounts of added sugar; minimize alcohol.",
        "Discuss liver assessment and gradual weight loss if appropriate with your clinician. No automatic calorie deficit or “liver detox” supplement is prescribed.",
      ],
      tracking:
        "Review weight/waist trends and clinician-directed liver and metabolic tests; meal adherence does not prove liver recovery.",
      sourceIds: ["goal-liver"],
    };
  if (/muscle|hypertrophy|strength/.test(g))
    return {
      goal,
      id: "muscle",
      mapping: "Protein distribution and resistance-training support",
      actions: [
        "Include a protein source in meals still to come today; the planner favors protein when your daily target is not met.",
        "Pair food intake with progressive resistance training and adequate recovery.",
        "Set an appropriate energy and protein target for your body size and activity. Kidney disease and other conditions can change suitable targets.",
      ],
      tracking:
        "Track strength, training, body weight and protein intake over time; food alone does not guarantee muscle gain.",
      sourceIds: ["goal-protein", "goal-aging"],
    };
  if (/longevity|healthy ag|healthspan/.test(g))
    return {
      goal,
      id: "aging",
      mapping: "Healthy-aging dietary pattern",
      actions: [
        "Favor varied vegetables, legumes, whole grains and suitable protein sources.",
        "Keep sodium and saturated fat within your chosen limits rather than chasing a longevity score.",
        "Combine diet with regular movement, strength training, sleep and preventive care. Supplements are considered only for a documented need.",
      ],
      tracking:
        "Track dietary variety, activity and clinically appropriate risk markers; Bloom cannot predict lifespan.",
      sourceIds: ["goal-aging"],
    };
  if (/cholesterol|apob|lipid|heart|glucose|glyc|metabolic/.test(g))
    return {
      goal,
      id: "metabolic",
      mapping: "Cardiometabolic dietary pattern",
      actions: [
        "Favor fiber-rich whole grains, legumes and vegetables; keep sodium and saturated fat within your selected limits.",
      ],
      tracking: "Review relevant laboratory trends with your clinician.",
      sourceIds: ["goal-general", "goal-healthy-fats"],
    };
  if (/\b(general health|overall health|healthy eating|wellbeing|well-being)\b/.test(g))
    return {
      goal,
      id: "general",
      mapping: "General healthy-eating pattern",
      actions: [
        "Build meals around a variety of vegetables and fruit, whole grains and suitable protein foods, within your preferences and restrictions.",
        "Use your food log to review practical meal routines. This goal does not add a calorie deficit, supplement dose or medical target.",
      ],
      tracking: "Review recorded meals and ingredient details over time. A meal-pattern match is not a diet-quality score or proof of a health improvement.",
      sourceIds: ["goal-general"],
    };
  if (/\b(digestive (comfort|tolerance)|gut comfort)\b/.test(g))
    return {
      goal,
      id: "digestive",
      mapping: "Digestive comfort observation",
      actions: [
        "Record usual meals, portions and comfort notes so you can review your own observations over time.",
        "This goal does not diagnose IBS, establish a food intolerance or select an elimination diet. Review special dietary changes with a clinician or dietitian.",
      ],
      tracking: "Review dated meals and symptom notes together. A pattern is not proof that a food caused a symptom; individual tolerance can differ.",
      sourceIds: ["goal-digestive"],
    };
  if (/\bbody (composition|measurements)\b/.test(g))
    return {
      goal,
      id: "body",
      mapping: "Dated body-measurement tracking",
      actions: [
        "If monitoring weight or waist is appropriate for you, use a dated measurement check-in with your chosen units and a consistent method.",
        "Weight and waist observations do not directly measure body-fat composition. This goal does not create a calorie deficit or change your nutrition targets.",
      ],
      tracking: "Review dated observations rather than treating the latest Profile value as a weight history. Missing measurements remain unknown.",
      sourceIds: [] as string[],
    };
  if (/\btraining\b/.test(g))
    return {
      goal,
      id: "training",
      mapping: "Activity and training record review",
      actions: [
        "Record the activity or training you choose to report, including its date, duration and optional self-reported effort.",
        "Keep plans separate from work recorded as completed. This goal does not prescribe training load, readiness or nutrition targets.",
      ],
      tracking: "Review your dated activity and training records. A missing entry is unknown rather than evidence of a rest day.",
      sourceIds: [] as string[],
    };
  return {
    goal,
    id: "unmapped",
    mapping: "Needs a more specific food or health target",
    actions: [
      "Choose a measurable outcome, such as protein intake, meal variety or cholesterol support, so Bloom can connect it to meal choices.",
    ],
    tracking: "This goal is saved but does not create a treatment claim.",
    sourceIds: [] as string[],
  };
}
export function goalMealFit(goals: string[], names: string) {
  const matches = goals
    .map(goalGuidance)
    .filter((g) =>
      g.id === "muscle"
        ? /chicken|salmon|tofu|lentil|chickpea|beans?|egg|yogurt|kefir/i.test(
            names,
          )
        : ["liver", "aging", "metabolic"].includes(g.id) &&
          /oat|lentil|chickpea|beans?|broccoli|spinach|quinoa|brown rice|walnut|vegetable/i.test(
            names,
          ),
    );
  return matches.map((g) => ({
    reason: `Supports your ${g.goal} goal through ${g.id === "muscle" ? "a protein-containing meal" : "a fiber-rich, plant-forward eating pattern"}.`,
    sourceIds: g.sourceIds,
  }));
}
