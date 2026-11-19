# MICOM reference numerical reproducibility correction

2026-11-19. Development-only engineering control; no personal data, network
activation, production dependency or biological/predictive validation.

## Finding

The former test compared two growth values within1e-5 but did not independently
check whether either met the tradeoff objective. The original runtime checked
reaction bounds and steady-state balance after MICOM had removed the temporary
QP growth constraint. Thus two equally inaccurate solves could pass.

Original default-profile runs locally reproduced violations of the required
half-maximum growth target despite an apparently optimal result. This establishes
a numerical convergence/admission defect in this control, not a changed organism,
medium or biological finding. The exact cause of the Mac's uncaptured child
traceback cannot be inferred from its process name alone.

## Solver audit and correction

Pinned MICOM0.37.1 configures hybrid optimality/feasibility near1e-6. Optlang1.8.3
maps these to OSQP absolute AND relative termination tolerances. With other fluxes
near1000, this does not imply every growth constraint is accurate to1e-6.
OSQP's default automatic rho-update interval depends on measured setup time;
optlang also assembles matrices using sets, whose ordering can differ across
fresh interpreters. Polishing can fail even when the ADMM status says solved.

A tighter/scaled experimental profile was insufficient: a fresh-process case
hit the QP iteration limit and MICOM then produced an optimal-status linear
crossover result. The new profile therefore checks the raw QP before MICOM can
perform that fallback. It does not retry until a convenient answer appears.

`hybrid-reference-precision-v2` uses:

- Unchanged assertion and admission tolerance1e-5; no wider tolerance.
- Explicit1e-9 solver feasibility and optimality tolerances.
- One-thread simplex for the LP; fresh community/solver per request.
- Explicit unscaled QP, fixed adaptive-rho interval50, cold initialization.
  Residual-based rho adaptation remains enabled; wall-clock interval selection
  is removed. This profile is qualified only for the pinned small control,
  not recommended as a universal setting for larger communities.
- A per-instance adapter around pinned optlang's `osqp_settings`/`solve_osqp`;
  no installed package or process-global solver modification. Unsupported
  MICOM/COBRA/optlang/OSQP/HiGHS versions fail closed.
- Raw QP status must be `solved`, with finite primal/dual residuals within1e-5.
  Iteration-limit and solved-inaccurate results are rejected before crossover.
- An independently recomputed linear growth maximum, followed by a check that
  the returned growth equals its50% tradeoff target within1e-5. For this
  equal-abundance two-copy model, minimizing squared member growth implies
  that boundary objective. This identity is not assumed for arbitrary models.
- Original finite-flux, reaction-bound and steady-state checks remain required.

Returned provenance records effective settings, LP maximum, target/error and
raw QP status, iterations, residuals, polishing status and rho updates. Failed
optimization still has no inferred growth; closed medium remains infeasible.

## Regression evidence

The new independent-GLPK comparison failed on the former implementation.
Synthetic unit tests reject bad tradeoff values and unsupported backend profiles.
QP iteration-limit/solved-inaccurate injections must fail instead of crossing
over to an apparently optimal result. Fresh interpreters with hash seeds0,1,7
must satisfy the original1e-5 reproducibility tolerance. Existing real spawned
reference-worker and authenticated in-process API tests remain required. The final
combined Linux run passed50 tests, including these paths; Mac confirmation is pending.

Nine local fixed-profile engineering runs had target error below1e-7 and
cross-seed growth variation below2e-8. These are aggregate nonpersonal control
checks, not individual health/simulation records or Apple Silicon acceptance.
Actual Mac confirmation of this correction remains pending.

## SpawnProcess-7

For the exact published guide command, diagnostic instrumentation maps child7
to the deliberately oversized-output test fixture, not the actual reference
worker. A parent rejecting a pipe message can close while that fixture is still
writing; BrokenPipeError/ConnectionResetError are expected in that specific
fixture. It now handles only those expected closures and always closes its pipe.
The parent test still requires failed state, no result and terminated worker.
Real worker errors are not suppressed by this fixture change. A header without
a captured traceback is not enough to classify a different command/run.

## Repeat on the Mac without installation or services

Use the same Python interpreter as the failed run, with the pinned requirements
already installed. First obtain this correction from the development branch:

```bash
git pull --ff-only origin enhance/bloom-experience
git rev-parse HEAD
BLOOM_PY="$HOME/bloom-science/.venv-validation/bin/python"
# If the failed run used .venv312, set BLOOM_PY to that interpreter instead.
"$BLOOM_PY" -c 'import platform, importlib.metadata as m; print(platform.system(), platform.machine()); print({n:m.version(n) for n in ("micom","cobra","optlang","osqp","highspy","python-libsbml")})'
set -o pipefail
"$BLOOM_PY" -m unittest -v tests.test_development_science_policy tests.test_micom_reference tests.test_development_science_jobs tests.test_development_science_api tests.test_reference_model_audit tests.test_ollama_development 2>&1 | tee "${TMPDIR:-/tmp}/bloom-micom-validation.log"
```

The reference test itself launches fresh interpreters with three hash seeds;
no global seed, assertion relaxation or repeated retries to select a passing
answer are required. Keep any failed-run traceback/log outside Git. Report the
full traceback and final summary if a worker fails; do not activate networking.
No Mac installation, Tailscale Serve, router, Render or production change is
part of this correction. No bitwise or Apple Silicon determinism is claimed.

## Primary technical references

- [OSQP convergence and timing-based rho updates](https://osqp.org/docs/release-0.6.3/solver/index.html)
- [OSQP0.6 solver settings](https://osqp.org/docs/release-0.6.3/interfaces/solver_settings.html)
- Installed pinned source audit: `micom/util.py` adjust_solver_config;
  `micom/problems.py` cooperative_tradeoff; `micom/solution.py` solve/crossover;
  `optlang/hybrid_interface.py` osqp_settings/solve_osqp;
  `optlang/matrix_interface.py` build.
