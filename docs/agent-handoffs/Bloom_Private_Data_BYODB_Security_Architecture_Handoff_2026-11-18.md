# Bloom Private Data — User-Owned Database, Private Compute & Signed Scientific Models

**Document ID:** INT-PRIV-DATA-20261118-R1  
**Date:** November 18, 2026  
**Recipients:** Chief Architect & Integration Lead; Developer/Codex; Security & Privacy; AI/ML; Biology; Legal; UX/User Testing  
**Disposition:** **APPROVE ARCHITECTURE EXPLORATION AND BOUNDED PROTOTYPE; DO NOT ACTIVATE OR CLAIM ZERO KNOWLEDGE BEFORE SECURITY REVIEW.**  
**Existing architecture retained:** React/TypeScript PWA; Express/Node; Neon Postgres; Render; Python/FastAPI; shared science contracts. No mandated migration, alternate app database, or new orchestration stack.  
**Repository audit anchor:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, `299ff30004735d52306182750d9af3ad5cd941f8` (moving branch; Codex must check current HEAD). No implementation of BYODB/private mode is verified by this report.

## 0. Binding product decisions for Architect

1. **Storage control is not the same as computational privacy**. A personal Neon DB accessed by a central Bloom server remains readable by that server. Clearly distinguish **customer-owned database**, **customer-controlled credentials**, **customer-hosted compute**, **customer-controlled encryption keys**, **local-first**, and **external-AI permission**.
2. **Three supported modes, phased:** (A) existing Bloom Cloud; (B) encrypted local-first private mode with export/recovery and no account-required user content upload; (C) user-owned database **plus user-owned private Bloom gateway/worker**. A fourth “user DB + central Bloom proxy” may be explored only as an explicitly lower-privacy option, not silently presented as zero knowledge.
3. **Shared scientific intelligence travels to the user** as signed, versioned, nonpersonal claim/evidence/method/model bundles; personalized calculation runs in the selected private execution boundary. Knowledge package ≠ model weights ≠ personal training ≠ scientific approval.
4. A user's data and encryption keys do not become shared model-training material. Default **no analytics/profile-building, no advertisement targeting and no user-level research exports**. Separate optional external AI and separate future population research consents.
5. Prioritize tiny working vertical slices behind existing v0.6 Core Food #12 and Response #15. Codex does not replace the existing app architecture or launch a new platform.

## 1. State of current code — exact evidence vs missing

| Code | Observed | Implication |
|---|---|---|
| `server/db.ts` | Global `Pool` + Drizzle client from a single Neon-configured `DATABASE_URL`. | Need storage dependency injection; do not mutate global `DATABASE_URL` per request or create unbounded tenant pools. |
| `server/auth-routes.ts`, `server/account-auth.ts` | First-party Express sessions, user IDs and account activation checks. | Need private-deployment identity trust and pairing; external DB password must not be in browser or a global session record. |
| `server/precision-crypto.ts` | AES-256-GCM with keyring in server environment. | Not E2EE versus Bloom operator. Private deployment may keep server-managed keys **within user-owned gateway**; local mode needs client-controlled vault keys. AAD uses current account ID / purpose, so migration requires cryptographic rewrap/re-encryption. |
| `server/metered-ai.ts` | Consent, provider circuit, cost ceilings; feature scope is restricted. | Add pluggable inference adapters and purposes without bypassing existing policy. |
| `shared/scientific-contracts.ts`, `shared/evidence-network.ts` | Typed candidate/claim vocabulary and existing reference graph. | Shared release may be distributed only after exact rights, review, version and contradiction checks. |
| `server/scientific-release-storage.ts`, `migrations/proposed/0018_biology_scientific_releases.sql` | Release restore/withdrawal logic present in code; migration explicitly **proposed**, not installed at startup. | Do not assert durable release is deployed; integrate and test signed package consumer later. Current independent withdrawal authority is essential. |
| Existing account export/erasure | Tied to current server-owned persistence and account IDs. | Add verified transport format and media/blob mapping; tests must ensure deletion includes derived caches and backups according to disclosed policy. |

## 2. Threat model and assurance levels

**Assets:** lab reports, genes, stool microbiome, nutrition, medications, symptoms, images, sexual/reproductive records, private profile, AI prompts and derived results; identity-to-vault mapping; bearer credentials; recovery seed; scientific update signing roots.

