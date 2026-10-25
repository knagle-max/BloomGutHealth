import { FoodCompositionExplorer } from "@/components/FoodCompositionExplorer";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import type {
  BiologicalRegistry,
  KnowledgeRelationship,
} from "@shared/biological-model";
const kindName = (kind: string) =>
  (
    ({
      molecule: "Metabolite",
      organism: "Microbe / community",
      "host-variant": "Gene / SNP",
      "microbial-pathway": "Microbial pathway",
      "host-pathway": "Host pathway",
      substrate: "Microbial substrate",
      "biological-process": "Biological process",
      "health-outcome": "Health outcome",
    }) as Record<string, string>
  )[kind] || kind.charAt(0).toUpperCase() + kind.slice(1);
const evidenceName = {
  "human-intervention": "Tested in people",
  association: "Observed association",
  mechanistic: "Biological mechanism",
  composition: "Food composition",
  guidance: "Dietary guidance",
};
export default function Explore() {
  const { user } = useAuth(),
    params = new URLSearchParams(window.location.search);
  const registry = useQuery<BiologicalRegistry>({
    queryKey: ["/api/biology/registry"],
    queryFn: async () =>
      (await apiRequest("GET", "/api/biology/registry")).json(),
  });
  const [selected, setSelected] = useState(params.get("node") || "food:oats"),
    [foodId, setFoodId] = useState(
      (params.get("node") || "food:oats").startsWith("food:")
        ? params.get("node") || "food:oats"
        : "",
    ),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("food");
  const assessment = useQuery<any>({
    queryKey: ["/api/biology/foods", user?.id, foodId],
    enabled: !!foodId,
    queryFn: async () =>
      (
        await apiRequest(
          "GET",
          "/api/biology/foods/" + encodeURIComponent(foodId),
        )
      ).json(),
  });
  const currentAssessment = assessment.fetchStatus === "idle" && !assessment.isError ? assessment.data : undefined;
  const r = registry.data,
    node = r?.entities.find((n) => n.id === selected),
    connected =
      r?.relationships.filter(
        (e) => e.from === selected || e.to === selected,
      ) || [],
    neighbors = Array.from(
      new Set(connected.map((e) => (e.from === selected ? e.to : e.from))),
    )
      .map((id) => r!.entities.find((n) => n.id === id)!)
      .filter(Boolean),
    results =
      r?.entities
        .filter((n) =>
          search
            ? `${n.label} ${kindName(n.kind)}`
                .toLowerCase()
                .includes(search.toLowerCase())
            : category === "all" || n.kind === category,
        )
        .slice(0, 35) || [];
  const select = (id: string) => {
    setSelected(id);
    if (id.startsWith("food:")) setFoodId(id);
    window.history.replaceState(
      null,
      "",
      "/explore?node=" + encodeURIComponent(id),
    );
  };
  const detail = (e: KnowledgeRelationship) => {
    const effect = currentAssessment?.relationshipEffects.find(
      (v: any) => v.id === e.id,
    );
    return (
      <article className="relationship-card" key={e.id}>
        <div className="relationship-labels">
          <button onClick={() => select(e.from)}>
            {r!.entities.find((n) => n.id === e.from)?.label}
          </button>
          <span aria-hidden="true">→</span>
          <button onClick={() => select(e.to)}>
            {r!.entities.find((n) => n.id === e.to)?.label}
          </button>
        </div>
        <p className="eyebrow">GENERAL RESEARCH</p>
        <p>{e.claim}</p>
        <div className="relationship-badges">
          <span>{evidenceName[e.evidence]}</span>
          <span>{e.confidence.replaceAll("-", " ")}</span>
          <span>Research relationship · not a personal measurement</span>
        </div>
        <p className="panel-note">
          {effect?.affectsRecommendation
            ? "Used in this food's current priority"
            : "Educational connection"}
          {foodId && currentAssessment
            ? " · for " + currentAssessment.food.label
            : ""}
          .{" "}
          {effect?.reason ||
            "This link does not independently establish a personal recommendation."}
        </p>
        <details>
          <summary>Evidence, limits & competing findings</summary>
          <p>
            <strong>Human relevance:</strong> {e.humanRelevance}
          </p>
          <p>
            <strong>Direction:</strong> {e.direction}
          </p>
          <p>
            <strong>Context:</strong> {e.context}
          </p>
          <p>
            <strong>Limits:</strong> {e.limitation}
          </p>
          {e.contradictions.length ? (
            e.contradictions.map((s, i) => <p key={i}>{s}</p>)
          ) : (
            <p>
              No competing finding is catalogued on this connection. This is not
              proof of agreement.
            </p>
          )}
          <p className="panel-note">
            Contradiction review: {e.contradictionStatus.replaceAll("-", " ")}.
            This is a curated reference, not a live systematic review.
          </p>
          {e.sourceIds.map((id) => {
            const s = r!.sources.find((s) => s.id === id)!;
            return (
              <div className="relationship-source" key={id}>
                <a
                  className="text-link"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.title}
                </a>
                <p>
                  {s.design} · {s.population}
                </p>
                <p className="panel-note">{s.limitation}</p>
              </div>
            );
          })}
        </details>
      </article>
    );
  };
  return (
    <main className="science-page biology-explorer space-y-5">
      <div className="science-heading">
        <p className="eyebrow">UNDERSTAND YOUR FOOD</p>
        <h1>Explore</h1>
        <p>
          Follow the connections. See what is known, what is inferred, and what
          actually changes your food priorities.
        </p>
      </div>
      <div className="explore-tools">
        {[
          ["/precision", "My biology & bloodwork"],
          ["/microbiome", "Gut reports"],
          ["/meal-planner", "Meal plans"],
          ["/nutrition", "Food journal"],
          ["/insights", "Goal coaching"],
        ].map(([path, label]) => (
          <Link key={path} className="text-link" href={path}>
            {label}
          </Link>
        ))}
      </div>
      <FoodCompositionExplorer onSelect={()=>{setFoodId("");setSelected("");window.history.replaceState(null,"","/explore");}} />
      {registry.isLoading && (
        <p role="status">Loading the reviewed relationship model…</p>
      )}
      {registry.error && <p role="alert">{registry.error.message}</p>}
      {r && (
        <>
          {foodId && (
            <section className="bloom-panel space-y-4">
              <p className="eyebrow">YOUR FOOD PRIORITY</p>
              <h2>Why this food matters to you</h2>
              {(assessment.isPending || assessment.fetchStatus !== "idle") && (
                <p role="status">Checking your saved context…</p>
              )}
              {assessment.error && (
                <div>
                  <p role="alert">{assessment.error.message}</p>
                  <p className="panel-note">Current personal food context is unavailable. General research remains available below.</p>
                  <Button type="button" variant="outline" disabled={assessment.isFetching} onClick={() => assessment.refetch()}>Retry food context</Button>
                </div>
              )}
              {currentAssessment && (
                <>
                  <h3>
                    {currentAssessment.food.label} · {currentAssessment.decision}
                  </h3>
                  {[
                    ...currentAssessment.conflicts,
                    ...currentAssessment.reasons,
                  ].map((v: string, i: number) => (
                    <p key={i}>{v}</p>
                  ))}
                  {!currentAssessment.reasons.length &&
                    !currentAssessment.conflicts.length && (
                      <p>
                        No personal priority rule is active for this food. You
                        can still learn from the general evidence.
                      </p>
                    )}
                  <p>
                    Food components:{" "}
                    {currentAssessment.qualitativeNutrients.join(" · ")}.
                    Quantities depend on the serving.
                  </p>
                  <p className="panel-note">Independent scientific review is pending. These are food-priority suggestions, not validated personal biological effects.</p>
                  <div className="evidence-context" aria-label="How to read this food insight">
                    <p><strong>Personal relevance:</strong> {currentAssessment.relationshipEffects.some((e: any) => e.affectsRecommendation) ? "A saved-context rule contributes to this food priority. This does not predict your response." : "No reviewed relationship is changing this food priority."}</p>
                    <p><strong>General evidence:</strong> The research connections below describe studies and mechanisms, not measurements of your biology.</p>
                    <p><strong>Unknown:</strong> Personal enzyme activity, microbial output and treatment effects are not determined.</p>
                  </div>
                  <details><summary>Saved observations used for context</summary>
                  {!currentAssessment.observations.labs.length && !currentAssessment.observations.genetics.length && <p>No relevant laboratory or genetic observation is recorded for this food.</p>}
                  {currentAssessment.observations.labs.map((l: any) => (
                    <p className="report-context" key={l.marker}>
                      {l.marker.toUpperCase()}: {l.value} {l.unit} · {l.flag} ·{" "}
                      {l.date.slice(0, 10)}. {l.provenance}.
                    </p>
                  ))}
                  {currentAssessment.observations.genetics.map((g: any) => (
                    <p className="panel-note" key={g.rsid}>
                      {g.gene} {g.rsid} {g.genotype} · {g.status}. {g.note}
                    </p>
                  ))}
                  </details>
                  <details>
                    <summary>What to track & what remains uncertain</summary>
                    {currentAssessment.tracking.map((v: string, i: number) => (
                      <p key={i}>{v}</p>
                    ))}
                    {currentAssessment.limits.map((v: string, i: number) => (
                      <p className="panel-note" key={i}>
                        {v}
                      </p>
                    ))}
                  </details>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/plan-day" className="hero-button">
                      Plan my next meal
                    </Link>
                    <Link href="/progress" className="text-link">
                      Track my response
                    </Link>
                    <Link href="/precision" className="text-link">
                      Review my context
                    </Link>
                  </div>
                </>
              )}
            </section>
          )}
          <div className="explore-layout">
            <section className="bloom-panel explore-browser">
              <h2>Find a connection</h2>
              <label>
                Search foods, genes, microbes & molecules
                <input
                  className="bloom-input w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Oats, butyrate, MTHFR…"
                  maxLength={100}
                />
              </label>
              <label>
                Show
                <select
                  aria-label="Explore category"
                  className="bloom-input w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {[
                    ["food", "Foods"],
                    ["all", "All connections"],
                    ["nutrient", "Nutrients"],
                    ["organism", "Microbes & communities"],
                    ["molecule", "Metabolites"],
                    ["host-variant", "Genes / SNPs"],
                    ["biomarker", "Biomarkers"],
                    ["microbial-pathway", "Microbial pathways"],
                  ].map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="explore-node-list">
                {results.map((n) => (
                  <button
                    key={n.id}
                    aria-pressed={selected === n.id}
                    onClick={() => select(n.id)}
                  >
                    <span>{n.label}</span>
                    <small>{kindName(n.kind)}</small>
                  </button>
                ))}
              </div>
              {!results.length && (
                <p>
                  No reviewed relationship matches this search. This means
                  unreviewed, not ineffective. You can still log the food
                  normally. <Link className="text-link" href={`/log-meal?productQuery=${encodeURIComponent(search.trim().slice(0,120))}`}>Search package labels or enter nutrition</Link>
                </p>
              )}
              <p className="panel-note">
                Food explanations currently cover{" "}
                {r.entities.filter((n) => n.kind === "food").length} reviewed
                food families. Generic nutrition and package-label coverage are
                separate.
              </p>
            </section>
            <div className="space-y-5">
              {node ? (
                <>
                  <section className="bloom-panel space-y-3">
                    <p className="eyebrow">{kindName(node.kind)}</p>
                    <h2>{node.label}</h2>
                    <p>{node.summary}</p>
                    <svg
                      className="relationship-map"
                      viewBox="0 0 600 260"
                      role="img"
                      aria-label={`Nearby research connections for ${node.label}. Use the buttons below to navigate.`}
                    >
                      <rect
                        x="190"
                        y="100"
                        width="220"
                        height="60"
                        rx="12"
                        fill="currentColor"
                        opacity=".12"
                      />
                      <text
                        x="300"
                        y="135"
                        textAnchor="middle"
                        fill="currentColor"
                      >
                        {node.label.length > 26
                          ? node.label.slice(0, 23) + "…"
                          : node.label}
                      </text>
                      {neighbors.slice(0, 4).map((n, i) => {
                        const x = i % 2 ? 470 : 130,
                          y = i < 2 ? 40 : 220;
                        return (
                          <g key={n.id}>
                            <line
                              x1={i % 2 ? 410 : 190}
                              y1={i < 2 ? 110 : 150}
                              x2={x}
                              y2={y}
                              stroke="currentColor"
                              opacity=".3"
                            />
                            <rect
                              x={x - 110}
                              y={y - 23}
                              width="220"
                              height="46"
                              rx="10"
                              fill="hsl(var(--card))"
                              stroke="currentColor"
                            />
                            <text
                              x={x}
                              y={y + 4}
                              textAnchor="middle"
                              fill="currentColor"
                            >
                              {n.label.length > 29
                                ? n.label.slice(0, 26) + "…"
                                : n.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    <div className="explore-neighbors">
                      {neighbors.map((n) => (
                        <Button
                          variant="outline"
                          key={n.id}
                          onClick={() => select(n.id)}
                        >
                          {n.label}
                        </Button>
                      ))}
                    </div>
                    <p className="panel-note">
                      Lines show catalogued research relationships, not your
                      measured metabolic activity. Direction and uncertainty are
                      explained below.
                    </p>
                  </section>
                  <details className="relationship-details space-y-3">
                    <summary>
                      Evidence for {connected.length} connected relationships
                    </summary>
                    {connected.map(detail)}
                    {!connected.length && (
                      <div className="bloom-panel">
                        No reviewed relationship is linked yet. Missing links
                        are not negative findings.
                      </div>
                    )}
                  </details>
                </>
              ) : (
                <section className="bloom-panel">
                  <h2>{selected ? "Connection unavailable" : "Explore the research"}</h2>
                  <p>Choose a reviewed item from the list.</p>
                </section>
              )}
            </div>
          </div>
          <p className="panel-note">
            {r.summary} Registry {r.version}.
          </p>
        </>
      )}
    </main>
  );
}
