import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  variantCatalog,
  manualGeneticImportSchema,
  classifyManualGenetics,
  type PrecisionReport,
} from "@shared/precision-nutrition";
import {
  additionalEntryShortcuts,
  parseGenotypeTable,
} from "@shared/manual-genetics";
type Row = { gene: string; rsid: string; genotype: string };
const templates: Row[] = [
  ...variantCatalog.map((v) => ({ gene: v.gene, rsid: v.rsid, genotype: "" })),
  ...additionalEntryShortcuts.map(([gene, rsid]) => ({
    gene,
    rsid,
    genotype: "",
  })),
];
export default function ManualGenetics({
  genetics,
  onSaved,
}: {
  genetics: PrecisionReport["genetics"];
  onSaved: () => void;
}) {
  const existing =
    genetics.manual?.entries ||
    genetics.findings
      .filter((f) => f.genotype)
      .map((f) => ({ gene: f.gene, rsid: f.rsid, genotype: f.genotype! }));
  const [rows, setRows] = useState<Row[]>(() => {
    const combined = templates.map((t) => ({
      ...t,
      gene: existing.find((e) => e.rsid === t.rsid)?.gene || t.gene,
      genotype: existing.find((e) => e.rsid === t.rsid)?.genotype || "",
    }));
    return [
      ...combined,
      ...existing
        .filter((e) => !templates.some((t) => t.rsid === e.rsid))
        .map(({ gene, rsid, genotype }) => ({ gene, rsid, genotype })),
    ];
  });
  const [source, setSource] = useState(genetics.manual?.source || ""),
    [forward, setForward] = useState(false),
    [consent, setConsent] = useState(false);
  const [collectedAt, setDate] = useState(
    () =>
      genetics.import?.collectedAt.slice(0, 10) ||
      new Date().toISOString().slice(0, 10),
  );
  const [extraOpen, setExtraOpen] = useState(false);
  const [paste, setPaste] = useState(""),
    [error, setError] = useState("");
  const [preview, setPreview] = useState<ReturnType<
    typeof manualGeneticImportSchema.parse
  > | null>(null);
  const save = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/precision/records", {
        kind: "genetics",
        payload: preview,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
      onSaved();
    },
  });
  function changed() {
    setPreview(null);
    setError("");
    setConsent(false);
  }
  function field(index: number, value: string) {
    changed();
    setRows(rows.map((r, i) => (i === index ? { ...r, genotype: value } : r)));
  }
  function renderRows(group: Row[], offset: number) {
    return (
      <div className="space-y-2">
        {group.map((r, i) => (
          <label
            className="grid grid-cols-[1fr_5rem] items-center gap-3"
            key={offset + i}
          >
            <span className="min-w-0 break-words">
              {r.gene || "Selected SNP"} · {r.rsid || "Add an rsID below"}
              <small className="block panel-note">
                {variantCatalog.some((v) => v.rsid === r.rsid)
                  ? "Reviewed marker; forward-strand match required"
                  : "Recorded only; no reviewed interpretation"}
              </small>
            </span>
            <input
              className="bloom-input w-full"
              aria-label={`Genotype ${r.rsid}`}
              value={r.genotype}
              onChange={(e) => field(offset + i, e.target.value)}
              maxLength={8}
              placeholder="e.g. AG"
              autoComplete="off"
            />
          </label>
        ))}
      </div>
    );
  }
  return (
    <section className="bloom-panel space-y-4" aria-labelledby="manual-title">
      <p className="eyebrow">SELECTED GENETIC DATA</p>
      <h2 id="manual-title">Enter individual SNPs</h2>
      <p>
        Provide only the markers you choose. Enter them below or paste a table.
        No full DNA file is required. Leave unknown results blank; use -- only
        when the report says no call.
      </p>
      <p className="panel-note">
        This form includes your active saved calls. Saving creates a new active
        dataset using every filled row shown here. Clearing a row removes it
        from the new active set; previous datasets remain until deleted. This is
        self-reported data, not a verified laboratory import.
      </p>
      <details>
        <summary>Paste a genotype table</summary>
        <label className="block">
          Gene, SNP and genotype
          <textarea
            className="bloom-input w-full min-h-32"
            aria-label="Genotype table"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            maxLength={30000}
            placeholder={
              "Gene SNP Your genotype\nMTHFR rs1801133 AG\nLCT/MCM6 rs4988235 AA"
            }
          />
        </label>
        <Button
          variant="outline"
          onClick={() => {
            try {
              const entries = parseGenotypeTable(paste);
              changed();
              setRows((old) => [
                ...old.map((r) => entries.find((e) => e.rsid === r.rsid) || r),
                ...entries.filter((e) => !old.some((r) => r.rsid === e.rsid)),
              ]);
              setPaste("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Check the table.");
            }
          }}
        >
          Apply table to form
        </Button>
        <p className="panel-note">
          Pasted SNPs update matching rows and preserve other filled rows.
          Duplicate rsIDs and malformed rows are rejected before anything is
          saved.
        </p>
      </details>
      <h3>Reviewed nutrition-related markers</h3>
      {renderRows(rows.slice(0, variantCatalog.length), 0)}
      <details
        open={extraOpen}
        onToggle={(e) => setExtraOpen(e.currentTarget.open)}
      >
        <summary>Additional SNPs · recorded without interpretation</summary>
        <p>
          These are entry shortcuts, not a ranking of clinical importance or a
          recommendation to test them. Gene names are user-provided labels; the
          rsID identifies the marker. Bloom does not infer APOE type or disease
          risk from these entries.
        </p>
        {renderRows(rows.slice(variantCatalog.length), variantCatalog.length)}
      </details>
      <details>
        <summary>Add another SNP</summary>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const rsid = String(f.get("rsid") || "").trim();
            if (
              !/^rs\d{1,12}$/.test(rsid) ||
              rows.some((r) => r.rsid === rsid)
            ) {
              setError("Enter a new rsID, such as rs123456.");
              return;
            }
            changed();
            setRows([
              ...rows,
              { gene: String(f.get("gene") || "").trim(), rsid, genotype: "" },
            ]);
            setExtraOpen(true);
            e.currentTarget.reset();
          }}
        >
          <label className="block">
            Gene label (optional)
            <input className="bloom-input w-full" name="gene" maxLength={60} />
          </label>
          <label className="block">
            SNP rsID
            <input
              className="bloom-input w-full"
              name="rsid"
              required
              maxLength={14}
              placeholder="rs123456"
            />
          </label>
          <Button type="submit" variant="outline">
            Add SNP row
          </Button>
        </form>
      </details>
      <label className="block">
        Source of these results
        <input
          className="bloom-input w-full"
          aria-label="Genotype source"
          value={source}
          onChange={(e) => {
            changed();
            setSource(e.target.value);
          }}
          maxLength={200}
          placeholder="e.g. 23andMe raw-data browser"
        />
      </label>
      <label className="block">
        Sample / source date
        <input
          className="bloom-input w-full"
          type="date"
          value={collectedAt}
          onChange={(e) => {
            changed();
            setDate(e.target.value);
          }}
          max={new Date().toISOString().slice(0, 10)}
        />
      </label>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={forward}
          onChange={(e) => {
            changed();
            setForward(e.target.checked);
          }}
        />
        My source explicitly reports these genotypes on the forward (+) strand.
        Leave unchecked if unsure; entries can still be saved without
        interpretation.
      </label>
      <Button
        variant="outline"
        disabled={save.isPending}
        onClick={() => {
          try {
            setError("");
            setPreview(
              manualGeneticImportSchema.parse({
                provider: "manual",
                consent: true,
                source,
                strand: forward ? "forward" : "unknown",
                collectedAt: new Date(collectedAt + "T00:00:00Z").toISOString(),
                entries: rows.filter((r) => r.genotype.trim()),
              }),
            );
            setConsent(false);
          } catch {
            setError(
              "Enter a source, a valid date and 1–200 unique SNPs with two DNA letters (or --). Blank rows are omitted.",
            );
          }
        }}
      >
        Preview selected SNPs
      </Button>
      {preview && (
        <div className="space-y-3">
          <p>
            {preview.entries.length} selected SNPs. Only the rows below will be
            saved.
          </p>
          <ul className="space-y-2">
            {classifyManualGenetics(preview).map((e) => (
              <li key={e.rsid}>
                <strong>
                  {e.canonicalGene || e.gene} · {e.rsid}: {e.genotype}
                </strong>
                <p>
                  {e.reviewed
                    ? e.genotype === "--"
                      ? "No call; no genotype interpretation"
                      : "Eligible for reviewed context, as a self-reported call"
                    : e.reason}
                </p>
                {e.note && <p>{e.note}</p>}
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I consent to saving these selected genetic entries to my account. I
            have checked the values against my source.
          </label>
          <Button
            disabled={!consent || save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save selected SNPs"}
          </Button>
        </div>
      )}
      {(error || save.isError) && (
        <p role="alert">{error || save.error?.message}</p>
      )}
    </section>
  );
}
