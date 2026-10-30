import { useState } from "react";
import type { StructuredReport } from "@shared/structured-report";
import {
  explainOrganism,
  explainScore,
  reportedStatusMeaning,
  type ReportExplanation,
} from "@shared/report-explanations";
function LearnMore({ help }: { help: ReportExplanation }) {
  return (
    <details className="report-learn">
      <summary>Why it matters & what to do</summary>
      <p>{help.why}</p>
      <h4>Your practical takeaway</h4>
      <p>{help.takeaway}</p>
      <div className="flex flex-wrap gap-3">
        {help.sources.map((s) => (
          <a
            className="text-link"
            href={s.url}
            key={s.url}
            target="_blank"
            rel="noreferrer"
          >
            {s.title}
          </a>
        ))}
      </div>
    </details>
  );
}
export default function ImportedReportDetails({
  report,
}: {
  report: StructuredReport & { importInfo?: { dateSource?: string } };
}) {
  const [query, setQuery] = useState("");
  const match = (name: string) =>
    name.toLowerCase().includes(query.toLowerCase());
  return (
    <section
      className="bloom-panel space-y-5 report-explainer"
      aria-label="Imported report details"
    >
      <div>
        <p className="eyebrow">UNDERSTAND YOUR REPORT</p>
        <h2>Reported scores & organisms</h2>
        <p>
          {report.dataOrigin ||
            "User-supplied report; not independently verified."}
        </p>
        {report.testPeriod && (
          <p className="panel-note">
            Period stated in report: {report.testPeriod}
          </p>
        )}
      </div>
      <div className="report-context">
        <h3>General biology, separate from your result</h3>
        <p>
          The explanations below describe what an organism or process can do.
          They do not verify the report, diagnose a condition, or measure
          activity in your body. Species and strains can behave differently.
        </p>
        <p>
          Pathway scores are provider-defined numbers, not concentrations or
          percentages. Higher is not automatically better; the provider’s
          scoring direction and version matter.
        </p>
        {report.importInfo?.dateSource === "import-date" && (
          <p>
            No exact test date was supplied. The report date is the import date,
            not a verified sample-collection date.
          </p>
        )}
      </div>
      <label className="block">
        Find an organism or score
        <input
          className="bloom-input w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="For example: butyrate or Akkermansia"
        />
      </label>
      {report.scores.length > 0 && (
        <section>
          <div className="report-section-heading">
            <h3>Functional & pathway scores</h3>
            <span>
              {report.scores.filter((s) => match(s.name)).length} shown of{" "}
              {report.scores.length}
            </span>
          </div>
          <div className="report-card-grid">
            {report.scores
              .filter((s) => match(s.name))
              .map((score, i) => {
                const help = explainScore(score.name);
                return (
                  <article className="report-card" key={i}>
                    <div className="report-card-top">
                      <h4>{score.name}</h4>
                      <span className="report-value">
                        {score.score ?? score.reportedValue ?? "Unavailable"}
                        <small>reported value</small>
                      </span>
                    </div>
                    <p className="report-topic">{help.label}</p>
                    <p>{help.meaning}</p>
                    <p className="report-meta">
                      Scale: {score.scale || "not supplied"} · Provider
                      category: {score.reportedCategory || "not supplied"}
                    </p>
                    <LearnMore help={help} />
                    <details className="report-source">
                      <summary>Original report details</summary>
                      <p>{score.category || "No source category supplied"}</p>
                      <p>
                        {score.notes || "No additional source note supplied."}
                      </p>
                      <p className="panel-note">
                        Bloom does not convert this value into a good/bad grade
                        or a measured metabolite amount.
                      </p>
                    </details>
                  </article>
                );
              })}
          </div>
        </section>
      )}
      {report.organisms.length > 0 && (
        <section>
          <div className="report-section-heading">
            <h3>Reported organisms</h3>
            <span>
              {report.organisms.filter((o) => match(o.name)).length} shown of{" "}
              {report.organisms.length}
            </span>
          </div>
          <p className="panel-note">
            General educational context does not assign a beneficial or harmful grade to an organism. Strain identifiers are preserved; species-level explanations cannot establish strain effects or personal treatment needs.
          </p>
          <div className="report-card-grid">
            {report.organisms
              .filter((o) => match(o.name))
              .map((o, i) => {
                const help = explainOrganism(o.name);
                return (
                  <article className="report-card" key={i}>
                    <h4>{o.name}</h4>
                    <span className="report-badge">General context · not a personal assessment</span>
                    <p>{help.meaning}</p>
                    <div className="report-source-facts">
                      <p>
                        <strong>Source status:</strong>{" "}
                        {o.reportedStatus || "not supplied"}
                      </p>
                      <p>
                        <strong>Reported amount:</strong>{" "}
                        {o.reportedAbundance || "unavailable"}
                      </p>
                    </div>
                    <LearnMore help={help} />
                    <details className="report-source">
                      <summary>What this record establishes</summary>
                      <p>
                        {reportedStatusMeaning(
                          o.reportedStatus,
                          !!o.reportedAbundance,
                        )}
                      </p>
                      <p>{o.notes || "No additional source note supplied."}</p>
                    </details>
                  </article>
                );
              })}
          </div>
        </section>
      )}
      {query &&
        !report.scores.some((s) => match(s.name)) &&
        !report.organisms.some((o) => match(o.name)) && (
          <p>No matching organism or score in this report.</p>
        )}
      <details className="report-context">
        <summary>Source warnings & missing measurements</summary>
        {report.scoreInterpretationWarning && (
          <p>{report.scoreInterpretationWarning}</p>
        )}
        <h3>Measurements missing for Bloom analysis</h3>
        <ul className="list-disc pl-5">
          {report.missingData.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        {report.sourceMissingData.length > 0 && (
          <>
            <h4>Missing data listed by the source</h4>
            <ul className="list-disc pl-5">
              {report.sourceMissingData.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )}
      </details>
    </section>
  );
}
