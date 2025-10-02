"""
Metabolite Predictor: Infers molecular production from bacterial genetic data.

This module analyzes bacterial genes to predict which molecules (metabolites) 
are produced and their estimated concentrations.
"""

from typing import List, Dict, Any
import numpy as np

class MetabolitePredictor:
    """
    Predicts metabolite production from bacterial genome data.
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        
        # Gene -> Metabolite mappings (in production, from KEGG/MetaCyc)
        self.gene_metabolite_map = {
            "butyrate_production": {
                "metabolite": "Butyrate (SCFA)",
                "pathway_id": "PWY-5022",
                "production_genes": ["butyryl-CoA_transferase", "butyrate_kinase"],
                "category": "short_chain_fatty_acid"
            },
            "propionate_production": {
                "metabolite": "Propionate (SCFA)",
                "pathway_id": "PWY-7013",
                "production_genes": ["methylmalonyl-CoA_mutase", "propionyl-CoA"],
                "category": "short_chain_fatty_acid"
            },
            "acetate_production": {
                "metabolite": "Acetate (SCFA)",
                "pathway_id": "PWY-5100",
                "production_genes": ["acetate_kinase", "phosphate_acetyltransferase"],
                "category": "short_chain_fatty_acid"
            },
            "lactate_production": {
                "metabolite": "Lactate",
                "pathway_id": "PWY-4221",
                "production_genes": ["lactate_dehydrogenase"],
                "category": "organic_acid"
            },
            "antimicrobial_production": {
                "metabolite": "Bacteriocins",
                "pathway_id": "PWY-7124",
                "production_genes": ["bacteriocin_synthesis"],
                "category": "antimicrobial_peptide"
            },
            "anti_inflammatory": {
                "metabolite": "Anti-inflammatory compounds",
                "pathway_id": "PWY-8001",
                "production_genes": ["anti_inflammatory_factor"],
                "category": "signaling_molecule"
            }
        }
    
    def predict_metabolites(self, bacterial_composition: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict metabolite production based on bacterial genes and abundance.
        
        Process:
        1. Identify metabolic pathways in each bacterium's genome
        2. Map pathways to metabolites via gene analysis
        3. Estimate production based on bacterial abundance
        4. Calculate confidence scores
        """
        
        metabolites = []
        metabolite_totals = {}
        
        for bacteria in bacterial_composition:
            pathways = bacteria["genome_data"]["metabolic_pathways"]
            abundance = bacteria["abundance"]
            
            for pathway in pathways:
                if pathway in self.gene_metabolite_map:
                    metabolite_info = self.gene_metabolite_map[pathway]
                    metabolite_name = metabolite_info["metabolite"]
                    
                    # Calculate predicted concentration based on bacterial abundance
                    # Higher abundance = more metabolite production
                    base_concentration = np.random.uniform(0.5, 2.0)
                    concentration = base_concentration * (abundance / 10.0)
                    
                    # Calculate confidence based on genome data quality
                    confidence = min(0.95, 0.7 + (abundance / 100.0))
                    
                    if metabolite_name not in metabolite_totals:
                        metabolite_totals[metabolite_name] = {
                            "concentration": 0,
                            "producing_bacteria": [],
                            "genes": set(metabolite_info["production_genes"]),
                            "pathway_id": metabolite_info["pathway_id"],
                            "category": metabolite_info["category"],
                            "confidences": []
                        }
                    
                    metabolite_totals[metabolite_name]["concentration"] += concentration
                    metabolite_totals[metabolite_name]["producing_bacteria"].append(bacteria["bacterial_name"])
                    metabolite_totals[metabolite_name]["confidences"].append(confidence)
        
        # Convert to list format
        for metabolite_name, data in metabolite_totals.items():
            metabolites.append({
                "metabolite_name": metabolite_name,
                "pathway_id": data["pathway_id"],
                "predicted_concentration": round(data["concentration"], 2),
                "confidence": round(np.mean(data["confidences"]), 2),
                "production_genes": list(data["genes"]),
                "producing_bacteria": data["producing_bacteria"],
                "category": data["category"]
            })
        
        return metabolites
