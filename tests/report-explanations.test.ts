import test from "node:test";
import assert from "node:assert/strict";
import {
  explainOrganism,
  explainScore,
  organismExplanations,
  scoreExplanations,
  reportedStatusMeaning,
} from "../shared/report-explanations";
import { describeRecordedDiet } from "../shared/diet-observations";
test("reviewed organism explanations cover species/group context and preserve strain uncertainty", () => {
  const names = [
    "Faecalibacterium prausnitzii A2-165",
    "Akkermansia muciniphila",
    "Anaerobutyricum hallii",
    "Roseburia hominis A2-183",
    "Christensenella minuta",
    "Coprococcus comes",
    "Dysosmobacter welbionis",
    "Bifidobacterium pseudocatenulatum",
    "Clostridium perfringens",
    "Ruminococcus gnavus ATCC 29149",
    "Streptococcus pyogenes",
    "Clostridium scindens",
    "Sutterella",
    "Alistipes",
    "Bacteroides vulgatus",
    "Lactobacillus reuteri",
    "Bifidobacterium group",
    "Eptesicus fuscus gammaherpesvirus",
  ];
  for (const name of names) {
    const h = explainOrganism(name);
    assert.notEqual(h.label, "Not reviewed", name);
    assert.ok(h.meaning && h.why && h.takeaway && h.sources.length);
  }
  assert.equal(
    explainOrganism("Clostridium perfringens").label,
    "Can cause illness",
  );
  assert.equal(explainOrganism("Sutterella").label, "Context matters");
  assert.match(
    explainOrganism("Eptesicus fuscus gammaherpesvirus").label,
    /Unconfirmed/,
  );
  assert.equal(explainOrganism("An unknown organism").label, "Not reviewed");
  assert.equal(
    explainOrganism("Akkermansia muciniphila-like").label,
    "Context matters",
  );
  assert.equal(explainOrganism("Akkermansia unrelated").label, "Not reviewed");
  assert.ok(
    organismExplanations.every((e) =>
      e.sources.every((s) => s.url.startsWith("https://")),
    ),
  );
});
test("all reviewed scores explain biology without turning opaque values into calibrated personal findings", () => {
  assert.equal(Object.keys(scoreExplanations).length, 20);
  for (const [name, h] of Object.entries(scoreExplanations)) {
    assert.equal(explainScore(name).meaning, h.meaning);
    assert.ok(h.why && h.takeaway && h.sources.length);
  }
  assert.equal(
    explainScore("LPS biosynthesis Pathways").label,
    "Building part of some bacterial outer coats",
  );
  assert.match(explainScore("LPS biosynthesis").why, /does not mean 90%/);
  assert.equal(
    explainScore("Biofilm, chemotoxicity & virulence").label,
    "Microbial communities and potential harm-related functions",
  );
  assert.match(explainScore("Methane production").why, /not a breath test/);
  assert.equal(
    explainScore("Novel unreviewed score").label,
    "Provider-defined score",
  );
});
test("qualitative labels and nondetection are not converted into deficiency, verified presence or numeric abundance", () => {
  assert.match(
    reportedStatusMeaning("not detected or not listed", false),
    /does not prove complete absence/,
  );
  assert.match(
    reportedStatusMeaning("reported elevated", false),
    /qualitative/,
  );
  assert.match(
    reportedStatusMeaning("reported generally low", false),
    /cannot quantify/,
  );
  assert.match(reportedStatusMeaning("listed", false), /does not establish/);
});
test("diet exploration reports known journal contributions instead of inferring species from protein or fiber averages", () => {
  const now = new Date("2026-10-18T12:00:00Z"),
    meals = [
      {
        loggedAt: "2026-10-18T00:00:00Z",
        totalProtein: 33,
        totalCalories: 500,
        nutritionalData: [{ fiber_g: 2 }],
      },
      {
        loggedAt: "2026-10-18T01:00:00Z",
        totalProtein: null,
        nutritionalData: [],
      },
      {
        loggedAt: "2025-01-01T00:00:00Z",
        totalProtein: 100,
        nutritionalData: [{ fiber_g: 100 }],
      },
      { loggedAt: "2026-10-19T00:00:00Z", totalProtein: 100 },
    ];
  const r = describeRecordedDiet(meals, now);
  assert.equal(r.mealsAnalyzed, 2);
  assert.deepEqual(r.predictedBacteria, []);
  assert.equal(r.observations.find((o) => o.key === "fiber")!.knownTotal, 2);
  assert.equal(r.observations.find((o) => o.key === "fiber")!.partial, true);
  assert.equal(r.observations.find((o) => o.key === "protein")!.knownTotal, 33);
  assert.equal(r.evidenceStatus, "recorded-diet-observations");
  assert.equal(describeRecordedDiet([], now).mealsAnalyzed, 0);
});
