import TodayPlanner from "@/components/TodayPlanner";
import QuickLabEntry from "@/components/QuickLabEntry";
import { recipePreparation } from "@shared/recipe-preparation";
import GenotypeExplanations from "@/components/GenotypeExplanations";
import ManualGenetics from "@/components/ManualGenetics";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dna,
  FlaskConical,
  Leaf,
  ChartNoAxesCombined,
  ShieldCheck,
} from "lucide-react";
import {
  contextSchema,
  markerDefinitions,
  parse23andMe,
  variantCatalog,
  type PrecisionContext,
  type PrecisionReport,
  type PrecisionRecord,
} from "@shared/precision-nutrition";
import { DietaryPreferenceEditor } from "./MealPlanner";

type Report = PrecisionReport & {
  availableReports: { id: string; date: string; name: string }[];
  intake: {
    days: number;
    mealsLogged: number;
    nutrients: {
      key: string;
      name: string;
      unit: string;
      knownTotal: number;
      mealsWithEstimate: number;
      completeMeals: number;
    }[];
    note: string;
  };
  journalSymptoms: {
    mealId: string;
    date: string;
    symptoms: Record<string, number | null>;
  }[];
};
const list = (value: FormDataEntryValue | null) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const number = (data: FormData, key: string) => {
  const value = String(data.get(key) || "").trim();
  return value === "" ? null : Number(value);
};
const date = (data: FormData, key: string) =>
  new Date(String(data.get(key))).toISOString();
