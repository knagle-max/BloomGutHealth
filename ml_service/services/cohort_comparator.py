"""
Cohort Comparator: Compares user microbiome against reference populations.

This module benchmarks user's microbiome against elite athletes, 
long-living individuals, and other reference groups.
"""

from typing import List, Dict, Any
import numpy as np

class CohortComparator:
    """
    Compares user microbiome against reference cohort populations.
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        
        # Reference cohort profiles (in production, from research databases)
        self.cohort_profiles = {
            "elite_athletes": {
                "name": "Elite Athletes",
                "sample_size": 250,
                "typical_bacteria": {
                    "Akkermansia muciniphila": 3.2,
                    "Faecalibacterium prausnitzii": 12.5,
                    "Roseburia": 6.8,
                    "Bifidobacterium": 18.0,
                    "Prevotella": 22.0,
                },
                "diversity_index": 3.4,
                "key_metabolites": ["Butyrate (SCFA)", "Propionate (SCFA)", "Lactate"],
                "characteristics": "Higher microbial diversity and SCFA production"
            },
            "centenarians": {
                "name": "Long-Living Individuals (90+)",
                "sample_size": 180,
                "typical_bacteria": {
                    "Akkermansia muciniphila": 3.8,
                    "Bifidobacterium": 20.0,
                    "Faecalibacterium prausnitzii": 14.0,
                    "Bacteroides": 25.0,
                },
                "diversity_index": 3.2,
                "key_metabolites": ["Butyrate (SCFA)", "Anti-inflammatory compounds"],
                "characteristics": "Higher beneficial bacteria and anti-inflammatory profiles"
            },
            "general_population": {
                "name": "General Healthy Population",
                "sample_size": 1000,
                "typical_bacteria": {
                    "Bacteroides": 28.0,
                    "Faecalibacterium prausnitzii": 8.0,
                    "Bifidobacterium": 12.0,
                    "Prevotella": 15.0,
                },
                "diversity_index": 2.6,
                "key_metabolites": ["Acetate (SCFA)", "Butyrate (SCFA)"],
                "characteristics": "Baseline healthy microbiome profile"
            },
            "mediterranean_diet": {
                "name": "Mediterranean Diet Followers",
                "sample_size": 320,
                "typical_bacteria": {
                    "Prevotella": 25.0,
                    "Roseburia": 7.5,
                    "Faecalibacterium prausnitzii": 11.0,
                    "Bifidobacterium": 16.0,
                },
                "diversity_index": 3.1,
                "key_metabolites": ["Butyrate (SCFA)", "Propionate (SCFA)"],
                "characteristics": "Fiber-fermenting bacteria and high SCFA production"
            }
        }
    
    def compare(self, user_composition: List[Dict[str, Any]], 
                cohort_ids: List[str]) -> Dict[str, Any]:
        """
        Compare user's microbiome against selected cohort groups.
        
        Process:
        1. Extract user's bacterial profile
        2. Calculate similarity scores (Bray-Curtis, Jaccard)
        3. Identify unique features
        4. Provide actionable insights
        """
        
        comparisons = {}
        
        # Build user profile
        user_profile = {b["bacterial_name"]: b["abundance"] for b in user_composition}
        user_diversity = self._calculate_diversity(user_composition)
        
        for cohort_id in cohort_ids:
            if cohort_id not in self.cohort_profiles:
                continue
            
            cohort = self.cohort_profiles[cohort_id]
            
            # Calculate similarity
            similarity_score = self._calculate_similarity(
                user_profile, 
                cohort["typical_bacteria"]
            )
            
            # Identify gaps and strengths
            gaps = self._identify_gaps(user_profile, cohort["typical_bacteria"])
            strengths = self._identify_strengths(user_profile, cohort["typical_bacteria"])
            
            # Diversity comparison
            diversity_diff = user_diversity - cohort["diversity_index"]
            
            comparisons[cohort_id] = {
                "cohort_name": cohort["name"],
                "sample_size": cohort["sample_size"],
                "similarity_score": round(similarity_score, 2),
                "similarity_category": self._get_similarity_category(similarity_score),
                "diversity_comparison": {
                    "user": user_diversity,
                    "cohort": cohort["diversity_index"],
                    "difference": round(diversity_diff, 2),
                    "status": "higher" if diversity_diff > 0 else "lower" if diversity_diff < 0 else "similar"
                },
                "gaps": gaps,
                "strengths": strengths,
                "key_characteristics": cohort["characteristics"],
                "recommendations": self._generate_cohort_recommendations(gaps, cohort)
            }
        
        return comparisons
    
    def _calculate_similarity(self, user_profile: Dict[str, float], 
                             cohort_profile: Dict[str, float]) -> float:
        """Calculate Bray-Curtis similarity between profiles."""
        all_bacteria = set(user_profile.keys()) | set(cohort_profile.keys())
        
        numerator = sum(
            min(user_profile.get(b, 0), cohort_profile.get(b, 0)) 
            for b in all_bacteria
        )
        denominator = sum(
            user_profile.get(b, 0) + cohort_profile.get(b, 0) 
            for b in all_bacteria
        )
        
        if denominator == 0:
            return 0.0
        
        return numerator / denominator
    
    def _calculate_diversity(self, composition: List[Dict[str, Any]]) -> float:
        """Calculate Shannon diversity index."""
        abundances = [b["abundance"] for b in composition]
        total = sum(abundances)
        
        if total == 0:
            return 0.0
        
        import math
        proportions = [a / total for a in abundances]
        shannon = -sum(p * math.log(p) if p > 0 else 0 for p in proportions)
        
        return round(shannon, 2)
    
    def _identify_gaps(self, user_profile: Dict[str, float], 
                      cohort_profile: Dict[str, float]) -> List[Dict[str, Any]]:
        """Identify bacteria that user lacks compared to cohort."""
        gaps = []
        
        for bacteria, cohort_abundance in cohort_profile.items():
            user_abundance = user_profile.get(bacteria, 0)
            diff = user_abundance - cohort_abundance
            
            if diff < -1.0:  # Significant deficit
                gaps.append({
                    "bacteria": bacteria,
                    "user_abundance": user_abundance,
                    "cohort_abundance": cohort_abundance,
                    "deficit": round(abs(diff), 2)
                })
        
        return gaps
    
    def _identify_strengths(self, user_profile: Dict[str, float], 
                           cohort_profile: Dict[str, float]) -> List[Dict[str, Any]]:
        """Identify bacteria where user exceeds cohort."""
        strengths = []
        
        for bacteria, user_abundance in user_profile.items():
            cohort_abundance = cohort_profile.get(bacteria, 0)
            diff = user_abundance - cohort_abundance
            
            if diff > 1.0:  # Significant surplus
                strengths.append({
                    "bacteria": bacteria,
                    "user_abundance": user_abundance,
                    "cohort_abundance": cohort_abundance,
                    "surplus": round(diff, 2)
                })
        
        return strengths
    
    def _get_similarity_category(self, score: float) -> str:
        """Categorize similarity score."""
        if score >= 0.8:
            return "very_similar"
        elif score >= 0.6:
            return "moderately_similar"
        elif score >= 0.4:
            return "somewhat_different"
        else:
            return "very_different"
    
    def _generate_cohort_recommendations(self, gaps: List[Dict[str, Any]], 
                                        cohort: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on cohort comparison."""
        recommendations = []
        
        if not gaps:
            recommendations.append(f"Your microbiome closely matches {cohort['name']}. Maintain current habits.")
        else:
            recommendations.append(
                f"To align with {cohort['name']}, focus on increasing: " + 
                ", ".join([g["bacteria"] for g in gaps[:3]])
            )
        
        return recommendations
