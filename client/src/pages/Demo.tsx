import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  recipes,
  explainFoods,
  cohortResearch,
} from "@shared/meal-intelligence";
import { evidenceSources } from "@shared/science-coach";
export default function Demo() {
  const [tab, setTab] = useState("meal");
  const [text, setText] = useState("45 g oats, 80 g berries and 20 g walnuts");
  const [entries, setEntries] = useState<string[]>([]);
  const explanation = explainFoods(text);
  return (
    <main className="science-page space-y-5">
      <div className="science-heading">
        <p className="eyebrow">SEPARATE SAMPLE EXPERIENCE</p>
        <h1>Explore Bloom.</h1>
        <p>
          All values here are sample data. Nothing is saved to your account, and
          no provider calls run.
        </p>
        <Link className="text-link" href="/">
          Return to my dashboard
        </Link>
      </div>
      <nav aria-label="Demo sections" className="flex flex-wrap gap-2">
        {[
          ["meal", "Meal analysis"],
          ["planner", "Meal suggestions"],
          ["report", "Microbiome report"],
          ["cohorts", "Research groups"],
          ["progress", "Progress"],
        ].map(([id, label]) => (
          <Button
            key={id}
            variant={id === tab ? "default" : "outline"}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>
      {tab === "meal" && (
        <section className="bloom-panel space-y-3">
          <h2>Sample meal journal</h2>
          <label className="block">
            Try a description
            <textarea
              className="bloom-input w-full"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
            />
          </label>
          <Button
            disabled={!text.trim()}
            onClick={() => setEntries([...entries, text])}
          >
            Add to demo journal
          </Button>
          <p role="status">{entries.length} demo entries</p>
          <p className="panel-note">
            Example nutrient display: 350 kcal · 10 g protein · 8 g fiber. These
            fixed illustrative values do not analyze your edited description.
          </p>
          {explanation.pathways.map((p) => (
            <details key={p.id}>
              <summary>{p.substrate}</summary>
              <p>{p.microbialFunction}</p>
              <p>{p.organisms.join("; ")}</p>
              <p>{p.relationship}</p>
            </details>
          ))}
          {entries.map((entry, i) => (
            <p key={i}>{entry}</p>
          ))}
        </section>
      )}
      {tab === "planner" && (
        <section className="bloom-panel">
          <h2>Evidence-linked complete meals</h2>
          {recipes.slice(0, 4).map((r) => (
            <details key={r.id}>
              <summary>{r.name}</summary>
              <p>{r.rationale}</p>
              <p>
                {r.ingredients.map((i) => `${i.grams} g ${i.name}`).join("; ")}
              </p>
              <ol className="list-decimal pl-5">
                {r.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </details>
          ))}
          <p className="panel-note">
            In your account, saved preferences filter these meals before
            optional AI prioritization.
          </p>
        </section>
      )}
      {tab === "report" && (
        <section className="bloom-panel">
          <h2>Sample composition</h2>
          <p>
            Roseburia: 3.2% · Bifidobacterium: 5.0% · Faecalibacterium: 7.5%
          </p>
          <p className="panel-note">
            Illustrative percentages, not your test. Report presence does not
            establish strain function or measured molecule production.
          </p>
        </section>
      )}
      {tab === "cohorts" && (
        <section className="bloom-panel">
          <h2>Research group explorer</h2>
          {cohortResearch.map((c) => (
            <article className="my-4" key={c.id}>
              <h3>{c.name}</h3>
              <p>{c.finding}</p>
              <p>{c.comparison}</p>
              <a
                className="underline"
                href={evidenceSources.find((s) => s.id === c.sourceId)?.url}
                target="_blank"
                rel="noreferrer"
              >
                Primary study
              </a>
            </article>
          ))}
        </section>
      )}
      {tab === "progress" && (
        <section className="bloom-panel">
          <h2>Sample progress</h2>
          <p>Week 1: 12 meals · average bloating 5/10</p>
          <p>Week 2: 15 meals · average bloating 4/10</p>
          <p className="panel-note">
            Illustrative symptom observations. They do not establish which food
            or microbial pathway caused a change.
          </p>
        </section>
      )}
    </main>
  );
}
