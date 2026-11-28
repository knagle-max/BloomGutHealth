# Bloom Private Data — High-Assurance Security, iOS Portability & Optional User-Owned Infrastructure

**Document ID:** INT-PRIV-SEC-20261118-R2  
**Date:** November 18, 2026  
**To:** Chief Architect, Codex, Security/Privacy, iOS, AI/ML, Biology, Legal, UX  
**Decision:** APPROVE THE DESIGN DIRECTION AND BOUNDED THREAT-MODEL/PROTOTYPE ONLY. Do not advertise 'military grade', 'Signal level', end-to-end encrypted, zero knowledge, independently audited, or secure against intelligence services until the *specific* promise has independent technical evidence.  
**Binding:** Optional alternative; existing Bloom Cloud and v0.6 Food #12 / Response #15 remain unchanged. Native SwiftUI follows existing roadmap. No production authorization, provider provisioning or repository modifications.  
**Supersedes only security refinements of:** `Bloom_Private_Data_BYODB_Security_Architecture_Handoff_2026-11-18.md` (INT-PRIV-DATA-20261118-R1). Preserve that document's portability, storage and update contracts unless explicitly strengthened below.

## 1. User promise, not marketing claims
The goal is to make highly security-conscious individuals willing to use Bloom **because the architecture is independently inspectable**, not because of adjectives. Publish a threat model and security white paper, cryptographic design review, annual independent penetration and mobile-app audits, vulnerability disclosure policy, bug bounty as resources permit, reproducible-build/release provenance evidence, signed bills of materials (SBOM), incident-response and breach disclosure, and a public change log of fixes. Independent audits are *scope and date specific*; neither Signal's cryptographic choices nor Signal's reputation transfers to Bloom.

Public claim matrix, only after tests:
- **Cloud:** `Bloom stores encrypted sensitive records and operates the application; authorized Bloom infrastructure can process them.` Existing server-held precision key is not zero knowledge.
- **Private device:** `Your health records are stored encrypted on this device and are not sent to Bloom by default.` Clarify live science/update network traffic, local unlocked-memory exposure, backup/OS and optional vendor transfer.
- **User DB + user gateway:** `Your chosen cloud providers operate your database and private processing service; Bloom central servers do not receive your health records by default.` The gateway/host can access server-decrypted records unless client encryption is enabled.
- **Strict client E2EE sync:** `The sync server stores ciphertext and cannot decrypt covered health fields.` It cannot run arbitrary SQL or rich server-side interpretation on plaintext; plaintext must be decrypted and analyzed on user devices, or explicitly released to an authorized compute enclave/worker with a narrower trust model. Metadata leakage is separately stated.

## 2. Corrected deployment and iOS topology
**Render is entirely optional, not intrinsically private.** Render **private services cannot be contacted by an ordinary iPhone over the public internet**. Either (A) run an internet-accessible HTTPS *public web service* with zero-trust authentication and per-device scopes, and keep internal workers private; or (B) expose only through a VPN/mesh/tunnel configured by the user. A public web service's URL being reachable does not mean it should permit anonymous API access. Do not claim a Render account provides E2EE or administrative isolation from Render itself.

```
               Bloom-operated, public, nonpersonal delivery
          TUF-verifiable science + model bundles + app releases
                                  |
                   independent client validation
                                  |
                   +--------------+---------------+
                   |                              |
      SwiftUI iOS client                          React web client
      Keychain/Secure Enclave                     audited web crypto
      encrypted local vault                       local private vault
      deterministic TS-compatible logic*           shared domain contracts
                   |                              |
              optional protected HTTPS or authenticated VPN
                                  |
                    CUSTOMER-OPERATED API GATEWAY
                     Express / user-owned host
                       /             |           \
         own Postgres/Neon      own object store   own Python worker
         scoped runtime role      media ciphertext  only permitted jobs

      * Cross-platform algorithms delivered by versioned data/WASM or
        parity-tested native implementation; do not execute downloaded JS.
```

The app should use **one versioned Domain/DataExecution transport protocol**, not direct database sockets or shipping database credentials to iPhone. Native and web clients select a profile: `bloom_cloud | local_private | customer_gateway`; those are *configuration choices*, not separate scientific engines. Avoid dynamically mutating the singleton `server/db.ts` pool in the existing cloud service. Use dependency injection in a private gateway deployment. Client platform-specific storage adapters preserve source/revision/unit/date/consent semantics.

