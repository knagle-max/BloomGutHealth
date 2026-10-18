import type { StructuredReport } from "@shared/structured-report";
export default function ImportedReportDetails({
  report,
}: {
  report: StructuredReport & { importInfo?: { dateSource?: string } };
}) {
  return (
    <section
      className="bloom-panel space-y-4"
      aria-label="Imported report details"
    >
      <h2>Reported scores & organisms</h2>
      <p>
        {report.dataOrigin ||
          "User-supplied report; not independently verified."}
      </p>
      {report.testPeriod && <p>Period stated in report: {report.testPeriod}</p>}
      {report.importInfo?.dateSource === "import-date" && (
        <p className="panel-note">
          No exact test date was supplied. The date shown is the import date,
          not a claimed sample-collection date.
        </p>
      )}
      <p className="panel-note">
        These are reported functional/pathway scores and organism records. A
        score is not a metabolite concentration, a gene measurement or a
        bacterial percentage. A larger score is not automatically better. Bloom
        preserves the reported scale and category without inventing a health
        ranking.
      </p>
      {report.scoreInterpretationWarning && (
        <p className="panel-note">
          Source note: {report.scoreInterpretationWarning}
        </p>
      )}
      {report.scores.length > 0 && (
        <details open>
          <summary>Functional/pathway scores ({report.scores.length})</summary>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Reported value</th>
                  <th className="text-left p-2">Reported scale</th>
                  <th className="text-left p-2">Source category</th>
                </tr>
              </thead>
              <tbody>
                {report.scores.map((s, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      {s.name}
                      {s.category && (
                        <span className="block text-xs">{s.category}</span>
                      )}
                      {s.notes && (
                        <details>
                          <summary>Source note</summary>
                          {s.notes}
                        </details>
                      )}
                    </td>
                    <td className="p-2">
                      {s.score ?? s.reportedValue ?? "Unavailable"}
                    </td>
                    <td className="p-2">{s.scale || "Not supplied"}</td>
                    <td className="p-2">
                      {s.reportedCategory || "Not supplied"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {report.organisms.length > 0 && (
        <details open>
          <summary>Reported organisms ({report.organisms.length})</summary>
          <p className="panel-note">
            Reported status does not quantify abundance. Amounts below are shown
            exactly as reported and are not converted into bacterial
            percentages.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Organism</th>
                  <th className="text-left p-2">Reported status</th>
                  <th className="text-left p-2">Reported amount</th>
                </tr>
              </thead>
              <tbody>
                {report.organisms.map((o, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      {o.name}
                      {o.notes && (
                        <details>
                          <summary>Source note</summary>
                          {o.notes}
                        </details>
                      )}
                    </td>
                    <td className="p-2">
                      {o.reportedStatus || "Not supplied"}
                    </td>
                    <td className="p-2">
                      {o.reportedAbundance || "Unavailable"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <div>
        <h3>Measurements missing for Bloom analysis</h3>
        <ul className="list-disc pl-5">
          {report.missingData.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      {report.sourceMissingData.length > 0 && (
        <details>
          <summary>Missing data listed by the source</summary>
          <ul className="list-disc pl-5">
            {report.sourceMissingData.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
