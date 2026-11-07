"""Actual private HTTP admission and CPU synthetic solver; no private records."""
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from ml_service.main import app, _synthetic_slots

TOKEN = "synthetic-private-research-token-1234567890"
PATH = "/api/ml/research/synthetic"
HEADERS = {"Authorization": "Bearer " + TOKEN}


class SyntheticResearchServiceTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_authentication_precedes_parsing_and_never_echoes_source_input(self):
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": ""}):
            self.assertEqual(self.client.post(PATH, content=b"bad").status_code, 503)
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": TOKEN}):
            response = self.client.post(PATH, content=b"synthetic secret source text")
            self.assertEqual(response.status_code, 401)
            self.assertNotIn("secret source", response.text)
            self.assertEqual(response.headers["cache-control"], "no-store")

    def test_fixed_scenarios_execute_real_solver_with_null_vs_zero_and_signed_exchange(self):
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": TOKEN}):
            for scenario, expected in [("crossfeed-default", "6"), ("substrate-absent", "0"), ("consumption-exceeds-supply", None), ("uptake-reversal", "-3")]:
                response = self.client.post(PATH, headers=HEADERS, json={"version": "synthetic-molecular-v1", "scenario": scenario})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["cache-control"], "no-store")
                data = response.json()
                self.assertEqual(data["objective"], expected)
                self.assertEqual(data["status"], "infeasible" if expected is None else "optimal")
                self.assertEqual(data["unit"], "synthetic-flux-unit")
                self.assertFalse(data["personalPrediction"])
                self.assertFalse(data["applyToUser"])
                self.assertEqual(data["scope"], "synthetic")
                self.assertEqual(len(data["requestHash"]), 64)
                self.assertNotIn("access-control-allow-origin", response.headers)

    def test_personal_fields_arbitrary_models_and_oversized_streams_are_rejected_before_compute(self):
        command = {"version": "synthetic-molecular-v1", "scenario": "crossfeed-default"}
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": TOKEN}), patch("ml_service.research.synthetic_service.execute_synthetic", side_effect=AssertionError("Must not compute")):
            for extra in [{"user_id": "other"}, {"taxa": {"Private taxon": 10}}, {"food": "private meal"}, {"scenario": "arbitrary-model"}, {"version": "stale"}]:
                response = self.client.post(PATH, headers=HEADERS, json={**command, **extra})
                self.assertEqual(response.status_code, 422)
                self.assertNotIn("Private taxon", response.text)
                self.assertNotIn("private meal", response.text)
            response = self.client.post(PATH, headers={**HEADERS, "Content-Type": "application/json"}, content=b"x" * 513)
            self.assertEqual(response.status_code, 413)
            self.assertEqual(self.client.post(PATH, headers=HEADERS, content=b"bad").status_code, 415)

    def test_busy_worker_returns_safe_failure_and_releases_slot_after_completion(self):
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": TOKEN}):
            command = {"version": "synthetic-molecular-v1", "scenario": "crossfeed-default"}
            self.assertTrue(_synthetic_slots.acquire(blocking=False))
            try:
                self.assertEqual(self.client.post(PATH, headers=HEADERS, json=command).status_code, 503)
            finally:
                _synthetic_slots.release()
            self.assertEqual(self.client.post(PATH, headers=HEADERS, json=command).status_code, 200)
