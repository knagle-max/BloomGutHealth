# BLOOM — Comprehensive Biological Intelligence, Goal-Directed Explorer & Living Scientific Discovery

**Revised consolidated handoff v1.1 — 16-study coverage assessment**  
**Date:** November 17, 2026  
**Status:** Owner original preserved verbatim in Part A; prior Science & Biology revisions preserved in Part B; added scientifically qualified 16-study review, requirements, Codex execution and tests in Part C. Scientific design approval ≠ implementation or release approval.  
**Original owner text SHA-256 (verbatim span):** `5b16ce42176d935b66f088e201ffdf1c264d90d094fc0667d8feeea2fa254512`.

---

# BLOOM — Comprehensive Biological Intelligence, Goal-Directed Explorer & Living Scientific Discovery

**Consolidated owner original + Science & Biology specialist review**  
**Date:** November 17, 2026  
**Status:** Complete owner source preserved verbatim in Part A; Part B contains scientifically qualified recommendations, BIO-EXP-49 and Codex implementation guidance. Not a released/implemented feature.

**Source preservation:** Original owner text appears between `BEGIN VERBATIM OWNER SPECIFICATION` and `END VERBATIM OWNER SPECIFICATION` without editing. SHA-256 of original UTF-8 source: `5b16ce42176d935b66f088e201ffdf1c264d90d094fc0667d8feeea2fa254512`.

---

# PART A — VERBATIM OWNER SPECIFICATION

<!-- BEGIN VERBATIM OWNER SPECIFICATION -->

# Bloom — Comprehensive Biological Intelligence, Goal-Directed Explorer & Living Scientific Discovery

Consolidated Chief Architect implementation handoff — Revised  
Date: November 17, 2026  
Status: Owner-directed specification for reconciliation into existing approved architecture  
Implementation owner: Codex, following Chief Architect reconciliation  
Primary experience: Explore  
Connected experiences: Biology, Microbiome, Food, Today, Progress, Athlete and Profile

---

## 1. Executive Directive

Bloom must evolve from a system that describes associations among foods, nutrients, bacteria, genes and health outcomes into a system capable of representing, investigating and explaining how biological systems work and what can meaningfully influence them.

The objective is not merely to accumulate scientific facts or connect increasingly large numbers of entities.

Bloom must distinguish:

1. What biological capabilities exist.
2. Which components and conditions are necessary for those capabilities.
3. Whether those conditions are present.
4. Whether the relevant activity has actually been measured.
5. What products and downstream consequences may result.
6. What evidence connects those consequences to meaningful health outcomes.
7. Which interventions could plausibly alter the system.
8. Which interventions have demonstrated useful effects in humans.
9. Whether an intervention is suitable for the individual.
10. Whether personal follow-up information supports continued use, reconsideration or abstention.

The Explorer must make this intelligence accessible through an intuitive, visually compelling and scientifically grounded experience.

Core governing principle:

Understanding that a biological mechanism exists is not equivalent to knowing that it is active, beneficial, individually relevant or safely modifiable.

Bloom should seek to explain those distinctions naturally rather than overwhelming users with technical warnings.

---

## 2. Relationship to Existing Architecture

This specification expands existing approved requirements rather than establishing a second scientific platform.

The Architect must reconcile it with:

* V06-LIVE-EXT-01–04 — extensible molecular and biological graph.
* V06-LIVE-UPD-01–06 — automatic discovery and controlled scientific publication.
* V06-12 — unified goal-to-action reasoning.
* V06-13 — personal longitudinal observation and response learning.
* Existing host–microbe reaction modeling.
* Existing evidence and claim governance.
* Existing biological source registries.
* Existing goal and recommendation eligibility infrastructure.
* Existing Explore.tsx.
* Existing shared/biological-model.ts.
* Existing shared/evidence-network.ts.
* Existing shared/science-coach.ts.
* Existing shared/meal-intelligence.ts.
* Existing biological pathway, food and microbiome interpretations.
* Existing personalized estimation and calibration requirements.
* Existing consent, source-revision and account-private context systems.

The current implementation includes pathway definitions, general substrate descriptions, organism associations and evidence-linked relationships.

These are valuable foundations.

However, the existing fixed catalogue must not be mistaken for a complete biochemical reasoning system.

### 2.1 Nonduplication requirements

Do not create:

* A second biological knowledge graph.
* A competing organism catalogue.
* Another research crawler.
* A separate substrate database unrelated to the canonical graph.
* A second personal recommendation engine.
* A new nutrition calculation engine.
* A standalone enzyme-optimization engine.
* A separate research-preferences account system.
* A new top-level application section.

Extend the established architecture through appropriate new entity and relationship types, evidence constraints and bounded implementation slices.

---

## 3. The Complete Biological Reasoning Framework

Bloom’s scientific reasoning should consider the following interconnected layers.

### 3.1 Layer A — Human goals and meaningful outcomes

Start with outcomes that matter to people.

Examples:

* Healthy aging and longevity.
* Cardiovascular health.
* Metabolic health.
* Digestive comfort.
* Physical performance.
* Muscle preservation.
* Bone health.
* Sleep quality.
* Immune function.
* Nutritional adequacy.
* Measured clinical risk markers.
* Improved physical functioning.

Goals must be distinguished from mechanistic research interests.

For example:

Goal: Improve healthspan.

Scientific interest: Bile-acid metabolism.

Hypothesis: Increasing a specific microbial enzyme may influence a metabolic pathway.

These are not interchangeable.

A user following an enzyme does not automatically authorize its biological maximization.

### 3.2 Layer B — Biological systems and pathways

Represent relevant systems such as:

* Carbohydrate fermentation.
* Lipid and bile-acid metabolism.
* Amino-acid metabolism.
* Nitrogen and sulfur metabolism.
* Vitamin synthesis and transformation.
* Polyphenol metabolism.
* Xenobiotic and drug metabolism.
* Immune signaling.
* Inflammatory pathways.
* Hormonal signaling.
* Oxidative stress and redox balance.
* Energy metabolism.
* Mitochondrial processes.
* Muscle protein synthesis and turnover.
* Bone remodeling.
* Host–microbe signaling.

The system should support relationships across pathways rather than treating them as isolated chains.

For example, microbial fermentation may influence several metabolites, microbial growth patterns and host signaling pathways simultaneously.

### 3.3 Layer C — Molecular components

Support appropriately identified:

* Genes and genetic variants.
* Transcripts.
* Proteins.
* Enzymes.
* Transporters.
* Receptors.
* Substrates.
* Precursors.
* Cofactors.
* Coenzymes.
* Electron donors and acceptors.
* Inhibitors.
* Activators.
* Intermediate metabolites.
* End products.
* Regulatory molecules.
* Relevant toxins or potentially unfavorable compounds.

Where supported, include stable external identifiers and synonyms.

Examples of suitable identifier families include NCBI Gene, UniProt, EC, Rhea, ChEBI, HMDB, KEGG and NCBI Taxonomy, subject to source applicability and licensing.

Identifiers should allow reliable linkage, not imply that every database annotation is experimentally confirmed.

---

## 4. Biochemical Reaction Intelligence

### 4.1 Reactions as first-class entities

Bloom must move beyond free-text statements such as:

“Bacterium X produces metabolite Y.”

A supported biological reaction should identify:

* What enters.
* What leaves.
* What catalyzes it.
* Where it occurs.
* Which organisms or tissues may perform it.
* What conditions are required.
* Whether the reaction is reversible.
* How it relates to other reactions.
* What evidence supports the relationship.

### 4.2 Required reaction information

The canonical representation should accommodate:

| Dimension | Required meaning |
|---|---|
| Reaction identity | Stable biochemical reaction identifier |
| Substrates | Molecules consumed or transformed |
| Products | Molecules generated |
| Stoichiometry | Supported molar relationships |
| Catalysts | Enzymes or other catalytic systems |
| Gene association | Genes encoding relevant proteins, where known |
| Cofactors | Required or supporting molecules |
| Direction | Known direction, reversibility or uncertainty |
| Compartment | Location where the reaction occurs |
| Organism | Supported taxon or strain identity |
| Conditions | Relevant environmental and physiological constraints |
| Regulation | Known activation, inhibition or expression effects |
| Evidence | Experiment, model, inference or association |
| Applicability | Organism, tissue, model and population boundaries |

Do not invent missing reaction coefficients, enzyme activities or kinetic parameters.

### 4.3 Multi-step pathways

A pathway may depend on:

1. Initial substrate availability.
2. One organism’s transformation.
3. Release or transport of an intermediate.
4. Consumption by another organism.
5. Further biochemical transformation.
6. Absorption or elimination.
7. Interaction with a host receptor.
8. Downstream physiological responses.

Bloom must represent the chain without assuming that each step is necessarily active whenever the previous step is possible.

---

## 5. Substrate, Precursor and Nutrient Availability

Substrate intelligence applies broadly across host and microbial biology.

### 5.1 Required substrate classifications

**Direct dietary substrates**

Compounds whose relevant biological availability may depend on food intake and processing.

Examples include certain fermentable carbohydrates and dietary polyphenols.

**Dietary precursors**

Compounds that must undergo digestion, absorption or transformation before becoming the relevant reaction input.

**Host-produced substrates**

Compounds synthesized or secreted by the individual.

Examples include bile acids, mucins and some metabolic intermediates.

**Microbially produced substrates**

Products of one microbial process that become inputs to another.

**Environmental substrates**

Compounds or resources influenced by the local microbial environment.

**Endogenous metabolic intermediates**

Compounds generated through normal host cellular metabolism.

**Unknown substrate origin**

Cases where relevant availability or source cannot be established.

### 5.2 Availability is not equivalent to ingestion

For every substrate-dependent interpretation, distinguish:

* Amount consumed.
* Chemical form.
* Food matrix.
* Preparation.
* Digestive release.
* Host absorption.
* Relevant intestinal delivery.
* Transport into the microbial or host cell.
* Competing consumption.
* Relevant concentration.
* Actual reaction availability.

Most user datasets will not establish all these steps.

Bloom must preserve that uncertainty rather than manufacture numerical substrate availability.

### 5.3 Availability dependencies

Where supported, represent factors such as:

* Food processing.
* Cooking and cooling.
* Fermentation.
* Solubility.
* Digestibility.
* Intestinal transit.
* Absorption.
* Host secretion.
* Compartment-specific transport.
* Competition with other organisms.
* Relevant chemical conversion.

These are contextual relationships, not automatically individualized measurements.

---

## 6. Cofactors, Enzyme Regulation and Functional Capacity

Substrate availability alone is insufficient.

Bloom must also distinguish whether the necessary catalytic machinery and enabling conditions exist.

### 6.1 Cofactor intelligence

Support relevant relationships involving:

* Vitamin-derived coenzymes.
* Minerals.
* Electron carriers.
* Redox cofactors.
* Metal ions.
* Other required molecular partners.

Examples may include NAD/NADH, FAD/FADH2, pyridoxal phosphate, iron-containing enzymes and magnesium-dependent processes.

These relationships must be reaction-specific.

A biochemical cofactor requirement must not automatically trigger a supplement recommendation.

Normal cofactor dependence does not establish individual deficiency, benefit from supplementation or a safe dose.

### 6.2 Gene-to-function distinctions

Represent the following separately:

1. Organism identity.
2. Gene annotation.
3. Gene sequence and variant.
4. Functional gene potential.
5. Gene expression.
6. Protein abundance.
7. Enzyme activity.
8. Actual reaction flux.
9. Metabolite concentration.
10. Physiological effect.

Do not promote evidence from one level to another without an appropriate validated bridge.

### 6.3 Enzyme regulation

Where reviewed evidence exists, represent:

* Transcriptional regulation.
* Translational regulation.
* Protein degradation.
* Post-translational modification.
* Feedback inhibition.
* Allosteric activation.
* Substrate inhibition.
* Competitive inhibition.
* Cofactor availability.
* Relevant enzyme kinetics.
* Environmental dependence.

A large number of predicted gene copies does not establish high enzyme activity.

### 6.4 Genetic variation

