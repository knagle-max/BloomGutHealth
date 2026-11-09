# Bloom — R4 Brand Voice & Seven-Route Microcopy Production Completion

**Date:** 2026-11-07 · **Version:** R4-COPY-CONSOLIDATION-01 · **Scope:** seven experience groups, common states and runtime-owned content

**Provenance/approval:** This is assistant-authored, implementation-ready *proposed* copy grounded in `Bloom_Brand_Strategy_UX_Product_Evolution_Handoff_2026-11-06.md`, Branding/UX Continuity v1.5, and R4 UX meaning contracts. A standalone final BRAND-R2-VOICE deliverable or Branding Agent's signature was not located in the accessible shared Library. Therefore **do not represent these strings as signed off by the Branding Agent**. They are a complete working copy set; the Branding Agent can approve/edit in place without blocking independent implementation.

## A. Voice guide

**Three traits:** Warm without false familiarity; lucid without clinical jargon; precise without overconfidence.

**Sentence rules:** User-first action verbs; short sentences on the primary surface; one supported takeaway and next action; explain exclusions and uncertainty near the claim; no guilt, shame or competitive health scores; research is not the user's measured outcome; use dates, methods and units only when sourced; avoid saying a save succeeded before a confirmed receipt; respect already localized/runtime-generated labels.

**Primary-surface vocabulary to avoid:** Dashboard, Metrics, Overview, Compliance, Patient, Biomarker Optimization, Deficiency Detected, Guaranteed, Fix Your Gut, Your Microbiome Needs, Perfect Day, Failed Goal, Cheat Meal, Detox, AI Doctor. Terms may remain in technical or legal contexts where accurate; this is not an instruction to rename technical fields.

**Provenance rule:** Show a quiet, accessible source statement **once per section**, with per-row distinctions where methods or providers differ; never hide the source of an individualized claim. Static `*.source` is a fallback label only, not a substitute for provider/date metadata.

**Source precedence:** Current user-specific action strings, values, units, report names, collection times, consent and persistence states always come from the existing trusted runtime. These strings are not a replacement for those data bindings.

## B. Before/after examples (new proposals grounded in brand strategy)

| Avoid | Prefer |
|---|---|
| Your gut needs more diversity. | Your report lists these organisms. Explore what research says about them. |
| You consumed zero nutrients today. | No nutrient amounts were recorded for today. |
| Patient Dashboard | Today |
| Data synchronization failed. | Your connected information could not update. Try again. |
| You reached your optimal readiness score. | Your recorded training information is ready to review. |
| AI recommends this treatment for you. | Research has explored this idea; it is not a personal treatment recommendation. |

## C. Copy table (204 exact keys including 11 runtime-reserved keys)

