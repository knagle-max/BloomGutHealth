# Bloom R4 M1 implementation

The owner required M1 before any RC sign-off. The earlier `06efa3f` RC remains historical evidence; it is not the current approval target. Original Designer M1-D, complete R4+M1 master, corrections, asset ledger and Biology restoration are available/read at `16b8546`. No further source-access question is outstanding.

## Delivered code

- Imported all 13 original PNGs and 26 supplied WebPs byte-for-byte at `client/public/images/editorial/`. Validated eight archive CRCs, all 39 hashes/lengths/dimensions, actual Pillow decode/alpha, original identity and declared 2x upscaling. Removed inactive provisional engineering WebPs and unused `EditorialArt`; originals remain preserved in source/history. See [delivery receipt](../../design/visual-system/r4-m1-media/DELIVERY_RECEIPT.json).
- One passive, typed `EditorialMedia` and approved-slot registry. Actual WebP failure switches to the original SVG; SVG failure collapses art. Source/variant changes reset failure state. Real intrinsic sizes, responsive candidates, decorative semantics and a visible conceptual label persist through fallback/forced colors. No personal values or arbitrary external URLs are accepted.
- Original R4 CSS remains an exact prefix. The exact final M1-D §D4 rules and §D3 sizes/crops are merged into that same canonical file, imported once. Biology's caption flows below the image per D3; square SVG fallbacks use contain. Progress/Profile have separate header columns at tablet/desktop and no ornament below768px. No new palette or global photo skin.
- Today/Food/Biology/Gut/Explore/Athlete have prescribed intentional mobile media in non-data slots. Actions, source/clinical warnings and critical forms retain their order. Journal art disappears during add/edit; LogMeal art exists only in the method chooser. The empty-journal SVG requires a successfully confirmed empty journal.
- Bloodwork analyte names open direct adjacent marker details reusing `LabSourceHistory`, `LabSourceContext`, trends and original correction/deletion safeguards. Real report headings remain source-defined; zero, provisional and source-only rows stay distinct. Back restores the activating name; existing `labResult` deep links open the record without a collapsed-history hunt.
- Gut Reports shows reported organisms by default and offers a direct browse action. Existing comparison, search, source-qualified portraits and name→profile interaction remain. Five calm sections retain all source observations, research, citations and interpretation limitations; no clinical classifications or personalized scores were introduced.
- Production static serving returns404 for missing editorial/SVG assets instead of SPA HTML, preserving normal SPA routing. Assets remain public; no activation gate was added.

## Executed engineering evidence

| Check | Result / scope |
| --- | --- |
| M1 route matrix | PASS:72 cases across9 routes (seven main views +Journal/Gut),320/390/768/1440, both themes; authored heights, image visibility, critical rectangles, semantic action order, contrast and no overflow. |
| Shared views in Athlete | PASS:56 cases across7 shared views in both themes. Tablet ornament conflict repaired with a reserved column. |
| 200% collision checks | PASS:18 additional cases and9 route text-zoom checks; no image/title/control/status overlap. |
| Actual media HTTP/failover | PASS:39 PNG/WebP +87 SVG local HTTP200/MIME/digest responses; WebP404→SVG, double failure/offline collapse, source/variant reset, real DPR2 failure, conceptual SVG caption, forced colors and no-flag behavior. |
| Production build/browser | PASS:strict typecheck/build and72-case matrix against actual compiled app/CSS/images on local production static server. All API responses are intercepted synthetic fixtures; mutating requests are denied. Athlete's compute-only POST is intercepted and never forwarded. |
| Production HTTP checker | PASS locally:39 exact PNG/WebP responses plus compiled CSS bytes/MIME/digests through the production static-serving function. Two real HTTP tests cover static404/MIME/SPA behavior and the full39-file checker. |
| Domain regressions | PASS:27 focused lab history/source/grouping/taxa/research/food-entry/set tests. Crosswalk249 source files,52 registry IDs; API inventory unchanged. |
| Source/data journeys | PASS:direct bloodwork-name keyboard/deep-link/Back/zero/provisional/raw source flows;40-taxa Gut profile/filter/report switch/paused/offline/focus; encrypted saved-food/retry/reload/owner; food chooser draft/capability; compact five-set edit/completion/source-ID/save/reload; Profile dirty refresh/conflict/lost response. |

The [machine-readable mapping](R4_M1_IMPLEMENTATION_20261108.json) provides per-slot originals/hashes, target variants, crop, breakpoint sizes, fallback and state rules. No screenshot gallery or independent reviewer approval is claimed.

## Published verification

The existing CI now checks39 public Render image URLs and exact compiled CSS against the build, then runs the72-case browser matrix against the real Render frontend using read-only intercepted synthetic API fixtures. It uses pinned `playwright-core` and the runner's installed Chrome; no browser account, production data, credentials, new service or private API transfer is involved. Full unit/embedded PostgreSQL, dependency/Python contracts and isolated live Neon persistence checks remain mandatory.

Publication SHA, CI result and Render revision are recorded after push; local results above do not predeclare those outcomes. This workspace's direct Render proxy403 does not certify delivery; the remote CI checks supply separate evidence when they actually pass. Hosted synthetic rendering does not certify real Render account persistence/database identity, physical VoiceOver/devices, independent Design/scientific/legal acceptance or raster commercial rights/model/prompt provenance. Those limits remain explicit; main and the v0.6 stash are untouched.