For host or microbial genetic variants, distinguish:

* Correct genomic or protein identity.
* Variant effect.
* Evidence population.
* Experimental versus predicted effect.
* Functional magnitude when valid.
* Penetrance and context.
* Relevant gene-expression regulation.
* Compensatory biological mechanisms.

A genotype must not automatically become a personal enzyme-activity score.

---

## 7. Spatial Biology, Transport and Compartmentalization

Biological reactions occur in specific locations.

A pathway may be chemically possible while inaccessible in the relevant physiological compartment.

### 7.1 Required spatial concepts

Represent, as scientifically appropriate:

* Gastrointestinal lumen.
* Mucus layer.
* Microbial cell interior.
* Extracellular microbial environment.
* Intestinal epithelial cells.
* Portal circulation.
* Liver.
* Systemic circulation.
* Other relevant tissues.
* Cellular organelles.

Do not imply that an intestinal metabolite is necessarily present at equivalent concentrations in blood or other organs.

### 7.2 Transport processes

Support relationships such as:

* Host intestinal absorption.
* Microbial uptake.
* Metabolite export.
* Host secretion.
* Enterohepatic circulation.
* Cellular transport.
* Renal clearance.
* Hepatic metabolism.

If an important transport step is unknown, the model must not assume full exposure downstream.

### 7.3 Exposure and signaling

Distinguish:

* Metabolite produced in a compartment.
* Metabolite detected in a sample.
* Metabolite reaching a tissue.
* Metabolite binding a receptor.
* Functional receptor activation.
* Measured downstream response.
* Clinically meaningful outcome.

An in vitro receptor interaction is not automatically proof of a human health benefit.

---

## 8. Microbial Ecology and Community Interactions

Individual bacterial functions must be placed in ecological context.

### 8.1 Cross-feeding

Some microorganisms generate metabolites that others consume.

Represent:

* Primary substrate degraders.
* Intermediate producers.
* Intermediate consumers.
* Downstream metabolite producers.
* Dependencies on other organisms.
* Experimentally established versus proposed exchanges.

Do not assume that metabolic compatibility establishes an actual ecological exchange.

### 8.2 Competition

Represent relevant competition for:

* Nutrients.
* Electron donors and acceptors.
* Growth substrates.
* Ecological niches.
* Other limited environmental resources.

Increasing substrate availability may stimulate several competing organisms, not only the intended one.

### 8.3 Functional redundancy

Multiple unrelated organisms may perform similar biochemical functions.

Bloom should not always treat a particular species as the required target if other organisms can support an equivalent process.

### 8.4 Functional specialization

Two strains within the same species may differ substantially in:

* Gene content.
* Substrate preferences.
* Enzyme activity.
* Transport systems.
* Metabolite production.
* Ecological interactions.

Require the appropriate strain or sequence resolution for strain-specific conclusions.

### 8.5 Community dynamics

Where evidence supports it, account conceptually for:

* Population changes.
* Resource competition.
* Ecological stability.
* Colonization resistance.
* Engraftment constraints.
* Community resilience.
* Environmental adaptation.
* Dietary pattern changes.
* Host immune pressures.
* Bacteriophages and other biological interactions when relevant.

Do not infer that eating a particular food guarantees the expansion or persistent colonization of a named bacterium.

### 8.6 Local microbial environment

Relevant constraints may include:

* pH.
* Oxygen availability.
* Redox potential.
* Transit time.
* Water availability.
* Electron acceptors.
* Local substrate concentrations.
* Host secretions.
* Antibiotic or other medication exposure.

These factors should not all become user-entered fields.

Represent them as known, estimated, experimentally conditioned or unknown.

---

## 9. Host Physiology and Personal Biological Context

Bloom must understand that microbial metabolism interacts with host physiology.

### 9.1 Host processes

Where relevant, represent:

* Digestive function.
* Absorption.
* Metabolic clearance.
* Host enzyme activity.
* Liver metabolism.
* Hormonal regulation.
* Immune responses.
* Receptor signaling.
* Renal function.
* Physical activity.
* Energy balance.
* Medication effects.
* Relevant health conditions.

### 9.2 Individual applicability

Potentially relevant factors include:

* Age and life stage.
* Relevant genetics.
* Recorded health conditions.
* Medications.
* Diet.
* Body composition.
* Activity.
* Sleep and recovery.
* Reproductive context.
* Actual laboratory measurements.
* Functional microbiome evidence.
* Metabolomics where supported.

Only applicable, authorized and reliable context should be used.

### 9.3 Host–microbe co-metabolism

Support pathways where:

1. The host generates a compound.
2. Microorganisms transform it.
3. The host absorbs or further transforms a product.
4. The final compound affects host physiology.

Bile-acid metabolism is one example.

Other examples may include tryptophan metabolites, polyphenol-derived metabolites and selected drug transformations.

Avoid assuming all host–microbial relationships are beneficial.

---

## 10. Dose, Timing, Kinetics and Biological Dynamics

Bloom should distinguish the existence of a pathway from its magnitude or behavior over time.

### 10.1 Exposure characteristics

Represent where supported:

* Dose.
* Chemical formulation.
* Frequency.
* Duration.
* Timing.
* Preparation.
* Route.
* Baseline exposure.
* Washout or persistence.
* Known tolerability.

### 10.2 Nonlinear effects

Biological responses may be:

* Saturable.
* Threshold-dependent.
* Biphasic.
* Context-dependent.
* Subject to feedback.
* Time-dependent.

Do not assume that increasing a substrate or biological activity produces a proportional benefit.

### 10.3 Kinetic modeling

Support optional parameters such as:

* Km.
* Vmax.
* Rate constants.
* Reversibility.
* Thermodynamic constraints.
* Transport limitations.
* Relevant measured concentrations.

Include these only when validly sourced and appropriate to the experimental conditions.

The existence of kinetic parameters does not establish that they apply unchanged inside a person’s gut.

### 10.4 Quantitative versus qualitative reasoning

Default to qualified descriptive reasoning when necessary inputs are missing.

Do not generate exact enzyme activities, fluxes, microbial growth forecasts or health-outcome probabilities from organism percentages alone.

Advanced quantitative modeling must remain separate, validated and explicitly labeled.

---
## 11. Competing Pathways, Branching and Potentially Unfavorable Products

A critical requirement is recognizing that biological manipulation can produce multiple outcomes.

### 11.1 Branching pathways

One substrate may enter several reactions.

Those reactions may:

* Compete for the same substrate.
* Generate different intermediates.
* Produce compounds with different physiological effects.
* Depend on different microbes.
* Be active in different compartments.

Represent the branching structure rather than a single preferred arrow.

### 11.2 Potentially unfavorable products

The knowledge model should support context-dependent concerns involving:

* Some secondary bile acids.
* Certain protein-fermentation products.
* Hydrogen sulfide.
* Ammonia.
* Some microbial toxins.
* Certain indole-derived products.
* Drug metabolites.
* Other relevant compounds.

Do not classify a molecule as universally beneficial or harmful without context.

### 11.3 Competing outcomes

An intervention may improve one endpoint while affecting another.

Examples:

* Increased fermentation potential with worsened gastrointestinal tolerance.
* Greater microbial substrate availability without demonstrated human benefit.
* A dietary intervention that improves one lipid measurement but conflicts with another nutritional goal.
* An intervention associated with a desired metabolite and an unwanted product.

Existing protected-goal and tradeoff logic must govern action selection.

---

## 12. Measurement, Assay Resolution and Scientific Observability

Bloom must be explicit internally about what the user’s data can establish.

### 12.1 Observation classes

Support:

* Self-reported information.
* Laboratory measurements.
* Taxonomic observations.
* Functional gene observations.
* Transcript observations.
* Protein measurements.
* Enzyme assays.
* Metabolomic observations.
* Physiological measurements.
* Validated calculated quantities.
* Model-derived estimates.
* Scientific associations.

### 12.2 Assay boundaries

Distinguish:

* 16S-based taxonomy.
* Shotgun metagenomics.
* Metatranscriptomics.
* Metaproteomics.
* Metabolomics.
* Targeted biochemical assays.
* Clinical laboratory assays.

An assay’s actual coverage and resolution determine its permissible interpretations.

For example:

A metagenomic gene prediction indicates potential function but not necessarily expression.

A measured metabolite concentration does not independently identify its producer.

A taxonomic abundance observation is not an enzyme activity measurement.

### 12.3 Temporal comparability

Relevant observations must preserve:

* Collection date.
* Actual event time.
* Assay method.
* Units.
* Relevant normalization.
* Sample type.
* Detection limits.
* Processing differences.
* Source corrections.

Different assays must not be combined into a fabricated continuous trend.

### 12.4 Missing information

Distinguish:

* Not measured.
* Not reported.
* Below detection.
* Measured zero where valid.
* Ambiguous identity.
* Unsupported conversion.
* Incompatible assay.
* Insufficient data.
* Evidence unavailable.

No missing value should automatically become biological absence or a normal result.

---

## 13. Evidence Hierarchy and Causal Reasoning

The Explorer must distinguish multiple forms of knowledge.

### 13.1 Evidence categories

Examples:

* Chemical reaction established in vitro.
* Purified enzyme characterization.
* Organism culture experiment.
* Microbial co-culture experiment.
* Cell or organoid study.
* Animal experiment.
* Human observational study.
* Human intervention study.
* Systematic review or meta-analysis.
* Clinical practice guidance.
* Computational prediction.
* Unvalidated hypothesis.

These categories must not be collapsed into an unsupported numerical certainty score.

### 13.2 Claim-specific evidence

Evidence belongs to a particular claim.

A study may strongly establish that an enzyme performs a reaction while providing weak evidence for effects on human health.

Bloom must separately represent those claims.

### 13.3 Negative and conflicting evidence

Capture:

* Null findings.
* Negative findings.
* Adverse outcomes.
* Contradictory experiments.
* Failed replication.
* Population differences.
* Unresolved methodology.
* Publication withdrawal or retraction.

Do not build a graph containing only positive relationships.

### 13.4 Human outcome relevance

A claim such as “increases a metabolite” is not equivalent to “improves longevity.”

Action eligibility must depend on suitable evidence for the actual intended outcome, not merely the presence of a mechanistic connection.

### 13.5 Computational evidence

Computational predictions must be distinguished from experimental evidence.

Model confidence, embedding similarity or graph connectivity must not create clinical authority.

---

## 14. Intervention Intelligence

This is the bridge between Explorer and useful daily actions.

### 14.1 Intervention categories

Support eligible evidence concerning:

* Whole-food patterns.
* Individual foods.
* Nutrient composition.
* Food preparation.
* Dietary fibre.
* Prebiotics.
* Fermented foods.
* Probiotic strains.
* Physical activity.
* Sleep and recovery.
* Other ordinary lifestyle behaviors.
* Medications and clinical interventions as contextual education, not autonomous prescriptions.

Do not assume every biological mechanism has a controllable intervention.

### 14.2 Separate the causal questions

For any proposed intervention, evaluate independently whether evidence shows it:

1. Changes consumption or exposure.
2. Alters substrate delivery.
3. Changes microbial abundance.
4. Changes gene expression.
5. Changes functional enzyme activity.
6. Changes a metabolite.
7. Alters a host pathway.
8. Improves a meaningful human outcome.
9. Produces adverse effects.
10. Is suitable for the user.

A demonstrated effect at one stage cannot automatically authorize claims at later stages.

### 14.3 Nutritional practicality

Where interventions are eligible, connect to existing Food systems for:

* Actual sourced ingredients.
* Portion selection.
* Preparation.
* Meal planning.
* Dietary exclusions.
* Allergies.
* Nutrient adequacy.
* Energy and protein goals.
* Food preferences.
* Gastrointestinal tolerance.
* Cost and preparation time where available.

The recommendation must be feasible and compatible with the user’s overall priorities.

### 14.4 Supported action categories

An Explorer topic may resolve to:

**Established applicable action:** A relevant reviewed action exists.

**Evidence-supported general wellness option:** A useful action is supported, but its effect on the selected mechanism is not established.

