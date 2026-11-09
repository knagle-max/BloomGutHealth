"""Strict fixed synthetic controls. No personal observations or model uploads."""
import hashlib
import json
from typing import Literal
from pydantic import BaseModel, ConfigDict
from .stoichiometry import Reaction, solve_synthetic


class SyntheticResearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    version: Literal["synthetic-molecular-v1"]
    scenario: Literal["crossfeed-default", "substrate-absent", "consumption-exceeds-supply", "uptake-reversal"]


def execute_synthetic(request: SyntheticResearchRequest):
    supply, consumption, lower = {
        "crossfeed-default": (10, 4, 0),
        "substrate-absent": (0, 0, 0),
        "consumption-exceeds-supply": (2, 3, 0),
        "uptake-reversal": (2, 5, -10),
    }[request.scenario]
    rows = [Reaction("entry", {"a": 1}, 0, supply),
            Reaction("producer", {"a": -1, "shared": 1}, 0, 100),
            Reaction("consumer", {"shared": -1, "b": 1}, consumption, consumption),
            Reaction("exit", {"b": -1}, 0, 100),
            Reaction("exchange", {"shared": -1}, lower, 100)]
    result = solve_synthetic(rows, {"exchange": 1}, model_version="synthetic-crossfeed-v1")
    encoded = json.dumps(["synthetic-molecular-request-v1", request.scenario], separators=(",", ":")).encode()
    return dict(result, version=request.version, scenario=request.scenario,
                requestHash=hashlib.sha256(encoded).hexdigest(),
                limitations=["Fixed synthetic internal-pool steady state, not a biological reconstruction or measured flux",
                             "No personal source data, host concentration, clinical effect or user action"])
