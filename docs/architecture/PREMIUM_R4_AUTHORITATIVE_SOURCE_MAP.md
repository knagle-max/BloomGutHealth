# Bloom Premium Production R4 — authoritative source map for Codex

**Status:** Binding engineering input. This document points to *actual* specialist files and original source assets, not a replacement design specification. Owner authorization: implement all seven experiences autonomously, no interim feedback/screenshot deliverables, present one full RC before `main`, defer all unrelated v0.6 features.

**Library root:** `/Bloom gut health/Agent Handoffs/`. Find files there by **exact filename**. If Codex's running environment cannot read shared Library originals, report an actual source-access issue and obtain them via an authorized transfer; **never fabricate a substitute** from this source map or a GitHub issue summary.

## 1. Read and import these first (normative current source)
1. **Integrated FINAL package:** `Bloom_R4_Final_Integrated_Designer_Production_2026-11-07.zip` — SHA256 `9076ecdedb071b20a48051de2b301c5ffd6d69b645152675ccd0fa10c08b6cc2`. Actual authored artwork/CSS/copy/spec files. Use originals, verify each manifest hash and preserve a copy under `design/visual-system/`.
2. **FINAL master spec:** `Bloom_Master_Build_Spec_R4_FINAL_Designer_Complete_2026-11-07.md` (also **at ZIP root**), includes screen-by-screen structure, Branding/Designer/UX appended decisions and final asset mappings. Read complete document, including appended late authoritative sections; the first-page historic R3 “TO COMPLETE” statements are superseded when closed in later appendices.
3. **Designer final audit:** `Bloom_R4_Designer_Final_Spec_Audit_2026-11-07.md`. All 87 original SVG asset hashes verified. Source takes precedence over older R3/R4 independent ZIPs for the *asset inventory*, route/state artwork mapping, one canonical scoped visual stylesheet and duplicate-motion prevention.
4. **Brand voice & exact copy:** `Bloom_R4_Brand_Voice_And_Microcopy_Production_Completion_2026-11-07.md`, `Bloom_R4_Brand_Copy_Table_2026-11-07.csv`, `bloomCopy.ts`, `bloomCopy.json`. 204 keys including runtime-reserved keys; integrate wording without overwriting live dynamic action, source, test date, unit, consent, status, save receipt or scientific claim. Handoff calls these implementation-ready **proposed** text; do not falsely claim independent Brand signature or validated medical claims.
5. **Structural UX source:** `Bloom_UX_R4_Closure_Implementation_Contract_2026-11-07.md` and its code bridge `Bloom_Premium_Production_Structural_UX_Code_Bridge_2026-11-07.md` where not superseded. R4 UX closure controls semantics: Today's true contextual CTA, food explicit review→server save, meaning-first biology, research-only Explore caveats, date-faithful Progress, planned≠completed Athlete, Profile canonical shared units and privacy/revision protection, heading/nav/focus order.
6. **Architect integration authority:** `Bloom_Architect_R2_Premium_Production_Integrated_Execution_Handoff_2026-11-07.md`, `Bloom_Architect_UX_to_Code_Primitives_Execution_Directive_2026-11-07.md`, `Bloom_Architect_Visual_Experience_Quality_and_Implementation_Directive_2026-11-07.md`. Later **owner** and this **R4** source map override older instructions demanding a Today STOP/checkpoint, interim screenshot galleries or v0.6 parallel feature implementation.
7. **Original Branding asset and code-first lineage:** `Bloom_Branding_UX_CONTINUITY_v1.5_2026-11-07.md` and `Bloom_Branding_UX_User_Review_Refactoring_Handoff_R2_FULL_SOURCE_2026-11-06.md` (full source Appendix A1–A8). Reuse already supplied React/CSS implementations when compatible. Latest R4 finished visual design supersedes conflicting older *paint*, but never deletes source correctness, consent or deep scientific access.