**Adversaries:** breached Bloom service/employee; stolen browser session; malicious extension/XSS; compromised customer-hosted gateway; malicious extension or Postgres superuser; corrupted signed update server; revoked AI provider; cloud provider/snapshot operator; DNS rebinding/SSRF target; physical device loss; user sharing mistaken exports; insider with stored keys.

**Security promises by mode**:

| Mode | Who can potentially see plaintext? | Credible claim |
|---|---|---|
| Existing cloud | Bloom server and authorized operators with key access | Protected cloud account, **not zero knowledge** |
| Local encrypted vault | User's unlocked device/app execution; potentially browser-origin XSS or local device compromise | Data not transmitted to Bloom by default; browser is a strong attack surface |
| Customer DB + Bloom central proxy | User DB provider and Bloom runtime/operators | Customer-owned storage, **not private compute** |
| Customer DB + customer-hosted private gateway | User-operated gateway and DB provider; Bloom code vendor via update supply chain | Infrastructure custody outside Bloom runtime, subject to operator/provider access |
| Client-side E2EE vault + customer gateway | Only client with unlocked keys for encrypted fields, unless explicitly forwarded/decrypted for analysis | Stronger confidentiality against gateway, but restricts server analysis/jobs and searchable SQL |

**Non-negotiable:** control-plane licence/update check is not authorized to retrieve health records; store only minimal subscription/device/install metadata with truthful disclosure. Disable product telemetry on sensitive routes unless independently approved and minimized. No central endpoint allowed to receive arbitrary DB credentials or private payloads.

**Cross-origin/BYODB pitfalls:** never connect PostgreSQL directly from an ordinary webpage; TCP drivers, password exposure, CORS and browser compromise make this unsuitable. Never accept a user-entered arbitrary PostgreSQL URL into central Bloom's server-side `Pool`: SSRF, internal-network access, arbitrary DNS targets, unbounded sockets, secret spillage and nonisolated connection reuse. If diagnostic validation is needed, perform it inside the user's own gateway or in a purpose-built tightly constrained outbound sandbox with public-endpoint allowlists.

## 3. Proposed three-plane architecture

**Control and science distribution plane — Bloom-operated, nonpersonal:** signed client updates, approved science/evidence/claim manifests, validated model weights, public content/asset files, compatibility metadata, licensing state, revocation metadata. No account sources, passwords, vault keys or patient-specific recommendation logs.

**Private data plane — customer-chosen:** local encrypted vault or dedicated customer-managed Neon/Postgres + private file/object storage. Data schema remains canonical with `occurredAt` vs `recordedAt`, original units, revision, source, purpose/consent, correction/tombstone, and per-account authority. Do not ship raw images in Postgres; object store references have scoped authorization and deletion lifecycle.

**Private execution plane — within user's trust boundary:** in-browser deterministic TS and selected WASM/ONNX for local mode; user-owned Express/FastAPI worker for cloud BYODB; private Python heavy research where permitted. The central Bloom service may host **public scientific knowledge only**. Cloud LLMs require explicit per-purpose access and payload disclosure; inference output remains untrusted until typed numeric/source/evidence checks pass.

Architecture diagram:

```
        Bloom scientific distribution (NO private content)
   signed client / science / model manifests / revocations
                        |
             verify signature + expiry
                        v
 +---------------------- client --------------------------+
 | React UI | local source adapters | deterministic rules |
 | local encrypted vault | privacy controls | model cache |
 +----------------+----------------+---------------------+
                  |                |
      Local-only choice          Customer-owned choice
                  |                v
          private IndexedDB      TLS + auth to customer gateway
          bounded local ML       (separately deployed Express)
                                   |      \
                          Neon Postgres    private Python/worker
                          customer role   + customer-managed object store
                                   |
                          ONLY user customer controls infra

 Cloud LLM: opt-in, shown exact payload, destination, retention
 before sending from chosen private execution boundary.
```

## 4. Database portability contract and code refactoring

**Avoid** a `switch(userId) { process.env.DATABASE_URL=... }` anti-pattern. Instead:

