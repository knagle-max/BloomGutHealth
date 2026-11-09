# First molecular reference and synthetic solver increment

This is approved v0.6 B0/B1 engineering after bounded M0. It is not a biological model, an organism-to-flux predictor, a personal-data research grant or public/clinical promotion. The full B0/B1 acceptance remains open.

## One reference graph

`shared/scientific-contracts.ts` extends the existing evidence audit with a typed molecular context. It resolves the actual existing relationship, endpoints and sources; a withdrawn source, unresolved endpoint or invented relationship yields no molecular context. Composition/guidance edges do not become molecular capacity. The vocabulary distinguishes source observations, measured quantities, published strain capacity, possible curated pathways, modelled reaction/community exchange, hypothetical food scenarios, human studies, approved action and withheld clinical claims.

Existing broad mechanistic/human links can carry only their corresponding **reference** class. Quantity and unit stay null. Strain, genome, gene, protein, enzyme/EC, Rhea reaction, cofactor, transport, production/consumption, community exchange and host-compartment links remain unknown where the existing source graph does not specify them. A taxon/genus name never supplies these missing facts. Citation metadata carries the registry version and original source URL; it grants no reconstruction/dataset reuse licence. `modelReuse:not-assessed`, `personalActivityVerified:false` and `applyToUser:false` are explicit. Independent scientific review remains separate.

This does not add a second graph/database, activate a new endpoint or change meal ranking. The current evidence-audit endpoint returns the additive reference metadata. Full strain-specific annotation and the initial biological pathway-family positive/negative curation are still required; the current broad source links are not a substitute.

## Real CPU execution, deliberately synthetic

`ml_service/research/stoichiometry.py` implements `synthetic-vertex-lp-v1`, a small bounded linear program with exact rational arithmetic. It reduces independent internal balance equations, enumerates bound-defined vertices, checks feasibility and maximizes an explicit linear objective. At most six reactions and eight internal pools; all bounds/coefficient magnitudes and rational denominators are bounded. No solver service, network call, dependency, account source, model download or API import. Source is pinned by the receipt's SHA256 and the repository's MIT licence; no third-party reconstruction is included.

Results carry `scope:synthetic`, `evidenceState:modelled_reaction_flux`, `unit:synthetic-flux-unit`, engine/model versions and `applyToUser:false`. Uptake is negative exchange; secretion positive. An infeasible system returns null fluxes/objective, distinct from an exactly zero optimum. The supplied producer/consumer model checks internal steady-state balance; it is **not** an elemental/charge audit of biochemical reactions or a calibrated mmol/gDW/h result. No actual biological units, organism abundance, food-to-colon conversion or host concentration are asserted.

Six Python tests cover actual optimization, exact fractional quantities, consumption subtraction, zero versus infeasible controls, exchange reversals, wrong-sign/capacity controls, degenerate fixed bounds/redundant balances and malformed/unknown/nonfinite/unresolved inputs. Nine hand-calculated fixed benchmark cases include a gross-producer-only comparator to expose the mistake of ignoring consumers. These are synthetic mathematical controls, not an independently held-out biological benchmark.

Reproduce without installing packages:

```sh
python3 -m unittest discover -s tests -p test_synthetic_stoichiometry.py
python3 scripts/qa/synthetic-molecular-benchmark.py
node --import tsx --test tests/molecular-reference.test.ts tests/scientific-contracts.test.ts tests/metabolite-research.test.ts tests/weekly-planner.test.ts tests/biology.test.ts
```

## Next engineering dependencies

Use this solver as a falsifiable synthetic control, not a production replacement for a curated genome-scale reconstruction. Continue the existing graph's source-reviewed strain/gene/enzyme/reaction/compartment annotations and version/rights resolution; pin a suitable actual licensed model/solver, benchmark coverage and negative biological cases, and keep calibrated/human evidence separate. The restricted research adapter remains unchanged/default denied; compute, restricted viewing and applying to users remain independent. Personal shadow processing is not authorized. No UI change or physical-device acceptance is claimed by this backend research increment.


## Private service integration increment

The existing private Python service now accepts POST `/api/ml/research/synthetic`, authenticated by its existing service middleware **before body parsing**. It streams at most512 bytes, accepts only a strict version plus one of four fixed first-party scenarios, and rejects account IDs, taxa, foods, arbitrary coefficients/model uploads and unknown fields. One nonblocking per-process computation slot prevents an unbounded queue; CPU work runs off the event loop. No assay, stored account record, network model, cache, database or external provider is read. Existing composition-only analysis and disabled raw uploads are unchanged. Responses remain no-store and without browser CORS.

`server/synthetic-molecular.ts` reuses the existing server-only destination/token/no-redirect client and strict synthetic response schema. Requests contain only the fixed command; responses must match command/scenario hash, pinned engine/model, synthetic scope/units, false personal/apply flags, all zero internal balance residuals, and consistent nulls for infeasibility. The bridge is **not registered as a public app route**, and no normal Today/food/Progress/AI/export path invokes it. This does not grant a person-linked research entitlement or activate the restricted explorer.

`scripts/qa/synthetic-molecular-http.mjs` starts an ephemeral authenticated localhost Python process and runs the real Node→HTTP→CPU solver→Node validator for positive, zero, infeasible and uptake-reversal controls. It also checks unauthenticated/oversized/personal-field rejection, uses only an ephemeral synthetic token and terminates its own child process. Existing CI now runs this check using the pinned Python test environment (`uvicorn==0.52.1`). No separate app/server, paid service, deployment resource, sensitive fixture or production database is created. The full Express→Python practical optimizer and privileged research viewer remain separate open milestones; this increment proves only the internal synthetic molecular bridge.
