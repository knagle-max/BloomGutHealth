import ImportedReportDetails from "@/components/ImportedReportDetails";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cohortResearch } from "@shared/meal-intelligence";
import { evidenceSources } from "@shared/science-coach";
export default function Microbiome() {
  const { user } = useAuth();
  const [sampleId, setSampleId] = useState("");
  const [comparisonId, setComparisonId] = useState("");
  const [tab, setTab] = useState("results");
  const samples = useQuery<any[]>({
    queryKey: ["/api/microbiome/samples", user?.id],
    enabled: !!user,
  });
  const currentSamples=samples.fetchStatus==="idle"&&!samples.isError?samples.data:undefined;
  const sorted = [...(currentSamples || [])].sort(
    (a, b) => +new Date(b.testDate) - +new Date(a.testDate),
  );
  const currentId = sampleId ? sorted.find(sample=>sample.id===sampleId)?.id : sorted[0]?.id;
  const results = useQuery<any>({
    queryKey: ["/api/microbiome/results", currentId],
    enabled: !!currentId,
  });
  const comparison = useQuery<any>({
    queryKey: ["/api/microbiome/results", comparisonId],
    enabled: !!comparisonId&&comparisonId!==currentId&&sorted.some(sample=>sample.id===comparisonId),
  });
  const prediction = useQuery<any>({
    queryKey: ["/api/microbiome/diet-prediction", user?.id],
    enabled: !!user && tab === "diet",
  });
  const currentResults=currentId&&results.fetchStatus==="idle"&&!results.isError&&results.data?.sample?.id===currentId?results.data:undefined;
  const currentComparison=comparisonId!==currentId&&sorted.some(sample=>sample.id===comparisonId)&&comparison.fetchStatus==="idle"&&!comparison.isError&&comparison.data?.sample?.id===comparisonId?comparison.data:undefined;
  const currentPrediction=prediction.fetchStatus==="idle"&&!prediction.isError?prediction.data:undefined;
  return (
    <main className="science-page space-y-5">
      <div className="science-heading">
        <p className="eyebrow">REPORTS & RESEARCH</p>
        <h1>Gut reports</h1>
        <p>
          Understand what your report contains and what it means for everyday food choices.
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
      ) : samples.isPending||samples.fetchStatus!=="idle" ? (
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
      <nav aria-label="Microbiome sections" className="precision-tabs">
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
      {currentId && (results.isPending||results.fetchStatus!=="idle") && (
        <p role="status">Loading composition…</p>
      )}
      {currentId&&(results.isError||results.fetchStatus==="paused") && (
        <p role="alert">
          Results could not load.{" "}
          <Button onClick={() => results.refetch()}>Retry</Button>
        </p>
      )}
      {tab === "results" && currentResults && (
        <section className="bloom-panel">
          <h2>Selected report</h2>
          <p>
            {currentResults.sample.testingCompany} ·{" "}
            {new Date(currentResults.sample.testDate).toLocaleDateString()} ·{" "}
            {currentResults.sample.processingStatus}
          </p>
          <p>{currentResults.sample.notes}</p>
          <p>Reported taxa: {currentResults.bacterial_composition.length}</p>
          <p>
            Diversity index:{" "}
            {currentResults.sample.diversityIndex ?? "Not computed"}
          </p>
          <p className="panel-note">Unsupported historical molecule estimates and recommendations are withheld. This does not mean no records were stored.</p>
          <p className="panel-note">
            Diversity is method-dependent and is not a universal health score.
          </p>
          {currentResults.analyses.map((a: any) => (
            <p className="panel-note" key={a.id}>
              {a.analysisType} · {a.modelVersion} ·{" "}
              {a.analysisType === "reported-composition"
                ? "Descriptive summary of supplied relative abundance; no biological prediction."
                : "Historical analysis record; unsupported outputs are withheld."}
            </p>
          ))}
        </section>
      )}
      {tab === "results" &&
        currentResults?.sample?.structuredData?.schemaVersion ===
          "bloom-report-v2" && (
          <ImportedReportDetails report={currentResults.sample.structuredData} />
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
            Source values are shown side by side. Assay compatibility has not been established, so no change or health interpretation is calculated. Relative percentages are not absolute bacterial counts.
          </p>
          {comparisonId&&(comparison.isError||comparison.fetchStatus==="paused") && (
            <p role="alert">
              Comparison unavailable.{" "}
              <Button onClick={() => comparison.refetch()}>Retry</Button>
            </p>
          )}
          {currentResults?.bacterial_composition?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Taxon</th>
                    <th className="text-left p-2">Abundance</th>
                    {comparisonId && <th className="text-left p-2">Other reported abundance</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentResults.bacterial_composition.map((b: any) => {
                    const previous =
                      currentComparison?.bacterial_composition?.find(
                        (v: any) => v.bacterialName === b.bacterialName && !!b.taxonomyLevel && v.taxonomyLevel === b.taxonomyLevel,
                      );
                    return (
                      <tr key={b.id}>
                        <td className="p-2">
                          {b.bacterialName} ({b.taxonomyLevel})
                        </td>
                        <td className="p-2">{b.abundance.toFixed(2)}%</td>
                        {comparisonId && (
                          <td className="p-2">
                            {!currentComparison?"Comparison not checked":previous
                              ? `${previous.abundance.toFixed(2)}% (reported)`
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
            <p>{currentResults?"No reported abundance data yet.":"Reported abundance has not been checked for this selection."}</p>
          )}
        </section>
      )}
      {tab === "molecules" && (
        <section className="bloom-panel">
          <h2>Molecule & pathway hypotheses</h2>
          <p className="panel-note">
            Historical prototype molecule values and guessed gene functions are withheld.
            Organism percentages cannot establish your metabolite production or health effects.
          </p>
            <p>
              Personal metabolite output has not been established. Explore{" "}
              <Link className="underline" href="/insights">
                sourced microbial pathways
              </Link>
              .
            </p>
        </section>
      )}
      {tab === "diet" && (
        <section className="bloom-panel space-y-5 diet-exploration">
          <div>
            <p className="eyebrow">FROM YOUR FOOD JOURNAL</p>
            <h2>Food patterns & next steps</h2>
            <p>
              Explore what your logged meals contribute and choose a practical
              next step. Food records do not identify which bacteria live in
              your gut.
            </p>
          </div>
          {prediction.isPending||prediction.fetchStatus!=="idle" ? (
            <p role="status">Checking your recorded meals…</p>
          ) : prediction.isError ? (
            <div role="alert">
              <p>Food patterns could not load.</p>
              <Button onClick={() => prediction.refetch()}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="report-context">
                <h3>
                  {currentPrediction?.mealsAnalyzed ?? "Not checked"} meals logged in the last{" "}
                  {currentPrediction?.days ?? "unconfirmed"} days
                </h3>
                <p>{currentPrediction?.message}</p>
              </div>
              <div className="report-card-grid">
                {currentPrediction?.observations?.map((o: any) => (
                  <article className="report-card" key={o.key}>
                    <p className="eyebrow">{o.name}</p>
                    <p className="diet-known-total">
                      {o.knownTotal === null
                        ? "Unknown"
                        : Number(o.knownTotal.toFixed(1)).toLocaleString()}{" "}
                      <span>{o.knownTotal === null ? "" : o.unit}</span>
                    </p>
                    <p>Known contribution across these recorded meals</p>
                    <p className="report-meta">
                      {o.knownMeals}/{o.totalMeals} meals have an estimate ·{" "}
                      {o.completeMeals}/{o.totalMeals} have a complete{" "}
                      {o.name.toLowerCase()} estimate.
                    </p>
                    {o.partial && (
                      <p className="panel-note">
                        Partial total: missing portions or nutrients are not
                        counted as zero.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
          <div className="report-card-grid">
            <article className="report-card">
              <h3>Make the next meal useful</h3>
              <p>
                Choose a meal that fits what is left of today’s nutrient
                targets, your food preferences and your saved goals.
              </p>
              <Link className="text-link" href="/meal-planner">
                Plan the rest of today →
              </Link>
            </article>
            <article className="report-card">
              <h3>Support fermentation through food</h3>
              <p>
                Oats, beans, lentils and vegetables provide different substrates
                for gut microbes. Increase fiber gradually as tolerated; no
                single food guarantees a specific organism or metabolite
                response.
              </p>
              <Link className="text-link" href="/insights">
                Explore food → microbe → molecule evidence →
              </Link>
            </article>
          </div>
          <details className="report-context">
            <summary>What we can—and cannot—learn here</summary>
            <p>
              {currentPrediction?.note ||
                "Food logs do not measure bacterial abundance or metabolite production."}
            </p>
            <p>
              The previous illustrative diet rules could label organisms from
              protein or fiber averages. Those labels are no longer shown as
              personal microbiome findings. Use an actual report for reported
              organisms, and the meal planner for nutrient-based suggestions.
            </p>
          </details>
        </section>
      )}
      {tab === "cohorts" && (
        <section className="bloom-panel space-y-4">
          <h2>Research populations</h2>
          <p className="panel-note">General research summaries. Personal cohort comparisons are unavailable without validated reference data.</p>
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

        </section>
      )}
      {currentResults?.recommendations?.length > 0 && (
        <section className="bloom-panel">
          <h2>Stored report recommendations</h2>
          <p className="panel-note">
            Legacy experimental recommendations; check their evidence and your
            preferences before use.
          </p>
          {currentResults.recommendations.map((r: any) => (
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
