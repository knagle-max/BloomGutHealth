from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import hashlib
import hmac
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
import os
from datetime import datetime

# This service is called only by Bloom's server, never directly by browsers.
# No permissive browser CORS or interactive schema/docs are exposed.
app = FastAPI(title="Bloom Microbiome ML Service", version="1.0.0", docs_url=None, redoc_url=None, openapi_url=None)

@app.middleware("http")
async def authenticate_service(request, call_next):
    if request.url.path == "/api/ml" or request.url.path.startswith("/api/ml/"):
        expected = os.environ.get("ML_SERVICE_TOKEN", "")
        if len(expected.encode("utf-8")) < 32 or len(expected) > 512 or any(c.isspace() for c in expected):
            return JSONResponse(status_code=503, content={"detail": "Service authentication is not configured."}, headers={"Cache-Control": "no-store"})
        authorization = request.headers.get("authorization", "")
        supplied = authorization[7:] if authorization.startswith("Bearer ") else ""
        if not hmac.compare_digest(hashlib.sha256(supplied.encode("utf-8")).digest(), hashlib.sha256(expected.encode("utf-8")).digest()):
            return JSONResponse(status_code=401, content={"detail": "Service authentication required."}, headers={"Cache-Control": "no-store"})
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response

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
    confidence: Optional[float] = None
    model_version: str
    interpretation_status: str = "reported_composition_only"
    limitations: List[str] = []

@app.get("/")
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/ml/analyze", response_model=MicrobiomeAnalysisResponse)
async def analyze_microbiome(request: MicrobiomeAnalysisRequest):
    """Summarize supplied abundance data without inventing measured biology.

    Relative taxon percentages do not establish gene content/expression, metabolite
    concentrations, personal health effects, optimal ranges or supplement doses.
    Reviewed qualitative biology remains in Bloom's versioned evidence registry;
    the legacy Python prototypes are not a source of personal recommendations.
    """
    # The upload pipeline does not yet turn sequence files into abundance data.
    # Never substitute randomized demonstration profiles for a user's test.
    if not request.raw_data or not request.raw_data.get("bacteria_percentages"):
        raise HTTPException(
            status_code=422,
            detail="Analysis requires structured bacterial abundance percentages. Functional/pathway scores and organism detection are not abundance or measured metabolite concentrations. Uploaded sequence analysis is not implemented yet."
        )
    try:
        from .services.data_processor import DataProcessor
        DataProcessor()._validate_percentages(request.raw_data["bacteria_percentages"])
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    try:
        from .services.taxonomic_profiler import TaxonomicProfiler

        # Preserve exactly the supplied percentages and names. Do not add the
        # prototype profiler's invented optimal ranges, health scores or genes.
        bacterial_composition = [
            {
                "bacterial_name": name,
                "taxonomy_level": "reported_taxon_rank_unverified",
                "abundance": abundance,
                "provenance": "User-supplied relative percentage; not independently verified",
                "genome_data": {
                    "gene_count": None,
                    "metabolic_pathways": [],
                    "provenance": "No genes or pathway activity measured from these percentages",
                },
            }
            for name, abundance in request.raw_data["bacteria_percentages"].items()
        ]
        # This is a descriptive statistic over the supplied entries, not a
        # validated health score, reference interval or complete-sample profile.
        diversity_index = (TaxonomicProfiler().calculate_diversity(bacterial_composition)
                           if sum(item["abundance"] for item in bacterial_composition) > 0 else None)
        return MicrobiomeAnalysisResponse(
            sample_id=request.sample_id,
            status="completed",
            diversity_index=diversity_index,
            bacterial_composition=bacterial_composition,
            metabolites=[],
            health_impacts=[],
            cohort_comparisons={},
            recommendations=[],
            confidence=None,
            model_version="reported-abundance-v3",
            limitations=[
                "Only supplied taxon names and relative percentages are summarized; taxonomy, sequencing method and data completeness are not independently verified.",
                "Shannon diversity describes the supplied entries after normalizing their sum. A partial report is not a complete microbiome profile, and a higher value does not establish better health.",
                "Metabolite concentrations, gene content, pathway activity and personal health effects cannot be determined from these percentages; unavailable outputs are withheld rather than replaced with zero.",
                "No validated cohort reference dataset or calibrated prediction confidence is installed. Cohort comparisons, optimal bacterial ranges and confidence estimates are unavailable.",
                "No supplement dose or treatment is selected from bacterial abundance. Use Bloom's reviewed evidence coach and personal health context for food planning and discuss clinical needs with a qualified professional.",
            ],
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Analysis could not be completed.")

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
            "raw_data": result.get("raw_data"),
            "preview": result["preview"]
        }
        
    except (ValueError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Upload processing failed. Please check the file format or retry.")

@app.get("/api/ml/cohorts")
async def list_cohorts():
    """No cohort dataset with documented provenance is installed."""
    return {
        "cohorts": [],
        "status": "unavailable",
        "message": "Validated reference cohorts are not installed. No sample sizes, reference profiles or personal comparisons are available.",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
