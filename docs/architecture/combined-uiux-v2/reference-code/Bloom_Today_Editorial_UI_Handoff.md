# Bloom v0.6 — Combined Brand / Architect / Developer Handoff
## Editorial UI primitives + source-preserving TodayFocus redesign

**Prepared:** 2026-11-10  
**Repository:** `knagle-max/BloomGutHealth`  
**Reviewed development baseline:** `enhance/bloom-experience` at `506c43c8e48291bc50b75d2a13190ff54029e81f`  
**Status:** Design/implementation proposal **only**; no code committed, no CI run, no Render release verified.  
**Review owners:** Brand & Visual Design Specialist → Chief Architect & Integration Lead → designated UI developer/Codex.

## Executive decision

**Approve the visual direction for review; do not paste the owner's proposed replacement unmodified.** The proposed `TodayFocus.tsx` improves editorial hierarchy and action prominence but removes source disclosures and existing media. Adapt the proposed `SurfaceCard`, `TelemetryMetric`, and `EditorialHero` into existing tokens and components, not a parallel design framework. The revised reference files below preserve the current Today workflow and add a visual layer.

### Current source audit

| Existing code | Required handling |
| --- | --- |
| `client/src/components/TodayFocus.tsx` | Preserve canonical recommendation selection, loading, fallback, goals, action intent/choice, error and retry paths. |
| `client/src/components/CompanionHero.tsx` | **Reuse** as the underlying hero; it provides `<section aria-labelledby>`, an `h2` with `id="today-action-title"` and `tabIndex={-1}`, media placement and actions. |
| `client/src/components/EditorialMedia.tsx` | Preserve `slot="today"` and the existing priority/fallback behaviors. |
| `CheckinSourceDetails`, `FoodSourceDetails`, `MovementSourceDetails` | Preserve **all three**; the proposed owner replacement omitted the first two. |
| `WellnessChoiceDetails` / `useWellnessChoices` | Preserve actual intention lifecycle, alternatives, save-for-later, not-relevant, exact retry and history; no silent changes to logic. |
| `client/src/components/ui/card.tsx` | Do not replace every existing card with a new surface; restrict new surfaces to a clear design use. |
| `client/src/brand-tokens.css`, `client/src/index.css` | The source of truth for Everyday/Athlete, light/dark, type, size, contrast and motion. |
| `client/public/brand/design-tokens.json` | Reference brand concepts; existing runtime CSS tokens take precedence if different. |
| `ui/primitives.tsx` | **Not currently present** in the reviewed baseline. Create only if Brand and Architect approve the constrained extension. |

### Mandatory preservation and acceptance criteria

1. **No functional regressions:** Same `todayContextAction`, `useQuery` identity/version checks, `useWellnessChoices` controller, selected/action eligibility conditions, session fallback, action intent flows, focused heading behavior, and skip-for-visit semantics. Keep the distinction between *intended*, *performed*, and *observed*.
2. **Keep media:** Retain `EditorialMedia` on eligible states, including its raster→SVG fallback, illustration labeling and responsive sizing. Avoid replacing all photography with a dark emerald gradient.
3. **Keep provenance:** Show `CheckinSourceDetails`, `FoodSourceDetails` and `MovementSourceDetails`, including unknown/incomplete/withdrawn source states. Never hide unavailable data as healthy or sufficient.
4. **Keep scientific limitations:** Source-linked rationale, limitations, not-measured semantics and external research links remain accurate. No fabricated mechanistic effects, range classifications, nutrient deficits or implicit causal claims.
5. **Reuse hero:** The `EditorialHero` below delegates to `CompanionHero`, preserving accessible heading semantics. It does **not** create an independent second hero rendering engine.
6. **Theme safely:** All colors are from `--primary`, `--card`, `--muted`, `--foreground`, `--border` etc. No fixed emerald/stone/slate text on light cards. Monospace is for selected telemetry metadata, not every action label.
7. **Design discipline:** Use elevated surfaces sparingly. `SurfaceCard` does not add pulsing green medical badges, and `TelemetryMetric` does not infer risk, ranges, or beneficial trends.
8. **Accessibility:** Minimum 44px interactive controls, visible focus, working h2 focus restoration, keyboard-expanded evidence, 200% zoom, reduced-motion support, mobile widths (320/390/768/1440), light/dark and Everyday/Athlete modes.
9. **QA and source lifecycle:** Test goals-only, no food, missing nutrient data, session fueling, valid proposed action, selected saved choice, paused suggestion, failed wellness fetch, failed session fetch, incomplete saved action history, stale actions, deleted/edited records and account switch.
10. **No main merge on review alone:** Brand recommends visual direction; Architect reconciles contracts and version drift; UI agent implements on isolated feature branch; Codex/integration owner runs actual app/API/SQL plus visual/accessibility regressions and PR CI before integration.

