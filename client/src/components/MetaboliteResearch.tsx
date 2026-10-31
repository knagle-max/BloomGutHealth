import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { PrecisionRecord } from "@shared/precision-nutrition";
import type {
  ResearchResult,
  ResearchScenario,
} from "@shared/metabolite-research";

type Preview = {
  scenario: ResearchScenario;
  inputHash: string;
  configured: boolean;
  blockers: string[];
  boundary: string;
  result: ResearchResult | null;
};
export default function MetaboliteResearch({
  plans,
}: {
  plans: PrecisionRecord[];
}) {
  const [planId, setPlanId] = useState("");
  const [consent, setConsent] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const research = useMutation({
    mutationFn: async (run: boolean) =>
      (
        await apiRequest("POST", "/api/precision/metabolite-research", {
          planId,
          run,
          researchConsent: consent,
        })
      ).json() as Promise<Preview>,
    onSuccess: setPreview,
  });
  return (
    <section className="bloom-panel space-y-3" aria-labelledby="research-title">
      <p className="eyebrow">EXPERIMENTAL RESEARCH</p>
      <h2 id="research-title">Microbial metabolite scenarios</h2>
      <p>
        Explore a saved plan as a research scenario for acetate, propionate and
        butyrate. This is separate from your nutrient checks. An external
        metabolic model and curated substrate mapping are required for numerical
        estimates.
      </p>
      <label className="block">
        Saved weekly plan
        <select
          aria-label="Saved weekly plan"
          className="bloom-input w-full"
          value={planId}
          disabled={research.isPending}
          onChange={(e) => {
            setPlanId(e.target.value);
            setPreview(null);
            setConsent(false);
          }}
        >
          <option value="">Choose a saved plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {String((p.payload as any).name)} ·{" "}
              {String((p.payload as any).startedAt).slice(0, 10)}
            </option>
          ))}
        </select>
      </label>
      <Button
        variant="outline"
        disabled={!planId || research.isPending}
        onClick={() => {
          setPreview(null);
          research.mutate(false);
        }}
      >
        Check research readiness
      </Button>
      {research.isPending && <p role="status">Checking research inputs…</p>}
      {research.isError && <p role="alert">{research.error.message}</p>}
      {preview && (
        <>
          <p className="panel-note">
            Uses this saved plan’s intended intake and your latest supported
            microbial report at request time. It does not establish current
            consumption or microbial activity. Results are not saved or used to
            rank your meals.
          </p>
          <p>{preview.boundary}</p>
          <p>
            Report date:{" "}
            {preview.scenario.microbiome?.collectedAt.slice(0, 10) ||
              "Unavailable"}
            . Planned days: {preview.scenario.days.length}. Quantities are per
            person.
          </p>
          {preview.blockers.length > 0 ? (
            <div role="status">
              <p>No simulation available:</p>
              <ul className="list-disc pl-5">
                {preview.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I consent to sending the report date, microbial names and
                abundances, and planned foods and gram quantities to the
                configured research service. Genetics and bloodwork are
                excluded.
              </label>
              <Button
                disabled={!consent || research.isPending}
                onClick={() => {
                  setPreview(null);
                  research.mutate(true);
                }}
              >
                Run experimental simulation
              </Button>
            </>
          )}
          <details>
            <summary>Inspect scenario inputs and assumptions</summary>
            {preview.scenario.assumptions.map((a) => (
              <p key={a}>{a}</p>
            ))}
            <pre className="overflow-auto max-h-72 text-xs">
              {JSON.stringify(preview.scenario, null, 2)}
            </pre>
          </details>
          {preview.result?.status === "blocked" && (
            <ul className="list-disc pl-5">
              {preview.result.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {preview.result?.status === "simulated" && (
            <>
              <h3>Model estimates · not measurements</h3>
              <p>
                Model: {preview.result.model?.engine}{" "}
                {preview.result.model?.version}. Matched reported abundance:{" "}
                {(
                  preview.result.coverage.matchedAbundanceFraction * 100
                ).toFixed(1)}
                %.
              </p>
              <p className="panel-note">
                Ranges reflect {preview.result.model?.uncertaintyMethod}; they
                are not clinical confidence intervals. Net flux can be negative
                when the model consumes the metabolite. These results have not
                been prospectively validated in Bloom.
              </p>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Metabolite</th>
                      <th>Net flux</th>
                      <th>Sensitivity range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.result.estimates.map((e) => (
                      <tr key={`${e.day}:${e.metabolite}`}>
                        <td>{e.day}</td>
                        <td>{e.metabolite}</td>
                        <td>{e.value.toPrecision(3)}</td>
                        <td>
                          {e.lower.toPrecision(3)} to {e.upper.toPrecision(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Units: {preview.result.units} (per gram modelled microbial dry
                weight per hour).
              </p>
              <details>
                <summary>Model provenance and missing coverage</summary>
                <pre className="overflow-auto max-h-72 text-xs">
                  {JSON.stringify(
                    {
                      model: preview.result.model,
                      coverage: preview.result.coverage,
                      inputHash: preview.inputHash,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            </>
          )}
        </>
      )}
    </section>
  );
}