## 3. Security tiers and honest guarantees
- **S0 Existing Bloom Cloud:** current managed account. Do not retrofit all records solely to make BYODB work.
- **S1 Private Device:** encrypted user-controlled local vault, no Bloom health upload; no cross-device continuity without user-controlled backup or explicit pairing; the unlocked process and compromised operating system remain high-risk.
- **S2 Customer Owned:** dedicated customer Neon/Postgres, HTTPS gateway, client authentication, customer-controlled server credentials/keys, no Bloom central database access. Gateway operator and host still see decrypted data processed there.
- **S3 High Assurance E2EE:** client-generated per-vault random 256-bit master key; per-record HKDF derived keys (or sealed random record keys), AEAD (AES-256-GCM under reviewed nonce discipline or audited XChaCha20-Poly1305), authenticated purpose/version/owner/record IDs as AAD, **ciphertext-only** gateway for protected columns and media. Private analysis happens on-device or is an explicitly scoped exception. Locking down the gateway and encrypting DB storage alone does not produce S3.

Implement and verify S1/S2 before offering S3 as a production option. Do **not** claim S3 without independent cryptographic and mobile reviews. The 'highest assurance' profile may deliberately disable cloud LLM, certain searches, background analytics, centralized recovery and third-party integrations.

## 4. Threat model to be signed off by independent Security
Use STRIDE/LINDDUN-style structured scenarios with assets, adversary capability, attack path, protection, residual risk, reproducible test and responsible owner:
- Bloom insider, compromised central environment, accidental monitoring or analytics: zero central ingestion of personal sources in private mode; no private data in metrics, email, crash reports, AI prompts or CDN URLs.
- Malicious user/remote attacker: stolen session, phishing, credential stuffing, API abuse, IDOR, request replay, signed-URL theft, unauthorized device pairing, broken access controls.
- Compromised third-party cloud (Neon, Render, Apple iCloud, user host): plain database vs ciphertext distinction, KMS trust boundary, backups, snapshots, support access.
- Compromised distributed software/update servers, malicious dependency or insider signing keys: TUF offline root, separated release roles, multi-party signature for critical science/policy, anti-rollback/expiry, build provenance, independent rebuild/audits.
- Compromised phone/unlocked app, jailbreak, physical seizure, malicious extension (web), screen recording, notification preview, OS backups, clipboard, OCR and keyboard leakage: secure lock, data protection classes, clear displays, device protection. No guarantee against already compromised unlocked OS.
- Malicious scientific model or prompt-injection corpus: model package signatures AND content validation, memory/payload limits, no executable plugin in data bundles, untrusted model outputs, local numerical and evidence verifiers.
- Provider or model outage: deterministic source-based results and manual entry remain usable; no false science refresh claims.
- Metadata observation: account existence, IP, traffic timing, storage size, application download patterns. Dedicated customer accounts and encrypted contents do not hide all metadata; no anonymous claims.
- Coercive access: support account separation, hidden sensitive previews, private-mode onboarding without disclosure, device revocation; do not promise plausible deniability or law-enforcement resistance without rigorous analysis.

## 5. iOS cryptography and storage implementation
- **SwiftUI + shared business contracts.** Add a native `PrivateDataStore` interface implemented by encrypted SQLite/SQLCipher (only after licensing/maintenance review), or Apple protected local database with audited per-field AEAD. Prefer schema compatibility over physically running Postgres on iPhone. Keep canonical IDs and deterministic calculation parity fixtures from TypeScript. No need for Render in local-only iOS mode.
- **Keys:** Generate vault master key on device from CSPRNG; wrap it using a Secure Enclave protected P-256 key-agreement wrapping scheme or appropriately stored Keychain secret. Secure Enclave does **not** store arbitrary AES vault keys directly or perform universal AES operations; document key-wrap derivation and key accessibility. Set device-only keychain accessibility when the user chooses no roaming, require user presence/biometry/passcode based on explicit unlock policy, and test device restore behavior. Platform biometrics are *unlock gates*, not a replacement for cryptographic recovery.
- **Files:** use iOS Data Protection (`NSFileProtectionComplete` where functional) for vault and temp documents; mark sensitive local files excluded from ordinary device backup if no coherent encrypted-recovery design exists; avoid Spotlight/indexed plaintext, pasteboard, widgets, push payloads and logs. Protect lock-screen and app-switcher previews; reduce local exposure when backgrounding; test crash dumps.
- **App integrity:** App Attest for server pairing when supported, with server-side nonce/counter validation. This is a risk signal, not an unbreakable guarantee against a compromised device. Apply passkeys/FIDO2 + scoped device credentials for gateway identity, TLS hostname validation/ATS, strict redirect/origin allowlists. Pinning should be threat-model-based with safe key rotation and recovery; do not simply pin short-lived certificates.
- **Offline:** allow verified signed science and necessary local observations, but mark old/withdrawn-science freshness honestly. If revocation policy is too stale, abstain from affected actionable interpretations rather than use stale claims.
- **Background jobs:** iOS may suspend apps; treat background refresh as best-effort. Source triggers recorded durably; reconciliation on app opening and later background windows, not unverified always-on computation.