```ts
// illustrative; place behind existing auth/authorization, not direct public SQL
export type StorageMode = 'bloom_cloud'|'local_vault'|'private_gateway';
export interface DataExecutionContext {
  actor: { installationId: string; accountId: string };
  purpose: 'tracking'|'personal_insights'|'research_reference';
  consentEpoch: string; sourceEpoch: string;
  storageMode: StorageMode;
}
export interface PersonalDataPort {
  listObservations(ctx: DataExecutionContext, filter: BoundedSourceFilter): Promise<ObservationPage>;
  saveObservation(ctx: DataExecutionContext, mutation: VersionedMutation): Promise<MutationReceipt>;
  exportSnapshot(ctx: DataExecutionContext): AsyncIterable<EncryptedExportChunk>;
  withdrawSource(ctx: DataExecutionContext, sourceId: string, expectedRevision: string): Promise<WithdrawalReceipt>;
}
export interface PrivateComputationPort {
  runVerifiedAnalysis(ctx: DataExecutionContext, input: EligibleAnalysisRequest): Promise<AnalysisReceipt>;
  cancelByEpoch(ctx: DataExecutionContext, epoch: string): Promise<void>;
}
```

Use adapters to existing storage, not reimplement all domain logic. `LocalVaultAdapter`, `OwnedGatewayAdapter`, `ExistingCloudAdapter` must share the same domain contracts and source/version checks. Server actor identity is authenticated, never caller-provided. Avoid loading all user data into browser and then assuming an untrusted script cannot read it. Configure actual tenant project gateway using **one dedicated database** (or tightly scoped schema) and role; do not add customer connection strings to Bloom central account records.

**Local PGlite:** useful R&D for existing React app; IndexedDB persistence is feasible but not at-rest encryption by default; encrypt each private payload before persistence (potentially index only minimized non-sensitive fields) and measure query costs. A whole encrypted IndexedDB container with searchable fields plaintext is not end-to-end confidential. Web origin XSS, browser eviction/private mode, storage limits, Safari compatibility, cross-tab conflict and loss of all local copies must be tested. `navigator.storage.persist()` is only a mitigation, not a backup. Preferred robust native/Desktop future option SQLite/SQLCipher or equivalent vetted encrypted local store, but do not force that migration for PWA MVP.

**Private gateway:** package established Express route handlers with dependency-injected customer DB, restrict ingress to authenticated user clients, separate privileged migration principal from runtime data principal, use unique customer deployment credentials and tokens, enforce bound read/response sizes and origin-specific CORS. Do not expose DB directly as an API; the gateway owns validation, consent, computation and SQL. Session store either in customer's DB or private gateway state; avoid centralized sign-in token with silent privileged access.

## 5. User-owned Neon: recommended manually assisted setup v1

> This flow is for an **advanced user pilot**. No assumption that Bloom can instantly provision arbitrary users' Neon accounts. Exact console labels may change. Do not encourage user to paste admin credentials into bloom.app.

**User prerequisites:** email/account for Neon, personal billing method if the tier requires it; access to Render account (or approved private gateway host); device with reliable encrypted backup; personal recovery secret/password manager; willingness to own uptime, billing, backups and software-update responsibility. User chooses allowed data residency/region based on personal/legal needs. Explain that user-owned cloud DB/provider admins may still access provider-managed keys/contents; this is not true local-only privacy.

**Step 1 — Create Neon project:** open `https://console.neon.tech`, sign in/create account, `New Project`; select region, e.g. a region supported by chosen services and legal residency requirements (do not promise Canada availability). Name `bloom-private`; select/create production branch and an empty dedicated DB, e.g. `bloom_private`.

**Step 2 — Create a restricted application role:** In Neon console database access/roles create a distinct named app role `bloom_runtime`; migration/admin role is used **only during initial setup and upgrades**, never during normal app runtime. Review ownership and schema privileges: runtime needs SELECT/INSERT/UPDATE/DELETE only on its own application's tables/sequences, no role creation/drop database/extension/migration rights. Depending on existing migrations, bootstrap using database owner in the isolated user project and grant runtime privileges after. Do not promise SQL below is universal: run role/grants through a tested setup utility with a database owner, not user pasted unconstrained SQL.

