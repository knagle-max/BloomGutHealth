// Molecule Production & Health Impact Calculation System

export interface MoleculeProduction {
  butyrate: number;
  acetate: number;
  lactate: number;
  propionate: number;
  totalSCFAs: number;
}

export interface HealthScore {
  category: 'Inflammation' | 'Gut Barrier' | 'Metabolic Health' | 'Immune Function';
  score: number; // 0-100
  status: 'excellent' | 'good' | 'needs_attention';
  impacts: string[];
}

export interface BacterialGap {
  bacteria: string;
  currentLevel: 'absent' | 'low' | 'moderate' | 'high';
  optimalLevel: 'moderate' | 'high';
  importance: 'critical' | 'high' | 'moderate';
  primaryMolecule: string;
}

export interface FoodRecommendation {
  food: string;
  reason: string;
  targetBacteria: string[];
  targetMolecules: string[];
  servingGuidance: string;
  priority: 'high' | 'medium' | 'low';
}

export function calculateMoleculeProduction(
  totalFiber: number,
  totalProtein: number,
  totalResistantStarch: number = 0
): MoleculeProduction {
  const butyrate = Math.min((totalFiber * 0.3) + (totalResistantStarch * 0.5), 50);
  
  const acetate = Math.min((totalFiber * 0.25) + (totalProtein * 0.1), 40);
  
  const lactate = Math.min(totalFiber * 0.15, 20);
  
  const propionate = Math.min((totalFiber * 0.2) + (totalProtein * 0.05), 30);
  
  const totalSCFAs = butyrate + acetate + propionate;

  return {
    butyrate: Math.round(butyrate * 10) / 10,
    acetate: Math.round(acetate * 10) / 10,
    lactate: Math.round(lactate * 10) / 10,
    propionate: Math.round(propionate * 10) / 10,
    totalSCFAs: Math.round(totalSCFAs * 10) / 10,
  };
}

export function calculateHealthScores(molecules: MoleculeProduction, totalSugar: number): HealthScore[] {
  const scores: HealthScore[] = [];

  const inflammationScore = Math.min(100, (molecules.butyrate / 30) * 50 + (molecules.propionate / 20) * 30 - (totalSugar / 50) * 20);
  scores.push({
    category: 'Inflammation',
    score: Math.max(0, Math.round(inflammationScore)),
    status: inflammationScore >= 70 ? 'excellent' : inflammationScore >= 50 ? 'good' : 'needs_attention',
    impacts: [
      molecules.butyrate > 15 ? 'Butyrate inhibiting inflammatory pathways' : 'Low butyrate - limited anti-inflammatory effect',
      molecules.propionate > 10 ? 'Propionate supporting immune regulation' : 'Boost propionate for better inflammation control',
      totalSugar > 30 ? 'High sugar promoting inflammatory bacteria' : 'Sugar levels support anti-inflammatory environment'
    ]
  });

  const gutBarrierScore = Math.min(100, (molecules.butyrate / 25) * 80 + (molecules.lactate / 15) * 20);
  scores.push({
    category: 'Gut Barrier',
    score: Math.max(0, Math.round(gutBarrierScore)),
    status: gutBarrierScore >= 75 ? 'excellent' : gutBarrierScore >= 55 ? 'good' : 'needs_attention',
    impacts: [
      molecules.butyrate > 20 ? 'Strong butyrate production fueling gut lining' : 'Increase fiber for better gut barrier support',
      molecules.lactate > 8 ? 'Lactate maintaining protective gut pH' : 'Lactate levels adequate for pH balance',
      molecules.totalSCFAs > 40 ? 'Excellent SCFA production strengthening barrier' : 'Boost SCFA production with more fiber'
    ]
  });

  const metabolicScore = Math.min(100, (molecules.propionate / 20) * 40 + (molecules.butyrate / 25) * 30 + (molecules.totalSCFAs / 60) * 30);
  scores.push({
    category: 'Metabolic Health',
    score: Math.max(0, Math.round(metabolicScore)),
    status: metabolicScore >= 70 ? 'excellent' : metabolicScore >= 50 ? 'good' : 'needs_attention',
    impacts: [
      molecules.propionate > 12 ? 'Propionate optimizing glucose & cholesterol metabolism' : 'Increase resistant starch for better metabolic control',
      molecules.butyrate > 18 ? 'Butyrate improving insulin sensitivity' : 'Boost butyrate production for metabolic benefits',
      molecules.totalSCFAs > 50 ? 'High SCFA levels supporting healthy weight' : 'Increase overall fiber intake for metabolic support'
    ]
  });

  const immuneScore = Math.min(100, (molecules.lactate / 15) * 35 + (molecules.acetate / 30) * 35 + (molecules.totalSCFAs / 60) * 30);
  scores.push({
    category: 'Immune Function',
    score: Math.max(0, Math.round(immuneScore)),
    status: immuneScore >= 70 ? 'excellent' : immuneScore >= 50 ? 'good' : 'needs_attention',
    impacts: [
      molecules.lactate > 10 ? 'Lactate enhancing pathogen protection' : 'Increase fermented foods for immune support',
      molecules.acetate > 20 ? 'Acetate supporting immune cell function' : 'Boost acetate with diverse fiber sources',
      molecules.totalSCFAs > 45 ? 'Strong SCFA production fortifying immunity' : 'Increase prebiotic fiber for immune resilience'
    ]
  });

  return scores;
}

