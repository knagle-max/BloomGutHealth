// Run: USDA_FDC_API_KEY=<key> node --import tsx scripts/refresh-planning-foods.mjs
// Refresh only the reviewed records. Does not automatically approve new food identities.
import { readFile, writeFile } from "node:fs/promises";
import { nutrientDefinitions } from "../shared/meal-intelligence.ts";
const key = process.env.USDA_FDC_API_KEY;
if (!key)
  throw Error("Set USDA_FDC_API_KEY privately before refreshing the snapshot.");
const path = new URL("../shared/data/planning-foods.json", import.meta.url);
const existing = JSON.parse(await readFile(path, "utf8"));
const response = await fetch(
  `https://api.nal.usda.gov/fdc/v1/foods?api_key=${encodeURIComponent(key)}`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fdcIds: existing.map((f) => f.fdcId),
      format: "full",
    }),
    signal: AbortSignal.timeout(30000),
  },
);
if (!response.ok)
  throw Error(
    `USDA refresh returned HTTP ${response.status}; existing snapshot was preserved.`,
  );
const data = await response.json();
const updated = existing.map((food) => {
  const record = data.find((r) => r.fdcId === food.fdcId);
  if (
    !record ||
    record.description !== food.description ||
    !Array.isArray(record.foodNutrients)
  )
    throw Error(
      `Record ${food.fdcId} needs manual source review; snapshot was preserved.`,
    );
  const per100g = Object.fromEntries(
    record.foodNutrients
      .filter(
        (n) =>
          nutrientDefinitions.some((d) => d[3] === n.nutrient?.id) &&
          typeof n.amount === "number" &&
          Number.isFinite(n.amount) &&
          n.amount >= 0,
      )
      .map((n) => [String(n.nutrient.id), n.amount]),
  );
  if (!["1008", "1003", "1004", "1005"].every((id) => id in per100g))
    throw Error(
      "A record is missing planning macronutrients; existing snapshot was preserved.",
    );
  return {
    ...food,
    per100g,
    retrievedAt: new Date().toISOString().slice(0, 10),
  };
});
await writeFile(path, JSON.stringify(updated, null, 2) + "\n");
console.log(
  `Refreshed ${updated.length} reviewed USDA records. Review the diff before committing.`,
);