**Research opportunity:** A mechanism warrants education and future follow-up, but no approved intervention exists.

**Insufficient or conflicting evidence:** Bloom should abstain from a targeted intervention.

**Potential safety concern:** The proposed manipulation is ineligible or requires professional review.

The system must not manufacture an intervention to make a pathway feel actionable.

---

## 15. Personalization and Goal Optimization

### 15.1 Goals are the primary optimization targets

Bloom should optimize toward supported outcomes, not automatically toward maximum levels of individual molecules, enzymes or bacteria.

For example:

Goal: Improve healthy aging.

Possible supported everyday priorities may include cardiovascular risk reduction, physical activity, muscle preservation, dietary quality and sleep.

Emerging microbial longevity research may be informative without dominating recommendations.

### 15.2 Goal-to-mechanism mapping

For each supported goal, allow multiple mechanisms and outcomes.

Each connection should include:

* Relevance.
* Evidence.
* Direction.
* Applicability.
* Known tradeoffs.
* Measurable endpoint.
* Whether a personal intervention exists.

### 15.3 Goal-specific priorities

Use existing ranking and eligibility infrastructure.

Prioritize:

1. Safety.
2. Relevant validated human outcomes.
3. Individual observed health context.
4. Feasibility.
5. Protected competing goals.
6. Expected benefit where appropriately supported.
7. User preferences.
8. Scientific uncertainty.
9. Cost and burden.

A scientifically interesting pathway should not outrank a more established useful action solely because it is novel.

### 15.4 Personal observations

When appropriate, use relevant existing:

* Bloodwork.
* Microbiome results.
* Nutrition history.
* Activity.
* Symptoms.
* Medication history.
* Sleep.
* Treatment context.
* Health goals.

Only use data consistent with consent, provenance, method and source freshness.

### 15.5 Longitudinal learning

Bloom may learn what choices are feasible, well tolerated and consistently recorded.

Measured outcomes can inform qualified personal observations.

Do not interpret a before-and-after change as proof of a specific intervention effect without adequate study design and consideration of confounding.

---

## 16. Biological Interest Following and User Intent

Users should be able to follow specific scientific interests independently from their health goals.

### 16.1 Supported interest types

Examples:

* Organism.
* Strain.
* Gene.
* Enzyme.
* Metabolite.
* Pathway.
* Biological process.
* Research topic.
* Health outcome.
* Food or intervention mechanism.

### 16.2 Distinguish intent

Support distinct meanings:

**Learn about:** I want to understand this topic.

**Follow research:** I want relevant future reviewed discoveries.

**See my data:** Show what my available observations establish.

**Find supported actions:** Show eligible interventions related to my goal.

**Track an outcome:** I want to observe a relevant measurement over time.

Do not assume that following an enzyme means the user wants to increase it.

### 16.3 User controls

Users may:

* Follow or unfollow.
* Save a topic.
* Review related studies.
* Navigate to associated organisms or molecules.
* Review their own relevant data.
* Discover eligible actions.
* Request optional scientific updates.

Store preferences using existing account-private infrastructure.

Do not create another profile or notification system.

---

## 17. Living Scientific Evidence Discovery

Retain the already approved V06-LIVE-UPD-01–06 lifecycle.

### 17.1 Automatic discovery

Periodically monitor appropriate sources including:

* PubMed.
* Europe PMC.
* Crossref.
* ClinicalTrials.gov where relevant.

Use bounded, source-compliant, versioned queries.

Expand discovery using reviewed:

* Genes.
* Enzymes.
* Organisms.
* Metabolites.
* Pathways.
* Diseases or health outcomes.
* Study identifiers.
* Synonyms.
* Citation relationships.

Do not transmit private user microbiome, genetic or clinical records as external search terms.

### 17.2 Candidate extraction

New papers may produce candidate relationships such as:

* Newly characterized enzyme–substrate interaction.
* Strain-specific metabolic activity.
* Additional pathway branch.
* New host receptor interaction.
* New microbial cross-feeding relationship.
* New human intervention outcome.
* A previously unrecognized harm.
* Evidence contradicting an existing claim.

All extracted relationships require source anchoring and validation.

### 17.3 Review and publication

Maintain:

Discovered → Extracted → Checked → Reviewed → Approved/Rejected → Published/Withdrawn.

A study may support educational publication without authorizing a new personal recommendation.

### 17.4 Research change impact

When scientific knowledge changes:

* Identify affected claims.
* Identify affected pathways.
* Identify related organisms and metabolites.
* Identify dependent educational content.
* Reassess dependent intervention eligibility.
* Invalidate withdrawn or stale derived information.
* Notify interested users only when warranted and authorized.

A new publication must not silently change a person’s treatment or supplement plan.

### 17.5 Followed-topic updates

Use scientific interests to prioritize useful updates.

Examples:

* A new human trial concerning a followed metabolite.
* An important study challenging a previously believed pathway.
* Newly characterized strain-specific function.
* Evidence that a potential intervention is ineffective.
* A relevant source retraction.

Notifications must be optional and should emphasize meaningful changes rather than routine publication volume.

---

## 18. Explorer Experience Design

### 18.1 Design identity

Follow Bloom’s established premium editorial design language.

The approved Bloodwork/LDL mockup remains the clearest benchmark for:

* Typography.
* Material depth.
* Botanical and scientific atmosphere.
* Image quality.
* Composition.
* Information hierarchy.
* High-quality visualizations.

Explore should have its own scientific-discovery composition rather than copying Bloodwork layouts.

Preserve existing approved Biology and Microbiome artwork.

### 18.2 Explorer landing page

Prioritize:

1. A prominent scientific search.
2. Relevant health goals or discovery themes.
3. Followed topics.
4. Reviewed recent discoveries.
5. Accessible routes to deeper science.

Avoid presenting a vast raw list of organisms or molecular identifiers.

### 18.3 Topic detail

**Layer 1 — Immediate understanding**

Answer:

* What is this?
* Why does it matter?
* What do researchers know?
* Is there anything useful I can do?

Use concise, natural language.

**Layer 2 — Biological relationships**

Show relevant:

* Organisms.
* Genes.
* Enzymes.
* Substrates.
* Cofactors.
* Reactions.
* Products.
* Host pathways.
* Health outcomes.
* Eligible interventions.

Prioritize relationships relevant to the user’s selected topic.

**Layer 3 — Scientific deep dive**

Provide:

* Precise identifiers.
* Reaction chemistry.
* Regulation.
* Compartmentalization.
* Transport.
* Kinetics.
* Microbial ecology.
* Study details.
* Conflicting evidence.
* Source provenance.
* Modeling assumptions.
* Measurement limitations.

All information should remain accessible without dominating the default experience.

### 18.4 Interactive pathway visualization

Support an intentionally composed, navigable pathway view.

Requirements:

* Directional reactions.
* Distinct organism and host processes.
* Appropriate molecule imagery.
* Substrate and product relationships.
* Branching and competing pathways.
* Cross-feeding interactions.
* Distinction between measured and inferred activity.
* Optional supporting evidence.
* Drill-down into individual nodes and relationships.

Avoid an enormous unreadable network graph.

Use focused subgraphs, progressive expansion and appropriate desktop/mobile compositions.

Provide accessible structured-text equivalents.

### 18.5 Contextual navigation

A user must be able to move between:

* Goal.
* Outcome.
* Pathway.
* Organism.
* Enzyme.
* Substrate.
* Metabolite.
* Food.
* Intervention.
* Study.
* Personal observation.

Preserve navigation context and a reliable way to return.

---

## 19. Architecture and Data Contracts

### 19.1 General modeling principle

Use canonical versioned entities and typed relationships.

Add relationship types where scientifically necessary.

Do not create separate schemas for each newly discovered pathway.

### 19.2 Conceptual entity model

```ts
type BiologicalEntityKind =
  | "health-outcome"
  | "biological-process"
  | "pathway"
  | "reaction"
  | "organism"
  | "strain"
  | "host-gene"
  | "microbial-gene"
  | "transcript"
  | "protein"
  | "enzyme"
  | "transporter"
  | "receptor"
  | "metabolite"
  | "substrate"
  | "cofactor"
  | "regulator"
  | "nutrient"
  | "food"
  | "intervention"
  | "compartment"
  | "environmental-factor"
  | "measurement"
  | "scientific-study";
```

This represents a conceptual type inventory. The Architect must reuse the actual existing registry and prevent unnecessary duplicate entity identities.

### 19.3 Typed relationship model

Support relationships such as:

```ts
type BiologicalRelationshipKind =
  | "encodes"
  | "expresses"
  | "catalyzes"
  | "consumes"
  | "produces"
  | "requires"
  | "transports"
  | "activates"
  | "inhibits"
  | "regulates"
  | "competes-with"
  | "cross-feeds"
  | "transforms"
  | "binds"
  | "signals-through"
  | "associated-with"
  | "measured-by"
  | "modifies"
  | "supports-outcome"
  | "potentially-harms";
```

Relationships must retain:

* Source identifiers.
* Exact entity identity and resolution.
* Direction.
* Evidence category.
* Experimental system.
* Context.
* Human applicability.
* Limitations.
* Review state.
* Source version.
* Revocation or withdrawal status.

Do not assume every graph edge is transitively causal.

### 19.4 Reaction-specific contract

```ts
type BiologicalReaction = {
  id: string;
  substrateIds: string[];
  productIds: string[];
  stoichiometry?: Record<string, number>;
  enzymeIds: string[];
  geneIds: string[];
  cofactorIds: string[];
  compartmentIds: string[];
  reversibility:
    | "reversible"
    | "forward-supported"
    | "reverse-supported"
    | "unknown";
  applicableOrganismIds: string[];
  constraints: string[];
  evidenceIds: string[];
  reviewStatus:
    | "draft"
    | "review-required"
    | "approved"
    | "restricted"
    | "withdrawn";
  version: string;
};
```

Map the contract to existing scientific structures; don’t impose a parallel model unnecessarily.

### 19.5 Evidence-supported relationships

Each relationship must distinguish:

* Biochemical capability.
* Observed expression.
* Measured activity.
* Measured metabolite production.
* Observed biological association.
* Experimental causal relationship.
* Human intervention outcome.
* Computational inference.

The graph must prevent unsupported inference chains.

---

## 20. Computational Modeling Boundaries

### 20.1 Descriptive science first

A useful Explorer does not require a full mechanistic simulation engine.

For most topics, the first deliverable should be:

* Correct molecular identities.
* Correct documented reactions.
* Relevant context and constraints.
* Evidence-qualified relationships.
* Clear personal applicability.
* Safe action eligibility.

### 20.2 Advanced models

Later validated work may support:

* Metabolic network reconstruction.
* Constraint-based flux modeling.
* Enzyme-constrained models.
* Kinetic simulations.
* Community metabolic exchange models.
* Host–microbe metabolic models.
* Predictive response models.

Such models require appropriately validated assumptions and input data.

### 20.3 Scientific model output

Never present simulated flux as directly measured physiology.

Clearly distinguish:

* Possible capability.
* Predicted capability.
* Simulated behavior.
* Measured biochemical activity.
* Measured health response.

Do not generate a personalized metabolic simulation simply because the user has an organism abundance report.

---
## 21. General-Purpose Scientific Reference Fixtures

The implementation must prove broad coverage across unrelated mechanisms.

### Fixture A — Bile-acid metabolism

Test:

* Host-produced substrates.
* Glycine/taurine conjugation.
* BSH specificity.
* Microbial deconjugation.
* Downstream transformations.
* Host signaling.
* Human association versus animal intervention.
* No unsupported lifespan recommendation.

### Fixture B — Resistant starch and butyrate

Test:

* Food preparation.
* Colonic delivery.
* Primary degraders.
* Cross-feeding.
* Competing fermentation.
* Multiple butyrate-producing organisms.
* Observed versus inferred production.
* Human dietary evidence.

### Fixture C — Tryptophan metabolism

Test:

