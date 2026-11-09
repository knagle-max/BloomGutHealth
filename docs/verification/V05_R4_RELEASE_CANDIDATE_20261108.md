> **Superseded approval target:** the owner subsequently required full R4 M1 and Biology restoration before any RC sign-off. See [M1 implementation](R4_M1_IMPLEMENTATION_20261108.json). The application/CI facts below remain historical evidence, not current RC readiness.

# Bloom v0.5 + R4 — consolidated release candidate

Application commit: [`06efa3f146dcc20ba2fad840e73ee2b29db441e5`](https://github.com/knagle-max/BloomGutHealth/commit/06efa3f146dcc20ba2fad840e73ee2b29db441e5). Review branch: `enhance/bloom-experience`, PR #1. [Working preview](https://bloomguthealth.onrender.com). Render reports this application commit live (`dep-dbnshia9lscs73cdr1v0`). [Final application CI passed](https://github.com/knagle-max/BloomGutHealth/actions/runs/42432060658), including full unit/embedded PostgreSQL, production build, Python contracts and live isolated Neon persistence.

This candidate combines existing v0.5 functionality with the final R4 implementation across Today, Food, Biology/Gut, Explore, Progress, Athlete, Profile and shared navigation/states. It is ready for the consolidated owner review required by the latest execution policy. It does **not** certify public/clinical release or fabricate the outstanding independent/operator/device/source evidence.

The [machine-readable packet](V05_R4_RELEASE_CANDIDATE_20261108.json) contains immutable application/configuration tree fingerprints, the nine R4 implementation dispositions, the unchanged 207-ID legacy trace and all remaining boundaries. Subsequent packet-publication changes are documentation only; the application baseline remains the tested commit above.

## What changed and what to review

| Experience | Implemented behavior and engineering evidence |
| --- | --- |
| Today | Authored R4 typography/copy/materials; actual next action and recorded nutrition retained. Synthetic empty/source/food workflows and responsive checks pass. |
| Food | Original decorative cutout in the desktop chooser only. Drafts survive method switches; foods/portions precede totals; changed reviews require recalculation. Explicit save/retry/reload, zero/unknown and owner-isolation checks pass. |
| Biology/Gut | Source-first entry, truthful qualitative/pending/mixed/paused states, discoverable report management. Synthetic quantified/functional taxon detail views retain original values and sources; keyboard/focus/offline/reflow checks pass. |
| Explore | Source studies/map and explicit food lookup retained. Topic changes clear prior personal food context; three subjects, search, keyboard and large-text reflow pass. |
| Progress | Actual dated/gapped observations, explicit zero and unknown amounts retained. Shared unit editing lives in Profile; the tested Progress link opens that editor. |
| Athlete | Authored navy palette in both themes with the original light wordmark. Five compact source-derived sets, independent completion/edit targets, stable IDs, focus/add/remove and encrypted save/reload pass; planned status is not promoted to completed. |
| Profile | Grouped account, units, preferences, connections and privacy preserved. Incomplete/failed-save drafts retain meaning; conversions preserve canonical amounts and independent Athlete reference values. |
| Shared shell | Original registered navigation icons, unchanged destinations and visible labels. 44px close targets/title clearance, Enter/Escape/focus return, theme-colored portals, four-width/two-theme and 200% text checks pass. |

Originals: 125 imported files match their committed Git blobs byte-for-byte, including all 13 PNGs and 87 SVGs. Manifests, dimensions, color modes, public copies and source-linked WebP derivatives pass verification. The canonical CSS and copy module are exact source copies; one canonical stylesheet is imported. Separate Anatomy asset-only delivery and the v0.6 stash remain untouched. See [import verification](../../design/visual-system/R4_IMPORT_VERIFICATION_20261108.json) and [implementation evidence](R4_UI_INTEGRATION_20261108.md).

## Safety, privacy and acceptance boundaries

- Engineering regression evidence covers authentication/admission, account isolation, encrypted persistence, source/currentness/consent guards, bounded input, exact deletion lineage and retry semantics. These are software checks, not an independent operational security certification.
- Source facts and general education remain distinct from consequential personalized clinical claims. No assay applicability, clinical efficacy, regulatory approval or scientific validation is created by R4 art/copy. Known source/claim restrictions remain in place.
- No production database/schema/data operation, new paid infrastructure, private-report transfer, main merge or v0.6 implementation occurred. CI's isolated Neon checks do not identify or validate Render's actual database binding.
- Direct hosted browser/static-byte checks from this workspace remain unverified because its proxy refused CONNECT with HTTP 403. Render's exact-commit live status is verified separately. Artwork uses normal public static paths; no application activation gate was introduced.
- Physical VoiceOver/device testing, independent Design/usability/scientific/legal acceptance, original unavailable criterion/source equivalence and operator/retention/rights evidence remain explicitly ungranted. The [207-ID dispositions](V05_CURRENT_REQUIREMENT_DISPOSITIONS_20261107.json) preserve 44 `ALREADY_VERIFIED`, 36 `IMPLEMENTED_AND_TESTED`, 126 `BLOCKED_TECHNICAL` and one `BLOCKED_USER_INPUT`; those historical bounded statuses are not blanket certification or new interim coding queues.

## Final owner decision

The owner policy in [NEXT_ACTIONS.md](../../NEXT_ACTIONS.md) requires one final integrated review before main and states: **“No v0.6 feature coding until the approved RC is merged to main.”** No approval is inferred from automated continuation, successful CI or preview deployment.

Review this candidate and approve the main merge or supply concrete integrated defects. Any reported safe, reproducible defect can be fixed on the review branch without renewed per-fix approval. v0.6 remains at stash `f0fd36479176b1daa7b8c5525306292b10670d8f`; after the separately authorized merge, resume the approved dependency backlog and manually preserve the later UI/source changes when restoring it.
