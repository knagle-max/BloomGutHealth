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
