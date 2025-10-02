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
- **PostgreSQL** - Primary database with Drizzle ORM
- **Session Management** - Persistent sessions with connect-pg-simple
- **Authentication** - Bcrypt password hashing, session-based auth

#### ML Libraries
- NumPy, Pandas - Data processing
- scikit-learn - ML utilities
- BioPython - DNA sequence analysis

### API Endpoints

#### Demo Data (Explore Without Upload)
- `GET /api/demo/user` - Get demo user profile
- `GET /api/demo/samples` - Get demo microbiome samples

#### Microbiome Analysis
- `POST /api/microbiome/upload` - Upload test file (FASTQ/FASTA/CSV)
- `POST /api/microbiome/analyze/:sampleId` - Trigger ML analysis
- `GET /api/microbiome/results/:sampleId` - Get analysis results
- `GET /api/microbiome/cohorts` - List available cohort groups
- `GET /api/ml/health` - ML service health check

#### Authentication
- `POST /api/auth/signup` - Create new user account (username, password)
  - Validates unique username, password >= 8 chars
  - Uses bcrypt hashing with 10 salt rounds
  - Creates session automatically
- `POST /api/auth/login` - Authenticate user
  - Uses bcrypt.compare() for password verification
  - Creates persistent session
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current authenticated user

#### Nutrition Tracking (API Ninjas Integration)
- `POST /api/meals` - Analyze meal with natural language input (e.g., "2 eggs and oatmeal")
  - Returns: Comprehensive macro/micronutrient breakdown
  - Macros: calories, protein, carbs, fat
  - Micros: fiber, sugar, sodium, potassium, cholesterol

#### ML Service (Python - port 8000)
- `POST /api/ml/upload` - Process uploaded files
- `POST /api/ml/analyze` - Run full ML pipeline
- `GET /api/ml/cohorts` - Get cohort reference data

### Database Schema

**Core Tables:**
- `users` - User accounts with bcrypt-hashed passwords
- `session` - Persistent session storage (connect-pg-simple)
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
- **Demo Mode**: Fully functional without microbiome data upload
  - Pre-loaded sample analysis with bacterial composition
  - Metabolite predictions and health impacts
  - Cohort comparisons against elite athletes, centenarians, Mediterranean diet followers
  - Personalized recommendations
- **Natural Language Meal Tracking**: "2 eggs and oatmeal" → Complete nutritional breakdown
  - Macronutrients: Calories, protein, carbs, fat
  - Micronutrients: Fiber, sugar, sodium, potassium, cholesterol
  - Powered by API Ninjas (API_NINJAS_KEY required)
- Mobile-first responsive design (448px container)
- Animated gut health score visualization
- Symptom correlation tracking
- Microbiome test upload with multiple format support
- Custom ML pipeline with explainability
- Cohort benchmarking
- Personalized dietary recommendations

## Recent Changes (October 2, 2025)

### Demo Data System
- Implemented comprehensive demo microbiome analysis in MemStorage
- Demo user with pre-analyzed sample showing:
  - 4 bacterial species with abundance data (F. prausnitzii, A. muciniphila, etc.)
  - 3 metabolites with predicted concentrations (Butyrate, Propionate, Acetate)
  - Cohort percentiles: Elite Athletes (72%), Centenarians (76%), Mediterranean (80%)
  - 3 personalized recommendations with scientific rationale
- Users can explore full app functionality immediately without data upload

### Nutrition Tracking Integration
- Added API Ninjas integration for natural language food parsing
- Real-time nutritional analysis with comprehensive breakdown
- Displays macros and micronutrients like Cronometer
- Symptom correlation tracking (bloating, energy, comfort, mood)
- Frontend successfully fetches and displays all demo and nutrition data

### Meal History & Progress Tracking (October 2, 2025)
- **PostgreSQL Database Migration**: User profiles with demographics (sex, age, height, weight, activity level)
- **Personalized Nutrient Targets**: BMR/TDEE calculations using Mifflin-St Jeor equations
  - Calculates daily calorie needs based on activity level
  - Protein targets (1.6g/kg bodyweight)
  - Macro distribution (45% carbs, 30% fat)
  - Micronutrient RDAs (fiber, sodium, potassium, etc.)
- **Nutrition History Page** (`/nutrition`):
  - Daily summary with progress bars for all macronutrients
  - Visual comparison of actual intake vs personalized targets
  - Color-coded progress indicators (excellent: 90-110%, good: 70-130%)
  - Recent meals list with nutritional badges
  - Micronutrient tracking (fiber, sugar, sodium, potassium, cholesterol)
- **Smart Error Handling**: Validates API responses to prevent invalid data storage
- **Real-time Updates**: Cache invalidation ensures nutrition data stays fresh

### Authentication & Authorization (October 2, 2025)
- **Endpoint Protection**: All data endpoints now require authentication via `requireAuth` middleware
- **Ownership Verification**: Endpoints verify user owns requested resources (403 if unauthorized)
- **Session-based Security**: Uses `req.session.userId` instead of trusting request parameters
- **Test Coverage**: Comprehensive tests verify 401 for unauthenticated, 200 for own data, 403 for others' data
- **Protected Resources**: Microbiome data, meals, nutrition targets, health analysis, adherence tracking
- **Public Endpoints**: Demo data and cohort references remain accessible without authentication
- **Frontend Integration**: Login/Signup use auth context for consistent state management

### Earlier Changes (October 2025)
- Replaced OpenAI/ChatGPT with custom ML pipeline
- Implemented gene → metabolite → health impact inference
- Added cohort comparison against elite athletes and centenarians
- Built recommendation engine for microbiome optimization
- Created comprehensive data schema for ML pipeline
