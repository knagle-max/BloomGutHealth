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