## Design recommendations

- Main focus first: readable personal action, clear supporting reason, primary CTA, optional alternative action.
- Use warm, tactile layers and photography; avoid an over-dark hero that consumes the page.
- Label deep disclosure **“Why this recommendation?”** rather than clinical “Biological Rationale & Sources”; keep detailed science and source links inside.
- Keep Today approachable and Biology more precise/dense. `TelemetryMetric` is primarily for recorded metrics and deeper biological views, not decorative labeling of every suggestion.
- Avoid duplicating `Card`/`CompanionHero` APIs. The new primitives are a small, reversible proposal, not a directive for mass replacement.

## Files to supply to developer

- `TodayFocus.tsx` → proposed replacement for `client/src/components/TodayFocus.tsx`.
- `primitives.tsx` → proposed new `client/src/components/ui/primitives.tsx`.
- `today-editorial.css` → proposed new `client/src/components/ui/today-editorial.css`, imported by `primitives.tsx`.

**Implementation notes:** These are reviewed against current source interfaces, but **have not been typechecked, built, browser-tested, or deployed**. In particular, Codex must diff against branch HEAD immediately before applying the code, preserve any newer activity/nutrition changes, and adjust if APIs or class precedence changed. The sample intentionally avoids changing `CompanionHero.tsx`, backend schemas or data policy.

## Required delivery report

Brand: adopt/modify/reject verdict for each primitive, visuals against the current photographic Today, brand token decisions, and responsive mockups.  
Architect: source/feature-preservation diff, component ownership and shared-style compatibility, explicit go/no-go for UI implementation.  
Developer: link to feature PR, screenshots of Today and Biology in supported modes, test output, same-SHA CI, accessibility/keyboard check, Render preview confirmation and no known source-provenance regression.

---

# Reference implementation code

The exact source files follow and are also provided separately for direct inspection. If Brand changes the direction, preserve the functional requirements above instead of copying the sample blindly.

## `primitives.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import CompanionHero from "@/components/CompanionHero";
import "./today-editorial.css";

/**
 * Presentation-only surfaces. Do not use these variants to imply a clinical
 * classification, verified reference interval, or data availability.
 */
export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "editorial" | "telemetry" | "glass";
}

export const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bloom-surface min-w-0 rounded-2xl border border-border text-foreground",
        variant === "default" && "bg-card shadow-sm",
        variant === "editorial" && "bg-gradient-to-br from-card via-card to-muted/70 shadow-md",
        variant === "telemetry" && "bg-muted/40 shadow-inner",
        variant === "glass" && "bg-card/85 shadow-sm supports-[backdrop-filter]:bg-card/75 supports-[backdrop-filter]:backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
SurfaceCard.displayName = "SurfaceCard";

/** A recorded/derived metric display. Status is explicitly supplied, never inferred. */
export interface TelemetryMetricProps {
  label: string;
  value: string | number | null;
  unit?: string;
  statusLabel?: string;
  trendLabel?: string;
  sourceLabel?: string;
  className?: string;
}
export function TelemetryMetric({
  label, value, unit, statusLabel, trendLabel, sourceLabel, className,
}: TelemetryMetricProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-3xl font-medium tracking-tight tabular-nums text-foreground">
          {value === null ? "Not available" : value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {statusLabel && <p className="text-xs text-muted-foreground">{statusLabel}</p>}
      {trendLabel && <p className="text-xs text-muted-foreground">{trendLabel}</p>}
      {sourceLabel && <p className="text-xs text-muted-foreground">Source: {sourceLabel}</p>}
    </div>
  );
}

