"""Known synthetic chemistry checks, never owner biological fixtures."""
import importlib.util
import unittest


@unittest.skipUnless(importlib.util.find_spec("cobra"), "Isolated science environment required")
class ModelAuditTests(unittest.TestCase):
    def test_unsupported_formula_notation_is_not_silently_stripped_to_known_atoms(self):
        from cobra import Model, Reaction, Metabolite
        from ml_service.research.reference_model_audit import audit_model
        for formula in ("13C", "C+", "C2junk"):
            model = Model("synthetic_unsupported_formula")
            a = Metabolite("a", formula=formula, charge=0, compartment="c")
            b = Metabolite("b", formula=formula, charge=0, compartment="c")
            reaction = Reaction("unsupported_formula")
            reaction.add_metabolites({a: -1, b: 1})
            model.add_reactions([reaction])
            report = audit_model(model)
            self.assertEqual(report["internalBalancedCount"], 0)
            self.assertEqual(report["unassessableInternalReactions"], ["unsupported_formula"])

    def test_matching_pseudo_atoms_do_not_prove_chemical_balance(self):
        from cobra import Model, Reaction, Metabolite
        from ml_service.research.reference_model_audit import audit_model
        model = Model("synthetic_pseudo_atoms")
        a = Metabolite("pseudo_a", formula="R", charge=0, compartment="c")
        b = Metabolite("pseudo_b", formula="R", charge=0, compartment="c")
        reaction = Reaction("pseudo_transfer")
        reaction.add_metabolites({a: -1, b: 1})
        model.add_reactions([reaction])
        report = audit_model(model)
        self.assertEqual(report["internalBalancedCount"], 0)
        self.assertEqual(report["unassessableInternalReactions"], ["pseudo_transfer"])

    def test_nonfinite_charge_is_unknown_chemistry_not_a_balanced_or_imbalanced_fact(self):
        from cobra import Model, Reaction, Metabolite
        from ml_service.research.reference_model_audit import audit_model
        model = Model("synthetic_unknown_charge")
        a = Metabolite("a", formula="C", charge=float("nan"), compartment="c")
        b = Metabolite("b", formula="C", charge=0, compartment="c")
        reaction = Reaction("unknown_charge")
        reaction.add_metabolites({a: -1, b: 1})
        model.add_reactions([reaction])
        report = audit_model(model)
        self.assertEqual(report["internalBalancedCount"], 0)
        self.assertEqual(report["imbalancedInternalReactions"], [])
        self.assertEqual(report["unassessableInternalReactions"], ["unknown_charge"])

    def test_unknown_formula_is_not_balanced_and_real_imbalance_is_visible(self):
        from cobra import Model, Reaction, Metabolite
        from ml_service.research.reference_model_audit import audit_model
        model = Model("synthetic_audit")
        a = Metabolite("a", formula="C", charge=0, compartment="c")
        b = Metabolite("b", formula="C", charge=0, compartment="c")
        c = Metabolite("c", formula="C2", charge=0, compartment="c")
        unknown = Metabolite("unknown", charge=None, compartment="c")
        balanced = Reaction("balanced"); balanced.add_metabolites({a: -1, b: 1})
        imbalanced = Reaction("imbalanced"); imbalanced.add_metabolites({a: -1, c: 1})
        missing = Reaction("missing"); missing.add_metabolites({a: -1, unknown: 1})
        objective = Reaction("objective"); objective.add_metabolites({b: -1})
        model.add_reactions([balanced, imbalanced, missing, objective])
        model.objective = objective
        report = audit_model(model)
        self.assertEqual(report["internalBalancedCount"], 1)
        self.assertEqual(report["imbalancedInternalReactions"], ["imbalanced"])
        self.assertEqual(report["unassessableInternalReactions"], ["missing"])
        self.assertEqual(report["objectiveReactions"], ["objective"])
        self.assertEqual(report["metabolitesMissingFormula"], 1)
        self.assertEqual(report["metabolitesMissingCharge"], 1)
        self.assertFalse(report["biologicallyValidated"])
        self.assertFalse(report["taxonomicMappingValidated"])
        self.assertFalse(report["dietaryMappingValidated"])


