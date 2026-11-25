# GI-01–GI-10 baseline — current source, not scientific acceptance

Inspected/tested source: `84c2f1c66c1575e7e7196f1166f2d70a43a73772`.
Current task authority: `NEXT_ACTIONS.md` §3 and
`docs/architecture/BLOOM_MULTIFACTOR_GI_INVESTIGATION_GAP_CLOSURE_20261122.md` §4.
**Baseline only. No application/schema/reasoner/action/provider changes.**

The source contains a private-runner interface but no application callsite that
installs it or an actual private reasoning adapter. Ten partial canonical-source
probes and three privacy/failure subresults are recorded; **zero real model calls,
zero scientifically evaluated cases, zero scientific passes**. Running the actual
unconfigured runner returns configuration abstention before any source callback.
That is a guard check, not a reasoned outcome D or ten successful GI evaluations.
Hosted configuration was not inspected. No private account or protected Mac,
Render, network, deployment or database environment was accessed.

## Actual file:line inventory

Statuses describe this exact source and its private-investigation use. Generic
notes can preserve words, but are not typed, verified symptom/event semantics.

| Domain / canonical owner | Status | Current source and observed limitation |
|---|---|---|
| Bloating severity / precision records | EXISTS_BUT_UNWIRED | `shared/precision-nutrition.ts:779` accepts dated optional0–10 bloating; `client/src/pages/PrecisionNutrition.tsx:1243` exposes it. `server/biological-investigation-snapshot.ts:45` projects only lab records, not check-ins. Valid symptom records yielded zero symptom facts. |
| Symptom type, onset, duration, recurrence, warning signs | PARTIAL | `shared/precision-nutrition.ts:779` has timestamp/bloating/notes; dedicated onset/duration/warning fields are absent there. Strict schema probes reject added fields. No typed GI warning projection appears at `server/biological-investigation-snapshot.ts:74`. |
| Bowel frequency, Bristol1–7, straining, incomplete emptying, relief | ABSENT | No dedicated typed fields found in canonical precision/context/experience schemas; `shared/precision-nutrition.ts:779` rejects Bristol/frequency/straining probes. Free text is not normalized bowel observation. |
| Sleep/digestive comfort / experience records | EXISTS_BUT_UNWIRED | `shared/experience.ts:180` has dated sleepHours/digestion; `client/src/components/CheckinRecordSource.tsx:21` displays them. Snapshot requests only experience kind supplement-intake at `server/biological-investigation-snapshot.ts:35`. |
| Hydration and training / experience records | EXISTS_BUT_UNWIRED | `shared/experience.ts:132` activity and `:161` hydration exist. Snapshot explicitly marks activity not-collected at `server/biological-investigation-snapshot.ts:78`; no hydration reader is requested. |
| Medication/current supplement list / precision context | PARTIAL | `shared/precision-nutrition.ts:769` and `:770` are names; UI uses list inputs at `client/src/pages/PrecisionNutrition.tsx:120`. `server/wellness-context.ts:28` includes current medication names, with undated context provenance at `:44`. No taken-dose/start/stop/change timeline or verified adherence follows. currentSupplements is not a snapshot exposure fact. |
| Confirmed supplement use / experience intake | EXISTS_AND_USABLE | `shared/supplement-intake.ts:16` distinguishes takenAt/confirmedAt, unknown quantity, formulation and label; `:29` retains original/current/corrections; `:48` validates full record identity. Snapshot `:44` and `:66` uses current confirmed nutrient rows, never schedules or original+current sums. |
| Label ingredients/excipients and unknown mixtures | PARTIAL | `shared/products.ts:95` has label values/notes; `:106` has ingredients only inside USDA-branded provenance. No generic clinically verified excipient exposure contract is established. Snapshot `server/biological-investigation-snapshot.ts:66` passes nutrient rows, not full ingredient/formulation text. Unknown formulation remains unknown. |
| Conditions: reported/suspected/ruled-out/unknown/none | PARTIAL | `shared/precision-nutrition.ts:771` stores strings, not structured diagnostic states/effective times. `server/wellness-context.ts:27` preserves absent versus present raw fields; an empty list alone is not a verified diagnosis/ruled-out history. GI-07 probe retained null unknown conditions/medications. |
| Menstrual/pelvic events and scoped permission | ABSENT | `shared/precision-nutrition.ts:774` pregnancy context is distinct; no canonical typed cycle dates/pelvic-symptom source is in the inspected check-in/context schemas or snapshot readers. No phase may be inferred from age/sex. Granular menstrual/medication permission revocation cannot be claimed from the global authorize callback. |
| Weight and unintended loss | PARTIAL | `shared/precision-nutrition.ts:782` has dated weight; no structured intentional/unintentional loss assertion in that check-in schema. Check-ins are not projected to P1. A numeric weight difference is not an unintended-loss assertion. |
| Laboratory source values/history | EXISTS_AND_USABLE | `shared/precision-nutrition.ts:621` validates supported labs; `:674` retains unmapped/qualitative source-only rows. Snapshot `server/biological-investigation-snapshot.ts:57` carries active supported values/units/dates/source revision and identity eligibility. GI-05 probe retained four values, without inventing reference ranges, clinical confirmation or RCV. |
| Qualified numeric difference vs clinical interpretation | PARTIAL | `shared/investigation-numeric-facts.ts:25` reuses canonical schemas, comparability and chronological difference only. `:39` rejects unordered date-only same-day points. It is not an anemia diagnosis, meaningful change test, cause or clinical recommendation verifier. |
| Snapshot ownership, stable read and epoch | PARTIAL | `server/biological-investigation-snapshot.ts:31`, `:40`, `:83`, `:86` authorize, hash projected source state and recollect. Existing owned precision readers use user predicates at `server/precision-storage.ts:67`, `:101`. A valid unprojected symptom edit did not change the epoch; a valid confirmed-intake removal did. No output based on unprojected data is thereby qualified. |
| Time precision / intake window | PARTIAL | `shared/recorded-intake-sources.ts:44` is one calendar-date/zone source view; `:55` checks conflicting revisions before date filtering. Snapshot `server/biological-investigation-snapshot.ts:60` retains lab date context; `:69` labels food-record versus confirmed-taken time. Multiweek GI onset/exposure timing is not reconstructed by this source view. |
| P1 actual private engine / two-pass investigation | EXISTS_BUT_UNWIRED | `server/private-investigation-runner.ts:11` defines a dependency-injected engine; `:27` refuses absent/unapproved engines, `:42` invokes once, `:56` returns research-only with null consumer interpretation. Repository search found application definitions, test callsites and no installed app runner adapter. No real GI model/prompt exists in this baseline. |
| P2 reviewed evidence/retraction | PARTIAL | `server/scientific-evidence-retrieval.ts:46` requires explicit reviewed sources, rights and withdrawals; `:68` gates them. Public registry metadata with empty reviews yielded zero eligible cards, not proof of absence of relevant published science. `server/scientific-release-storage.ts:163` requires installed release, `:171` verifies it and `:177` rechecks authority. Actual hosted GI corpus/authority not inspected. |
| Review/action admission / ACTION-01 | PARTIAL | `server/investigation-candidate-admission.ts:35` requires trusted independent current review authority, `:48` canonical source binding and `:66` emits no practical next step. `shared/scientific-contracts.ts:9` is a candidate contract, not a unified question/action runtime. No GI intervention or one-question selection is authorized by this baseline. |
| Consumer presentation | EXISTS_BUT_UNWIRED | Source/check-in/lab UI remains available. `client/src/pages/Insights.tsx:29` and `:35` use separate legacy analysis/recommendation queries; they do not install this private investigation or constitute scientific ACTION-01 admission. |
| SEC-01/02/03/05 boundaries | PARTIAL | `server/precision-routes.ts:79` mounts auth/no-store and `:82` derives session actor; owned encrypted readers at `server/precision-storage.ts:67`/`:101`; source/review admission above. Local controls were tested; retention/backups/provider-held data and hosted readiness were not audited. |
| SEC-04/06 outbound/failure and caches | PARTIAL | Private runner `:7` has no provider transport; `:59` returns fixed fallback on errors. `server/gemini-science-research.ts:2` is separately nonpersonal-only. No installed private engine means its actual logs/retention/egress cannot be verified. Existing synthetic callbacks test mechanics, not actual GI provider/privacy clearance. |
| SEC-07 deployed target readiness | UNVERIFIED | No Render/Mac/Tailscale or production settings inspection/activation; operational pause preserved. |
| SEC-08 shared science isolation | PARTIAL | `server/scientific-release-storage.ts:163`/`:171`/`:177` and candidate-retention gates require exact independent authority/withdrawals. Local release/candidate clean-restore and rejection tests passed. No GI model run/promotion occurred; absence of writes in this read-only probe is not full GI isolation or deployed certification. |

