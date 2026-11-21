# MICOM predictive validation: candidate assessment, not acceptance

2026-11-19. Reuses `MICROBE-COMMUNITY-V1` in the existing prediction-task registry
and `DATA-CLARK-2021-GUT-CULTURES` in the existing source-rights catalogue.
No dataset rows, participant records, model bytes or simulation outputs were
acquired or added to Git. Only public publication/repository metadata and the
deposition README document were read for provenance/rights review. No model has passed predictive or clinical validation.

## First nonpersonal experimental candidate

Clark et al., *Design of synthetic human gut microbiome assembly and butyrate
production*, Nature Communications (2021), DOI 10.1038/s41467-021-22938-y,
PMCID PMC8166853. The primary article identifies experimentally assembled gut
cultures; “synthetic community” does not mean simulated training labels.

Primary citation: https://pmc.ncbi.nlm.nih.gov/articles/PMC8166853/ . Article
CC BY 4.0 wording was observed; publisher access later hit an SSO redirect and a
subsequent PMC section fetch hit a challenge. No repeated bypass/retry attempted.

The public repository identified by the article/search and a follow-on methods
paper is `RyanLincolnClark/DesignSyntheticGutMicrobiomeAssemblyFunction`.
GitHub repository metadata/root listing were inspected: public, main branch,
API licence null, no top-level LICENSE, PDF/DOCX deposition README available. The DOCX was fetched privately for
review (SHA256 9037599c23fcb9c32ad403d0bfc1fffbc44811fd9e9b8da30335a5ed3bfa6099);
All 19 searchable paragraphs were reviewed and no licence grant was found.
The document emphasizes simulation/training scripts and expected outputs, so
the exact coverage/location of original measured records still needs verification. Embedded image content
was not reviewed, so this is not a complete document/rights clearance. This does **not** establish that no permission exists; it means
file-level data/code rights remain unresolved. Article licensing alone does not
clear the repository data, third-party models or commercial training rights.

## Follow-on methods source and independence

Quinn-Bohmann et al. (2024), DOI 10.1038/s41564-024-01728-4,
https://pmc.ncbi.nlm.nih.gov/articles/PMC11841136/ , describes using Clark culture
data with measured relative composition, end-point butyrate and optical density.
It estimates production rates using culture time, an initial-value assumption and
biomass normalization. Its reuse of Clark is the **same experimental family**,
not independent experimental replication. No published correlation is Bloom's
performance result. This paper also describes restricted human-cohort access;
those participant data and supplements were not acquired.

## Qualification before acquiring or benchmarking

1. Review deposition README, exact files, provenance and licence scope. Record
   immutable source/version/checksums and permitted inference/training/reuse
   separately. Do not mix supplied simulation files with wet-lab measurements.
2. Resolve exact strains and reconstruction identifiers; audit missing organisms,
   compartments, objective/maintenance, media/substrates, oxygen, exchange signs
   and measured abundance definitions. No species-to-strain or food-to-substrate
   mapping is inferred to fill gaps. Abundance is not activity.
3. Define the observable before testing. End-point concentration is not a
   steady-state flux or human biomarker. Require source-qualified duration,
   initial concentration, volume/biomass/OD conversion and units; preserve unknown
   factors. An OD-normalized production-rate proxy needs that exact label and
   uncertainty; it is not an independently measured instantaneous flux.
4. Predefine out-of-distribution abstention and unsupported conditions. Keep
   all replicates and shared culture/strain combinations together. Separate
   tuning from held-out communities and seek independent study/condition data;
   two publications reusing the same observations do not create two holdouts.
5. Compare explicit baselines and model predictions with appropriate error,
   direction, calibration/coverage and uncertainty. Investigate failed and null
   cases, missing strains, medium mismatch, numerical failures and alternative
   optima. Record solver/model/library versions and implementation digests.
6. Obtain independent scientific review before any validated capability claim.
   Human clinical/personal inference and production deployment are separate,
   currently unapproved gates. Do not convert simulated metabolites into health
   recommendations or concentration estimates.

Current disposition: **candidate source identified; file-level rights, mappings,
acquisition, held-out benchmark and independent review pending**. The two-copy
E. coli reference control is technical engineering evidence only and cannot
validate this experimental gut-community task.
