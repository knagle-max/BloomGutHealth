"""No ports, accounts, credentials or personal biological fixtures."""
import unittest
import os
from pathlib import Path
import subprocess
import sys
from unittest.mock import patch
from ml_service.research.development_policy import (
    DevelopmentScienceUnavailable, require_development_science,
)


class DevelopmentSciencePolicyTests(unittest.TestCase):
    def test_production_service_imports_without_optional_science_or_mac_modules(self):
        # A fresh interpreter prevents the test suite's development imports from
        # hiding an accidental production dependency. No listener is started.
        code = '''
import importlib.abc
import sys
blocked = ("micom", "cobra", "ollama", "tailscale", "ml_service.development",
           "ml_service.research.development_", "ml_service.research.micom_reference",
           "ml_service.research.ollama_development")
class NoDevelopmentImports(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):
        if any(fullname.startswith(prefix) for prefix in blocked):
            raise ImportError("Development-only module unavailable")
sys.meta_path.insert(0, NoDevelopmentImports())
from ml_service.main import app
assert not any("/development" in route.path for route in app.routes)
assert not any(name.startswith(blocked) for name in sys.modules)
'''
        completed = subprocess.run(
            [sys.executable, "-c", code],
            cwd=Path(__file__).resolve().parents[1],
            env={**os.environ, "NODE_ENV": "production", "BLOOM_RUNTIME_ENV": "production"},
            capture_output=True, timeout=20, check=False,
        )
        self.assertEqual(completed.returncode, 0, "Production imports require optional development modules")

    def test_injected_config_cannot_override_actual_production_process(self):
        development = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true"}
        for actual in ({"NODE_ENV": "production"}, {"BLOOM_RUNTIME_ENV": "production"}):
            with patch.dict("os.environ", actual), self.assertRaises(DevelopmentScienceUnavailable):
                require_development_science(development)

    def test_explicit_development_opt_in_required(self):
        for environment in [{}, {"BLOOM_LOCAL_SCIENCE_ENABLED": "true"},
                            {"BLOOM_RUNTIME_ENV": "development"},
                            {"BLOOM_RUNTIME_ENV": "test", "BLOOM_LOCAL_SCIENCE_ENABLED": "true"}]:
            with self.assertRaises(DevelopmentScienceUnavailable):
                require_development_science(environment)
        require_development_science({"BLOOM_RUNTIME_ENV": "development",
                                     "BLOOM_LOCAL_SCIENCE_ENABLED": "true"})

    def test_production_denied_even_when_enabled_or_conflicting(self):
        for bloom, node in [("production", "development"), ("development", "production"),
                            ("production", "production")]:
            with self.assertRaises(DevelopmentScienceUnavailable):
                require_development_science({"BLOOM_RUNTIME_ENV": bloom, "NODE_ENV": node,
                                             "BLOOM_LOCAL_SCIENCE_ENABLED": "true"})

    def test_network_and_model_settings_do_not_enable_execution(self):
        with self.assertRaises(DevelopmentScienceUnavailable):
            require_development_science({"OLLAMA_HOST": "http://127.0.0.1:11434",
                                         "TAILSCALE_HOSTNAME": "synthetic-dev-machine"})
