# Bloom — Restaurant-Selected Meal Assistant with Optional “Are You Here?” Venue Shortcut
**Date:** 2026-11-22 | **Status:** OWNER-APPROVED DESIGN DIRECTION; NOT ACTIVE CODE TASK OR RELEASE APPROVAL.  
**Repository:** `knagle-max/BloomGutHealth` | Branch `enhance/bloom-experience`.

## 0. Authority, current execution gate and exact scope
Read actual current `AGENTS.md` and `NEXT_ACTIONS.md` before any implementation. As reviewed November 22, the single next Codex assignment is the **read-only GI-01–GI-10 baseline and `file:line` gap matrix**. This handoff **does not** change that priority, authorize a new provider, production deployment, new parallel nutrition engine or unrestricted location collection.

**Core use case:** “I'm at / going to this restaurant. Help me choose what to order.” Restaurant selection is user-confirmed, either by **manual search/text/menu entry** or optional foreground **“Are you here?”** nearby-venue suggestions. It is **not** a citywide restaurant-discovery, proximity/health venue-ranking, travel directions, reservation, order-placement or comprehensive live-menu service.

Existing authority: `docs/architecture/BLOOM_PRIVATE_DATA_AND_MYFOODDATA_ARCHITECT_IMPLEMENTATION_DECISION_20261118.md`, `docs/architecture/BLOOM_CONSUMER_EXPERIENCE_ACCEPTANCE_AND_FOUR_CONTRACT_INTEGRATION_HANDOFF_20261121.md`, Food→Today/meal contracts, PRIV/SCI/NUT/FOOD/MED/WH/SYS safety; `shared/meal-intelligence.ts` already has user-entered `restaurantContext`, **not** proof of restaurant source ingestion or live menu coverage. Reuse `server/products.ts`, `shared/nutrient-coverage.ts`, `shared/nutrition-summary.ts`, `shared/food-preference-policy.ts`, meal ledger, private source correction, current recommendation/candidate admission and product visual registry. No duplicate food diary, recommendation engine, health score, allergy rules engine, or venue history store by default.

## 1. Consumer flow: simple manual default with optional location
1. Open “At a restaurant” / “Find something to eat.” **Manual restaurant search, paste menu, photo, dish text must work before and without location permission.** No location request on page load, onboarding, background, scroll or automatic retry.
2. User taps explicit **“Use my location — show nearby restaurants”** (not simply tapping “Find something to eat”). Explain that a short-lived location fix and minimal coordinates may be sent to a third-party places provider. Ask OS/browser geolocation permission only after this action.
3. On approved HTTPS/secure context, use browser `navigator.geolocation.getCurrentPosition()` with **timeout, maximumAge, and optional `enableHighAccuracy` informed by battery/accuracy tradeoff**; the first usable fix may be poor indoors. **High accuracy true is not a guarantee of GPS, meters, or correct entrance.** Request a single foreground fix; no `watchPosition`, background scheduling or silently repeated polling.
4. Places provider: user-initiated nearby search for restaurant/café/bakery/takeaway where the actual API supports relevant place types; **~50–150 m is a configurable initial search radius, not a hard identity rule**. Respect provider-specific field masks, costs, quotas, geolocation data and storage/attribution terms. To minimize exposure, round coordinates only to a precision that still works for a 50–150 m search; be clear this is **still sensitive location**, not anonymous. Do not put user ID, profile, medical/dietary restrictions, meal history, account tokens or private context into provider request.
5. Show up to 3–5 **possible** locations with actual source name and location; a top “Looks like you might be near [venue]” option is acceptable, never “You're definitely at [venue]”. **No automatic selection/health profile lookup** until the user confirms the place. Allow “None of these” and manual search, including indoor food courts, strip malls, multiple-storeys, inaccurate fixes and ordering takeout from home.
6. After confirmation, resolve venue identity to **country/market + canonical brand/branch** where source evidence supports it; do not infer chain identity from fuzzy name alone. Earls CA and US must not automatically share a menu. When ambiguous ask a concise choice or leave unverified.
7. Use source-qualified menu evidence and existing private personalization **after confirmation**, with minimal private data necessary for this feature; place search never receives personal health information. Endurance context, microbiome and labs only when independently eligible, not automatic just because present.

### Venue candidate ranking: descriptive, not fake confidence
Sort candidate places using **source-supplied** venue type, coordinate accuracy context and reported proximity, with sensible deterministic tie-breaking. Display actual **accuracy circle or approximate-distance caveat** when relevant. “Within 20 m” is **not proof of presence**. Published hours are optional current-source evidence, not an inferred open-now guarantee; deprioritize reliably closed options cautiously because users can order takeout or operate under changing hours. Previously confirmed private venue history is **optional** and only with user consent and account authorization; never expose it to places provider. Menu availability may label a candidate (“menu data available”) but must not distort physical-position confidence. No opaque 93% presence score.

