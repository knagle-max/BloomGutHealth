# BLOOM — Multi-Model Biological Investigation: Privacy, Provider Routing & Verification
## Architect decision amendment and Codex implementation handoff

**Document ID:** INT-MODEL-20261120-R1  
**Date:** 20 November 2026  
**To:** Chief Architect & Integration Lead; Codex / sole developer  
**CC:** Security & Privacy, AI/ML, Science & Biology, Legal/Regulatory, User Testing  
**Disposition:** **APPROVE WITH TARGETED IMPLEMENTATION AMENDMENTS.** This is a design and implementation handoff, **not proof of live multi-provider activation, provider contractual authorization, independent security acceptance or clinical release**.

## 0. Binding scope and execution order

Maintain one Bloom scientific-evidence, personal-source, eligibility and action architecture. This document strengthens three existing requirements: (1) privacy separation of private investigation and external public science research; (2) provider-specific transmission, retention, training-use, billing and permitted-purpose policy; (3) complete cache/result lineage binding provider, model, sources, policy and consent. Do **not** introduce a second AI orchestration engine, a second scientific graph, another recommendation/claim approval system, or mandatory Claude/Grok subscriptions.

**Codex alone implements** after the Architect maps this into `NEXT_ACTIONS.md` and existing investigation / scientific-computing / persistent-knowledge requirements. Do not delay Food #12, report-wide Response #15 or v0.6 Core for optional model-verifier expansion. The high-security user-owned Private Vault is an **alternative execution/data mode**, not a replacement for Bloom Cloud. No personal data are authorized to cross from a strict local/private vault to any external provider without separate, explicit scope authorization.

## 1. Verification basis: exact branch and architectural authority

Read-only inspection of `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`, **commit `63389d2aa8c41d97bb60c0471a2aa0f32503f0b2`** (November 20, 2026). Relevant current code:

| File | Existing verified behavior | Important remaining boundary |
|---|---|---|
| `server/metered-ai.ts` | OpenAI-specific `MeteredAIExecutor`; explicit feature authorization and consent, spend ledger, token/byte limits, provider circuit, request idempotency, forced `store:false`, deny streaming/background; declared feature keys include `science-ranking` | The executor is **not provider-neutral**, no separately approved `biological-investigation` feature key, no demonstrated complete user-health external transmission approval. The `store:false` flag is not a contractual no-retention guarantee. |
| `server/private-investigation-runner.ts` | In-process/private-runtime engine; fresh permissions, source epoch and evidence version checks after compute; research-only result, no consumer interpretation | Not a proven live OpenAI personal-investigation integration. No outbound network/provider tools accepted in this path. |
| `server/biological-investigation-snapshot.ts` | Account-scoped structured personal source facts with `externalTransferPermitted:false`, source epochs | Must not be forwarded unmodified to Gemini or an external AI feature without a *separate* opt-in transfer contract. |
| `server/scientific-question-boundary.ts` | Allows private analysis to nominate only an approved public research `taskId`; server selects one independently reviewed general question plus source excerpts from a digest-checked catalogue; rejects missing/withdrawn/expired tasks | Catalogue installation, provider dispatch and complete leak-free end-to-end activation not verified. **This is not an anonymizer.** |
| `server/gemini-science-research.ts` | Dedicated nonpersonal `generateContent` adapter with constrained question and rights-reviewed excerpts; guarded by env, reviewed model allowlist, spend reservation/idempotency, strict response and research-only candidate | A separate research adapter, not yet a universal metered multi-vendor executor or full autonomous literature retrieval service. Current endpoint is **not** Google's Interactions API. |
| `ml_service/research/ollama_development.py` | Fixed local synthetic-only smoke test with `OLLAMA_NO_CLOUD=1` | Not an authorized general-purpose personal investigation or production model. |
| `server/investigation-candidate-admission.ts` and canonical scientific eligibility | Trusted account/evidence/review binding before admitting a narrow candidate | Candidate generation does not independently grant treatment, causal, clinical or consumer action authority. |

