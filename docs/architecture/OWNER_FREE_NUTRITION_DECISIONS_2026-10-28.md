# Bloom — Product Owner Decisions and Free Nutrition Data Integration
**Date:** 2026-10-28 | **Authority:** Product Owner, integrated by Chief Architect | **Status:** APPROVED DIRECTION; PROVIDERS NOT APPROVED FOR COMMERCIAL ACTIVATION
**Sources:** Owner's October 28 handoff; Integrations `Bloom_Integration_Free_Restaurant_OFF_Resolution_2026-10-28.md` and `Bloom_Integration_Restaurant_Free_APIs_Rights_Review_2026-10-28.md`. Reconciles existing BLOOM-FOOD-01–03, FOOD-508, REST-ARCH-01–05, ARC-SEARCH-01–06, INT-REST-OFF-2026-01–06, INT-REST-RIGHTS-2026-01–06 and OFF gates; **no duplicate feature backlog or separate nutrition system**.

## Binding owner decisions
1. **Browser/PWA v0.5 first.** Apple Health, Health Connect and wearables remain authorized planned native/hybrid future milestones; no fake connected state.
2. **Use approved visual direction as core workflows are touched.** Transfer exact editable Flagship, Food Review and Bloodwork assets/contracts into development repository, verify hashes/sources, implement within existing components and obtain Branding fidelity review. Do not displace core functionality for a whole-app rewrite.
3. **Viome: authentic offline files first** with versioned adapters and representative JSON; no undocumented authenticated endpoints or credentials.
4. **Tester1: appears working per owner**, verify residual conditions, do not recreate unnecessarily.
5. **KitKat food search: reported working per owner**, preserve it; run a quick regression and focus elsewhere. Test Canadian variants independently, not as a pretext to reimplement Branded search.
6. **No paid subscriptions authorized.** Clinical/privacy/security/licence gates remain active.

## Canada-aware free-first source decisions
| Source | Status | Boundaries/next step |
| --- | --- | --- |
| USDA FoodData Central | RETAIN existing | Generic/FNDDS and Branded where available; actual market and formulation, accurate known/unknown and source snapshots |
| Health Canada CNF 2026 | EVALUATE after existing-version audit | Dataset roughly 5,993 generic foods/up to 173 nutrients as reported in owner handoff; verify licence, exact version, mapping and provenance. **Not packaged SKU or verified restaurant menu.** |
| Open Food Facts | CONTROLLED ENGINEERING EVALUATION ALLOWED; production **BLOCKED** | Existing `BLOOM_OPEN_FOOD_FACTS_APPROVED` remains false unless Legal and Integration explicitly clear commercial source, ODbL combination/derived storage/cache/share-alike, attribution, DB rights and images separately. Read-only synthetic/live nonproduction probes in approved environments; no images until rights cleared. Identifying User-Agent, bounded rate/search, debounce, errors and manual fallback. No physical separation presumed to solve ODbL. |
| HealthyFastFood | EVALUATION CANDIDATE; production **BLOCKED** | Claimed free commercial developer API conflicts with general noncommercial website terms. Obtain **written controlling commercial rights** for API display, Canada, attribution, caching, redistribution, derivatives and durable meal history. Check real official Canadian menus and source/date/version, not claimed 156/22,965 global counts. |
| FatSecret Platform | EVALUATION CANDIDATE; production **BLOCKED** | Integrations rights review reports Basic **US-only**, health/diet advice restriction in ToS §1.7(iii), and roughly 24-hour storable-data conditions. Despite advertised free commercial access, obtain written eligibility/waiver for Bloom's intended use, **Canada coverage**, persistent journal nutrition and derived handling. Do not assume standard free tier qualifies. |
| Menu-FLIP (University of Toronto) | DEFER pending rights | Research dataset not demonstrated as free commercial developer API; no commercial use without explicit permission. |
| Nutritionix | DEFER paid | No confirmed ongoing free commercial tier; no spend without owner authorization. |
| Manual/private user-entered restaurant food | RETAIN ESSENTIAL | Correct item, market, serving, date, user-source note and unknowns; don't re-publish private labels as a global licensed database. |

## Pilot acceptance (P0 approval gates, P1 research effort)
Conduct a **small, bounded** provider comparison for HealthyFastFood and FatSecret only when lawful read-only testing access is confirmed; coordinate rights evaluation with Legal without expanding core engineering. Canadian chains: McDonald's Canada, Tim Hortons, A&W Canada, Wendy's Canada, Subway Canada and Starbucks Canada. For each provider capture exact Canadian item and variant, country/market, serving and nutrients, official source URL and verified date where present, source rights/attribution and caching limits, missing/mismatched items, and full **search → explicit review → canonical save → accurate daily totals** in approved fixtures. Do not silently substitute US formulations or treat missing allergen as safe. If both inadequate, use private manual recipe/restaurant entry; **provider evaluation is not a blocker to functional manual logging**.

## Open Food Facts bounded verification
- Audit existing adapter, feature flag, source identity/GTIN and source-specific licence metadata before implementation.
- Use an identifying `User-Agent`, source-specific budget, rate-limit compliant debounced queries and clear provider unavailable/no-match paths.
- Test Canadian GTIN, region/formulation and nutrient/serving correctness. Preserve source attribution and distinguish user-provided, generic, branded and OFF records.
- Obtain Legal decision on ODbL and combined search indexes, transformed/cached/derived databases, proprietary data boundaries, long-term journal snapshots and redistribution; **mere separate storage is not assumed legally sufficient**.
- Keep OFF product images disabled pending separate image rights.
- Technical evaluation can proceed using existing approved environments; **do not set `BLOOM_OPEN_FOOD_FACTS_APPROVED=true` for commercial deployment without recorded Legal + Integrations approval**. No secret/paid key required for standard public read API.

## Existing backlog crosswalk and phase order
**P0 v0.5 core (implement now where actually missing):** reliable food search/review/save + truthful Canadian identity, correct macros and journal totals, usable manual fallback; preserve currently working KitKat search, Tester1 account. Complete Today/Progress/Bloodwork/Gut/Genetics/Athlete user journeys per `CORE_FUNCTIONALITY_EXECUTION_DIRECTIVE_2026-10-26.md`.
**P0 conditional gates (research/decide without displacing delivery):** rights/commercial-use review; OFF data-boundary design; official item identity, market, serving and history rights before any external data activation. These gates block *activation of that provider*, not independent core product development.
**P1 limited evaluations:** CNF version/delta test; OFF read-only pilot; FatSecret vs HealthyFastFood representative Canadian comparison and rights enquiry. Implement provider adapter only if qualified and necessary for useful workflow; reuse current ProductService/search and canonical journal, not a new platform.
**P2 defer:** Menu-FLIP rights-unknown, paid Nutritionix, comprehensive change-monitoring infrastructure, exhaustive rare edge-case hardening and broad vendor discovery.

**Provider decision record before activation:** approved/rejected/deferred, provider+API/version+market, licence and commercial intended-use right, storage/cache/history and data derivatives, source attribution, cost, measured Canada coverage/quality, operational failures and kill switch, named Legal/Integrations signoff and effective/review date. No approval inferred from marketing copy.

## Developer actions and status
Codex checks latest PR head and active queue, verifies existing code and avoids rework, implements only missing approved normal user journeys, and records implementation SHA, automated tests, browser/Render, real-user acceptance and provider activation separately. Branding assets transfer is high-value when implementing a touched screen; no global visual refactor before functional completion. Specialists retain independent signoff. This handoff commits requirements/decisions only, **not** code, commercial activation, provider agreements or source quality validation.
