# Structured report imports

Manual paste and JSON file upload share the same validated Node import path. Recognized reports can contain scores and/or organisms, including reconstructed Viome-style JSON. This does not assert compatibility with every official export. The original source object, reconstruction warning, reported period, score scales and organism statuses are retained. No personal report is included in test fixtures.

Exact test dates are optional: use a supplied valid date, an embedded exact date, or a clearly labelled import-date fallback. A reported month/period is preserved separately and is not invented as a collection date. JSON/CSV requests are limited to 2 MB. Original filenames are preserved; raw sequence processing remains separate.

Reported pathway scores and organism detection are never converted to abundance percentages, diversity, genes or measured metabolites. Quantitative modelling requires explicit bacteria_percentages. Reconstructed observations retain their unverified provenance; an organism name is not a diagnosis.

Validation: authenticated manual and multipart integration tests cover saved fields, source/date preservation, explicit percentages, invalid dates/JSON and account scoping. Browser checks cover manual paste, file parity, display and 320–1024 px layouts. Python tests cover JSON preservation, extension dispatch and abstention from fabricated abundance.
