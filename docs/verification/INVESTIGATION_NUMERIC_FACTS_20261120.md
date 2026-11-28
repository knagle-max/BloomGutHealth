# INV-05 — bounded structured numeric fact checks

This partial fact verifier checks declared structured claims, not all numbers in
free prose, citation relevance, clinical meaning or scientific truth. It adds no
model, provider, public endpoint, consumer authority or runtime service.

Only `source-value` and `recorded-difference` are supported over current owned
laboratory facts:12 claims maximum, one or two eligible observation IDs each.
The model supplies no calculation input, executable expression or source URL.
Ratios, unit conversions, dietary sums, reference targets and clinical conclusions
are unsupported. Unknown operations, extra arguments and invalid inputs fail closed.

It reuses the existing marker-unit inventory, assay identity, lab comparability
and recorded-difference functions. Differences require forward chronology,
same marker/unit, known matching laboratory and method, and appropriate fasting
context. Existing source-date validation and latest-record context also reject
unordered same-day observations when collection time is absent. Source values are exact. Computed differences allow16 machine epsilons
relative to the nonzero magnitude, with no absolute floor and no zero/nonzero
substitution. This is binary arithmetic handling, not a biological/assay tolerance.

The runner verifies claims against recollected canonical facts. Review admission
repeats grounding, binds numeric facts to current canonical source/revision and
retains every numeric source in returned provenance, including sources outside
the selected hypothesis. Independent exact-digest review and current authority
remain necessary. Nearby unstructured prose is not certified. Legacy candidates
without numeric claims remain compatible with their existing review gates.

Synthetic tests cover wrong and rounded numbers, actual zero, tiny nonzero,
binary subtraction, missing/duplicate/foreign sources, unsupported expressions,
unit/method/laboratory/fasting changes, chronology, vitamin-D metabolite identity,
changed numeric/source revisions and absent authority. Actual encrypted-SQL
source → private synthetic engine → review-admission composition carries a
numeric claim. No actual personal data or individual simulation output is stored
in Git. Scientific/semantic verification, unfamiliar-case usefulness, live-model
qualification and consumer release remain unestablished.
