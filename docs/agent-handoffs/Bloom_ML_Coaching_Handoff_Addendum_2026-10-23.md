# Bloom — ML Review of Biology Coaching & Performance Handoff
**Date:** 2026-10-23 (America/Regina)  
**Owner:** Machine Learning & Biological Intelligence Specialist  
**Basis:** Biology Agent, *Bloom — Athlete Coach Monitoring & Performance Intelligence*, v1.1, BIO-COACH-401–417 (October 23, 2026); reviewed source baseline head 964bec18efc5747db674c6b8f35a93a700a9d3f4.  
**Disposition:** APPROVE WITH CONDITIONS FOR CHIEF ARCHITECT CONSOLIDATION ONLY. No code, tests, deployment, clinical or safety approval. This addendum supplements Bloom_ML_Biological_Intelligence_Handoff_2026-10-23.md.

## Assessment
The separate Biology coaching handoff was NOT covered by my original October 23 ML review. It is now fully reviewed. I support the athlete-owned, per-role, purpose-scoped, time-limited coaching relationship (401, 407, 414); limited data collection (404); performance/observed response (403, 405, 416); reusable programs (411); editable AI copilot drafts and critiques (412–413); professional conflict review (415); AI governance (417); and independent evaluation (410). All remain proposals. Avoid using genetic, microbiome or speculative biological mechanisms to prescribe workouts, predict injury or readiness, or diagnose clinical disorders.

## ML additions for Architect crosswalk (avoid duplicate implementation)
**ML-COACH-201 — Structured plan and evaluation contracts (P1)**: All athlete programs, exercises, targets, restrictions, time zones, review status and individualized assignments need explicit typed schemas and canonical units. Model outputs must pass deterministic schema and safety checks, preserving immutable active plans. Benchmark invalid plans, missing baselines, conflicting schedules, exercise substitutions and unrealistic progression. Crosswalk BIO-COACH-403/411/412/413.

**ML-COACH-202 — Hybrid deterministic + LLM copilot (P0 safety/P1 functionality)**: Use scoped evidence retrieval and LLM draft/critique for explanation and suggestions; deterministic authorization, scope-of-practice, medical restrictions, contraindications and unit checks both before and after generation, with independent human acceptance. LLM must never autonomously publish or approve plans; unknowns prompt abstention or questions. Require citations from reviewed sources, not model-generated citations. Crosswalk 406/412/413/417.

**ML-COACH-203 — Data-minimized AI context and derived-data permissions (P0)**: Train/evaluate against cross-athlete leakage, injection, retrieval leaks, changed consent, revoked coaches, export/notification and generated-summary permissions. Prefer no personal data for template operations; default exclude labs, genetics, microbiome, private journal, medical records, precise location and raw messages from AI requests. Explicitly audit what is sent to providers. Crosswalk 401/407/414/417.

**ML-COACH-204 — Plan-quality benchmark and calibration (P1 research; P0 before efficacy claims)**: Create blinded expert-reviewed evaluation sets across strength, endurance, novice, injury-limited, low-energy-availability, minors and multi-role conflict cases. Metrics include hard-rule recall, unsafe false negatives, guideline compatibility, edit burden, appropriateness, citations, uncertainty/abstention, and athlete outcomes in prospective studies. Do not conflate plan plausibility with efficacy. Crosswalk 405/410/413/416/417.

**ML-COACH-205 — Non-causal longitudinal insight (P1)**: Compare planned vs completed workload, session-RPE, subjective responses, practice availability and standardized performance tests with source/protocol/time stamps, missingness and confounders. Avoid invented universal acute:chronic workload cutoffs, precise injury-risk percentages and opaque readiness scores. Support transparent trend summaries only. Crosswalk 404/405/416.

**ML-COACH-206 — Multi-professional schedule consistency (P1)**: Evaluate conflicting prescriptions via role-aware, consent-safe constraints. Reveal the minimum necessary instruction (e.g. intensity restricted) rather than a medical diagnosis; attribute author and review state. Detect conflicts but leave final decision with the relevant authorized professional/athlete, versioning changes. Crosswalk 414/415.

## Important boundaries
- The coaching features should work for a solo athlete with no coach. Optional connections must never block baseline training and dietary tracking.
- A default professional coach dashboard must not expose biological data or body composition/REDs/mental health signals. A role label is not verified clinical qualification.
- Wearable signals are context, not diagnosis; device sync is not confirmed in the Biology handoff.
- Safety and effectiveness require controlled tests and appropriate credential/clinical review before public claims.
- The recommendation engine for personal health and the coaching copilot are related through source evidence and outcome models, but have distinct authorization, actionability and release gates.

## Recommended staged research and acceptance
1. Architect maps BIO-COACH-401–417 and ML-COACH-201–206 to existing backlog, Security, Design and User Testing; confirms source reviewed SHA and newer changes.
2. Prototype test datasets and schemas without activating AI publishing; evaluate 1, 5 and 50 athletes, multi-role conflicts, optional data withholding, revocation and template version preservation.
3. Evaluate AI-drafted and manually authored plan critique against expert assessments using hard safety gates; document adverse cases and abstention.
4. Permit controlled rollout only after professional review workflow, authorization and safety controls have been independently verified.
5. Compare AI-assisted coach workflow against non-AI baseline on task quality, time and eventual participant outcomes, without premature efficacy claims.

**Status:** Architect review pending. Developer remains sole implementation and GitHub owner. This is a specialist documentation commit, not a code change or authorization to implement.
