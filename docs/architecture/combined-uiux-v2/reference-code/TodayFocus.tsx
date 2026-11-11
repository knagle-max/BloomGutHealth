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