# Bloom — Add Food: Five Routes, One Review (Branding & UX handoff)
Date: 2026-10-23, America/Regina. Owner: Branding & UX. Status: proposed design/asset delivery for Chief Architect, **not** deployed feature or test certification.

## Governing decision
There is **one Add Food entry point** presenting five independent choices every time: Scan barcode; Search foods; Search restaurants; Take a photo; Describe what I ate. Selecting one opens ONLY that method. Every method converges on one canonical **Review food → Confirm portion and source → Save to journal** flow. The last-used method may not override or hide this choice. Explicit user favourites can be shortcuts elsewhere, not a replacement for this entry point.

## Requirements
- **MKT-FOOD-801 P0 — Single accessible entry screen.** Five exactly identified methods in fixed, scannable order. All are visible on every fresh Add Food invocation. Tapping a route opens only that route and does not pre-start the camera or AI processor. Back returns to chooser with context preserved. Accessible names, descriptions and target sizes; screen reader, keyboard, 320px, 200% zoom, dark/light.
- **MKT-FOOD-802 P0 — Truthful availability.** Unavailable, unapproved or temporarily offline methods remain clearly labeled and offer immediate working alternatives. Restaurant nutrition not marked available without a licensed reliable source. AI photo recognition not depicted as functioning before v0.6 safety/licensing gates. A photo-of-label/manual transcription route may exist without automated meal interpretation, but must be accurately named.
- **MKT-FOOD-803 P0 — Shared confirmation path.** Every route creates/updates same editable draft and uses the existing canonical food/recipe, source attribution, serving, original label and nutrient arithmetic. Not-found products must support barcode/photo-label/manual fallback; unknown nutrients never become zero. Prevent duplicate entries when switching methods.
- **MKT-FOOD-804 P0 — State handling and consent.** Permission denied, barcode unreadable, ambiguous product, empty results, incompatible serving units, source outage, offline, upload rejected, AI uncertainty and draft restoration receive explicit language/actions. Camera permission != consent to third-party AI transfer. No image processed by external AI without separate permission/approved provider.
- **MKT-FOOD-805 P1 — Usability and instrumentation.** Compare actual completion time/correction burden/error across five routes and source-unavailable states; test repeat visits always default to full choice. Track per route only within privacy policy. Avoid forcing previous method after next food.
- **MKT-FOOD-806 P0 — Brand reuse.** Bloom Everyday green default, Athlete blue by mode; common typography/card/radius/evidence labels. Coach permissions never grant access to food photos or health information automatically. Icons all editable SVG and React reference supplied. No claim assets have been integrated.

## Flow
Add Food → [user chooses 1 of five] → method-specific capture/search → canonical draft food records → shared item review + portion/source confirmation → Save → journal success. Back to Add Food from capture restores chooser, not the previous route. Adding a new meal always begins at the same five-choice view.

## Copy
- Intro: “How would you like to add your food?”
- Barcode: “Scan a packaged product.”
- Food search: “Find generic or branded grocery foods.”
- Restaurants: “Find menu items from restaurants like McDonald's.” If unverified: “Restaurant menu search isn't available yet. Search foods or describe your meal instead.”
- Photo: “Photograph your meal or food label.” If recognition unavailable: “Meal photo recognition isn't available yet. You can enter details from a food label.”
- Describe: “Type a meal in your own words.”
- No exact match: “No exact product found. Check the package label, save a manual entry, or choose a clearly labelled generic estimate.”
- Missing field: “Nutrition information isn't available for this nutrient; it does not mean zero.”
- Review: “Check the foods and amounts before saving.”

## Dependencies / conflicts
Source directive: Chief Architect latest v0.5 five-route entry decision (supplied in conversation); no source SHA attested. Crosswalk UT-FOOD-501–505, ML-PHOTO-01–08, INT-PHOTO-2026-01/02, UT-PHOTO-601–606, MKT-PHOTO-701–706, existing v0.5 meal journal and exact nutrition evaluator. Security/Legal gate camera, images and third-party processing. Integrations/Legal gate restaurant and packaged product sources. Biology gates nutrient interpretation. User Testing validates comprehension and route efficiency. Chief Architect consolidates; Codex alone implements code, tests and GitHub.

## Asset manifest
Five standalone method icon SVGs; four light/dark mobile/desktop editable SVG wireframes; React/TypeScript **presentational reference** AddFoodEntry.tsx; CSS token reference. CSS assumes approved Bloom token mappings; Codex should replace literal fallback tokens with app design system values. `availability` must be produced from verified runtime capabilities and permissions, not assumed by this package.

## Implementation acceptance examples
1) Describe breakfast → Save → Add Food displays all five again → scan a snack → Save → restaurant search at lunch (if supported); 2) unavailable restaurant method clearly explained with working alternate; 3) photo AI absent but label/manual available and accurately distinguished; 4) barcode permission denied, retains draft; 5) multiple corrections never create duplicate journal saves; 6) all five methods keyboard and VoiceOver; 7) same underlying source quantities yield same nutritional values irrespective of entry method.

## Verification
Design assets created and inspected for XML/source completeness. No real browser/app integration testing. No restaurant catalogue, AI photo model, or barcode source availability certified. **Design approved for Architect consolidation, conditional on source/licensing and safety review.**
