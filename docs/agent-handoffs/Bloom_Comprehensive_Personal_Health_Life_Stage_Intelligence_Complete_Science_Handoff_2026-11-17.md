# Bloom — Comprehensive Personal Health & Life-Stage Intelligence
## Complete owner directive + Science & Biology integration review

**Version:** 1.0 | **Date:** November 17, 2026 | **Owner source:** Original consolidated directive provided in this conversation | **Scientific review:** BIO-CPHLS-20261117-R1

**Document preservation:** Part A reproduces the full owner-submitted 19-section handoff, including its requirements and acceptance cases, without scientific edits; Part B is an explicitly separate assessment and implementation revision. Only Part B includes added research, opinions and architecture inspection. The Architect remains responsible for reconciliation and activation decisions.

---

# PART A — OWNER HANDOFF (PRESERVED SOURCE)

Bloom — Comprehensive Personal Health & Life-Stage Intelligence

Consolidated Chief Architect Requirements Handoff

Date: November 17, 2026
Status: Owner-proposed requirements, pending Chief Architect reconciliation
Implementation: Codex following Architect reconciliation
Scope: Women’s Health, Men’s Health, Medications & Supplements, Preventive Care, Sleep & Mental Wellbeing, Musculoskeletal & Bone Health, Cardiometabolic Health

⸻

1. Executive Product Directive

Bloom’s long-term objective is to become a comprehensive, personalized biological health and wellness platform.

Nutrition, genetics, microbiome, bloodwork and exercise are foundational, but they do not independently capture every major influence on health.

Bloom must account for important aspects of an individual’s physiology, life stage, treatments, symptoms, functioning and preventive health.

The objective is not to develop separate applications for every medical specialty.

Instead, Bloom should provide:

1. A unified personal health context.
2. Optional, relevant domain-specific experiences.
3. Low-friction recording of important information.
4. Longitudinal analysis of observations.
5. Scientifically qualified cross-domain interpretation.
6. Personalized, evidence-supported opportunities.
7. Appropriate life-stage and treatment context.
8. Accessible, comprehensive scientific education.
9. Appointment-ready information summaries.
10. User-controlled privacy and data sharing.

Governing principle:

Bloom should understand the person as a whole, not treat nutrition, hormones, mental wellbeing, medications and laboratory measurements as unrelated categories.

⸻

2. Scope and Existing Architecture

This handoff extends existing approved architecture.

The Chief Architect must reconcile it against:

* The current v0.6 Core and Advanced roadmap.
* Existing Women’s Health specialist requirements, where available.
* Adaptive Health Guidance and natural-life learning.
* Cross-Domain Priority Intelligence.
* Response Intelligence.
* Scientific evidence governance.
* Canonical source, consent and revision models.
* Existing Profile and health-context records.
* Food, Activity, Symptoms, Biology, Progress and Athlete.
* Existing medication, supplement and regimen records.
* The Intelligent Minimal-Input and Progressive Personal Estimation handoff.
* The canonical Bloom visual system and approved design references.

Existing verified implementations must not be rebuilt unnecessarily.

2.1 Delivery classification

Capability	Classification	Primary integration
Women’s reproductive health	Existing plan to reconcile and complete	Biology, Profile, Progress
Men’s hormonal and reproductive health	Proposed new optional experience	Biology, Profile, Bloodwork
Medication and supplement intelligence	Complete and expand existing work	Profile, Food, Biology
Preventive health and screening	Proposed lightweight capability	Today, Profile, Progress
Sleep and mental wellbeing	Expand existing sleep/recovery/check-ins	Today, Progress, Athlete
Musculoskeletal and bone health	Proposed contextual expansion	Activity, Symptoms, Biology
Cardiometabolic and chronic-condition context	Complete existing cross-domain work	Bloodwork, Biology, Progress

No assumption is made that a listed feature is currently unimplemented. Codex must verify existing source functionality before assigning development work.

⸻

3. Shared Personal Health Context

3.1 Architecture

Introduce or extend a unified personal health context through existing canonical storage and context-resolution services.

It should support relevant information about:

* Health goals and priorities.
* Relevant biological and reproductive context.
* Diagnosed medical conditions.
* Medications and supplements.
* Relevant surgical history.
* Current symptoms.
* Functional limitations.
* Important family health history.
* Relevant lifestyle factors.
* Screening and preventive-care history.
* Personal health preferences.
* Explicit user corrections and exclusions.

Do not create an unrestricted health-profile questionnaire.

Information should be collected progressively and only when useful.

3.2 Context-data structure

The following conceptual structure illustrates required semantics, not a mandatory new table.

type PersonalHealthContextEntry = {
  id: string;
  domain: string;
  conceptId: string;
  status:
    | "reported"
    | "source-confirmed"
    | "uncertain"
    | "historical"
    | "resolved"
    | "unknown";
  effectiveFrom?: string;
  effectiveTo?: string;
  recordedAt: string;
  sourceIds: string[];
  sourceRevisions: string[];
  userConfirmed: boolean;
  applicablePurposes: string[];
  sensitivity: "standard-health" | "sensitive-health";
  revision: string;
};

Individual clinical concepts require more precise typed contracts rather than arbitrary text.

Preserve dates, units, provenance, uncertainty and source revisions.

User-reported conditions must not silently become independently verified diagnoses.

3.3 Reuse across the application

A confirmed relevant fact should not need to be entered again in every domain.

Examples:

* A known medication can inform an eligible nutrition safety check.
* A recorded menstrual history can provide context for iron-status discussion.
* A verified activity restriction can prevent inappropriate exercise suggestions.
* Relevant pregnancy context can affect nutrition-guidance eligibility.
* Recorded symptoms can inform a discussion of sleep, training and recovery.

Cross-domain reuse must be purpose-limited and supported by authorized context.

Sensitive health details should not automatically appear on Today merely because they are available.

⸻

4. Women’s Hormonal & Reproductive Health

4.1 Product objective

Deliver a private, optional experience supporting reproductive life stages, symptoms, relevant treatments and associated wellbeing.

Reuse the existing Women’s Health plan as the primary feature specification. Preserve its accepted scientific, functional and privacy decisions.

This section provides integration and minimum-coverage expectations, not a replacement for a source handoff that the Architect must review directly.

4.2 Core functionality

Support optional recording of:

* Menstrual periods, dates and relevant bleeding characteristics.
* Menstrual symptoms.
* Cycle variability.
* Pregnancy status when volunteered.
* Postpartum and breastfeeding/lactation context.
* Perimenopause and menopause context.
* Hormonal contraceptive use.
* Hormone treatment.
* Relevant gynecological procedures.
* Sexual wellbeing and libido.
* Sleep, energy, mood and relevant physical symptoms.
* Relevant laboratory observations.

User reporting and externally confirmed medical context must remain distinguishable.

4.3 Life-stage intelligence

Support relevant contexts such as:

* Menstruating.
* Irregular cycles.
* Perimenopause.
* Postmenopause.
* Pregnancy.
* Postpartum.
* Lactation.
* Surgical menopause.
* Hormonal treatment.
* Uncertain or unreported stage.

These should not be inferred solely from age.

Menopause-transition interpretation must account for medication and treatment effects where applicable.

A tracking application must not claim reliable conception prevention, fertility determination or hormonal diagnosis from weak cycle estimates.

4.4 Cross-domain intelligence

Potential evidence-supported connections include:

* Menstrual bleeding and iron-status context.
* Pregnancy/lactation and nutritional reference applicability.
* Menopause and bone-health context.
* Recorded symptoms and sleep.
* Hormonal treatment and relevant laboratory interpretation.
* Menstrual symptoms and exercise tolerance.
* Life-stage changes and longitudinal wellbeing.

Avoid attributing symptoms or laboratory changes to hormones without sufficient evidence.

4.5 Safety and experience

* Optional sensitive-data recording.
* No requirement to enter reproductive details to use Bloom.
* No hidden fertility classification.
* No unsupported hormonal optimization.
* No automatic medication changes.
* No unvalidated diagnosis from symptom patterns.
* Important symptom escalation must follow reviewed clinical guidance.
* Private information sharing requires explicit permission.

4.6 Key acceptance criteria

WH-01: User can optionally track menstrual events without mandatory additional questions.

WH-02: Cycle history distinguishes observed and estimated dates.

WH-03: Hormonal contraception does not produce unsupported cycle- or ovulation-based claims.

WH-04: Perimenopause cannot be assigned solely from age or a single hormone measurement.

WH-05: Pregnancy and lactation context appropriately constrain eligible nutrition outputs.

WH-06: Relevant laboratory and symptom trends can be reviewed together without implying proven causation.

