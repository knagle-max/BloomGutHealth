"""Offline MICOM engineering control, not a gut reconstruction or predictor.

Uses only MICOM's bundled two-copy E. coli core test taxonomy. No user data,
arbitrary file paths, model downloads, generated code, or network operations.
No application startup imports this optional module.
"""
import hashlib
import importlib.metadata
import math
import platform
from pathlib import Path
from .development_policy import require_development_science

VERSION = "micom-reference-control-v1"
SOLVER_PROFILE = "hybrid-reference-precision-v2"
SOLVER_TOLERANCE = 1e-9
NUMERICAL_TOLERANCE = 1e-5
TRADEOFF_FRACTION = 0.5
# Identity of the bundled engineering fixture in the tested MICOM0.37.1 wheel.
# This digest is not biological review or permission to redistribute the model.
REFERENCE_SHA256 = "36300ad00320f1ffde76f2ffca06be6403759d92ac320535d961a0ab2d0c94f1"


def _validate_reference_growth(growth, maximum):
    # For this two-copy equal-abundance control, minimizing the sum of squared
    # member growth rates puts community growth at fraction * LP maximum.
    # MICOM removes the temporary QP growth bound on return, so checking only
    # original reaction bounds cannot detect a violation of that constraint.
    if (not math.isfinite(growth) or not math.isfinite(maximum) or maximum <= 0
            or abs(growth - TRADEOFF_FRACTION * maximum) > NUMERICAL_TOLERANCE):
        raise ArithmeticError("Reference solution violates the tradeoff growth objective.")


def _configure_reference_solver(community, versions):
    # This per-instance adapter uses the two pinned optlang backend hooks below;
    # never patch installed packages or a process-global solver implementation.
    expected = {"micom": "0.37.1", "cobra": "0.30.0", "optlang": "1.8.3",
                "osqp": "0.6.7.post3", "highspy": "1.16.0"}
    if any(versions.get(name) != version for name, version in expected.items()):
        raise ValueError("Unsupported reference backend; use the pinned development requirements.")
    config, backend = community.solver.configuration, community.solver.problem
    config.timeout = 20
    config.tolerances.feasibility = SOLVER_TOLERANCE
    config.tolerances.optimality = SOLVER_TOLERANCE
    config.lp_method = "simplex"
    config.presolve = False
    backend.settings["threads"] = 1
    original_settings, original_solve = backend.osqp_settings, backend.solve_osqp
    diagnostics = []

    def settings():
        # OSQP's automatic rho-update interval depends on measured setup time.
        # Fix the interval, retain residual-based adaptation, and start cold.
        return {**original_settings(), "adaptive_rho_interval": 50, "warm_start": False}

    def solve_checked():
        original_solve()
        info = backend.info
        # MICOM can crossover an iteration-limited QP into an 'optimal' LP.
        # Refuse before that fallback can conceal QP nonconvergence.
        if info.status != "solved":
            raise ArithmeticError("Reference QP did not converge.")
        primal, dual = float(info.pri_res), float(info.dua_res)
        if (not math.isfinite(primal) or not math.isfinite(dual)
                or max(abs(primal), abs(dual)) > NUMERICAL_TOLERANCE):
            raise ArithmeticError("Reference QP residuals exceed numerical tolerance.")
        diagnostics.append({"status": info.status, "iterations": int(info.iter),
                            "primalResidual": primal, "dualResidual": dual,
                            "polishStatus": int(info.status_polish), "rhoUpdates": int(info.rho_updates)})

    backend.osqp_settings, backend.solve_osqp = settings, solve_checked
    return {"feasibility": config.tolerances.feasibility,
            "optimality": config.tolerances.optimality,
            "lpMethod": config.lp_method, "presolve": config.presolve,
            "threads": backend.settings["threads"], "osqp": settings(),
            "initialization": "fresh-community-and-solver-per-request",
            "bitwiseDeterminismEstablished": False}, diagnostics


def validate_reference_command(command: dict) -> None:
    if (type(command) is not dict or set(command) != {"version", "scenario"}
            or command["version"] != VERSION
            or command["scenario"] not in ("baseline", "closed-medium")):
        raise ValueError("Only the fixed nonpersonal reference control is supported.")


