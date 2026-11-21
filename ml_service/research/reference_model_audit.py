"""Mechanical checks only; no automatic biological or licensing approval."""
import math
import re


def audit_model(model):
    """Inspect an already trusted local COBRA object, never request-supplied code.

    Unknown formula/charge is explicitly unassessable. Boundary and objective
    reactions remain separate from internal chemistry, not silently balanced.
    """
    from cobra.util.solver import linear_reaction_coefficients
    from cobra.core.formula import elements_and_molecular_weights

    def assessable(metabolite):
        charge = metabolite.charge
        # No silent stripping of isotope/adduct/charge notation by the parser.
        # Such formulas need source-qualified interpretation, not guessed atoms.
        if (not isinstance(metabolite.formula, str)
                or not re.fullmatch(r"(?:[A-Z][a-z]?(?:[0-9]+(?:\.[0-9]+)?)?)+", metabolite.formula)
                or isinstance(charge, bool)
                or not isinstance(charge, (int, float)) or not math.isfinite(charge)):
            return False
        try:
            elements = metabolite.elements
            return (bool(elements) and all(element in elements_and_molecular_weights
                                          and math.isfinite(count) and count >= 0
                                          for element, count in elements.items())
                    and any(count > 0 for count in elements.values()))
        except (ValueError, TypeError):
            return False

    unassessable = {m.id for m in model.metabolites if not assessable(m)}
    objective = set(linear_reaction_coefficients(model))
    # Structural boundary classification avoids COBRA's automatic external
    # compartment inference. Whether each is a physiological exchange requires
    # source/compartment review; do not invent an exchange mapping here.
    boundary = set(model.boundary)
    imbalanced, unknown, invalid_bounds = [], [], []
    balanced = 0
    for reaction in model.reactions:
        if (not all(math.isfinite(x) for x in reaction.bounds)
                or reaction.lower_bound > reaction.upper_bound):
            invalid_bounds.append(reaction.id)
        if reaction in boundary or reaction in objective:
            continue
        if not reaction.metabolites or any(m.id in unassessable for m in reaction.metabolites):
            unknown.append(reaction.id)
            continue
        try:
            balance = reaction.check_mass_balance()
        except (ValueError, TypeError):
            unknown.append(reaction.id)
            continue
        if any(not math.isfinite(value) or abs(value) > 1e-8 for value in balance.values()):
            imbalanced.append(reaction.id)
        else:
            balanced += 1
    return {
        "status": "requires-biological-review",
        "reactionCount": len(model.reactions), "metaboliteCount": len(model.metabolites),
        "geneCount": len(model.genes), "compartments": sorted(model.compartments),
        "objectiveReactions": sorted(r.id for r in objective),
        "boundaryReactions": sorted(r.id for r in boundary),
        "exchangeMappingStatus": "not-verified",
        "internalBalancedCount": balanced, "imbalancedInternalReactions": sorted(imbalanced),
        "unassessableInternalReactions": sorted(unknown), "invalidBounds": sorted(invalid_bounds),
        "metabolitesMissingFormula": sum(not m.formula for m in model.metabolites),
        "metabolitesMissingCharge": sum(m.charge is None for m in model.metabolites),
        "metabolitesUnassessableChemistry": sorted(unassessable),
        "reactionsMissingAnnotations": sum(not r.annotation for r in model.reactions),
        "biologicallyValidated": False, "taxonomicMappingValidated": False,
        "dietaryMappingValidated": False,
        "thermodynamicallyValidated": False, "energyGeneratingCycleCheck": "not-run",
        "limitations": [
            "Formula/charge balance does not establish thermodynamic feasibility or biological plausibility.",
            "Boundary and objective reactions require separate source review; exclusion is not approval.",
            "Annotation presence does not verify reaction identity, strain mapping or pathway activity.",
            "Isotope/adduct notation and stereochemical identity require separate source review.",
        ],
    }