**Step 3 — Deploy own Bloom private gateway:** open an official signed Bloom template repository, choose `Deploy to Render` (Blueprint, deployment in *their* Render account); inspect code permissions, disable automatic deployment from untrusted upstream, pin immutable image/commit; create service `bloom-private-gateway`; set owner-only `DATABASE_URL` to **restricted app-role** pooled Neon URI, `SESSION_SECRET`, private encryption key and public app origin; add any separate direct/admin connection **only as short-lived deployment migration secret**. Values entered in the user's Render secrets UI, not the public Bloom client or central Bloom server. Use private DNS if possible, TLS certs and rate limits, backup monitoring. Optionally deploy private FastAPI worker if advanced scientific jobs require it; omit for standard Food/Today.

**Step 4 — Initialize schema:** gateway's setup/admin job connects with isolated migration authority, verifies target DB is empty or already matching accepted schema, locks migrations, applies pinned migration set with checksums, creates least-privilege runtime role grants, completes encrypted record key setup, writes `installation_id`, `schemaVersion`, `minimumClientVersion`, `scientificReleaseVersion`, feature/purpose policy, admin fingerprint and recovery configuration. Migration credential can be revoked/removed immediately after. No automatic destructive migration or imported Bloom production records.

**Step 5 — Pair Bloom app:** gateway setup screen displays an expiring, one-time **pairing code** or QR containing only gateway HTTPS origin + nonce (not credentials). In Bloom `Settings → Data ownership → Use my own database → Connect existing private gateway`, enter URL/scan QR. Client validates **HTTPS host, verified deployment identity**, performs signed challenge/PKCE-like pairing, confirms a **short-lived per-device access token**, and saves only a revocable device credential locally. Gateway derives account identity and permissions from pairing; central Bloom server sees neither connection string nor user auth token. Certificate validation must be browser-native; pairing UI shows clear origin and ownership. Prefer an independent, audited device authorization protocol rather than inventing unauthenticated token exchange.

**Step 6 — Verify actual operations:** private connection health; version/role rights check; save a synthetic observation, reload on another authorized device, perform local deterministic analysis, edit and delete, revoke a device, test export/deletion, and restore backup into empty staging DB. The product should not pronounce setup complete based on a simple TCP or `SELECT 1` success.

**Step 7 — Daily use and maintenance:** Bloom opens private gateway after device authentication, verifies signed science release and schema compatibility, shows `Private database connected` with last successful backup and service health. Offline local cache optional and purpose-scoped, not a hidden copy of full medical records. User can disconnect/revoke the app, stop service, rotate keys, backup/restore, or migrate back to cloud only after explicit validated transfer.

### Simplest future guided onboarding

Neon documents a partner OAuth authorization-code integration with scoped permission (project read/create/update/delete), but actual partner registration/scopes/security approval must be confirmed: **do not implement fake “Connect Neon” OAuth**. If approved, use OAuth+PKCE and ask for minimum scope; provision customer-owned project+DB+restricted role, and return only nonsecret metadata to client. Separate Render Blueprint user-approved deployment and secrets completion. A fully automated flow would require auditable delegated role/credential provisioning and access revocation; it cannot assume Neon OAuth consent also provisions a protected execution gateway or automatically creates an E2EE trust boundary.

Alternative for nontechnical users: **Local Private Vault** (one-click mode, export/restore) or customer-owned managed-key vault with clear disclosure. Don't force Neon/Render account creation onto ordinary users.

## 6. Example app onboarding copy / UX states

**Data ownership**: `Bloom Cloud (easy)` / `Private on this device (no health records sent to Bloom)` / `My own database (advanced: setup a private server)`.

After choosing **My own database**:
- Step 1 `Prepare your accounts`: Neon and a private app host (estimated cost billed by provider; actual price shown in checkout).
- Step 2 `Create your private database`: guided link to Neon, region, DB name, runtime role, secret handling.
- Step 3 `Deploy your private Bloom server`: signed Deploy-to-Render template and environment secrets in Render UI.
- Step 4 `Pair this device`: QR/one-time code from private gateway, HTTPS host origin confirmation; never paste DB password into Bloom.
- Step 5 `Verify & back up`: synthetic test+real save, export, recovery drill; readiness status.

Health status: `Connected`, `Local only`, `Reauthentication needed`, `Schema upgrade available`, `Offline — latest private data on this device only`, `Backup needs attention`, `Scientific package outdated` with truthful user action. Disabled AI never presented as synced.

**One-line privacy notice**: `Bloom does not receive your private records in this mode. Your chosen database/cloud provider and your private server may process them. Optional cloud AI sends only the information you approve.` Only make this exact claim when telemetry/network traces and architectural review substantiate it.

