"""Synthetic HTTP checks for the private ML service boundary."""
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from ml_service.main import app

TOKEN = "synthetic-service-authentication-token-123456"

class ServiceAuthenticationTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_missing_configuration_fails_closed(self):
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": ""}):
            for path in ["/api/ml/analyze", "/api/ml/upload", "/api/ml/cohorts"]:
                response = self.client.request("GET" if path.endswith("cohorts") else "POST", path)
                self.assertEqual(response.status_code, 503)
                self.assertEqual(response.headers["cache-control"], "no-store")

    def test_missing_or_wrong_authentication_is_rejected_before_parsing(self):
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": TOKEN}):
            for headers in [{}, {"Authorization": "Bearer wrong"}, {"Authorization": "Basic bad"}]:
                for path in ["/api/ml/analyze", "/api/ml/upload", "/api/ml/cohorts"]:
                    response = self.client.request("GET" if path.endswith("cohorts") else "POST", path, headers=headers, content=b"invalid body")
                    self.assertEqual(response.status_code, 401)
                    self.assertNotIn(TOKEN, response.text)

    def test_correct_token_reaches_handlers_without_exposing_browser_cors(self):
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": TOKEN}):
            headers = {"Authorization": "Bearer " + TOKEN, "Origin": "https://outside.example"}
            response = self.client.get("/api/ml/cohorts", headers=headers)
            self.assertEqual(response.status_code, 200)
            self.assertNotIn("access-control-allow-origin", response.headers)
            self.assertEqual(self.client.post("/api/ml/analyze", json={}, headers=headers).status_code, 422)

    def test_health_is_content_free_and_docs_are_disabled(self):
        self.assertEqual(self.client.get("/health").json(), {"status": "healthy"})
        for path in ["/docs", "/redoc", "/openapi.json"]:
            self.assertEqual(self.client.get(path).status_code, 404)
