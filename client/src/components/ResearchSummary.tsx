import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
export default function ResearchSummary() {
  const { user } = useAuth();
  const samples = useQuery<any[]>({
    queryKey: ["/api/microbiome/samples", user?.id],
    enabled: !!user,
  });
  const latest = [...(samples.data || [])].sort(
    (a, b) => +new Date(b.testDate) - +new Date(a.testDate),
  )[0];
  const result = useQuery<any>({
    queryKey: ["/api/microbiome/results", latest?.id],
    enabled: !!latest,
  });
  const score = result.data?.analyses?.[0]?.results?.overall_score;
  return (
    <section className="bloom-panel mt-5">
      <div className="panel-heading">
        <h2>Microbiome & research overview</h2>
        <Link className="text-link" href="/microbiome">
          Detailed results
        </Link>
      </div>
      {samples.isLoading || result.isLoading ? (
        <p>Loading report summary…</p>
      ) : samples.isError || result.isError ? (
        <p role="alert">Report summary unavailable.</p>
      ) : latest ? (
        <>
          <p>
            {latest.testingCompany} ·{" "}
            {new Date(latest.testDate).toLocaleDateString()}
          </p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <p>
              Diversity
              <br />
              <strong>{latest.diversityIndex ?? "Not computed"}</strong>
            </p>
            <p>
              Reported taxa
              <br />
              <strong>
                {result.data?.bacterial_composition?.length ?? "Unavailable"}
              </strong>
            </p>
            <p>
              Stored molecule estimates
              <br />
              <strong>
                {result.data?.metabolites?.length ?? "Unavailable"}
              </strong>
            </p>
            <p>
              Stored recommendations
              <br />
              <strong>
                {result.data?.recommendations?.length ?? "Unavailable"}
              </strong>
            </p>
          </div>
          {typeof score === "number" && (
            <p>
              Legacy experimental overall index: {score}/100 (not a validated
              gut health score).
            </p>
          )}
          <p className="panel-note">
            Report diversity and experimental model estimates are not diagnoses.
            Older results may contain demonstration data.
          </p>
        </>
      ) : (
        <p>No report yet. Explore pathways and plan meals before testing.</p>
      )}
      <div className="flex flex-wrap gap-4 mt-4">
        <Link className="text-link" href="/health-insights">
          Health, SCFAs, adherence & trends
        </Link>
        <Link className="text-link" href="/meal-planner">
          Personalized meals
        </Link>
        <Link className="text-link" href="/upload">
          Add report
        </Link>
        <Link className="text-link" href="/demo">
          Explore sample demo
        </Link>
      </div>
    </section>
  );
}