## 6. Multi-device E2EE, pairing and recovery
A credible E2EE pairing scheme requires more than a reusable QR code:
1. New device installs verified Bloom app and creates its own Secure Enclave-backed device identity (where available).
2. It displays a short-lived pairing request with ephemeral public key, device fingerprint, expiry and exact user-owned gateway origin. Authenticate server/gateway identity separately: do not let a network attacker replace the intended destination through QR substitution.
3. Existing unlocked trusted device verifies the new device in person or via an independently verified pairing code; use authenticated ECDH and HKDF with transcript-bound context to establish a one-time encrypted channel. Bind account, gateway, purpose, expiry, device ID and anti-replay nonce. A QR is a transport of public pairing context, never a DB URI or secret vault key.
4. Existing device encrypts the vault master key or a scoped vault-share key specifically to the new device's authenticated key. User confirms scope and adds device to signed device authorization roster; recheck active roster at the gateway for server access. Existing device remains in control of approvals.
5. Revocation stops future gateway access and should rotate affected shared secrets. **A previously authorized device may retain downloaded plaintext or old ciphertext/keys**; revocation cannot claw back data already obtained. Clearly explain this, and re-encrypt retained shared records for future confidentiality if threat model requires.
6. Recovery: make a separately encrypted recovery bundle/seed, printable recovery kit or self-custodied password manager key. Backup encrypted data + recovery key separately. If user loses every authorized device and recovery secret, **recovery may be impossible by design**. Never secretly escrow in Bloom's account or call that zero knowledge.
7. Test lost-device, account reset, offline pairing, old session replay, backup restoration, phone replacement, biometric reset, lockout, key rotation, and key migration across iOS/web.

## 7. Database ownership and network architecture
**The user should not need to paste a connection string into the iOS app.** Choose `My own cloud` → create independent Neon project, PostgreSQL runtime role, and customer-owned gateway using audited setup instructions / deployment template. Enter DB URL + credentials **only into the customer-owned server secrets interface**. Verify TLS certificate/hostname and database role grants. Run migrations using separate short-lived migrator authority, then revoke; runtime role has minimum CRUD access in application schema and no DDL/superuser. A cloud provider's project owner/admin remains powerful; distinguish from crypto owner.

Provider-independent backend template (`bloom-private-gateway`): no central mandatory control-plane login for health operation, stable documented HTTPS API, offline-friendly client; compatible with Render, Fly, VPS, home server with authenticated VPN, or another hosting provider. Support provider-specific guides separately, but do not claim audits of every platform. If hosted on Render: an **internet-accessible web service** is required for direct iOS HTTPS; Render **private services** are internal-only. Alternative privacy-max mode uses VPN/mesh and a private-only listener; require user networking setup and honest offline status. Never expose Postgres or Python raw endpoints publicly.

**Bootstrap/onboarding UX:** (a) choose cloud/local/customer; (b) select host; (c) deploy official pinned image/template; (d) use secure server-side secret injection, no values in QR or browser telemetry; (e) gateway issues a one-time pairing request; (f) client checks TLS + signed app/gateway identity; (g) pair credentials, verify identity and synthetic CRUD; (h) back up and test restore; (i) readiness indicator shows actual encryption level, science freshness, update status, device count and backup state. For a nontechnical user prefer local mode or a managed encrypted vault rather than two mandatory cloud accounts.

## 8. Signed application/science/model update chain
- Separate **code updates** (App Store-reviewed native releases and signed deployed gateway containers) from **scientific claims/model/data packages**. Scientific package signatures cannot authenticate a malicious app binary. No downloaded executable JavaScript, Python, native extensions or arbitrary ONNX operators without reviewed sandbox and supply chain.
- Adopt mature **The Update Framework** (TUF): offline root ownership, trusted targets/snapshot/timestamp metadata, threshold signing where proportionate, expiry/freeze/rollback protection, delegated authorized model targets, pinned compatible formats, minimum client/schema versions and reproducible payload hashes. Securely embed roots in app; verify signatures/size/hashes *before* parse/install. Cryptographic verification **must not depend on Bloom servers receiving the user's data**.
- Maintain a separate, monotonic **scientific withdrawal/rights/safety authority** that survives rollback. Old signed package does not overrule later retraction; offline stale policy → bound availability or abstain for high-stakes claims.
- Local model weights installed only after licensing, memory/device-specific benchmark and safety review. Model outputs do not override source evidence or known unit values; user data is not silently uploaded. Optional local LLM and fast deterministic explanations are distinct states.
- Developer release process: protected branches, independent code review, CI, SAST/DAST/dependency scans, SBOM, pinned artifacts, provenance attestation, staged rollout, vulnerability disclosure, signing-key custody and emergency key revocation; independent audit of build/update/crypto pipeline. NIST SSDF + OWASP MASVS/MASTG underpin the checks, not unearned certification badges.