## Baseline case matrix

Full per-case actual source epochs, canonical inputs, safe fallback outputs and
GI-10 subresults are in the **local synthetic-only** receipt bundle at
`/workspace/artifacts/gi-baseline-20261125/GI_BASELINE_RECEIPTS.json`.
Source snapshots and the one-off existing-reader driver stay outside Git.
No new benchmark platform, GI harness, model or answer templates were installed.

All cases are PARTIAL / scientifically NOT_TESTED, with HARNESS_LIMITATION,
EVIDENCE_BLOCKED and INPUT_UNAVAILABLE. Cases with symptoms also have
SNAPSHOT_UNWIRED. Hard assertions are false/unexecuted, not scientific failures.
No A/B/C/D reasoning outcome, hypothesis ranking or clinical result is fabricated.

| Case | Additional measured source limitation |
|---|---|
| GI-01 | Valid bloating records and current supplement-name context; symptom values absent from P1. Full confirmed unknown-formulation record remains an event with zero nutrient rows, not invented zeros. Editing bloating did not change the P1 epoch. |
| GI-02 | Explicit source conditions list retained; qualitative normal lab reports preserved as two source-only rows. No invented normal numbers or habitual soluble-fiber/fluid estimate. Bowel data unavailable. |
| GI-03 | User-reported condition text survives as self-reported context; cycle/pelvic timing unavailable and no cycle inference made. |
| GI-04 | Canonical unknown-composition meal and bloating scalar records accepted; no full single-episode causal timeline or actual model evaluation. |
| GI-05 | Four supported laboratory source values reach P1; symptom progression and unintended weight-loss assertion do not. Clinical urgency/recommendation not evaluated. |
| GI-06 | Canonical meal description accepted without invented composition; bowel, travel and actual cycle timing unavailable. No bundled questions produced. |
| GI-07 | Missing medication/condition inputs stay null, not none; partial meal data has unknown composition. Bloating samples are not projected. |
| GI-08 | Removing a full valid confirmed-intake record changes epoch and removes the event. Actual source-dependent hypothesis/cache/in-flight model invalidation is not evaluated because no real engine/finding exists. |
| GI-09 | Qualitative stool result is preserved source-only; no invented concentration or intervention. Evidence/admission and GI-specific shared-knowledge isolation remain untested. |
| GI-10a | Global collector authorization revocation rejects; granular menstrual/medication permission and real mid-model cancellation not evaluated. |
| GI-10b | Concurrent distinct owned in-memory source projections checked; actual SQL ownership controls pass separately. Exact GI model/cache/output isolation remains untested. |
| GI-10c | Canonical loader error rejection and unconfigured-runner short-circuit checked; real investigator/retrieval timeout/recovery not evaluated. |

