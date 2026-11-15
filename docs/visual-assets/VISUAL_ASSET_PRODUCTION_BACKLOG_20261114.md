## LATEST AUTHORITATIVE CORRECTION — SIX REQUIREMENTS RESTORED (2026-11-14)

The latest owner clarification states **only the poor-quality images were withdrawn, not their asset requirements**. The canonical registry is restored to **28 active BVA IDs**; **BVA-0022 and BVA-0024–0028** are **active replacement-production briefs** with detailed scene, human/biological accuracy and UI crop specifications. Their *old generated images* remain rejected/unapproved. **BVA-0023** retains its individually approved image. Restore Batch D's six asset rows to the production backlog as `Briefed — replacement artwork required`, not retired or approved. Older notices below referring to 22 active or retired Batch D IDs are historical and superseded; all counts and production dispatch must use the current JSON. Individual owner image approval before publication/distribution remains mandatory. Do not infer the new images were generated from the existence of their comprehensive briefs.

---

## Current owner-controlled registry counts and detailed brief quality (2026-11-14)

**Live canonical registry now contains 22 active records**, each with detailed production-ready `productionBriefV2` text including exact scene geometry and staging, physical optics and light, mode/negative-space use, scientific limits/exclusions, existing image handling and combined generation instruction. The original 28-item source-audit seed in this historical backlog is **superseded** by six later owner withdrawals: **BVA-0022, BVA-0024–BVA-0028**. Do not treat historical Batch D rows for those IDs as current production authorization; remove them from the actionable dispatch list. **BVA-0023** is separately owner approved and must not be replaced. The canonical `ownerPublicationGate` requires every new/revised actual image be shown individually to owner and approved **before publishing to Shared Library, GitHub asset paths or developer distribution**. Editing a textual description does not change the image status. Future Codex source audit/production counts must read the live JSON instead of cached 28/20 estimates.

---

# Bloom — Visual Asset Production Backlog and Initial Full-App Audit
**2026-11-14 | Chief Architect initial source audit | Status: PARTIAL source-based, mandatory Codex full rendered audit outstanding**
**Canonical requirements:** [visual-asset-registry.json](visual-asset-registry.json). This Markdown document is a **generated/maintained human work queue** keyed by the same permanent asset IDs, not another registry. No unregistered image request or undocumented artwork reuse.

## Source-inspection evidence and limits
Architect inspected current branch `enhance/bloom-experience` source: `client/src/App.tsx` (22+ route definitions), `client/src/components/BottomNav.tsx`, `AppNavigation.tsx`, `AppHeader.tsx`, `client/src/content/editorial-media.ts` (8 mappings), `client/src/components/EditorialMedia.tsx`, `client/src/pages/Dashboard.tsx`, `NutritionHistory.tsx`, `PrecisionNutrition.tsx`, `Progress.tsx`, `Explore.tsx`, `Microbiome.tsx`, `AthleteWorkspace.tsx`, `client/src/components/BloodworkSourceOverview.tsx`, and `shared/scientific-visuals.ts` / `shared/data/scientific-visual-assets.json`. Existing scientific icon registry and portrait system are real preexisting assets; no blanket replacement authorized. **Not yet done:** recursive component inventory, all static file bytes/digests, screenshot/rendered app audit, actual quality assessment, all nested UI states, full mode coverage, external specialist acceptance and performance measurement. Treat 'reuse-review' as *existing mapping identified*, not asset inspected or rendered verified. The full audit must determine which assets are unnecessary as well as missing.

## Priority: first owner-screenshot-equivalent visual slice
The owner's immersive Bloodwork screenshot is the **highest aesthetic reference** for Everyday: deep layered forest, botanical environmental lighting, cream display serif, atmospheric red blood cell hero, semi-translucent system-category rows with individually art-directed anatomy thumbnails. Image files must match context and retain responsive text legibility. **Do not fabricate metrics or remove raw lab rows**. Existing `BloodworkSourceOverview` currently displays source report headings; any category artwork must be tied to an approved **presentation grouping** with actual selected marker access, source-preserving original report navigation and no inferred clinical category/diagnosis. This is not a new lab classification engine.