**Controlling architecture:** `docs/architecture/BLOOM_EVIDENCE_GROUNDED_AI_BIOLOGICAL_INVESTIGATION_IMPLEMENTATION_DECISION_20261118.md` authorizes dynamic, unfamiliar-case hypothesis exploration under deterministic evidence/safety admission. `docs/architecture/BLOOM_PERSISTENT_SCIENTIFIC_LEARNING_LLM_INTEGRATION_ARCHITECT_DECISION_20261118.md` preserves nonpersonal knowledge releases and separate account-private learning. `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md` does **not** authorize pooled personal-data model training. These governing decisions take precedence over simplistic “one LLM paraphrases another” approaches.

## 2. Provider matrix: approved intent is not live availability

| Provider | Intended use | Data class | Status at inspected SHA | Exact release condition |
|---|---|---|---|---|
| **OpenAI** | Existing optional nutrition/science features; separately authorized advanced **personal** investigation | Personal *only* if account, feature, provider, purpose and sensitive category transmission consent all explicitly allow it; otherwise nonpersonal | OpenAI metered executor code exists. Personal investigation cloud execution not demonstrated | Dedicated investigation policy; explicit provider display; retained model/version, billing, request bounds, data minimization, source/consent recheck and science acceptance. |
| **Google Gemini** | Public literature/source analysis and alternative hypotheses | **Reviewed nonpersonal published science only**; not account-specific anonymized medical facts | Constrained research adapter and public-task selection implemented separately; live integration not confirmed | Approved public task catalogue, rights review, independently verified provider endpoint/model/tier/logging policy and end-to-end blocked-leak tests. |
| **Claude / Grok** | Optional independent research-source challenge | Same nonpersonal public-science class, unless independently approved otherwise | **Not confirmed** | Enable only after incremental held-out benefit, current licensing/retention/endpoint review, costs and isolated no-personal-data tests. Multiple agreeing LLMs do not constitute independent scientific corroboration. |
| **Ollama** | Synthetic local development | Synthetic/nonpersonal fixtures | Development smoke only | Separate security, resource and model-rights acceptance to consider real private workloads; no accidental cloud fallback. |

**No fixed “OpenAI Pass 1 must de-identify a medical story” mandate.** Local/private analysis may identify a broad science topic, then nominate a *catalogue task ID only*. The external task text and excerpts must be **independently vetted, assembled solely from published reference materials, and entirely nonpersonal**. A rare combination, uncommon clinical sequence or model-composed question can still disclose personal information even when names are absent.

## 3. Mandatory trust boundaries and data flow

```text
Account-owned records / user-owned vault
    │ (authenticated permission + purpose; no logs of source content)
    ▼
Canonical typed InvestigationSnapshot ───► PRIVATE/local investigator
    │                                          │
    │ NO direct provider access                 └─► competing hypotheses as UNTRUSTED candidates
    │                                                        │
    │                        nominate task ID ONLY ◄─────────┘
    │                                   │
    │                         reviewed task catalogue
    │                         independent general public question
    │                         rights-cleared public excerpts
    │                                   │
    ╳  PRIVATE RECORDS NEVER CROSS      ▼
    │                         Gemini / optional public challenger
    │                                   │ untrusted nonpersonal evidence candidate
    │                                   ▼
    └──────────────────────► original-source and deterministic verifier
                                        │ fresh consent/source/evidence checks
                                        ▼
                          existing claim + action eligibility gate
                                        │
                             approved qualified result OR abstain
```

**Network-boundary invariant:** `privateInvestigationSnapshot` and equivalent typed private facts can never be serialized into any `PublicResearchTask`, provider message, public-search query, cache key sent across domains, tracing span, error report or retry envelope. No “sanitize then send” fallback. The only permitted output of the internal task selector is a stable, non-user-derived ID that resolves **server-side** to approved public text. A task ID must not encode a patient, account, genome or event chronology. Require allowlisted destinations and egress observability on the server; do not let models choose arbitrary URLs, tools or connectors.

**External research is not a diagnostic agent.** Original peer-reviewed or otherwise appropriately reviewed research, actual source locators, negative results, applicability and license checks remain independent of provider-generated narratives. Never promote research candidates directly to durable reviewed shared science or user-facing treatment choices.

