# Selected SNP entry

Precision → Genetics now supports an individual-entry checklist and a paste-table flow alongside the existing 23andMe file parser. No full report is required for manual entry. The interface provides the seven reviewed marker shortcuts, additional unreviewed entry shortcuts, and an arbitrary rsID row form. Shortcut inclusion is not a ranking of clinical importance or a recommendation to test.

Paste `Gene SNP Your genotype` rows separated by spaces, tabs, commas or semicolons. Gene labels can contain spaces/slashes and are optional. Two DNA letters (including separated `A/G` or `A|G`) normalize to a sorted uppercase call; `--` means no call. Empty results remain blank and are omitted. Duplicate rsIDs, malformed lines, invalid calls, excessive counts and future dates are rejected. Indels, copy-number variants, single-allele results and arbitrary report/PDF parsing are not supported.

A source description, sample/source date, preview and explicit saving consent are required. Forward (+) orientation is a separate source confirmation; an unknown strand is allowed for recording but excludes all manual calls from reviewed interpretation. Bloom never silently complements an allele or guesses a build.

Only matching rsIDs and compatible forward-strand alleles from the existing reviewed catalogue produce self-reported findings. Manual inputs do not claim verified coordinates or an assayed genome build. Unreviewed variants and reviewed markers with mismatched alleles are retained with an explicit reason, rather than fabricating an interpretation or rejecting the entire table. `rs174550` is not substituted for the reviewed `rs174547`; a `GT` entry at the reviewed C/T `rs7903146` is held without interpretation. Gene labels do not establish identity; reviewed labels come from the rsID catalogue.

APOE entries remain recorded without APOE-type or disease-risk inference. No single-marker APOE interpretation, polygenic score, diagnosis, genetic nutrient limit or supplement dose is added.

Manual payloads use the existing authenticated `/api/precision/records` endpoint and encrypted `genetics` record kind. Server schemas repeat validation. No new table or migration is needed. Account isolation, deletion and derived-plan handling remain in the existing storage workflow.

The form starts with the active saved calls. Pasting updates matching rows and preserves other filled rows; clearing a result omits it from the new dataset. Saving creates a **new active snapshot** rather than mutating historical records. Earlier snapshots remain stored and may become active again if the newest is deleted, as with existing raw imports. The interface states this; deleting all precision data removes all snapshots. Subsequent raw-file imports still create their own active snapshot.

Manual source provenance and all selected entries are returned in the authenticated no-store precision report. Unknown/unreviewed entries do not contribute to food ranking, evidence links or metabolite predictions. The existing plan guard binds plans to the active genetics record, so a new manual snapshot changes the planning source. Manual genotype data is never sent to the AI recipe generator or the microbial research service.

Tests cover the 24-row format with synthetic genotypes, normalization, header/delimiter support, duplicates, malformed input, unknown orientation, incompatible alleles, source/consent/date requirements, raw-import compatibility, account isolation and the live route handler. Browser verification covers manual and paste preview/save/reload, unknown-strand abstention, and mobile layout.

The educational-explanation release adds source-linked context for the 29 shortcut SNPs without expanding the seven-marker diet-ranking catalogue. Raw imports can now retain these 29 SNPs after preview/consent, and the manual editor preserves them. See `GENOTYPE_EXPLANATIONS.md`.