* Dietary and host precursor availability.
* Competing pathways.
* Microbial transformation.
* Indole derivatives.
* Host receptors.
* Potentially differing physiological effects.
* No generalized instruction to maximize all metabolites.

### Fixture D — Polyphenols and urolithins

Test:

* Food-derived precursors.
* Individual metabotype.
* Required microbial functions.
* Metabolite production.
* Population variation.
* Human intervention evidence.
* No automatic longevity claim.

### Fixture E — Sulfur metabolism

Test:

* Different sulfur sources.
* Sulfate reduction.
* Sulfur-containing amino-acid metabolism.
* Hydrogen sulfide production and consumption.
* Contextual host effects.
* Potential competing pathways.
* No universal beneficial/harmful threshold without appropriate evidence.

### Fixture F — Nutrient and cofactor metabolism

Test:

* Dietary nutrient intake.
* Absorption.
* Host utilization.
* Cofactor requirements.
* Genetic context.
* Measured status.
* No automatic supplementation from an enzyme’s cofactor dependence.

### Fixture G — Drug–microbiome transformation

Test:

* Drug as substrate.
* Relevant microbial enzyme.
* Transformation product.
* Evidence for actual interaction.
* Clinical applicability.
* Medication safety boundaries.
* No autonomous treatment changes.

### Fixture H — Microbial toxins and strain-specific capability

Test:

* Organism versus strain.
* Toxin gene versus expression.
* Expression versus secretion.
* Receptor interaction.
* Host effect.
* Clinical relevance.
* No automatic personal diagnosis.

### Fixture I — Exercise-associated microbial metabolism

Test:

* Host-produced metabolites.
* Exercise context.
* Microbial utilization.
* Human association versus animal experiments.
* No unsupported exercise-performance intervention.

### Fixture J — Host lipid and glucose metabolism

Test:

* Dietary intake.
* Digestion/absorption.
* Host transport.
* Host enzymes.
* Hormonal regulation.
* Relevant measured biomarkers.
* Medication context.
* Human outcome evidence.
* Competing health goals.

The Architect may use existing source-reviewed fixtures when available. Do not introduce unreviewed scientific claims simply to populate demonstrations.

---

## 22. Mandatory Acceptance Matrix

**Biological representation**

BIO-EXP-01: A reaction can represent multiple substrates and products with source-supported stoichiometry.

BIO-EXP-02: Cofactor requirements are represented separately from substrates.

BIO-EXP-03: Gene presence does not establish expression.

BIO-EXP-04: Protein presence does not establish enzyme activity.

BIO-EXP-05: Metabolite concentration does not establish its microbial producer.

BIO-EXP-06: Reaction direction and reversibility are not fabricated.

BIO-EXP-07: Competing pathway branches remain visible.

BIO-EXP-08: Host and microbial compartments remain distinguishable.

BIO-EXP-09: A required transport step cannot be silently assumed.

BIO-EXP-10: Missing kinetic parameters do not produce numerical flux predictions.

**Ecology and regulation**

BIO-EXP-11: Cross-feeding requires appropriately supported relationships.

BIO-EXP-12: Community metabolic compatibility does not establish actual metabolite exchange.

BIO-EXP-13: Functional redundancy is supported without requiring a single species.

BIO-EXP-14: Genus presence does not establish strain-specific capability.

BIO-EXP-15: Environmental conditions and regulation can be represented without inventing personal measurements.

BIO-EXP-16: Enzyme inhibition or activation claims retain source and context.

**Intervention reasoning**

BIO-EXP-17: A food containing a precursor is not automatically claimed to deliver an active substrate to the target compartment.

BIO-EXP-18: A cofactor requirement does not automatically produce a supplement recommendation.

BIO-EXP-19: An intervention’s effect on bacterial abundance remains distinct from its effect on metabolites.

BIO-EXP-20: Animal metabolic improvement does not establish human longevity benefit.

BIO-EXP-21: Potentially unfavorable downstream products are not concealed.

BIO-EXP-22: Recommendations require independent approved action eligibility.

BIO-EXP-23: Protected nutritional and health goals remain enforced.

BIO-EXP-24: Insufficient evidence produces appropriate abstention.

**User-directed exploration**

BIO-EXP-25: A user selects longevity and can explore relevant mechanisms without those mechanisms becoming automatic targets.

BIO-EXP-26: A user can follow an enzyme or pathway independently of a health goal.

BIO-EXP-27: Search supports reviewed scientific synonyms and identifiers.

BIO-EXP-28: A user can move among organisms, enzymes, reactions, substrates, metabolites, foods, studies and outcomes.

BIO-EXP-29: The user can reach scientific details without viewing them by default.

BIO-EXP-30: The Explorer works without microbiome, genetic or laboratory uploads.

BIO-EXP-31: Personal data overlays respect source, consent and assay limitations.

BIO-EXP-32: Mobile and desktop compositions are intentionally optimized.

**Evidence lifecycle**

BIO-EXP-33: New reviewed claims can enter the Explorer without pathway-specific code changes.

BIO-EXP-34: Duplicate publications do not create duplicate active evidence.

BIO-EXP-35: Conflicting studies can coexist with appropriately differentiated claims.

BIO-EXP-36: An unreviewed discovery cannot automatically create a personalized action.

BIO-EXP-37: Retraction or withdrawal invalidates dependent claims and eligible recommendations.

BIO-EXP-38: Followed-topic updates can be generated from reviewed evidence without sharing personal data with research sources.

**Integrity**

BIO-EXP-39: Source correction propagates to dependent personal interpretations.

BIO-EXP-40: A user deletion removes unauthorized downstream use.

BIO-EXP-41: Two accounts cannot access each other’s private research interests or biological observations.

BIO-EXP-42: Existing Food, Biology, Bloodwork, Microbiome, Progress and Today functionality remains intact.

BIO-EXP-43: Model-generated estimates cannot recursively establish their own accuracy.

BIO-EXP-44: No user-facing output falsely represents population research as individually measured biology.

**Cross-domain demonstration**

BIO-EXP-45: At least five materially different pathway families function through the same shared graph.

BIO-EXP-46: At least one new reviewed relationship becomes explorable without custom frontend code.

BIO-EXP-47: At least one mechanism has no approved intervention and is presented usefully without manufacturing an action.

BIO-EXP-48: At least one intervention has both favorable and unfavorable outcomes requiring an explicit tradeoff.

---

## 23. Implementation Sequencing

### Stage 1 — Existing Core integrity

Continue current approved v0.6 priorities.

Do not delay essential Food, Response Intelligence, source coverage, supplement recording, privacy or usability work for advanced biological modeling.

Correct material misrepresentations of substrates, genes, enzymes and outcomes when encountered in existing Core features.

### Stage 2 — Explorer consumer experience

Improve the existing Explore surface by:

* Supporting goal-led and science-led navigation.
* Enabling specific topic interests.
* Improving relevant entity detail.
* Providing progressive biological relationships.
* Integrating personal data only where supported.
* Connecting approved interventions to existing Food/Today experiences.

This should deliver substantial consumer value before sophisticated simulations.

### Stage 3 — Biological relationship expansion

Extend the canonical graph with:

* Reactions.
* Substrates and products.
* Cofactors.
* Regulation.
* Compartments.
* Transport.
* Host–microbe relationships.
* Ecological interactions.
* Evidence-qualified intervention relationships.

Curate a bounded set of scientifically reviewed pathways.

### Stage 4 — Operational living evidence

Complete:

* Scheduled source discovery.
* Scientific identity resolution.
* Candidate extraction.
* Review and publication.
* Conflict/retraction handling.
* Followed-topic relevance.
* Controlled update delivery.

Only reviewed discoveries may influence published claims.

### Stage 5 — Advanced biological intelligence

Introduce validated methods for:

* More detailed enzyme and reaction modeling.
* Functional gene interpretation.
* Metabolomics integration.
* Microbial community interaction analysis.
* Host–microbe modeling.
* Longitudinal individual-response evaluation.
* Computational flux or kinetic models when supported.

Avoid overbuilding before evidence, data coverage and measurable value justify the complexity.

---

## 24. Chief Architect Reconciliation Requirements

The Architect must identify:

1. Which requirements already exist in the approved roadmap.
2. Which are already implemented.
3. Which are partially implemented.
4. Which require genuine new entity or relationship types.
5. Which need more scientific evidence curation.
6. Which need user-facing Explorer improvements.
7. Which require no code because existing infrastructure already supports them.
8. Which are properly Core, Advanced or future research.
9. Which scientific claims should not be activated.
10. Which existing verification scenarios can be reused.
11. How to demonstrate actual end-to-end behavior.
12. How to preserve the canonical visual identity and approved artwork.

The Architect must not respond by creating a new standalone research platform, another general architecture document or a duplicate implementation backlog.

Assign only concrete missing implementation slices to Codex.

---

## 25. Definition of Done

Bloom should enable a person to begin with a simple question:

“What can I do to improve my long-term health?”

From there, Bloom should:

* Identify meaningful supported outcomes.
* Prioritize established actions.
* Explain relevant biological mechanisms.
* Show the enzymes, substrates, metabolites and organisms involved.
* Explain what enables or constrains those mechanisms.
* Identify competing pathways and potential unfavorable effects.
* Distinguish known individual observations from scientific hypotheses.
* Explain what the user’s available data actually establishes.
* Offer a useful action when the evidence supports one.
* Explain why an action is not currently justified when evidence is insufficient.
* Allow the person to follow relevant scientific interests.
* Incorporate future reviewed research through the existing evidence system.
* Preserve user control, privacy and scientific integrity.

The same architecture must work across fermentation, bile-acid metabolism, amino-acid pathways, polyphenol transformations, nutrient/cofactor metabolism, microbial ecology, drug metabolism and host physiology.

Final governing directive:

Bloom must evolve beyond a catalogue of biological associations into a coherent, evidence-grounded understanding of biological capabilities, enabling conditions, interactions, constraints, downstream consequences and meaningful interventions.

The intelligence should be comprehensive internally, but the consumer experience should remain approachable, visually sophisticated and focused on what actually helps the user.


<!-- END VERBATIM OWNER SPECIFICATION -->

---

# PART B — Independent Science & Biology Review and Implementation Revisions

**Review date:** 17 November 2026  
**Prepared for:** Chief Architect & Integration Lead; Codex; AI Intelligence & Personalization; Integrations & Data; Security & Privacy; Legal & Regulatory; Branding/UX and User Testing  
**Disposition:** **APPROVE SCIENTIFIC DIRECTION WITH SPECIFIC ARCHITECTURAL, EVIDENCE, SAFETY AND RELEASE CONDITIONS.** This is approval of a proposed implementation specification, **not** proof of implementation, clinical efficacy, live-user data accuracy, model validation, or release authorization.  
**Relationship to Part A:** Part A is the original owner-directed handoff, preserved in full and without editing. Part B supplements rather than silently supersedes any owner requirement. Where ambiguity exists, the Chief Architect must record its resolution against the canonical owner requirements and existing architecture, without adding a duplicate system.

## B1. Highest-priority scientific conclusions

1. **Make biological capability distinct from realized activity and patient benefit.** Treat gene presence, transcript abundance, protein presence, enzyme activity, compartment exposure, metabolite concentration, receptor response and human outcome as distinct evidence nodes, never transitive synonyms.
2. **Represent chemical processes with typed participants and explicit context.** A reaction with no characterized catalyst, transport step, substrate supply or compartment must be capable of returning `unknown`, not a positive prediction.
3. **Link mechanistic knowledge to human outcomes only through independently evaluated claims.** Strong chemical evidence for a reaction does not provide strong evidence for a clinical intervention. The graph cannot promote an unsupported chain by multiplying edge scores or using language-model plausibility.
4. **Prefer validated general health options over speculative mechanism targeting.** A goal such as healthspan should prioritize applicable human evidence for exercise, adequate nutrition, smoking avoidance and other well-supported behaviours, while allowing exploration of emerging host–microbe biology.
5. **Keep personal overlays observational and assay-aware.** A reported bacterial taxon does not establish strain identity, BSH gene presence, BSH expression, enzyme activity or bile-acid levels; most common gut reports cannot measure those steps.
6. **Do not build an autonomous enzyme-optimization agent.** Explorer should reveal supported options through existing action eligibility and protected-goal systems; where no action is justified, it should explain what science knows and what remains unproven.
7. **Curate a bounded scientifically credible benchmark.** The ten owner fixtures plus the additional BSH longevity study must be annotated and tested before the system claims general scientific reasoning.