/**
 * Editorial hero is a skin on the EXISTING CompanionHero. It retains
 * aria-labelledby, its focusable h2, image slot, and existing action structure.
 * No second independent hero implementation is introduced.
 */
export interface EditorialHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions: React.ReactNode;
  children?: React.ReactNode;
  media?: React.ReactNode;
  className?: string;
  headingId?: string;
  icon?: string;
}
export function EditorialHero({
  description, className, headingId = "today-action-title", ...props
}: EditorialHeroProps) {
  return (
    <CompanionHero
      {...props}
      headingId={headingId}
      reason={description}
      className={cn("today-focus--editorial", className)}
    />
  );
}

```

## `TodayFocus.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { WellnessContext } from "@shared/wellness-context";
import { apiRequest } from "@/lib/queryClient";
import { todayContextAction } from "@shared/today-focus";
import { localDate, useExperienceRecords } from "@/lib/experience";
import { useWellnessChoices } from "@/lib/wellness-choices";
import EditorialMedia from "./EditorialMedia";
import CheckinSourceDetails from "./CheckinSourceDetails";
import FoodSourceDetails from "./FoodSourceDetails";
import MovementSourceDetails from "./MovementSourceDetails";
import WellnessChoiceDetails from "./WellnessChoiceDetails";
import { EditorialHero, SurfaceCard } from "@/components/ui/primitives";

/**
 * Visual-only revision of existing TodayFocus. Keep the existing canonical
 * recommendation, user-choice, stale-source, and logged-versus-intended logic.
 */