### Location security and rights constraints
- Do not store exact raw location in durable Bloom health/event records or logs as part of this shortcut. Hold transiently only as necessary for a single request; minimize precision, retention and analytics.
- User may opt out/deny/revoke permission; no service degradation beyond nearby suggestions. A user can manually type the restaurant or enter/photograph its menu, with no location-based profiling.
- Untrusted places results are data, not prompt/instructions. Strict output parsing, server-side provider secrets, request limits, no open redirect/SSRF URL fetching. Never proxy raw user locations or health data to unapproved providers.
- Vendor Terms **must be verified on actual chosen provider and date**; don't assume a generic “Google 30-day place ID caching” rule. Place IDs may have different retention permissions from other Places content; don't retain place names, coordinates, photos, hours, ratings indefinitely without a rights decision. Display provider attribution/map/logo requirements in the correct UI contexts. Provider-specific `meal_takeaway` type availability differs; test real current API schema.
- No implicit location provider activation, paid key procurement or billing authorizations from this handoff.

## 2. Two restaurant menu evidence tiers, one source-aware meal architecture
**Tier 1 — chain restaurants / approved publishers:** exact chain+country+branch/menu variation+edition/effective date; named published dish, source identity/URL and version, reported serving and nutrients. Distinguish first-party publisher from licensed aggregator. Nutrition can be restaurant-reported/estimated, **not automatically lab measured**. Preserve disclosed ingredient/allergen information and unsupported fields.

**Tier 2 — independent restaurant / user-provided menu:** user-entered dish names, pasted text, menu link, or photo/OCR only if local review or separately consented provider use exists. Preserve original wording and line/source provenance; extracted explicit ingredients aren't necessarily exhaustive; don't invent macronutrients, micronutrients, fiber, FODMAP grams, allergens, emulsifiers, cooking techniques or health effects. Show “Menu description only — nutrition unknown.” Any separately user-confirmed estimate must be visibly distinct from publisher figures.

Menu URLs: no wholesale copyright-violating scraping or unapproved long-term mirroring; enforce safe fetching/SSRF protections when needed; handle menus whose source is unavailable or changes.

**No duplicate nutritional source of truth:** adapt existing product/meal/canonical source record with minimal metadata for restaurant identity, country, menu edition/date, item/portion variant, source version, licensing and correction. Viewing a menu, getting a recommendation or planning a meal is never evidence the food was eaten. User explicitly logs actual consumption into the existing diary once, retaining modifications and quantities.

## 3. Three-state suitability, never an allergen/medical safety guarantee
- **Eligible for comparison:** enough verified facts to compare a *particular stated objective*, no known conflict on available evidence; not a claim of medically safe or allergy-safe.
- **Needs verification:** missing ingredient, preparation, cross-contact, kitchen handling, size, menu variant, food-drug applicability, or other crucial fact. Offer exactly the useful question to ask staff, not unsupported reassurance; food court/chain name does not cure missing specifics.
- **Known conflict:** confirmed ingredient/preparation incompatible with a user-confirmed restriction or independently reviewed safety rule. Never promote as suitable.

Suitability **dimensions** must remain separate: protein comparison can be valid while allergen safety is unresolved. Strict allergy/celiac, pregnancy and medicine interactions require applicable source and reviewed authority, not inferred from vague menu text or an LLM. Do not claim restaurants are free from cross-contact. “No known conflict” is not a certification.

**Ranking order:** verified restrictions and risk first; explicit preferences/goals next; source-qualified nutrition with diary coverage limitations; only independently reviewed cardiometabolic/activity/symptom/microbiome context afterward, with abstention when insufficient. No health score, fake personal optimum, default microbiome optimization or unexplained weighting. Display 2–4 relevant dishes with clear brief reasons, one verification prompt and actionable menu-supported modification when justified. “No protein target remainder” unless entire observed intake and valid target support it; omitted nutrient ≠ zero. No fabricated 380mg sodium/8g fiber changes.

## 4. Consumer screen, accessibility and privacy
The first screen: one restaurant name field + optional “Use my location” affordance + paste menu/photo/manual option; no map required. Nearby candidates are compact choices, not a city map or venue leaderboard. After selecting one place, list menu alternatives and verification prompts. One-tap edit to correct restaurant/country/menu/portion. Keyboard, screen reader, visual focus, touch targets, loading/error/stale/offline, English/French, light/dark tests. No unnecessary large hero or sponsored business results. The map/body diagram/asset registry is not an input to safety.