## B2. Confirmed existing Bloom architecture and nonduplication map

Read-only GitHub source inspection on `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`, 17 Nov 2026:

| Existing element | Observed source function | Preserve / bounded delta |
| --- | --- | --- |
| `shared/biological-model.ts` | Versioned `BiologicalRegistry`, entities, evidence-linked directional edges and source references; current edge vocabulary mixes simplified mechanism, associations and food rules | Extend typed node/edge semantics and claim-specific review state; do not replace registry |
| `shared/evidence-network.ts` | Builds reusable source-linked nodes for pathways, organisms, substrates, molecules and genetic concepts | Identity and evidence upgrades; avoid duplicate inferred graph from imported catalogue |
| `shared/science-coach.ts` | Curated pathways, organism associations, research citations and limited goal content | Reuse for educational starting fixtures; validate each claim, do not promote old assertions blindly |
| `client/src/pages/Explore.tsx` | Existing Explorer search, node selection and biology registry query | Progressive topic page, search by identifier/synonym, bounded pathway visualization, goal-led entry and user interest following |
| `shared/scientific-contracts.ts` | Claim vocabulary and reaction ontology scaffolding | Add compatibility-preserving observation/claim evidence gates, dependent invalidation and negative cases |
| `shared/meal-intelligence.ts` / wellness actions | Existing food feasibility and action scaffolding | All actionable links go through the established eligibility and safety service |
| Personal report/organism records | Account-private recorded observations separate from public scientific descriptions | Resolve exact identity via reviewed mapping; no implicit conversion of taxon detection to functional measurements |
| Prior microorganism catalogue seed | 190-record **provisional starter** catalogue, including 94 original report-related names; not a fully authoritative or signed-off species catalogue | Ingest only after identity, licensing, scientific claims and source fidelity review; use canonical entity IDs |

**Evidence boundary:** Repository source inspection is not a current hosted deployment test, a scientific sign-off for each stored claim, or proof of a live updater. Codex must record exact SHAs, tests, deployment status and unresolved dependencies separately.

## B3. End-to-end goal-directed question answering, without a chatbot

### Canonical goal-to-knowledge-to-action flow

`user-selected goal or scientific topic` → `recognized outcome + clinically meaningful endpoints` → `eligible evidence-backed pathway subgraph` → `mechanism capability / requirements / uncertainty` → `relevant approved personal source overlay` → `human intervention evidence` → `existing contraindication, consent, allergy and protected-goal veto` → `one meaningful primary option, limited alternatives, or abstention` → `optional user choice` → `qualified longitudinal follow-up`.

**Output requirements by hop:** stable entity IDs, graph version, claim IDs, source IDs, reviewed population and endpoint, laboratory or sample method, data-provenance coverage, temporal validity, reason to include/exclude, confidence category *in words*, and stale/retraction state. A missing hop is not a bridge; do not generate an implicit biological causal arrow.

**Example, goal healthy aging:** An Explorer overview can offer cardiovascular health, physical function, adequate nutrition and sleep as evidence-relevant themes. The user can separately inspect bile-acid deconjugation as an emerging research connection. Explorer must not make maximizing BSH or a secondary bile acid a default longevity goal.

### Five user questions the same topic must answer differently

1. **Learn about:** Describe BSH and its substrate/product chemistry, in accessible language.
2. **Follow research:** Save a private topic interest and optionally receive material, reviewed findings.
3. **See my data:** Show only exact supported personal observations, their dates, assay type, identity resolution and gaps.
4. **Find supported actions:** Query the existing approved action engine; return general healthy-living options if relevant, not untested BSH manipulation.
5. **Track an outcome:** Show suitable existing measurements if present, with appropriate limitations and no invented enzyme activity.

## B4. Biological observability ladder and anti-inference rules

| Tier | Example | What it does **not** establish |
| --- | --- | --- |
| 0: biological reference | A species may encode a BSH homologue | That the user's sample contains that species or gene |
| 1: sampled organism | A report lists a species or genus | Strain identity, gene capacity, abundance outside reported units |
| 2: gene potential | A verified gene sequence or annotation | Expression or enzymatic activity |
| 3: transcript | Assay reports mRNA abundance | Protein abundance, enzyme flux |
| 4: protein | Metaproteomics detects protein | Active catalytic rate or downstream flux |
| 5: functional activity | Validated enzyme assay demonstrates activity in a specified sample | Systemic metabolite delivery or clinical benefit |
| 6: molecule measured | LC-MS reports a bile-acid concentration in a specified matrix | Source organism, enzyme identity, tissue signaling or intervention benefit |
| 7: physiological response | Validated metabolic endpoint changes | Cause of response without appropriate design |
| 8: human outcome | Human intervention measures an outcome | Generalization to unstudied populations, duration or personal effect |

Every edge should specify *which ladder transition* it claims, the evidence design, experimental conditions, and what remains missing. **No automatic ladder climbing.** Evidence from gene expression in aged mice is not a measured personal human gut enzyme activity. Evidence obtained from a culture or engineered organism does not automatically apply to a natural human microbiome.

## B5. Core science data contracts: additive refinements

The following are conceptual fields for extending the current versioned registry. Do not create a second database.

**Entity identity**
- Canonical Bloom ID, entity type, stable reviewed external IDs (Rhea/ChEBI/EC/UniProt/NCBI Taxonomy etc.), preferred label, multilingual/legacy synonym aliases, taxonomic rank and strain qualifiers, exact-versus-fuzzy match, identity provenance, deprecated/merged IDs, rights and review state.
- Keep `Bacteroides fragilis 638R` distinct from a genus-only `Bacteroides` finding. Distinct chemical forms, protonation states and conjugated bile acids cannot share an unqualified numeric measurement.

**Reaction and participants**
- Reaction ID; ordered substrates/products; stoichiometric coefficient and role; catalysis/enzymes and gene annotations; cofactor versus consumed substrate; direction; reversible status and evidence; compartment on both sides; transport dependencies; potential alternative branches; experimental environment and taxon/strain; source and licensing. Missing coefficients remain null.

**Functional qualification / observability**
- `assertion_level`: `capability|genetic_potential|observed_transcript|observed_protein|measured_activity|measured_metabolite|host_response|human_outcome`.
- `observation_class`: `public-reference|personal-measured|personal-provider-reported|personal-estimated|model-simulated|study-observed|unknown`.
- `source_method`, `matrix`, `compartment`, `taxonomic_resolution`, `temporal_scope`, `effective_at`, `recorded_at`, `unit`, `detection_status`, `uncertainty`, `source_version`, `source_revision` and `consent_purpose` wherever applicable.

**Claim evidence**
- Stable claim ID, exactly specified predicate, source DOI/PMID, publication/version date, design (biochemical, culture, mouse, human observational, human intervention etc.), population/species/strain, sample size and endpoint where extracted, effect and uncertainty only if supported, contradictory and null findings, independent scientific review and permitted output use. A single paper may support multiple separate claims with different evidence levels.

**Claim lifecycle**
- `discovered|extracted|source-checked|evidence-reviewed|published-education|approved-general-action|restricted|rejected|withdrawn`, reason-coded gap, approvals, provenance receipts, dependency list, and retraction invalidation. These are policy-specific statuses; they must map to rather than replace the current approval state machine.

**Safer relationship traversal**
- A public graph explorer may show multiple linked mechanistic edges as a hypothesis. A recommendation requires a separately approved action-specific human outcome claim with population compatibility and actual safety clearance. The output generator cannot construct a claim by reading a multihop path without such authority.

## B6. Scientific source acquisition, interoperability and rights

**Candidate authoritative references**

| Source | Purpose | Required checks |
| --- | --- | --- |
| Rhea | Curated biochemical/transport reactions, reaction ID and participants | Verify exact direction, chemical species, compartment labels and license/attribution |
| ChEBI | Chemical entities, chemical identities and synonyms | Source/derivative license, correct protonation/forms and mappings |
| ENZYME/EC | Enzyme family and nomenclature, including BSH EC 3.5.1.24 | EC class does not verify each microorganism or sequence annotation |
| UniProt | Protein identities, function annotation, evidence tiers and Rhea links | Swiss-Prot versus TrEMBL review status, organism and sequence identity |
| NCBI Taxonomy / GTDB | Organism identities and alternate classifications | Accurate strain/species resolution, taxonomy-version and licensing |
| PubMed / Europe PMC / Crossref / ClinicalTrials.gov | Literature, clinical study identities and negative findings | Publication version, actual primary study, retractions, study population and rights |
| Reactome / HMDB / other pathway resources | Contextual host pathways, metabolite annotation | Distinguish annotations from direct experimental evidence and verify terms/licenses |
| MetaCyc/BioCyc and KEGG | Potential pathway coverage | Verify exact rights, access terms, redistribution; no unlicensed bulk copying |

Rhea describes chemical reactions with ChEBI participants and provides machine-readable exports and UniProt/EC links. Rhea data have been distributed under CC BY 4.0 (verify current precise terms before packaging). **Do not assume every linked source inherits the same license.** See https://www.rhea-db.org/ , https://www.rhea-db.org/help/download and https://pmc.ncbi.nlm.nih.gov/articles/PMC8728268/.

**Verification ladder:** identity resolution → licensed ingestion → original record retention → automated type/chemistry/stoichiometry checks → source-claim extraction → independent scientific review of outcomes and harms → permitted educational publication → separate action-eligibility decision. Automate source curation while retaining grounded and auditable promotion controls.

**Ambiguity test:** a paper describing a BSH-active engineered strain should not create an active BSH capability claim for every natural strain in that genus.

## B7. Scientific BSH longevity case study — mandatory BIO-EXP-49

### Source and claim identity

**Primary paper:** “Microbial bile acid deconjugation counters metabolic decline in aging,” *Cell Metabolism*, published online November 16, 2026, DOI **10.1016/j.cmet.2026.10.016**. Primary journal link: https://www.cell.com/cell-metabolism/abstract/S1550-4131(26)00453-5 ; DOI: https://doi.org/10.1016/j.cmet.2026.10.016. Secondary accessible reporting: https://www.genengnews.com/topics/translational-medicine/gut-microbome-and-bile-acid-modification-linked-with-longevity/ and https://www.news-medical.net/news/20261116/Gut-microbiome-changes-could-potentially-be-harnessed-to-support-healthier-aging.aspx .

**Enzyme:** microbial bile salt hydrolase (choloylglycine hydrolase), EC **3.5.1.24**, source: https://enzyme.expasy.org/EC/3.5.1.24 . Example Rhea-specific reaction: https://www.rhea-db.org/rhea/19354 ; **do not assume this specific Rhea entry represents every BSH substrate/reaction**, since conjugate specificity matters.

### Claims to store separately — not one composite “longevity effect”

| Claim | Evidence tier | Permitted interpretation | Prohibited interpretation |
| --- | --- | --- | --- |
| BSH catalyzes deconjugation of specified glycine/taurine-conjugated bile-acid substrates, releasing the unconjugated acid and glycine/taurine | Biochemical reaction, enzyme evidence | Source-qualified catalytic capability with reaction-specific identity | Universal substrate specificity, quantitative gut flux or human benefit |
| Centenarian cohorts showed bile-acid-related associations and enrichment of BSH-associated gene signals | Human observational cohort | Association in a sampled population, with potential confounding/selection effects | BSH causes longer life, a personal longevity score |
| Microbial engineering of BSH activity produced metabolic responses in aged mice | Animal intervention | Evidence of a mouse effect under study conditions | Proven human therapeutic efficacy, safety or life extension |
| Human BSH-targeting supplementation or dietary interventions extend lifespan | **Not established by this paper** | Abstain from targeted longevity treatment claims | “Increase BSH to live longer” |

