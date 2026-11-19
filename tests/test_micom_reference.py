"""Run explicitly with the isolated optional science environment."""
import importlib.util
import unittest
import tempfile
import json
import os
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
from ml_service.research.micom_reference import (
    VERSION, run_reference, _validate_reference_growth, _configure_reference_solver,
)
from ml_service.research.development_policy import DevelopmentScienceUnavailable

DEV = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true"}


class ReferenceAdmissionTests(unittest.TestCase):
    def test_unsupported_backend_profile_is_rejected_before_configuration(self):
        with self.assertRaisesRegex(ValueError, "Unsupported reference backend"):
            _configure_reference_solver(None, {"optlang": "unverified"})

    def test_growth_validation_rejects_bad_tradeoff_even_with_optimal_solver_status(self):
        _validate_reference_growth(0.5, 1.0)
        for growth, maximum in [(0.4999, 1.0), (0.5001, 1.0),
                                (float("nan"), 1.0), (0.5, float("inf")), (0.0, 0.0)]:
            with self.assertRaises(ArithmeticError):
                _validate_reference_growth(growth, maximum)

    def test_production_fails_before_importing_optional_libraries(self):
        with self.assertRaises(DevelopmentScienceUnavailable):
            run_reference({"version": VERSION, "scenario": "baseline"}, {})

    def test_unsupported_input_and_private_fields_rejected(self):
        for command in [{}, {"version": VERSION, "scenario": "arbitrary-code"},
                        {"version": VERSION, "scenario": "baseline", "user_id": "synthetic"},
                        {"version": VERSION, "scenario": "baseline", "model_path": "/tmp/no"}]:
            with self.assertRaises(ValueError):
                run_reference(command, DEV)


