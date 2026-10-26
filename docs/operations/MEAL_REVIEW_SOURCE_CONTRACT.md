# Meal review source comparison — backend stage

POST /api/meals/analyze remains non-persisting and returns the existing analysis JSON. It adds X-Bloom-Meal-Review, an account-bound digest of canonical ingredients, source identities/versions, nutrient values/units/coverage, food relationship sources and aggregate nutrition facts. Retrieval clocks and aggregate display titles are excluded; missing and zero remain distinct. No parallel calculator, review store, signing credential or trusted client nutrition payload is introduced.

A new reviewed save includes reviewed:true in the request and quoted If-Match. Older strict servers reject the new marker rather than silently ignore the header. The current server requires the header for that marker, recomputes analysis through current adapters/gates, and rejects changed reviewed facts409 before insertion. Legacy bodies remain supported. Preview and save now share the existing owner-scoped remembered-correction resolution so their ingredients cannot silently disagree.

Completed-save receipt lookup precedes analysis and allowance checks. Its fingerprint includes the reviewed source, preserving one-row replay after source changes or a consumed analysis allowance. A different review cannot reuse the same completed receipt. Existing rows remain historical; a new source comparison never rewrites them.

This digest is source consistency, not authentication, clinical verification or allergen certification. Session/owner, input, licensing/provider and execution guards still apply. Final new writes re-resolve sources; there is no signed snapshot that can bypass changed adapter permissions. No schema changes.

Local focused verification covers owner/amount/zero/missing/identity, retrieval-clock parity, initial-versus-structured analysis, actual API/PostgreSQL changed-label rejection without writes, stable completed receipt replay and remembered correction/original-text parity. 355 full tests/types/build/API92+13/source126 and canonical legacy/correction browsers pass. Exact production CI/deployment follows. The new pre-save web workflow is the next stage, not delivered by this backend contract alone.
