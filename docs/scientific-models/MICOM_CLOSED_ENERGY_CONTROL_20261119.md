# Fixed reference closed-energy control

The local reference now runs a closed-boundary ATP-maintenance probe before
constructing the MICOM community. This addresses a specific model-consistency
failure mode, not merely successful example execution. It uses the existing
pinned environment and model; no new dependencies, services or infrastructure.

## Defined experiment

- Verify both community member file hashes against the existing pinned reference.
- Use an independent copy of that reference model; the source bounds, objective,
  solver and feasibility configuration remain unchanged.
- Require the exact source ATPM hydrolysis mapping: ATP + water → ADP + proton +
  phosphate in the source cytosolic metabolite identifiers. Missing/different
  mappings or inadequate objective capacity are unavailable, never inferred.
- Fix every structural boundary flux to zero. Relax the reference ATPM minimum
  maintenance drain to zero for this control only; retain its original upper cap.
- Maximize ATPM with the explicitly selected GLPK5.0 / swiglpk5.0.13 interface,
  feasibility tolerance1e-9 and5second solver timeout. No caller-selected
  objective, solver, mapping, path, code or arbitrary simulation request is added.
- Require optimal status, complete finite fluxes, steady-state/bound/objective
  residuals≤1e-8 and no materially negative objective before admitting a result.

The1e-8 detection/admission tolerance is an engineering numerical threshold with
solver feasibility set one order tighter. It is **not a clinical boundary**, an
assertion of exact arithmetic or a relaxation of the existing1e-5 MICOM growth
reproducibility assertion. A result below it is labelled
`not-detected-at-tested-tolerance`, not proof of zero possible energy artifacts.
Actual solver/binding/interface versions, constraints, tolerances and residuals
are recorded in the private experiment record.

## Evidence and failure controls

A negative synthetic model cannot regenerate ATP. A deliberately added internal
ATP-regeneration reaction produces a positive closed-system cycle, which the
probe detects. Unsupported/missing mappings, nonfinite solutions and a false
optimal status with nonsteady flux cannot pass. Tests verify source model bounds,
objective, solver identity and its tolerance configuration are unchanged.

The pinned reference passes this control. If the control is unavailable,
numerically unqualified or detects energy generation, the fixed-reference runner
refuses community execution instead of producing a qualified growth result.
Existing model/source gates and all other permission/resource limits remain.

Validation:74 scientific/service/pilot Python tests and20 isolated Node tests,
including the real in-process ASGI/spawned MICOM bridge, pass with zero skips.
Actual updated Apple Silicon execution is NOT_RUN here; previous owner-reported
Mac validation does not certify this new check. The same local commands exercise
it without networking or credentials:

```bash
"$HOME/bloom-science/.venv-validation/bin/python" -m unittest -v tests.test_reference_model_audit tests.test_micom_reference
```

## Scientific limits

This is one source-specific ATP dissipation probe under closed structural
boundaries. It does not establish thermodynamic feasibility, physiological
exchange mapping, NADH/GTP or other energy-cycle absence, strain/pathway validity,
dietary substrate identity, microbial activity or independent predictive accuracy.
The two-copy E. coli control is not a validated human gut community. Model-data
commercial rights remain uncleared. All biological/thermodynamic/predictive/
clinical validation flags remain false; no personal recommendation is generated.

Individual fluxes and experiment records remain private outside Git. The source
contains synthetic test definitions and pass/fail metadata, not generated outputs.
Render-to-Mac integration remains paused; normal Bloom has no dependency on this
optional local scientific path.