WH-07: Full history remains correct after correction, deletion or treatment-context changes.

WH-08: Sensitive information remains private and optional in everyday summaries.

WH-09: Existing Women’s Health requirements and specialist tests remain authoritative after reconciliation.

⸻

5. Men’s Hormonal & Reproductive Health

5.1 Product objective

Develop an equivalent optional personal-health experience for male hormonal, reproductive and sexual wellbeing.

The objective is to understand relevant health information, not to promote testosterone supplementation or hormone optimization as an end in itself.

5.2 Core capabilities

Support tracking of:

* Relevant testosterone measurements.
* Relevant SHBG and free-testosterone measurements or calculations when properly supported.
* LH, FSH, estradiol and prolactin when available and clinically applicable.
* Hormonal treatment history.
* Testosterone replacement therapy, where reported.
* Other hormone-affecting medications.
* Libido and sexual wellbeing.
* Erectile-function concerns.
* Fertility-related concerns.
* Energy, mood and sleep symptoms.
* Relevant urinary symptoms.
* Relevant PSA and other laboratory results.
* Treatment timing and reported adverse effects.

Do not automatically infer hormone deficiency from a recorded symptom or an isolated laboratory result.

5.3 Hormone treatment context

Where a user records testosterone therapy, preserve:

* Medication identity.
* Formulation.
* Prescribed dose, if provided.
* Administration frequency.
* Actual administrations where recorded.
* Route.
* Start and stop dates.
* Relevant laboratory collection times.
* Timing relative to medication administration.
* Clinician-supplied monitoring instructions where available.

Dose, concentration, formulation, route and timing must remain distinct.

Do not assume an injection was administered because it was scheduled.

5.4 Laboratory interpretation

Interpretation must consider:

* Appropriate reference context.
* Laboratory method and assay identity.
* Time of collection.
* Treatment timing.
* Applicable age and clinical context.
* Relevant medication use.
* Symptom history.
* Related measured markers.

Do not assign a diagnosis of hypogonadism or recommend hormone dosing from an automated trend.

PSA, testosterone and hematocrit results should retain their own distinct clinical meanings; they are not interchangeable hormone-health scores.

5.5 Fertility and sexual wellbeing

Support private records and high-quality educational information.

Do not infer infertility, reproductive capability or sexual dysfunction from weak indirect data.

Hormone treatment may have important reproductive implications that deserve contextual education, but Bloom must not independently recommend stopping or changing treatment.

5.6 Acceptance criteria

MH-01: Relevant hormone laboratory measurements retain units, assay context, dates and source history.

MH-02: Treatment schedules and confirmed administrations are separated.

MH-03: Laboratory collection timing can be associated with recorded treatment timing when available.

MH-04: Missing timing or method context prevents unsupported conclusions.

MH-05: Sexual wellbeing information is optional and private.

MH-06: The application does not propose autonomous hormone dose changes.

MH-07: PSA interpretation does not conflate screening context, symptoms and unrelated hormone measurements.

MH-08: Fertility-related interpretation preserves appropriate uncertainty.

MH-09: Existing laboratory and medication systems are reused.

⸻

6. Medication & Supplement Intelligence

6.1 Product objective

Bloom must understand the medications and supplements a person actually uses, including timing, forms and relevant changes.

This information is essential to the safe interpretation of nutrition, bloodwork, symptoms and health history.

6.2 Required distinctions

Keep these events separate:

* Prescribed.
* Recommended.
* Planned.
* Scheduled.
* Actually taken.
* Missed.
* Stopped.
* Changed.
* Unknown adherence.

A daily medication schedule is not evidence of actual daily consumption.

6.3 Medication records

Support:

* Name and normalized identity where available.
* Strength and dosage form.
* Dose and units.
* Route.
* Frequency.
* Start/stop dates.
* Treatment indication when provided.
* Prescriber instructions when supplied.
* Actual administrations when confirmed.
* Optional side effects.
* Historical medication changes.
* Original source and user corrections.

Avoid requiring a complete medication profile before users can access ordinary Bloom features.

6.4 Supplement records

Support:

* Product and formulation.
* Ingredient identities.
* Label source.
* Active compound forms.
* Elemental versus compound quantities.
* Dose and frequency.
* Actual reported consumption.
* Changes over time.
* Known interaction or safety context.
* Unavailable ingredient coverage.

Do not silently equate a label’s compound mass with elemental nutrient mass.

Do not infer exact supplementation from a product name when formulations are ambiguous.

6.5 Nutrient accounting

Only appropriately supported actual intake contributes to consumed nutrient totals.

Avoid double-counting:

* Foods and supplements.
* Combined products and their ingredients.
* Scheduled and confirmed supplement doses.
* Duplicate imported records.

When nutrient composition is unavailable, preserve unknown rather than zero.

Medication exposure is not itself a nutrient contribution unless a valid relevant calculation is established.

6.6 Cross-domain intelligence

Enable evidence-supported context for:

* Medication effects relevant to nutrition or laboratory interpretation.
* Possible supplement contribution to total nutrient intake.
* Regimen changes and recorded symptoms.
* Treatment changes and subsequent observed laboratory measurements.
* Relevant adverse effects and treatment considerations.

Do not infer individual drug efficacy or causality from temporal associations alone.

Do not automatically recommend medication initiation, withdrawal, dose changes or substitutions.

6.7 Safety

Medication interaction and contraindication claims require reviewed, licensed or otherwise authorized references appropriate to the actual formulation and context.

If an interaction database is incomplete, Bloom must not claim that a regimen is interaction-free.

6.8 Acceptance criteria

MED-01: User can add or correct a regimen quickly.

MED-02: Actual administrations remain distinct from scheduled doses.

MED-03: Supplement ingredient forms and units are correctly represented.

MED-04: Unknown label nutrients are not counted as zero.

MED-05: A confirmed consumed supplement updates applicable nutrition totals once.

MED-06: Duplicate sources cannot inflate recorded intake.

MED-07: Treatment changes appear in relevant longitudinal context.

MED-08: Bloom does not autonomously alter treatment.

MED-09: An unavailable interaction source produces appropriately limited claims.

MED-10: Deletion and correction invalidate dependent interpretations.

⸻

7. Preventive Health & Screening

7.1 Product objective

Provide a lightweight, personalized preventive-health record that helps users understand and organize relevant care.

This should not become a medical appointment-booking system or autonomous clinical screening service.

7.2 Minimum capabilities

Support:

* Preventive-care history.
* Screening records.
* Vaccination history where provided.
* Relevant dates.
* Clinician-recommended monitoring.
* Follow-up appointments.
* Optional reminders.
* Important questions for upcoming appointments.
* Exportable care summaries.

Use source-specific records and distinguish completed, scheduled, recommended and unknown states.

7.3 Personalized applicability

Potentially relevant inputs:

* Age.
* Jurisdiction.
* Relevant anatomy.
* Medical history.
* Family history.
* Prior results.
* Treatment context.
* Immunization history.
* Relevant risk information.

Use appropriate current Canadian and provincial evidence sources.

Recommendations must distinguish general population guidance from clinician-directed monitoring.

Do not treat every preventive recommendation as applicable to every individual.

7.4 Safety and scope

Avoid:

* Automated diagnostic screening.
* Autonomous test ordering.
* Unvalidated risk scores.
* Unsupported screening frequency recommendations.
* Overly aggressive testing.
* Automatic declaration that a person is overdue without sufficient history.

Unknown screening history is not equivalent to a missed screening.

7.5 Acceptance criteria

PREV-01: User can record a completed screening or vaccination and its date.

PREV-02: Relevant Canadian reference guidance is versioned and attributed.

PREV-03: Eligibility uses supported context rather than age alone when additional factors matter.

PREV-04: Unknown history does not become an overdue diagnosis.

PREV-05: The user can create optional reminders without constant notifications.

PREV-06: Clinician-specific instructions remain distinguishable from population recommendations.

PREV-07: A concise appointment summary can include selected relevant records with explicit user control.

⸻

8. Sleep, Stress & Mental Wellbeing

8.1 Product objective

Integrate everyday sleep, stress, mood and wellbeing into Bloom’s existing activity, recovery and biological context.

Do not develop a separate psychological therapy application.

8.2 Core tracking

Support optional recording of:

* Sleep duration.
* Sleep timing.
* Perceived sleep quality.
* Fatigue.
* Stress.
* General mood.
* Energy.
* Relevant recovery symptoms.
* User-noted sleep disruptions.
* Relevant medications or behaviors where volunteered.

The everyday interface should favor quick check-ins rather than detailed questionnaires.

8.3 Connected data

Where authorized, use appropriate Apple Health sleep and related activity data.