## 4. Add one provider-policy envelope, not a second executor

Create an internal policy interface that *wraps and extends* existing `SpendLedger`, `SharedProviderCircuit`, source eligibility and feature-gating logic. Keep actual endpoint payload builders **provider-specific**. Illustrative proposed contract (field names require Architect reconciliation):

```ts
type ProviderId = 'openai' | 'google-gemini' | 'anthropic' | 'xai' | 'bloom-private';
type DataClass = 'nonpersonal-published-science' | 'consented-personal-summary' | 'synthetic';
type AIPurpose = 'personal-biological-investigation' | 'public-science-challenge' | 'synthetic-research';

type ProviderExecutionPolicy = {
  policyVersion: string;
  provider: ProviderId;
  endpointFamily: string;    // e.g., OpenAI Responses vs Gemini generateContent vs Interactions
  modelId: string;           // exact vendor-resolved version, NOT a generic display label
  region: string | null;
  billingTier: string;       // no uninspected free/paid substitution
  purpose: AIPurpose;
  allowedDataClass: DataClass;
  retentionMode: 'stateless-request' | 'provider-application-state-disabled' | 'provider-stateful';
  providerAbuseMonitoring: 'contract-reviewed' | 'unknown';
  trainingUseApproval: 'not-authorized' | 'separately-reviewed';
  requiredConsentPurposeId: string | null;
  maximumRequestBytes: number;
  maximumInputTokens: number;
  maximumOutputTokens: number;
  maxLatencyMs: number;
  tariffReference: string;
  circuitGroup: string;
  rightsPolicyRevision: string;
  enabled: boolean;
};
```

**Provider adapter controls:**

- Validate exact **endpoint family**, provider-specific request flags, account/product tier, data-use terms and supported controls. `store:false` is not a portable cross-vendor argument. Do not silently migrate from Gemini `generateContent` to `Interactions` or enable server-side history, grounding/search tools, logs or batch/background execution.
- OpenAI Responses: continue forcing `store:false` for allowed stateless operations, but disclose that **application state** and **abuse-monitoring retention** are different; ZDR/Modified Abuse Monitoring eligibility is organization/endpoint-specific and not implied by `store:false`.
- Gemini `generateContent`: use the current endpoint-specific logging/data-use and project settings; Google's **Interactions API** has its own storage defaults/controls and must be treated as a **new endpoint configuration** requiring review. Provider/project logs can have separate retention from conversation state. Do not assume the Gemini adapter has disabled all Google retention simply because no `store` field is present.
- Gemini scientific research remains **nonpersonal** even if a paid tier offers more favorable confidentiality terms. Check Google terms for prohibited medical/clinical uses and source-to-provider excerpt rights at activation.
- Disable unknown provider/model/tier/retention policy; fail closed. No unreviewed fallback from local to paid cloud, from paid to free tier, or from one vendor to another. Consent is exact-purpose and provider-scoped. Recheck permission **before send** and **before result publication**, including late jobs.
- Keep usage receipt metadata (feature, provider/model, endpoint, tariff, policy version, usage/estimated cost, request ID, time, status) **without** raw personal prompts or results in general logs. Limit diagnostic metadata to a threat-modeled account-private encrypted store where justified; never emit provider keys or authorization headers.

**Documentation verification source register (checked 20 November 2026; recheck on activation):**
- OpenAI API data controls: https://developers.openai.com/api/docs/guides/your-data — application-state vs abuse monitoring / up-to-30-day default / ZDR-MAM eligibility.
- Google Gemini Interactions API: https://ai.google.dev/gemini-api/docs/interactions-overview — request-state defaults and `store` semantics (different from `generateContent`).
- Google Gemini logging policy: https://ai.google.dev/gemini-api/docs/logs-policy — verify project age, billing tier, endpoint and logging configuration; do not hard-code retention assumptions from prior versions.
- Google Gemini terms: https://ai.google.dev/gemini-api/terms — separately review unpaid vs paid use, regulated/clinical intended-use limitations, transfer, source excerpts and data-use restrictions.