export default function TodayFocus({
  now,
  mealCount = 0,
  missingNutritionCount = 0,
  loading = false,
  journalError = false,
}: {
  now?: Date;
  mealCount?: number;
  missingNutritionCount?: number;
  loading?: boolean;
  journalError?: boolean;
}) {
  const { user } = useAuth();
  const [skipped, setSkipped] = useState<string | null>(null);
  const pendingFocus = useRef(false);
  const current = now || new Date();

  const report = useQuery<WellnessContext>({
    queryKey: ["/api/precision/wellness-context", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const value = await (
        await apiRequest("GET", "/api/precision/wellness-context")
      ).json();
      if (
        value.accountScope !== user?.id ||
        value.version !== "wellness-context-2026-11-07.1" ||
        !Array.isArray(value.goals) ||
        !Array.isArray(value.sources)
      ) {
        throw Error("Your saved goal context could not be confirmed.");
      }
      return value;
    },
  });

  const goal =
    report.fetchStatus === "idle" && !report.isError && !report.isStale
      ? report.data?.goals.find((g) => g.id !== "unmapped")
      : undefined;

  const sessions = useExperienceRecords("session");
  const action = todayContextAction({
    now: current,
    mealCount,
    missingNutritionCount,
    loading,
    unavailable: journalError,
    goal,
    sessions:
      sessions.fetchStatus === "idle" && !sessions.isError && !sessions.isStale
        ? sessions.data?.flatMap((r) => (r.kind === "session" ? [r.payload] : []))
        : undefined,
  });

  const actionKey = JSON.stringify([user?.id, localDate(current), action]);
  const paused = !loading && !journalError && skipped === actionKey;

  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false;
      document.getElementById("today-action-title")?.focus();
    }
  }, [skipped, paused]);

  const sessionAction = action.href === "/athlete/fueling";
  const choices = useWellnessChoices(
    { date: localDate(current), timezoneOffset: current.getTimezoneOffset() },
    true,
  );

  const selected =
    !paused && !loading && !journalError && !missingNutritionCount && !sessionAction
      ? choices.current?.actions.find(
          (a) => a.action.id === choices.current?.primaryActionId && a.eligible,
        )
      : undefined;
  const proposed = selected?.action.category !== "routine" ? selected : undefined;
  const chosen = proposed?.choice && proposed.choice.choice !== "clear";

  const title = paused
    ? "Suggestion paused"
    : proposed
      ? proposed.action.title
      : loading
        ? "Make space for today"
        : journalError
          ? "Keep a place for your day"
          : !mealCount
            ? "Start with a meal"
            : missingNutritionCount
              ? "A clearer food picture"
              : sessionAction
                ? "Fuel your planned session"
                : "One good next step";

  const reason = paused
    ? "Paused for this visit. Bring the suggestion back when you are ready."
    : proposed
      ? proposed.action.description
      : action.reason;

  const sourceLoading = choices.source.fetchStatus !== "idle";

  return (
    <EditorialHero
      headingId="today-action-title"
      eyebrow={proposed ? "WHAT YOU CAN TRY" : "A LITTLE CARE, EVERY DAY"}
      title={title}
      description={reason}
      media={
        !loading && !journalError ? (
          <EditorialMedia
            slot="today"
            sizes="(max-width:767px) 100vw, 800px"
            priority
          />
        ) : undefined
      }
      actions={
        <>
          {proposed ? (
            chosen ? (
              <Link className="hero-button" href={proposed.action.href}>
                {proposed.action.linkLabel}
              </Link>
            ) : (
              <button
                type="button"
                className="hero-button"
                disabled={choices.busy || choices.waiting || !choices.sourceReady}
                onClick={() => choices.choose(proposed.action.id, "try", true)}
              >
                Try this
              </button>
            )
          ) : (
            <Link className="hero-button" href="/log-meal">Add food</Link>
          )}

          {proposed && <Link className="text-link" href="/log-meal">Add food</Link>}

          {paused ? (
            <button
              type="button"
              className="text-link"
              onClick={() => { pendingFocus.current = true; setSkipped(null); }}
            >
              Show suggestion
            </button>
          ) : (
            <>
              {!proposed && action.href !== "/log-meal" && (
                <Link className="text-link" href={action.href}>{action.label}</Link>
              )}
              {!choices.current && !loading && !journalError && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => { pendingFocus.current = true; setSkipped(actionKey); }}
                >
                  Skip for now
                </button>
              )}
            </>
          )}

          <Link className="text-link" href="/precision?tab=overview&edit=goals">
            Adjust goals
          </Link>
        </>
      }
    >
      <WellnessChoiceDetails
        controller={choices}
        selected={selected}
        showAlternatives={
          !paused && !loading && !journalError && !missingNutritionCount && !sessionAction
        }
      />

      {report.error && (
        <p role="alert" className="panel-note">
          Your saved focus could not load. This general routine suggestion remains
          available; retry My biology to review your saved goals.
        </p>
      )}
      {sessions.isError && (
        <p role="status" className="panel-note">
          Training schedule unavailable. This action uses your journal and saved focus only.
        </p>
      )}

      <details className="today-focus-evidence">
        <summary className="min-h-11 cursor-pointer">Why this recommendation?</summary>
        <SurfaceCard variant="telemetry" className="mt-3 space-y-4 p-4 sm:p-5">
          {proposed ? (
            <>
              <h3 className="text-base font-medium">{proposed.action.title}</h3>
              <p className="text-sm leading-relaxed">{proposed.reason}</p>
              <p className="text-sm text-muted-foreground">{proposed.action.limitation}</p>
              {choices.current?.sources
                .filter((s) => proposed.action.sourceIds.includes(s.id))
                .map((s) => (
                  <p key={s.id} className="text-sm text-muted-foreground">
                    <a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                    {" — "}{s.limitation}
                  </p>
                ))}
            </>
          ) : (
            <>
              {goal && <h3 className="text-base font-medium">{goal.mapping}</h3>}
              <p className="text-sm leading-relaxed">
                {goal?.actions[0] ||
                  "This step uses your food journal and available saved context. Unlogged intake does not establish a nutrient deficit."}
              </p>
              {goal && (
                <div className="space-y-2">
                  {report.data?.sources
                    .filter((s) => goal.sourceIds.includes(s.id))
                    .map((s) => (
                      <p key={s.id} className="text-sm text-muted-foreground">
                        <a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title}
                        </a>
                        {" — "}{s.limitation}
                      </p>
                    ))}
                </div>
              )}
            </>
          )}

          {/* Keep every source-aware disclosure from the current implementation. */}
          <CheckinSourceDetails
            sources={choices.current?.checkinSources}
            loading={sourceLoading}
          />
          <FoodSourceDetails
            sources={choices.current?.foodSources}
            date={choices.current?.day.date ?? localDate(current)}
            loading={sourceLoading}
          />
          <MovementSourceDetails
            sources={choices.current?.movementSources}
            date={choices.current?.day.date ?? localDate(current)}
            loading={sourceLoading}
          />

          <nav className="flex flex-wrap gap-4 border-t border-border pt-3" aria-label="Today related pages">
            <Link className="text-link" href={mealCount ? "/log-meal" : "/plan-day"}>
              {mealCount ? "Log another meal" : "Plan meals"}
            </Link>
            <Link className="text-link" href="/explore">Explore why foods matter</Link>
            <Link className="text-link" href="/progress">Review my progress</Link>
          </nav>
        </SurfaceCard>
      </details>
    </EditorialHero>
  );
}