def probe_closed_atp(model):
    """Fixed reference ATP-hydrolysis control on a COPY of a trusted local model.

    This tests one energy-generating-cycle symptom, not full thermodynamics.
    No request-selected objective, model path, reaction mapping or solver exists.
    """
    from importlib.metadata import version
    tolerance = 1e-8
    report = {
        "version": "closed-atp-reference-probe-v1", "status": "unavailable",
        "solver": "glpk", "solverStatus": None, "maximumAtpDissipation": None,
        "numericalTolerance": tolerance, "feasibilityTolerance": 1e-9,
        "objectiveReaction": "ATPM", "objectiveLowerBound": 0,
        "boundaryPolicy": "all-structural-boundaries-fixed-zero",
        "biologicallyValidated": False, "thermodynamicallyValidated": False,
        "unitInterpretation": "Source model flux units, not measured human concentrations",
        "limitations": ["Only the source-specific ATP hydrolysis mapping is tested.",
                        "No detection at the tested tolerance is not proof of thermodynamic feasibility."],
    }
    expected = {"atp_c": -1.0, "h2o_c": -1.0, "adp_c": 1.0, "h_c": 1.0, "pi_c": 1.0}
    try:
        reaction = model.reactions.get_by_id("ATPM")
        mapping = {metabolite.id: coefficient for metabolite, coefficient in reaction.metabolites.items()}
        if mapping != expected or not math.isfinite(reaction.upper_bound) or reaction.upper_bound <= tolerance:
            return {**report, "reason": "unsupported-reference-atp-mapping-or-capacity"}
        if any(not all(math.isfinite(x) for x in r.bounds) or r.lower_bound > r.upper_bound
               for r in model.reactions):
            return {**report, "reason": "invalid-model-bounds"}
        tested = model.copy()
        tested.solver = "glpk"
        tested.solver.configuration.tolerances.feasibility = report["feasibilityTolerance"]
        tested.solver.configuration.timeout = 5
        for boundary in tested.boundary:
            boundary.bounds = (0.0, 0.0)
        objective = tested.reactions.get_by_id("ATPM")
        objective.lower_bound = 0.0  # Remove the source's required maintenance drain for this control.
        tested.objective = objective
        tested.objective_direction = "max"
        import swiglpk
        report.update({"solverVersion": swiglpk.glp_version(), "solverBindingVersion": version("swiglpk"),
                       "solverInterfaceVersion": version("optlang"), "solverTimeoutSeconds": 5,
                       "objectiveUpperBound": objective.upper_bound,
                       "closedBoundaryCount": len(tested.boundary)})
        solution = tested.optimize(raise_error=False)
        report["solverStatus"] = str(solution.status)
        if solution.status != "optimal":
            return {**report, "reason": "optimization-not-optimal"}
        fluxes = solution.fluxes.to_dict()
        if (set(fluxes) != {r.id for r in tested.reactions}
                or not all(math.isfinite(value) for value in fluxes.values())
                or not math.isfinite(solution.objective_value)):
            return {**report, "reason": "nonfinite-or-incomplete-solution"}
        mass_residual = max((abs(sum(r.metabolites[m] * fluxes[r.id] for r in m.reactions))
                             for m in tested.metabolites), default=0.0)
        bound_residual = max((max(0.0, r.lower_bound - fluxes[r.id], fluxes[r.id] - r.upper_bound)
                              for r in tested.reactions), default=0.0)
        objective_residual = abs(solution.objective_value - fluxes["ATPM"])
        if not all(math.isfinite(value) for value in (mass_residual, bound_residual, objective_residual)):
            return {**report, "reason": "nonfinite-residual"}
        report.update({"maxSteadyStateResidual": mass_residual, "maxBoundViolation": bound_residual,
                       "objectiveResidual": objective_residual})
        if max(mass_residual, bound_residual, objective_residual) > tolerance or fluxes["ATPM"] < -tolerance:
            return {**report, "reason": "numerically-unqualified-solution"}
        return {**report, "status": "energy-generation-detected" if fluxes["ATPM"] > tolerance
                else "not-detected-at-tested-tolerance", "maximumAtpDissipation": fluxes["ATPM"]}
    except KeyError:
        return {**report, "reason": "missing-reference-atp-mapping"}
    except Exception:
        # No raw model, driver output, local paths or exception text in the record.
        return {**report, "reason": "reference-probe-unavailable"}
