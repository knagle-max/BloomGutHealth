import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { cohortResearch } from "@shared/meal-intelligence";
import { evidenceSources } from "@shared/science-coach";
export default function Microbiome() {
  const { user } = useAuth();
  const [sampleId, setSampleId] = useState("");
  const [comparisonId, setComparisonId] = useState("");
  const [tab, setTab] = useState("results");
  const [cohorts, setCohorts] = useState(["general_population"]);
  const samples = useQuery<any[]>({
    queryKey: ["/api/microbiome/samples", user?.id],
    enabled: !!user,
  });
  const sorted = [...(samples.data || [])].sort(
    (a, b) => +new Date(b.testDate) - +new Date(a.testDate),
  );
  const currentId = sampleId || sorted[0]?.id;
  const results = useQuery<any>({
    queryKey: ["/api/microbiome/results", currentId],
    enabled: !!currentId,
  });
  const comparison = useQuery<any>({
    queryKey: ["/api/microbiome/results", comparisonId],
    enabled: !!comparisonId,
  });
  const prediction = useQuery<any>({
    queryKey: ["/api/microbiome/diet-prediction", user?.id],
    enabled: !!user && tab === "diet",
  });
  const analyze = useMutation({
    mutationFn: async () => {
      return (
        await apiRequest("POST", `/api/microbiome/analyze/${currentId}`, {
          cohortsToCompare: cohorts,
        })
      ).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/microbiome/results", currentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/microbiome/samples", user?.id],
      });
    },
  });
  const model = results.data?.analyses?.find(
    (a: any) => a.analysisType === "comprehensive",
  )?.results;
  return (
    <main className="science-page space-y-5">
      <div className="science-heading">
        <p className="eyebrow">REPORTS & RESEARCH</p>
        <h1>Your microbiome, in context.</h1>
        <p>
          Explore reports, bacterial composition, molecule hypotheses, diet
          insights and research cohorts.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="text-link" href="/upload">
            Upload or enter a report
          </Link>
          <Link className="text-link" href="/health-insights">
            Health Insights
          </Link>
          <Link className="text-link" href="/meal-planner">
            Goal-based meals
          </Link>
        </div>
      </div>
      {samples.isError ? (
        <p role="alert">
          Reports could not load.{" "}
          <Button onClick={() => samples.refetch()}>Retry</Button>
        </p>
      ) : samples.isLoading ? (
        <p role="status">Loading reports…</p>
      ) : (
        <section className="bloom-panel">
          <h2>Report history</h2>
          {sorted.length ? (
            <>
              <label>
                Select report
                <select
                  className="bloom-input w-full"
                  value={currentId}
                  onChange={(e) => setSampleId(e.target.value)}
                >
                  {sorted.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.testDate).toLocaleDateString()} ·{" "}
                      {s.testingCompany || "Report"} · {s.processingStatus}
                    </option>
                  ))}
                </select>
              </label>
              <p className="panel-note">
                Reported data is supplied by you or a lab file and is not
                independently verified. Older analyses may contain demo values.
                Taxonomy, genes and measured metabolites are different data
                types.
              </p>
            </>
          ) : (
            <p>
              No reports yet. You can explore diet mechanisms and research
              before testing.
            </p>
          )}
        </section>
      )}
      <nav aria-label="Microbiome sections" className="flex flex-wrap gap-2">
        {[
          ["results", "Latest results"],
          ["bacteria", "Bacteria"],
          ["molecules", "Molecules"],
          ["diet", "Diet insights"],
          ["cohorts", "Cohorts"],
        ].map(([id, label]) => (
          <Button
            key={id}
            variant={tab === id ? "default" : "outline"}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>
      {currentId && results.isLoading && (
        <p role="status">Loading composition…</p>
      )}
      {results.isError && (
        <p role="alert">
          Results could not load.{" "}
          <Button onClick={() => results.refetch()}>Retry</Button>
        </p>
      )}
      {tab === "results" && results.data && (
        <section className="bloom-panel">
          <h2>Selected report</h2>
          <p>
            {results.data.sample.testingCompany} ·{" "}
            {new Date(results.data.sample.testDate).toLocaleDateString()} ·{" "}
            {results.data.sample.processingStatus}
          </p>
          <p>{results.data.sample.notes}</p>
          <p>Reported taxa: {results.data.bacterial_composition.length}</p>
          <p>
            Diversity index:{" "}
            {results.data.sample.diversityIndex ?? "Not computed"}
          </p>
          <p>
            Stored molecule estimates: {results.data.metabolites.length} ·
            Recommendations: {results.data.recommendations.length}
          </p>
          <p className="panel-note">
            Diversity is method-dependent and is not a universal health score.
          </p>
          {results.data.analyses.map((a: any) => (
            <p className="panel-note" key={a.id}>
              {a.analysisType} · {a.modelVersion} ·{" "}
              {a.results?.provenance ||
                "Experimental or legacy model; provenance requires verification"}
            </p>
          ))}
        </section>
      )}
      {tab === "bacteria" && (
        <section className="bloom-panel">
          <h2>Bacterial composition & change</h2>
          {currentId && (
            <label>
              Compare another report
              <select
                className="bloom-input w-full"
                value={comparisonId}
                onChange={(e) => setComparisonId(e.target.value)}
              >
                <option value="">No comparison</option>
                {sorted
                  .filter((s) => s.id !== currentId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.testDate).toLocaleDateString()} ·{" "}
                      {s.testingCompany}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <p className="panel-note">
            Compare only compatible assays and taxonomic levels. Differences are
            percentage points, not absolute bacterial counts.
          </p>
          {comparison.isError && (
            <p role="alert">
              Comparison unavailable.{" "}
              <Button onClick={() => comparison.refetch()}>Retry</Button>
            </p>
          )}
          {results.data?.bacterial_composition?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Taxon</th>
                    <th className="text-left p-2">Abundance</th>
                    {comparisonId && <th className="text-left p-2">Change</th>}
                  </tr>
                </thead>
                <tbody>
                  {results.data.bacterial_composition.map((b: any) => {
                    const previous =
                      comparison.data?.bacterial_composition?.find(
                        (v: any) => v.bacterialName === b.bacterialName,
                      );
                    return (
                      <tr key={b.id}>
                        <td className="p-2">
                          {b.bacterialName} ({b.taxonomyLevel})
                        </td>
                        <td className="p-2">{b.abundance.toFixed(2)}%</td>
                        {comparisonId && (
                          <td className="p-2">
                            {previous
                              ? `${(b.abundance - previous.abundance).toFixed(2)} pp`
                              : "No matched taxon"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No reported abundance data yet.</p>
          )}
        </section>
      )}
      {tab === "molecules" && (
        <section className="bloom-panel">
          <h2>Molecule & pathway hypotheses</h2>
          <p className="panel-note">
            Stored prototype values are unvalidated relative indices, not
            measured concentrations. Associated genes are hypothetical unless
            the report explicitly measured them.
          </p>
          {results.data?.metabolites?.length ? (
            results.data.metabolites.map((m: any) => (
              <article key={m.id} className="border-t py-3">
                <h3>{m.metaboliteName}</h3>
                <p>
                  Experimental relative index:{" "}
                  {m.predictedConcentration ?? "Unavailable"}
                </p>
                <p className="text-sm">
                  Hypothesized pathway: {m.pathwayId} · Genes:{" "}
                  {m.productionGenes?.join(", ") || "Not provided"}
                </p>
              </article>
            ))
          ) : (
            <p>
              No molecule model stored for this report. Explore{" "}
              <Link className="underline" href="/insights">
                sourced microbial pathways
              </Link>
              .
            </p>
          )}
        </section>
      )}
      {tab === "diet" && (
        <section className="bloom-panel">
          <h2>Diet-based exploration</h2>
          <p className="panel-note">
            The original diet model is retained as an experimental view. Its
            inferred percentages are not measured abundance or validated
            predictions. Use the evidence coach and meal planner for sourced
            actions.
          </p>
          {prediction.isLoading ? (
            <p>Loading dietary model…</p>
          ) : prediction.isError ? (
            <p role="alert">
              Diet model unavailable.{" "}
              <Button onClick={() => prediction.refetch()}>Retry</Button>
            </p>
          ) : (
            <>
              {prediction.data?.message && <p>{prediction.data.message}</p>}
              {prediction.data?.predictedBacteria?.map((b: any, i: number) => (
                <p key={i}>
                  {b.name || b.bacteria || b.bacterialName}:{" "}
                  {b.likelihood ?? "No calibrated likelihood"} (experimental
                  rule label) — {b.dietaryDriver}. {b.description}
                </p>
              ))}
              {prediction.data?.insights?.map((i: any, index: number) => (
                <article key={index}>
                  <h3>{i.title}</h3>
                  <p>{i.description}</p>
                </article>
              ))}
            </>
          )}
          <Link className="text-link" href="/meal-planner">
            Build meals for your goals
          </Link>
        </section>
      )}
      {tab === "cohorts" && (
        <section className="bloom-panel space-y-4">
          <h2>Compare research populations</h2>
          {cohortResearch.map((c) => (
            <article key={c.id}>
              <h3>{c.name}</h3>
              <p>{c.finding}</p>
              <p className="panel-note">
                {c.comparison} {c.foodStatus}
              </p>
              <a
                className="underline"
                href={evidenceSources.find((s) => s.id === c.sourceId)?.url}
                target="_blank"
                rel="noreferrer"
              >
                Primary study
              </a>
            </article>
          ))}
          <details>
            <summary>Original experimental cohort comparison</summary>
            <p className="panel-note">
              The Python prototype uses hand-entered reference profiles for
              athletes, long-lived people, general population and Mediterranean
              diet followers. These are illustrative, not validated study
              distributions or health targets. Similarity is a model
              calculation, not a likelihood of performance or longevity.
            </p>
            <fieldset>
              <legend>Choose prototype groups</legend>
              {[
                "elite_athletes",
                "centenarians",
                "general_population",
                "mediterranean_diet",
              ].map((id) => (
                <label key={id} className="block">
                  <input
                    type="checkbox"
                    checked={cohorts.includes(id)}
                    onChange={(e) =>
                      setCohorts(
                        e.target.checked
                          ? [...cohorts, id]
                          : cohorts.filter((c) => c !== id),
                      )
                    }
                  />{" "}
                  {id.replaceAll("_", " ")}
                </label>
              ))}
            </fieldset>
            <Button
              disabled={!currentId || !cohorts.length || analyze.isPending}
              onClick={() => analyze.mutate()}
            >
              {analyze.isPending
                ? "Analyzing…"
                : "Run experimental report model"}
            </Button>
            {analyze.isError && <p role="alert">{analyze.error.message}</p>}
            {model?.cohort_comparisons &&
              Object.entries(model.cohort_comparisons).map(
                ([id, c]: [string, any]) => (
                  <article key={id} className="my-3">
                    <h3>{c.cohort_name}</h3>
                    <p>
                      Illustrative similarity:{" "}
                      {c.similarity_score ?? c.similarity ?? "Not available"}
                    </p>
                    <p>
                      Prototype reference diversity:{" "}
                      {c.diversity_comparison?.cohort ?? "Not available"}
                    </p>
                    <details>
                      <summary>Modeled gaps & strengths</summary>
                      <pre className="whitespace-pre-wrap break-words text-xs">
                        {JSON.stringify(
                          {
                            gaps: c.bacterial_gaps || c.gaps,
                            strengths: c.bacterial_strengths || c.strengths,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </article>
                ),
              )}
          </details>
        </section>
      )}
      {results.data?.recommendations?.length > 0 && (
        <section className="bloom-panel">
          <h2>Stored report recommendations</h2>
          <p className="panel-note">
            Legacy experimental recommendations; check their evidence and your
            preferences before use.
          </p>
          {results.data.recommendations.map((r: any) => (
            <details key={r.id}>
              <summary>{r.itemName}</summary>
              <p>{r.reasoning}</p>
              <p>{r.details}</p>
              <p>
                Target bacteria: {r.targetBacteria?.join(", ")} · Molecules:{" "}
                {r.targetMetabolites?.join(", ")}
              </p>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}