| Route | Component/state | Key | String or runtime instruction | Character limit |
|---|---|---|---|---|
| today | default/contextual | `today.eyebrow` | A day at your pace | 70 |
| today | default/contextual | `today.h1` | A little more clarity for today. | 70 |
| today | default/contextual | `today.takeaway` | Begin with what matters to you. Your next step can be simple. | 100 |
| today | default/contextual | `today.focusLabel` | A useful next step | 70 |
| today | default/contextual | `today.primaryFallback` | Add food | 70 |
| today | default/contextual | `today.secondary` | Explore your options | 70 |
| today | default/contextual | `today.journalTitle` | Today so far | 70 |
| today | default/contextual | `today.journalEmpty` | No meals saved today. You can begin whenever it suits you. | 70 |
| today | empty | `today.empty` | Start with a meal or a goal. Reports and devices are optional. | 70 |
| today | partial | `today.partial` | Some saved meals have missing nutrient details. Known amounts are shown; unknown amounts remain unavailable. | 108 |
| today | loading | `today.loading` | Checking today’s saved information… | 70 |
| today | error | `today.error` | Your saved day could not load. You can try again. | 70 |
| today | default/contextual | `today.retry` | Try again | 70 |
| today | reviewUnsaved | `today.reviewUnsaved` | Review your choice before confirming it. | 70 |
| today | saving | `today.saving` | Saving your choice… | 70 |
| today | saved | `today.saved` | Your choice is saved. | 70 |
| today | saveUncertain | `today.saveUncertain` | We could not confirm that your choice was saved. Check before trying again. | 90 |
| today | default/contextual | `today.researchLimit` | Background research helps explain ideas; it does not measure your response. | 100 |
| today | default/contextual | `today.source` | Based on the records currently available to Bloom. | 70 |
| today | conflict | `today.conflict` | Your saved information has changed. Review the latest version before continuing. | 100 |
| today | stale | `today.stale` | Some connected information may be out of date. See its last recorded date. | 90 |
| today | default/contextual | `today.paused` | Suggestion paused for this visit. | 70 |
| today | default/contextual | `today.chosen` | Your selected option is ready. | 70 |
| today | default/contextual | `today.athlete` | Training plans can help shape your next step when they are available. | 70 |
| today | default/contextual | `today.why` | Why this step? | 70 |
| food | default/contextual | `food.eyebrow` | YOUR FOOD JOURNAL | 70 |
| food | default/contextual | `food.h1` | Make room for the meals that matter. | 70 |
| food | default/contextual | `food.takeaway` | Record what you ate, then check the details before saving. | 100 |
| food | default/contextual | `food.primary` | Add a meal | 70 |
| food | default/contextual | `food.secondary` | Review food journal | 70 |
| food | default/contextual | `food.section` | Your recorded food | 70 |
| food | empty | `food.empty` | No meals saved for this period. That does not mean you ate nothing. | 70 |
| food | partial | `food.partial` | Some nutrient amounts are unknown. Available totals include only known recorded contributions. | 100 |
| food | loading | `food.loading` | Checking your saved meals… | 70 |
| food | error | `food.error` | Your food journal could not load. Try again to see your saved entries. | 70 |
| food | default/contextual | `food.retry` | Retry journal | 70 |
| food | reviewUnsaved | `food.reviewUnsaved` | Review the foods, portions and uncertain details before saving. | 70 |
| food | saving | `food.saving` | Saving your meal… | 70 |
| food | saved | `food.saved` | Your meal has been saved to your journal. | 70 |
| food | saveUncertain | `food.saveUncertain` | We could not confirm this meal was saved. Check your journal before submitting it again. | 90 |
| food | default/contextual | `food.source` | Amounts come from the foods and sources recorded in this journal. | 70 |
| food | default/contextual | `food.researchLimit` | Food research offers context, not a measured personal effect. | 100 |
| food | conflict | `food.conflict` | This meal changed while you were editing. Review the latest version before saving. | 100 |
| food | default/contextual | `food.unavailable` | Nutrient amount unavailable | 70 |
| food | default/contextual | `food.missingDays` | Unlogged days are not plotted as zero. | 70 |
| food | default/contextual | `food.edit` | Review or correct this meal | 70 |
| food | default/contextual | `food.unknownPortion` | Portion needs review | 70 |
| food | default/contextual | `food.allergy` | Check ingredients and allergy information before saving. | 70 |
| food | default/contextual | `food.noMatch` | No matching foods found. Try another description or add details manually. | 90 |
| food | default/contextual | `food.confirmedEntries` | Saved food entries | 70 |
| biology | default/contextual | `biology.eyebrow` | YOUR BIOLOGY | 70 |
| biology | default/contextual | `biology.h1` | Understand the information you have. | 70 |
| biology | default/contextual | `biology.takeaway` | See what your records report, what they cannot tell you, and what deserves a closer look. | 100 |
| biology | default/contextual | `biology.primary` | Review your reports | 70 |
| biology | default/contextual | `biology.secondary` | Explore the science | 70 |
| biology | default/contextual | `biology.section` | Your recorded observations | 70 |
| biology | empty | `biology.empty` | No reports saved here yet. You can still use Bloom without one. | 70 |
| biology | partial | `biology.partial` | Some report fields are missing or cannot be compared. Only supported observations are shown. | 100 |
| biology | loading | `biology.loading` | Checking saved reports… | 70 |
| biology | error | `biology.error` | Your saved reports could not load. Try again to review them. | 70 |
| biology | default/contextual | `biology.retry` | Retry reports | 70 |
| biology | reviewUnsaved | `biology.reviewUnsaved` | Review the source, date and matching details before importing. | 70 |
| biology | saving | `biology.saving` | Saving reviewed report details… | 70 |
| biology | saved | `biology.saved` | Your reviewed report details are saved. | 70 |
| biology | saveUncertain | `biology.saveUncertain` | We could not confirm this report was saved. Check your reports before retrying. | 90 |
| biology | default/contextual | `biology.source` | Reported by the selected source on its recorded date. | 70 |
| biology | default/contextual | `biology.researchLimit` | Research about organisms and pathways is not a measurement of your own pathway activity. | 100 |
| biology | conflict | `biology.conflict` | A source record changed. Review the revised report before continuing. | 100 |
| biology | stale | `biology.stale` | This result reflects its collection date, not necessarily today. | 70 |
| biology | default/contextual | `biology.methods` | How this result was reported | 70 |
| biology | default/contextual | `biology.incompatible` | These observations use different methods or definitions and are not shown as one trend. | 90 |
| biology | default/contextual | `biology.notMeasured` | Not measured in this report | 70 |
| biology | default/contextual | `biology.providerScore` | This is a source-reported score, not a direct abundance measurement. | 70 |
| biology | revoked | `biology.revoked` | This source is no longer connected. | 70 |
| explore | default/contextual | `explore.eyebrow` | EXPLORE THE WHY | 70 |
| explore | default/contextual | `explore.h1` | Follow your curiosity. | 70 |
| explore | default/contextual | `explore.takeaway` | Explore foods, organisms and molecules through research, with uncertainty kept in view. | 100 |
| explore | default/contextual | `explore.primary` | Explore a topic | 70 |
| explore | default/contextual | `explore.secondary` | See your biology | 70 |
| explore | default/contextual | `explore.section` | Research to explore | 70 |
| explore | empty | `explore.empty` | No topics matched this search. Try a broader term. | 70 |
| explore | partial | `explore.partial` | Some research details are unavailable. The available references are shown. | 100 |
| explore | loading | `explore.loading` | Looking through research topics… | 70 |
| explore | error | `explore.error` | Research topics could not load. Try again. | 70 |
| explore | default/contextual | `explore.retry` | Retry search | 70 |
| explore | reviewUnsaved | `explore.reviewUnsaved` | Review your selection before adding it to your saved topics. | 70 |
| explore | saving | `explore.saving` | Saving your selection… | 70 |
| explore | saved | `explore.saved` | Your selection is saved. | 70 |
| explore | saveUncertain | `explore.saveUncertain` | We could not confirm this selection was saved. Check your saved topics. | 90 |
| explore | default/contextual | `explore.source` | Based on the research sources linked in this section. | 70 |
| explore | default/contextual | `explore.researchLimit` | Findings from studies are not a personal measurement, diagnosis or guaranteed effect. | 100 |
| explore | conflict | `explore.conflict` | This saved selection has changed. Review it before continuing. | 100 |
| explore | default/contextual | `explore.noResults` | No results for those terms | 70 |
| explore | default/contextual | `explore.evidence` | What the evidence says | 70 |
| explore | default/contextual | `explore.limits` | What we do not know | 70 |
| explore | default/contextual | `explore.personality` | Research context, not a personal finding | 70 |
| explore | default/contextual | `explore.methods` | Study details and limitations | 70 |
| progress | default/contextual | `progress.eyebrow` | YOUR PROGRESS | 70 |
| progress | default/contextual | `progress.h1` | See change in context. | 70 |
| progress | default/contextual | `progress.takeaway` | Look at what you recorded over time, with gaps and differences clearly marked. | 100 |
| progress | default/contextual | `progress.primary` | Review your trends | 70 |
| progress | default/contextual | `progress.secondary` | Add a record | 70 |
| progress | default/contextual | `progress.section` | Your recorded timeline | 70 |
| progress | empty | `progress.empty` | No records are available for this selection yet. | 70 |
| progress | partial | `progress.partial` | Some records are incomplete. Missing values are not treated as zero. | 100 |
| progress | loading | `progress.loading` | Checking recorded history… | 70 |
| progress | error | `progress.error` | Your recorded history could not load. Try again. | 70 |
| progress | default/contextual | `progress.retry` | Retry history | 70 |
| progress | reviewUnsaved | `progress.reviewUnsaved` | Review the date, source and units before saving this measurement. | 70 |
| progress | saving | `progress.saving` | Saving your measurement… | 70 |
| progress | saved | `progress.saved` | Your measurement has been saved. | 70 |
| progress | saveUncertain | `progress.saveUncertain` | We could not confirm this measurement was saved. Check your history before retrying. | 90 |
| progress | default/contextual | `progress.source` | Shown from the recorded source and date for each observation. | 70 |
| progress | default/contextual | `progress.researchLimit` | Changes over time do not, on their own, show what caused them. | 100 |
| progress | conflict | `progress.conflict` | This observation has changed. Review the latest record before saving. | 100 |
| progress | default/contextual | `progress.onePoint` | One recorded date is not enough to show a trend. | 70 |
| progress | default/contextual | `progress.incompatible` | These results cannot be compared reliably across source or method. | 70 |
| progress | default/contextual | `progress.missing` | Measurement unavailable | 70 |
| progress | default/contextual | `progress.correction` | This data looks wrong | 70 |
| progress | default/contextual | `progress.units` | Change display units in Profile | 70 |
| progress | default/contextual | `progress.compare` | Compare recorded dates | 70 |
| athlete | default/contextual | `athlete.eyebrow` | YOUR TRAINING DAY | 70 |
| athlete | default/contextual | `athlete.h1` | Make space for how you move. | 70 |
| athlete | default/contextual | `athlete.takeaway` | Keep plans, completed sessions and fueling records clear and separate. | 100 |
| athlete | default/contextual | `athlete.primary` | Record a session | 70 |
| athlete | default/contextual | `athlete.secondary` | Review fueling | 70 |
| athlete | default/contextual | `athlete.section` | Your training records | 70 |
| athlete | empty | `athlete.empty` | No training sessions saved for this period. | 70 |
| athlete | partial | `athlete.partial` | Some session details are missing. Recorded details are shown without filling gaps. | 100 |
| athlete | loading | `athlete.loading` | Checking your training records… | 70 |
| athlete | error | `athlete.error` | Your training records could not load. Try again. | 70 |
| athlete | default/contextual | `athlete.retry` | Retry training records | 70 |
| athlete | reviewUnsaved | `athlete.reviewUnsaved` | Review your session details before saving. | 70 |
| athlete | saving | `athlete.saving` | Saving your session… | 70 |
| athlete | saved | `athlete.saved` | Your session has been saved. | 70 |
| athlete | saveUncertain | `athlete.saveUncertain` | We could not confirm the session was saved. Check your records before retrying. | 90 |
| athlete | default/contextual | `athlete.source` | From the training records you saved or connected. | 70 |
| athlete | default/contextual | `athlete.researchLimit` | General training research does not establish your personal readiness or response. | 100 |
| athlete | conflict | `athlete.conflict` | This session changed while you were editing. Review the latest entry. | 100 |
| athlete | default/contextual | `athlete.planned` | Planned session | 70 |
| athlete | default/contextual | `athlete.completed` | Completed session | 70 |
| athlete | default/contextual | `athlete.cancelled` | Cancelled session | 70 |
| athlete | syncPending | `athlete.syncPending` | A connected activity source has not finished syncing. | 70 |
| athlete | default/contextual | `athlete.noReadiness` | No validated readiness estimate is available. | 70 |
| athlete | default/contextual | `athlete.hydration` | Record hydration | 70 |
| profile | default/contextual | `profile.eyebrow` | MAKE BLOOM YOURS | 70 |
| profile | default/contextual | `profile.h1` | Your information, your choices. | 70 |
| profile | default/contextual | `profile.takeaway` | Manage what Bloom remembers, how information appears, and which sources you allow. | 100 |
| profile | default/contextual | `profile.primary` | Review your settings | 70 |
| profile | default/contextual | `profile.secondary` | Manage your data | 70 |
| profile | default/contextual | `profile.section` | Your settings and sources | 70 |
| profile | empty | `profile.empty` | No connected sources are listed. You can still add information manually. | 90 |
| profile | partial | `profile.partial` | Some settings or source details are unavailable. Review before changing them. | 100 |
| profile | loading | `profile.loading` | Checking your settings… | 70 |
| profile | error | `profile.error` | Your settings could not load. Try again. | 70 |
| profile | default/contextual | `profile.retry` | Retry settings | 70 |
| profile | reviewUnsaved | `profile.reviewUnsaved` | You have changes that are not saved. | 70 |
| profile | saving | `profile.saving` | Saving your settings… | 70 |
| profile | saved | `profile.saved` | Your settings have been saved. | 70 |
| profile | saveUncertain | `profile.saveUncertain` | We could not confirm these settings were saved. Check before trying again. | 90 |
| profile | default/contextual | `profile.source` | Source access and last update are shown for each connection. | 70 |
| profile | default/contextual | `profile.researchLimit` | Adding information does not guarantee a specific recommendation or outcome. | 100 |
| profile | conflict | `profile.conflict` | Your settings changed elsewhere. Review the latest version before saving. | 100 |
| profile | revoked | `profile.revoked` | This source is no longer connected. | 70 |
| profile | syncPending | `profile.syncPending` | This source is waiting to finish syncing. | 70 |
| profile | stale | `profile.stale` | The latest available record may be out of date. | 70 |
| profile | default/contextual | `profile.privacy` | Privacy, access and export | 70 |
| profile | default/contextual | `profile.delete` | Review deletion options | 70 |
| profile | default/contextual | `profile.consent` | Manage permissions | 70 |
| profile | default/contextual | `profile.units` | Display units | 70 |
| shared | default/contextual | `shared.offline` | You appear to be offline. Saved information may still be available. | 70 |
| shared | default/contextual | `shared.retry` | Try again | 70 |
| shared | default/contextual | `shared.close` | Close | 70 |
| shared | default/contextual | `shared.back` | Back | 70 |
| shared | default/contextual | `shared.more` | Learn more | 70 |
| shared | default/contextual | `shared.expand` | Show details | 70 |
| shared | default/contextual | `shared.collapse` | Hide details | 70 |
| shared | default/contextual | `shared.review` | Review details | 70 |
| shared | default/contextual | `shared.source` | Where this information came from | 70 |
| shared | default/contextual | `shared.unknown` | Not available | 70 |
| shared | default/contextual | `shared.notRecorded` | Not recorded | 70 |
| shared | default/contextual | `shared.notConnected` | Not connected | 70 |
| shared | stale | `shared.stale` | Last updated on {date} | 70 |
| shared | saved | `shared.saved` | Saved | 70 |
| shared | default/contextual | `shared.unsaved` | Unsaved changes | 70 |
| shared | error | `shared.error` | Something could not load. Try again. | 70 |
| shared | default/contextual | `shared.noData` | No saved records available | 70 |
| shared | default/contextual | `shared.methods` | Sources and methods | 70 |
| shared | default/contextual | `shared.research` | Research context | 70 |
| shared | default/contextual | `shared.edit` | Edit | 70 |
| shared | default/contextual | `shared.skip` | Not now | 70 |
| shared | default/contextual | `shared.confirm` | Confirm | 70 |
| shared | default/contextual | `shared.cancel` | Cancel | 70 |
| today | dynamic | `today.focusTitle` | EXISTING RUNTIME: todayContextAction / selected wellness choice; never replace with generic static headline | runtime |
| today | dynamic | `today.focusReason` | EXISTING RUNTIME: action.reason and evidence/limits | runtime |
| today | dynamic | `today.focusCTA` | EXISTING RUNTIME: selected action.linkLabel or appropriate action; preserve context | runtime |
| food | dynamic | `food.nutrientValues` | EXISTING RUNTIME: recordedFoodPeriod and nutrientDisplay; never replace missing with zero | runtime |
| food | dynamic | `food.receiptId` | EXISTING RUNTIME: server save receipt only | runtime |
| biology | dynamic | `biology.observationLabel` | EXISTING RUNTIME: provider report term with source and method | runtime |
| biology | dynamic | `biology.collectionDate` | EXISTING RUNTIME: original collection date and revisions | runtime |
| explore | dynamic | `explore.citation` | EXISTING RUNTIME: article/study title URL plus evidence class | runtime |
| progress | dynamic | `progress.trend` | EXISTING RUNTIME: only validated comparable dated observations; no fabricated narrative | runtime |
| athlete | dynamic | `athlete.trainingStatus` | EXISTING RUNTIME: planned/completed/cancelled, never inferred | runtime |
| profile | dynamic | `profile.permissions` | EXISTING RUNTIME: actual scope and current authorization status | runtime |