## 5. Cache keys and result-lineage contract

At **minimum**, every persistent investigation or research result must bind the following elements. Not every component is permitted in a *shared* cache:

```ts
type InvestigationCacheIdentity = {
  scope: 'account-private' | 'nonpersonal-public-science';
  accountScope?: string;                 // account-private ONLY; internal HMAC/digest; NEVER provider payload
  purpose: AIPurpose;
  sourceEpoch?: string;                  // private ONLY
  snapshotDigest?: string;              // private ONLY
  consentRevision?: string;             // private ONLY
  personalPolicyRevision?: string;      // private ONLY
  scienceReleaseDigest: string;
  withdrawalsEpoch: string;
  researchTaskDigest?: string;          // public-science allowed
  publicSourceSetDigest?: string;       // public-science allowed
  providerId: ProviderId;
  endpointFamily: string;
  modelId: string;
  promptVersion: string;
  outputSchemaVersion: string;
  scientificVerifierVersion: string;
  actionEligibilityPolicyVersion: string;
  providerPolicyVersion: string;
};
```

**Hashing:** canonical deterministic serialization + domain-separated cryptographic digest. Do **not** reuse a raw hash of sensitive low-entropy patient characteristics as a public/shared cache key; prefer HMAC with a private environment-scoped key when private identity is needed. Keep private and public caches physically or logically separate with tenant-bound authorization on retrieval. Cache body should contain no raw personal medical inputs unless specifically designed and approved encrypted private storage. A cache hit **never skips current authorization, consent, source epoch, scientific withdrawal or action-eligibility checks**.

Model aliases can move; record the exact resolved model ID/declared revision and provider endpoint settings, not only a marketing alias. Where vendor cannot provide a pinned immutable weight revision, treat outputs as **not bitwise reproducible**, and use response receipts/rebenchmark when model behavior drifts.

Invalidation events: source correction/removal, account switch, consent withdrawal, evidence change or retraction, licensing withdrawal, provider/model change, prompt/schema/verifier/policy change, renamed or reconfigured endpoint, and disabled paid provider. Use the **existing source-dependent scientific reevaluation and evidence lifecycle**, not an isolated cache-clearing mechanism. Unrelated cached science must remain intact.

## 6. Minimal orchestration and code ownership

**Recommended narrow code changes; illustrative paths, not orders to create duplicates:**

1. `server/metered-ai.ts`: preserve existing OpenAI executor; accept a separately authorized `personal-biological-investigation` feature only when consent/feature/region/retention has been accepted. Add provider-policy validation interface at composition layer; do **not** rewrite existing functioning recipe or spend logic. Provider-specific `invoke` remains responsible for its exact supported retention control.
2. `server/gemini-science-research.ts`: keep existing strict nonpersonal DTO, explicit rights and spend gate. Add review of endpoint/project logging policy and downstream authoritative claim checks. Do not accept an `InvestigationSnapshot` or arbitrary text fields as convenience shortcuts.
3. `server/scientific-question-boundary.ts`: compose one reviewed catalogue *only* after rights/independence review; the model supplies `taskId` only. Prove that the actual resulting HTTP payload comes from the approved digest-locked task, not user-derived prose. Do not mutate previously approved task text in response to personal context.
4. `server/private-investigation-runner.ts`: retain on-device/private-execution path with no public provider fallback; improve secure capability negotiation for cloud mode separately; never make provider invocation mandatory for private mode.
5. `server/investigation-candidate-admission.ts`, `server/scientific-evidence-retrieval.ts`: verify citations against original research, exact user source values and applicability before any consumer result. New scientific research never directly bypasses canonical action safety.
6. Existing `SpendLedger`, `SharedProviderCircuit`, scientific jobs and source revisions: reuse for provider policy receipts and delayed-job checks. No parallel global ledger, no background retry resurrecting an expired grant.
7. Existing appropriate tests: extend rather than replace `tests/metered-ai.test.ts`, `tests/gemini-science-research.test.ts`, `tests/private-investigation-runner.test.ts`, `tests/private-investigation-pipeline.test.ts`, `tests/scientific-question-boundary.test.ts`, and candidate admission tests.

