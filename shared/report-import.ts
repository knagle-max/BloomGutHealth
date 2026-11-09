import { z } from "zod";
export const abundanceSchema = z
  .record(
    z.string().trim().min(1).max(150),
    z.number().finite().min(0).max(100),
  )
  .refine(
    (v) =>
      Object.keys(v).length > 0 &&
      Object.keys(v).length <= 1000 &&
      Object.values(v).reduce((n, v) => n + v, 0) <= 100.01,
    "Nonempty distinct taxa percentages must sum to at most 100",
  );
export function parseReportText(text: string, format: "json" | "csv") {
  if (format === "json") {
    const value = JSON.parse(text);
    return abundanceSchema.parse(value.bacteria_percentages);
  }
  // Explicit CSV format, not automatic inference of counts/fractions or mixed ranks.
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((s) => s.trim()));
  if (rows[0]?.join(",").toLowerCase() !== "bacteria,abundance")
    throw Error(
      "CSV header must be bacteria,abundance, with percentage values and distinct taxa at one taxonomic level.",
    );
  const values: Record<string, number> = {};
  for (const row of rows.slice(1)) {
    if (
      row.length !== 2 ||
      !row[0] ||
      !row[1] ||
      Object.prototype.hasOwnProperty.call(values, row[0])
    )
      throw Error("Invalid or duplicate CSV row");
    values[row[0]] = Number(row[1]);
  }
  return abundanceSchema.parse(values);
}
