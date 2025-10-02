from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
import os
from datetime import datetime

app = FastAPI(title="Bloom Microbiome ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MicrobiomeAnalysisRequest(BaseModel):
    sample_id: str
    user_id: str
    raw_data: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    cohorts_to_compare: List[str] = ["general_population"]

class MicrobiomeAnalysisResponse(BaseModel):
    sample_id: str
    status: str
    diversity_index: Optional[float] = None
    bacterial_composition: List[Dict[str, Any]] = []
    metabolites: List[Dict[str, Any]] = []
    health_impacts: List[Dict[str, Any]] = []
    cohort_comparisons: Dict[str, Any] = {}
    recommendations: List[Dict[str, Any]] = []
    confidence: float
    model_version: str

@app.get("/")
async def root():
    return {
        "service": "Bloom Microbiome ML Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/ml/analyze", response_model=MicrobiomeAnalysisResponse)
async def analyze_microbiome(request: MicrobiomeAnalysisRequest):
    """
    Main endpoint for microbiome analysis pipeline.
    Processes bacterial DNA data through the full ML pipeline:
    1. Taxonomic profiling
    2. Metabolite prediction
    3. Health impact inference
    4. Cohort comparison
    5. Recommendation generation
    """
    try:
        from .services.taxonomic_profiler import TaxonomicProfiler
        from .services.metabolite_predictor import MetabolitePredictor
        from .services.health_impact_analyzer import HealthImpactAnalyzer
        from .services.cohort_comparator import CohortComparator
        from .services.recommendation_engine import RecommendationEngine
        
        # Step 1: Taxonomic profiling
        profiler = TaxonomicProfiler()
        bacterial_composition = profiler.analyze(request.raw_data or {})
        diversity_index = profiler.calculate_diversity(bacterial_composition)
        
        # Step 2: Metabolite prediction from bacterial genes
        metabolite_predictor = MetabolitePredictor()
        metabolites = metabolite_predictor.predict_metabolites(bacterial_composition)
        
        # Step 3: Health impact inference
        impact_analyzer = HealthImpactAnalyzer()
        health_impacts = impact_analyzer.analyze_impacts(metabolites)
        
        # Step 4: Cohort comparison
        comparator = CohortComparator()
        cohort_comparisons = comparator.compare(
            bacterial_composition, 
            request.cohorts_to_compare
        )
        
        # Step 5: Generate personalized recommendations
        rec_engine = RecommendationEngine()
        recommendations = rec_engine.generate_recommendations(
            bacterial_composition,
            metabolites,
            health_impacts,
            cohort_comparisons
        )
        
        return MicrobiomeAnalysisResponse(
            sample_id=request.sample_id,
            status="completed",
            diversity_index=diversity_index,
            bacterial_composition=bacterial_composition,
            metabolites=metabolites,
            health_impacts=health_impacts,
            cohort_comparisons=cohort_comparisons,
            recommendations=recommendations,
            confidence=0.85,
            model_version="1.0.0"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/ml/upload")
async def upload_microbiome_file(file: UploadFile = File(...)):
    """
    Upload and preprocess microbiome test file (FASTQ/FASTA/CSV).
    """
    try:
        from .services.data_processor import DataProcessor
        
        processor = DataProcessor()
        result = await processor.process_upload(file)
        
        return {
            "status": "success",
            "file_path": result["file_path"],
            "format": result["format"],
            "preview": result["preview"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/ml/cohorts")
async def list_cohorts():
    """
    List available cohort reference groups for comparison.
    """
    return {
        "cohorts": [
            {"id": "elite_athletes", "name": "Elite Athletes", "sample_size": 250},
            {"id": "centenarians", "name": "Long-Living Individuals (90+)", "sample_size": 180},
            {"id": "general_population", "name": "General Healthy Population", "sample_size": 1000},
            {"id": "mediterranean_diet", "name": "Mediterranean Diet Followers", "sample_size": 320},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
