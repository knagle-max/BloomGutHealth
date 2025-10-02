# Bloom ML Microservice Architecture

## Overview
The ML microservice is a Python FastAPI application that performs specialized microbiome analysis. It runs independently on port 8000 and is called by the Node.js backend via HTTP.

## Service Architecture

### Core Pipeline (5 Stages)

```
Raw Microbiome Data
       ↓
1. Taxonomic Profiling
   - Identifies bacterial species
   - Calculates abundance percentages
   - Computes Shannon diversity index
       ↓
2. Metabolite Prediction
   - Maps bacterial genes → metabolic pathways (KEGG/MetaCyc)
   - Predicts molecule production (Butyrate, Propionate, Acetate, etc.)
   - Estimates concentrations based on bacterial abundance
       ↓
3. Health Impact Analysis
   - Evaluates metabolite effects on human health
   - Uses biomedical knowledge base
   - Provides mechanistic explanations
       ↓
4. Cohort Comparison
   - Benchmarks against reference populations:
     * Elite Athletes (n=250)
     * Centenarians 90+ (n=180)
     * Mediterranean Diet (n=320)
     * General Population (n=1000)
   - Calculates similarity scores and gaps
       ↓
5. Recommendation Engine
   - Generates personalized dietary/lifestyle interventions
   - Targets specific bacteria and metabolites
   - Prioritizes by expected impact
```

## API Endpoints