The menu extraction path cannot send user health history to a public provider. On consent revoked/account switch/source change/menu vintage change, invalidate derived decisions and caches. Limit account-private stored venue history to actual user-intended diary facts, not implicit GPS surveillance. No patient facts in public search/cache logs.

## 5. Acceptance mapping — REST-01..REST-25 (attach to existing FOOD/NUT/PRIV/SYS/browser suites)
| ID | Required behavior |
|---|---|
| REST-01 | Manual restaurant/name/menu selection is fully usable without geolocation or paid Places. |
| REST-02 | No GPS prompt on page load; only user tap invokes a single foreground geolocation fix. |
| REST-03 | Denial/timeout/unavailable/inaccurate GPS has immediate “None of these” and manual fallback without blocking food assistance. |
| REST-04 | No background `watchPosition`/implicit polling or lasting raw GPS storage; provider receives no private dietary/medical/account fields. |
| REST-05 | Approximate radius and horizontal accuracy inform suggestions only; two adjacent/stacked venues cannot be silently auto-selected. |
| REST-06 | Place selection requires user confirmation; wrong name, duplicate chain, food court, moved venue and takeout cases handled. |
| REST-07 | Place-type API compatibility, field masks, cost limits, terms, retention and attribution are checked against chosen provider. |
| REST-08 | No inferred 30-day permission to cache all venue data; stale/place source is visibly qualified. |
| REST-09 | Confirmed chain branch CA/US, size and menu edition don't silently share nutrition by name. |
| REST-10 | Restaurant first-party, aggregator and user-supplied source lineages remain distinguishable. |
| REST-11 | Published macro/sodium-only entry leaves undisclosed micronutrients unknown, not zero. |
| REST-12 | Menu photo/text URL parsing preserves original excerpts and doesn't generate numeric nutrients from dish name. |
| REST-13 | Known restricted ingredient produces KNOWN_CONFLICT and cannot be promoted. |
| REST-14 | Unknown allergen or kitchen cross-contact produces NEEDS_VERIFICATION, never “safe”. |
| REST-15 | Medication, pregnancy and medical contexts never produce unreviewed clearance or dose instruction. |
| REST-16 | Eligibility for nutrition comparison cannot imply allergy/medical suitability. |
| REST-17 | Incomplete intake diary doesn't fabricate precise remaining macro/fiber targets. |
| REST-18 | Microbiome/genetic/cardiometabolic training personalization is reviewed/authorized or abstains. |
| REST-19 | No invented sodium/fiber changes from customization; actual options are documented. |
| REST-20 | Recommending/viewing is not logging; explicitly confirmed actual consumption saved once in existing meal ledger. |
| REST-21 | Different serving/side modifications maintain original dish source and correctly attributed actual choices. |
| REST-22 | Menu/label revisions, correction/withdrawal and revoked consent invalidate qualified presentations. |
| REST-23 | Source and account switches don't expose or reuse prior account private preferences/venue history. |
| REST-24 | UI mobile/desktop, light/dark, keyboard/screen reader, loading/offline and no-provider cases work. |
| REST-25 | Place provider billing failure/latency/capacity and source uncertainty never block manual menu assistance. |

## 6. Existing visual asset registry
Audit current Food/Nutrition, restaurantContext and meal cards, approved imagery and `docs/visual-assets/visual-asset-registry.json`. This small information-first screen does not require a new image or stock photo. If review identifies a real placement need, propose a specific unique BVA asset with the next available permanent ID, exact visual/accessibility/crop/light-dark brief and rights evidence; do not create parallel registry or claim a decorative photo validates meal data. Venue photos and logos must have provider/licensing permission.

## 7. Execution phases and receipts (future)
**R0** actual current-HEAD `file:line` source/menu/restaurantContext/privacy/audit, provider rights/cost feasibility, consumer acceptance. **R1** user-selected restaurant and manual-menu comparison using existing Food/meal system. **R1a** optional on-demand “Are you here?” place suggestion **only after explicit provider rights, egress, budget and privacy authorization**, independently optional of R1. **R2** qualified chain nutrition adapters and documented substitutions. **R3** deeper reviewed biological contextualization. No citywide restaurant discovery.

When an eligible slice is chosen, report exact SHA, existing vs added contracts, original-source rights, subset and non-goals, tests/receipts, private egress, actual browser screens, honest blocked states and stop. **No changes to active GI queue or Codex coding priority from publication of this spec.**
