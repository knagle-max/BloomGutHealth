# Reference control: exact model provenance and rights disposition

2026-11-19. This is source qualification for the optional development reference
control, not biological/predictive validation, legal approval or a production
capability release. No model bytes are added to the repository or source handoff.

## Exact bundled file inspected

MICOM 0.37.1 includes `micom/data/e_coli_core.xml.gz`. Its compressed SHA256 is
`36300ad00320f1ffde76f2ffca06be6403759d92ac320535d961a0ab2d0c94f1`.
The runtime refuses a mismatch before model parsing/optimization.

The actual SBML notes/annotations declare:

- BiGG identifier `e_coli_core` and a November 21, 2016 source snapshot.
- *Escherichia coli* str. K-12 substr. MG1655, taxonomy 511145.
- Source publication DOI 10.1128/ecosalplus.10.2.1.
- Copyright 2016 The Regents of the University of California.
- Conditional redistribution/use notices and a referral to the specific model's
  BiGG terms for commercial use. Retain source notices and disclaimers if any
  separately approved redistribution occurs; software licensing is separate.

The official [model page](https://bigg.ucsd.edu/models/e_coli_core) independently
lists the same organism/publication and 72 metabolites, 95 reactions, 137 genes. Its
download metadata is newer than the bundled snapshot; we did not replace the
bundled model or assert their file bytes are identical. Its current genome link
is not silently treated as a verified genome accession in the older SBML file.

These are source-declared identities. They do not map a user's species report to
this strain, verify gut applicability, show measured gene activity or establish
that a two-copy reference control represents two distinct microbial species.

## Rights finding and scope

The official [BiGG terms](https://biggdata.ucsd.edu/license), read directly, state
educational/research/non-profit conditions and direct commercial users to obtain
separate clarification. This is not a blanket commercial model-data licence.
The newer web terms and older embedded notice must both remain visible in a
rights review; do not silently choose the more permissive wording.

MICOM's Apache software licence and COBRApy's software terms do not supersede the
model-data terms. The public article's licence is also distinct from model rights.
Commercial use/incorporation/redistribution remains **not cleared**. Whether a
particular development activity fits the research conditions needs its actual
purpose/scope reviewed; no automatic legal approval is issued here. No requests
for permission or messages to third parties have been sent.

Current code remains a fixed, nonpersonal development control, default disabled,
refused in an actual production process, with no model distribution, personal
input, clinical output or production provider installation. Do not promote its
models or capability into a commercial/production path without the separately
required rights, science and deployment review. Scope metadata is not a licence.

The existing prediction-task registry and source-rights catalogue record this
disposition. Uncertainty about model rights must remain explicit, not inferred
from download availability or successful execution. Existing Linux engineering
results remain technical evidence only; Apple Silicon, empirical prediction and
independent scientific acceptance remain unverified.
