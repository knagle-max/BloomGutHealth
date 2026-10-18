import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { parseLabPaste } from "@shared/lab-paste";
import { markerDefinitions } from "@shared/precision-nutrition";
export default function QuickLabEntry() {
  const [text, setText] = useState(""),
    [date, setDate] = useState(""),
    [lab, setLab] = useState(""),
    [preview, setPreview] = useState<ReturnType<typeof parseLabPaste> | null>(
      null,
    ),
    [error, setError] = useState(""),
    [saved, setSaved] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      if (!preview || preview.errors.length || !preview.valid.length)
        throw Error("Review and correct the preview first.");
      // Remove each successful row from the queue so a retry never resubmits that row.
      const pending = [...preview.valid];
      let completed = 0;
      try {
        while (pending.length) {
          await apiRequest("POST", "/api/precision/records", {
            kind: "lab",
            payload: pending[0].payload,
          });
          pending.shift();
          completed++;
          setPreview({ valid: [...pending], errors: [] });
        }
      } finally {
        if (completed) {
          setSaved(
            `${completed} result${completed === 1 ? "" : "s"} saved. Any remaining rows are still in the preview.`,
          );
          queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
          queryClient.invalidateQueries({
            queryKey: ["/api/precision/today-plan"],
          });
        }
      }
    },
    onError: (e) => setError(e.message),
  });
  function review() {
    try {
      if (!date) throw Error("Choose the test date printed on your report.");
      const d = new Date(date + "T12:00:00");
      if (!Number.isFinite(+d)) throw Error("Choose a valid test date.");
      setPreview(parseLabPaste(text, d.toISOString(), lab));
      setError("");
      setSaved("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function clear() {
    setPreview(null);
    setError("");
    setSaved("");
  }
  return (
    <section className="bloom-panel space-y-4">
      <h2>Add lab results together</h2>
      <p>
        Paste rows from your report, then check the preview before saving. Use
        one test date for the whole batch. Your report’s units are required.
      </p>
      <div className="precision-grid">
        <label>
          Test date
          <input
            className="bloom-input w-full"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              clear();
            }}
          />
        </label>
        <label>
          Laboratory (optional)
          <input
            className="bloom-input w-full"
            value={lab}
            maxLength={200}
            onChange={(e) => {
              setLab(e.target.value);
              clear();
            }}
          />
        </label>
      </div>
      <label className="block">
        Results
        <textarea
          className="bloom-input w-full"
          rows={6}
          maxLength={30000}
          placeholder={"LDL, 3.2, mmol/L\nHbA1c, 5.4, %\nVitamin D, 75, nmol/L"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            clear();
          }}
        />
      </label>
      <details>
        <summary>Supported tests & units</summary>
        <ul>
          {markerDefinitions.map((m) => (
            <li key={m.id}>
              {m.name}: {m.units.join(" or ")}
            </li>
          ))}
        </ul>
      </details>
      <Button
        type="button"
        onClick={review}
        disabled={!text.trim() || save.isPending}
      >
        Preview results
      </Button>
      {error && <p role="alert">{error}</p>}
      {saved && <p role="status">{saved}</p>}
      {preview && (
        <div>
          <ul>
            {preview.errors.map((e) => (
              <li role="alert" key={e.line}>
                Line {e.line}: {e.message}
              </li>
            ))}
          </ul>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Test date</th>
                </tr>
              </thead>
              <tbody>
                {preview.valid.map((r) => (
                  <tr key={r.line}>
                    <td>
                      {
                        markerDefinitions.find((m) => m.id === r.payload.marker)
                          ?.name
                      }
                    </td>
                    <td>{r.payload.value}</td>
                    <td>{r.payload.unit}</td>
                    <td>{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="panel-note">
            Reference ranges, fasting status and assay details are left
            unspecified. Add those using the detailed form when needed.
          </p>
          <Button
            type="button"
            disabled={
              save.isPending || !!preview.errors.length || !preview.valid.length
            }
            onClick={() => {
              setError("");
              save.mutate();
            }}
          >
            {save.isPending
              ? "Saving…"
              : `Save ${preview.valid.length} reviewed results`}
          </Button>
        </div>
      )}
    </section>
  );
}