### Minimal dispatch sequence

```text
private investigation allowed?
  NO  -> deterministic reviewed source explanation / abstain
  YES -> private snapshot with scoped permission and source revision
        -> run approved private engine (or explicitly approved OpenAI personal mode)
        -> candidate hypotheses only
        -> optional nominate approved public taskId
        -> resolve reviewed nonpersonal public task from catalogue
        -> independently authorize Gemini endpoint, rights, billing, logging
        -> dispatch nonpersonal question/excerpts (NO personal data)
        -> validate candidate against originals, contradictions, claims and application
        -> fresh permission/source/evidence review
        -> existing safe ConsumerValueCandidate admission OR research-only/abstain
```

**OpenAI Cloud personal processing and strict Private Vault are different trust modes**. Do not imply external OpenAI investigation occurs inside the strict vault. User-owned private gateway does not equal end-to-end secrecy if that gateway decrypts records. State transfers explicitly.

## 7. Required Codex acceptance matrix

For each test record exact commit SHA, fixture, provider transport mock or live test credential scope, expected/actual status, affected permission/claim versions, payload redaction evidence, costs, and whether it was unit/CI, encrypted database, hosted integration, independently reviewed, rights-cleared or release-approved.

| ID | Test | Required result |
|---|---|---|
| INT-MM-01 | Private snapshot contains unique patient identifiers, rare genotypes, precise dates and medication combinations | Gemini HTTP payload contains **zero** of these strings/semantic clues; approved task only. Test serialized bytes, URL, headers, retries and tracing. |
| INT-MM-02 | LLM submits a free-form “anonymized” literature question instead of task ID | Rejected; no provider call. |
| INT-MM-03 | Unknown, expired, withdrawn or digest-mismatched public task | Rejected before spend/dispatch; no accidental personal fallback. |
| INT-MM-04 | Same public task nominated by two distinct personal users | Outbound research text identical and lacks account/profile link; private result/access caches isolated. |
| INT-MM-05 | Explicit external provider consent absent/revoked mid-execution | No send if absent; no publication if withdrawn; late result discarded. Existing private deterministic result remains. |
| INT-MM-06 | Force OpenAI `store:true` or unlisted request key via caller | Adapter overrides/rejects; no stateful request; disclosed abuse-monitoring policy remains separate. |
| INT-MM-07 | Switch Gemini `generateContent` to Interactions or alter paid/free tier, project logging or endpoint | Contract revision requires fresh review; unsupported mode fails closed, no unplanned persistent state. |
| INT-MM-08 | Change OpenAI/Gemini/optional challenger model, resolved version, prompt or schema | Cache miss; prior output remains audit-only or revalidated; stale inference not published as current. |
| INT-MM-09 | Same case, corrected laboratory unit, source date, source revision or source removed | Only dependent private outputs invalidate; cannot restore original discarded answer. |
| INT-MM-10 | Evidence retraction/rights withdrawal after result generation | Relevant cached research and personal interpretations withdrawn or qualified; unrelated current evidence stays valid. |
| INT-MM-11 | Provider timeout/429, budget exhaustion, unsupported model and local engine unavailable | Deterministic source-led response/abstention; no model switch, no duplicate billing or runaway retry. |
| INT-MM-12 | Provider logs/error bodies/telemetry, request/response receipts, browser dev tools, account switch | No private fields leak to research provider or shared tracing, cache, cross-account UI; secrets never logged. |
| INT-MM-13 | Prompt-injection inside public source excerpt requests data exfiltration or clinical admission | Ignored as untrusted content; no tool/URL escalation, output remains candidate-only. |
| INT-MM-14 | Two LLMs agree on a fabricated paper, wrong DOI or incompatible population | Independent original-source verifier rejects; model agreement alone never promotes claim. |
| INT-MM-15 | A/B/C held-out benchmarks: deterministic only vs single-provider vs multi-provider | Improvement measured on genuinely unseen cases, not just fluency; capture citation fidelity, safe abstention, false claims, cost and latency. Optional verifier enabled only if incremental benefit justifies it. |
| INT-MM-16 | Strict user-owned private vault with all external providers OFF | No personal network egress to OpenAI/Gemini/other LLMs; approved nonpersonal scientific packages still update and local/privately authorized inference remains operable. |
| INT-MM-17 | Provider request quota/receipt settled during cancellation or unknown billing outcome | No duplicate invocation, ledger remains conservative and reconciles without leaking prompt or falsely releasing a charge. |
| INT-MM-18 | Retry during account deletion/consent withdrawal while old cache is warm | Revoked private finding not reintroduced into UI or shared science and no late publication. |

