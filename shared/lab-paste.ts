import { markerDefinitions, labSchema } from "./precision-nutrition";
const aliases: Record<string, string> = {
  ldlcholesterol: "ldl",
  hdlcholesterol: "hdl",
  hemoglobina1c: "hba1c",
  haemoglobina1c: "hba1c",
  a1c: "hba1c",
  "25ohvitamind": "vitamin_d",
  vitamind: "vitamin_d",
  vitaminb12: "b12",
  serumfolate: "folate",
  alanineaminotransferase: "alt",
  aspartateaminotransferase: "ast",
};
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export function parseLabPaste(
  text: string,
  measuredAt: string,
  laboratory = "Not supplied",
) {
  if (text.length > 30000)
    throw Error("Paste up to 30,000 characters at a time.");
  if (!Number.isFinite(Date.parse(measuredAt))) return { valid: [], pending: [], errors: [{ line: 0, message: "Choose a valid report date." }] };
  const rows = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if (rows.length > 50) throw Error("Paste up to 50 results at a time.");
  const valid: Array<{
      line: number;
      payload: ReturnType<typeof labSchema.parse>;
    }> = [],
    errors: Array<{ line: number; message: string }> = [],
    pending: typeof valid = [];
  rows.forEach((row, index) => {
    if (index === 0 && /^(marker|test|analyte)[,\t ]/i.test(row)) return;
    // Suggestions use only the marker catalogue, never magnitude-based clinical inference.
    const match = row
      .trim()
      .match(/^(.+?)[,\t ]+([0-9]+(?:\.[0-9]+)?)(?:[,\t ]+([^,\t]+))?(?:[,\t].*)?$/);
    if (!match) {
      errors.push({
        line: index + 1,
        message: "Use Marker, value, unit (for example LDL, 3.2, mmol/L).",
      });
      return;
    }
    const key = normalize(match[1]),
      marker = markerDefinitions.find(
        (m) =>
          normalize(m.id) === key ||
          normalize(m.name) === key ||
          m.id === aliases[key],
      );
    if (!marker) {
      errors.push({
        line: index + 1,
        message: `Unsupported marker: ${match[1]}. Use one of the listed tests.`,
      });
      return;
    }
    // A second trailing value is ambiguous (possibly reference ranges or notes).
    // Preserve strict review instead of silently discarding it.
    if (match[3] && /\s/.test(match[3].trim())) {
      errors.push({line:index+1,message:"Use a single supported source unit; enter other report details separately."});
      return;
    }
    const missingUnit = !match[3]?.trim();
    const rawUnit = (match[3] || "").trim().replace(/μ|µ/g, "u"),
      unit = marker.units.find(
        (u) => u.toLowerCase().replace(/μ|µ/g, "u") === rawUnit.toLowerCase(),
      );
    const p = labSchema.safeParse({
      marker: marker.id,
      value: Number(match[2]),
      unit: missingUnit ? marker.units[0] : unit || rawUnit,
      measuredAt,
      laboratory: laboratory.trim() || "Not supplied",
      method: "Not supplied",
      fasting: "unknown",
      referenceLow: null,
      referenceHigh: null,
      sourceInput:{text:row.slice(0,1000),number:match[2],suppliedUnit:missingUnit?null:rawUnit,capture:"pasted-report"},
      ...(missingUnit ? {unitReview:{status:"pending",originalValue:Number(match[2]),originalUnit:null,
        originalText:row.slice(0,1000),suggestedUnit:marker.units[0],confirmedAt:null,supersedes:null}} : {}),
      notes:
        "Imported from pasted results; verify against the original laboratory report.",
    });
    if (!p.success) {
      errors.push({
        line: index + 1,
        message: `Check value and unit for ${marker.name}; accepted units: ${marker.units.join(", ")}.`,
      });
      return;
    }
    if ([...valid,...pending].some((v) => v.payload.marker === p.data.marker)) {
      errors.push({
        line: index + 1,
        message: `Duplicate ${marker.name}; import different test dates separately.`,
      });
      return;
    }
    (missingUnit ? pending : valid).push({ line: index + 1, payload: p.data });
  });
  return { valid, errors, pending };
}