The input probes use arbitrary synthetic calendar coordinates to exercise existing
schemas/readers. These are **not** reconstructed case collection/onset/exposure
clock times; longitudinal reasoning is NOT_TESTED. Missing quantities/formulations
are null. The first driver attempts exposed module-format and full-record/unit
fixture issues; the final driver validates full canonical supplement records and
uses the existing unit normalizer while preserving original source text. No
application validator was relaxed or corrected.

## Actual tests and limits

- Current-HEAD focused existing source/runner/admission/arithmetic/P2-release/
  candidate/intake/wellness controls: **78 passed, zero failures/skips**.
- Ten direct canonical-source probes; six unsupported typed-field probes rejected.
- Real model calls/scientific cases/passes: **0 / 0 / 0**.
- No new code/schema/UI/engine/provider or recommendation changes. No additional
  full suite/build/browser/hosted or independent science/security sign-off claimed.
- GI-VAL outlines previously disclosed to development are not sealed. Fresh
  independent custodian-held variants remain required; no answer keys created.

## Minimal failure-based options — not implemented

1. First consider wiring already-existing bloating/check-in and relevant sleep/
   activity source facts to the existing snapshot, with true missingness, source
   precision, actor/purpose and epoch/correction tests. Do not create another tracker.
2. Choose only case-critical absent bowel/exposure/warning/lifecycle capture,
   after reviewing what can reuse current records. Medication names are not doses;
   current context is not historical exposure. No comprehensive new questionnaire.
3. Qualify an actual private reasoning adapter and a rights/review-qualified GI
   source set before scientific baseline evaluation; preserve the operational
   pause and independent model/privacy/cost requirements. Do not fix this by
   injecting missing facts or writing case-specific diagnoses.
4. Then select proportionate action/VOI admission and fresh independent evaluation;
   source arithmetic and mechanical review checks alone do not clear release.

**Required checkpoint:** the scoped handoff §4 says “STOP” after baseline and
“Owner reviews failures before fixes.” This report delivers that checkpoint.
No corrective implementation or ordinary asset/INV-04 work follows until the
scoped owner/Architect choice, as required by the current single queue.