## 2. Relevant specialist quality contracts (consume, don't recreate)
- **User Testing / visual quality:** `Bloom_User_Testing_Premium_Production_R2_Cross_Agent_Execution_Review_2026-11-07.md` and `Bloom_User_Testing_Visual_Experience_Quality_Gate_Addendum_2026-11-07.md`.
- **Functional visual safety / route states:** `Bloom_Premium_Production_Visual_Gate_And_PR_Acceptance_2026-11-07.md`; where this requests interim image artifacts or Today approval, later owner instructions **explicitly supersede** those deliverables. Actual browser, keyboard, responsive, contrast and accessibility checks still apply.
- **Science/security/legal/integration:** Maintain independently approved v0.5 technical contracts; source fidelity, privacy, food review/save, consent, tenant isolation, legal claims and provider rights must not regress. No new health claim or permission is granted by a design package. Final evidence is consolidated once at RC.

## 3. Exact production assets and integration
Use actual files **inside the final ZIP**, not guessed filenames or reconstructed assets:
- `assets/` — 87 original SVGs and `FINAL_R4_DESIGNER_ASSET_MANIFEST.json`; original assets are production candidates, artwork references are not data-bearing screen images.
- `assets/styles/bloom-visual-scoped.css` — **only** canonical premium skin; import once. Old `bloom-premium-visual.css`, `bloom-production-skin.css`, early v2.3/v2.4 duplicate skins and `supporting-asset-classes.css` must not be loaded concurrently.
- `assets/styles/motion.css` — optional reference; avoid duplicated effects with canonical skin.
- Use fixed scoped focus: `.app-shell[data-bloom-visual="premium"] main :is(button, a, input, select, textarea, summary):focus-visible`.
- Render **actual user-owned records** in components. Illustrative mockups are design guidance, never personal findings; decorative imagery must not obscure user actions.
- **Known package pointer discrepancy:** Branding nested manifest references an earlier independently published `Bloom_Master_Build_Spec_R4_Designer_UX_Brand_Copy_Integrated_2026-11-07.md` not nested in the ZIP. Use the newer **FINAL** master at ZIP root; earlier file exists in Library if needed as historical evidence.

## 4. Nonnegotiable coding rules
- **No independent new design:** no invented palette, stock icons, extra layout pattern, new dashboard cards, faux telemetry, guessed biological diagrams, or reauthored typography/brand voice while approved Designer assets/copy exist. Permit necessary implementation adaptation only; log differences as source-mapped deviations.
- **No rewrite of working infrastructure:** preserve navigation/CTA, auth/privacy/consent, import sources, account tenancy, saved/unsaved and concurrency states, unit/date provenance, accessible detail layers, null/unknown ≠ zero.
- Implement Today, Food, Biology/Gut, Explore, Progress, Athlete, Profile and shared shell/states to final R4 visual compositions. Use original designed visual material; genuine editorial architecture instead of merely restyling old cards.
- **Don't stop after Today.** No interim owner, Designer, Architect or Structural UX go/no-go. No screenshot/image deliverables. Test actual UI at 320/390/768/1440, light/dark, Everyday/Athlete, zoom, focus, screen-reader and critical interactive states with compact test receipts.
- Only once complete: freeze one RC SHA/preview and provide consolidated engineering, QA, visual, Biology/Security/Legal evidence and actual outstanding defects for the owner's single approval before merging to `main`.
- Don't develop unrelated v0.6 features until approved RC is merged into `main`.

## 5. Per-screen traceability (developer supplies as code is implemented)
Record: source document section / source SVG+hash / copy key → final file path and commit → existing domain state preserved → test receipt → explicit deviation, if any. An inaccessible asset is `SOURCE_INACCESSIBLE`, not permission to replace it with AI-generated artwork.

**Execution task:** https://github.com/knagle-max/BloomGutHealth/issues/3 . **Development PR:** https://github.com/knagle-max/BloomGutHealth/pull/1 . **Task priority:** repository root `NEXT_ACTIONS.md`.