@unittest.skipUnless(importlib.util.find_spec("micom"), "Optional isolated scientific environment required")
class ReferenceSolverTests(unittest.TestCase):
    def test_iteration_limited_qp_cannot_be_hidden_by_linear_crossover(self):
        from optlang.hybrid_interface import HybridProblem
        for status in ("maximum iterations reached", "solved inaccurate"):
            def not_converged(problem):
                problem.info = SimpleNamespace(status=status)
            with patch.object(HybridProblem, "solve_osqp", not_converged):
                with self.assertRaisesRegex(ArithmeticError, "QP did not converge"):
                    run_reference({"version": VERSION, "scenario": "baseline"}, DEV)

    def test_fresh_interpreters_with_different_hash_seeds_keep_original_tolerance(self):
        # Stress optlang's set-based matrix ordering without requiring a global
        # hash seed, reusing another process's warm start, or changing the model.
        code = '''
import json
from ml_service.research.micom_reference import VERSION, run_reference
result=run_reference({"version":VERSION,"scenario":"baseline"},
 {"BLOOM_RUNTIME_ENV":"development","BLOOM_LOCAL_SCIENCE_ENABLED":"true"})
print(json.dumps({key:result[key] for key in ("growthRate","tradeoffGrowthTarget","tradeoffGrowthError","solverProfile")}))
'''
        values = []
        for seed in ("0", "1", "7"):
            process = subprocess.run([sys.executable, "-c", code],
                                     cwd=Path(__file__).resolve().parents[1],
                                     env={**os.environ, "PYTHONHASHSEED": seed},
                                     capture_output=True, text=True, timeout=45)
            self.assertEqual(process.returncode, 0, "Fresh-process reference solve failed")
            result = json.loads(process.stdout.splitlines()[-1])
            self.assertLessEqual(result["tradeoffGrowthError"], 1e-5)
            values.append(result["growthRate"])
        self.assertLessEqual(max(values) - min(values), 1e-5)

    def test_tradeoff_growth_meets_independent_glpk_linear_optimum(self):
        import micom
        from micom.data import test_taxonomy
        taxonomy = test_taxonomy(2)
        taxonomy["abundance"] = [0.5, 0.5]
        linear = micom.Community(taxonomy, solver="glpk", progress=False)
        linear.solver.configuration.timeout = 20
        optimum = linear.optimize(fluxes=False, raise_error=True)
        self.assertEqual(optimum.status, "optimal")
        result = run_reference({"version": VERSION, "scenario": "baseline"}, DEV)
        self.assertAlmostEqual(result["growthRate"], 0.5 * optimum.growth_rate, delta=1e-5)

    def test_changed_second_community_member_rejected_before_any_model_parsing(self):
        import cobra
        import micom.data
        taxonomy = micom.data.test_taxonomy(2)
        with tempfile.TemporaryDirectory() as directory:
            replacement = Path(directory) / "synthetic-unverified-model.xml"
            replacement.write_text("Synthetic invalid reference bytes; not biological data.")
            taxonomy.loc[taxonomy.index[1], "file"] = str(replacement)
            with patch.object(micom.data, "test_taxonomy", return_value=taxonomy), \
                 patch.object(cobra.io, "read_sbml_model", side_effect=AssertionError("must not parse")):
                with self.assertRaisesRegex(ValueError, "identity is unverified"):
                    run_reference({"version": VERSION, "scenario": "baseline"}, DEV)

    def test_changed_model_identity_rejected_before_model_parsing_or_optimization(self):
        import cobra
        import micom
        with patch("ml_service.research.micom_reference.hashlib.sha256",
                   return_value=SimpleNamespace(hexdigest=lambda: "0" * 64)), \
             patch.object(cobra.io, "read_sbml_model", side_effect=AssertionError("must not parse")):
            with self.assertRaisesRegex(ValueError, "identity is unverified"):
                run_reference({"version": VERSION, "scenario": "baseline"}, DEV)

    def test_cobra_solves_bundled_reference_independently(self):
        import cobra
        from micom.data import test_taxonomy
        model = cobra.io.read_sbml_model(test_taxonomy(1).iloc[0]["file"])
        model.solver = "glpk"
        model.solver.configuration.timeout = 20
        result = model.optimize()
        self.assertEqual(result.status, "optimal")
        # Published E. coli core aerobic reference objective, default medium.
        self.assertAlmostEqual(result.objective_value, 0.87392150697, delta=1e-5)

    def test_reproducible_reference_and_negative_control(self):
        first = run_reference({"version": VERSION, "scenario": "baseline"}, DEV)
        second = run_reference({"version": VERSION, "scenario": "baseline"}, DEV)
        closed = run_reference({"version": VERSION, "scenario": "closed-medium"}, DEV)
        self.assertEqual(first["status"], "optimal")
        self.assertEqual(first["model"], second["model"])
        self.assertEqual(first["model"]["declaredSourceModelId"], "e_coli_core")
        members = first["model"]["members"]
        self.assertEqual(len(members), 2)
        self.assertEqual(len({member["id"] for member in members}), 2)
        self.assertTrue(all(member["sha256"] == first["model"]["sha256"] for member in members))
        self.assertEqual([member["imposedAbundance"] for member in members], [0.5, 0.5])
        self.assertEqual(first["model"]["commercialModelRights"], "commercial-use-and-redistribution-not-cleared")
        self.assertEqual(first["versions"], second["versions"])
        self.assertEqual(first["implementationArtifacts"], second["implementationArtifacts"])
        self.assertEqual(set(first["implementationArtifacts"]),
                         {"micom_reference.py", "reference_model_audit.py", "development_policy.py"})
        self.assertTrue(all(len(value) == 64 for value in first["implementationArtifacts"].values()))
        self.assertGreater(first["growthRate"], 0)
        self.assertAlmostEqual(first["growthRate"], second["growthRate"], delta=1e-5)
        self.assertEqual(closed["status"], "infeasible")
        self.assertIsNone(closed["growthRate"])
        self.assertEqual(first["model"], closed["model"])
        self.assertLessEqual(first["maxSteadyStateResidual"], 1e-5)
        self.assertLessEqual(first["maxBoundViolation"], 1e-5)
        self.assertFalse(first["observedBiology"])
        self.assertFalse(first["clinicalValidation"])
        self.assertFalse(first["predictiveValidation"])
        self.assertEqual(first["solverProfile"], "hybrid-reference-precision-v2")
        self.assertEqual(first["solverConfiguration"]["feasibility"], 1e-9)
        self.assertEqual(first["solverConfiguration"]["optimality"], 1e-9)
        self.assertEqual(first["solverConfiguration"]["osqp"]["scaling"], 0)
        self.assertEqual(first["solverConfiguration"]["osqp"]["adaptive_rho_interval"], 50)
        self.assertFalse(first["solverConfiguration"]["osqp"]["warm_start"])
        self.assertEqual(first["qpConvergence"][0]["status"], "solved")
        self.assertLessEqual(first["tradeoffGrowthError"], 1e-5)