### 1. Health Check
**GET /**
```json
{
  "service": "Bloom Microbiome ML Service",
  "version": "1.0.0",
  "status": "running"
}
```

**GET /health**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T08:00:00.000Z"
}
```

### 2. File Upload & Preprocessing
**POST /api/ml/upload**

**Request:** Multipart form with file (FASTQ/FASTA/CSV)

**Response:**
```json
{
  "status": "success",
  "file_path": "/tmp/uploads/abc123.fastq",
  "format": "fastq",
  "preview": { /* first 100 lines */ }
}
```

### 3. Full ML Analysis
**POST /api/ml/analyze**

**Request:**
```json
{
  "sample_id": "sample_123",
  "user_id": "user_456",
  "raw_data": { /* optional structured data */ },
  "file_path": "/tmp/uploads/abc123.fastq",
  "cohorts_to_compare": [
    "elite_athletes",
    "centenarians",
    "mediterranean_diet"
  ]
}
```

**Response:**
```json
{
  "sample_id": "sample_123",
  "status": "completed",
  "diversity_index": 3.45,
  "bacterial_composition": [
    {
      "bacterial_name": "Faecalibacterium prausnitzii",
      "abundance": 12.5,
      "optimal_range": [3, 15],
      "is_deficient": false,
      "is_excess": false,
      "health_score": 0.88,
      "genome_data": {
        "gene_count": 3200,
        "metabolic_pathways": ["butyrate_production", "anti_inflammatory"]
      }
    }
  ],
  "metabolites": [
    {
      "metabolite_name": "Butyrate (SCFA)",
      "pathway_id": "PWY-5022",
      "predicted_concentration": 4.2,
      "confidence": 0.85,
      "production_genes": ["butyryl-CoA_transferase", "butyrate_kinase"],
      "producing_bacteria": ["Faecalibacterium prausnitzii", "Roseburia"]
    }
  ],
  "health_impacts": [ /* ... */ ],
  "cohort_comparisons": {
    "elite_athletes": {
      "percentile": 72,
      "gaps": ["Low Akkermansia"]
    }
  },
  "recommendations": [ /* ... */ ],
  "confidence": 0.85,
  "model_version": "1.0.0"
}
```

### 4. List Available Cohorts
**GET /api/ml/cohorts**

**Response:**
```json
{
  "cohorts": [
    {
      "id": "elite_athletes",
      "name": "Elite Athletes",
      "sample_size": 250
    },
    {
      "id": "centenarians",
      "name": "Long-Living Individuals (90+)",
      "sample_size": 180
    },
    {
      "id": "general_population",
      "name": "General Healthy Population",
      "sample_size": 1000
    },
    {
      "id": "mediterranean_diet",
      "name": "Mediterranean Diet Followers",
      "sample_size": 320
    }
  ]
}
```

## Service Modules

### 0. DataProcessor (`services/data_processor.py`)
**Purpose:** Handle file uploads and preprocessing

**Methods:**
- `process_upload(file: UploadFile)` → File info with preview

**Supported Formats:**
- FASTQ/FASTA (.fastq, .fasta, .fa, .fq): Raw DNA sequencing data
- CSV (.csv): Pre-processed bacterial abundance data
- JSON (.json): Structured microbiome data

**Note:** Gzipped files (.gz) are accepted by the Node backend's multer configuration but not yet decompressed by DataProcessor. Future enhancement required for automatic gz handling.

**Processing Steps:**
1. Save uploaded file to `/tmp/microbiome_uploads/`
2. Detect file format from extension
3. Parse file based on format:
   - **FASTQ/FASTA**: Attempts BioPython SeqIO parsing (if available); returns error note if unavailable
   - **CSV**: Read first 5 rows with CSV DictReader
   - **JSON**: Load and preview structure with json.load()
4. Generate preview (first few records)
5. Return file path, format, and preview

**BioPython Dependency:**
BioPython is imported dynamically and wrapped in try/except. If not installed, FASTQ/FASTA files are saved successfully but preview generation fails gracefully with error message: "File uploaded successfully, processing may require additional tools".

**Preview Structure:**
```python
{
  "file_path": "/tmp/microbiome_uploads/sample.fastq",
  "format": "fastq",
  "preview": {
    "type": "sequence_data",
    "preview_sequences": [
      {"id": "READ001", "length": 150, "sequence": "ATCG..."},
      # ... up to 5 sequences
    ],
    "note": "Raw sequences will be processed for taxonomic profiling"
  }
}
```

**Current Limitation:**
The uploaded file is saved but not yet consumed by the analyze endpoint. The analyze endpoint currently operates on in-memory `raw_data` parameter or generates sample data. Full file-to-analysis integration is planned for future releases.

### 1. TaxonomicProfiler (`services/taxonomic_profiler.py`)
**Purpose:** Identify bacterial species and quantify abundance

**Methods:**
- `analyze(raw_data)` → Bacterial composition list
- `calculate_diversity(composition)` → Shannon diversity index

**Current Behavior:**
- If `raw_data` is empty → generates realistic sample profile
- If `raw_data["bacteria_percentages"]` provided → processes those percentages
- File path not yet consumed (future: will integrate FASTQ/FASTA parsing)

**Process:**
1. Parse DNA sequences (FASTQ/FASTA) or structured data
2. Align to reference genomes (in production: NCBI/QIIME2)
3. Identify species via 16S rRNA analysis
4. Calculate abundance percentages
5. Compare to optimal ranges
6. Identify metabolic pathways from genome

**Known Bacteria Database:**
- Akkermansia muciniphila (optimal: 1-4%, health score: 0.9)
  - Pathways: mucin_degradation, propionate_production
- Faecalibacterium prausnitzii (3-15%, score: 0.88)
  - Pathways: butyrate_production, anti_inflammatory
- Bifidobacterium (2-25%, score: 0.85)
  - Pathways: lactate_production, acetate_production
- Bacteroides (15-45%, score: 0.7)
  - Pathways: polysaccharide_degradation, propionate_production
- Lactobacillus (1-10%, score: 0.82)
  - Pathways: lactate_production, antimicrobial_production
- Roseburia (2-8%, score: 0.87)
  - Pathways: butyrate_production, fiber_fermentation
- Prevotella (5-30%, score: 0.65)
- Clostridium (1-15%, score: 0.5)

**Output Structure:**
```python
{
  "bacterial_name": "Faecalibacterium prausnitzii",
  "taxonomy_level": "species",
  "abundance": 12.5,  # percentage
  "optimal_range": [3, 15],
  "is_deficient": False,
  "is_excess": False,
  "health_score": 0.88,
  "genome_data": {
    "gene_count": 3200,
    "metabolic_pathways": ["butyrate_production", "anti_inflammatory"]
  }
}
```

### 2. MetabolitePredictor (`services/metabolite_predictor.py`)
**Purpose:** Predict molecular production from bacterial genes

**Methods:**
- `predict_metabolites(bacterial_composition)` → Metabolite list

**Gene→Metabolite Mappings (KEGG/MetaCyc Pathways):**
- `butyrate_production` → Butyrate (SCFA) [PWY-5022]
  - Genes: butyryl-CoA_transferase, butyrate_kinase
  - Category: short_chain_fatty_acid
- `propionate_production` → Propionate (SCFA) [PWY-7013]
  - Genes: methylmalonyl-CoA_mutase, propionyl-CoA
  - Category: short_chain_fatty_acid
- `acetate_production` → Acetate (SCFA) [PWY-5100]
  - Genes: acetate_kinase, phosphate_acetyltransferase
  - Category: short_chain_fatty_acid
- `lactate_production` → Lactate [PWY-4221]
  - Genes: lactate_dehydrogenase
  - Category: organic_acid
- `antimicrobial_production` → Bacteriocins [PWY-7124]
  - Genes: bacteriocin_synthesis
  - Category: antimicrobial_peptide
- `anti_inflammatory` → Anti-inflammatory compounds [PWY-8001]
  - Genes: anti_inflammatory_factor
  - Category: signaling_molecule

**Concentration Calculation:**
```python
base_concentration = random(0.5, 2.0)
concentration = base_concentration × (bacterial_abundance / 10.0)
confidence = min(0.95, 0.7 + (abundance / 100.0))
```

**Aggregation Logic:**
- Metabolites produced by multiple bacteria are summed
- Production genes are combined (set union)
- Producing bacteria are tracked
- Confidence is averaged across all producers

**Output Structure:**
```python
{
  "metabolite_name": "Butyrate (SCFA)",
  "pathway_id": "PWY-5022",
  "predicted_concentration": 4.2,  # arbitrary units
  "confidence": 0.85,
  "production_genes": ["butyryl-CoA_transferase", "butyrate_kinase"],
  "producing_bacteria": [
    "Faecalibacterium prausnitzii",
    "Roseburia"
  ],
  "category": "short_chain_fatty_acid"
}
```

### 3. HealthImpactAnalyzer (`services/health_impact_analyzer.py`)
**Purpose:** Evaluate how metabolites affect human health

**Methods:**
- `analyze_impacts(metabolites)` → Health impact list

**Knowledge Base:** Metabolite → Health Effects (from HMDB, PubChem, literature)

**Example Metabolite Profiles:**

**Butyrate (SCFA):**
- Strengthens intestinal barrier (score: 0.9, evidence: strong)
  - Systems: digestive, immune
  - Mechanism: Provides energy to colonocytes, regulates tight junction proteins
- Reduces inflammation and oxidative stress (score: 0.85, strong)
  - Systems: immune, cardiovascular
  - Mechanism: Inhibits NF-κB pathway and histone deacetylase
- Improves insulin sensitivity (score: 0.75, moderate)
  - Systems: metabolic, endocrine
  - Mechanism: Enhances gut hormone secretion (GLP-1, PYY)

**Propionate (SCFA):**
- Regulates glucose and cholesterol metabolism (score: 0.8, strong)
  - Systems: metabolic, cardiovascular
  - Mechanism: Modulates hepatic glucose production and lipid synthesis
- Enhances satiety and weight management (score: 0.7, moderate)
  - Systems: metabolic, nervous
  - Mechanism: Stimulates gut hormone release affecting appetite

**Acetate (SCFA):**
- Supports energy metabolism (score: 0.75, strong)
- Modulates immune function (score: 0.7, moderate)

**Impact Score Adjustment:**
```python
concentration_factor = min(1.0, concentration / 5.0)
adjusted_score = base_score × (0.5 + 0.5 × concentration_factor)
```
Higher concentrations → stronger health effects

**Output Structure:**
```python
{
  "metabolite_name": "Butyrate (SCFA)",
  "metabolite_id": "PWY-5022",
  "impact_category": "beneficial",
  "impact_description": "Strengthens intestinal barrier function",
  "impact_score": 0.82,  # adjusted for concentration
  "evidence_level": "strong",
  "affected_systems": ["digestive", "immune"],
  "mechanism_of_action": "Provides energy to colonocytes...",
  "concentration": 4.2,
  "confidence": 0.85
}
```

### 4. CohortComparator (`services/cohort_comparator.py`)
**Purpose:** Benchmark user's microbiome against reference populations

**Methods:**
- `compare(user_composition, cohort_ids)` → Cohort comparison dict

**Reference Cohorts:**

**Elite Athletes** (n=250)
- Typical bacteria: A. muciniphila 3.2%, F. prausnitzii 12.5%, Roseburia 6.8%
- Diversity index: 3.4
- Key metabolites: Butyrate, Propionate, Lactate
- Characteristics: Higher microbial diversity and SCFA production

**Centenarians** (n=180, age 90+)
- Typical bacteria: A. muciniphila 3.8%, Bifidobacterium 20%, F. prausnitzii 14%
- Diversity index: 3.2
- Key metabolites: Butyrate, Anti-inflammatory compounds
- Characteristics: Higher beneficial bacteria, anti-inflammatory profiles

**General Population** (n=1000)
- Typical bacteria: Bacteroides 28%, F. prausnitzii 8%, Bifidobacterium 12%
- Diversity index: 2.6
- Key metabolites: Acetate, Butyrate
- Characteristics: Baseline healthy microbiome profile

**Mediterranean Diet** (n=320)
- Typical bacteria: Prevotella 25%, Roseburia 7.5%, F. prausnitzii 11%
- Diversity index: 3.1
- Key metabolites: Butyrate, Propionate
- Characteristics: Fiber-fermenting bacteria, high SCFA production

**Comparison Process:**
1. Build user bacterial profile (name → abundance map)
2. Calculate Shannon diversity for user
3. For each cohort:
   - Calculate Bray-Curtis similarity score
   - Identify gaps (bacteria deficient by >1%)
   - Identify strengths (bacteria surplus by >1%)
   - Compare diversity indices
   - Generate recommendations

**Bray-Curtis Similarity:**
```python
numerator = Σ min(user_abundance, cohort_abundance)
denominator = Σ (user_abundance + cohort_abundance)
similarity = numerator / denominator
```

**Similarity Categories:**
- Very similar: ≥0.8
- Moderately similar: 0.6-0.8
- Somewhat different: 0.4-0.6
- Very different: <0.4

**Output Structure:**
```python
{
  "elite_athletes": {
    "cohort_name": "Elite Athletes",
    "sample_size": 250,
    "similarity_score": 0.72,
    "similarity_category": "moderately_similar",
    "diversity_comparison": {
      "user": 2.8,
      "cohort": 3.4,
      "difference": -0.6,
      "status": "lower"
    },
    "gaps": [
      {
        "bacteria": "Akkermansia muciniphila",
        "user_abundance": 1.5,
        "cohort_abundance": 3.2,
        "deficit": 1.7
      }
    ],
    "strengths": [],
    "key_characteristics": "Higher microbial diversity...",
    "recommendations": [
      "To align with Elite Athletes, focus on increasing: Akkermansia muciniphila"
    ]
  }
}
```

### 5. RecommendationEngine (`services/recommendation_engine.py`)
**Purpose:** Generate personalized dietary and lifestyle interventions

**Methods:**
- `generate_recommendations(bacterial_composition, metabolites, health_impacts, cohort_comparisons)` → Recommendation list

**Bacterial Booster Database:**

Each beneficial bacteria has targeted food/supplement recommendations:

**Akkermansia muciniphila:**
- Foods: Polyphenol-rich foods (berries, green tea), Fish oil (omega-3)
- Supplements: A. muciniphila probiotic (10^9 CFU daily)
- Rationale: Thrives on polyphenols, promoted by omega-3

**Faecalibacterium prausnitzii:**
- Foods: Resistant starch (green bananas, cooled potatoes), Inulin (chicory, Jerusalem artichoke)
- Avoid: Ultra-processed foods
- Rationale: Primary fuel is resistant starch and prebiotic fiber

**Bifidobacterium:**
- Foods: Fermented dairy (yogurt, kefir), GOS-rich (legumes)
- Supplements: B. longum or B. lactis (10 billion CFU)
- Rationale: GOS feeds Bifidobacteria, found naturally in fermented foods

**Roseburia:**
- Foods: Whole grains (oats, barley), Resistant starch
- Rationale: Beta-glucan fiber feeds butyrate producers

**Metabolite Optimization Strategies:**
- **Butyrate**: Target F. prausnitzii, Roseburia with high-fiber, resistant starch diet
- **Propionate**: Target Bacteroides, A. muciniphila with Mediterranean-style diverse plants

**Recommendation Generation Process:**
1. Identify deficient beneficial bacteria (health_score > 0.7)
2. For each deficient bacteria, add food/supplement recommendations
3. Identify low metabolite production (e.g., Butyrate < 3.0)
4. Add dietary pattern recommendations for metabolite boost
5. Check cohort diversity comparison
6. Add lifestyle recommendations if diversity is low
7. Sort by priority (1=highest) and expected impact
8. Return top 10 recommendations

**Priority Levels:**
- Priority 1: Food recommendations, dietary patterns (highest impact)
- Priority 2: Supplements, foods to limit (moderate impact)

**Output Structure:**
```python
{
  "type": "emphasize",  # or "limit", "supplement"
  "category": "food",   # or "dietary_pattern", "lifestyle", "probiotic"
  "item": "Resistant starch (green bananas, cooled potatoes)",
  "reasoning": "Primary fuel for F. prausnitzii",
  "details": "Include 15-20g resistant starch daily",
  "priority": 1,
  "expected_impact": 0.8,
  "target_bacteria": ["Faecalibacterium prausnitzii"],
  "target_metabolites": ["Butyrate (SCFA)"]
}
```

**Example Recommendations:**
1. High-fiber, resistant starch diet → Boost Butyrate
2. Polyphenol-rich foods (berries, green tea) → Increase A. muciniphila
3. Fermented dairy (yogurt, kefir) → Boost Bifidobacterium
4. Increase dietary diversity → Improve microbiome diversity
5. Mediterranean-style diet → Align with Mediterranean cohort

## Integration with Node Backend

### Communication Pattern
```typescript
// Node backend (server/routes.ts)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// 1. Upload file
const formData = new FormData();
formData.append("file", createReadStream(file.path));

