# Bloom

**Understand your biology. Make better-informed decisions about your health.**

Bloom is a science-driven personal health platform being developed to bring together nutrition, the gut microbiome, genetics, laboratory results, symptoms, physical activity, and other relevant biological context.

Rather than treating each measurement in isolation or generating generic health advice, Bloom aims to investigate how biological systems interact, identify meaningful patterns over time, and help people understand which changes may be worth considering.

At its core, Bloom combines structured personal observations, evidence-grounded biological investigation, competing explanations, and honest scientific uncertainty. Its goal is not to manufacture certainty or replace clinical expertise—it is to make complex health information more understandable, actionable where justified, and useful over time.

---

## What Bloom Is Building

Bloom is being developed across interconnected biological and daily-life domains so individual observations can be viewed in context rather than as disconnected silos:

- **Nutrition & metabolic context:** Log foods, meals, intake timing, and nutrient context to support everyday nutrition awareness and explore how dietary and metabolic factors relate to symptoms and long-term health outcomes—without assuming uncalibrated "optimal" targets.
- **Biological pathways & systems:** Explore how host genetics, microbial functions, enzymes, nutrients, metabolites, and physiological processes interact, while distinguishing established biological mechanisms from unvalidated predictions about individual outcomes.
- **Microbiome & genetics:** Bring together report data, taxonomic or variant context, and scientific limitations so biological findings are interpreted cautiously rather than over-read or treated as deterministic diagnoses.
- **Laboratory work & longitudinal trends:** Organize lab results, reference context, and multi-domain records over time to examine how biomarkers, symptoms, habits, and life stages shift across weeks, months, and years.
- **Long-term outcomes & health optimization:** Help people evaluate whether meaningful improvements are occurring over time across nutrition, metabolic health, physical performance, functional capacity, and healthy aging—without inventing biological age scores, lifespan extensions, or "years of life gained."
- **Evidence-grounded AI investigation:** Rather than relying solely on rigid rule trees, Bloom is being developed to use evidence-grounded AI reasoning to weigh competing explanations, surface material unknowns, ask decision-changing questions, and recognize when available evidence does not justify a conclusion.

---

## How Bloom Approaches Health

Bloom’s investigative discipline is designed to separate signal from noise and keep analytical confidence proportional to actual evidence:

- **Competing explanations & causal restraint:** Distinguish timing and correlation from proof, weigh plausible alternative explanations, and avoid locking onto single causes or blaming neutral habits when multiple factors overlap.
- **Decision-changing questions:** Keep routine logging lightweight while asking targeted follow-up questions only when a specific missing fact can meaningfully change the assessment or next step.
- **Missing data & safe failure:** Treat unlogged or unknown information as unknown rather than normal or zero, and fail safely when data or evidence is incomplete rather than fabricating values, citations, or conclusions.
- **Clinical boundaries:** Respect the line between personal biological exploration and medical care—abstaining where evidence is insufficient and encouraging qualified clinical evaluation when symptoms, lab shifts, or underlying conditions warrant medical assessment.

---

## Everyday & Athlete

Bloom is designed around two consumer experiences built on the same underlying biological system, with a planned Coach experience to help users translate evidence into practical next steps:

- **Everyday:** Focused on accessible daily logging, nutrition and symptom context, longitudinal awareness, and calm, understandable guidance without requiring specialized athletic or external-device workflows.
- **Athlete:** Built on the same core system to account for training load, recovery, exercise timing, and fueling context alongside everyday biology—without requiring connected wearables for core functionality or making unsupported performance claims.
- **Coach (planned expansion):** Intended to help people work toward their own health, nutrition, and performance goals using their authorized observations, relevant scientific evidence, thoughtful questions, and proportionate suggestions. Bloom already has a limited evidence-linked Diet coach foundation; a broader personalized, conversational Coach remains future work, subject to scientific validation, privacy controls, and explicit activation—not a currently validated clinical coaching service.

---

## Privacy & Trust

Privacy and provenance are foundational design requirements in Bloom, with explicit distinctions between architectural controls, implementation tests, and independent security verification:

- **Data boundaries & lifecycle intent:** Bloom is architected around data minimization, per-user access controls, source provenance, and invalidation/revocation handling across active workflows, while distinguishing implemented controls and tests from full independent security verification.
- **Encryption & capability honesty:** Cloud safeguards currently rely on server-managed encryption rather than client-held end-to-end encryption (E2EE) or zero-knowledge guarantees; Bloom does not claim E2EE or zero-knowledge capabilities unless built and independently verified.
- **Separation of personal data & shared scientific knowledge:** Private user data and unreviewed outputs are kept separate from durable, reviewed, nonpersonal scientific knowledge through explicit isolation boundaries.

---

## Development Status

**Development status:** Bloom is in active pre-release development under **Project Genesis**. Implemented functionality, experimental biological reasoning, and planned capabilities have different levels of verification. Passing engineering tests does not establish clinical validity or authorize consumer release.

- **Implemented & in active engineering:** Core application foundations, data capture/import workflows, and baseline structures under active development and verification.
- **Experimental / under validation:** Multifactor biological investigation, AI-assisted hypothesis reasoning, cross-domain synthesis, and longitudinal interpretation remain under active refinement and validation rather than proven clinical conclusions.
- **Planned / future scope:** Additional integrations, deeper analytical capabilities, and future security modes (such as any future client-held E2EE architecture) are scoped for later phases rather than represented as complete today.

---

## Release Naming

Bloom pairs semantic versions with milestone codenames according to its [release naming contract](docs/architecture/BLOOM_PRODUCT_RELEASE_NAMING_20261121.md). Codenames identify milestones rather than implying scheduled launch dates or release authorization.

| Version | Codename | Scope / Context |
| :--- | :--- | :--- |
| `0.6.0` | **Project Genesis** | Active pre-release development phase |
| `1.0.x` | **Hydrogen** | Milestone codename in release naming sequence |
| `1.1.x` | **Helium** | Milestone codename in release naming sequence |
| `1.2.x` | **Lithium** | Milestone codename in release naming sequence |

---

## Development & Documentation

This README provides product context, capability maturity, and safe entry points for developers. Authoritative rules, scientific contracts, task priorities, and acceptance suites live in their respective files rather than being duplicated here.

### Authoritative Guidance

This README is an introduction to Bloom, not an implementation backlog, acceptance catalog, or authorization to activate planned functionality. Development priorities and permissions are governed by the current repository execution contracts.

- Start with [AGENTS.md](AGENTS.md) and [NEXT_ACTIONS.md](NEXT_ACTIONS.md) for current repository rules, active task ordering, operational restrictions and verification expectations.
- Use the task-relevant domain contracts and [v0.6 architecture handoff](docs/architecture/V06_HANDOFF.md), rather than superseded October 2026 execution instructions, for additional detail.
- See [PRECISION_NUTRITION.md](PRECISION_NUTRITION.md), [ATHLETE_EXPERIENCE.md](ATHLETE_EXPERIENCE.md), [RESEARCH_MODEL.md](RESEARCH_MODEL.md), [WEEKLY_PLANNING.md](WEEKLY_PLANNING.md) and [SECURITY_OPERATIONS.md](SECURITY_OPERATIONS.md) for scoped background and safeguards. Those documents are not independent task queues.
- Product features, optional providers and experimental studies may vary by branch and configuration. Never treat a design specification, synthetic test or README claim as proof of clinical validation, hosted privacy verification or consumer authorization.

### Prerequisites & Core Commands

- **Runtime:** Node.js 22 or newer (`>=22` in `package.json`).
- **Application stack:** React/TypeScript frontend, Express server, Drizzle ORM and PostgreSQL/Neon as documented in the repository. A Python research prototype is separate and optional for core workflows.
- **Install and local development** (after configuring an isolated local development environment and the required secrets):

```bash
npm ci
npm run dev
```

**Read-only/source-safe verification commands** (their scripts may inspect assets, imports and fixtures; check environment and the current task before running):

```bash
npm run check
npm test
npm run build
```

The commands above are verified against the current `package.json` scripts; they are **not a claim that they were run or passed for this README change**. Browser/device verification, independent science review and deployment checks are separate.

### Environment Configuration

Verify environment names, required/optional behavior, provider policy and secret validation against the currently checked-out server code before enabling a feature. The existing implementation documentation identifies:

| Setting | Intended purpose / safeguard |
| --- | --- |
| `DATABASE_URL` | PostgreSQL/Neon application connection, for an authorized isolated development database only. |
| `DATABASE_URL_UNPOOLED` | Direct connection used by some schema tooling; ensure it points to the same authorized target, never production by accident. |
| `SESSION_SECRET` | Required unique, sufficiently strong server session secret. Never commit or reuse live secrets in fixtures. |
| `PRECISION_DATA_KEY` | Base64-encoded 32-byte key used for encrypted precision records. Treat rotation and record readability as data-retention concerns. |
| `PORT` | Express listen port (previously documented default: `5000`; confirm current server behavior). |
| `USDA_FDC_API_KEY`, `API_NINJAS_KEY` | Optional nutrition-provider configuration; verify source rights and user-facing missingness handling. |
| `OPENAI_API_KEY`, `OPENAI_SCIENCE_MODEL` | Optional metered AI settings; presence of a key does not authorize transfer of health data or enable unreviewed biological claims. |
| `ML_SERVICE_URL`, `ML_SERVICE_TOKEN`, `ML_SERVICE_ALLOW_PRIVATE_HTTP` | Optional Python prototype connection and security controls. Confirm server and prototype are configured compatibly before use. |

The server and Drizzle configuration have historically loaded `.env.local` and `.env`; inspect actual code for precedence and required variables. Never commit credential files, personal laboratory records or real private-account data. Manual/offline paths should remain usable where supported.

### Database & Migrations

Bloom uses Drizzle ORM and PostgreSQL/Neon. The current `package.json` defines `npm run db:push` as `drizzle-kit push`, and also includes `npm run db:seed:knowledge` and `npm run test:neon`.

- **Isolated local development only:** Use a dedicated isolated or ephemeral database for schema experimentation, with the connection target independently verified. Do not point local experimentation at shared, staging or production data.
- **Migration safety:** Review the actual pending SQL/schema diff, corresponding migration contracts, key requirements and data-preservation behavior before any schema change. Existing migration files and version-specific upgrade paths are documented in repository source and should be checked against the current branch and target schema—not applied indiscriminately.
- **Owner-imposed pause:** Do **not** run production migrations, modify production schemas, provision or reconfigure protected infrastructure, or change Render↔Mac/Tailscale/Serve connectivity without explicit authorization under [AGENTS.md](AGENTS.md) and [NEXT_ACTIONS.md](NEXT_ACTIONS.md).
- **Synthetic Neon smoke tests:** `npm run test:neon` is mutating and must be run only under the repository's documented isolated test protections; never on real personal records or an existing shared/production database.
- **Research/knowledge seed:** Publication of scientific knowledge is separately governed by evidence review, provenance, rights and immutable-source requirements. A seed command is not authorization to publish unreviewed knowledge.

### Additional Technical References

The original README documents detailed implementations such as USDA FNDDS food lookup, reviewed food/ingredient records, barcode capture, account-scoped precision import, selected genotype explanations, biological research, weekly planning and encrypted record provenance. Those remain documented in the dedicated existing source and contracts rather than reproduced here as a stale feature inventory:

- [Food and nutrition specifications](PRECISION_NUTRITION.md) and [product direction](PRODUCT_DIRECTION.md).
- [Selected genotype guidance](SELECTED_GENETICS.md) and [genotype explanations](GENOTYPE_EXPLANATIONS.md).
- [Scientific coach boundaries](SCIENCE_COACH.md), [research model](RESEARCH_MODEL.md) and [functionality documentation](FUNCTIONALITY.md).
- [Project coordination](PROJECT_COORDINATION.md) and [development log](DEVELOPMENT_LOG.md).

The archived README history remains available in Git; removing older runtime claims or obsolete task links from this entry point is **not** authorization to delete a feature or downgrade its acceptance criteria.

---

## Medical Disclaimer

Bloom is a personal health and biological investigation tool being developed for informational and organizational purposes. It is not a medical device, diagnostic service, or substitute for professional medical advice, diagnosis, or treatment. Always seek the guidance of a qualified healthcare professional with any questions regarding a medical condition, laboratory results, medications, or symptoms.