export function identifyBacterialGaps(
  averageFiber: number,
  averageProtein: number,
  averageSugar: number
): BacterialGap[] {
  const gaps: BacterialGap[] = [];

  if (averageFiber < 8) {
    gaps.push({
      bacteria: 'Faecalibacterium prausnitzii',
      currentLevel: averageFiber < 4 ? 'low' : 'moderate',
      optimalLevel: 'high',
      importance: 'critical',
      primaryMolecule: 'Butyrate'
    });
  }

  if (averageFiber < 6) {
    gaps.push({
      bacteria: 'Bifidobacterium',
      currentLevel: averageFiber < 3 ? 'low' : 'moderate',
      optimalLevel: 'high',
      importance: 'high',
      primaryMolecule: 'Acetate & Lactate'
    });
  }

  if (averageProtein < 20 || averageFiber < 5) {
    gaps.push({
      bacteria: 'Akkermansia muciniphila',
      currentLevel: 'low',
      optimalLevel: 'moderate',
      importance: 'high',
      primaryMolecule: 'Propionate'
    });
  }

  if (averageSugar > 25) {
    gaps.push({
      bacteria: 'E. coli (reduce opportunistic strains)',
      currentLevel: 'high',
      optimalLevel: 'moderate',
      importance: 'moderate',
      primaryMolecule: 'Endotoxins (harmful)'
    });
  }

  return gaps;
}

