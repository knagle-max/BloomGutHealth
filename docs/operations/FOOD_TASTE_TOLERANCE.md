# ID-03 taste and tolerance separation — reader foundation

The approved requirement distinguishes hard allergy exclusions, self-reported intolerance warnings and softer dislikes. Existing dislikes currently filter ingredient names, so their stored meaning must not be silently relaxed.

Readers accept optional softDislikes in ordinary food preferences and optional intolerances in the existing encrypted Precision health context. No legacy absence is backfilled or interpreted as a confirmed negative. Health reports are not added to plaintext preference JSON. Existing allergies, legacy avoids and all planning calculations retain their current behavior in this reader stage.

Unaware versioned or legacy preference saves preserve newer softDislikes unless an explicit list is supplied. Preference updates keep their existing source revision/row-lock rules. Unaware health-context saves retain intolerances under the existing owner lock/encryption; an explicit empty list clears it. Existing owner export/erasure boundaries apply. No new table, provider, grant or clinical inference.

Before the ordinary UI emits new fields, publish and verify these readers. The next slice must label existing hard avoids accurately, add an explicit softer taste field to the one shared preference editor, add reported intolerance to the one encrypted health-context editor, and show honest warnings/reversible preference ordering without weakening allergy/avoid filters or changing nutrient arithmetic. Do not infer intolerance from a genotype, create diagnoses, or represent an ingredient match as certified product/allergen safety.

Five focused schema/persistence/preferences/owner tests, types/build/API101+13/source130 pass locally. Tests cover legacy omission, explicit clear, profile-independent revision behavior, separate owner state and encrypted health data. No ordinary producer/UI or new ranking behavior is enabled by this foundation alone.
