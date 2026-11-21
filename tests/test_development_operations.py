"""Private temporary synthetic config and ASGI/mocked serving only; no listeners."""
import contextlib
import importlib.metadata
import io
import json
import os
import subprocess
import sys
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from ml_service.main import authenticate_service
from ml_service.research.development_credentials import (
    CredentialsUnavailable, read_credentials, write_credentials, install_credential_guard,
)
from ml_service.research.development_routes import install_development_routes
from ml_service.research.development_admission import PREFIX
from ml_service.development_service import main

DEV = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true"}


class Jobs:
    closed = False
    def close(self):
        self.closed = True


class OperationsTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.base = Path(self.directory.name).resolve()
        self.path = self.base / "credentials.json"
        write_credentials(self.path)

    def app(self, data):
        app = FastAPI()
        app.middleware("http")(authenticate_service)
        env = {**DEV, "ML_SERVICE_TOKEN": data["mlToken"], "BLOOM_DEV_SCIENCE_TOKEN": data["scienceToken"]}
        jobs = Jobs()
        install_development_routes(app, env, jobs)
        install_credential_guard(app, self.path)
        return app, jobs

    def test_private_file_safety_expiry_and_no_overwrite(self):
        data = read_credentials(self.path)
        self.assertNotEqual(data["mlToken"], data["scienceToken"])
        with self.assertRaises(CredentialsUnavailable):
            write_credentials(self.path)
        with self.assertRaises(CredentialsUnavailable):
            read_credentials(self.path, now=data["expiresAt"])
        self.path.chmod(0o644)
        with self.assertRaises(CredentialsUnavailable):
            read_credentials(self.path)
        self.path.chmod(0o600)
        linked = self.base / "linked.json"
        linked.symlink_to(self.path)
        with self.assertRaises(CredentialsUnavailable):
            read_credentials(linked)
        with self.assertRaises(CredentialsUnavailable):
            read_credentials(Path.cwd() / "local-credentials.json")
        self.path.write_text('{"version":"x","version":"y"}')
        with self.assertRaises(CredentialsUnavailable):
            read_credentials(self.path)

    def test_real_development_factory_is_scoped_in_a_fresh_interpreter_without_ports(self):
        data = read_credentials(self.path)
        code = '''
from fastapi.testclient import TestClient
from ml_service.development import create_app
from ml_service.research.development_admission import PREFIX
import os
with TestClient(create_app()) as client:
 assert client.post("/api/ml/analyze",json={}).status_code == 404
 headers={"Authorization":"Bearer "+os.environ["ML_SERVICE_TOKEN"],"X-Bloom-Science-Authorization":"Bearer "+os.environ["BLOOM_DEV_SCIENCE_TOKEN"]}
 query={"method":"GET","path":PREFIX+"/jobs/12345678-1234-4123-8123-123456789012","bodySha256":"a"*64}
 assert client.post(PREFIX+"/challenge",json=query,headers=headers).status_code == 200
'''
        result = subprocess.run([sys.executable, "-c", code], capture_output=True, timeout=20,
                                cwd=Path(__file__).resolve().parents[1], env={**os.environ, **DEV,
                                "ML_SERVICE_TOKEN": data["mlToken"], "BLOOM_DEV_SCIENCE_TOKEN": data["scienceToken"],
                                "BLOOM_DEV_CREDENTIAL_FILE": str(self.path)})
        self.assertEqual(result.returncode, 0, "Fresh ASGI factory scope/credentials check failed")

    def test_rotation_revocation_and_old_file_rollback_require_restart(self):
        old = read_credentials(self.path)
        env = {**DEV, "ML_SERVICE_TOKEN": old["mlToken"], "BLOOM_DEV_SCIENCE_TOKEN": old["scienceToken"]}
        query = {"method": "GET", "path": PREFIX + "/jobs/12345678-1234-4123-8123-123456789012", "bodySha256": "a" * 64}
        headers = {"Authorization": "Bearer " + old["mlToken"], "X-Bloom-Science-Authorization": "Bearer " + old["scienceToken"]}
        with patch.dict(os.environ, env):
            app, jobs = self.app(old)
            with TestClient(app) as client:
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers=headers).status_code, 200)
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers={**headers, "Authorization": "Bearer wrong"}).status_code, 401)
                self.assertEqual(client.post("/api/ml/analyze", json={}).status_code, 404)
                write_credentials(self.path, rotate=True)
                rotated = read_credentials(self.path)
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers=headers).status_code, 503)
                self.assertTrue(jobs.closed)
                self.path.write_text(json.dumps(old))
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers=headers).status_code, 503)
        self.path.write_text(json.dumps(rotated))
        env.update(ML_SERVICE_TOKEN=rotated["mlToken"], BLOOM_DEV_SCIENCE_TOKEN=rotated["scienceToken"])
        with patch.dict(os.environ, env):
            app, _ = self.app(rotated)
            with TestClient(app) as client:
                fresh = {"Authorization": "Bearer " + rotated["mlToken"], "X-Bloom-Science-Authorization": "Bearer " + rotated["scienceToken"]}
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers=fresh).status_code, 200)
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers=headers).status_code, 401)
                write_credentials(self.path, revoke=True)
                self.assertEqual(client.post(PREFIX + "/challenge", json=query, headers=fresh).status_code, 503)

    def test_config_environment_mismatch_refuses_startup(self):
        data = read_credentials(self.path)
        with patch.dict(os.environ, {**DEV, "ML_SERVICE_TOKEN": "synthetic-wrong-startup-token-123456789"}):
            with self.assertRaises(CredentialsUnavailable):
                self.app(data)

    def test_expiry_during_request_withholds_response_and_stops_jobs(self):
        data = read_credentials(self.path)
        with patch.dict(os.environ, {**DEV, "ML_SERVICE_TOKEN": data["mlToken"], "BLOOM_DEV_SCIENCE_TOKEN": data["scienceToken"]}):
            app, jobs = self.app(data)
            @app.get(PREFIX + "/synthetic-probe")
            async def probe():
                expired = {**data, "expiresAt": 0}
                self.path.write_text(json.dumps(expired))
                return {"syntheticMustNotBeReleased": True}
            with TestClient(app) as client:
                response = client.get(PREFIX + "/synthetic-probe", headers={"Authorization": "Bearer " + data["mlToken"]})
                self.assertEqual(response.status_code, 503)
                self.assertNotIn("syntheticMustNotBeReleased", response.text)
                self.assertTrue(jobs.closed)

    def test_check_is_offline_and_serve_is_fixed_loopback_without_binding(self):
        import uvicorn
        metadata_version = importlib.metadata.version
        def version(name):
            return "0.54.0" if name == "uvicorn" else metadata_version(name)
        with patch.dict(os.environ, DEV), patch("importlib.metadata.version", version), \
             patch.object(uvicorn.Server, "run") as run, contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main(["check", "--config", str(self.path)]), 0)
            run.assert_not_called()
            with self.assertRaises(SystemExit), contextlib.redirect_stderr(io.StringIO()):
                main(["serve", "--config", str(self.path)])
            run.assert_not_called()
            # Reuse factory boundary without changing main.py's global app.
            with patch("ml_service.development.create_app", return_value=FastAPI()), \
                 patch.object(uvicorn, "Config", wraps=uvicorn.Config) as config:
                self.assertEqual(main(["serve", "--config", str(self.path), "--approved-local-listener"]), 0)
                self.assertEqual(config.call_args.kwargs["host"], "127.0.0.1")
                self.assertFalse(config.call_args.kwargs["access_log"])
                self.assertFalse(config.call_args.kwargs["proxy_headers"])
                run.assert_called_once()