## 8. A/B/C verification plan and owner-visible success criteria

**A — Baseline:** deterministic reviewed Biology/Response only, with zero external AI.  
**B — One approved private hypothesis engine:** same frozen source and evidence, one investigator, independent claim/citation/numerical check.  
**C — Private engine plus reviewed nonpersonal Gemini challenger:** same source/evidence; independent public research task from catalogue, current rights and retention controls; no additional personal material leaves boundary. Optional Claude/Grok is **not** required for C.

Freeze blinded cases and scoring before implementation. Record usefulness (new *correct* meaningful relationships vs baseline), false actionable statements, citation/source fidelity, handling of contradictions and missingness, abstentions, costs, latency, source/permission changes and privacy transfers. Prefer one highly relevant answer, not multiple speculative cards. **Go/no-go** only if C shows material scientific value without privacy or safety regression; otherwise keep C research-only. An unavailable optional provider never blocks normal Food/Today/Bloodwork.

## 9. Legal, privacy and operational qualification

- Public-data disclosure does not mean scientific source excerpts are automatically permitted for redistribution to AI vendors. Review original provider terms, source licences and any corpus use limits.
- Provider privacy terms and per-endpoint retention defaults can change. Record dated contractual review and provider console configuration at *activation*, not merely code intent; enforce matching policy revision.
- Distinguish provider **application-state storage**, **product-development/training use**, **platform logging**, **abuse monitoring**, **search grounding retention**, and **Bloom-controlled logs/caches**. Each is a different control and promise.
- Clinical/medical intended-use and territory restrictions require Legal assessment independent of data-class separation. Neither the number of LLMs nor a no-retention setting authorizes personal diagnosis or treatment guidance.
- In the user-owned Private Vault, shared nonpersonal scientific model/evidence updates are allowed; **personal outbound LLM processing is a separately disclosed exception**, not a default.
- No open-ended background agent, arbitrary internet browsing, unrestricted medical-record transfer, population training, secondary data monetization, or forced sign-in to third-party research providers.

## 10. Handoff and required disposition

**Chief Architect:** Map the requirements onto existing investigation, scientific governance, provider controls, research jobs and private-vault contracts, and specify active scope in the one `NEXT_ACTIONS.md` queue. Preserve Core Food #12/Response #15. No new owner review cycle for ordinary engineering, but maintain mandatory provider, privacy, scientific and rights activation gates.

**Codex:** Inspect current SHA first; implement the smallest additional provider policy and cache identity; wire the independently reviewed task-catalogue handoff; add tests INT-MM-01–18; report exact commit/CI/hosted/provider status, spend, nonpersonal packet evidence, end-to-end negative test and benchmark receipt. Do not claim live OpenAI health interpretation or Gemini literature crawling based on adapter code alone.

**Security/Privacy:** independently review private-to-public data-flow, log/retention settings, rare-profile question leakage, high-assurance user-owned vault, provider contracts, credential isolation, incident response and consent revocation.

**AI/ML and Biology:** review independent literature challenger/evidence correctness, blind benchmarks, population applicability and no automatic claim approval or physiological causality.

**Legal:** verify latest terms for specific provider API, region, tier, intended medical use, data retention/training and source-to-provider rights.

**Delivery state at document creation:** `specified / code foundations verified / some targeted tests present / end-to-end provider-neutral integration not verified / live provider policies not verified / benchmark not independently accepted / clinical or public scientific activation not authorized`. **No code, production config or user personal records are modified by this handoff.**