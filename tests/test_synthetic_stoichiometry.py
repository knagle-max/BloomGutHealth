"""Independent hand-calculated controls, not human/strain model validation."""
import unittest
from dataclasses import replace
from fractions import Fraction
from ml_service.research.stoichiometry import Reaction, solve_synthetic


def community(supply=10, consumption=4, exchange_lower=0):
    return [
        Reaction("substrate-entry", {"substrate": 1}, 0, supply),
        Reaction("producer", {"substrate": -1, "shared": 1}, 0, 100),
        Reaction("consumer", {"shared": -1, "consumer-pool": 1}, consumption, consumption),
        Reaction("consumer-exit", {"consumer-pool": -1}, 0, 100),
        Reaction("shared-exchange", {"shared": -1}, exchange_lower, 100),
    ]


def solve(rows):
    return solve_synthetic(rows, {"shared-exchange": 1}, model_version="synthetic-crossfeed-v1")


class SyntheticStoichiometryTest(unittest.TestCase):
    def test_real_cpu_optimization_subtracts_consumer_and_balances_every_pool(self):
        result = solve(community())
        self.assertEqual(result["status"], "optimal")
        self.assertEqual(result["fluxes"]["producer"], "10")
        self.assertEqual(result["fluxes"]["consumer"], "4")
        self.assertEqual(result["objective"], "6")
        self.assertEqual(set(result["balanceResiduals"].values()), {"0"})
        self.assertEqual(result["evidenceState"], "modelled_reaction_flux")
        self.assertFalse(result["personalPrediction"])
        self.assertFalse(result["applyToUser"])
        self.assertEqual(result["unit"], "synthetic-flux-unit")

    def test_held_out_supply_and_consumption_cases_include_zero_unknown_and_infeasibility(self):
        for supply, consumption, expected in [(7, 2, "5"), (3, 3, "0"), (0, 0, "0"), (2, 3, None), (0, 1, None)]:
            with self.subTest(supply=supply, consumption=consumption):
                result = solve(community(supply, consumption))
                self.assertEqual(result["objective"], expected)
                self.assertEqual(result["status"], "infeasible" if expected is None else "optimal")
                if expected is None:
                    self.assertIsNone(result["fluxes"])
                    self.assertIsNone(result["balanceResiduals"])

    def test_uptake_secretion_reversal_and_exact_fractional_control(self):
        self.assertEqual(solve(community(2, 5, -10))["objective"], "-3")
        self.assertEqual(solve(community(5, 2, -10))["objective"], "3")
        self.assertEqual(solve(community(0.5, 0.2))["objective"], "3/10")
        result = solve(community())
        self.assertEqual(Fraction(result["fluxes"]["producer"]) - Fraction(result["fluxes"]["consumer"]), Fraction(result["fluxes"]["shared-exchange"]))

    def test_direction_and_capacity_negative_controls_do_not_masquerade_as_success(self):
        rows = community()
        rows[1] = replace(rows[1], upper=3)
        self.assertEqual(solve(rows)["status"], "infeasible")
        rows = community()
        rows[-1] = replace(rows[-1], stoichiometry={"shared": 1})
        # A sign error changes the answer: gross producer counting misses this.
        self.assertEqual(solve(rows)["objective"], "4")
        self.assertNotEqual(solve(rows)["objective"], "6")

    def test_degenerate_fixed_bounds_and_redundant_balance_rows(self):
        rows = [Reaction("in", {"a": 1, "redundant": 2}, 2, 2), Reaction("out", {"a": -1, "redundant": -2}, 0, 4)]
        result = solve_synthetic(rows, {"out": 1}, model_version="synthetic-degenerate-v1")
        self.assertEqual(result["objective"], "2")
        self.assertEqual(set(result["balanceResiduals"].values()), {"0"})

    def test_missing_nonfinite_unbounded_and_unresolved_inputs_are_rejected(self):
        for value in [None, True, float("nan"), float("inf"), 1001, "1e-20"]:
            with self.subTest(value=value):
                rows = community()
                rows[0] = replace(rows[0], upper=value)
                with self.assertRaises(ValueError):
                    solve(rows)
        for rows in [community() * 2, [Reaction("x", {}, 0, 1)], [Reaction("x", {"a": 0}, 0, 1)], [Reaction("x", {"a": 1}, 2, 1)]]:
            with self.assertRaises(ValueError):
                solve(rows)
        with self.assertRaises(ValueError):
            solve_synthetic(community(), {"missing": 1}, model_version="synthetic-test-v1")
        with self.assertRaises(ValueError):
            solve_synthetic(community(), {"producer": 1}, model_version="patient-model")


if __name__ == "__main__":
    unittest.main()
