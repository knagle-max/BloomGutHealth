import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FlaskConical,
  ArrowRight,
  BookOpen,
  Sparkles,
  Loader2,
  Check,
  Sprout,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import {
  goals,
  type GoalId,
  type ExclusionId,
  type CoachRequest,
  type SciencePlan,
} from "@shared/science-coach";

const exclusions: Array<{ id: ExclusionId; label: string }> = [
  { id: "dairy", label: "Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "legumes", label: "Legumes" },
  { id: "alliums", label: "Onion / garlic" },
  { id: "fermented", label: "Fermented foods" },
];
const defaultRequest: CoachRequest = {
  goals: ["butyrate"],
  exclusions: [],
  sensitiveGut: false,
  aiConsent: false,
  preferences: "",
};

function GoalForm({ userId }: { userId: string }) {
  const storageKey = `bloom-science-preferences:${userId}`;
  const [request, setRequest] = useState<CoachRequest>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      // Only restore the supported choices; AI consent must be given for each visit.
      if (saved && Array.isArray(saved.goals))
        return {
          ...defaultRequest,
          goals: saved.goals.filter((id: GoalId) =>
            goals.some((goal) => goal.id === id),
          ),
          exclusions: Array.isArray(saved.exclusions)
            ? saved.exclusions.filter((id: ExclusionId) =>
                exclusions.some((group) => group.id === id),
              )
            : [],
          sensitiveGut: saved.sensitiveGut === true,
        };
    } catch {
      /* A disabled or invalid storage entry should not block the coach. */
    }
    return defaultRequest;
  });
  const status = useQuery<{ aiAvailable: boolean }>({
    queryKey: ["/api/science/status"],
  });
  const generate = useMutation({
    mutationFn: async (selection: CoachRequest) =>
      (await (
        await apiRequest("POST", "/api/science/plan", selection)
      ).json()) as SciencePlan,
  });
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          goals: request.goals,
          exclusions: request.exclusions,
          sensitiveGut: request.sensitiveGut,
        }),
      );
    } catch {
      /* Storage is optional. */
    }
  }, [request.goals, request.exclusions, request.sensitiveGut, storageKey]);
  const toggleGoal = (id: GoalId) =>
    setRequest((current) => ({
      ...current,
      goals: current.goals.includes(id)
        ? current.goals.filter((goal) => goal !== id)
        : [...current.goals, id],
    }));
  const toggleExclusion = (id: ExclusionId) =>
    setRequest((current) => ({
      ...current,
      exclusions: current.exclusions.includes(id)
        ? current.exclusions.filter((group) => group !== id)
        : [...current.exclusions, id],
    }));
  const plan = generate.data;
  const changed =
    plan && JSON.stringify(generate.variables) !== JSON.stringify(request);

  return (
    <main className="science-page">
      <div className="science-heading">
        <p className="eyebrow">THE SCIENCE OF SMALL CHANGES</p>
        <h1>Give your diet a direction.</h1>
        <p>
          Your goal. The biology behind it. Food choices with evidence you can
          inspect.
        </p>
      </div>
      <form
        className="bloom-panel science-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (request.goals.length && !generate.isPending)
            generate.mutate(request);
        }}
      >
        <fieldset disabled={generate.isPending}>
          <legend>What would you like to explore?</legend>
          <p className="muted mb-4">
            Choose one or more goals. Research-only goals can return an
            explanation without a food prescription.
          </p>
          <div className="goal-grid">
            {goals.map((goal) => (
              <button
                type="button"
                key={goal.id}
                className="goal-choice"
                aria-pressed={request.goals.includes(goal.id)}
                onClick={() => toggleGoal(goal.id)}
              >
                <span className="goal-check">
                  {request.goals.includes(goal.id) ? (
                    <Check size={15} />
                  ) : (
                    <Sprout size={15} />
                  )}
                </span>
                <strong>{goal.label}</strong>
                <span>{goal.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset
          disabled={generate.isPending}
          className="science-restrictions"
        >
          <legend>Make it fit your life</legend>
          <p className="muted">Exclude these food groups</p>
          <div className="exclusion-options">
            {exclusions.map((group) => (
              <label key={group.id}>
                <input
                  type="checkbox"
                  checked={request.exclusions.includes(group.id)}
                  onChange={() => toggleExclusion(group.id)}
                />
                {group.label}
              </label>
            ))}
          </div>
          <label className="science-checkbox">
            <input
              type="checkbox"
              checked={request.sensitiveGut}
              onChange={(event) =>
                setRequest((current) => ({
                  ...current,
                  sensitiveGut: event.target.checked,
                }))
              }
            />
            <span>
              A sensitive gut: skip the more fermentable options in this catalog
            </span>
          </label>
          <p className="panel-note">
            These filters cover the listed catalog groups. Check actual
            ingredients and product labels for your allergies. They do not
            constitute a low-FODMAP diet or clinical plan.
          </p>
        </fieldset>
        <details className="ai-options">
          <summary>
            <Sparkles size={17} /> Optional AI prioritization{" "}
            <ChevronDown size={15} />
          </summary>
          <p className="muted mt-3">
            AI can prioritize the cited options. It cannot create new biological
            claims or make cohort matching promises.
          </p>
          {status.data?.aiAvailable ? (
            <>
              <label className="science-checkbox">
                <input
                  type="checkbox"
                  checked={request.aiConsent}
                  onChange={(event) =>
                    setRequest((current) => ({
                      ...current,
                      aiConsent: event.target.checked,
                    }))
                  }
                />
                <span>
                  Use AI for this plan. Send my selected goals, restrictions,
                  food-familiarity flags, and optional preferences to OpenAI.
                </span>
              </label>
              <label
                htmlFor="science-preferences"
                className="block text-sm mb-2"
              >
                Preferences for prioritization
              </label>
              <Textarea
                id="science-preferences"
                value={request.preferences}
                maxLength={600}
                onChange={(event) =>
                  setRequest((current) => ({
                    ...current,
                    preferences: event.target.value,
                  }))
                }
                placeholder="For example: quick breakfasts and foods I can add to family dinners"
              />
              <p className="panel-note">
                Raw meal descriptions and account identifiers are not sent.
                Preferences stay in memory and are not saved in this form.
              </p>
            </>
          ) : (
            <p className="panel-note">
              {status.isLoading
                ? "Checking AI availability…"
                : status.isError
                  ? "Could not check AI availability. You can still generate a curated evidence plan."
                  : "AI ranking is not configured on this server. The cited evidence planner is available."}
            </p>
          )}
        </details>
        {generate.isError && (
          <p role="alert" className="text-destructive text-sm">
            {generate.error.message}
          </p>
        )}
        <Button
          type="submit"
          className="h-12"
          disabled={!request.goals.length || generate.isPending}
        >
          {generate.isPending ? (
            <>
              <Loader2 size={17} className="animate-spin mr-2" /> Building your
              evidence plan…
            </>
          ) : (
            <>
              Build my evidence plan <ArrowRight size={17} className="ml-3" />
            </>
          )}
        </Button>
        <p className="panel-note">
          Goal and food-filter selections are saved on this device for your
          account.
        </p>
      </form>
      {plan && (
        <section
          className="science-results"
          aria-label="Your evidence plan"
          aria-live="polite"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR EVIDENCE PLAN</p>
              <h2>From goal to food.</h2>
            </div>
            <span className="evidence-pill">
              {plan.mode === "ai-ranked"
                ? "AI prioritized"
                : "Curated evidence"}
            </span>
          </div>
          {changed && (
            <p role="status" className="science-callout">
              Your selections changed. Build a new plan to apply them; the plan
              below uses your previous selections.
            </p>
          )}
          <p className="muted">{plan.aiStatus}</p>
          <div className="science-baseline">
            <span>{plan.baseline.loggedMeals} recent meals reviewed</span>
            <span>Evidence set {plan.evidenceVersion}</span>
            <span>{plan.withheldActions} food options filtered out</span>
          </div>
          {plan.goals.map((goal) => (
            <article className="bloom-panel pathway-card" key={goal.id}>
              <div className="panel-heading">
                <h2>{goal.label}</h2>
                <FlaskConical size={21} />
              </div>
              <p className="science-boundary">{goal.boundary}</p>
              {plan.pathways
                .filter((path) => goal.pathwayIds.includes(path.id))
                .map((path) => (
                  <div className="biology-chain" key={path.id}>
                    <div>
                      <span>MOLECULE / OUTCOME</span>
                      <p>{path.molecules.join(" · ")}</p>
                    </div>
                    <div>
                      <span>MICROBIAL FUNCTION</span>
                      <p>{path.microbialFunction}</p>
                    </div>
                    <div>
                      <span>ORGANISMS INVOLVED</span>
                      <p>{path.organisms.join(" · ")}</p>
                    </div>
                    <div>
                      <span>SUBSTRATE / CONTEXT</span>
                      <p>{path.substrate}</p>
                    </div>
                    <p className="chain-explanation">{path.relationship}</p>
                    <span className="evidence-pill">{path.evidence}</span>
                    <SourceLinks ids={path.sourceIds} plan={plan} />
                  </div>
                ))}
            </article>
          ))}
          <div className="section-heading">
            <h2>Food changes to consider</h2>
            <span className="muted">Choose one to start</span>
          </div>
          {plan.actions.length ? (
            plan.actions.map((action, index) => (
              <article className="bloom-panel food-action" key={action.id}>
                <div className="food-action-heading">
                  <span className="action-number">{index + 1}</span>
                  <div>
                    <p className="eyebrow">
                      {action.evidenceType === "human-intervention"
                        ? "PART OF A HUMAN-TESTED PATTERN"
                        : "FOOD TRANSLATION · INDIRECT EVIDENCE"}
                    </p>
                    <h3>{action.title}</h3>
                  </div>
                </div>
                <p className="food-practical">{action.practicalStep}</p>
                <p className="food-personalization">{action.personalization}</p>
                <details>
                  <summary>
                    Why this option? <ChevronDown size={15} />
                  </summary>
                  <p>
                    <strong>Scientific basis:</strong> {action.scientificBasis}
                  </p>
                  <p>
                    <strong>Where evidence stops:</strong>{" "}
                    {action.translationLimit}
                  </p>
                  <p>
                    <strong>What to monitor:</strong> {action.monitoring}
                  </p>
                  <SourceLinks ids={action.sourceIds} plan={plan} />
                </details>
              </article>
            ))
          ) : (
            <div className="bloom-panel">
              <h3>No supported food action in this evidence set.</h3>
              <p className="muted mt-3">
                The selected goals are research-only, or your restrictions
                removed the available options. The coach keeps that gap visible
                instead of inventing a recommendation.
              </p>
            </div>
          )}
          <section className="bloom-panel">
            <p className="eyebrow">WHAT WOULD WE NEED TO KNOW?</p>
            <h2>Make the next step measurable.</h2>
            <ul className="science-next-steps">
              {plan.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="science-boundary">{plan.cohortStatus}</p>
            <p className="panel-note">{plan.measurementStatus}</p>
          </section>
          <section className="bloom-panel evidence-library">
            <p className="eyebrow">FOLLOW THE EVIDENCE</p>
            <h2>The research behind your plan</h2>
            {plan.sources.map((source) => (
              <details key={source.id} id={`evidence-${source.id}`}>
                <summary>
                  <BookOpen size={17} />
                  <span>
                    {source.authors} · {source.year}
                  </span>
                  <ChevronDown size={15} />
                </summary>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title} ↗
                </a>
                <p>
                  <strong>Study:</strong> {source.design}
                </p>
                <p>
                  <strong>Finding:</strong> {source.finding}
                </p>
                <p>
                  <strong>Limit:</strong> {source.limitation}
                </p>
                <p className="panel-note">DOI: {source.doi}</p>
              </details>
            ))}
          </section>
        </section>
      )}
      <footer className="dashboard-footer">
        Evidence guides the experiment. Your response is individual.
      </footer>
    </main>
  );
}
function SourceLinks({ ids, plan }: { ids: string[]; plan: SciencePlan }) {
  return (
    <div className="science-source-links">
      {ids.map((id) => {
        const source = plan.sources.find((item) => item.id === id);
        return source ? (
          <a key={id} href={`#evidence-${id}`}>
            {source.authors}, {source.year} ↓
          </a>
        ) : null;
      })}
    </div>
  );
}
export default function ScienceCoach() {
  const { user } = useAuth();
  return user ? <GoalForm key={user.id} userId={user.id} /> : null;
}
