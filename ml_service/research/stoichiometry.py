"""Bounded exact-rational LP for tiny synthetic steady-state networks.

Bloom MIT source, engine synthetic-vertex-lp-v1. No curated reconstruction,
organism mappings or biological calibration. Internal species balance S*v=0;
boundary uptake/secretion is explicit in the supplied reactions. Units are
synthetic flux units, never concentration, host dose or mmol/gDW/h.
"""
from dataclasses import dataclass
from fractions import Fraction
from itertools import combinations
from math import isfinite

ENGINE_VERSION = "synthetic-vertex-lp-v1"


def _number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValueError("A finite explicit synthetic coefficient is required")
    try:
        if not isfinite(float(value)):
            raise ValueError()
        result = Fraction(str(value))
    except (ValueError, ZeroDivisionError, OverflowError):
        raise ValueError("A finite explicit synthetic coefficient is required") from None
    if abs(result) > 1000 or result.denominator > 1_000_000:
        raise ValueError("Synthetic coefficient exceeds the bounded solver contract")
    return result


@dataclass(frozen=True)
class Reaction:
    id: str
    stoichiometry: dict
    lower: object
    upper: object


def _independent_rows(rows, size):
    matrix = [list(row) for row in rows]
    pivot = 0
    for col in range(size):
        index = next((i for i in range(pivot, len(matrix)) if matrix[i][col]), None)
        if index is None:
            continue
        matrix[pivot], matrix[index] = matrix[index], matrix[pivot]
        divisor = matrix[pivot][col]
        matrix[pivot] = [v / divisor for v in matrix[pivot]]
        for i in range(len(matrix)):
            if i != pivot and matrix[i][col]:
                factor = matrix[i][col]
                matrix[i] = [a - factor * b for a, b in zip(matrix[i], matrix[pivot])]
        pivot += 1
        if pivot == len(matrix):
            break
    return matrix[:pivot]


def _unique_solution(rows, rhs, size):
    matrix = [list(row) + [value] for row, value in zip(rows, rhs)]
    for col in range(size):
        index = next((i for i in range(col, size) if matrix[i][col]), None)
        if index is None:
            return None
        matrix[col], matrix[index] = matrix[index], matrix[col]
        divisor = matrix[col][col]
        matrix[col] = [v / divisor for v in matrix[col]]
        for i in range(size):
            if i != col and matrix[i][col]:
                factor = matrix[i][col]
                matrix[i] = [a - factor * b for a, b in zip(matrix[i], matrix[col])]
    return tuple(row[-1] for row in matrix)


def solve_synthetic(reactions, objective, *, model_version):
    """Maximize a supplied linear objective. No personal/source data accepted.

    All reactions need finite bounds. Exhaustive vertex enumeration gives an
    exact optimum for the bounded feasible polytope (including degenerate faces).
    At most six reactions/eight internal pools: worst case 924 bound choices.
    This deliberately cannot ingest a biological genome-scale reconstruction.
    """
    if not isinstance(model_version, str) or not model_version.startswith("synthetic-") or len(model_version) > 100:
        raise ValueError("An explicit synthetic model version is required")
    if not 1 <= len(reactions) <= 6 or any(not isinstance(r, Reaction) for r in reactions):
        raise ValueError("Use one to six explicit synthetic reactions")
    ids = [r.id for r in reactions]
    if any(not isinstance(i, str) or not i or len(i) > 80 for i in ids) or len(set(ids)) != len(ids):
        raise ValueError("Reaction identifiers must be unique")
    if not isinstance(objective, dict) or not objective or set(objective) - set(ids):
        raise ValueError("The objective must resolve to supplied reactions")
    if any(not isinstance(r.stoichiometry, dict) or not r.stoichiometry for r in reactions):
        raise ValueError("Each reaction needs explicit internal stoichiometry")
    species_set = set().union(*(set(r.stoichiometry) for r in reactions))
    if len(species_set) > 8 or any(not isinstance(s, str) or not s or len(s) > 80 for s in species_set):
        raise ValueError("Use at most eight named internal pools")
    species = sorted(species_set)
    coefficients = [{s: _number(v) for s, v in r.stoichiometry.items()} for r in reactions]
    if any(not any(row.values()) for row in coefficients):
        raise ValueError("An empty transformation cannot create synthetic flux")
    lower, upper = zip(*[(_number(r.lower), _number(r.upper)) for r in reactions])
    if any(lo > hi for lo, hi in zip(lower, upper)):
        raise ValueError("Reaction bounds are contradictory")
    n = len(reactions)
    balance = [[row.get(s, Fraction(0)) for row in coefficients] for s in species]
    basis = _independent_rows(balance, n)
    weights = [_number(objective.get(i, 0)) for i in ids]
    bounds = []
    for j in range(n):
        unit = [Fraction(int(i == j)) for i in range(n)]
        bounds.extend([(unit, lower[j]), (unit, upper[j])])
    best, score = None, None
    for active in combinations(bounds, n - len(basis)):
        vector = _unique_solution(basis + [a[0] for a in active], [Fraction(0)] * len(basis) + [a[1] for a in active], n)
        if vector is None or any(v < lo or v > hi for v, lo, hi in zip(vector, lower, upper)):
            continue
        value = sum(w * v for w, v in zip(weights, vector))
        if best is None or value > score:
            best, score = vector, value
    common = dict(engine=ENGINE_VERSION, modelVersion=model_version, scope="synthetic", unit="synthetic-flux-unit", evidenceState="modelled_reaction_flux", personalPrediction=False, applyToUser=False)
    if best is None:
        return dict(common, status="infeasible", objective=None, fluxes=None, balanceResiduals=None)
    residuals = {s: str(sum(a * v for a, v in zip(row, best))) for s, row in zip(species, balance)}
    return dict(common, status="optimal", objective=str(score), fluxes={i: str(v) for i, v in zip(ids, best)}, balanceResiduals=residuals)
