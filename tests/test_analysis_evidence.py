"""Personal numerical effects must never be invented from relative abundance."""
import json
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from ml_service.main import app, analyze_microbiome, MicrobiomeAnalysisRequest, list_cohorts


class AnalysisEvidenceTest(unittest.IsolatedAsyncioTestCase):
    async def test_abundance_keeps_reported_data_without_personal_effects_or_doses(self):
        percentages = {"Akkermansia muciniphila": 0.1, "Bifidobacterium": 0.2, "Faecalibacterium prausnitzii": 0.3, "Unverified genus": 15.0}
        request = MicrobiomeAnalysisRequest(sample_id="synthetic-sample", user_id="synthetic-user", raw_data={"bacteria_percentages": percentages}, cohorts_to_compare=["elite_athletes", "centenarians"])
        result = await analyze_microbiome(request)
        self.assertEqual({b["bacterial_name"]: b["abundance"] for b in result.bacterial_composition}, percentages)
        self.assertEqual(result.metabolites, [])
        self.assertEqual(result.health_impacts, [])
        self.assertEqual(result.recommendations, [])
        self.assertEqual(result.cohort_comparisons, {})
        self.assertIsNone(result.confidence)
        self.assertEqual(result.interpretation_status, "reported_composition_only")
        self.assertTrue(result.limitations)
        for item in result.bacterial_composition:
            for unsupported in ["optimal_range", "health_score", "is_deficient", "is_excess"]:
                self.assertNotIn(unsupported, item)
            self.assertIsNone(item["genome_data"]["gene_count"])
            self.assertEqual(item["genome_data"]["metabolic_pathways"], [])
        # A descriptive statistic is retained, but is explicitly not a health score.
        self.assertIsInstance(result.diversity_index, float)
        self.assertTrue(any("higher value does not establish better health" in note for note in result.limitations))

    async def test_unsupported_predictor_services_are_not_invoked(self):
        request = MicrobiomeAnalysisRequest(sample_id="s", user_id="u", raw_data={"bacteria_percentages": {"Roseburia": 3.2}})
        with patch("ml_service.services.metabolite_predictor.MetabolitePredictor.predict_metabolites", side_effect=AssertionError("Unvalidated predictor invoked")), patch("ml_service.services.health_impact_analyzer.HealthImpactAnalyzer.analyze_impacts", side_effect=AssertionError("Unvalidated health effects invoked")), patch("ml_service.services.recommendation_engine.RecommendationEngine.generate_recommendations", side_effect=AssertionError("Unsupported doses invoked")), patch("ml_service.services.cohort_comparator.CohortComparator.compare", side_effect=AssertionError("Unvalidated reference invoked")):
            result = await analyze_microbiome(request)
            self.assertEqual(result.metabolites, [])
            self.assertEqual(result.health_impacts, [])
            self.assertEqual(result.recommendations, [])

    async def test_cohort_catalogue_does_not_publish_fabricated_sample_sizes(self):
        result = await list_cohorts()
        self.assertEqual(result["cohorts"], [])
        self.assertEqual(result["status"], "unavailable")
        self.assertNotIn("sample_size", json.dumps(result))

    async def test_authenticated_http_response_withholds_unvalidated_outputs(self):
        token = "synthetic-ml-boundary-token-long-enough-123456789"
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": token}):
            response = TestClient(app).post("/api/ml/analyze", headers={"Authorization": "Bearer " + token}, json={"sample_id": "synthetic", "user_id": "synthetic", "raw_data": {"bacteria_percentages": {"Roseburia": 3.2}}})
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(response.headers["cache-control"], "no-store")
        for key in ["metabolites", "health_impacts", "recommendations"]:
            self.assertEqual(result[key], [])
        self.assertIsNone(result["confidence"])
        self.assertNotIn("predicted_concentration", response.text)
        self.assertNotIn("impact_score", response.text)
        self.assertNotIn("10 billion CFU", response.text)

    async def test_all_zero_report_does_not_become_zero_diversity_or_zero_metabolites(self):
        request = MicrobiomeAnalysisRequest(sample_id="s", user_id="u", raw_data={"bacteria_percentages": {"Roseburia": 0}})
        result = await analyze_microbiome(request)
        self.assertIsNone(result.diversity_index)
        self.assertEqual(result.metabolites, [])
        self.assertIsNone(result.confidence)