```

## `today-editorial.css`

```css
/* Optional, tightly scoped visual enhancement to the existing Today hero.
   Existing .today-focus and brand tokens remain authoritative. */
.today-focus.today-focus--editorial {
  border-radius: var(--surface-radius, 16px);
  border: 1px solid hsl(var(--card-border));
  background: linear-gradient(142deg, hsl(var(--card)), hsl(var(--muted) / 0.42));
  box-shadow: 0 12px 36px hsl(var(--foreground) / 0.06);
  min-width: 0;
}
.today-focus--editorial .today-focus-heading h2 {
  font-family: var(--font-display, var(--font-sans));
  font-weight: 450;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.today-focus--editorial .today-focus-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.today-focus--editorial .today-focus-actions .hero-button {
  min-height: 44px;
  margin: 0;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius, 10px);
}
.today-focus--editorial .today-focus-actions .text-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.today-focus--editorial .today-focus-evidence {
  min-width: 0;
}
.today-focus--editorial .today-focus-evidence summary {
  font-weight: 600;
  color: hsl(var(--foreground));
}
.today-focus--editorial :is(a, button, summary):focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 3px;
}
.today-focus--editorial .bloom-surface { max-width: 100%; }
@media (prefers-reduced-motion: reduce) {
  .today-focus--editorial *, .today-focus--editorial *::before, .today-focus--editorial *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

```


---

# Addendum: Biology / Microbiome Telemetry Refactor

# Bloom v0.6 — Biology & Microbiome Telemetry Design Addendum

**For:** Brand & Visual Design Specialist → Chief Architect → UI Development Agent

**Repository review:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, commit `506c43c8e48291bc50b75d2a13190ff54029e81f` (2026-11-10). **Status:** proposed adaptation, not installed, typechecked, CI-tested or deployed.

## Decision

**Adopt the progressive-disclosure and telemetry styling concept with substantial scientific and architectural changes. Reject a direct replacement of the Biology route.** The supplied `BiologyOverview.tsx` is not present in the current development repository. `client/src/components/BiologyHome.tsx` is the navigation overview for bloodwork, gut reports, genetics and measurements. The source-aware gut-report interface is `client/src/pages/Microbiome.tsx`, with report management, comparisons, organism profiles, research views and owner-scoped queries. Do not replace either page with the proposed minimal implementation.

### Critical scientific corrections

- **Remove all example figures** `8.4`, `14.2%`, `1.18`, `Normal`: none is linked to verified saved report measurements. Do not label a hypothetical index “High Stability”, abundance “Optimal SCFA”, ratio “Balanced”, or barrier marker “Low Inflammation”.
- **No top-line “biological confidence” or universal health score.** Bloom can honestly describe report availability, original source count and method completeness, but not assign a numeric health/confidence interpretation without a validated source-specific model.
- **Do not treat taxa abundances as SCFA measurement.** Taxon identity/abundance is not measured metabolite output, active metabolism, gene expression or clinical barrier function. Firmicutes/Bacteroidetes ratios are not automatically valid health metrics.
- **Remove the methodology sentence** “Shotgun metagenomic sequencing targeting 16S rRNA V3–V4.” Shotgun metagenomics and 16S amplicon sequencing are different methods. Display the actual report-supplied assay if known; otherwise “Method not recorded.”
- **Remove fake reference fallback** “Standard reference sequence NCBI-txid562 applied.” No such source or standard can be invented. A research citation is only shown when already associated with the actual report's scientific content and verified in the current context.
- **Do not use `/api/precision/wellness-context` as a proxy for microbiome report data.** It is the goal/action context feed, not a source for per-report diversity, taxa, sampling method or measured SCFA. Reuse the owned, existing `/api/microbiome/samples` and `/api/microbiome/results` data pathways and freshness guards.
- **Avoid “Log Intake to Map SCFA Impact.”** Logging food alone does not measure or establish an effect on SCFA production. Prefer “Log a meal”, “Review foods”, or “Explore research” with explicit limitations.

## Correct implementation strategy

1. Preserve `BiologyHome.tsx` as the biology workspace navigation; keep its real results and source-review counts, not a single invented health score. Preserve the user's ability to reach bloodwork, genetics, gut reports and measurements.
2. Preserve `Microbiome.tsx`: query keys/account-scoped selection, saved-report date/processing status, upload link, source deletion confirmation, Viome report relationship management, current taxon browser, original-report compare, result tabs, method limits, provenance, research links, original source downloads and organism profiles. Do not replace these with an unrelated local tab switcher.
3. Add the **optional `BiologyReportTelemetry` component** to the existing *selected report* section only **after `currentResults` is confirmed**. Display just source-authentic values: numeric saved diversity index if recorded, number of source rows with numeric abundance, provider/date/processing context. Unknown ≠ zero. No status/color classifications.
4. Reuse the proposed `TelemetryMetric` and `SurfaceCard` primitives from the earlier Today package, if Brand approves; the existing token-safe version already accepts nullable values, status labels and source labels. Keep surface wrappers sparse. Avoid nested dark dashboard cards.
5. Keep existing saved report date/age/assay limits, method-specific comparability statements and external research citations where genuinely recorded. Research associations must remain distinct from personal measurements.
6. A 3-second top layer should explain **what data exists and where to act next**, not pretend to know a user's gut health. Deeper layer uses native `<details>` with accessible labels and original-source links.

## Proposed code files

- `BiologyReportTelemetry.tsx` → add `client/src/components/BiologyReportTelemetry.tsx`.
- `primitives.tsx` → reuse the prior handoff's existing implementation, with token-based `TelemetryMetric` **as-is**. Do not replace it with a second copy from the user's snippet.
- `Microbiome.tsx` → **minimal insertion** (see exact patch below), not a wholesale rewrite.

### Safe integration patch for `client/src/pages/Microbiome.tsx`

Insert this import alongside existing component imports:

```tsx
import BiologyReportTelemetry from "@/components/BiologyReportTelemetry";
```

Inside the **existing** `{tab === "results" && currentResults && ( ... )}` selected report block, immediately after the current report summary/note and **before** its existing `Methods & historical analysis limits` `<details>` (and without removing `ImportedReportDetails`), add:

```tsx
<BiologyReportTelemetry
  diversityIndex={currentResults.sample.diversityIndex}
  quantifiedTaxaCount={currentResults.bacterial_composition.filter(
    (item: ReportedTaxon) =>
      typeof item.abundance === "number" && Number.isFinite(item.abundance)
  ).length}
  reportDate={reportDateText(currentResults.sample)}
  testingCompany={currentResults.sample.testingCompany}
  processingStatus={currentResults.sample.processingStatus}
/>
```

The page already imports `ReportedTaxon` and `reportDateText`. Optional: remove the *redundant* `gut-report-facts` summary only after verifying equivalent information is preserved by the new component, with no functional/regression changes. It is acceptable to retain both for first review.

**No new query, API endpoint, data store, fabricated report fields, ML health scoring, route replacement or persistence changes.** This addition is strictly presentational.

## Required QA / acceptance

- With a saved report: correct source-linked count and numeric diversity only when present; provider/date/processing status correct.
- Missing diversity: display “Not available”, not `0`, not a synthetic score. Missing method remains unknown.
- Relative abundance is never labeled actual SCFA production, absolute organism count, barrier integrity or inflammation.
- If report loading fails or source is deleted or account switches, the old telemetry disappears with the source; preserve existing loading/empty/error/ownership logic.
- Source reports from different methods remain independent, and same-day reports are not merged; comparison never makes an unsupported trend claim.
- Existing original report, source deletion, Viome saved context, filtered organism lists, historical analysis warnings, bibliography links and modal keyboard navigation continue to function.
- Accessible at 320/390/768/1440 widths; Everyday/Athlete and light/dark themes; doubled text/page zoom; keyboard and reduced motion.
- Before/after screenshots must prove legibility and an improved surface/deep-information hierarchy; TypeScript, production build, existing browser suites and full relevant CI must pass.

## Brand review request

Propose a source-aware *microbiome report overview* that feels warm, tactile and editorial at the surface and precise in deeper metric displays. Compare original BiologyHome + Microbiome pages against a minimal additive design, **without inventing scores or replacing the current research/report workflows**. Evaluate whether telemetry is materially useful here; reject excess card density if it is not.

## Architect disposition

Only authorize the UI implementation after rechecking the latest branch, confirming the report data contract, and specifying non-overlapping ownership with ongoing Codex work. This addendum supplements, not replaces, the TodayFocus/primitives handoff. No feature is represented as already shipped.

---

## Reference code: `BiologyReportTelemetry.tsx`

```tsx
import { SurfaceCard, TelemetryMetric } from "@/components/ui/primitives";

/**
 * Presentation-only view of fields already read from ONE owned gut report.
 * Parent page owns source selection, account/freshness checks, and queries.
 * Never infer health status, microbial function or clinical reference ranges.
 */
export interface BiologyReportTelemetryProps {
  diversityIndex: number | string | null | undefined;
  quantifiedTaxaCount: number;
  reportDate: string;
  testingCompany?: string | null;
  processingStatus?: string | null;
}

export default function BiologyReportTelemetry({
  diversityIndex,
  quantifiedTaxaCount,
  reportDate,
  testingCompany,
  processingStatus,
}: BiologyReportTelemetryProps) {
  // Do not coerce "unknown", missing, or unsupported imported strings to numbers.
  // A numerical diversity index is still method-dependent, not a health score.
  const savedDiversity =
    typeof diversityIndex === "number" && Number.isFinite(diversityIndex)
      ? diversityIndex
      : null;
  const countedTaxa =
    Number.isSafeInteger(quantifiedTaxaCount) && quantifiedTaxaCount >= 0
      ? quantifiedTaxaCount
      : null;
  const provider = testingCompany?.trim() || "Provider not recorded";

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="gut-report-telemetry-heading">
      <div className="space-y-1">
        <p className="eyebrow">RECORDED REPORT DATA</p>
        <h3 id="gut-report-telemetry-heading" className="text-xl font-medium tracking-tight">
          At a glance
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These values describe the selected report. They are not a microbiome health
          score, directly measured SCFA production, or a measure of gut barrier function.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SurfaceCard variant="default" className="p-4 sm:p-5">
          <TelemetryMetric
            label="Saved diversity index"
            value={savedDiversity}
            statusLabel="Reported value; method-dependent"
            sourceLabel={`${provider} · ${reportDate}`}
          />
        </SurfaceCard>
        <SurfaceCard variant="default" className="p-4 sm:p-5">
          <TelemetryMetric
            label="Taxa with a numeric reported abundance"
            value={countedTaxa}
            statusLabel="Count of reported entries, not an absolute organism count"
            sourceLabel={`${provider} · ${reportDate}`}
          />
        </SurfaceCard>
      </div>
      <details className="workspace-disclosure min-w-0">
        <summary className="min-h-11 cursor-pointer">How to interpret these report values</summary>
        <div className="space-y-2 pt-3 text-sm text-muted-foreground">
          <p>Report date: {reportDate}. Laboratory/provider: {provider}.</p>
          {processingStatus && <p>Saved processing state: {processingStatus}.</p>}
          <p>
            The saved diversity index is an imported value. Its calculation,
            comparability and biological meaning depend on the source method;
            no universal healthy cutoff is applied.
          </p>
          <p>
            The numeric-taxa count describes which source rows contain a
            numerical abundance. Relative abundance does not establish absolute
            organism count, metabolite output, gene expression or function.
          </p>
          <p>
            Do not infer SCFA production, gut permeability, inflammation or
            intervention effects without appropriate separate measurements and
            independently validated interpretation.
          </p>
          <p>
            Review the original report, organism table, saved source identifiers
            and methods disclosures elsewhere on this page for detail. Missing
            methods must remain explicitly unknown.
          </p>
        </div>
      </details>
    </section>
  );
}

```