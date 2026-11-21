"""Synthetic scanner tests. No real secrets, records, git writes or network."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import stat
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("privacy_preflight", Path(__file__).parents[1] /
                                            "scripts/security/privacy_preflight.py")
preflight = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(preflight)


class PatternTests(unittest.TestCase):
    def test_index_change_during_scan_is_incomplete_not_a_pass(self):
        snapshots = iter((b"", b"changed-index"))

        def git(root, arguments, data=None):
            if arguments == ["ls-files", "--stage", "-z"]:
                return next(snapshots)
            return b""

        process = SimpleNamespace(stdin=io.BytesIO(), stdout=io.BytesIO(), wait=lambda: 0)
        with patch.object(preflight, "_git", side_effect=git), \
             patch.object(preflight.subprocess, "Popen", return_value=process), \
             patch.object(preflight.importlib.metadata, "version", return_value="synthetic-test"):
            report = preflight.preflight(Path("/tmp/synthetic-root"), [])
        self.assertEqual(report["status"], "INCOMPLETE")
        self.assertIn("index-changed-during-scan", report["categoryCounts"])

    def test_historical_only_candidate_is_scanned_even_with_empty_index_and_worktree(self):
        class FixedDetector:
            secret_type = "Synthetic Detector"

            def analyze_string(self, line):
                if "synthetic-history-only-marker" in line:
                    yield "synthetic-history-only-marker"

        body = b"synthetic-history-only-marker"
        oid = "a" * 40

        def git(root, arguments, data=None):
            if arguments[0] == "rev-list":
                self.assertIn("--all", arguments)
                self.assertIn("--reflog", arguments)
                return (oid + "\n").encode()
            if arguments[0] == "cat-file":
                return f"{oid} blob {len(body)}\n".encode()
            return b""

        process = SimpleNamespace(stdin=io.BytesIO(),
                                  stdout=io.BytesIO(f"{oid} blob {len(body)}\n".encode() + body + b"\n"),
                                  wait=lambda: 0)
        with patch.object(preflight, "_git", side_effect=git), \
             patch.object(preflight.subprocess, "Popen", return_value=process), \
             patch.object(preflight.importlib.metadata, "version", return_value="synthetic-test"):
            report = preflight.preflight(Path("/tmp/synthetic-root"), [FixedDetector()])
        self.assertEqual(report["status"], "REVIEW_REQUIRED")
        self.assertEqual(report["objectsScanned"], {"history": 1})
        self.assertEqual(report["findings"][0]["scope"], "history")
        self.assertNotIn("synthetic-history-only-marker", json.dumps(report))

    def test_unknown_formats_and_large_inputs_are_not_declared_clean(self):
        self.assertEqual(preflight.scan_text(b"\x00binary", []), {"binary-not-inspected"})
        self.assertEqual(preflight.scan_text(b"\xff", []), {"non-utf8-not-inspected"})
        self.assertEqual(preflight.scan_text(b"x" * (preflight.MAX_BYTES + 1), []),
                         {"uninspected-large-object"})
        self.assertEqual(preflight.scan_text(b"x" * (preflight.MAX_LINE + 1), []),
                         {"uninspected-long-line"})

    def test_synthetic_record_formats_flag_candidates_without_returning_values(self):
        for payload, category in [(b"##fileformat=VCFv4.2\n", "possible-vcf-records"),
                                  (b'{"resourceType":"Patient"}', "possible-clinical-records"),
                                  (b"patient_name,date_of_birth\nSynthetic,unknown", "possible-personal-data-table")]:
            self.assertEqual(preflight.scan_text(payload, []), {category})
        self.assertEqual(preflight.scan_text(b"plain source documentation", []), set())

    @unittest.skipUnless(importlib.util.find_spec("detect_secrets"), "Isolated privacy tooling required")
    def test_real_secret_detectors_are_offline_and_do_not_return_matches(self):
        from detect_secrets.settings import default_settings, get_plugins
        with default_settings(), patch("socket.create_connection", side_effect=AssertionError("No network")):
            plugins = get_plugins()
            for plugin in plugins:
                plugin.verify = lambda *args, **kwargs: self.fail("Must not verify credentials")
            result = preflight.scan_text(b'password = "synthetic-only-test-password-123456"', plugins)
        self.assertIn("potential-secret:Secret Keyword", result)
        self.assertNotIn("synthetic-only", repr(result))

    @unittest.skipUnless(importlib.util.find_spec("detect_secrets"), "Isolated privacy tooling required")
    def test_report_is_private_exclusive_and_stdout_contains_only_summary(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "report.json"
            report = {"status": "REVIEW_REQUIRED", "objectsScanned": {"history": 1},
                      "categoryCounts": {"synthetic": 1},
                      "findings": [{"object": "private-object-identifier"}]}
            with patch("sys.argv", ["privacy_preflight", "--report", str(target)]), \
                 patch.object(preflight, "preflight", return_value=report), \
                 contextlib.redirect_stdout(io.StringIO()) as output:
                self.assertEqual(preflight.main(), 1)
                self.assertNotIn("private-object", output.getvalue())
                self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o600)
                original = target.read_bytes()
                with self.assertRaises(FileExistsError):
                    preflight.main()
                self.assertEqual(target.read_bytes(), original)
                self.assertEqual(json.loads(original), report)

    def test_report_cannot_be_written_inside_git_checkout(self):
        target = Path(__file__).parents[1] / "forbidden-privacy-report.json"
        with patch("sys.argv", ["privacy_preflight", "--report", str(target)]), \
             patch.object(preflight, "preflight", side_effect=AssertionError("Must refuse before scanning")):
            with self.assertRaisesRegex(RuntimeError, "outside the repository"):
                preflight.main()
        self.assertFalse(target.exists())