## 9. AI/ML operation in strict private mode
**Supported:** local deterministic calculations, reviewed evidence retrieval from signed public packages, local charting, manual Food/Today/Progress, iOS-compatible WASM/ONNX/other audited inference where device capacity allows; private Python research on a user-owned gateway only if the user accepts that the gateway will process plaintext or has separately authenticated an enclave design. **Not automatic:** remote cloud LLM, cross-user training, full local foundation model, private web browsing.

Three distinct opt-ins: `local_only`, `user_gateway_analytics`, `external_provider_specific` (exact provider, fields, region/retention and request). For E2EE, plaintext stays on client; a server-side Python solver needs explicitly authorized decrypting worker or locally computed bounded summaries. If E2EE vault shares a decrypting key with host, the host becomes part of the trusted plaintext domain and the E2EE claim must be narrowed accordingly. Never call customer-hosted compute 'zero-knowledge' by default.

## 10. Isolation from current roadmap and test architecture
- Add **one optional storage/execution provider selector** behind an unexposed capability gate. Default path remains `bloom_cloud` exactly as today. No production dynamic DB URL injection or global connection switching.
- Build a private-mode client SDK with shared typed canonical source/consent/measurement/claim contracts. Use migration/import/export adapters, not a rewrite of the existing food/lab/genetics backend. Domain contract tests run identically against adapters.
- Keep native SwiftUI schedule independent: prototype SDK can be platform-neutral, with adapters later implementing `LocalEncryptedStore` (Swift), `PrivateGatewayClient` (Swift URLSession), `SciencePackageVerifier`, `InferenceRunner`.
- No new database or hosting subscription is activated for product owner. Customer costs are separate, explicitly shown in onboarding. No paid AI provider enabled by prototype.
- Make baseline performance and privacy parity measurable before production: separate CI matrix for cloud vs private pilot; no regression to baseline; feature-specific Security/Legal review and actual device testing.

## 11. Non-negotiable acceptance tests (security release gates)
1. **Existing cloud regression:** Cloud-only app renders, saves Food, full-panel Response and exports on exact existing code paths; BYODB gate OFF yields zero private network or storage changes.
2. **Native local privacy:** on physical iPhone, intercept network: after local mode selection and consent denied, lab/genotype/sexual/food source content never reaches Bloom/cloud endpoints; only signed science public fetch traffic appears and can be disabled/offline.
3. **At-rest inspection:** device backup, SQLite files, temp files, iOS app switcher, widget, crash reports and system logs contain no private plaintext beyond reviewed exceptions; rooted/jailbroken adversary limitations explicitly measured.
4. **Encrypted account data:** database compromise or user database dump cannot decrypt S3-covered fields with no client keys; separately test S2 server-decrypted mode, never confuse it with S3.
5. **Key loss/recovery:** lose iPhone, restore vault + signed science using tested user recovery kit; without recovery kit and all devices gone, documented irrecoverability; no hidden operator escrow.
6. **Pairing MITM:** change QR destination, switch gateway certificate, replay invite, substitute public key: fail pairing. Two legitimate iOS devices share only explicitly permitted scope.
7. **Device revoke:** revoked device denied fresh ciphertext/analysis; rotating keys prevents future decryptable updates, but old acquired data remains unrecoverable from revocation—disclosed in UI.
8. **Malicious app update:** altered unsigned app/science/ONNX package rejected; detect expired metadata, rollback, forged key, mismatched rights, revoked claims. Document limitations of browser vs App Store updates.
9. **Vendor operator access:** prove Bloom central provider lacks BYODB customer DB creds, private keys, personal record logs and proxy; verify central telemetry, crash reporting, support diagnostics and billing do not ingest sensitive content.
10. **Gateway compromise:** stolen runtime role cannot DDL/read unrelated schemas; model/Gateway can still read S2 plaintext, but cannot decrypt S3 ciphertext; isolate Python service and egress.
11. **Scoped cloud AI:** external AI off yields zero personal external requests. On requires explicit provider, data categories, preview, retention/purpose and source revision; opt-in cannot become training consent.
12. **Stale jobs:** source revoked/consent withdrawn while compute pending → no stale result release; action/evidence claims remain under server/personal source governance.
13. **Backup:** encrypted backup restored into clean device and clean DB; original units, provenance/revisions and source ownership reconcile; revoked/withdrawn claims remain inactive.
14. **iOS background behavior:** app killed/offline/locked → no false processing success; durable triggers resume on unlock/open; protected data unavailable while locked as configured.
15. **Web parity:** browser local mode demonstrates XSS/extension attack surface, does not claim iOS Secure Enclave assurances or lie about protection from compromised origin.
16. **Accessibility/onboarding:** nontechnical pilot can complete own gateway or choose local safely, see provider costs/privacy tradeoffs; wrong credentials fail without disclosure.
17. **Independent assurance:** independent mobile (OWASP MASVS/MASTG), server/cloud, crypto-protocol and penetration review with documented scope/severity/mitigation before strong security marketing.
18. **Operational response:** emergency signing key rollover, dependency CVE, malicious model supply chain, private API revocation, breach and support escalation exercises pass without mandatory transfer of health data to Bloom.

