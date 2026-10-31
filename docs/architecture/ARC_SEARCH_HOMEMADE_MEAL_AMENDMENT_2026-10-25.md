# Bloom P0 Food Search — Homemade Meal Acceptance Amendment
Date: 2026-10-25 | Authority: Product Owner | Status: APPROVED REQUIREMENTS; NOT IMPLEMENTED OR TESTED
Parent: docs/architecture/V06_HANDOFF.md section 40, ARC-SEARCH-01 through ARC-SEARCH-03
Related: BLOOM-FOOD-01–03, canonical Add Food and meal saving, ARC-SEARCH-04–06, ARC-REVIEW.

This is an amendment to the existing P0 search backlog. Do not create a parallel search engine or food database.

## ARC-SEARCH-01 — Homemade intent and routing
Recognize searches containing homemade, home-prepared, and equivalent intent. When appropriate verified generic or home-prepared records exist, rank them above branded packaged alternatives. A brand-explicit query remains brand-sensitive; ambiguous terms can return differentiated categories.

## ARC-SEARCH-02 — Provenance and substitution
Distinguish Generic, Home-prepared and Branded **only from accurate underlying source metadata**, not query wording or inferred labels. Home-prepared is permitted only where the provider record supports that preparation category. Branded alternatives remain accessible, visibly distinct. Never silently substitute packaged nutrition for homemade preparation; require explicit selection and review.

## ARC-SEARCH-03 — Results and working recipe fallback
Present intelligible ranked, source-labelled results and branded alternatives. If an appropriate prepared-food record is unavailable, provide functional ingredient-based recipe creation using the existing canonical food search, ingredient amounts, review, nutrient-source provenance and meal/recipe saving. Do not build a second recipe store or show a dead-end fallback. Nutrition completeness is source-dependent; unknown is not zero.

## Required regression queries
1. `Soup, chicken noodle, home-prepared` — appropriate verified home-prepared/generic result above branded if available; otherwise honest unavailable/fallback.
2. `Homemade chicken noodle soup` — homemade intent, branded alternatives clearly distinct; no invented Home-prepared label.
3. `Chicken noodle soup` — ambiguous: relevant category choices labelled by actual provenance, not forced into branded or homemade.
4. `Campbell's chicken noodle soup` — brand-intent ranking; only verified brand/market/SKU claimed exact.

For all four verify source routing, ranked results, accurate Generic/Home-prepared/Branded source metadata, user selection, nutrient/serving provenance, a working ingredient-based recipe fallback when no appropriate food exists, and successful canonical meal logging. Test missing metadata, generic-only/branded-only, provider outage, correction, retry, no duplicate save, and mobile accessibility.

## Developer acceptance / accountability
Codex inspects current ProductService, shared/product-search, ProductPicker and canonical meal editor. Reuse verified existing paths and add deterministic regression fixtures plus running API/browser meal-log checks. Report committed source SHA, measured result order, nutrition-source identity, CI and Render evidence, unresolved licensed-provider gaps. Biology validates preparation/nutrient claims; Integrations provider categories; Design/User Testing ranking, accessible fallback and logging; Legal/Security retain source rights/privacy gates.

No tests, code implementation, nutritional verification or deployment are claimed by this document.
