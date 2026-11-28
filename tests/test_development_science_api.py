"""ASGI-only dual authentication/replay tests; no network ports or private data."""
import hashlib
import importlib.util
import json
import time
import unittest
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from ml_service.main import authenticate_service
from ml_service.research.development_admission import AdmissionDenied, DevelopmentAdmission, PREFIX
from ml_service.research.development_policy import DevelopmentScienceUnavailable
from ml_service.research.development_routes import install_development_routes
from ml_service.research.micom_reference import VERSION

ML_TOKEN = "synthetic-existing-ml-service-token-12345678"
DEV_TOKEN = "synthetic-independent-development-token-12345678"
ROTATED = "synthetic-rotated-development-token-123456789"
ENV = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true",
       "BLOOM_DEV_SCIENCE_TOKEN": DEV_TOKEN, "ML_SERVICE_TOKEN": ML_TOKEN}
HEADERS = {"Authorization": "Bearer " + ML_TOKEN,
           "X-Bloom-Science-Authorization": "Bearer " + DEV_TOKEN}
BODY = json.dumps({"version": VERSION, "scenario": "baseline"}, separators=(",", ":")).encode()
JOB_ID = "12345678-1234-4123-8123-123456789012"


class FixedJobs:
    def __init__(self):
        self.submissions = 0
        self.cancelled = False

    def submit(self, command, env):
        self.submissions += 1
        return JOB_ID

    def status(self, job_id, env):
        if job_id != JOB_ID:
            raise KeyError()
        return {"id": JOB_ID, "state": "completed", "result": {"scope": "synthetic"}}

    def cancel(self, job_id, env):
        self.status(job_id, env)
        self.cancelled = True

    def close(self):
        pass