**Nuance:** public summaries describe a human analysis including centenarians and genetically altered bacteria in aged mice. Codex/science curation must extract **actual cohort sizes, metabolic measurements, directions, confidence intervals and model details from the primary paper** before attaching numerical estimates. Do not invent study-specific numeric effects from media summaries. A human association and an animal intervention must retain separate linked IDs, populations and endpoints.

### Pathway representation required

1. Host liver synthesizes and conjugates bile acids (explicit glycine/taurine forms as supported).
2. Host secretes conjugated bile acids through the biliary system; intestinal delivery has spatial and timing conditions.
3. Applicable microbial BSH enzyme catalyzes a source-qualified hydrolytic deconjugation, at the relevant compartment.
4. Resulting unconjugated bile acids can enter multiple possible pathways; downstream secondary transformations are separate enzymes and reactions, not implied by BSH itself.
5. Absorption, enterohepatic circulation, receptor signaling and host metabolism require their own source-linked steps, and are not implied by a bacterial report.
6. Downstream consequences may be mixed and context-dependent; relevant bile acids have different receptor and cytotoxic profiles.
7. Human aging/centenarian association and mouse metabolic-response study connect to specific observation/outcome claims—not to an established human lifespan intervention.

### Explicit personal-data boundary

If a user has a report detecting `Bacteroides`, `Lactobacillus` or any other potentially BSH-bearing lineage, Explorer may say **“Your report lists this organism; gene and enzyme activity were not measured”** when true. If relevant functional genes, transcripts or measured bile acids are truly reported, display only those results with the correct original assay and units. Neither the absence nor presence of a species label proves the specific enzyme activity or its metabolic effect. No fabricated BSH abundance, bile-acid production, host concentration, or longevity score.

### Proposed consumer presentation

- Headline: **“A new connection between gut bile-acid transformations and healthy aging”**.
- Intro: **“Researchers observed bile-acid-related differences in people who reached exceptional ages. In aged mice, experimentally increasing a microbial enzyme improved measured metabolic outcomes. Whether targeting that enzyme improves health or lifespan in people is not yet known.”**
- `Explore the process`: expand host-produced bile acids → microbial BSH → distinct downstream routes → mouse and human findings.
- `What my report says`: show exact verified observed taxa and otherwise `No relevant function was measured`.
- `Can I act on this?`: **“No proven BSH-targeting longevity action follows from this study.”** If the person's healthspan goal is selected, independently approved everyday health actions may be offered with their own human evidence—not attributed to this BSH study.
- `Follow research`: optional account-private interest, source-change notice only when reviewed and material.

### BIO-EXP-49 — required acceptance procedure

**Given** a curated primary study record and one user with a reported potential BSH-associated taxon but no gene/activity assay, and one user with no microbiome report:

1. Resolve the study DOI, publication date and references without duplicate records.
2. Create separate typed enzyme/reaction nodes and required substrate/product/compartment links; verify BSH specificity with an actual Rhea/EC source.
3. Resolve related organisms at the **supported rank and strain** only; do not infer capability for an unverified taxon.
4. Create separate human-cohort association and aged-mouse intervention claims, with exactly their study populations and outcomes.
5. Show contradicting/limiting evidence, competing downstream routes and unresolved human benefit.
6. Link the public mechanism to healthy aging without permitting transitively inferred “BSH increases longevity”.
7. In the user with a taxon observation, display exact personal report provenance, not inferred BSH activity.
8. In the user with no report, the full educational topic still functions without inventing personal data.
9. Block BSH-targeting supplement, probiotic, engineered-bacteria or medication suggestions in the absence of independent approved human intervention and safety evidence.
10. Allow other evidence-supported healthy aging actions through the existing governed action service, explicitly **not** as the study's demonstrated effect.
11. Permit following the research privately, with no private biology sent to the publication-search service.
12. If evidence is retracted or the user's source is corrected/deleted, retract dependent claims/caches and re-evaluate action eligibility.
13. Verify search by `bile salt hydrolase`, `choloylglycine hydrolase`, `EC 3.5.1.24`, `bile-acid deconjugation` and DOI; no aliases imply unsupported identity matches.
14. Exercise negative cases for mismatched bacterial strains, incompatible assays, model failure, missing data and adverse evidence.
15. Demonstrate the same generic graph renderer and claim-evaluator handling at least four other owner-required pathway fixtures (not specialized BSH UI code).

**Pass:** all positive/negative evidence boundaries and tests, with independent Biology/AI review of claim extraction and Security/Legal clearance for the proposed release scope. **Fail:** any claim of measured personal BSH flux without a direct validated assay; an implied human survival benefit; universal enzyme-presence inference from taxa; automatic BSH-targeted treatment; or a hardcoded BSH-only demonstration that cannot generalize.

## B8. Technical safeguards and developer-ready interfaces

### Query contract — conceptual

```
ExplorerTopicQuery {
  topic_id: string;
  requested_intent: 'learn'|'follow'|'see-my-data'|'find-actions'|'track-outcome';
  as_of: string;
  account_purpose?: string;
  max_depth: number;
}
ExplorerTopicResult {
  topic_entity_id: string;
  reviewed_explanations: ClaimReference[];
  subgraph: { nodes: CanonicalEntityRef[]; edges: QualifiedRelationRef[] };
  evidence_limits: EvidenceGap[];
  personal_observations?: SourceQualifiedObservation[];
  approved_action_ids: string[];
  abstention_reasons: string[];
  graph_version: string;
  evidence_version: string;
}
```

The public research subgraph should be available without an account. `see-my-data` must resolve authorization and purpose *server-side* against existing private observation stores and be absent (not merely hidden with CSS) when consent or eligibility is missing. User follows remain private. A large pathway requires deterministic node/edge budgets and an accessible linear-text alternative.

### Anti-overclaiming tests

- Null gene, metabolite, transporter and dose values remain absent; `unknown` does not become `zero`.
- A public evidence edge cannot be recast as a personal fact because an adjacent personal organism node exists.
- An EC mapping must not collapse all proteins or taxa into identical function or kinetics.
- Simulated flux cannot substitute for measured concentration or clinical risk.
- Human cohort association cannot become a treatment claim even when supported by a mouse trial.
- Negative literature evidence and retractions alter permitted claims and action links, not just a disclosure footer.
- No LLM may write directly to approved graph/action tables; generated extraction stays a candidate pending evidence validation.

## B9. Implementation order, bounded Codex slices and exits

**No interruption of frozen v0.6 everyday Core.** The following are concrete deltas within the existing lanes; major generalized discovery and molecular simulation stay Advanced/v0.7 unless already authorized.

| Slice | Deliverable | Acceptance gate |
| --- | --- | --- |
| EXP-C01 | Canonical entity identity audit and crosswalk for prior 190 starter entries, existing graph and source aliases | Unique stable IDs, original names retained, ambiguous identity remains unresolved, no scientific upgrades by migration |
| EXP-C02 | Backward-compatible typed relation/reaction/participant contract in existing shared graph | BIO-EXP-01–16 plus negative missing participants and compartments |
| EXP-C03 | Claim-specific evidence records and publication/retraction dependency linkage | BIO-EXP-17–24, 33–38, source and output eligibility checks |
| EXP-C04 | Goal/topic query service over bounded subgraphs, without a new recommendation engine | BIO-EXP-25–31, 39–44, safety veto and private overlay isolation |
| EXP-C05 | Explore topic page redesign and accessible focused pathways | BIO-EXP-28–32, measured-vs-mechanism distinction, mobile/desktop and screen-reader alternatives |
| EXP-C06 | Bounded curated mechanism dataset across ten unrelated fixtures plus BIO-EXP-49 | All fixture expected results, conflicting/negative claims, primary citation proof |
| EXP-C07 | Followed-topic research updates through existing evidence-source lifecycle | Idempotency, review states, retractions, user privacy, optional notifications |
| EXP-C08 | Cross-domain integration with Food/Today/Progress/Microbiome/Athlete | A recommendation is either independently approved and feasible or withheld; protected goals and account isolation verified |
| EXP-C09 | Held-out new pathway case requiring no bespoke frontend or algorithm branch | BIO-EXP-45–49 demonstrated with source-backed data and actual running app |
| EXP-C10 | Release evidence and Architect reconciliation | Exact SHA, tests, source/rights receipts, feature gate, preview URL, domain sign-offs and separate production authorization |

**Evaluation standards:** factual exact-identity accuracy; quantitative stoichiometry accuracy; correct evidence-type classification; false personal-function inference rate; false human-benefit/causal-action rate; adversarial abstention; source/withdrawal propagation; end-to-end navigation; accessibility; query latency and compute cost. Require **zero false individual-measurement claims and zero unapproved medication/clinical actions** in release-gating fixtures. Scientific model accuracy beyond those fixtures requires independent benchmarks before stronger claims.

**Avoid a second approval treadmill.** Codex may implement, test, and stage authorized engineering slices under the existing November 15 build-first policy; scientific/clinical/data-rights/privacy activation gates remain independent and documented. Do not merge unapproved features into production automatically.

## B10. Exact owner acceptance criteria retained and extended

**Owner requirements (retained intact in Part A):** BIO-EXP-01 through BIO-EXP-48; ten broad pathway fixtures A–J; all 25 original sections.  
**Additional requirement:** **BIO-EXP-49** as specified in B7.  
**Additional negative cases:** type/identity ambiguity, exact chemical species, species-versus-strain mismatch, separate human/mouse evidence, unknown assay status, research revocation, safe no-action, inaccessible personal context, model failure and a novel non-BSH pathway. 

The Architect must map accepted new requirements to existing V06-LIVE-EXT, V06-LIVE-UPD, V06-12, V06-13 and the current dependency backlog **without generating a duplicate master backlog**. Feature readiness must distinguish proposed, implemented, source-tested, independently scientifically accepted, legally/privacy authorized, deployed and production released.

## B11. Cross-agent review and sign-off checklist

- **Science & Biology (primary scientific):** reaction chemical identity, enzyme substrate specificity, study population/outcome extraction, assay observability ladder, conflict/negative evidence, claims and human-benefit limitations.
- **AI Intelligence & Personalization:** structured candidate extraction precision, supported multi-hop graph traversal, no promotion through generated prose, generalization/held-out tests, calibrated abstention and action gating.
- **Integrations & Data:** stable IDs, exact chemical/taxonomic resolution, source revisions, API provenance, duplication, source import and export correctness, evidence revocation.
- **Security & Privacy:** account isolation, explicit personal-overlay authorization, followed-topic private state, cache partitioning, correction/deletion/consent changes and external scientific-query minimization.
- **Legal & Regulatory:** source copyright/license including derived databases, territorial intended-use classification, medical/clinical claims, optional alerts and any treatment-related advice.
- **UX/Brand and User Testing:** premium Explorer landing/topic content, progressive disclosure, focused graphical pathway, accessible fallback, small-screen navigation, no unnecessary warnings, accurate placement of personal observations.
- **Chief Architect:** reconcile exact roadmap modules and owner priority; do not create new top-level platforms or alter existing source-of-truth controls.
- **Codex:** perform bounded authorized implementation, maintain deterministic test receipts and draft RC evidence; do not claim public release before independent gates close.

## B12. Sources and source-verification cautions

**Direct research and identifier references:**