export function generateFoodRecommendations(gaps: BacterialGap[], healthScores: HealthScore[]): FoodRecommendation[] {
  const recommendations: FoodRecommendation[] = [];
  const needsInflammationSupport = healthScores.find(s => s.category === 'Inflammation')?.status === 'needs_attention';
  const needsGutBarrier = healthScores.find(s => s.category === 'Gut Barrier')?.status === 'needs_attention';
  const needsMetabolic = healthScores.find(s => s.category === 'Metabolic Health')?.status === 'needs_attention';

  const hasFaecalGap = gaps.some(g => g.bacteria === 'Faecalibacterium prausnitzii');
  const hasBifidoGap = gaps.some(g => g.bacteria === 'Bifidobacterium');
  const hasAkkermansiaGap = gaps.some(g => g.bacteria === 'Akkermansia muciniphila');
  const hasHighSugar = gaps.some(g => g.bacteria.includes('E. coli'));

  if (hasFaecalGap || needsInflammationSupport || needsGutBarrier) {
    recommendations.push({
      food: 'Resistant Starch (green bananas, cooled potatoes/rice, oats)',
      reason: 'Primary fuel for butyrate-producing bacteria',
      targetBacteria: ['Faecalibacterium prausnitzii'],
      targetMolecules: ['Butyrate'],
      servingGuidance: 'Include 15-20g resistant starch daily - 1 green banana or ½ cup cooled potatoes',
      priority: 'high'
    });

    recommendations.push({
      food: 'Inulin-rich foods (chicory root, Jerusalem artichoke, onions, garlic)',
      reason: 'Prebiotic fiber that specifically feeds butyrate producers',
      targetBacteria: ['Faecalibacterium prausnitzii', 'Bifidobacterium'],
      targetMolecules: ['Butyrate', 'Acetate'],
      servingGuidance: '5-10g inulin daily - 2-3 cloves garlic or ½ onion per day',
      priority: 'high'
    });
  }

  if (hasBifidoGap || needsMetabolic) {
    recommendations.push({
      food: 'Fermented dairy (plain yogurt, kefir) or fermented vegetables',
      reason: 'Contains live Bifidobacterium and supports probiotic diversity',
      targetBacteria: ['Bifidobacterium'],
      targetMolecules: ['Lactate', 'Acetate'],
      servingGuidance: '1-2 servings daily - 1 cup plain yogurt or ½ cup sauerkraut',
      priority: 'high'
    });

    recommendations.push({
      food: 'Legumes (beans, lentils, chickpeas)',
      reason: 'Rich in galacto-oligosaccharides (GOS) that feed Bifidobacteria',
      targetBacteria: ['Bifidobacterium', 'Faecalibacterium prausnitzii'],
      targetMolecules: ['Acetate', 'Butyrate', 'Propionate'],
      servingGuidance: '1 cup cooked legumes daily - split across meals',
      priority: 'high'
    });
  }

  if (hasAkkermansiaGap || needsMetabolic) {
    recommendations.push({
      food: 'Polyphenol-rich foods (berries, green tea, dark chocolate)',
      reason: 'Akkermansia thrives on polyphenols',
      targetBacteria: ['Akkermansia muciniphila'],
      targetMolecules: ['Propionate'],
      servingGuidance: '1-2 servings daily - 1 cup berries or 2-3 cups green tea',
      priority: 'medium'
    });

    recommendations.push({
      food: 'Fatty fish (salmon, mackerel, sardines)',
      reason: 'Omega-3s promote Akkermansia growth and reduce inflammation',
      targetBacteria: ['Akkermansia muciniphila'],
      targetMolecules: ['Propionate'],
      servingGuidance: '2-3 servings per week - 3-4 oz per serving',
      priority: 'medium'
    });
  }

  if (hasHighSugar) {
    recommendations.push({
      food: 'REDUCE: Added sugars and refined carbohydrates',
      reason: 'High sugar feeds opportunistic bacteria and promotes inflammation',
      targetBacteria: ['E. coli (reduce)'],
      targetMolecules: ['Reduce endotoxins'],
      servingGuidance: 'Limit added sugar to <25g/day - check labels on packaged foods',
      priority: 'high'
    });
  }

  recommendations.push({
    food: 'Whole grains (quinoa, brown rice, whole wheat)',
    reason: 'Diverse fibers support overall microbiome diversity',
    targetBacteria: ['Multiple beneficial species'],
    targetMolecules: ['All SCFAs'],
    servingGuidance: '3-5 servings daily - ½ cup cooked grain per serving',
    priority: 'medium'
  });

  recommendations.push({
    food: 'Cruciferous vegetables (broccoli, Brussels sprouts, cabbage)',
    reason: 'Rich in sulfur compounds and fiber that support diverse bacteria',
    targetBacteria: ['Multiple beneficial species'],
    targetMolecules: ['Butyrate', 'Propionate'],
    servingGuidance: '1-2 cups daily - raw or lightly cooked',
    priority: 'medium'
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