Distinguish:

* Reported sleep duration.
* Wearable-estimated sleep.
* Time in bed.
* Sleep-stage estimates.
* Subjective sleep quality.

Do not describe wearable sleep stages as definitive clinical sleep measurements.

8.4 Personal patterns

Bloom may learn:

* Typical sleep schedule.
* Variation across weekdays and weekends.
* Personal fatigue patterns.
* Repeated stress and recovery observations.
* Associations with exercise or symptom history.

Interpretations must consider incomplete logs and confounding factors.

Do not assume a missing mood check-in indicates good mental health.

8.5 Sensitive mental-health safeguards

* Optional tracking.
* Strong privacy controls.
* No unsolicited mental-health diagnosis.
* No unsupported depression or anxiety classification from passive signals.
* No automatic interpretation of ordinary sadness as a disorder.
* Concerning direct disclosures should follow a reviewed, proportionate support/escalation policy.
* No hidden behavioral manipulation.

8.6 Acceptance criteria

SLEEP-01: User can enter sleep and wellbeing information with minimal effort.

SLEEP-02: Wearable and manual records reconcile without duplication.

SLEEP-03: Subjective and device-estimated sleep remain distinct.

SLEEP-04: No unsupported diagnosis is generated from sleep or mood patterns.

SLEEP-05: Relevant trends can inform qualified recovery discussions.

SLEEP-06: Sensitive observations are not prominently displayed without appropriate user control.

SLEEP-07: Partial histories remain usable without false precision.

⸻

9. Musculoskeletal, Mobility & Bone Health

9.1 Product objective

Support understanding and tracking of physical function, pain, stiffness, mobility, injury history and relevant bone-health information.

This capability should integrate with Activity, Athlete, symptoms, nutrition and hormonal life stages.

9.2 Core records

Support:

* Pain location.
* Pain severity when provided.
* Stiffness.
* Morning stiffness duration when relevant.
* Functional limitations.
* Activity-related symptoms.
* Injury history.
* Physical therapy or rehabilitation context.
* Mobility observations.
* Relevant imaging or bone-density results.
* Clinician-directed restrictions.
* Changes over time.

Keep recording lightweight. Detailed assessments are optional.

9.3 Anatomical context

Provide a simple body-region selector when it improves usability.

Use precise descriptive body regions and optional free text.

Avoid presenting a graphical pain map as an anatomical diagnosis.

9.4 Bone-health context

Support appropriately sourced:

* DXA measurements.
* Reported T-scores and Z-scores.
* Measurement sites.
* Collection dates.
* Clinical interpretation supplied by the report.
* Relevant fracture history.
* Bone-related treatment context.

Do not treat a consumer smart-scale bone-mass estimate as interchangeable with clinical bone-density testing.

Age, sex, menopausal status and other factors may affect interpretation.

Use clinical model outputs only when inputs, jurisdiction, eligibility and validation requirements are satisfied.

9.5 Cross-domain integration

Potential qualified connections include:

* Bone health and reproductive life stage.
* Activity patterns and musculoskeletal symptoms.
* Recovery and reported fatigue.
* Nutrition and bone-health context.
* Relevant medications.
* Physical functioning over time.

Temporal associations must not be presented as diagnoses or individually proven causes.

9.6 Acceptance criteria

MSK-01: User can quickly record pain, stiffness and location.

MSK-02: Symptoms retain timing and optional functional impact.

MSK-03: Physical restrictions can constrain eligible activity suggestions.

MSK-04: DXA and consumer bone estimates remain distinct.

MSK-05: Historical imaging results preserve original site, unit and source context.

MSK-06: Recorded symptoms do not automatically establish a diagnosis.

MSK-07: Corrections and deletions update dependent context.

MSK-08: Clinically important symptom patterns follow reviewed escalation rules rather than generic wellness advice.

⸻

10. Cardiometabolic & Chronic-Condition Intelligence

10.1 Product objective

Strengthen Bloom’s ability to interpret relevant metabolic and cardiovascular information together rather than as unrelated measurements.

This is primarily an integration and completion requirement for existing Biology, Bloodwork and Response Intelligence work.

10.2 Relevant domains

Include appropriately supported context involving:

* Blood pressure.
* Lipid markers.
* Glucose and glycaemic markers.
* Body composition.
* Weight history.
* Relevant liver measurements.
* Kidney-related measurements.
* Relevant medical conditions.
* Medication use.
* Activity.
* Food intake.
* Sleep.
* Family history where applicable.

Not every user will have all these data sources.

10.3 Longitudinal intelligence

Bloom should identify relevant qualified trends across sources.

Examples:

* Changes in triglycerides alongside recorded dietary and activity changes.
* Blood pressure trends alongside actual measurement timing and treatment context.
* Weight changes and available glycaemic observations.
* Liver-related laboratory results alongside recorded lifestyle context.
* Relevant lipid markers considered together when clinically appropriate.

Avoid interpreting a single measurement as proof of disease improvement or deterioration.

10.4 Clinical risk models

Do not invent Bloom-specific risk scores where established validated models are required.

Use externally validated models only when:

* Appropriate rights exist.
* The target population is applicable.
* Necessary inputs are available.
* Units and collection context are reliable.
* Output meaning is accurately represented.
* Performance and clinical limits are understood.

Missing data must produce appropriate abstention or limited interpretation.

10.5 Competing health goals

Improvements in one metric must not automatically be treated as overall health success.

For example, a dietary change associated with improved lipid results may still affect protein adequacy, energy intake, training or other user goals.

Preserve existing Cross-Domain Priority Intelligence and protected-goal requirements.

10.6 Acceptance criteria

CARD-01: Blood pressure and laboratory observations retain measurement source, date, unit and relevant context.

CARD-02: Cross-marker interpretation uses reviewed evidence and applicability.

CARD-03: User-recorded changes may provide context without proving causation.

CARD-04: Missing laboratory data do not produce fabricated normal values.

CARD-05: Conflicting goals remain visible in action selection.

CARD-06: A source correction invalidates dependent interpretations.

CARD-07: Personal clinical risk calculations abstain when required inputs or validated methods are unavailable.

CARD-08: The system does not duplicate existing Bloodwork and Response Intelligence engines.

⸻

11. Cross-Domain Personal Health Intelligence

This section is essential.

The seven areas must not become isolated tracking tools.

11.1 Shared chronology

Relevant observations should contribute to an account-private, source-faithful longitudinal history when the user has authorized that purpose.

Support:

* Events and observations.
* Actual event time versus entry time.
* Treatment and supplement changes.
* Symptoms.
* Activity changes.
* Dietary changes.
* Laboratory measurements.
* Health-context changes.
* Reported functional outcomes.

Respect differences between planned events and actual observed events.

11.2 Relationship discovery

Bloom may identify candidate relationships involving several health domains.

Examples:

* A medication change and subsequent symptom observations.
* Repeated sleep changes and recorded recovery.
* Hormonal life-stage context and measured biomarkers.
* Activity and musculoskeletal symptoms.
* Nutrient intake and relevant laboratory measurements.

These are observations or hypotheses unless stronger evidence supports a more specific conclusion.

11.3 Reuse existing intelligence

Extend:

* Existing observation context.
* Source dependency and invalidation.
* Cross-Domain Priority Intelligence.
* Response Intelligence.
* Personal calibration and estimation.
* Evidence registry.
* Approved action eligibility.
* Existing user feedback and choice history.

Do not create a separate ranking engine for each health domain.

11.4 Prioritized output

Today should generally display the most relevant eligible opportunities, not seven new health widgets.

For example, an individual may have several recorded health domains, but only one or two require immediate attention.

Others remain accessible through Biology, Progress and their relevant experiences.

Important qualifying exceptions can surface under reviewed safety rules.

⸻

12. Minimal-Input and Progressive Learning Requirements

These new capabilities inherit the existing intelligent minimal-input standard.

12.1 Reuse known information

Do not ask repeatedly for:

* Saved age/birth year.
* Relevant health history.
* Existing medication identity.
* Usual recorded doses.
* Confirmed life-stage context.
* Recurring symptom terminology.
* Previous activity limitations.
* Saved health preferences.

Use these only where currently applicable and authorized.

12.2 Learn personal defaults

Examples:

* Frequently recorded medication administration time.
* Typical supplement regimen.
* Repeated symptom descriptions.
* Usual sleep schedule.
* Common exercise restrictions.
* Frequently used appointment-summary content.

Defaults should simplify entry without pretending that expected events occurred.

A recurring medication reminder must not count as medication consumption.

12.3 Ask only valuable questions

When context is missing, Bloom should choose among:

1. Reuse existing information.
2. Obtain authorized source data.
3. Apply a defensible calculation.
4. Reuse a reliable personal default.
5. Ask one important question.
6. Preserve unknown.

No broad health-history questionnaire should be mandatory.

12.4 Limits of personal inference

Do not infer:

* Pregnancy from ordinary symptoms.
* Menopause from age alone.
* Testosterone deficiency from libido.
* Depression from low activity.
* Medication adherence from schedules.
* Chronic disease from an isolated biomarker.
* Bone density from consumer scale measurements.
* Diagnoses from pain patterns.

Qualitative pattern learning must remain distinguishable from medical diagnosis.

⸻

13. Unified User Experience

13.1 Design language

All new experiences inherit Bloom’s established premium design system.

Canonical reference: The approved Bloodwork/LDL editorial direction, existing Biology and Microbiome assets, shared design tokens and established mode identities.

Use:

* Editorial typography.
* Refined biological imagery.
* Tactile premium surfaces.
* Concise, prioritized explanations.
* Purposeful charts and timelines.
* Contextual visualization.
* Optional scientific depth.
* Responsive, device-specific composition.

Do not build generic hospital dashboards.

13.2 Navigation principles

Avoid adding seven new permanent top-level navigation entries.

Instead:

Today: Relevant prioritized insights, quick capture and optional reminders.

Biology: Hormonal, reproductive, metabolic, musculoskeletal and biological context.

Progress: Longitudinal trends, symptoms, measurements and relevant outcomes.

Food: Nutrition and supplement-intake relationships.

Athlete: Physical function, activity and recovery where relevant.

Profile/Health Context: Personal history, medications, care records and privacy preferences.

Explore: Comprehensive scientific education.

The Architect should validate the precise information architecture against current navigation rather than assume that every new domain needs its own route.

13.3 Domain-specific presentation

Women’s and Men’s Health should feel private and sophisticated rather than clinical.

Preventive Health should feel calm, organized and actionable.

Sleep and Wellbeing should emphasize approachable daily patterns.

Musculoskeletal Health should use intuitive anatomical information.

Cardiometabolic Health should prioritize trustworthy charts and concise interpretation.

The application must retain a consistent visual identity across all experiences.

13.4 Progressive education

Three information levels:

Default: Important information and useful action.

Expanded: Relevant history, relationships and reasons.

Deep: Mechanisms, clinical research, measurement provenance, competing evidence and limitations.

High-quality educational depth must remain available without overwhelming the ordinary user.

⸻

14. Security, Consent and Sensitive Data

These features introduce highly sensitive personal information.

14.1 Permission requirements

Provide purpose-appropriate user control over:

* Reproductive information.
* Sexual wellbeing.
* Mental wellbeing.
* Medication and treatment history.
* Sensitive diagnoses.
* Family medical history.
* Imported health records.
* Future professional sharing.
* Future research uses.

Do not presume that permission to store data implies permission for research, external AI processing or third-party disclosure.

14.2 Account isolation

All records, derived facts, calibration parameters, generated summaries and source associations must remain properly account-isolated.

14.3 Revocation and deletion

Correction or deletion must invalidate dependent derived information.

Consent revocation must prevent unauthorized future use.

Avoid retaining sensitive content in unscoped caches, logs or analytics.

14.4 User-visible discretion

Sensitive details should not appear in notifications, shared views or general dashboard summaries without appropriate user control.

14.5 Clinical safety

Preserve and extend the existing deterministic eligibility and contraindication framework.

No new domain may bypass reviewed science or safety gates simply by using AI-generated text.

⸻

15. Evidence and Scientific Governance

All person-specific interpretations must identify:

* Source observations.
* Evidence reference.
* Target population.
* Relevant outcome.
* Evidence strength.
* Applicability.
* Known limitations.
* Model or rule version.
* Uncertainty.
* Eligible action category.

Do not use plausible mechanisms alone to claim a personal treatment response.

Population associations, clinical recommendations and individual observations must remain distinct.

Source updates or withdrawn evidence must propagate to affected outputs.

⸻

16. Generalized Test Scenarios

The Architect should consolidate domain-specific tests with existing source, privacy and safety suites.

Minimum cross-domain scenarios:

XH-01: User has no reproductive information and receives ordinary safe nutrition guidance without being forced into a health questionnaire.

XH-02: Relevant menstrual-history context informs a qualified iron-status explanation without asserting a diagnosis.

XH-03: A reported testosterone regimen provides timing context for measured laboratory results without changing the medication plan.

XH-04: A scheduled supplement is not treated as consumed.

XH-05: A supplement with unknown elemental composition does not produce fabricated nutrient intake.

XH-06: A user records a screening already completed; the application does not continue labeling it overdue.

XH-07: An unknown screening history remains unknown.

XH-08: Wearable-estimated sleep and manually reported sleep remain distinguishable.

XH-09: Recorded low mood does not trigger unsupported psychiatric diagnosis.

XH-10: A reported musculoskeletal restriction prevents an incompatible activity suggestion.

XH-11: Consumer-scale bone information is not substituted for clinical DXA.

XH-12: A lipid improvement does not automatically override a competing nutrition or fitness goal.

XH-13: A source deletion withdraws downstream health interpretations.

XH-14: Account switching removes all private derived context from the previous account.

XH-15: User can access detailed science without reading it during a routine entry.

XH-16: Mobile and desktop offer intentionally different layouts with consistent information.

XH-17: Unknown or insufficient data produce truthful abstention rather than fabricated personal conclusions.

XH-18: Existing Food, Bloodwork, Biology, Microbiome, Activity and Progress functions remain intact.

XH-19: A user can correct a sensitive context entry and applicable recommendations update without corrupting original observations.

XH-20: Historical life-stage and treatment context is applied according to event dates, not simply the user’s current state.

⸻

17. Implementation Phasing

Phase 1 — Reconciliation and essential foundations

Priority: Existing v0.6 Core

Finish already-authorized work:

* Food and nutrition intelligence.
* Whole-panel Response Intelligence.
* Source provenance and corrections.
* Medication and supplement intake foundations.
* Low-friction activity/symptom capture.
* Core editorial UX.
* Existing health-context safety constraints.

Do not delay these to build extensive new health experiences.

Phase 2 — Table-stakes expansion

Priority: v0.7 planning, with bounded earlier work where already approved

Develop:

1. Women’s Health completion and cross-domain integration.
2. Men’s Hormonal & Reproductive Health.
3. Unified medication/supplement chronology.
4. Lightweight preventive-care records and reminders.
5. Expanded sleep and wellbeing observations.
6. Basic musculoskeletal context and bone-health records.
7. Improved cardiometabolic cross-domain presentation.

Use shared services and existing visual foundations.

Phase 3 — Advanced personal intelligence

Expand:

* Longitudinal context learning.
* Better cross-domain relationship discovery.
* Individually supported personal estimation.
* Refined life-stage applicability.
* Higher-quality personalized prioritization.
* More comprehensive evidence coverage.
* Useful clinician-ready summaries.

Each advanced capability remains conditional on scientifically valid data and methods.

Phase 4 — Advanced scientific models

Potential later work:

* Validated disease-specific risk models.
* More sophisticated hormonal-response modeling.
* Improved functional and recovery prediction.
* Advanced longitudinal outcome assessment.
* Mechanistic biological simulations.

These are not necessary for the basic usefulness of the new health domains.

⸻

18. Chief Architect Deliverables

The Architect should produce a concise reconciliation showing:

1. Existing roadmap IDs covering each requirement.
2. Implemented and verified functionality.
3. Missing functionality.
4. New data concepts genuinely required.
5. Existing components and services to reuse.
6. Specialist evidence work needed.
7. Privacy and clinical safety implications.
8. Proposed Codex implementation slices.
9. User-visible acceptance scenarios.
10. Dependencies and delivery priority.

The Architect must distinguish:

* Already approved.
* Already implemented.
* Engineering tested.
* Deployed.
* Independently accepted.
* Proposed new scope.

Do not classify a requirement as complete merely because it appears in an architectural document.

Do not create redundant engines, feature-specific source ledgers, excessive approval gates or a separate implementation queue.

⸻

19. Final Product Acceptance Standard

Bloom should be able to support a person whose relevant health context includes nutrition, exercise, sleep, medications, hormonal changes, symptoms, preventive care and laboratory measurements.

The user should be able to:

* Record relevant information with little effort.
* Access meaningful longitudinal history.
* Understand major personal health observations.
* Receive appropriately qualified recommendations.
* Understand relevant relationships across domains.
* Correct assumptions and records.
* Control sensitive information.
* Explore detailed science when interested.
* Prepare useful summaries for healthcare appointments.
* Benefit from progressively better personalization.