## 7. Security implementation requirements

### Credential and network isolation
- No DB URI, password, API key, refresh token, plaintext health record or decrypting key in QR codes, analytics, crash logs, frontend bundles, central Bloom profiles or repository. Client authenticates only to customer gateway over TLS.
- Gateway trust domain is separate per customer; no arbitrary customer SQL/URLs executed by Bloom central Render services. Verify the gateway deployment identity and origin; use strict CSP, trusted types where supported, anti-XSS, CSRF for cookie-based sessions, short-lived scoped tokens, session/device revocation, passkeys/MFA where supported, rate limits and minimal CORS allowlist. Do not treat CORS alone as authentication.
- Check DNS, TLS, redirects and private-network targets for any optional federation URL; never fetch arbitrary customer URLs in central service based only on regex hostname check. Prefer no central outbound federation at all.
- Gateway database roles least privilege; use SCRAM/TLS with hostname verification where supported; protect secret management with host provider KMS; rotate credentials and record access. Pooled connection for normal traffic; direct privileged connection for controlled migrations only. Neon TLS and connection options must be tested with exact driver.

### Encryption and recovery
- **Private gateway mode:** server-side envelope encryption with DEK/KEK in customer's service secret manager is acceptable as *customer-controlled deployment* but NOT client-only E2EE; identify operator and host visibility.
- **Local-only mode:** authenticated encryption (AES-GCM or audited XChaCha20-Poly1305 library) over per-record or vault ciphertext; random 96-bit nonces unique per key for AES-GCM, AAD binds owner/record/type/version; Argon2id for recovery-passphrase-derived key (reviewed parameters/version) or hardware/WebAuthn PRF key wrap where **actually supported**; non-extractable browser key handles alone do not prove secure backup. User-held recovery kit required and tested. Do not invent end-to-end encryption atop unreviewed scripts.
- Per-install data key version, cryptographically authenticated backups, rotation/rewrap, lost-device recovery, export and irreversible delete warnings. Explicitly test old ciphertext cannot be decrypted after key destruction **except surviving backup keys/copies**. Recovery means someone must retain a secret; if Bloom does, disclose zero-knowledge limits.
- Data can be readable in unlocked browser process; compromised JS served from an update origin can exfiltrate plaintext. Strongest threat boundary requires trusted signed installed client or independently verifiable code and strict update controls. Honest limitations and threat model visible in docs.

### Data lifecycle / privacy
- Source revision & consent epoch on every job. Before read/compute, before commit and before publish, reverify authenticated actor and current revisions. No in-flight stale result can resurrect withdrawn source. Two-account isolation across private caches, worker memory, preview images, exports and logout.
- Avoid storing raw private prompts or entire health histories in logs. Separate optional external inference provider purpose, terms/retention, data types, max payload, model version. Disable automatic sharing and training.
- Data migration must be explicit: old cloud account remains intact until signed/verifiable transfer + parity check + user confirmed cleanup. No silent automatic cross-mode sync. Include signed export manifest, encrypted payload chunks, source revisions, schema/model versions and integrity hashes. Delete cloud source only after successful restore and user confirmation; backup retention disclosed.
- Records encrypted in user-owned Postgres may still reveal timestamps, sizes, access patterns and schema metadata. Searching over ciphertext often requires local indices or consent to plaintext search; do not imply full semantic confidentiality without threat-specific evidence.

## 8. Signed scientific/model distribution and local AI

**Package classes:**
1. `science-evidence`: reviewed public claims and precise sources, withdrawal overlay; small versioned signed data bundle, in user DB/local cache.
2. `deterministic-rules`: typed vetted nutrient/calculation/action eligibility implementation; version/compatibility tested; executable code from signed audited app release (do not run remote arbitrary JS from data manifest).
3. `inference-onnx` (optional): rights-cleared and benchmarked static model graph/weights, bounded memory/compute and input/output schema; client ONNX Runtime Web WASM/WebGPU where supported, or private FastAPI/ONNX runtime.
4. `bio-reference-model`: pinned Python reference reaction assets, dataset rights, solver/model version and explicit *research-only* gate until independent validation.
5. `language-model` (optional research): hardware/weight/licence/quantization-specific; mobile download/storage/battery feasibility not assumed. Prefer deterministic + templates for ordinary explanations; external LLM opt-in for optional interpretation. Loading LLM weights locally does not automatically confer correct scientific claims.