1. Dantas Machado and colleagues, “Microbial bile acid deconjugation counters metabolic decline in aging.” *Cell Metabolism*, published November 16, 2026. DOI: https://doi.org/10.1016/j.cmet.2026.10.016 ; journal https://www.cell.com/cell-metabolism/abstract/S1550-4131(26)00453-5 . Study-specific numbers and exact outcomes require primary-paper extraction.
2. ENZYME EC 3.5.1.24, choloylglycine hydrolase / BSH: https://enzyme.expasy.org/EC/3.5.1.24 .
3. Rhea reaction knowledgebase: https://www.rhea-db.org/ ; example BSH-associated reaction https://www.rhea-db.org/rhea/19354 ; curated reactions and ChEBI participants https://www.rhea-db.org/help/reaction-curation .
4. Rhea data formats/download and license: https://www.rhea-db.org/help/download ; Rhea 2022 Nucleic Acids Research description https://pmc.ncbi.nlm.nih.gov/articles/PMC8728268/ .
5. Public reporting (context only, not substitute for complete study methods): https://www.genengnews.com/topics/translational-medicine/gut-microbome-and-bile-acid-modification-linked-with-longevity/ ; https://www.news-medical.net/news/20261116/Gut-microbiome-changes-could-potentially-be-harnessed-to-support-healthier-aging.aspx .
6. Existing Bloom source files listed in B2 and prior published `Bloom_Microorganism_Catalogue_Integration_Handoff_2026-11-17.md`, `Bloom_Autonomous_Biological_Discovery_Science_Biology_Full_Handoff_2026-11-16.md`, `Bloom_Comprehensive_Personal_Health_Life_Stage_Intelligence_Complete_Science_Handoff_2026-11-17.md`.

**Evidence-status note:** The Cell Metabolism DOI, title and enzyme family were independently cross-checked from contemporaneous journal/institution and enzyme references. This handoff does **not** certify the full paper's methods, numeric endpoints or independent claims, and expressly requires that validation before public biological effects are published. The GEN article itself was not directly retrievable in this session; its study was cross-checked with journal metadata, other reporting and institutional listings. Do not transform secondary article summaries into experimental quantitative ground truth.

---

**Science & Biology conclusion:** **APPROVE WITH TARGETED REVISIONS FOR CHIEF ARCHITECT RECONCILIATION.** Preserve Part A as controlling owner direction. The Explorer should become a durable, evidence-grounded way to navigate genuine biochemical capabilities and meaningful health science, but no unmeasured personal physiology, causal benefit, dose or intervention may be invented to fill a visual or conceptual gap. **BIO-EXP-49 is a mandatory additional benchmark, not a BSH-only implementation shortcut.**


---

# PART C — Science & Biology Review: Sixteen-Study Generalization and Evidence Acceptance

**Revision:** 1.1, November 17, 2026. **Status:** Independent research-based *requirements amendment*, not implementation or clinical release authorization.

**Preservation commitment:** The entire previously published Part A owner document and Part B specialist review, including BIO-EXP-01–49, are retained exactly as published. Part C below is additive. The supplied 16-item study list is preserved in concept and original numbering, while correct titles, primary sources, uncertainty and unresolved identities are explicitly disclosed rather than silently rewritten. The companion CSV is an importable study-to-capability ledger, **not** production-approved claims.

## C1. Executive scientific decision

**Decision: APPROVE WITH TARGETED EXPANSION.** The planned graph, reaction and evidence architecture is broad enough **in principle** to express all sixteen scientific themes. It is *not yet sufficient by itself* to pass them: the system must also differentiate causal experiments, observational associations, individualized predictions, trial outcome superiority, conflicts between studies, treatment formulation, tissue specificity, time and population/age effects. No current implementation or clinical claim is certified by this review. The 2022 Personal Diet Study is particularly important counterevidence against treating personalized glycemic prediction as inherently superior for weight loss.

Do not build 16 bespoke scientific widgets. Add claim-typed trial results, model-validity records, exposure/formulation identity, evidence contradiction families and purpose-specific advice eligibility to the existing graph/evidence/action infrastructure.

## C2. Verified study-by-study coverage assessment

**Research-status key:** P = primary-source metadata or accessible primary text independently located; Q = specific result requires full methods/results extraction; U = original identity unresolved. Titles in the user's list are preserved by numbered crosswalk; the canonical record uses the verified original journal title where available.

| # | Study / status | Core capabilities that must be demonstrated | Critical scientific guardrail |
|---|---|---|---|
| 01 | BSH / centenarians / metabolic aging (P/Q) | Host liver ↔ bacterial deconjugation; enzyme/gene identity; animal vs human cohort; downstream bile-acid pool | No human lifespan or BSH-upregulation prescription |
| 02 | Pasteurized *Akkermansia* MucT RCT (P/Q) | Live species vs pasteurized nonviable strain preparation, exact exposure, randomized maintenance outcome | Presence of *Akkermansia* in stool is not the trial intervention |
| 03 | Protein/amino acid restriction review (P) | Mechanistic nutrient sensing plus human protein sufficiency, age, pregnancy, exercise, sarcopenia | Do not suggest restriction contrary to muscle/adequacy goals |
| 04 | Microbial bile acids → androgen receptor / anti-tumor immunity (P) | HSDH transformations; bile-acid isomer stereochemistry; receptor antagonism; immune cell and tumor-model context | No cancer-treatment, anti-PD1, testosterone or androgen advice |
| 05 | Mouse aging host–microbiome metabolic model (P) | Host/microbial compartments, organ-specific omics, computational model and assumptions | Mouse model ≠ individual human prediction |
| 06 | ZOE METHOD personalized dietary RCT (P) | Bundled program exposure, measured endpoints, comparator, adherence and conflicts/rights | Trial cannot prove each component caused benefit |
| 07 | SCFA community metabolic modeling (P) | Measured vs simulated flux; organism exchange; ex vivo testing; cohort associations | Predicted butyrate production ≠ measured user butyrate |
| 08 | Urolithin A conversion community study (P) | Ellagic acid/ellagitannin input; metabotypes; fermentation and LC-MS product | Community-level association ≠ species gene proof |
| 09 | Personal Diet Study RCT (P) | Personalized predicted glycemia vs low-fat diet, predeclared primary outcome, null result | No claim of superior weight loss (primary P=.16) |
| 10 | Centenarian novel bile-acid biosynthesis (P) | Species/strain-specific isoalloLCA pathway; molecular identity and direct biochemical evidence | Enrichment does not imply longevity benefit |
| 11 | Microbiome–diet–cardiometabolic cohort (P) | Observed diet/organisms/fasting and postmeal markers; confounder control | Association cannot drive a personal-effect claim |
| 12 | PREDICT 1 physiological response dataset (P) | Meal timing, postprandial curves, prediction targets, phenotype and measurement context | Model cannot infer actual response without validated inputs |
| 13 | 2015 individualized glycemic predictions (P) | Algorithm training/hold-out/prospective evaluation, covariates and deployment drift | Do not transfer reported accuracy to Bloom without benchmarking |
| 14 | GLP-1 bacteria report discussed May 2025 (U) | Reserve search concepts for microbial metabolite → enteroendocrine receptor → secretion → glucose | No attributed study, identified microbe or action until exact source recovered |
| 15 | Microbiome and intelligence MR preprint (U candidate) | Genetic instruments, MR assumptions, pleiotropy, population, outcome, conflict | Never recommend increasing a species to improve intelligence |
| 16 | Host BA–MCY / FXR paper (P) | Host enzyme VNN1; novel bile-acid conjugates; intestine-vs-liver FXR feedback; mouse intervention | Not a tested human lipid-lowering intervention |

The paper list is a **benchmark corpus**, not a list of confirmed effect claims. The full CSV carries verified titles, links, study design, model limitations and actionable gating for each record.

### Source-critical corrections and conflicts