## D. Implementation and meaning rules

1. The attached `bloomCopy.ts` exports `bloomCopy` as a typed, read-only object. It does not automatically change current UI text. Integrate each key only where the corresponding real state and route exist.
2. Apply `empty` only after successful source response confirms no entries; a loading, offline, revoked, stale or error result is never empty.
3. Apply `saved` only after a confirmed server receipt; use `saveUncertain` if confirmation fails or is ambiguous, and offer check-before-retry. Never duplicate a mutation blindly.
4. Preserve `todayContextAction()` and selected wellness action headline and CTA dynamically; static `today.h1` belongs to the page heading only.
5. Bind user and date values in trusted runtime; `shared.stale` has `{date}` placeholder, not a literal date.
6. Keep page heading levels and labels semantic. A key with fixed wording does not authorize adding a control, score, feature, route, or modifying a clinical claim.
7. For a research relationship, cite study/source and limitation within the same section; no inferred personal effect or diagnosis.
8. Dynamic provider or science terminology cannot be overwritten with more marketing-friendly text if that changes source meaning.
9. Longest strings must be tested at 320px and 200% zoom; limits above are planning thresholds, not permission to truncate meaning.
10. No completed Branding Agent approval is inferred; changes affecting scientific truth require Structural UX/science review before release.

## E. Outstanding evidence, not missing authored copy

- Branding Agent countersignature: NOT VERIFIED; review and edit this complete table rather than generating a separate proposal.
- Developer integration of keys into live components: NOT IMPLEMENTED IN THIS PACKAGE.
- Screenshot line wrapping, error focus behavior, translations and runtime parity: NOT TESTED.
- Architect final integration/source-version choice and release approval: NOT VERIFIED.
