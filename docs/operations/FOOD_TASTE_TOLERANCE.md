# ID-03 taste and tolerance separation — reader foundation

The approved requirement distinguishes hard allergy exclusions, self-reported intolerance warnings and softer dislikes. Existing dislikes currently filter ingredient names, so their stored meaning must not be silently relaxed.

Readers accept optional softDislikes in ordinary food preferences and optional intolerances in the existing encrypted Precision health context. No legacy absence is backfilled or interpreted as a confirmed negative. Health reports are not added to plaintext preference JSON. Existing allergies, legacy avoids and all planning calculations retain their current behavior in this reader stage.

Unaware versioned or legacy preference saves preserve newer softDislikes unless an explicit list is supplied. Preference updates keep their existing source revision/row-lock rules. Unaware health-context saves retain intolerances under the existing owner lock/encryption; an explicit empty list clears it. Existing owner export/erasure boundaries apply. No new table, provider, grant or clinical inference.

Before the ordinary UI emits new fields, publish and verify these readers. The next slice must label existing hard avoids accurately, add an explicit softer taste field to the one shared preference editor, add reported intolerance to the one encrypted health-context editor, and show honest warnings/reversible preference ordering without weakening allergy/avoid filters or changing nutrient arithmetic. Do not infer intolerance from a genotype, create diagnoses, or represent an ingredient match as certified product/allergen safety.

Five focused schema/persistence/preferences/owner tests, types/build/API101+13/source130 pass locally. Tests cover legacy omission, explicit clear, profile-independent revision behavior, separate owner state and encrypted health data. No ordinary producer/UI or new ranking behavior is enabled by this foundation alone.

The follow-on core audit also found missing allergy-context checks in the plain recipe library/prioritization and incomplete category checks in Precision. Those are repaired and verified separately in RECIPE_ALLERGY_SAFETY.md (full401 tests and actual rendered source/refetch flow). Taste ordering and reported-intolerance controls remain the next ID03 slice; do not mistake the allergy repair for their completion.

## Ordinary controls and policy

The canonical food preference editor now labels legacy `dislikes` as **Foods to avoid**, retaining hard filtering, and separately saves **Foods you’d prefer less often** (`softDislikes`). Taste never changes eligibility or nutrient arithmetic: the library orders matching foods later, Precision uses taste as a secondary ordering criterion after supported priority, and practical/weekly choices apply a small preference penalty after hard constraint checks. Explicit empty lists clear these choices. No legacy hard avoid is automatically converted.

The existing My Biology context editor accepts **Reported food intolerances**, encrypted with other health context. Matching ingredients add a clearly identified self-report warning to recipe library/prioritization, Precision reasons, practical/weekly choices and meal review. They never establish diagnosis, automatic exclusion or assured tolerance. Health reports are attached locally after optional recipe ranking/meal parsing and are not added to external provider input or plaintext preferences. Existing allergy and hard-avoid checks still take precedence. Name matching is heuristic, including dairy/lactose/yogurt aliases, not exact-product or cross-contact certification.

The normal UI journey exposed a structural-sharing detail: an unchanged successful prioritization must retain its status against the cache object actually returned by React Query. The accepted response still requires the same owner, mounted view and current source basis; late restriction responses remain rejected.