def run_reference(command: dict, environment=None) -> dict:
    require_development_science(environment)
    validate_reference_command(command)

    # Optional dependencies belong only to a separate development environment.
    import cobra
    import micom
    from micom.data import test_taxonomy

    taxonomy = test_taxonomy(2)
    if (len(taxonomy) != 2 or taxonomy["id"].isna().any()
            or taxonomy["id"].astype(str).duplicated().any()):
        raise ValueError("Reference community identity is unverified.")
    taxonomy["abundance"] = [0.5, 0.5]
    members = []
    # Both members must be the pinned control. Checking only the first file
    # would allow an unverified second reconstruction into the same receipt.
    for _, member in taxonomy.iterrows():
        member_hash = hashlib.sha256(Path(member["file"]).read_bytes()).hexdigest()
        if member_hash != REFERENCE_SHA256:
            raise ValueError("Reference model identity is unverified.")
        members.append({"id": str(member["id"]), "sha256": member_hash,
                        "imposedAbundance": float(member["abundance"])})
    model_path = Path(taxonomy.iloc[0]["file"])
    model_hash = REFERENCE_SHA256
    from .reference_model_audit import audit_model
    model_audit = audit_model(cobra.io.read_sbml_model(str(model_path)))
    if model_audit["invalidBounds"]:
        raise ArithmeticError("Reference model has invalid bounds.")
    provenance = {
        "version": VERSION, "scenario": command["scenario"],
        "scope": "nonpersonal-engineering-control", "observedBiology": False,
        "clinicalValidation": False, "predictiveValidation": False,
        "model": {"id": "micom-bundled-e-coli-core-two-copy-control",
                  "sha256": model_hash, "members": members, "source": "micom.data.test_taxonomy",
                  "declaredSourceModelId": "e_coli_core",
                  "declaredOrganism": "Escherichia coli str. K-12 substr. MG1655",
                  "declaredTaxon": "https://identifiers.org/taxonomy/511145",
                  "declaredSourceSnapshot": "BiGG Nov 21, 2016, as recorded in bundled SBML notes",
                  "declaredSourcePublication": "https://doi.org/10.1128/ecosalplus.10.2.1",
                  "sourceModelPage": "https://bigg.ucsd.edu/models/e_coli_core",
                  "sourceTerms": "https://biggdata.ucsd.edu/license",
                  "commercialModelRights": "commercial-use-and-redistribution-not-cleared",
                  "rightsDisposition": "research-terms-observed-not-a-commercial-or-production-approval"},
        "versions": {name: importlib.metadata.version(name) for name in
                     ("micom", "cobra", "optlang", "osqp", "highspy", "python-libsbml")},
        "python": platform.python_version(), "platform": platform.system(),
        "machine": platform.machine(), "solver": "hybrid", "tradeoffFraction": TRADEOFF_FRACTION,
        "solverProfile": SOLVER_PROFILE,
        "modelAudit": model_audit, "numericalTolerance": NUMERICAL_TOLERANCE,
        "unitInterpretation": "Model objective/flux units; human concentration interpretation unsupported.",
        # Uncommitted development code has no invented release commit/version.
        # Fixed code-file digests identify the actual local implementation.
        "implementationArtifacts": {
            filename: hashlib.sha256(Path(__file__).with_name(filename).read_bytes()).hexdigest()
            for filename in ("micom_reference.py", "reference_model_audit.py", "development_policy.py")
        },
    }
    # Explicit hybrid backend avoids selecting an installed commercial solver.
    community = micom.Community(taxonomy, solver="hybrid", progress=False)
    # Override MICOM's large-model defaults AFTER construction. OSQP's residual
    # stopping rule includes a relative term: 1e-6 is not an absolute 1e-6
    # guarantee on every constraint when other fluxes are of order 1000.
    configuration, qp_diagnostics = _configure_reference_solver(community, provenance["versions"])
    provenance["solverConfiguration"] = configuration
    if command["scenario"] == "closed-medium":
        community.medium = {reaction_id: 0.0 for reaction_id in community.medium}
    provenance["mediumUptakeBounds"] = dict(sorted(community.medium.items()))
    provenance["solverTimeoutSeconds"] = 20
    try:
        maximum = community.optimize(fluxes=False, raise_error=True)
        if maximum is None or maximum.status != "optimal":
            return {**provenance, "status": str(community.solver.status or "optimization-failed"), "growthRate": None,
                    "limitations": ["No optimal linear growth reference; no flux inferred."]}
        maximum_growth = float(maximum.growth_rate)
        solution = community.cooperative_tradeoff(fraction=TRADEOFF_FRACTION, fluxes=True)
    except cobra.exceptions.OptimizationError:
        # A closed medium can be infeasible because maintenance remains required.
        # Never fabricate a zero flux or zero growth rate for a failed solve.
        return {**provenance, "status": str(community.solver.status), "growthRate": None,
                "limitations": ["Optimization failed under the imposed constraints; no flux inferred."]}
    if solution is None or solution.status != "optimal":
        return {**provenance, "status": "optimization-failed", "growthRate": None,
                "limitations": ["No optimal solution; no flux inferred."]}

    flux = {r.id: float(solution.fluxes.loc[r.community_id, r.global_id])
            for r in community.reactions}
    if (not math.isfinite(float(solution.growth_rate))
            or not all(math.isfinite(v) for v in flux.values())):
        raise ArithmeticError("Nonfinite reference solution.")
    _validate_reference_growth(float(solution.growth_rate), maximum_growth)
    residual = max(abs(sum(float(coefficient) * flux[r.id]
                           for r in metabolite.reactions
                           for coefficient in [r.metabolites[metabolite]]))
                   for metabolite in community.metabolites)
    bound_error = max(max(r.lower_bound - flux[r.id], flux[r.id] - r.upper_bound, 0.0)
                      for r in community.reactions)
    if residual > NUMERICAL_TOLERANCE or bound_error > NUMERICAL_TOLERANCE:
        raise ArithmeticError("Reference solution violates numerical tolerances.")
    return {
        **provenance, "status": solution.status,
        "growthRate": float(solution.growth_rate), "maxSteadyStateResidual": residual,
        "maxBoundViolation": bound_error,
        "linearGrowthMaximum": maximum_growth,
        "tradeoffGrowthTarget": TRADEOFF_FRACTION * maximum_growth,
        "tradeoffGrowthError": abs(float(solution.growth_rate) - TRADEOFF_FRACTION * maximum_growth),
        "qpConvergence": qp_diagnostics,
        "limitations": [
            "Two copies of one E. coli reference model, not distinct microbial species or a gut community.",
            "Equal abundances are imposed test parameters, not measured metabolic activity.",
            "Steady-state numerical balance is not a chemical mass/charge audit or biological validation.",
            "Default reference medium is not a dietary substrate mapping or human exposure.",
            "Fluxes and growth are conditional simulations, not measured concentrations or clinical outcomes.",
            "Model redistribution, predictive validation and production promotion remain unapproved.",
        ],
    }