const localNow = () => {
  const d = new Date();
  return new Date(+d - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
const display = (value: number) => Number(value.toFixed(2)).toLocaleString();
function ContextEditor({
  context,
  onSave,
  pending,
}: {
  context: PrecisionContext;
  onSave: (data: PrecisionContext) => void;
  pending: boolean;
}) {
  return (
    <form
      className="bloom-panel space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSave(
          contextSchema.parse({
            goals: list(data.get("goals")),
            medications: list(data.get("medications")),
            currentSupplements: list(data.get("currentSupplements")),
            conditions: list(data.get("conditions")),
            allergies: list(data.get("allergies")),
            ageGroup: data.get("ageGroup"),
            pregnancy: data.get("pregnancy"),
            safetyReviewed: data.get("safetyReviewed") === "on",
          }),
        );
      }}
    >
      <h2>Your goals & health context</h2>
      <p className="panel-note">
        Goals are open-ended. Unsupported goals stay visible without invented
        pathway claims. All information belongs to your account.
      </p>
      <label className="block">
        Goals (comma separated)
        <input
          className="bloom-input w-full"
          name="goals"
          defaultValue={context.goals.join(", ")}
          placeholder="Lower ApoB, improve glucose, support butyrate"
          maxLength={2000}
        />
      </label>
      {(
        [
          ["medications", "Medications"],
          ["currentSupplements", "Current supplements, including doses"],
          ["conditions", "Medical conditions"],
          ["allergies", "Food allergies / medical food restrictions"],
        ] as const
      ).map(([name, label]) => (
        <label className="block" key={name}>
          {label} (comma separated)
          <input
            className="bloom-input w-full"
            name={name}
            defaultValue={context[name].join(", ")}
            maxLength={3000}
          />
        </label>
      ))}
      <div className="precision-grid">
        <label>
          Age group
          <select
            className="bloom-input w-full"
            name="ageGroup"
            defaultValue={context.ageGroup}
          >
            <option value="unknown">Not confirmed</option>
            <option value="adult">18 or older</option>
            <option value="under18">Under 18</option>
          </select>
        </label>
        <label>
          Pregnant / breastfeeding or planning pregnancy
          <select
            className="bloom-input w-full"
            name="pregnancy"
            defaultValue={context.pregnancy}
          >
            <option value="unknown">Not confirmed</option>
            <option value="no">No / not applicable</option>
            <option value="yes">Yes</option>
          </select>
        </label>
      </div>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="safetyReviewed"
          defaultChecked={context.safetyReviewed}
        />
        I have reviewed the medications, supplements, conditions and allergies
        above, including empty lists.
      </label>
      <p className="panel-note">
        Recorded history flags the need for review. Bloom does not provide a
        comprehensive drug interaction checker or certify meals as
        allergen-safe. Use dietary category exclusions too, and verify
        ingredients and preparation.
      </p>
      <Button type="submit" disabled={pending}>
        Save health context
      </Button>
    </form>
  );
}
export default function PrecisionNutrition() {
  const [tab, setTab] = useState("overview"),
    [sampleId, setSampleId] = useState("");
  const [status, setStatus] = useState(""),
    [localError, setLocalError] = useState("");
  const result = useQuery<Report>({
    queryKey: ["/api/precision", sampleId],
    queryFn: async () =>
      (
        await apiRequest(
          "GET",
          "/api/precision" +
            (sampleId ? "?sampleId=" + encodeURIComponent(sampleId) : ""),
        )
      ).json(),
  });
  const [context, setContext] = useState(contextSchema.parse({}));
  useEffect(() => {
    if (result.data) setContext(result.data.context);
  }, [result.data]);
  const mutation = useMutation({
    mutationFn: async ({
      url,
      method = "POST",
      body,
    }: {
      url: string;
      method?: string;
      body?: unknown;
    }) => {
      const response = await apiRequest(method, url, body);
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      setStatus(
        "Saved. Your recommendations and tracking have been refreshed.",
      );
      setLocalError("");
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/precision/today-plan"],
      });
    },
  });
  const send = (url: string, body: unknown, method = "POST") => {
    setStatus("");
    setLocalError("");
    mutation.mutate({ url, body, method });
  };
  const [marker, setMarker] = useState("ldl"),
    [unit, setUnit] = useState("mmol/L"),
    [consent, setConsent] = useState(false),
    [geneticDate, setGeneticDate] = useState(localNow());
  const [geneticPreview, setGeneticPreview] = useState<ReturnType<
    typeof parse23andMe
  > | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const erase = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/precision", {
        method: "DELETE",
        credentials: "include",
        headers: { "X-Bloom-Confirm": "delete-precision-data" },
      });
      if (!res.ok) throw Error("Precision data could not be deleted.");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/precision"] });
      setGeneticPreview(null);
      setDeleteConfirm(false);
      setStatus(
        "Precision inputs, health context and saved precision plans deleted. Your existing meal journal and microbiome reports are retained.",
      );
      result.refetch();
    },
  });
  const remove = (record: PrecisionRecord) => {
    send(
      "/api/precision/records/" + encodeURIComponent(record.id),
      undefined,
      "DELETE",
    );
  };
  const sources = (ids: readonly string[]) => (
    <details className="mt-3">
      <summary>Evidence & limitations</summary>
      <ul className="space-y-3 mt-3">
        {ids.map((id) => {
          const s = result.data?.sources.find((s) => s.id === id);
          return s ? (
            <li key={id}>
              <a
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
                href={s.url}
              >
                {s.title}
              </a>
              <p className="panel-note">
                {s.type} · {s.limitation}
              </p>
            </li>
          ) : null;
        })}
      </ul>
    </details>
  );
  const formError = (e: unknown) =>
    setLocalError(
      e instanceof Error ? e.message : "Check the information entered.",
    );
  function submitLab(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const d = new FormData(e.currentTarget);
      send("/api/precision/records", {
        kind: "lab",
        payload: {
          marker,
          value: number(d, "value"),
          unit,
          measuredAt: date(d, "measuredAt"),
          laboratory: String(d.get("laboratory") || "Not supplied"),
          method: String(d.get("method") || "Not supplied"),
          fasting: d.get("fasting"),
          referenceLow: number(d, "referenceLow"),
          referenceHigh: number(d, "referenceHigh"),
          notes: String(d.get("notes") || ""),
        },
      });
    } catch (e) {
      formError(e);
    }
  }
  const r = result.data;
  return (
    <main className="science-page precision-page">
      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div className="science-heading">
          <p className="eyebrow">Your evidence, connected</p>
          <h1>Precision nutrition</h1>
          <p className="science-intro">
            Genetics, laboratory results, microbiome reports and everyday
            meals—brought together with evidence you can inspect.
          </p>
        </div>
        <Link className="text-link" href="/meal-planner">
          Food preferences & meal planner
        </Link>
      </div>
      <div
        className="precision-tabs"
        role="group"
        aria-label="Precision nutrition sections"
      >
        {[
          ["overview", "Overview", ShieldCheck],
          ["genetics", "Genetics", Dna],
          ["labs", "Labs & microbiome", FlaskConical],
          ["recommendations", "Food & supplements", Leaf],
          ["progress", "Validate response", ChartNoAxesCombined],
        ].map(([id, label, Icon]) => (
          <Button
            key={String(id)}
            variant={tab === id ? "default" : "outline"}
            aria-pressed={tab === id}
            onClick={() => setTab(String(id))}
          >
            {typeof Icon !== "string" && <Icon size={16} />} {String(label)}
          </Button>
        ))}
      </div>
      <div aria-live="polite">
        {status && (
          <p className="bloom-panel" role="status">
            {status}
          </p>
        )}
        {(localError || mutation.error || erase.error) && (
          <p role="alert" className="bloom-panel">
            {localError || mutation.error?.message || erase.error?.message}
          </p>
        )}
      </div>
      {result.isLoading ? (
        <p role="status">Connecting your precision nutrition inputs…</p>
      ) : result.isError ? (
        <section className="bloom-panel">
          <h2>Precision workspace unavailable</h2>
          <p role="alert">{result.error.message}</p>
          <Button onClick={() => result.refetch()}>Retry</Button>
          {sampleId && (
            <Button onClick={() => setSampleId("")}>Use latest report</Button>
          )}
        </section>
      ) : (
        r && (
          <>
            {tab === "overview" && (
              <>
                <section className="bloom-panel">
                  <h2>Your five-layer workspace</h2>
                  <div className="precision-grid">
                    {[
                      [
                        "Genetics",
                        r.genetics.import
                          ? `${r.genetics.findings.filter((f) => f.status === "reported raw call" || f.status === "self-reported call").length} reviewed calls`
                          : "No genetic import",
                      ],
                      [
                        "Bloodwork",
                        `${r.labs.length} markers · ${r.labs.filter((l) => l.stale).length} older than six months`,
                      ],
                      [
                        "Microbiome",
                        r.microbiome.report
                          ? `${r.microbiome.report.taxa.length} reported taxa`
                          : "No supported structured report",
                      ],
                      [
                        "Measured metabolites",
                        `${r.microbiome.measuredMetabolites.length} entered measurements`,
                      ],
                      [
                        "Response tracking",
                        `${r.checkins.length} check-ins · ${r.plans.length} saved plans`,
                      ],
                    ].map(([name, value]) => (
                      <div key={name}>
                        <h3>{name}</h3>
                        <p>{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="panel-note">
                    A working, bounded evidence engine—not a clinically
                    validated treatment model. Genetic coverage and supported
                    rules are explicitly limited. Missing data never becomes a
                    fabricated result.
                  </p>
                </section>
                <ContextEditor
                  key={JSON.stringify(r.context)}
                  context={context}
                  pending={mutation.isPending}
                  onSave={(data) => send("/api/precision/context", data, "PUT")}
                />
                <section className="bloom-panel">
                  <h2>Goal coverage</h2>
                  {r.goals.length ? (
                    r.goals.map((g) => (
                      <article
                        className="precision-observation block"
                        key={g.goal}
                      >
                        <h3>
                          {g.goal} · {g.mapping}
                        </h3>
                        <ul>
                          {g.actions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                        <p className="panel-note">{g.tracking}</p>
                        {sources(g.sourceIds)}
                      </article>
                    ))
                  ) : (
                    <p>
                      Add your own goals above; saved meal-planner goals also
                      inform recommendations.
                    </p>
                  )}
                  <Link className="text-link" href="/insights">
                    Explore molecule pathways & research populations
                  </Link>
                </section>
                <details className="bloom-panel">
                  <summary>Dietary preferences & exclusions</summary>
                  <DietaryPreferenceEditor />
                </details>
                <details className="bloom-panel">
                  <summary>Data control</summary>
                  <p>
                    Genetic files are parsed on your device. Only the supported
                    calls and import metadata are sent after consent. Precision
                    inputs and plans are encrypted in storage and are never sent
                    to an AI provider by these features.
                  </p>
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.checked)}
                    />
                    Delete all my precision inputs, health context and saved
                    precision plans
                  </label>
                  <Button
                    className="mt-3"
                    variant="destructive"
                    disabled={!deleteConfirm || erase.isPending}
                    onClick={() => erase.mutate()}
                  >
                    Delete precision data
                  </Button>
                </details>
              </>
            )}
            {tab === "genetics" && (
              <>
                <ManualGenetics
                  key={r.genetics.import?.id || "none"}
                  genetics={r.genetics}
                  onSaved={() =>
                    setStatus(
                      "Selected SNPs saved as your active genetic dataset. Unreviewed or unconfirmed entries remain recorded without interpretation.",
                    )
                  }
                />
                <section className="bloom-panel space-y-4">
                  <h2>Import 23andMe raw data</h2>
                  <p>
                    {r.genetics.coverage}. Supported format: uncompressed
                    GRCh37, forward-strand text export. Unknown builds, wrong
                    coordinates, conflicting calls and unsupported strand
                    notation are rejected. Only the 29 explanation-catalogue
                    SNPs are retained after preview and consent; dietary ranking
                    remains limited to the seven reviewed markers.
                  </p>
                  <label className="block">
                    DNA sample date
                    <input
                      className="bloom-input w-full"
                      type="datetime-local"
                      value={geneticDate}
                      onChange={(e) => setGeneticDate(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    Raw data text file
                    <input
                      className="bloom-input w-full"
                      type="file"
                      accept=".txt"
                      onChange={async (e) => {
                        setGeneticPreview(null);
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          if (file.size > 50 * 1024 * 1024)
                            throw Error(
                              "Use an uncompressed file under 50 MB.",
                            );
                          setGeneticPreview(
                            parse23andMe(
                              await file.text(),
                              new Date(geneticDate).toISOString(),
                            ),
                          );
                          setLocalError("");
                        } catch (err) {
                          formError(err);
                        }
                      }}
                    />
                  </label>
                  {geneticPreview && (
                    <div>
                      <p>
                        Scanned{" "}
                        {geneticPreview.scannedVariants.toLocaleString()} rows.{" "}
                        {geneticPreview.calls.length} supported calls will be
                        saved:
                      </p>
                      <ul>
                        {geneticPreview.calls.map((c) => (
                          <li key={c.rsid}>
                            {c.rsid}: {c.genotype} · chromosome {c.chromosome}:
                            {c.position}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    I consent to saving these supported genetic calls to my
                    account. The full raw file is not uploaded.
                  </label>
                  <Button
                    disabled={!consent || !geneticPreview || mutation.isPending}
                    onClick={() =>
                      geneticPreview &&
                      send("/api/precision/records", {
                        kind: "genetics",
                        payload: geneticPreview,
                      })
                    }
                  >
                    Save supported calls
                  </Button>
                  {sources(["raw-format"])}
                </section>
                {r.genetics.import && (
                  <section className="bloom-panel">
                    <p>
                      Active import:{" "}
                      {r.genetics.import.collectedAt.slice(0, 10)}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        remove({
                          id: r.genetics.import!.id,
                          kind: "genetics",
                          payload: null,
                          createdAt: r.genetics.import!.collectedAt,
                        })
                      }
                    >
                      Delete active genetic import
                    </Button>
                    <p className="panel-note">
                      Deleting an input also removes derived precision plans.
                      Earlier imports, if any, remain available until deleted
                      with all precision data.
                    </p>
                  </section>
                )}
                <GenotypeExplanations entries={r.genetics.explanations || []} />
                <details>
                  <summary>Reviewed marker pathway context</summary>
                  {r.genetics.findings.map((f) => (
                    <article className="bloom-panel" key={f.rsid}>
                      <p className="eyebrow">{f.status}</p>
                      <h2>
                        {f.gene} · {f.rsid}
                      </h2>
                      <p>
                        Forward-strand call:{" "}
                        <strong>{f.genotype || "Not available"}</strong> ·{" "}
                        {f.pathway}
                      </p>
                      <p>{f.interpretation}</p>
                      <p>{f.actionability}</p>
                      <p className="panel-note">{f.limitation}</p>
                      {sources(f.sources)}
                    </article>
                  ))}
                </details>
                <p className="panel-note">
                  Consumer calls need appropriate confirmation before clinical
                  decisions. Unreported variants are not assumed to be absent.
                  No polygenic risk score, rare-disease or diagnostic
                  interpretation is performed.
                </p>
              </>
            )}
            {tab === "labs" && (
              <>
                <QuickLabEntry />
                <details className="bloom-panel">
                  <summary>
                    Add one result with reference range & details
                  </summary>
                  <form className="space-y-4" onSubmit={submitLab}>
                    <h2>Add a dated laboratory result</h2>
                    <p className="panel-note">
                      Use your report's units and reference interval. A
                      reference interval is not an individualized treatment
                      target.
                    </p>
                    <div className="precision-grid">
                      <label>
                        Marker
                        <select
                          className="bloom-input w-full"
                          value={marker}
                          onChange={(e) => {
                            setMarker(e.target.value);
                            setUnit(
                              markerDefinitions.find(
                                (m) => m.id === e.target.value,
                              )!.units[0],
                            );
                          }}
                        >
                          {markerDefinitions.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Value
                        <input
                          name="value"
                          className="bloom-input w-full"
                          type="number"
                          step="any"
                          min="0"
                          required
                        />
                      </label>
                      <label>
                        Unit
                        <select
                          className="bloom-input w-full"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                        >
                          {markerDefinitions
                            .find((m) => m.id === marker)!
                            .units.map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                        </select>
                      </label>
                      <label>
                        Measured at
                        <input
                          name="measuredAt"
                          className="bloom-input w-full"
                          type="datetime-local"
                          defaultValue={localNow()}
                          required
                        />
                      </label>
                      <label>
                        Report reference low (optional)
                        <input
                          name="referenceLow"
                          className="bloom-input w-full"
                          type="number"
                          min="0"
                          step="any"
                        />
                      </label>
                      <label>
                        Report reference high (optional)
                        <input
                          name="referenceHigh"
                          className="bloom-input w-full"
                          type="number"
                          min="0"
                          step="any"
                        />
                      </label>
                      <label>
                        Laboratory
                        <input
                          name="laboratory"
                          className="bloom-input w-full"
                          maxLength={200}
                        />
                      </label>
                      <label>
                        Method / assay (optional)
                        <input
                          name="method"
                          className="bloom-input w-full"
                          maxLength={200}
                        />
                      </label>
                      <label>
                        Fasting
                        <select name="fasting" className="bloom-input w-full">
                          <option value="unknown">
                            Unknown / not applicable
                          </option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label>
                        Notes
                        <input
                          name="notes"
                          className="bloom-input w-full"
                          maxLength={1000}
                        />
                      </label>
                    </div>
                    <Button disabled={mutation.isPending}>
                      Save laboratory result
                    </Button>
                  </form>
                </details>
                <section className="bloom-panel">
                  <h2>Latest results</h2>
                  {r.labs.length ? (
                    r.labs.map((l) => (
                      <article className="precision-observation" key={l.id}>
                        <div>
                          <h3>
                            {
                              markerDefinitions.find((m) => m.id === l.marker)!
                                .name
                            }
                          </h3>
                          <p>
                            {l.value} {l.unit} · {l.flag}
                            {l.stale
                              ? " · Older than six months; excluded from current ranking"
                              : ""}
                          </p>
                          <p className="panel-note">
                            {new Date(l.measuredAt).toLocaleString()} ·{" "}
                            {l.laboratory} · {l.method} · fasting {l.fasting}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            remove({
                              id: l.id,
                              kind: "lab",
                              payload: l,
                              createdAt: l.measuredAt,
                            })
                          }
                        >
                          Delete result
                        </Button>
                      </article>
                    ))
                  ) : (
                    <p>
                      No bloodwork recorded. Genetics and microbiome data are
                      optional too.
                    </p>
                  )}
                  <details className="mt-4">
                    <summary>
                      All recorded laboratory results ({r.labHistory.length})
                    </summary>
                    {r.labHistory.map((l) => (
                      <div className="precision-observation" key={l.id}>
                        <p>
                          {l.marker}: {l.value} {l.unit} ·{" "}
                          {l.measuredAt.slice(0, 10)}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            remove({
                              id: l.id,
                              kind: "lab",
                              payload: l,
                              createdAt: l.measuredAt,
                            })
                          }
                        >
                          Delete historical result
                        </Button>
                      </div>
                    ))}
                  </details>
                </section>
                <section className="bloom-panel">
                  <h2>Microbiome evidence</h2>
                  <p>{r.microbiome.note}</p>
                  {r.microbiome.geneticPathwayLinks.map((l) => (
                    <p key={l.rsid}>
                      <strong>
                        {l.rsid} · {l.pathway}
                      </strong>
                      <br />
                      {l.link}
                      <br />
                      <span className="panel-note">{l.evidence}</span>
                    </p>
                  ))}
                  <label className="block">
                    Structured microbiome report
                    <select
                      className="bloom-input w-full"
                      value={sampleId}
                      onChange={(e) => setSampleId(e.target.value)}
                    >
                      <option value="">Latest supported report</option>
                      {r.availableReports.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {s.date.slice(0, 10)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {r.microbiome.report ? (
                    <>
                      <p>
                        Report {r.microbiome.report.id} ·{" "}
                        {r.microbiome.report.date.slice(0, 10)}
                      </p>
                      {r.microbiome.report.taxa.map((t) => (
                        <p key={t.name}>
                          {t.name}: {t.abundance}% — reported abundance
                        </p>
                      ))}
                      {r.microbiome.report.predictions.map((p, i) => (
                        <p key={i}>
                          {p.name}: {p.value ?? "unavailable"} — experimental
                          model index, not a measured concentration
                        </p>
                      ))}
                    </>
                  ) : (
                    <p>No supported structured abundance report linked yet.</p>
                  )}
                  <Link className="text-link" href="/upload">
                    Import microbiome report
                  </Link>
                </section>
                <form
                  className="bloom-panel space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      const d = new FormData(e.currentTarget);
                      send("/api/precision/records", {
                        kind: "metabolite",
                        payload: {
                          name: d.get("name"),
                          value: number(d, "value"),
                          unit: d.get("unit"),
                          specimen: d.get("specimen"),
                          measuredAt: date(d, "measuredAt"),
                          laboratory: String(
                            d.get("laboratory") || "Not supplied",
                          ),
                          method: String(d.get("method") || "Not supplied"),
                        },
                      });
                    } catch (err) {
                      formError(err);
                    }
                  }}
                >
                  <h2>Add a measured metabolite</h2>
                  <p className="panel-note">
                    Only use an actual laboratory measurement. Predicted values
                    belong in the model results above.
                  </p>
                  <div className="precision-grid">
                    <label>
                      Molecule
                      <select className="bloom-input w-full" name="name">
                        {[
                          "butyrate",
                          "acetate",
                          "propionate",
                          "lactate",
                          "urolithin_a",
                          "isoalloLCA",
                        ].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Value
                      <input
                        className="bloom-input w-full"
                        name="value"
                        type="number"
                        min="0"
                        step="any"
                        required
                      />
                    </label>
                    <label>
                      Unit as reported
                      <input
                        className="bloom-input w-full"
                        name="unit"
                        required
                        maxLength={200}
                      />
                    </label>
                    <label>
                      Specimen
                      <select className="bloom-input w-full" name="specimen">
                        <option>stool</option>
                        <option>blood</option>
                        <option>urine</option>
                      </select>
                    </label>
                    <label>
                      Measured at
                      <input
                        className="bloom-input w-full"
                        name="measuredAt"
                        type="datetime-local"
                        defaultValue={localNow()}
                        required
                      />
                    </label>
                    <label>
                      Laboratory
                      <input
                        className="bloom-input w-full"
                        name="laboratory"
                        required
                        maxLength={200}
                      />
                    </label>
                    <label>
                      Method
                      <input
                        className="bloom-input w-full"
                        name="method"
                        required
                        maxLength={200}
                      />
                    </label>
                  </div>
                  <Button disabled={mutation.isPending}>
                    Save measured metabolite
                  </Button>
                </form>
                <section className="bloom-panel">
                  <h2>Entered metabolite measurements</h2>
                  {r.microbiome.measuredMetabolites.length ? (
                    r.microbiome.measuredMetabolites.map((m) => (
                      <div className="precision-observation" key={m.id}>
                        <p>
                          {m.name}: {m.value} {m.unit} · {m.specimen} ·{" "}
                          {m.measuredAt.slice(0, 10)}
                          <br />
                          <span className="panel-note">
                            {m.provenance} · {m.laboratory} · {m.method}
                          </span>
                        </p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            remove({
                              id: m.id,
                              kind: "metabolite",
                              payload: m,
                              createdAt: m.measuredAt,
                            })
                          }
                        >
                          Delete measurement
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p>
                      No measured metabolites recorded. Taxa cannot fill in
                      these values.
                    </p>
                  )}
                </section>
              </>
            )}
            {tab === "recommendations" && (
              <>
                <section className="bloom-panel">
                  <h2>How your priorities are determined</h2>
                  <p>{r.rankingNote}</p>
                  <p className="panel-note">
                    {r.personalReasons.join(" · ") ||
                      "No current cardiometabolic laboratory flags. Saved goals and eligible pathway evidence can still inform meal choices."}
                  </p>
                  {r.reviewFlags.map((f, i) => (
                    <p key={i}>{f}</p>
                  ))}
                  {r.safetyBlocks.map((f, i) => (
                    <p className="panel-note" key={i}>
                      {f}
                    </p>
                  ))}
                  <Link className="text-link" href="/meal-planner">
                    Edit dietary restrictions and preferences
                  </Link>
                </section>
                <section className="bloom-panel">
                  <h2>Ranked foods</h2>
                  {r.foods.length ? (
                    r.foods.map((f, i) => (
                      <details className="precision-observation" key={f.id}>
                        <summary>
                          {i + 1}. {f.name} · ranked for your saved priorities
                        </summary>
                        <p>{f.nutrients.join(" · ")}</p>
                        <ul>
                          {f.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                        <p className="panel-note">
                          {f.expectedBenefit} {f.portion}
                        </p>
                        {f.pathways.map((p) => (
                          <p key={p.id}>
                            {p.substrate} → {p.organisms.join(", ")} →{" "}
                            {p.molecules.join(", ")} (potential pathway)
                          </p>
                        ))}
                        {sources(f.sourceIds)}
                      </details>
                    ))
                  ) : (
                    <p>
                      Confirm your adult health context and add supported goals
                      or recent measurements.
                    </p>
                  )}
                </section>
                <TodayPlanner />
                <section className="bloom-panel">
                  <h2>Complete meals for your priorities</h2>
                  <p className="panel-note">
                    Meals are ordered by matching evidence and your saved
                    priorities. Recent lab findings carry more weight than
                    general goals or common genetic variants. Ranking is not a
                    benefit percentage.
                  </p>
                  {r.recommendations.map((meal, i) => {
                    const prep = recipePreparation(meal);
                    return (
                      <article
                        className="precision-observation block"
                        key={meal.id}
                      >
                        <h3>
                          {i + 1}. {meal.name}
                        </h3>
                        <p>
                          About {prep.minutes} minutes; additional chilling time
                          where listed.
                        </p>
                        <details>
                          <summary>Ingredients, recipe & evidence</summary>
                          <h4>Shopping & ingredients</h4>
                          <ul>
                            {prep.shopping.map((i) => (
                              <li key={i.name}>
                                {i.estimated ? "Approximately " : ""}
                                {i.grams} g {i.name}
                              </li>
                            ))}
                          </ul>
                          <p className="panel-note">
                            Prepared portions for nutrition:{" "}
                            {prep.shopping
                              .map((i) => i.nutritionBasis)
                              .join("; ")}
                            .
                          </p>
                          <ol>
                            {prep.instructions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                            {meal.steps
                              .filter(
                                (s) =>
                                  !/^Use safely|^Use the named|^Serve cooked|^Combine with cooked/i.test(
                                    s,
                                  ),
                              )
                              .map((s, i) => (
                                <li key={"assembly" + i}>{s}</li>
                              ))}
                          </ol>
                          <p className="panel-note">{prep.note}</p>
                          <a
                            className="text-link"
                            href={prep.source}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Cooking safety guidance
                          </a>
                          <p>{meal.rationale}</p>
                          {sources(meal.sourceIds)}
                        </details>
                        <details>
                          <summary>Why this meal suits you</summary>
                          <ul>
                            {meal.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                          <p>{meal.nutrientContributions.join(" · ")}</p>
                          {meal.tolerance && <p>{meal.tolerance}</p>}
                          <p className="panel-note">
                            {meal.expectedBenefit} These nutrient contributions
                            are qualitative; use the rest-of-day planner for
                            estimated quantities.
                          </p>
                          {meal.reportedTaxa.length > 0 && (
                            <p>
                              Reported taxa overlapping this research pathway:{" "}
                              {meal.reportedTaxa.map((t) => t.name).join(", ")}.
                              Presence alone does not establish function or
                              improve ranking.
                            </p>
                          )}
                        </details>
                        <Link
                          className="text-link"
                          href={"/log-meal?recipe=" + meal.id}
                        >
                          Use this meal in my journal
                        </Link>
                      </article>
                    );
                  })}
                </section>
                <section className="bloom-panel">
                  <h2>Supplement assessments</h2>
                  {r.supplements.length ? (
                    r.supplements.map((s) => (
                      <article
                        className="precision-observation block"
                        key={s.id}
                      >
                        <h3>{s.name}</h3>
                        <p>{s.reason}</p>
                        <p>
                          <strong>{s.status}</strong> · No dose prescribed
                        </p>
                        <ul>
                          {s.checks.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                        {sources(s.sources)}
                      </article>
                    ))
                  ) : (
                    <p>
                      No supplement need established from the current supported
                      inputs. A variant alone never creates a supplement
                      recommendation.
                    </p>
                  )}
                </section>
                <form
                  className="bloom-panel space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send("/api/precision/plans", {
                      name: String(new FormData(e.currentTarget).get("name")),
                      ...(sampleId ? { sampleId } : {}),
                    });
                  }}
                >
                  <h2>Save a plan to evaluate</h2>
                  <label className="block">
                    Plan name
                    <input
                      className="bloom-input w-full"
                      name="name"
                      required
                      maxLength={100}
                      placeholder="My first nutrition plan"
                    />
                  </label>
                  <Button
                    disabled={mutation.isPending || !r.recommendations.length}
                  >
                    Save evidence-linked plan
                  </Button>
                  <p className="panel-note">
                    This saves the current ranking, evidence version and
                    supporting record references. It does not automatically log
                    meals or claim the plan is a clinical prescription.
                  </p>
                </form>
              </>
            )}
            {tab === "progress" && (
              <>
                <form
                  className="bloom-panel space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      const d = new FormData(e.currentTarget);
                      send("/api/precision/records", {
                        kind: "checkin",
                        payload: {
                          measuredAt: date(d, "measuredAt"),
                          weightKg: number(d, "weightKg"),
                          bodyFatPercent: number(d, "bodyFatPercent"),
                          waistCm: number(d, "waistCm"),
                          bloating: number(d, "bloating"),
                          energy: number(d, "energy"),
                          adherencePercent: number(d, "adherencePercent"),
                          planId: d.get("planId") || null,
                          notes: String(d.get("notes") || ""),
                        },
                      });
                    } catch (err) {
                      formError(err);
                    }
                  }}
                >
                  <h2>Record your response</h2>
                  <label className="block">
                    Related plan
                    <select className="bloom-input w-full" name="planId">
                      <option value="">General check-in</option>
                      {r.plans.map((p) => (
                        <option value={p.id} key={p.id}>
                          {(p.payload as any).name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="precision-grid">
                    <label>
                      Measured at
                      <input
                        name="measuredAt"
                        className="bloom-input w-full"
                        type="datetime-local"
                        defaultValue={localNow()}
                        required
                      />
                    </label>
                    {[
                      ["weightKg", "Weight (kg)", 500],
                      ["bodyFatPercent", "Body fat (%)", 75],
                      ["waistCm", "Waist (cm)", 300],
                      ["bloating", "Bloating (0–10)", 10],
                      ["energy", "Energy (0–10)", 10],
                      ["adherencePercent", "Self-reported adherence (%)", 100],
                    ].map(([name, label, max]) => (
                      <label key={name}>
                        {label}
                        <input
                          name={String(name)}
                          className="bloom-input w-full"
                          type="number"
                          min={
                            name === "weightKg" ||
                            name === "bodyFatPercent" ||
                            name === "waistCm"
                              ? 0.1
                              : 0
                          }
                          max={max}
                          step={
                            name === "bloating" || name === "energy" ? 1 : "any"
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label className="block">
                    Notes
                    <textarea
                      className="bloom-input w-full"
                      name="notes"
                      maxLength={2000}
                    />
                  </label>
                  <p className="panel-note">
                    Leave unmeasured fields blank. Zero is a recorded value, not
                    a substitute for missing information.
                  </p>
                  <Button disabled={mutation.isPending}>Save check-in</Button>
                </form>
                <section className="bloom-panel">
                  <h2>Repeatable biomarkers</h2>
                  {r.trends.length ? (
                    r.trends.map((t) => (
                      <article
                        className="precision-observation block"
                        key={t.marker}
                      >
                        <h3>{t.name}</h3>
                        <p>
                          {t.points
                            .map(
                              (p) =>
                                `${p.date.slice(0, 10)}: ${display(p.value)} ${p.unit}`,
                            )
                            .join(" → ")}
                        </p>
                        {t.change !== null && (
                          <p>
                            Observed first-to-latest change: {display(t.change)}{" "}
                            {t.points[0].unit}
                          </p>
                        )}
                        <p className="panel-note">{t.note}</p>
                      </article>
                    ))
                  ) : (
                    <p>
                      Add baseline and repeat laboratory results to assess
                      observed changes.
                    </p>
                  )}
                </section>
                <section className="bloom-panel">
                  <h2>Saved plans & observations</h2>
                  {r.plans.map((p) => (
                    <details className="precision-observation block" key={p.id}>
                      <summary>
                        {(p.payload as any).name} ·{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </summary>
                      <p>Evidence version: {(p.payload as any).version}</p>
                      <p>
                        {r.checkins.filter((c) => c.planId === p.id).length}{" "}
                        linked check-ins
                      </p>
                      <ul>
                        {((p.payload as any).recommendations || []).map(
                          (m: any) => (
                            <li key={m.id}>{m.name}</li>
                          ),
                        )}
                      </ul>
                      <Button variant="outline" onClick={() => remove(p)}>
                        Delete plan
                      </Button>
                    </details>
                  ))}
                  {r.checkins.map((c) => (
                    <article className="precision-observation" key={c.id}>
                      <div>
                        <h3>{new Date(c.measuredAt).toLocaleDateString()}</h3>
                        <p>
                          {[
                            ["Weight", c.weightKg, "kg"],
                            ["Body fat", c.bodyFatPercent, "%"],
                            ["Waist", c.waistCm, "cm"],
                            ["Bloating", c.bloating, "/10"],
                            ["Energy", c.energy, "/10"],
                            ["Adherence", c.adherencePercent, "%"],
                          ]
                            .filter(([, value]) => value !== null)
                            .map(
                              ([name, value, unit]) =>
                                `${name}: ${value}${unit}`,
                            )
                            .join(" · ")}
                        </p>
                        <p>{c.notes}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          remove({
                            id: c.id,
                            kind: "checkin",
                            payload: c,
                            createdAt: c.measuredAt,
                          })
                        }
                      >
                        Delete check-in
                      </Button>
                    </article>
                  ))}
                  {!r.plans.length && !r.checkins.length && (
                    <p>
                      Save a plan and record observations to start tracking.
                    </p>
                  )}
                  <p className="panel-note">
                    Change over time does not establish that food, a supplement,
                    a variant or a microbe caused it. Review medication,
                    exercise, illness and measurement changes too.
                  </p>
                </section>
                <section className="bloom-panel">
                  <h2>Recorded nutrition · past {r.intake.days} days</h2>
                  <p>
                    {r.intake.mealsLogged} meals logged ·{" "}
                    {r.journalSymptoms.length} meal symptom records
                  </p>
                  <p className="panel-note">{r.intake.note}</p>
                  <details>
                    <summary>Available macro & micronutrient estimates</summary>
                    {r.intake.nutrients.map((n) => (
                      <p key={n.key}>
                        {n.name}: {display(n.knownTotal)} {n.unit} known total ·{" "}
                        {n.completeMeals}/{r.intake.mealsLogged} meals with
                        complete estimates
                      </p>
                    ))}
                  </details>
                  <Link className="text-link" href="/nutrition">
                    Open full food journal
                  </Link>
                </section>
              </>
            )}
          </>
        )
      )}
    </main>
  );
}
