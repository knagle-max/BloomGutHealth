# Bloom — Restaurant Search & Menu Nutrition, Branding & UX Specialist Handoff
**Date:** 2026-10-23 (America/Regina)  
**Owner:** Branding & UX Specialist  
**Status:** Source reviewed and editable assets delivered; conditional design approval for Architect consolidation. No application implementation or live usability testing certified.  
**Repository reference:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`; latest commit not independently inspected for this review.  
**Version:** v0.5 five-entry chooser is current scope; deeper verified restaurant data integration requires Architect phase decision. Do not interrupt current Codex tasks.

## Source handoffs reviewed
1. Integrations: `Bloom_Integration_Restaurant_Menu_Nutrition_Handoff_2026-10-23.md` (INT-REST-2026-01 through 06). Its branch code inspection found no independently verified dedicated menu provider and cautions that generic FNDDS search is not a chain-specific match.
2. User Testing: `Bloom_User_Testing_Restaurant_Menu_Integration_Review_2026-10-23.md` (UT-REST-801 through 806). Conditional acceptance for Architect review; no live source test.
3. Existing Branding: `Bloom_Add_Food_Five_Ways_Design_Handoff_2026-10-23.md` (MKT-FOOD-801–806): reuse the entry chooser, shared editor, nutrient source labels and single save.

## Decision
**Approve with conditions.** A restaurant menu flow requires **additional editable UI assets** beyond the five-way chooser, now supplied. Reuse existing Bloom tokens and the canonical food review/save; avoid a restaurant-specific parallel journal, calculator or independent location-permission requirement. No claim that restaurant catalogue data are available.

## Requirements / acceptance
- **MKT-REST-901 — Restaurant discovery and market identification (P1; P0 for correctness).** Show recent/favourites and search by brand, optionally menu category. Choose brand + country/market before using an exact nutrition record. **Acceptance:** Canadian and US same-name records never silently interchange; searching needs no location permission; 320px screen and screen reader flow works. *Maps INT-REST-01/04, UT-REST-801/802/804.*
- **MKT-REST-902 — Menu item, serving and modifiers (P0 correctness).** One item review displays restaurant, market, documented version, size, preparation, toppings, side/drink and served versus eaten quantity. **Acceptance:** unknown modifier/nutrient remains unknown; a combo with extra sauce and swapped drink cannot claim a complete confirmed total; corrections feed existing deterministic arithmetic. *Maps INT-REST-03, UT-REST-803.*
- **MKT-REST-903 — Explicit source and freshness semantics (P0).** Distinguish official documented, research/historical, generic estimate, user-entered and unavailable with text + icon. Provide source, as-of date, market and limitations. **Acceptance:** never use a verified badge for generic data; source change doesn't silently rewrite historical saved meal; menus are not claimed currently stocked. *Maps INT-REST-02/03/06, UT-REST-802/805.*
- **MKT-REST-904 — Unavailable, expired and outage recovery (P0).** Preserve the search text/selected item draft and offer Describe What I Ate, Search Generic Foods or enter menu/label values, with truthful availability. **Acceptance:** blocked provider, unlicensed source, offline, unknown menu item and no-result all have successful fallback without duplicate save or hidden generic substitution. *Maps INT-REST-05/06, UT-REST-805.*
- **MKT-REST-905 — Shared Add Food convergence (P0).** Every fresh Add Food begins with five methods. Restaurant flow enters same review and idempotent journal save. **Acceptance:** user backs from restaurant to barcode or description; one food journal record saved; next Add Food shows five choices again. *Maps MKT-FOOD-801/803, UT-REST-801.*
- **MKT-REST-906 — Responsive and accessibility testing (P1; P0 for misleading claims).** 320px, 200% zoom, keyboard, screen readers, light/dark, Everyday/Athlete, uncertainty semantics, high contrast. **Acceptance:** User Testing measures correct source classification, time to complete a repeat order, selection errors and fallback task completion; zero critical false official/missing-as-zero/allergen-safe claims in safety fixtures. *Maps UT-REST-804/806.*

## Copy examples
- “Restaurant nutrition verified for Canada, based on a documented serving. Check size and modifications.” **Only display if rights-cleared actual matching record exists.**
- “We found a similar generic food, not nutrition verified for this restaurant.”
- “Nutrition for this sauce isn't available. Your displayed total may be incomplete.”
- “That menu record is from a different country. We can't confirm it matches your order.”
- “Restaurant menu search isn't available right now. You can still describe your meal or enter label values.”
- “Menu data last checked [actual date]; this doesn't confirm current availability.”
- “Review what you ate, including any shared or uneaten portion, before saving.”

## Synthetic scenarios and expected behavior
1. McDonald's Canadian lunch with only US data: warning, no official Canada badge, user chooses safe estimate/manual route.
2. Burger combo with side/drink swaps and extra sauce: only sourced components tallied; others clearly missing.
3. Tim Hortons menu item with region and size ambiguity: request clarification before verified selection.
4. Independent local restaurant without published nutrition: honest manual ingredient entry, no invented official source.
5. Repeat favourite: shortcut after choosing Search Restaurants, but full five-method screen on next Add Food.
6. Provider disabled or 429: preserve draft and navigate to description/manual lookup.
7. User ate half of shared item: served and eaten quantities distinct.
8. Updated official PDF: show updated source for future entries; historical source pinned.
9. Screen reader at 320px: market, source, missing modifier and fallback are announced meaningfully.
10. Allergen question: no allergen-free assurance without qualified authoritative source and approved scope.

## Dependencies, feasibility and cost
**Integrations**: source/provider manifest, licence/rights, market, version, freshness, live versus curated availability. **Biology**: nutrient completeness, modifiers and allergen caveats. **Security/Legal**: provider restrictions, non-authorized caching, privacy. **User Testing**: end-to-end completion and comprehension. **Architect**: resolve current v0.5/v0.6 phase and deduplicate MKT/INT/UT requirements. **Codex**: owns implementation, tests, GitHub and deploy. Design assets are local/editable, no paid design licence. Engineering depends on approved restaurant provider, versioned domain data and existing meal editor; no cost estimate certified.

## Assets
Four standalone SVG wireframes (3 mobile, 1 desktop), four icon SVGs and `restaurant-tokens.json`. These are original source assets, not functioning components or actual menu results. No brand logo recreation. Inherit existing Bloom mode tokens.

## Verification and sign-off
Source reviewed: named specialist handoffs, not app runtime. Asset files generated and packaged; no actual provider test, participant study, copyright licence approval, or current app behavior certified. **Branding/UX CONDITIONAL APPROVAL for Architect consolidation.**
