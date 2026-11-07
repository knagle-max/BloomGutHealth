"""Print a reproducible synthetic solver check, never a biological benchmark.

Run: python3 scripts/qa/synthetic-molecular-benchmark.py
No network, database, API, private source or nonstandard dependencies.
"""
import hashlib
import json
from pathlib import Path
import sys
from time import perf_counter

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from ml_service.research.stoichiometry import ENGINE_VERSION, Reaction, solve_synthetic

# Hand-calculated, fixed controls are intentionally separate from the optimizer.
# Balance: entry = producer; producer - consumer - exchange = 0.
# A negative exchange means uptake. Zero and infeasibility are distinct.
CASES = [(10, 4, 0, "6"), (7, 2, 0, "5"), (3, 3, 0, "0"),
         (0, 0, 0, "0"), (2, 3, 0, None), (0, 1, 0, None),
         (2, 5, -10, "-3"), (5, 2, -10, "3"), (0.5, 0.2, 0, "3/10")]


def benchmark():
    results = []
    started = perf_counter()
    for supply, consumption, lower, expected in CASES:
        rows = [Reaction("entry", {"a": 1}, 0, supply),
                Reaction("producer", {"a": -1, "shared": 1}, 0, 100),
                Reaction("consumer", {"shared": -1, "b": 1}, consumption, consumption),
                Reaction("exit", {"b": -1}, 0, 100),
                Reaction("exchange", {"shared": -1}, lower, 100)]
        result = solve_synthetic(rows, {"exchange": 1}, model_version="synthetic-crossfeed-v1")
        assert result["objective"] == expected
        assert result["status"] == ("infeasible" if expected is None else "optimal")
        assert result["balanceResiduals"] is None or set(result["balanceResiduals"].values()) == {"0"}
        # Taxonomy/producer-only comparator does not subtract consumption.
        gross_only = str(supply)
        results.append(dict(supply=supply, consumption=consumption, exchangeLower=lower,
                            expected=expected, actual=result["objective"], status=result["status"],
                            grossOnlyComparator=gross_only))
    return dict(version="synthetic-molecular-benchmark-v1", engine=ENGINE_VERSION,
                solverSha256=hashlib.sha256((ROOT / "ml_service/research/stoichiometry.py").read_bytes()).hexdigest(),
                casesSha256=hashlib.sha256(json.dumps(CASES).encode()).hexdigest(),
                modelRights="First-party synthetic mathematical fixture; no biological reconstruction",
                unit="synthetic-flux-unit", cases=results, passed=len(results), failed=0,
                elapsedMs=round((perf_counter()-started)*1000, 3),
                limits=["Not independent biological validation, calibration or a curated genome-scale model",
                        "Internal-pool steady-state balance is not an elemental/charge audit of biochemical reactions",
                        "No organism, food-to-colon conversion, measured abundance or patient data",
                        "No personal/clinical prediction or public research activation"])


if __name__ == "__main__":
    print(json.dumps(benchmark(), indent=2))
