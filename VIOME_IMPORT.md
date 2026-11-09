# Structured report imports

Manual paste and JSON file upload share the same validated Node import path. Recognized reports can contain scores and/or organisms, including reconstructed Viome-style JSON. This does not assert compatibility with every official export. The original source object, reconstruction warning, reported period, score scales and organism statuses are retained. No personal report is included in test fixtures.

Exact test dates are optional: use a supplied valid date, an embedded exact date, or a clearly labelled import-date fallback. A reported month/period is preserved separately and is not invented as a collection date. JSON/CSV requests are limited to 2 MB. Original filenames are preserved; raw sequence processing remains separate.

Reported pathway scores and organism detection are never converted to abundance percentages, diversity, genes or measured metabolites. Quantitative modelling requires explicit bacteria_percentages. Reconstructed observations retain their unverified provenance; an organism name is not a diagnosis.

Validation: authenticated manual and multipart integration tests cover saved fields, source/date preservation, explicit percentages, invalid dates/JSON and account scoping. Browser checks cover manual paste, file parity, display and 320–1024 px layouts. Python tests cover JSON preservation, extension dispatch and abstention from fabricated abundance.

The report view now uses searchable organism and score cards instead of dense tables. Reviewed descriptions cover the 18 organism names in the reconstructed-report example (including species-level interpretation of strain-suffixed names) and 20 score topics. Each gives a plain-language function, a qualified general health-context label, practical limits and source links. Unknown names explicitly abstain. Pathogen-associated and unexpected bat-virus records preserve their unverified provenance; they do not establish infection. Source values/categories are kept separate from Bloom's general educational text. Numeric score direction and thresholds are not reverse-engineered.

Diet exploration now shows known journal contributions with missing-data coverage and practical food/planner links. The former protein/fiber-to-species likelihood labels are no longer presented as personal microbiome findings. The route remains compatible, with an empty predictedBacteria list and explicit recorded-diet observation metadata.