### Batch A — first visual calibration; P0
| ID | Placement | Asset | Existing / needed | Main proof |
|---|---|---|---|---|
| BVA-0009 | Biology → Bloodwork | Atmospheric RBC/forest hero | Generate | Responsive left text region and category list contrast |
| BVA-0010 | Heart & cholesterol category | Anatomical heart thumbnail | Generate | Credible anatomy, consistent crop; click to real markers |
| BVA-0011 | Blood sugar & insulin | Glycaemic conceptual illustration | Generate | Legible visual at small size, not false CGM |
| BVA-0012 | Liver & biliary | Liver thumbnail | Generate | Correct liver/biliary depiction |
| BVA-0013 | Iron & blood nutrients | RBC thumbnail | Generate | Physical realistic morphology, no fake patient's micrograph |
| BVA-0014 | Bone & micronutrients | Cancellous bone visual | Generate | Correct structural scale, legible against deep green |

**Group production:** one 16:9 wide hero plus five cohesive square thumbnails, same olive-dark environmental lighting, varied biological subjects, no embedded labels, glow used sparingly, physical material fidelity. Generate responsive variants if crop test needs them. Design Specialist approves composition; Biology Specialist reviews anatomical/scientific teaching accuracy; Codex verifies first-party asset rights, hash, crop/accessibility, actual component layout and after/before user task.

### Batch B — everyday engagement and actual Food value; P0/P1
| ID | Placement | Asset | Decision |
|---|---|---|---|
| BVA-0001 | Today | Existing meadow hero | Reuse-review versus upgraded atmospheric natural hero; preserve adequate overlay contrast |
| BVA-0002 | Food | Existing oatmeal/linen hero | Reuse-review; compare actual food fidelity to current premium direction |
| BVA-0015 | Today/meal planner | Specific meal suggestion photograph | New photo family, must match actual ingredient recipe or general editorial example explicitly |
| BVA-0016 | Food nutrient journal | Grain/seed macro accent | Only include if it adds clear visual hierarchy, not another card |
| BVA-0008 | Food empty state | Existing original SVG | Reuse-review and check visual fit |
| BVA-0026 | Bloodwork empty | Soft botanical illustration | No fictitious report content |

**No unbounded asset generation per meal record.** The recipe/item image strategy must avoid incorrect identity, food-allergen mismatches, or falsely claiming to show a user's uploaded meal.

### Batch C — biology, pathways and progress; P1
| ID | Placement | Asset | Decision |
|---|---|---|---|
| BVA-0003 | Biology overview | Existing conceptual cell hero | Reuse-review; assess richer themed replacement |
| BVA-0017 | Gut reports | Microbial ecology editorial artwork | Conceptual not a user-specific assay |
| BVA-0018 | Genetics | DNA science accent | Educational only |
| BVA-0004 | Explore | Existing blueberry macro | Reuse-review versus more coherent pathways-led hero |
| BVA-0019 | Explore | Living Atlas environmental hero | Original botanical/scientific illustration; reserve text-safe area |
| BVA-0020 | Explore | Editable scientific pathway kit | Prefer SVG/app-native nodes; real data never flattened into decoration |
| BVA-0006 | Progress | Existing leaf sprig | Reuse-review; retain only if genuinely improves ledger |
| BVA-0021 | Progress | Quiet botanical ledger header | Should not diminish data readability |

**Existing scientific media source:** `shared/data/scientific-visual-assets.json` is separately and more narrowly controlled for taxonomic/molecular/biological identity. Link/consume it rather than copying dozens of existing scientific asset entries verbatim or losing their scientific approvals; master registry owns new UI production requirements and references source-registry IDs. Codex must run mapping coverage and visual checks.

### Batch D — Athlete BLUE, Coach PURPLE, access and support; P1/P2
| ID | Surface | Decision |
|---|---|---|
| BVA-0005 | Athlete editorial hero | Reuse-review existing blue-capable mountain visual; don't repaint blue identity green |
| BVA-0022 | Athlete workout | Athlete movement study, safety/anatomy-reviewed where instructional |
| BVA-0023 | Athlete recovery | Blue-led authentic human/environment photo |
| BVA-0024 | Coach professional header | Purple-led premium collaboration; only where Coach is authorized and actually present |
| BVA-0007 | Profile | Existing shared sprig; do not duplicate same decoration on every section |
| BVA-0025 | Signup/onboarding | Original welcome hero; calm layout and fast load |
| BVA-0027 | Activity empty | Deliberate friendly low-burden placeholder |
| BVA-0028 | Upload | Subtle editorial source-document education |