## 12. Codex delivery and Architect reconciliation
**Architect:** preserve INT-PRIV-DATA-20261118-R1, dedupe R2 into `PRIV-DATA-01..10`, `SCI-INFRA-01..03`, ENG-EVOL and existing science governance. Do not create second roadmap. Make trust-tier/user-promise matrix an explicit independent Security-owned release gate, not a blocker to ordinary Food/Response.

**Codex first bounded spike:** a physical iOS demonstrator (or tested Swift prototype if native app not yet started) locally encrypts one synthetic source observation, verifies one signed nonpersonal science package, performs a local deterministic rule, exports and restores to a fresh device/simulator, shows network capture with no personal data and demonstrates locked-device protection. In parallel prove a synthetic account can connect via a *customer-owned HTTPS gateway* to a separate Neon test DB without sharing credentials with Bloom. Do not change production. If native app priority remains later, first build platform-neutral protocol and test fixtures; defer physical Swift prototype until authorized.

**Security lead:** commission independent threat model and code/cryptographic review, approve levels S1/S2/S3 separately, set device/passkey/key recovery policy and technical privacy notice. **Codex alone cannot self-attest to Signal-level security.**

**Evidence:** source SHA, threat model revision, platform/device/OS, binary checksum, gateway image digest, database-role audit, actual packet capture, crypto known-answer tests, independent audit reports, user-testing receipts, recovery drill and staged RC review. Track `specified / coded / locally tested / independently audited / hosted tested / user accepted / activated` independently.

**No live private health data or customer infrastructure should be enrolled until the corresponding independent Security/Privacy/Legal scope and provider costs are accepted.**

## 13. Sources and direct references, verified Nov 18 2026
- Previous full blueprint: `Bloom_Private_Data_BYODB_Security_Architecture_Handoff_2026-11-18.md` (INT-PRIV-DATA-20261118-R1).
- Apple Platform Security, Secure Enclave, Keychain, File Protection: https://help.apple.com/pdf/security/en_US/apple-platform-security-guide.pdf ; https://developer.apple.com/documentation/Security/protecting-keys-with-the-secure-enclave ; https://developer.apple.com/documentation/Security/keychain-services ; https://developer.apple.com/documentation/uikit/encrypting-your-app-s-files
- App Attest: https://developer.apple.com/documentation/devicecheck ; https://developer.apple.com/videos/play/wwdc2026/201/
- OWASP Mobile Application Security Verification Standard and Testing Guide: https://mas.owasp.org/MASVS/ ; https://mas.owasp.org/MASTG/
- NIST Secure Software Development Framework: https://csrc.nist.gov/pubs/sp/800/218/final
- Render public/private services: https://render.com/docs/private-services ; https://render.com/docs/web-services ; https://render.com/docs/infrastructure-as-code
- Signal's public cryptographic protocol specifications and open source: https://signal.org/docs/ ; https://support.signal.org/hc/en-us/articles/360007320391-Is-it-private-Can-I-trust-it
- TUF metadata and revocation: https://theupdateframework.io/ ; https://theupdateframework.org/docs/metadata/

**Status:** Security architecture specification. No iOS application, keys, gateway, cloud service or model deployed during this review.