const uploadResponse = await fetch(`${ML_SERVICE_URL}/api/ml/upload`, {
  method: "POST",
  body: formData,
});

// 2. Trigger analysis
const analysisResponse = await fetch(`${ML_SERVICE_URL}/api/ml/analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sample_id: "sample_123",
    user_id: userId,
    file_path: uploadResult.file_path,
    cohorts_to_compare: ["elite_athletes", "centenarians"],
  }),
});

// 3. Save results to PostgreSQL
await storage.insertBacterialComposition(results.bacterial_composition);
await storage.insertMetabolites(results.metabolites);
```

### Error Handling
- ML service unavailable → 503 Service Unavailable
- Analysis fails → 500 Internal Server Error (captured in try/catch)
- Invalid file format → 400 Bad Request

## Data Sources (Production)

### External Knowledge Bases
1. **KEGG (Kyoto Encyclopedia of Genes and Genomes)**
   - Metabolic pathway database
   - Gene→enzyme→metabolite mappings
   - API: https://www.genome.jp/kegg/rest/

2. **MetaCyc**
   - Metabolic pathway encyclopedia
   - 2,800+ pathways from 3,000+ organisms
   - API: https://biocyc.org/web-services.shtml

3. **NCBI Taxonomy**
   - Bacterial genome reference database
   - 16S rRNA sequences
   - API: https://www.ncbi.nlm.nih.gov/datasets/docs/

4. **Human Metabolome Database (HMDB)**
   - Metabolite health effects
   - Biomarker data
   - API: https://hmdb.ca/

### Cohort Reference Data
- Elite Athletes: Published microbiome studies (n=250)
- Centenarians: Longevity research datasets (n=180)
- Mediterranean Diet: Dietary intervention studies (n=320)
- General Population: Population-level surveys (n=1000)

## Running the ML Service

### Manual Start
```bash
cd ml_service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Using Startup Script
```bash
./start_ml_service.sh
```

### Dependencies
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.4.0
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
biopython>=1.81
python-multipart>=0.0.6
```

## Model Versioning

Current version: **1.0.0**

Each analysis response includes:
- `model_version`: ML pipeline version
- `confidence`: Overall analysis confidence (0-1)
- Individual confidence scores per metabolite prediction

## Future Enhancements

1. **Real DNA Sequence Processing**
   - Integrate QIIME2 for FASTQ/FASTA analysis
   - Implement MetaPhlAn for taxonomic profiling

2. **Live KEGG/MetaCyc Integration**
   - Real-time pathway queries
   - Updated metabolite mappings

3. **Machine Learning Models**
   - Train on large cohort datasets
   - Predict health outcomes from microbiome composition
   - Recommendation optimization via reinforcement learning

4. **Temporal Analysis**
   - Track microbiome changes over time
   - Measure intervention effectiveness
   - Predict future health trajectories

5. **Multi-omics Integration**
   - Metabolomics (actual measured metabolites)
   - Proteomics (protein expression)
   - Transcriptomics (gene expression)