A feature does not satisfy this objective merely by adding another tracking screen.

Final governing directive:

Extend Bloom into a comprehensive personal health platform by connecting relevant life-stage, medication, preventive, functional and biological information through the existing intelligence architecture.

Build only the missing capabilities, preserve existing work, keep everyday interactions simple, and maintain scientifically rigorous interpretation throughout.

---

# PART B — SCIENCE & BIOLOGY SPECIALIST REVIEW AND IMPLEMENTATION REVISIONS

**Document ID:** BIO-CPHLS-20261117-R1  
**Date:** November 17, 2026  
**From:** Nutrition & Biology Specialist  
**To:** Chief Architect & Integration Lead; cc AI Intelligence & Personalization, Integrations & Data, Security & Privacy, Legal & Regulatory, UX/User Testing, Codex  
**Disposition:** **APPROVE SCIENTIFIC DIRECTION WITH BINDING IMPLEMENTATION AMENDMENTS**; source/architecture review only, not a clinical release, implementation verification, or authorization to activate medical features.  
**Priority:** P0 integration, provenance, consent, safety and life-stage applicability on affected paths; v0.6 existing Core; seven domain expansions largely v0.7; validated prediction research later.  
**Original owner directive:** Part A above, §§1–19, is preserved unchanged as the controlling baseline. The changes here add implementation specificity and do not silently override owner instructions. Resolve any actual conflict through Architect's existing requirements hierarchy.

## B1. Scientific decision and product outcomes

**Decision:** Bloom should be a *longitudinal, whole-person context and decision-support system* serving healthy longevity by supporting evidence-based prevention, functional capability, sustainable nutrition/activity and informed clinical conversations. It must not promise longer life, a numerical biological age, direct life-years gained, prevention of a particular disease, or individualized treatment effects without purpose-appropriate validation and authorization.

**Seven domains share a single reasoning substrate.** The product is not seven disconnected specialist dashboards. Each domain can register observations, constraints, education and candidate actions into existing account-scoped canonical services; one eligibility/safety layer checks actions, one priority layer selects useful next steps, and the user can inspect why.

Healthy lifespan requires *function as well as biomarkers*: mobility, strength, cognition, sensory function, mental well-being and supportive environments matter with ageing. The WHO's 2025 ICOPE second edition explicitly uses person-centred assessment across intrinsic-capacity domains. This is **an architectural reason to support function and quality of life**, not a license for Bloom to diagnose intrinsic-capacity loss. Reference: https://www.who.int/publications/i/item/9789240103726

### Non-negotiable distinctions

1. Age at event **versus current age**. An observation from 2022 must be interpreted with the user's status *then* and with the evidence version and applicable reference context.
2. Biological-relevance questions **versus gender identity or presentation**. Use anatomy, menstrual state, organ presence, treatment, pregnancy/lactation, lab assay and scope-specific reference sex variables where validated; don't guess anatomy from sex, gender, name or appearance. Do not force users to disclose sensitive details to use ordinary app features.
3. Recorded diagnosis **versus reported symptom**, clinical report conclusion **versus app inference**, medication planned **versus taken**, supplement label **versus confirmed intake**.
4. Valid guideline applicability **versus an age-based suggestion**. Screening may depend on jurisdiction, history, anatomy, risk and prior procedures; unknown status is not overdue.
5. Common effects supported by human evidence **versus personalized treatment response**. An observation can suggest follow-up without causal attribution.
6. Human-facing **clinical alert or screening recommendation** needs dedicated reviewed triage/eligibility and regulatory/legal scope; a general educational explanation does not qualify to issue an independent medical order.

## B2. Reconciliation with actual Bloom architecture

Read-only inspection of `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, November 17 working references (not a frozen deployment):

- `shared/wellness-context.ts` and `server/wellness-context.ts` already provide a versioned, account-owned, read-only wellness context with age group, pregnancy field, allergies, conditions, medications, goals, consent-purpose and conflicts/missingness. This is a **partial foundation**, not evidence of typed anatomy, dated reproductive context or clinical validation.
- `shared/wellness-actions.ts` contains reviewed action identifiers and source-scope/lifecycle controls. Extend, do not create a parallel recommendation engine.
- `shared/goal-guidance.ts` has existing general source references and protected-goal support; continue Food #12 and cross-domain priority work.
- `shared/scientific-contracts.ts` defines scientific claim classes and evidence audit mechanisms. Reuse for claim provenance and versioning.
- `docs/architecture/ADAPTIVE_HEALTH_GUIDANCE_ARCHITECT_RECONCILIATION_20261114.md` preserves no avoidable harm, goal protections, no manipulative experimentation, natural-life observation, and user agency.
- `docs/architecture/V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md` explicitly prioritizes safe usable Food/Today and whole-panel Response; advanced work is nonblocking.
- `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md` authorizes purpose-limited within-account learning, **not** cross-account population training without additional approval.
- `docs/operations/V06_DEPENDENCY_BACKLOG.md` establishes the November 15 build-first directive: Codex may implement/test approved code autonomously; public access/clinical/consent/production remain separate gates. Do not introduce a serial predevelopment-review treadmill.

**Architect action:** reconcile precise current SHA, implemented status, changed files, existing evidence receipts and deployment separately before claiming these requirements are already delivered. Avoid duplicate tables/engines where canonical models exist.

## B3. Unifying architecture — one context resolver, many eligible experiences

```text
Authorized source data, at known timestamps
  Profile | Food | Activity/Athlete | Labs | Symptoms | Sleep | Body/Imaging
  Regimens | Pregnancy/Menstrual | Preventive | Conditions/Procedures | Family history
                       ↓
       Canonical owned observations + revision/source dependencies
                       ↓
  Purpose-scoped, as-of-date context resolver [unknown/conflicting/stale]
                       ↓
    Applicability & safety/contraindication gates ← Evidence/model registry
                       ↓
  Domain interpreters: descriptive trends, eligibility, research context
                       ↓
      Shared cross-domain priority / choice eligibility
                       ↓
 Today | Food | Biology | Progress | Athlete | Explore | Appointment summary
                       ↓
   User review/correction/action history → source-aware re-evaluation
