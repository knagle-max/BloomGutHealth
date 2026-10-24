# Bloom deferred decisions and external dependencies

No noncritical question should pause other approved work. Keep safe defaults, never invent credentials/reviews, and reconsider entries only when their dependencies change.

## NATIVE-107 — native delivery scope

- Status: BLOCKED_USER_INPUT / Architect platform decision. First inspect any newer consolidated handoff; do not ask again if it already resolves this.
- Exact question: Does the v0.5 release require shipping native HealthKit/Health Connect clients, or is browser/PWA delivery with truthful unavailable device integration the approved release target?
- Why needed: Real device permissions, incremental sync and hardware acceptance require a concrete native client/platform and entitlements; browser mocks cannot satisfy them.
- Choices: (1) Confirm browser/PWA scope and retain unavailable device connections; (2) confirm a native/hybrid platform and required OS/device targets.
- Recommended interim default: Continue the existing browser implementation and keep device access unavailable while the Architect confirms scope. This is not permission to omit native work if authoritative v0.5 acceptance requires it.
- Deferral impact: Blocks native implementation/real hardware acceptance only; account, nutrition, evidence and browser correctness work can continue.

## FOOD-501 — exact live packaged-product acceptance

- Status: EXTERNAL_ACCEPTANCE_PENDING, not a missing-key decision. Owner already replaced the rejected key; Render's actual fixed public lookup returned 20 results.
- Exact evidence needed: On the deployed intended product-search UI, verify Kit Kat / KitKat / kit kit bar and Michelina's; select the package's actual country/variant/serving, save the meal and confirm daily totals. Record genuine source IDs and failures, not invented SKUs.
- Choices: Authorized independent tester performs this in the hosted UI; or owner supplies acceptance findings while engineering continues.
- Recommended default: Independent tester on synthetic accounts. Direct hosted browsing from this execution environment has been blocked by proxy CONNECT 403.
- Deferral impact: Keeps exact product/Canadian coverage acceptance open. Does not block source-independent development or manual labels.

## OFF source activation and specialist sign-offs

- Status: EXTERNAL_REVIEW_PENDING. Existing Legal/Integration, medical, privacy/security and launch gates remain binding.
- Exact evidence needed: Written source-rights decision before OFF activation, and actual specialist review of the running build for their respective release gates.
- Recommended default: OFF and unapproved clinical/provider/research capabilities remain disabled; continue approved independent engineering.
- Deferral impact: Blocks the specific source/clinical activation or public release approval, not routine commits or development preview deployments.

## EXEC-RESOURCE — execution limit, not user product input

- Status: BLOCKED_EXECUTION_RESOURCES.
- Evidence: Automatic approval review refused the full regression/build command with an account usage-limit message. It explicitly said the command was not executed, this was not an unsafe-action determination, and not to bypass the review.
- Resolution: Resume when the account's execution resources are available. Do not repeatedly retry or use another path to perform the rejected command. No new product decision or repeated deployment permission is required.
- Impact: Local food-result cleanup remains uncommitted/unpublished pending final checks. Verified account-erasure work is already committed, CI-passing and live.
