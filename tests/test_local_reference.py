"""Synthetic local-workflow contracts; no listeners or private datasets."""
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from ml_service.local_reference import run_local

DEV = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true"}


class FakeSupervisor:
    closed = False
    def submit(self, command, environment):
        return command["scenario"]
    def status(self, job, environment):
        return {"state": "completed", "result": {"status": "optimal" if job == "baseline" else "infeasible"}}
    def close(self):
        self.closed = True


class LocalReferenceTests(unittest.TestCase):
    def test_pair_private_output_no_overwrite_and_no_clinical_promotion(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "reference.json"
            fake = FakeSupervisor()
            with patch("ml_service.local_reference.DevelopmentJobSupervisor", return_value=fake):
                self.assertTrue(run_local(path, DEV))
                self.assertTrue(fake.closed)
                original = path.read_bytes()
                self.assertEqual(path.stat().st_mode & 0o777, 0o600)
                data = json.loads(original)
                self.assertFalse(data["biologicalValidation"])
                self.assertFalse(data["clinicalValidation"])
                self.assertEqual(len(data["records"]), 2)
                with self.assertRaises(ValueError):
                    run_local(path, DEV)
                self.assertEqual(path.read_bytes(), original)

    def test_production_git_and_unsafe_storage_rejected_before_computation(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "reference.json"
            with patch("ml_service.local_reference.DevelopmentJobSupervisor") as supervisor:
                with self.assertRaises(Exception):
                    run_local(path, {})
                os.chmod(directory, 0o755)
                with self.assertRaises(Exception):
                    run_local(path, DEV)
                os.chmod(directory, 0o700)
                (Path(directory) / ".git").write_text("gitdir: synthetic")
                with self.assertRaises(Exception):
                    run_local(path, DEV)
                supervisor.assert_not_called()

    def test_worker_failure_closes_and_writes_no_fabricated_results(self):
        with tempfile.TemporaryDirectory() as directory:
            fake = FakeSupervisor()
            fake.status = lambda *_: {"state": "timeout", "result": None}
            path = Path(directory) / "reference.json"
            with patch("ml_service.local_reference.DevelopmentJobSupervisor", return_value=fake):
                with self.assertRaises(RuntimeError):
                    run_local(path, DEV)
            self.assertTrue(fake.closed)
            self.assertFalse(path.exists())
