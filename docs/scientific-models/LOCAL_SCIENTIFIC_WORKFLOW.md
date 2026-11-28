# Local scientific development — current workflow

Owner decision: Render-to-Mac integration is PAUSED. Do not change Tailscale,
network policy, Serve, Render configuration or deployments. Existing remote
interfaces and the development service are retained, optional and inactive for
this workflow. The failed Serve attempt's actual machine state is not inferred
or remotely changed. Mac scientific preparation is complete, owner-reported.

## One local command, no infrastructure

Use the existing checkout and pinned validation environment. No Node, Uvicorn,
API credentials, Ollama, VPN, listener or cloud connection is required. Do not
recreate or upgrade the environment.

```bash
BLOOM_PY="$HOME/bloom-science/.venv-validation/bin/python"
export BLOOM_RUNTIME_ENV=development
export BLOOM_LOCAL_SCIENCE_ENABLED=true
BLOOM_EXPERIMENT_DIR="$HOME/bloom-science/private-experiments"
umask 077
mkdir -p "$BLOOM_EXPERIMENT_DIR"
"$BLOOM_PY" -m ml_service.local_reference --output "$BLOOM_EXPERIMENT_DIR/reference-pair-001.json"
```

The existing parent directory must be owned by you with0700 permissions. Output
is0600, exclusive/no overwrite, and refused under Git or symlink ancestors. For
another run, choose a new filename. Never save experiment results inside the
checkout, even in an ignored directory. No upload occurs. Only generic completion
status is printed; records remain private. Failed workers produce no fabricated
results; unexpected optimization status is retained with a failed-control flag.

The command reuses the existing spawned supervisor: one worker, bounded wall/CPU,
sampled RSS, cancellation on shutdown and bounded output. It runs the fixed
baseline and closed-medium controls sequentially. Inputs do not accept personal
profiles, model-generated code, paths to models, shell commands or freeform tools.

Review the JSON in a local editor: compare expectedControlStatuses, each result's
status, model digests, package/solver versions, solver diagnostics and resource
telemetry. Baseline optimal plus closed-medium infeasible is an ENGINEERING
control, not proof of microbial biological/predictive validity. The two-copy
E. coli reference does not become a validated gut community by running it locally.
No simulated growth/flux value is a measured human concentration or clinical
outcome. No recommendations or shared-knowledge promotion occur.

## Scientific development order

1. Preserve the verified pinned reference/reproducibility and failed-solve tests.
2. Qualify one small published microbial community: reconstruction/model versions,
   licences, taxonomic identity, metabolites, compartments, exchanges, mass/charge
   balance, thermodynamics/energy-cycle checks and medium mappings. Missing
   mappings remain unsupported; abundance is not metabolic activity.
3. Add one fixed, documented substrate intervention with mechanistically justified
   expected behavior and negative controls; record uncertainty and solver failures.
4. Select rights-cleared experimental measurements for the SAME observables and
   conditions, freeze leakage-safe held-out splits and obtain independent review.
   A reused dataset is not independent predictive evidence.

The current reference-model and predictive-dataset rights/qualification blockers
remain recorded in MAC_DEVELOPMENT_ACCEPTANCE.md. Do not invent mappings or expand
this runner's allowlist before the relevant model/operation is reviewed. Production
remains independent of these local tools. Future remote transport can reuse the
same versioned calculation contract after a separate activation decision.

For targeted local software validation:

```bash
"$BLOOM_PY" -m unittest -v tests.test_local_reference tests.test_micom_reference tests.test_reference_model_audit
```

Only synthetic/nonpersonal source, tests and reviewed metadata go into Git. All
personal datasets, results, model caches and credentials remain outside Git. Keep
private local backups and review licence terms before sharing reference model bytes.