**Further discoveries:** New routes and components will add sequential BVA IDs after BVA-0028; retire IDs instead of reusing them. Any currently unmapped visual already in repo should be assessed for an explicit registry link, or included in an indexed preexisting-asset manifest if it is a passive internal scientific catalogue. No unnecessary artwork for dense input tables or straightforward controls.

## Route-by-route audit matrix (source-level, NOT yet visual signoff)
| Known route / family from `App.tsx` | Audited existing references | Image decision and coverage still needed |
|---|---|---|
| `/` Today | Dashboard source, existing media mapping | BVA-0001; inspect current hero + TodayFocus, journal, activity states |
| `/nutrition` Food journal | NutritionHistory `EditorialMedia` | BVA-0002 / 0008 / 0016; meal rows, nutrition detail, modal states |
| `/log-meal`, `/saved-meals`, `/meal-planner`, `/plan-day` | routes and partial Food component source | BVA-0015 recipe photo strategy; preserve edit/save/portion search |
| `/precision`, `/biology/reports` | PrecisionNutrition and BloodworkSourceOverview source | BVA-0003, 0009–0014, 0018, 0026; report source/lab/genes/method and empty states |
| `/microbiome` | Microbiome uses editorial and organism portraits | BVA-0017; scientific-visual existing registry integration |
| `/explore` | Explore uses `EditorialMedia` + `MolecularIllustration` | BVA-0004 / 0019 / 0020; real evidence graph labels and restricted views |
| `/progress`, `/weekly-review` | Progress media mapping and chart components | BVA-0006 / 0021; trend/ledger reading and empty states |
| `/activity` | route inspected; page render not inspected | BVA-0027; actual log/review usability |
| `/athlete`, `/athlete/:section` | AthleteWorkspace and current Athlete mode routes | BVA-0005, 0022, 0023; training/fueling/recovery/competition and blue identity |
| `/insights`, `/health-insights` | route definitions; Coach eligibility not verified | BVA-0024 where actually Coach; preserve role/purpose restrictions and purple |
| `/profile` | profile route and editorial mapping | BVA-0007; profile/consent/settings/forms/export |
| `/upload` | route definition | BVA-0028; actual report import and errors |
| `/login`, `/signup` | auth route definitions | BVA-0025 if appropriate, careful performance/contrast |
| `/admin/features`, `/demo` | gated/utility routes | no decorative imagery mandate; check legibility, access and consistent shell |
| global AppHeader / BottomNav / AppNavigation, dialogs, loading/errors | code read | preserve all critical routes and user actions; no unnecessary imagery, beautiful intentional fallbacks |

This matrix is **not the finished audit**: Codex must automatically enumerate every actual route, child route, rendered major component, role-gated state, existing image/CSS background reference, light/dark and viewport, then record `reuse / keep / replace / missing / no artwork justified` with reason. This prevents both regressions and needless image generation.

## Production definition-of-done for each asset
`Identified → Briefed → Approved for Production → Generated → Design Reviewed → [Scientific Reviewed or N/A] → Approved → Integrated → Visually Verified`. Separate file existence, rights/prompt review, app placement and rendered tests. An image source mapping in old code does **not** advance lifecycle past an appropriately documented legacy reuse review. Preserve first-party file path/hash, approved prompt version, source/reference restrictions, responsive crop, fallback/alt text, scientific disclaimers, CSS and real screenshot evidence. Missing assets remain reserved in a dimensionally stable attractive placeholder tied to valid IDs. See Codex contract in `docs/architecture/VISUAL_ASSET_REGISTRY_CONTINUOUS_PRODUCTION_CODEX_HANDOFF_20261114.md`.

**Audit completion:** OPEN — current 28 entries are a useful first seed; full rendered 100%-route coverage, precise file verification, asset generation and visual quality remain Codex tasks. Avoid reporting all of this as PASS until performed.