**Signed update manifest** (illustrative, not an implementation mandate):
```json
{
  "schema": "bloom-package-v1",
  "id": "science-2026-11-reviewed-01",
  "kind": "science-evidence",
  "version": "1.0.0",
  "minClient": "0.6.0",
  "maxSchemaVersion": 18,
  "payloadSha256": "<64-lowercase-hex>",
  "sizeBytes": 152000,
  "rightsManifestSha256": "<64-lowercase-hex>",
  "reviewedClaimsDigest": "<64-lowercase-hex>",
  "signedAt": "<RFC3339>",
  "expiresAt": "<RFC3339>",
  "securityRevocationEpoch": 4,
  "signature": "<detached-signature-over-canonical-manifest>"
}
```
- Use The Update Framework (TUF)-style root/targets/snapshot/timestamp with offline-root key, short-lived timestamp keys, anti-rollback, expiry, hash and length, delegated model/source packages. Don't self-design one public-key signature without handling key compromise/freeze/replay. Package installer pins source-authority trust roots and verifies independent signed *latest withdrawal/tombstone policy* before activation, including during rollback.
- Science releases must include permissioned licences/rights/attribution and current retraction/withdrawal control; rollback must not revive a removed claim. If network unavailable and revocation freshness expired, use bounded last-known-safe claims or abstain for claims requiring current safety status—avoid falsely asserting fresh approval.
- Update runs atomically: download to temporary local protected cache, verify size/hashes/signature/rights/scope/schema/expiry, parse strict bounded payload, run validation, switch active pointer, invalidate derived insights dependent on changed claims. Keep old safe package for rollback, detect disk quota and broken downloads, clean temp files. Do not execute untrusted scripts deserialized from packages.
- Model cards and benchmark receipts: intended population/device, dataset provenance/training rights, supported input type, excluded clinical claims, false claim rate and abstentions, independent fixture/test split, p95 runtime, peak RSS, download bytes, offline behavior. Separate status `available`, `loaded`, `scientifically reviewed`, `authorized for purpose`, `active`.

**AI data minimization:** optional cloud LLM pipeline: selected original observations -> local verified numeric/units summary -> explicit preview of fields -> provider+region/retention terms -> one-purpose grant -> send -> typed candidate result -> local/authorized verifier checks original refs/values/evidence -> user sees only reviewed output or bounded abstention. No entire raw genetics/stool/sexual records by default. A private gateway with internet access can accidentally leak; audit outgoing requests. Unsupported LLM or no cloud permission must leave normal Food/Progress/Today functions working.

## 9. Operational capabilities and acceptance tests for Codex

**Feature/roadmap mapping:** `PRIV-DATA-01` Storage-mode choice and privacy guarantees; `PRIV-DATA-02` Storage adapter; `PRIV-DATA-03` Customer-owned Neon/gateway onboarding; `PRIV-DATA-04` Device pairing and authentication; `PRIV-DATA-05` Client-controlled encryption/recovery; `PRIV-DATA-06` Signed scientific/model distribution; `PRIV-DATA-07` Export/migration/revocation; `PRIV-DATA-08` Inference routing and opt-in; `PRIV-DATA-09` Threat-model testing and operational monitoring; `PRIV-DATA-10` Privacy transparent statuses. Map to existing ENG-EVOL-06/08, SCI-INFRA-01–03, v0.6 source/consent and persistent-science IDs. Not a competing backlog.