@unittest.skipUnless(importlib.util.find_spec("cobra"), "Isolated science environment required")
class ClosedEnergyProbeTests(unittest.TestCase):
    @staticmethod
    def model(cycle=False):
        from cobra import Model, Reaction, Metabolite
        model = Model("synthetic_closed_energy")
        fields = {"atp_c": ("C10H12N5O13P3", -4), "adp_c": ("C10H12N5O10P2", -3),
                  "h2o_c": ("H2O", 0), "h_c": ("H", 1), "pi_c": ("HO4P", -2)}
        metabolites = {key: Metabolite(key, formula=formula, charge=charge, compartment="c")
                       for key, (formula, charge) in fields.items()}
        hydrolysis = Reaction("ATPM"); hydrolysis.bounds = (0, 1000)
        hydrolysis.add_metabolites({metabolites[key]: coefficient for key, coefficient in
                                   {"atp_c": -1, "h2o_c": -1, "adp_c": 1, "h_c": 1, "pi_c": 1}.items()})
        model.add_reactions([hydrolysis]); model.objective = hydrolysis
        if cycle:
            free = Reaction("synthetic_free_atp"); free.bounds = (0, 1000)
            free.add_metabolites({metabolite: -coefficient for metabolite, coefficient in hydrolysis.metabolites.items()})
            model.add_reactions([free])
        return model

    def test_negative_and_deliberate_positive_energy_controls_and_original_model_unchanged(self):
        from ml_service.research.reference_model_audit import probe_closed_atp
        for cycle, expected in [(False, "not-detected-at-tested-tolerance"), (True, "energy-generation-detected")]:
            model = self.model(cycle)
            bounds = {r.id: r.bounds for r in model.reactions}
            solver, objective = model.solver, str(model.objective.expression)
            feasibility = model.solver.configuration.tolerances.feasibility
            result = probe_closed_atp(model)
            self.assertEqual(result["status"], expected)
            self.assertEqual(result["solverStatus"], "optimal")
            self.assertLessEqual(result["maxSteadyStateResidual"], result["numericalTolerance"])
            self.assertEqual(result["solverVersion"], "5.0")
            self.assertFalse(result["thermodynamicallyValidated"])
            self.assertFalse(result["biologicallyValidated"])
            self.assertEqual(bounds, {r.id: r.bounds for r in model.reactions})
            self.assertIs(model.solver, solver)
            self.assertEqual(model.solver.configuration.tolerances.feasibility, feasibility)
            self.assertEqual(str(model.objective.expression), objective)
            if cycle:self.assertGreater(result["maximumAtpDissipation"], result["numericalTolerance"])
            else:self.assertAlmostEqual(result["maximumAtpDissipation"], 0, places=8)

    def test_missing_or_unqualified_mapping_is_explicitly_unavailable_not_a_pass(self):
        from cobra import Model
        from ml_service.research.reference_model_audit import probe_closed_atp
        self.assertEqual(probe_closed_atp(Model("synthetic_missing"))["reason"], "missing-reference-atp-mapping")
        model = self.model(); model.reactions.ATPM.add_metabolites({model.metabolites.atp_c: 1})
        result = probe_closed_atp(model)
        self.assertEqual(result["status"], "unavailable")
        self.assertIsNone(result["maximumAtpDissipation"])

    def test_nonfinite_solver_output_cannot_pass_the_energy_control(self):
        from unittest.mock import patch
        from types import SimpleNamespace
        from cobra import Model
        import pandas as pd
        from ml_service.research.reference_model_audit import probe_closed_atp
        model = self.model()
        bad = SimpleNamespace(status="optimal", objective_value=float("nan"), fluxes=pd.Series({"ATPM": 0.0}))
        with patch.object(Model, "optimize", return_value=bad):
            result = probe_closed_atp(model)
        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(result["reason"], "nonfinite-or-incomplete-solution")
        self.assertIsNone(result["maximumAtpDissipation"])

    def test_optimal_status_with_a_nonsteady_flux_is_not_a_qualified_control(self):
        from unittest.mock import patch
        from types import SimpleNamespace
        from cobra import Model
        import pandas as pd
        from ml_service.research.reference_model_audit import probe_closed_atp
        bad = SimpleNamespace(status="optimal", objective_value=1.0, fluxes=pd.Series({"ATPM": 1.0}))
        with patch.object(Model, "optimize", return_value=bad):
            result = probe_closed_atp(self.model())
        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(result["reason"], "numerically-unqualified-solution")
        self.assertIsNone(result["maximumAtpDissipation"])
