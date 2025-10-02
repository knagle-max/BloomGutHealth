"""
Recommendation Engine: Generates personalized dietary and lifestyle recommendations.

This module combines bacterial composition, metabolite analysis, health impacts,
and cohort comparisons to create actionable recommendations for microbiome optimization.
"""

from typing import List, Dict, Any

class RecommendationEngine:
    """
    Generates personalized recommendations to optimize microbiome.
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        
        # Bacteria -> Food/Lifestyle mapping
        # In production, this would be a comprehensive database from scientific literature
        self.bacterial_boosters = {
            "Akkermansia muciniphila": {
                "foods_to_emphasize": [
                    {"item": "Polyphenol-rich foods (berries, green tea)", 
                     "reason": "Akkermansia thrives on polyphenols",
                     "details": "Include 1-2 servings daily of cranberries, pomegranate, or green tea"},
                    {"item": "Fish oil (omega-3)",
                     "reason": "Promotes Akkermansia growth",
                     "details": "2-3 servings of fatty fish per week or supplement"}
                ],
                "foods_to_limit": [],
                "supplements": [
                    {"item": "Akkermansia muciniphila probiotic",
                     "reason": "Direct supplementation",
                     "details": "10^9 CFU daily for 4-8 weeks"}
                ]
            },
            "Faecalibacterium prausnitzii": {
                "foods_to_emphasize": [
                    {"item": "Resistant starch (green bananas, cooled potatoes)",
                     "reason": "Primary fuel for F. prausnitzii",
                     "details": "Include 15-20g resistant starch daily"},
                    {"item": "Inulin-rich foods (chicory, Jerusalem artichoke)",
                     "reason": "Prebiotic fiber that feeds butyrate producers",
                     "details": "5-10g inulin daily from food sources"}
                ],
                "foods_to_limit": [
                    {"item": "Highly processed foods",
                     "reason": "Depletes beneficial bacteria",
                     "details": "Minimize ultra-processed foods"}
                ],
                "supplements": []
            },
            "Bifidobacterium": {
                "foods_to_emphasize": [
                    {"item": "Fermented dairy (yogurt, kefir)",
                     "reason": "Contains Bifidobacterium and prebiotics",
                     "details": "1-2 servings daily, choose unsweetened varieties"},
                    {"item": "GOS-rich foods (legumes, certain fruits)",
                     "reason": "Galacto-oligosaccharides feed Bifidobacteria",
                     "details": "Include beans, lentils, or chickpeas daily"}
                ],
                "foods_to_limit": [],
                "supplements": [
                    {"item": "Bifidobacterium longum or B. lactis",
                     "reason": "Boost population directly",
                     "details": "10 billion CFU daily with meals"}
                ]
            },
            "Lactobacillus": {
                "foods_to_emphasize": [
                    {"item": "Fermented vegetables (kimchi, sauerkraut)",
                     "reason": "Rich in Lactobacillus strains",
                     "details": "2-3 tablespoons daily with meals"},
                    {"item": "Fermented dairy and non-dairy alternatives",
                     "reason": "Contains live cultures",
                     "details": "Choose products with live, active cultures"}
                ],
                "foods_to_limit": [],
                "supplements": []
            },
            "Roseburia": {
                "foods_to_emphasize": [
                    {"item": "Whole grains (oats, barley)",
                     "reason": "Beta-glucan fiber feeds butyrate producers",
                     "details": "3-4 servings of whole grains daily"},
                    {"item": "Resistant starch sources",
                     "reason": "Promotes Roseburia growth",
                     "details": "Include cooled rice, potatoes, or green bananas"}
                ],
                "foods_to_limit": [],
                "supplements": []
            }
        }
        
        # Metabolite optimization strategies
        self.metabolite_strategies = {
            "Butyrate (SCFA)": {
                "target_bacteria": ["Faecalibacterium prausnitzii", "Roseburia"],
                "dietary_approach": "High-fiber, resistant starch diet",
                "key_foods": ["Whole grains", "Legumes", "Resistant starch", "Vegetables"]
            },
            "Propionate (SCFA)": {
                "target_bacteria": ["Bacteroides", "Akkermansia muciniphila"],
                "dietary_approach": "Mediterranean-style with diverse plant foods",
                "key_foods": ["Vegetables", "Legumes", "Nuts", "Whole grains"]
            }
        }
    
    def generate_recommendations(self,
                                bacterial_composition: List[Dict[str, Any]],
                                metabolites: List[Dict[str, Any]],
                                health_impacts: List[Dict[str, Any]],
                                cohort_comparisons: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate comprehensive personalized recommendations.
        
        Process:
        1. Identify deficient beneficial bacteria
        2. Identify excess harmful bacteria
        3. Assess metabolite production gaps
        4. Consider cohort gaps
        5. Prioritize recommendations by impact
        """
        
        recommendations = []
        
        # 1. Address bacterial deficiencies
        for bacteria in bacterial_composition:
            if bacteria.get("is_deficient") and bacteria["health_score"] > 0.7:
                if bacteria["bacterial_name"] in self.bacterial_boosters:
                    booster = self.bacterial_boosters[bacteria["bacterial_name"]]
                    
                    # Add food recommendations
                    for food in booster["foods_to_emphasize"]:
                        recommendations.append({
                            "type": "emphasize",
                            "category": "food",
                            "item": food["item"],
                            "reasoning": food["reason"],
                            "details": food["details"],
                            "priority": 1,
                            "expected_impact": 0.8,
                            "target_bacteria": [bacteria["bacterial_name"]],
                            "target_metabolites": self._get_bacterial_metabolites(
                                bacteria["bacterial_name"], metabolites
                            )
                        })
                    
                    # Add supplement recommendations
                    for supp in booster["supplements"]:
                        recommendations.append({
                            "type": "supplement",
                            "category": "probiotic",
                            "item": supp["item"],
                            "reasoning": supp["reason"],
                            "details": supp["details"],
                            "priority": 2,
                            "expected_impact": 0.7,
                            "target_bacteria": [bacteria["bacterial_name"]],
                            "target_metabolites": []
                        })
                    
                    # Add foods to limit
                    for food in booster["foods_to_limit"]:
                        recommendations.append({
                            "type": "limit",
                            "category": "food",
                            "item": food["item"],
                            "reasoning": food["reason"],
                            "details": food["details"],
                            "priority": 2,
                            "expected_impact": 0.6,
                            "target_bacteria": [bacteria["bacterial_name"]],
                            "target_metabolites": []
                        })
        
        # 2. Address metabolite gaps
        critical_metabolites = ["Butyrate (SCFA)", "Propionate (SCFA)"]
        for metabolite in metabolites:
            if (metabolite["metabolite_name"] in critical_metabolites and 
                metabolite["predicted_concentration"] < 3.0):
                
                strategy = self.metabolite_strategies.get(metabolite["metabolite_name"])
                if strategy:
                    recommendations.append({
                        "type": "emphasize",
                        "category": "dietary_pattern",
                        "item": strategy["dietary_approach"],
                        "reasoning": f"Boost {metabolite['metabolite_name']} production",
                        "details": f"Focus on: {', '.join(strategy['key_foods'])}",
                        "priority": 1,
                        "expected_impact": 0.85,
                        "target_bacteria": strategy["target_bacteria"],
                        "target_metabolites": [metabolite["metabolite_name"]]
                    })
        
        # 3. Add lifestyle recommendations
        diversity_low = all(
            comp.get("diversity_comparison", {}).get("status") == "lower"
            for comp in cohort_comparisons.values()
        )
        
        if diversity_low:
            recommendations.append({
                "type": "emphasize",
                "category": "lifestyle",
                "item": "Increase dietary diversity",
                "reasoning": "Microbiome diversity below optimal range",
                "details": "Aim for 30+ different plant foods per week",
                "priority": 1,
                "expected_impact": 0.9,
                "target_bacteria": [],
                "target_metabolites": []
            })
        
        # Sort by priority and expected impact
        recommendations.sort(key=lambda x: (x["priority"], -x["expected_impact"]))
        
        return recommendations[:10]  # Top 10 recommendations
    
    def _get_bacterial_metabolites(self, bacteria_name: str, 
                                   metabolites: List[Dict[str, Any]]) -> List[str]:
        """Get metabolites produced by specific bacteria."""
        return [
            m["metabolite_name"] 
            for m in metabolites 
            if bacteria_name in m.get("producing_bacteria", [])
        ]