**Required adversarial scenarios:**
1. Default Bloom Cloud users unaffected; no new DB routing in production without mode opt-in.
2. Local private mode: record food/lab/body; kill all network calls to personal-data endpoints; restart browser and verify local source-fidelity, encrypted stored bytes and no health transmissions.
3. Browser malicious script test: demonstrate what XSS can read in unlocked vault; do not claim protection if it can exfiltrate plaintext. Harden CSP/supply-chain, report residual risk.
4. User-owned Neon: setup with a **restricted role** and private gateway; no DB password ever in Bloom public client, logs, QR or central account store. Verify runtime role cannot migrate, create superuser or read outside app scope.
5. Two-device pairing; revoke device A while B remains; A can no longer read/execute after revocation; CSRF/session hijack negative tests.
6. Duplicate/write retry, race and account switch preserve single source revision and eliminate stale caches.
7. Gateway offline, DB over quota, credential rotated, backup missing; no silently invented success, clear actionable recovery.
8. Destroy/revoke consent during delayed Python job; canceled/stale result never becomes user-visible, and no private traces in shared science.
9. Tampered/unsigned/expired model/science package, malicious oversized artifact, rollback after newer withdrawal: reject; maintain safe previous release or abstain.
10. New model consumes validated synthetic reference data, local inference output checked against deterministic baseline; WebGPU absent -> WASM fallback or explicit unavailable.
11. Cloud AI consent denied: network shows no personal data to model provider; if approved, exact minimized prompt fields and retention identified, no automatic training.
12. Cloud->private migration: 100% source identity/revision/count/hash and purpose rights parity, cryptographic re-encryption, logout old sessions, auditable deletion request after confirmation.
13. 2 clean backup/restore drills to independent staging DBs; matches canonical source counts/versions while private records are absent from global scientific assets.
14. Customer-owned app loses automatic updates: show model/release age and security warning, signed update/recovery path; owner can refuse optional updates but not claim current scientific validation forever.
15. Multi-account shared device logout: clear decrypted state, memory-lifetime-limited caches, no photos/sexual records in background widgets, notifications or generic analytics.
16. Price/cost and outage telemetry: private gateway/user provider billing visible without Bloom reading private records; no hidden storage migration cost.

**Performance baseline to measure in pilot (not invented pass thresholds):** PWA load and cold unlock latency; IndexedDB/PGlite operations; database round trips; 95th percentile TS calculations; model download and peak WASM memory; WebGPU/WASM compatibility; private gateway cost and CPU; update verification/rollback; migration size/time; backup/restore; battery and offline continuity. Agree thresholds before launch and rerun physical iPhone Safari, Android Chrome and desktop tests.

## 10. Cut implementation scope / decision gates

**Prototype P0** (parallel bounded research, not v0.6 Core blocker): (i) decouple one full vertical slice (food recording->saved source->deterministic nutrition/Today) from global DB; (ii) local encrypted source adapter + tested private export/import; (iii) one **user-owned Neon + private gateway** working through the same domain interface with synthetic accounts; (iv) signed **nonpersonal** science bundle with rollback; (v) prove no private content to central Bloom network in private mode. No live user medical data in prototype.

**P1 after demonstrable utility:** account-private lab/body/checkin/media, device pairing and revocation, mobile Safari, encrypted cross-device backup, migration wizard, operational monitoring and first real nontechnical pilot.

**Advanced, only when justified:** native SwiftUI private secure enclave/keychain UX; private Python solver; per-user GPU model inference; provider OAuth auto-provisioning; end-to-end encrypted multi-device sync; opt-in model training. No auto model inference from undeployed weight or user account fields.

**Architect/Codex outputs:** exact current SHA and impacted files; threat model signed by Security; user data flow diagram with network trace; 3 mode boundaries documented; schema/adapter implementation with migration isolation; pair/revoke test; source-consistency test; local inference/offline benchmark; package signatures/revocation; user onboarding walkthrough (320/390 mobile + desktop); clear responsibility table for support/backup/billing; audited feature flags and independent Legal/Privacy activation decision. No automatic production enablement.

## 11. Grounding / authoritative documentation reviewed Nov 18, 2026
- Neon connection details & roles: https://neon.com/docs/get-started/connect-neon ; https://neon.com/docs/manage/database-access ; https://neon.com/docs/guides/oauth-integration
- Neon connection pooling: https://neon.com/docs/connect/connection-pooling
- Render Blueprint & deploy button: https://render.com/docs/deploy-to-render ; https://render.com/docs/infrastructure-as-code
- PGlite persistence: https://pglite.dev/docs/filesystems
- ONNX Runtime Web: https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- The Update Framework (signed/rollback/freeze): https://theupdateframework.org/docs/metadata/
- OWASP database, secrets and SSRF: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html ; https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html ; https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- MDN browser storage eviction: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- WebAuthn PRF: https://www.w3.org/TR/webauthn-3/

**No code or cloud services changed.** Proposal requires Architect reconciliation; Codex sole engineer, independent security/legal/scientific acceptance before exposing live health data or claims.