- **Study 02:** Correct title is *Pasteurized Akkermansia muciniphila MucT for weight loss maintenance in people with overweight and obesity: a controlled randomized trial*; the intervention is a **specific pasteurized preparation**, not a live abundance increase. Source: https://doi.org/10.1038/s41591-026-04394-7 .
- **Study 03:** Correct title is *The hallmarks of protein and amino acid restriction in aging and longevity*; it is a **review** and must not override protein adequacy, healthy aging, muscle protection, reproductive or disease-specific constraints. Source: https://doi.org/10.1016/j.cpblue.2026.100079 .
- **Study 05:** Correct title is *Metabolic modelling reveals the aging-associated decline of host–microbiome metabolic interactions in mice*. Species is critical. Source: https://doi.org/10.1038/s41564-025-01959-z .
- **Study 07:** Correct title is *Microbial community-scale metabolic modelling predicts personalized short-chain fatty acid production profiles in the human gut*. It evaluates models using in vitro/ex vivo/cohort data, but this is not a product-validated individual intervention. Source: https://doi.org/10.1038/s41564-024-01728-4 .
- **Study 08:** Exact title *In vitro conversion of ellagic acid to urolithin A by different gut microbiota of urolithin metabotype A*. The experiment implicates communities, not definitively isolated causal enzymes for every correlated species. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC10873453/ .
- **Study 09 — crucial negative evidence:** 200 adults in a randomized trial; at six months mean weight change was −4.31% in the standard arm versus −3.26% in the personalized arm, with no significant between-group superiority (P=.16). Do not present the 2015 predictive success or 2024 ZOE RCT as refuting this null finding. The three trials involve different predictions, interventions, comparators and outcomes. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC9520362/ .
- **Study 10:** Journal's title is *Novel bile acid biosynthetic pathways are enriched in the microbiome of centenarians*. Source: https://doi.org/10.1038/s41586-021-03832-5 .
- **Study 11:** Exact title *Microbiome connections with host metabolism and habitual diet from 1,098 deeply phenotyped individuals*. Source: https://doi.org/10.1038/s41591-020-01183-8 .
- **Study 12:** Exact title *Human postprandial responses to food and potential for precision nutrition*. Publisher has also posted a correction (https://doi.org/10.1038/s41591-020-1130-y), requiring a version-aware article registry. Source: https://doi.org/10.1038/s41591-020-0934-0 .
- **Study 14:** The user provided *no original citation*. Do not falsely identify it as the later November 2025 antibiotic/GLP-1 paper (https://doi.org/10.3389/fendo.2025.1684155); hold a topic-level research-gap record until exact source is found.
- **Study 15:** Possible match: medRxiv preprint *Mendelian Randomization analyses identify causal associations of human gut microbiome composition on intelligence*, https://doi.org/10.1101/2023.05.11.23289760 . A separate peer-reviewed 2024 two-step MR study, https://pubmed.ncbi.nlm.nih.gov/38432522/ , also exists. Without the prior exact link we cannot determine which was discussed. MR remains sensitive to instrument assumptions, pleiotropy, taxonomic resolution, multiple testing and confounding; no individual intelligence intervention should be claimed.
- **Study 16:** Primary paper recovered: *Host metabolism balances microbial regulation of bile acid signalling*, https://doi.org/10.1038/s41586-024-08379-9 . The host BA–MCY/FXR mechanism is largely preclinical; the January 2025 news coverage does not establish human efficacy.

## C3. Five missing first-class scientific data concepts

### C3.1 `InterventionExposure` / formulation ontology

Must distinguish a raw food, isolated nutrient, pasteurized microorganism (specific strain), live probiotic, genetically modified laboratory organism, human medication, and lifestyle program. Include identity, strain, viable state, processing, chemical/formulation specificity, dose, route, period, adherence, comparator and source. **No identity inheritance:** detecting *A. muciniphila* in stool cannot establish that someone received pasteurized MucT; a report of probiotic use cannot establish strain, processing or actual adherence.

### C3.2 `StudyResult` and estimand with negative evidence

Key per-result fields: primary/secondary/exploratory, preregistration/trial registry, population/eligibility, arms, randomized/blinded, intervention definition, comparator, outcome unit, follow-up window, sample size, missingness, adjusted estimate, effect interval, P value where supplied, harms, adverse events, null/negative outcome, subgroup limitations, sponsor/conflicts, and study version/retraction status. A study can be positive on one endpoint and null on another, with separate relationship/claim IDs. **A study abstract is not a blanket positive endorsement.**

### C3.3 `PredictionModelEvidence` vs `TreatmentEffectEvidence`

Track prediction target, input features, development cohort, held-out external validation, calibration, generalizability, availability of required predictors, drift/shift, intended-purpose rights, and comparison to simpler baselines. Independently track randomized evidence that *acting on the model* improves actual health outcomes. Predictive accuracy does not imply treatment effectiveness. This is essential to reconcile #6/#9/#12/#13.

### C3.4 `MolecularIdentity` including isomerism, processing and compartment

Handle positional/stereochemical bile-acid isomers (including isoalloLCA, 3-oxo bile acids), conjugation with glycine/taurine/MCY, receptor ligands, distinct host vs microbial enzymes, and source-qualified links to ChEBI/Rhea/EC/UniProt. If two chemicals cannot be reliably distinguished from a measurement, **no isomer-specific effect claim**.

### C3.5 `EvidenceConflictGroup` with a scoped question

Group findings only when population, intervention, comparator, time and **outcome match**. Distinguish corroboration from evidence addressing different causal questions. Display null, adverse, negative and contrary results. Example: glucose-prediction research (2015) is not direct contrary evidence to the 2022 weight-loss trial; the latter tests downstream intervention superiority.

## C4. Links to current Bloom architecture — **no new engines**

- Reuse `shared/biological-model.ts` and `shared/evidence-network.ts` for canonical identity and qualified edges; add typed result/formulation/model records with migration/version receipts.
- Reuse `shared/scientific-contracts.ts` and evidence-governance source/version/claim lifecycle.
- Reuse `shared/science-coach.ts` for evidence-linked pathway vocabulary without treating its explanatory text as clinical facts.
- Reuse the recent 190-organism scientific catalogue seed and morphology imagery **after** identity/rights/scientific review; do not make duplicate organism IDs or new organism image-per-paper shortcuts.
- Reuse existing Profile, dated personal observations, Food composition, training and goals, wellness-action eligibility, CDPI prioritization and Response Intelligence.
- Reuse source-update/scheduled jobs, consent and account isolation. Any source discovery must use **public scientific terms only** and exclude private genomic or microbiome inputs.
- The only new artifacts are additive typed records/interfaces, approved knowledge content, missing tests and UI representation changes inside Explore, Biology, Food, Today and Progress.

## C5. What users should see: ordinary-first interpretation

For a reviewed *Akkermansia* trial: “Researchers tested a specific pasteurized preparation for weight maintenance in a defined group. Seeing this bacterium in a stool test does not mean you received the same intervention or will have its outcomes.” Offer *Learn how the intervention differs from the organism*; no automatic probiotic recommendation.

For a protein-longevity review: “Researchers study protein amount and amino-acid signaling in aging. The best choice for you also depends on strength, protein adequacy, age, activity and health context.” Do not autonomously reduce protein or optimize an individual amino-acid restriction.

For Personal Diet: “A personalized glucose-targeted diet did not produce greater average weight loss than a standard diet in this trial.” Show comparator, actual outcome and link to methods. No generic “personalized diets fail” claim.

For the microbiome-intelligence MR: “Researchers have explored statistical genetic links, but the relationship and intervention implications remain uncertain.” No cognitive ranking, intelligence prediction or suggested microbial manipulation.

## C6. Scientific decision rules / hard release vetoes

1. In vitro receptor activity or microbial metabolite ≠ demonstrated human therapeutic outcome.
2. Animal anticancer or longevity experiments ≠ cancer or longevity treatments.
3. Cohort association ≠ personal effect; abundance ≠ gene presence/expression/flux.
4. Predictive model performance ≠ benefit from model-driven intervention.
5. Review article ≠ RCT or age-universal nutrition prescription.
6. Processed/pasteurized strain-specific preparation ≠ source taxon presence.
7. Source existence/DOI ≠ scientific content approval; rights and identity checks separate.
8. Unresolved identity/retracted source blocks claim promotion; represent helpful research topics separately.
9. Clinical oncology, pregnancy, chronic disease treatment, supplements, hormone/drug dose or protein restriction for healthspan require applicable specialist/legal/clinical authority; unsupported personal advice abstains.
10. Optimization respects multiple goals, intake adequacy, risks, personal autonomy and source qualifications. No manipulated health experiments or forced washouts.

## C7. Codex development slices (incremental, no duplicate roadmap)

| Slice | Precise implementation and reuse | Objective completion proof | Classification |
|---|---|---|---|
| SCI-16-01 | Append canonical study IDs, DOI/PMID/PMCID resolution, preprint/publisher corrections/version lineage | All 13 exact linked papers resolve to canonical records; unresolved 14/15 not misidentified; 16 primary recovered | P0 architecture / source QA |
| SCI-16-02 | Add scoped `StudyResult` with comparator, primary/secondary, null/negative, adverse and conflicts | 2022 null weight-loss outcome remains searchable beside 2024 ZOE positive endpoints | v0.7 Explorer |
| SCI-16-03 | Add formulation-/viability-/strain-specific intervention identity | MucT pasteurized study cannot be matched from stool detection or live product generic | v0.7 |
| SCI-16-04 | Add molecular isomer/compartment-aware bile acid graph links | BSH, isoalloLCA, HSDH/AR, BA–MCY/FXR use same reaction engine, no alias collapse | v0.7 scientific core |
| SCI-16-05 | Link prediction validation to separate human intervention outcomes | Glucose model can be described as predictive with 2022 null weight-loss superiority preserved | v0.7 |
| SCI-16-06 | Add model-status/observability for metabolic reconstruction and animal model research | SCFA modeled flux never becomes measured user concentration or human treatment effect | Advanced / research |
| SCI-16-07 | Connect age, life-stage, protein/energy needs, athletic goals and protected competing outcomes | Protein restriction research is educational; no unsafe low-protein healthspan action | Existing CDPI / v0.7 |
| SCI-16-08 | Living evidence conflict/correction/withdrawal and followed-topic impact | Publisher correction and retraction invalidate exact affected claims; unaffected study results remain | Existing source lifecycle |
| SCI-16-09 | Present ten compact science topic cards, progressive study result tables, safety-aware no-action cases | Mobile/desktop show outcome, source type and what is *not* known; no added permanent nav | v0.7 UX |
| SCI-16-10 | Cross-domain held-out tests and receipt registry; maintain source/data rights | 16 independent scenarios, false causal/clinical recommendations = 0 in gate fixtures | Release acceptance |

No new owner-review checkpoint; bounded build-first under current authorization. Actual public activation remains conditioned on applicable science, legal/privacy and platform controls.

## C8. New mandatory acceptance scenarios (BIO-EXP-50 to BIO-EXP-67)

| ID | Held-out scenario / pass condition |
|---|---|
| **BIO-EXP-50** | All 16 supplied items retained and status-qualified, including 14/15 unresolved rather than falsified references. |
| **BIO-EXP-51** | Pasteurized MucT randomized trial cannot be applied to generic viable *Akkermansia*, any strain detection or unauthenticated supplement. |
| **BIO-EXP-52** | Protein restriction review does not override muscle goals, older-age adequacy, pregnancy and clinician restrictions. |
| **BIO-EXP-53** | Microbial HSDH/isomer-specific bile-acid–AR effect remains preclinical; no patient antitumor or antiandrogen instruction. |
| **BIO-EXP-54** | Aging host-microbe model in mice does not become a human age clock or personal metabolic decline estimate. |
| **BIO-EXP-55** | 2024 ZOE METHOD study models entire intervention and separate endpoint-specific results, rather than assigning all benefit to microbiome features. |
| **BIO-EXP-56** | SCFA model flux prediction is labelled as simulation and stays separate from measured concentration, sample and clinical status. |
| **BIO-EXP-57** | Urolithin A community fermentation cannot assert causal production from any single correlated taxon or user's detected organism. |
| **BIO-EXP-58** | The Personal Diet Study's null superiority for primary weight loss is preserved; any summary claiming all personalized diets outperform standard care fails. |
| **BIO-EXP-59** | Centenarian bile acid biosynthesis displays strain-specific chemistry and enrichment without promised lifespan effects. |
| **BIO-EXP-60** | Diet/microbe/cardiometabolic cohort findings are shown as associations with covariate/sample limits, not personal diagnoses. |
| **BIO-EXP-61** | PREDICT 1 postprandial outcome model keeps fasting vs postprandial variables and publisher correction traceability. |
| **BIO-EXP-62** | 2015 glucose-prediction performance may be shown only with its own validated scope; no autonomous deployment/generalized Bloom prediction. |
| **BIO-EXP-63** | GLP-1 study mentioned historically cannot be published under an unverified paper ID, organism or hormone intervention. |
| **BIO-EXP-64** | MR preprint identity remains qualified and method limits prevent claims of improving intelligence through gut microbes. |
| **BIO-EXP-65** | Host BA–MCY/FXR interaction has correct host-enzyme identity, intestinal compartment and mouse-vs-human evidence boundary. |
| **BIO-EXP-66** | Given same outcome but one positive, one null trial in different populations/comparators, both remain visible and are not numerically combined without a sound synthesis. |
| **BIO-EXP-67** | Correct/remove a study, source, outcome or public permission: dependent claims/actions retract while unaffected claims remain; two accounts and offline research fallback remain isolated. |

**Additional stress tests:** dissimilar study endpoints; fabricated RCT claim; duplicate DOI and preprint/journal linkage; user has only genus-level taxon; intermittent protein log; mixed clinical and research-oncology endpoints; category-specific licensing denial; study with only animal results; partial lab assay mismatch; stale model-version and confidence-calibration failure.

## C9. Required reviewer decisions and acceptance evidence

**Chief Architect:** reconcile SCI-16-01–10 into existing V06-LIVE-EXT, LIVE-UPD, V06-12/13, Food #12 and Response #15; identify verified current code vs newly proposed; preserve v0.6 Core mainline.

**Science & Biology:** verify each outcome-specific evidence item and direction, taxon/strain/metabolite identities, individual applicability and cause/effect boundaries. **ML:** validate predictive-model training/holdout/calibration, transportability and simulated-vs-measured boundaries. **Integrations & Data:** source identity/rights/licensing, annotations, DOI corrections, assay/units and provenance. **Security & Privacy:** avoid unapproved cross-user health model training or external sensitive queries, revoke dependent outputs. **Legal/Clinical:** intended-use, oncology and supplement claims; licensed interventions. **UX/User Testing:** one useful research finding, no fabricated action; interpretation clear at 320px and wide layout. **Codex:** make bounded code and fixture changes, preserve all existing behavior and produce exact SHA, unit, DB, UI and denial receipts.

Clinical release requires independent approvals where applicable. Development and isolated scientific tests do not require serial owner sign-offs.

## C10. What this amendment does not establish

- This is a source-verification and scientific requirements review; it does not claim full extraction of every article's numerical outcomes or adverse events. A human evidence reviewer must approve exact claim statements before production.
- No user's genetic/metabolomic/microbiome results were used for these study interpretations.
- A DOI link and abstract can populate **pending** source metadata, not production-verified clinical benefit.
- No generalized automated enzyme optimization, cancer-prevention treatment, microbiome modification for cognition, or high-protein restriction for life extension is approved here.
- No additional parallel platform, graph, research crawler, consent or action engine is authorized.

## C11. Primary source and verification register

The companion CSV is the authoritative source-by-source status table for this amendment. Key primary links: https://doi.org/10.1016/j.cmet.2026.10.016 ; https://doi.org/10.1038/s41591-026-04394-7 ; https://doi.org/10.1016/j.cpblue.2026.100079 ; https://doi.org/10.1016/j.cell.2025.02.029 ; https://doi.org/10.1038/s41564-025-01959-z ; https://doi.org/10.1038/s41591-024-02951-6 ; https://doi.org/10.1038/s41564-024-01728-4 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC10873453/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC9520362/ ; https://doi.org/10.1038/s41586-021-03832-5 ; https://doi.org/10.1038/s41591-020-01183-8 ; https://doi.org/10.1038/s41591-020-0934-0 ; https://doi.org/10.1016/j.cell.2015.11.001 ; unresolved GLP-1 paper; provisional MR preprint https://doi.org/10.1101/2023.05.11.23289760 ; confirmed BA–MCY/FXR primary https://doi.org/10.1038/s41586-024-08379-9 .

**Final specialist disposition:** **APPROVE WITH TARGETED REVISION FOR ARCHITECT RECONCILIATION.** The architecture can generalize across these examples *if* the additional result/identity/model/evidence gates are implemented and tested. Publication of novel scientific content and person-specific interventions remains separately governed.