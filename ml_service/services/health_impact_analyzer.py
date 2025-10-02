"""
Health Impact Analyzer: Evaluates how metabolites affect the human body.

This module uses biomedical knowledge to infer the health impacts of 
predicted metabolites on various body systems.
"""

from typing import List, Dict, Any

class HealthImpactAnalyzer:
    """
    Analyzes health impacts of metabolites using biomedical knowledge.
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        
        # Metabolite -> Health Impact knowledge base
        # In production, this would be a comprehensive database from PubChem, 
        # Human Metabolome Database, and scientific literature
        self.metabolite_impacts = {
            "Butyrate (SCFA)": {
                "category": "beneficial",
                "impacts": [
                    {
                        "description": "Strengthens intestinal barrier function",
                        "score": 0.9,
                        "evidence_level": "strong",
                        "affected_systems": ["digestive", "immune"],
                        "mechanism": "Provides energy to colonocytes and regulates tight junction proteins"
                    },
                    {
                        "description": "Reduces inflammation and oxidative stress",
                        "score": 0.85,
                        "evidence_level": "strong",
                        "affected_systems": ["immune", "cardiovascular"],
                        "mechanism": "Inhibits NF-κB pathway and histone deacetylase"
                    },
                    {
                        "description": "Improves insulin sensitivity",
                        "score": 0.75,
                        "evidence_level": "moderate",
                        "affected_systems": ["metabolic", "endocrine"],
                        "mechanism": "Enhances gut hormone secretion (GLP-1, PYY)"
                    }
                ]
            },
            "Propionate (SCFA)": {
                "category": "beneficial",
                "impacts": [
                    {
                        "description": "Regulates glucose and cholesterol metabolism",
                        "score": 0.8,
                        "evidence_level": "strong",
                        "affected_systems": ["metabolic", "cardiovascular"],
                        "mechanism": "Modulates hepatic glucose production and lipid synthesis"
                    },
                    {
                        "description": "Enhances satiety and weight management",
                        "score": 0.7,
                        "evidence_level": "moderate",
                        "affected_systems": ["metabolic", "nervous"],
                        "mechanism": "Stimulates gut hormone release affecting appetite"
                    }
                ]
            },
            "Acetate (SCFA)": {
                "category": "beneficial",
                "impacts": [
                    {
                        "description": "Supports energy metabolism",
                        "score": 0.75,
                        "evidence_level": "strong",
                        "affected_systems": ["metabolic"],
                        "mechanism": "Substrate for lipogenesis and energy production"
                    },
                    {
                        "description": "Modulates immune function",
                        "score": 0.7,
                        "evidence_level": "moderate",
                        "affected_systems": ["immune"],
                        "mechanism": "Regulates T-cell differentiation and cytokine production"
                    }
                ]
            },
            "Lactate": {
                "category": "neutral",
                "impacts": [
                    {
                        "description": "Provides metabolic fuel for other bacteria",
                        "score": 0.6,
                        "evidence_level": "strong",
                        "affected_systems": ["digestive"],
                        "mechanism": "Cross-feeding substrate for butyrate producers"
                    }
                ]
            },
            "Bacteriocins": {
                "category": "beneficial",
                "impacts": [
                    {
                        "description": "Natural antimicrobial defense",
                        "score": 0.8,
                        "evidence_level": "strong",
                        "affected_systems": ["immune", "digestive"],
                        "mechanism": "Inhibits pathogenic bacteria growth"
                    }
                ]
            },
            "Anti-inflammatory compounds": {
                "category": "beneficial",
                "impacts": [
                    {
                        "description": "Reduces systemic inflammation",
                        "score": 0.85,
                        "evidence_level": "strong",
                        "affected_systems": ["immune", "cardiovascular", "nervous"],
                        "mechanism": "Modulates inflammatory cytokine production"
                    }
                ]
            }
        }
    
    def analyze_impacts(self, metabolites: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze health impacts of predicted metabolites.
        
        Process:
        1. Match metabolites to knowledge base
        2. Evaluate impact based on concentration
        3. Consider synergistic effects
        4. Provide mechanistic explanations
        """
        
        health_impacts = []
        
        for metabolite in metabolites:
            metabolite_name = metabolite["metabolite_name"]
            concentration = metabolite["predicted_concentration"]
            
            if metabolite_name in self.metabolite_impacts:
                impact_data = self.metabolite_impacts[metabolite_name]
                
                for impact in impact_data["impacts"]:
                    # Adjust impact score based on concentration
                    # Higher concentration generally means stronger impact
                    concentration_factor = min(1.0, concentration / 5.0)
                    adjusted_score = impact["score"] * (0.5 + 0.5 * concentration_factor)
                    
                    health_impacts.append({
                        "metabolite_name": metabolite_name,
                        "metabolite_id": metabolite.get("pathway_id"),
                        "impact_category": impact_data["category"],
                        "impact_description": impact["description"],
                        "impact_score": round(adjusted_score, 2),
                        "evidence_level": impact["evidence_level"],
                        "affected_systems": impact["affected_systems"],
                        "mechanism_of_action": impact["mechanism"],
                        "concentration": concentration,
                        "confidence": metabolite["confidence"]
                    })
        
        return health_impacts