```

No domain obtains unrestricted access to *every* sensitive record simply because it is part of Bloom. Context projection must carry a purpose, authenticated account, event time, requested data classes, consent scope, and retained provenance. De-identified aggregate training does not automatically become authorized by this architecture.

### B3.1 Required typed semantics (extend existing models, not mandatory new database)

```ts
interface ContextFact {
  id: string;
  conceptCode: string;         // versioned terminology mapping; preserve original label
  conceptSystem: string;       // e.g. local reviewed code, SNOMED CT when licensed
  domain: string;
  value: unknown;              // typed domain-specific schema, never arbitrary generic inference
  status: 'reported'|'source-confirmed'|'uncertain'|'historical'|'resolved'|'unknown';
  actualOrPlanned: 'actual'|'planned'|'estimated'|'not-applicable';
  occurredAt?: string;         // true observation/event; ISO datetime and timezone when known
  effectiveFrom?: string;
  effectiveTo?: string;
  recordedAt: string;          // NEVER substitute for occurredAt
  sourceIds: string[];
  sourceRevisionIds: string[];
  method?: string;
  applicabilityContext?: string;
  certainty: 'confirmed-report'|'user-reported'|'estimated'|'unverified';
  sensitivity: 'standard-health'|'sensitive-health';
  permittedPurposes: string[];
  owningAccountId: string;
  revisionId: string;
}
interface ContextProjection {
  asOf: string;
  purpose: string;
  accountId: string;
  applicable: ContextFact[];
  historical: ContextFact[];
  missing: string[];
  conflicts: string[];
  sourceRevisions: string[];
  consentVersion: string;
}
```

Keep immutable originals, editable user-facing current state, audit-safe revisions, and derived projections. Use standardized clinical terminologies only when licensing and implementation semantics are validated. Never overwrite a source-reported label with an unverified coding crosswalk. Separate source time, entry time, and effective periods. Carry effective-at-event history rather than relying on the present profile. Consent revocation invalidates derived caches and materialized insights.

### B3.2 Applicability should be a typed, explainable decision

Inputs are *minimal and purpose-limited*, never one mandatory intimate health questionnaire:

- **Age**: age-at-event (date of birth/year/age band, uncertainty); pediatric gating when relevant. Birth year is insufficient for exact date-based eligibility if boundary matters.
- **Sex fields for a specified purpose**: user-entered sex assigned at birth, gender identity, and/or reference-sex variable required by a validated clinical equation, clearly distinguished. Ask only the field actually required; never overwrite a person's identity with a lab formula input.
- **Relevant anatomy/organ inventory**: only if volunteered or essential to a selected screening/reproductive feature (e.g. cervix present, breast/chest anatomy, prostate, uterus/ovaries), each with reported/unknown and dates/operative context; no automatic determination from identity.
- **Reproductive state**: menstrual pattern, pregnancy, postpartum, lactation, hormonal contraception, hormone therapy, surgical status, and uncertainty; stages may overlap (e.g. postpartum + lactation) rather than forcing a single label.
- **Medications/medical context**: indications and regimen schedule **not** confirmed adherence; clinically supplied restrictions where recorded.
- **Risk/territory**: province/country, family history, prior screening/results, smoking where volunteered, validated model inclusion/exclusion criteria, current guideline version.
- **Goal and preference**: active goals, food exclusions, user-hidden domains, user choices; no clinical inferences from preferences.

Return for each feature `eligible | potentially_relevant_need_one_fact | educational_only | not_applicable | restricted`, `why`, `evidenceId`, `missingOrConflicting`, `asOf`, and `disclosureLevel`. A missing fact may keep general education visible but must not yield unsafe personalized calculations.

### B3.3 Illustrative applicability matrix (hypothetical users, not advice)

| Situation | Experience shown / eligible | Must not infer |
|---|---|---|
| 25-year-old with no intimate information | General Food, sleep, activity, optional preventive overview | Menstruation, prostate, sexuality, pregnancy, life stage |
| 32-year-old with known pregnancy | Optional pregnancy/lactation-specific nutrition and safety; appropriate authorized care info | That any symptom proves fetal or maternal abnormality |
| 42-year-old on hormonal contraception with irregular bleeding | Symptom history, treatment context, optional discussion information | Menopause stage or ovulation from cycle length alone |
| 51-year-old with reported transition symptoms and dated cycle changes | Optional perimenopause context, sleep, bone/function education | Diagnosis from one FSH/estradiol result |
| 63-year-old with documented hysterectomy and cervix removed | Screening applicability resolves *indication of surgery*, prior high-grade disease, applicable local policy | Automatic universal cessation of cervical screening from surgery label alone |
| Trans man with a cervix and relevant history | Private, anatomy-specific cervical screening guidance if eligible and wanted | Exclusion from screening due to gender identifier |
| Cis man with prostate surgically removed | General sexual health and recorded care context | Routine prostate screening eligibility solely from male label |
| Adult using prescribed TRT | Hormone lab timing, actual vs scheduled administration, related monitoring context | Dose change or fertility status from a single result |
| 68-year-old, DXA report present | Source-qualified fracture/bone discussion and functional history | Clinical osteoporosis from a smart-scale bone mass number |
| 75-year-old with sleep/walking data | Function, recovery and prevention opportunities, optional education | A clinical falls/cognitive diagnosis from passive data |
| 40-year-old with no screening history | General age/region information, optional history question | Already overdue or never screened |

The examples deliberately avoid substituting sex/gender for anatomy or assumptions for recorded facts. Eligibility varies across evidence/jurisdiction; these are logic fixtures, not definitive screening schedules.

## B4. Cross-domain relationship graph — what should actually connect

Create **relationship specifications**, not disease-claim triggers. Each connection has entity types, valid direction, evidence class, necessary data, confounders, action eligibility, and a natural output surface. This is a *semantic layer over existing source/evidence graph*, not a second graph service.

| Cross-domain relationship | Required input/context | Potential user benefit | Critical scientific limitation / safeguard |
|---|---|---|---|
| Menstrual bleeding ↔ ferritin/CBC ↔ nutrition | Dated bleeding history, iron assays, intake coverage, supplements, clinical report ranges | Contextual iron-status education, appointment questions | Bleeding alone cannot diagnose iron deficiency or explain measured ferritin; lab/method and other causes |
| Pregnancy/lactation ↔ dietary requirements ↔ supplements | Voluntarily reported status/dates, exact formulations, intake coverage | Relevant food/supplement safety and nutritional context | No autonomous obstetric supplementation or treatment decisions; unknown status cannot be assumed negative |
| Perimenopause/menopause ↔ sleep/VMS ↔ function/bone | Menstrual/treatment history, symptoms, clinical DXA where available, activity | Helpful overview and symptom trends | No automatic stage diagnosis; clinical bone tests ≠ consumer scales |
| TRT ↔ administered dose ↔ testosterone/CBC/PSA ↔ fertility | Actual injection event, formulation/concentration, blood draw time, age/context | Accurate time-aligned record and clinician discussion | Planned dose ≠ taken dose; do not prescribe or infer treatment efficacy |
| Lipids/BP/glucose ↔ diet/activity/sleep/weight | Comparable source measurements, exposure history, confounders | Report-wide prioritized cardiometabolic context | Sparse quarterly labs cannot support individualized causal percentages |
| Sleep/fatigue ↔ exercise performance ↔ stress | Subjective and device-estimated sleep, dated workouts, medication/caffeine context | Repeated routine patterns with uncertainty | Wearable sleep stages not clinical PSG; sleep issue ≠ mood disorder |
| Pain/stiffness ↔ movement ↔ recovery ↔ nutrition | Symptoms, location/function, activity dates and restrictions | Safe activity alternatives and symptom tracking | No pain diagnosis; urgent patterns require reviewed escalation |
| Fracture risk ↔ life stage ↔ medications ↔ DXA | Age, fracture/falls/glucocorticoids, bone site/method, related conditions | Evidence-qualified clinician conversation | No risk score without validated territory/population inputs |
| Medications ↔ labs ↔ nutrients/side effects | Active/actual regimen, dates, interaction data coverage | Useful interpretation context and duplicate-ingredient checks | Incomplete interaction coverage ≠ 'safe'; never change treatment automatically |
| Symptoms ↔ condition history ↔ preventive follow-up | Source-confirmed condition vs reported symptoms, clinician instructions | Better appointment preparation and care history | Symptom correlation cannot establish disease |
| Renal function ↔ protein/supplement guidance | Clinician-confirmed restrictions, measured eGFR context, kidney history | Prevent harmful generalized high-protein/supplement suggestions | No unreviewed protein restriction or drug adjustment |
| Family history ↔ screening eligibility | Relationship/diagnosis/age at onset, jurisdiction, relevant anatomy, past screening | Appropriately qualified preventive education | Do not auto-reclassify family history without exact details |
| Gut symptoms ↔ fiber/food tolerance ↔ microbiome | Recorded intake/symptoms, microbiome assay type and report limits | Sustainable food substitutions, hypothesis prompts | Relative abundance ≠ clinical diagnosis or individual metabolic flux |
| Older-age function ↔ nutrition/activity ↔ sleep ↔ social needs | Voluntary strength/mobility and daily-function data | Healthy-years focus rather than one lab score | Do not infer cognition, frailty or disability from weak proxies |

### B4.1 Prioritization logic

1. Build a date- and purpose-correct context for each candidate; reject stale, incompatible or unauthorized input.
2. Apply safety vetoes **before scoring**: contraindications, allergies, pregnancy/medical risk, incompatible exercise restrictions, interactions with insufficient source coverage, protected nutrition/performance goals.
3. Identify opportunity class: ordinary wellness routine; reviewed guideline/education; clinician-discussion item; restricted clinical decision; unsupported research-only. Never promote by language-model rhetoric.
4. Consider evidence strength, data quality, clinical relevance only if reviewed, change reliability, recency, feasibility, expected benefit/harms, user choice, and whether already shown/dismissed.
5. Show one main safe action or no action, plus at most a few nonredundant alternatives. Urgent red flags are separate specifically reviewed clinical triage; no homemade urgency score.
6. Present recorded facts → relevance → constraints → possible choice → what is unknown, with deep scientific material on demand.

Use approved `shared/wellness-actions.ts`, Today priorities and Response #15; no seven independent recommenders. Ordinary check-ins must not become an engagement or notification-maximization objective.

## B5. Scientific applicability and evidence sources to curate

**Versioned source registry:** jurisdiction, publisher, document/version/date, target population, intervention/screening, exclusions, conflicting guidance, reference field requirements, review date, intended use, rights, and applicability tests. No medical guidance is hardcoded without a source and update process. Some Canadian Task Force guidelines are dated, archived, drafts or subject to provincial variation: do not confuse an archived draft with current final policy.

- **Canadian Task Force on Preventive Health Care — HISTORICAL GUIDELINES** (published guideline status/age/sex/topic index): https://canadiantaskforce.ca/guidelines/published-guidelines/ ; provincial screening authority required for territory-specific delivery. **Important 2026 governance update:** the former Task Force ended its mandate in March 2026 and Public Health Agency of Canada announced the new **National Advisory Committee on Preventive Health Services** on June 10, 2026. Therefore the old Task Force website is a historical guideline catalogue, **not an assumed live updating national authority**. Track PHAC/NACPHS replacement guidance and current provincial programs separately: https://www.canada.ca/en/public-health/news/2026/06/new-national-advisory-committee-to-support-preventive-health-care-in-canada.html .
- **Canadian Immunization Guide / NACI and provincial schedules**: https://www.canada.ca/en/public-health/services/publications/healthy-living/canadian-immunization-guide-part-1-key-immunization-information/page-13-recommended-immunization-schedules.html ; schedules and public funding are not identical.
- **International Menopause Society 2026 recommendations** / STRAW+10: https://www.imsociety.org/wp-content/uploads/2026/03/IMS-Recommendations-Full-Document.pdf ; treatment/cycle state affects staging and reference interpretation.
- **NICE menopause guidance**, useful corroboration with jurisdiction distinction: https://www.nice.org.uk/guidance/ng23 (2024 update; verify later revisions), especially the limits of FSH testing with contraceptives.
- **Osteoporosis Canada 2023 guidelines**: https://pmc.ncbi.nlm.nih.gov/articles/PMC10610956/ ; designed primarily for postmenopausal females and males aged 50+, with age/sex/risk factors and validated assessment, not consumer bone estimates.
- **AHA PREVENT equations**: https://professional.heart.org/en/guidelines-and-statements/prevent-calculator ; validated for U.S. adults 30–79 without known CVD. Canadian users require external applicability and calibration/risk-model review—do NOT silently apply U.S. estimates as Canadian guideline decisions.
- **2026 dyslipidemia guideline**: https://www.jacc.org/doi/10.1016/j.jacc.2025.11.016 ; population-specific management is clinician-facing, not blanket app prescribing.
- **Consumer sleep study and clinical limits**: https://pubmed.ncbi.nlm.nih.gov/39460013/ and https://pubmed.ncbi.nlm.nih.gov/41811282/ ; interpret consumer devices as estimates, not clinical PSG.
- **Canadian privacy OPC express consent for sensitive information**: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent/ ; provincial law/territory assessment is required, not PIPEDA-only assumption.
- **WHO ICOPE 2025**: https://www.who.int/publications/i/item/9789240103726 ; whole-person function and age-friendly health context.

Clinical guidelines are dynamic. This review verifies existence and scope of these sources, **not** independent approval of each prospective Bloom claim. Clinical relevance and any urgent/referral language require a narrower specialist review and legal intended-use assessment.

## B6. Domain-specific amendment decisions (keep owner IDs WH/MH/MED/PREV/SLEEP/MSK/CARD)

### B6.1 Women's reproductive health
- Model *parallel dated states* rather than one exclusive categorical label: menstrual cycles, pregnancy, postpartum, lactation, contraception, hormone treatment, menopause-transition status, surgery.
- Include menstrual bleeding characteristics, abnormal-pattern report and time; symptom distress/wanted-help status; no hidden fertility scores or contraception guarantees.
- Cycle forecasts must be clearly estimated and excluded from high-stakes pregnancy-prevention decisions.
- Screen iron and bone context only with authorized records and approved evidence; no implicit clinical attribution.
- WH-01–09 remain controlling; additionally test recorded menopause history from 5 years ago versus current postmenopause, and gender/anatomy mismatch without erroneous screening exclusion.

### B6.2 Men's hormonal/reproductive health
- Capture specimen time, assay, concentration and formulation, *actual administration* timestamps, not predicted peak/trough from only a schedule.
- Keep fertility concerns and PSA interpretation separate from TRT monitoring; monitoring for prescribed TRT is clinician-directed rather than automatic dose recommendation.
- Optional sexual well-being can be available across genders; do not equate low libido with disease or hormone deficiency.
- MH-01–09 remain controlling; add contradictory/missing injection timing, route and concentration tests.

### B6.3 Medication/supplements
- Support exact product formulation and ingredient units, active compound and elemental nutrient differences, as-needed schedules, pauses, missed versus unknown days, retrospective week-level adherence with uncertainty.
- Only confirmed use or properly labelled estimates contribute to exposure; planned dose never automatically adds nutrients to consumed totals.
- Ingredient safety checks require authoritative, legally usable formulary/interaction data; unknown interaction coverage is explicitly disclosed.
- MED-01–10 and prior BIO-2026-116–123 remain controlling.

### B6.4 Prevention
- Distinguish `guideline_candidate`, `clinician_recommended`, `scheduled`, `completed`, `declined`, `unknown_history`, `not_applicable`. Do not silently turn a clinician plan into population advice.
- Context for a screening includes age, territory, anatomy, family history, prior abnormal results, prior surgeries/treatments, immunization details and guideline version.
- When inputs insufficient, show general education and one optional history question; never assert overdue from unknown history.
- Patient-selected export produces a *scoped snapshot*, not a persistent third-party data-access grant.

### B6.5 Sleep/mental wellbeing
- Separate time-in-bed, wearable total sleep and stages, manual duration, subjective quality. De-duplicate repeated device import and preserve source corrections.
- Stress and mood are voluntary, non-stigmatizing. No passive depression diagnosis, sentiment manipulation or pressure to self-report intimate topics.
- Any safety escalation must be an independently reviewed clinical policy; show user-controlled help-seeking education as permitted.

### B6.6 MSK/bone
- Track stiffness duration, anatomical region, functional impact, time course, clinician restrictions, rehabilitation actions and adverse responses; avoid diagnostic labels from body-map selections.
- DXA T- and Z-scores carry site, manufacturer/method, interpretation and clinical source. Smart-scale bone mass stays in an *entirely separate estimate family*.
- Protect training and injury constraints before selecting an action. Medication context may inform clinically reviewed bone-health discussion.

### B6.7 Cardiometabolic/chronic condition
- Preserve blood-pressure protocol (home vs clinic, posture/rest, device, readings), fasting and analyte method for lipid/glucose data, timing for drugs and meals, renal/liver source context.
- Whole-panel importance and competing-goal trade-offs belong in existing Response #15 and CDPI. A change in a biomarker does not prove disease reversal or medication efficacy.
- Do not activate PREVENT or any validated risk score without complete inputs, population/territory validation and legal scope. Canadian context cannot be assumed equivalent to U.S. calibration.

## B7. Low-friction capture and context reuse — actionable UX

- **Entry triggers**: a new lab result, user-requested care summary, selected menstrual tab, new injury note, selected supplement, and relevant goal changes. Ask *one high-value question* only when it changes the next action's safety or applicability.
- **One-tap routines**: 'No change', 'Changed', 'Not sure' for long-term regimen; optional weekly recall, not false daily dose receipt.
- **Correction-first**: show 'Bloom currently understands: …' with source and a correct/hide action; never force users to correct a guessed diagnosis.
- **Progressive privacy**: 'Show on Today' is a separate toggle from 'Store privately'; sensitive domains off Today by default.
- **No blank checks**: age or sex profile fields must not automatically opt a user into hormone tracking, fertility forecasts, prostate screening reminders or mental-health monitoring.
- **Experience selection**: common Today, Food, Biology, Progress and Explore remain available to all; domain-entry tiles appear when user opts in or requests them, while safe explanatory content remains searchable.
- **Role of AI**: summarize source-backed context, suggest low-risk next questions and explain evidence; deterministic applicability/permission/safety gates always control release. No unsupported numerical healthspan promises.

## B8. Proposed Codex execution slices with concrete exits

All implementation must map to the *existing* v0.6/v0.7 canonical backlog and issue IDs; these labels are specialist crosswalks, **not** a second roadmap.

| Slice | Scope and reuse | Required exit evidence | Priority |
|---|---|---|---|
| CP-01 Context fact and time semantics | Extend `shared/wellness-context.ts`, `server/wellness-context.ts`, canonical source revisions/consent | Immutable original vs corrected facts; effective-as-of; unresolved conflicts; two-account denial; correction invalidation | P0 touched pathways / v0.6 |
| CP-02 Eligibility projection | Typed life-stage/anatomy/sex-as-needed, relevant clinical criteria, evidence version, locale | Matrix fixture above; unknown and treatment-confounded abstention; no mandatory sensitive questionnaire | P0 safety / v0.6 foundation |
| CP-03 Unified action safety | Reuse `shared/wellness-actions.ts`, goal guidance, CDPI and Response | Contraindication/goal veto, one main opportunity or no action; provenance and reason; nothing auto-prescribed | v0.6 ongoing |
| CP-04 Regimen exposure | Existing medication/supplement data and Food nutrient totals | Scheduled ≠ taken; optional as-needed/weekly estimation; units/ingredient dedupe; treatment timeline | v0.6 first where already approved |
| CP-05 Seven optional domain records | Extend existing Profile, symptoms, activity, sleep, preventative/biology surfaces | Each exact owner WH/MH/MED/PREV/SLEEP/MSK/CARD test; user edit/delete; hidden-by-default sensitive UI | v0.7 bounded |
| CP-06 Preventive guideline registry | Existing evidence governance, territory/rule registry | Final vs draft/archive source status, age/anatomy/risks, history completed, 'unknown' no overdue | v0.7 |
| CP-07 Appointment summary | Reuse export/ownership and selected canonical observations | User-selected sections, date/source/units; omitted sensitive data stay omitted; no external sharing by default | v0.7 |
| CP-08 Scientific response/relevance | Extend lab history, Progress/Response and cross-domain ontology | Multi-marker, absent/contradictory source, treatment timing, protected-goal negatives; no causal overclaim | v0.6 then v0.7 |
| CP-09 Experience UX | Existing brand tokens, Today, Biology/Progress/Athlete/Explore | 320/390/768/desktop, keyboard/screen-reader, private display and optional entry, mode consistency | per domain |
| CP-10 Governance and release | Existing versioned ledger and evidence registry | Test receipts, approved scopes, independent security/legal/specialist gates, deployment vs implementation status | every release |

Architect should use latest `NEXT_ACTIONS.md` for ordering and must not displace Food #12 / Response #15 with speculative health-domain rebuilds. Safe development may proceed under the existing autonomous build-first policy; user-facing sensitive outputs and production require independent appropriate authorization.

## B9. Additional acceptance tests (execute XH-01–20 in Part A first)

**XH-21**: Same individual's age-derived eligibility changes on a birthday, with relevant age uncertainty and correct jurisdiction-specific source. No premature reminders.

**XH-22**: Gender identity/sex field conflicts with relevant anatomy; appropriate anatomy-specific screening is offered privately only after required context, with no misgendering or blanket exclusion.

**XH-23**: User declines to provide anatomy, menstrual status or reproductive history; ordinary nutrition/activity work, screening is educational-only or abstains, no hidden defaults.

**XH-24**: Surgery changes organ applicability from a dated effective date; historical records retain former context. Do not automatically exclude past abnormal cervical findings.

**XH-25**: Past pregnancy versus current postpartum + lactation yields distinct nutrition applicability and historically correct lab interpretation.

**XH-26**: Hormonal contraception suppresses unsupported cycle phase / menopause classification; educational context still works.

**XH-27**: Two TRT administration events of different formulations/strengths; serum testing chronology respects actual date, time, route and unknown doses.

**XH-28**: Imported vaccine has original source and is marked completed; source correction or duplicate import updates the preventive status without invented missed doses.

**XH-29**: Canadian province changes and local screening source differs. Recompute only applicable guidance; preserve earlier dated context and show source version.

**XH-30**: Conflicting family-history data prevent unsupported high-risk screening classification; user can correct one source without losing original.

**XH-31**: Multiple device sleep readings for same night are not summed as additional hours; estimated stages remain device-labelled.

**XH-32**: DXA Z-score with site recorded versus smart-scale mass estimate; no false clinical equivalence or derived diagnosis.

**XH-33**: Severe symptom pattern enters reviewed triage boundary; safe supportive or urgent-care content only if existing approved criteria cover the input, otherwise abstain and do not invent emergencies.

**XH-34**: Medication dose change and concurrent lifestyle change before improved lab; presentation includes competing explanations and no causal percentages.

**XH-35**: User removes sexual-wellbeing consent; Today, exports, cached findings, analytics and account switching cannot reveal the content.

**XH-36**: Accepted recommendation never becomes a performed intervention until actual confirmation; correction retracts dependent 'worked for me' output.

**XH-37**: Historical reference ranges differ from new assay method; descriptive source values persist, clinical comparability is withheld.

**XH-38**: Clinical model (PREVENT or FRAX) is requested outside validation/territory or with missing required values: no numeric score, source-qualified general education only.

**XH-39**: Two similarly aged users with different goals, treatments, anatomy and family history receive materially different *eligible options* while both remain safe and their private data never mix.

**XH-40**: User completes a two-tap daily check-in, later adds detailed context, and receives a helpful longitudinal view without repeated questionnaires or speculative AI diagnoses.

### Test outcome record for each scenario

```
scenario_id, review_sha, source_revision_set, evaluated_as_of, guideline_version,
needed_permissions, actual_result, intended_result, pass_or_fail,
scientific_reviewer, security_legal_signoffs_if_needed, app_route,
regression_receipt, deploy_id_or_not_deployed
```

For long-term product quality measure: usefulness per eligible recommendation (explicit opt-in feedback), prevented unsafe recommendation rate, false eligibility/overdue assertions, privacy disclosure incidents, corrected records applied, task burden, source/citation validity, abstention quality and cross-domain conflicting-goal protections. Do not optimize for notification count, questionnaire completion, expensive tests ordered, raw model confidence, or unsupported claimed longevity gains.

## B10. Medical intended-use boundaries and information-sharing

- General wellness and clinical diagnostic/therapeutic software functions may have different regulatory treatment in Canada and other territories. Exact product claims and execution—not mere app labels—determine intended use; require Legal to assess before activation.
- App should have clinician-conversation summaries with sources, missingness, actual chronology and user-selected sensitive sections. The clinician remains responsible for decisions.
- For future provider integration, prefer narrowly scoped standards-based resource mapping (e.g. FHIR for medication, observations, conditions, procedures), not uncontrolled bidirectional diagnoses or auto-updating medication lists. Imported records remain source-attributed.
- Access, export, delete, consent, logging and model caching must be reviewed for sensitive sexual/reproductive/mental data. No cross-user pooled training by default.
- AI can draft an explanation from approved evidence, but the final *eligibility, claims, and action* must pass reviewed deterministic policy; any LLM/provider failure must leave ordinary Food/Today/logging functional.

## B11. Review ownership and release status

| Owner | Required decision |
|---|---|
| Chief Architect | Reconcile each owner ID against the canonical roadmap, evidence, existing implementations; authorize bounded code work and accepted exposure scope |
| Science & Biology | Evidence-to-claim applicability, reference physiology, life-stage rules, safety and missingness, scientific acceptance on inspected SHA |
| AI/ML | Context relevance selection, no inferred diagnoses, uncertainty and abstention, novel relationship false positives, safe recommendation rationale |
| Integrations & Data | Canonical identifiers/units/dates, duplicate prevention, source corrections, consent-scoped projection and exported provenance |
| Security & Privacy | Sensitive-domain permissions and confidentiality, cache/account isolation, revocation/erasure, third-party and future population learning |
| Legal & Regulatory | Jurisdiction, screening intended-use, privacy/licensing, clinician-facing output claims and regulated functionality boundaries |
| UX / User Testing | Optional low-friction capture, correctly adapted experiences, accessible history, discrete personal controls and clinician-summary usability |
| Codex | Build/test/preview per existing backlog and verified source, record SHA, automated and actual app receipts; enforce all activation restrictions |

**Formal status as of this handoff:** owner-proposed integrated scope and Science/Biology design review complete; reviewed source foundations are partial; proposed new domain modules, clinical eligibility, guideline logic and deployed behavior are **not verified**. This document cannot provide blanket medical, scientific, security, legal or production activation approval. Continue approved v0.6 Core implementation immediately.

## B12. Critical success demonstration for the Architect's integrated release candidate

Create at least three **synthetic, multi-year, longitudinal user journeys** (not invented data presented as real humans), each crossing at least four domains and showing:

1. A person with different current and historical life-stage/treatment contexts. Correct information appears on the relevant date and only in permitted surfaces.
2. A young or midlife adult with lipid/protein/strength goals, medication/supplement history, sleep changes and lab results. Bloom identifies a sensible, evidence-supported next choice while protecting protein and function and not claiming the dietary action caused a specific lab change.
3. An older adult with prevention history, DXA or reported functional limitations, and sleep/activity measurements. Bloom supports useful action, independence, appointment preparation, correct jurisdictional context and careful uncertainty rather than a generic clinical dashboard.

All journeys must demonstrate voluntary low-burden capture, current and historical context correctness, source-linked reasoning, changed context and corrections, privacy, cross-domain action veto, progress feedback and no unnecessary repeat entry. Show one prioritised actionable insight—not seven simultaneous new dashboards. Include a no-data/unknowns test and a restricted clinical action rejection test.

**Acceptance is the actual user experience and measured safety/data fidelity, not the mere presence of seven tracking modules.**