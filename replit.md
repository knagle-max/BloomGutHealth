# Bloom - Gut Health Microbiome Analysis Platform

## Project Overview
Bloom is a comprehensive gut health application that analyzes microbiome data using a **custom machine learning pipeline** (not ChatGPT) to provide personalized health insights and recommendations.

## Custom ML System Architecture

### Core ML Pipeline
The ML system is built as a Python microservice that performs specialized microbiome analysis:

1. **Taxonomic Profiling** (`ml_service/services/taxonomic_profiler.py`)
   - Analyzes bacterial DNA composition from test data
   - Identifies bacterial species and their abundance
   - Calculates Shannon diversity index for microbiome health

2. **Metabolite Prediction** (`ml_service/services/metabolite_predictor.py`)
   - Maps bacterial genes to metabolic pathways (KEGG/MetaCyc)
   - Predicts molecular production based on genetic data
   - Estimates metabolite concentrations (SCFAs, organic acids, etc.)

3. **Health Impact Analysis** (`ml_service/services/health_impact_analyzer.py`)
   - Evaluates how metabolites affect the human body
   - Uses biomedical knowledge base for impact inference
   - Provides mechanistic explanations for health effects

4. **Cohort Comparison** (`ml_service/services/cohort_comparator.py`)
   - Benchmarks user microbiome against reference populations:
     - Elite athletes
     - Long-living individuals (centenarians)
     - Mediterranean diet followers
     - General healthy population
   - Calculates similarity scores and identifies gaps

5. **Recommendation Engine** (`ml_service/services/recommendation_engine.py`)
   - Generates personalized dietary and lifestyle recommendations
   - Targets specific bacteria and metabolites for optimization
   - Prioritizes interventions by expected impact

### Data Flow
```
User Upload → Node Backend → Python ML Service
                ↓
    [Taxonomic Profiling]
                ↓
    [Gene-to-Metabolite Mapping]
                ↓
    [Health Impact Inference]
                ↓
    [Cohort Comparison]
                ↓
    [Recommendation Generation]
                ↓
    Results Saved to Database
                ↓
    Display in Frontend
```

### Technology Stack

#### Frontend
- React + TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components
- Mobile-first design (448px max-width)

#### Backend
- **Node.js/Express** - API gateway and data persistence
- **Python FastAPI** - ML microservice (port 8000)
- **In-memory storage** - Development data layer

#### ML Libraries
- NumPy, Pandas - Data processing
- scikit-learn - ML utilities
- BioPython - DNA sequence analysis

### API Endpoints

#### Microbiome Analysis
- `POST /api/microbiome/upload` - Upload test file (FASTQ/FASTA/CSV)
- `POST /api/microbiome/analyze/:sampleId` - Trigger ML analysis
- `GET /api/microbiome/results/:sampleId` - Get analysis results
- `GET /api/microbiome/cohorts` - List available cohort groups
- `GET /api/ml/health` - ML service health check

#### ML Service (Python - port 8000)
- `POST /api/ml/upload` - Process uploaded files
- `POST /api/ml/analyze` - Run full ML pipeline
- `GET /api/ml/cohorts` - Get cohort reference data

### Database Schema

**Core Tables:**
- `microbiome_samples` - Test uploads and processing status
- `bacterial_composition` - Species data with genome info
- `metabolites` - Predicted molecules with production genes
- `health_impacts` - Metabolite effects on body
- `cohort_references` - Reference population data
- `ml_analyses` - ML model results with explainability
- `recommendations` - Personalized suggestions

### Design System
- **Primary Color**: Teal-green (165 70% 40%)
- **Typography**: Inter (body), Poppins (headings)
- **Health Status Colors**:
  - Excellent: 142 70% 45% (green)
  - Good: 45 95% 50% (yellow-green)
  - Needs Attention: 0 70% 50% (red)

## Development

### Running the Application
1. Start Node backend: `npm run dev` (auto-starts)
2. Start ML service: `./start_ml_service.sh` (manual)

### Key Features
- Mobile-first responsive design
- Animated gut health score visualization
- Meal and symptom tracking
- Microbiome test upload with multiple format support
- AI-powered insights with explainability
- Cohort benchmarking
- Personalized dietary recommendations

## Recent Changes (October 2025)
- Replaced OpenAI/ChatGPT with custom ML pipeline
- Implemented gene → metabolite → health impact inference
- Added cohort comparison against elite athletes and centenarians
- Built recommendation engine for microbiome optimization
- Created comprehensive data schema for ML pipeline
