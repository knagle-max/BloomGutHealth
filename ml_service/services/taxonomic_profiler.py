"""
Taxonomic Profiler: Analyzes bacterial DNA composition and identifies species.

This module processes raw microbiome data to identify bacterial species and their abundance.
In production, this would integrate with tools like QIIME2 or MetaPhlAn for sequence analysis.
"""

import numpy as np
from typing import Dict, List, Any
import math

class TaxonomicProfiler:
    """
    Analyzes bacterial DNA composition from microbiome test data.
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        
        # Reference bacterial profiles (in production, load from database/NCBI)
        self.known_bacteria = {
            "Akkermansia muciniphila": {"optimal_range": (1, 4), "health_score": 0.9},
            "Bifidobacterium": {"optimal_range": (2, 25), "health_score": 0.85},
            "Faecalibacterium prausnitzii": {"optimal_range": (3, 15), "health_score": 0.88},
            "Bacteroides": {"optimal_range": (15, 45), "health_score": 0.7},
            "Lactobacillus": {"optimal_range": (1, 10), "health_score": 0.82},
            "Prevotella": {"optimal_range": (5, 30), "health_score": 0.65},
            "Roseburia": {"optimal_range": (2, 8), "health_score": 0.87},
            "Clostridium": {"optimal_range": (1, 15), "health_score": 0.5},
        }
    
    def analyze(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyze raw microbiome data and identify bacterial composition.
        
        In production, this would:
        1. Process DNA sequences (FASTQ/FASTA)
        2. Align to reference genomes
        3. Identify species via 16S rRNA or metagenomic analysis
        4. Quantify abundance
        
        For now, processes structured data or generates realistic profiles.
        """
        
        if not raw_data:
            # Generate realistic sample data for demonstration
            return self._generate_sample_profile()
        
        # Process provided data
        if "bacteria_percentages" in raw_data:
            return self._process_percentage_data(raw_data["bacteria_percentages"])
        
        return self._generate_sample_profile()
    
    def _process_percentage_data(self, percentages: Dict[str, float]) -> List[Dict[str, Any]]:
        """Process pre-calculated bacterial percentages."""
        composition = []
        
        for bacteria, abundance in percentages.items():
            ref_data = self.known_bacteria.get(bacteria, {"optimal_range": (0, 100), "health_score": 0.5})
            
            composition.append({
                "bacterial_name": bacteria,
                "taxonomy_level": "species",
                "abundance": abundance,
                "optimal_range": ref_data["optimal_range"],
                "is_deficient": abundance < ref_data["optimal_range"][0],
                "is_excess": abundance > ref_data["optimal_range"][1],
                "health_score": ref_data["health_score"],
                "genome_data": {
                    "gene_count": int(np.random.uniform(2000, 5000)),
                    "metabolic_pathways": self._identify_pathways(bacteria)
                }
            })
        
        return composition
    
    def _generate_sample_profile(self) -> List[Dict[str, Any]]:
        """Generate realistic bacterial composition for demonstration."""
        composition = []
        
        for bacteria, ref_data in self.known_bacteria.items():
            # Generate realistic abundance within or near optimal range
            if np.random.random() < 0.7:  # 70% in optimal range
                abundance = np.random.uniform(ref_data["optimal_range"][0], ref_data["optimal_range"][1])
            else:  # 30% outside optimal range
                if np.random.random() < 0.5:
                    abundance = np.random.uniform(0, ref_data["optimal_range"][0])
                else:
                    abundance = np.random.uniform(ref_data["optimal_range"][1], ref_data["optimal_range"][1] * 1.5)
            
            composition.append({
                "bacterial_name": bacteria,
                "taxonomy_level": "species",
                "abundance": round(abundance, 2),
                "optimal_range": ref_data["optimal_range"],
                "is_deficient": abundance < ref_data["optimal_range"][0],
                "is_excess": abundance > ref_data["optimal_range"][1],
                "health_score": ref_data["health_score"],
                "genome_data": {
                    "gene_count": int(np.random.uniform(2000, 5000)),
                    "metabolic_pathways": self._identify_pathways(bacteria)
                }
            })
        
        return composition
    
    def _identify_pathways(self, bacteria_name: str) -> List[str]:
        """
        Identify metabolic pathways based on bacterial genome.
        In production, query KEGG/MetaCyc databases.
        """
        pathway_map = {
            "Akkermansia muciniphila": ["mucin_degradation", "propionate_production"],
            "Bifidobacterium": ["lactate_production", "acetate_production"],
            "Faecalibacterium prausnitzii": ["butyrate_production", "anti_inflammatory"],
            "Bacteroides": ["polysaccharide_degradation", "propionate_production"],
            "Lactobacillus": ["lactate_production", "antimicrobial_production"],
            "Roseburia": ["butyrate_production", "fiber_fermentation"],
        }
        
        return pathway_map.get(bacteria_name, ["general_metabolism"])
    
    def calculate_diversity(self, composition: List[Dict[str, Any]]) -> float:
        """
        Calculate Shannon diversity index.
        Higher values indicate healthier, more diverse microbiome.
        """
        if not composition:
            return 0.0
        
        abundances = [b["abundance"] for b in composition]
        total = sum(abundances)
        
        if total == 0:
            return 0.0
        
        proportions = [a / total for a in abundances]
        shannon = -sum(p * math.log(p) if p > 0 else 0 for p in proportions)
        
        return round(shannon, 2)