class DevelopmentApiTests(unittest.TestCase):
    def setUp(self):
        self.environment = dict(ENV)
        self.jobs = FixedJobs()
        self.app = FastAPI()
        self.app.middleware("http")(authenticate_service)
        install_development_routes(self.app, self.environment, self.jobs)
        self.client = TestClient(self.app)
        self.ml_environment = patch.dict("os.environ", {"ML_SERVICE_TOKEN": ML_TOKEN})
        self.ml_environment.start()
        self.addCleanup(self.ml_environment.stop)
        self.addCleanup(self.client.close)

    def nonce(self, method="POST", path=PREFIX + "/jobs", body=BODY, headers=None):
        response = self.client.post(PREFIX + "/challenge", headers=headers or HEADERS,
                                    json={"method": method, "path": path,
                                          "bodySha256": hashlib.sha256(body).hexdigest()})
        self.assertEqual(response.status_code, 200)
        return response.json()["nonce"]

    def send(self, nonce, body=BODY, headers=None):
        return self.client.post(PREFIX + "/jobs", content=body,
                                headers={**(headers or HEADERS), "Content-Type": "application/json",
                                         "X-Bloom-Science-Nonce": nonce})

    def test_both_independent_credentials_required_before_body_parsing(self):
        for headers in ({}, {"Authorization": "Bearer " + ML_TOKEN},
                        {**HEADERS, "Authorization": "Bearer invalid"},
                        {**HEADERS, "X-Bloom-Science-Authorization": "Bearer invalid"}):
            response = self.client.post(PREFIX + "/jobs", content=b"synthetic rejected text", headers=headers)
            self.assertEqual(response.status_code, 401)
            self.assertNotIn("rejected text", response.text)
        self.assertEqual(self.jobs.submissions, 0)

    def test_one_use_challenge_accepts_once_and_rejects_replay(self):
        nonce = self.nonce()
        response = self.send(nonce)
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertEqual(self.send(nonce).status_code, 409)
        self.assertEqual(self.jobs.submissions, 1)

    def test_nonce_binds_exact_body_path_method_and_identity(self):
        nonce = self.nonce()
        self.assertEqual(self.send(nonce, BODY + b" ").status_code, 409)
        self.assertEqual(self.send(nonce).status_code, 409)
        nonce = self.nonce("GET", PREFIX + "/jobs/" + JOB_ID, b"")
        self.assertEqual(self.send(nonce).status_code, 409)
        nonce = self.nonce()
        self.environment["BLOOM_DEV_SCIENCE_TOKEN"] = ROTATED
        self.assertEqual(self.send(nonce).status_code, 401)
        self.assertEqual(self.send(nonce, headers={**HEADERS,
                         "X-Bloom-Science-Authorization": "Bearer " + ROTATED}).status_code, 409)
        self.assertEqual(self.jobs.submissions, 0)

    def test_status_and_cancel_require_fresh_bound_challenges(self):
        path = PREFIX + "/jobs/" + JOB_ID
        for method in ("GET", "DELETE"):
            nonce = self.nonce(method, path, b"")
            headers = {**HEADERS, "X-Bloom-Science-Nonce": nonce}
            response = self.client.request(method, path, headers=headers)
            self.assertEqual(response.status_code, 200 if method == "GET" else 202)
            self.assertEqual(self.client.request(method, path, headers=headers).status_code, 409)
        self.assertTrue(self.jobs.cancelled)

    def test_personal_fields_code_duplicates_unknown_models_and_bad_json_rejected(self):
        for body in (b'{"version":"wrong","scenario":"baseline"}', b"not-json",
                     b'{"version":"micom-reference-control-v1","scenario":"baseline","user_id":"synthetic"}',
                     b'{"version":"micom-reference-control-v1","scenario":"baseline","python":"unsafe"}',
                     b'{"version":"wrong","version":"micom-reference-control-v1","scenario":"baseline"}',
                     b'{"version":NaN,"scenario":"baseline"}'):
            nonce = self.nonce(body=body)
            response = self.send(nonce, body)
            self.assertEqual(response.status_code, 422)
            self.assertNotIn("unsafe", response.text)
        self.assertEqual(self.jobs.submissions, 0)

    def test_oversize_content_type_query_and_disabled_gate(self):
        self.assertEqual(self.send(self.nonce(), b"x" * 1025).status_code, 413)
        self.assertEqual(self.client.post(PREFIX + "/jobs", content=BODY, headers=HEADERS).status_code, 415)
        self.assertEqual(self.client.post(PREFIX + "/jobs?anything=synthetic", headers=HEADERS).status_code, 400)
        self.environment["NODE_ENV"] = "production"
        self.assertEqual(self.send("0" * 64).status_code, 503)
        self.assertEqual(self.jobs.submissions, 0)

    def test_installation_requires_explicit_dev_and_distinct_auth_and_no_duplicates(self):
        for env in ({}, {**ENV, "NODE_ENV": "production"}, {**ENV, "ML_SERVICE_TOKEN": ""},
                    {**ENV, "BLOOM_DEV_SCIENCE_TOKEN": ML_TOKEN}):
            app = FastAPI()
            with self.assertRaises(DevelopmentScienceUnavailable):
                install_development_routes(app, env, self.jobs)
            self.assertFalse(any(PREFIX in route.path for route in app.routes))
        with self.assertRaises(DevelopmentScienceUnavailable):
            install_development_routes(self.app, self.environment, self.jobs)

    def test_normal_production_entry_point_has_no_development_routes(self):
        from ml_service.main import app
        self.assertFalse(any(PREFIX in route.path for route in app.routes))

    def test_lifespan_keeps_existing_startup_and_closes_supervisor(self):
        events = []
        from contextlib import asynccontextmanager

        @asynccontextmanager
        async def previous(app):
            events.append("existing-start")
            yield
            events.append("existing-stop")

        app = FastAPI(lifespan=previous)
        jobs = FixedJobs()
        jobs.close = lambda: events.append("jobs-stop")
        install_development_routes(app, self.environment, jobs)
        with TestClient(app):
            self.assertEqual(events, ["existing-start"])
        self.assertEqual(events, ["existing-start", "existing-stop", "jobs-stop"])

    @unittest.skipUnless(importlib.util.find_spec("micom"), "Isolated science environment required")
    def test_actual_authenticated_asgi_request_to_micom_and_result(self):
        app = FastAPI()
        app.middleware("http")(authenticate_service)
        install_development_routes(app, self.environment)
        with TestClient(app) as client:
            def request(method, path, body=b""):
                challenge = client.post(PREFIX + "/challenge", headers=HEADERS,
                                        json={"method": method, "path": path,
                                              "bodySha256": hashlib.sha256(body).hexdigest()})
                self.assertEqual(challenge.status_code, 200)
                return client.request(method, path, content=body,
                                      headers={**HEADERS, "Content-Type": "application/json",
                                               "X-Bloom-Science-Nonce": challenge.json()["nonce"]})

            submitted = request("POST", PREFIX + "/jobs", BODY)
            self.assertEqual(submitted.status_code, 202)
            path = PREFIX + "/jobs/" + submitted.json()["id"]
            terminal = None
            for _ in range(20):
                time.sleep(0.25)
                response = request("GET", path)
                self.assertEqual(response.status_code, 200)
                if response.json()["state"] not in {"running", "cancelling"}:
                    terminal = response.json()
                    break
            self.assertIsNotNone(terminal)
            self.assertEqual(terminal["state"], "completed")
            self.assertEqual(terminal["result"]["status"], "optimal")
            self.assertFalse(terminal["result"]["observedBiology"])
            self.assertFalse(terminal["result"]["predictiveValidation"])


class DevelopmentChallengeTests(unittest.TestCase):
    def test_expiry_capacity_rate_and_restart_fail_closed(self):
        admission = DevelopmentAdmission()
        identity = admission.authenticate("Bearer " + DEV_TOKEN, DEV_TOKEN)
        with patch("ml_service.research.development_admission.time.monotonic", return_value=100):
            nonce = admission.challenge(identity, "POST", PREFIX + "/jobs", hashlib.sha256(BODY).hexdigest())
        with patch("ml_service.research.development_admission.time.monotonic", return_value=161):
            with self.assertRaises(AdmissionDenied):
                admission.consume(nonce, identity, "POST", PREFIX + "/jobs", BODY)
        with self.assertRaises(AdmissionDenied):
            DevelopmentAdmission().consume(nonce, identity, "POST", PREFIX + "/jobs", BODY)
        for _ in range(32):
            admission.challenge(identity, "POST", PREFIX + "/jobs", hashlib.sha256(BODY).hexdigest())
        with self.assertRaises(AdmissionDenied):
            admission.challenge(identity, "POST", PREFIX + "/jobs", hashlib.sha256(BODY).hexdigest())
        for _ in range(59):
            admission.authenticate("Bearer " + DEV_TOKEN, DEV_TOKEN)
        with self.assertRaises(AdmissionDenied):
            admission.authenticate("Bearer " + DEV_TOKEN, DEV_TOKEN)
