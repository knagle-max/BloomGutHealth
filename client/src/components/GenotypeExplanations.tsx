import { useState } from "react";
import type { GenotypeExplanation } from "@shared/genotype-explanations";
const actionLabels = {
  "general-habits": "Focus on everyday habits",
  "no-specific-change": "No special change established",
  "check-status": "Your health measurements can help",
  "clinical-review": "Discuss this result with a clinician",
  "food-choice": "Your food tolerance can guide choices",
};
export default function GenotypeExplanations({
  entries,
}: {
  entries: GenotypeExplanation[];
}) {
  const [search, setSearch] = useState("");
  if (!entries.length) return null;
  const shown = entries.filter((e) =>
    `${e.gene} ${e.rsid} ${e.submittedGene} ${e.topic || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <section
      id="genotype-explanations"
      className="space-y-4 scroll-mt-20"
      aria-labelledby="genotype-explanations-title"
    >
      <div className="bloom-panel space-y-3">
        <p className="eyebrow">YOUR SAVED GENOTYPES</p>
        <h2 id="genotype-explanations-title">What your variants mean</h2>
        <p>
          A gene is a set of instructions your body uses. A variant is a
          difference in those instructions. Your two DNA letters describe the
          result at one position, called an SNP.
        </p>
        <p>
          Start with the takeaway and practical steps on each card. Some results
          affect how a process works; others are only small clues or have no
          proven diet action. A gene involved in a nutrient does not
          automatically mean you need more of that nutrient.
        </p>
        <p className="panel-note">
          Food ideas may be general nutrition advice rather than a proven
          treatment for your variant. Supplements depend on your intake and
          health needs. These explanations do not automatically change your
          nutrient targets. Self-entered results are not clinically verified.
        </p>
        <label className="block">
          Find a gene or SNP
          <input
            className="bloom-input w-full"
            aria-label="Find a gene or SNP"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. vitamin D, MTHFR or rs1801133"
          />
        </label>
        <p role="status">
          {shown.length} of {entries.length} saved SNP explanations
        </p>
      </div>
      {shown.map((e) => (
        <article
          key={e.rsid}
          className="bloom-panel space-y-4 break-words"
          aria-label={`Explanation ${e.rsid}`}
        >
          <div>
            <p className="eyebrow">
              {e.status === "matched"
                ? "YOUR RESULT EXPLAINED"
                : e.status === "no-call"
                  ? "NO READABLE RESULT"
                  : e.status === "not-curated"
                    ? "EXPLANATION NOT YET AVAILABLE"
                    : "YOUR RESULT NEEDS VERIFICATION"}
            </p>
            <h3>
              {e.gene}
              {e.topic && ` · ${e.topic}`}
            </h3>
            <p className="text-sm">
              {e.rsid} · Your reported result: <strong>{e.genotype}</strong>
            </p>
          </div>
          {e.geneRole && (
            <div>
              <h4 className="font-semibold">Why this gene matters</h4>
              <p>{e.geneRole}</p>
            </div>
          )}
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <h4 className="font-semibold">
              {e.resultAdvice?.headline ||
                "We cannot interpret your result yet"}
            </h4>
            <p>{e.personalMeaning}</p>
          </div>
          {e.resultAdvice && (
            <div
              className="border-l-4 border-emerald-200 pl-4 space-y-2"
              data-testid={`genotype-next-step-${e.rsid}`}
            >
              <h4 className="font-semibold">What this means for you</h4>
              <p className="text-sm font-medium">
                {actionLabels[e.resultAdvice.priority]}
              </p>
              <p>{e.resultAdvice.action}</p>
            </div>
          )}
          {e.practicalGuidance && (
            <div
              className="space-y-3"
              data-testid={`genotype-practical-${e.rsid}`}
            >
              <p className="panel-note">
                {e.status === "matched"
                  ? "Practical options: general nutrition guidance, unless the result above supports a specific food choice. These are not proven treatments for this SNP."
                  : "General information only: these options are not matched to your unverified or unreadable result."}{" "}
                Choose options that fit your allergies, preferences and medical
                care.
              </p>
              <div>
                <h4 className="font-semibold">Food choices you can use</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {e.practicalGuidance.foodSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Would a supplement help?</h4>
                <p>{e.practicalGuidance.supplements}</p>
              </div>
              <div>
                <h4 className="font-semibold">When to check or ask for help</h4>
                <p>{e.practicalGuidance.followUp}</p>
              </div>
            </div>
          )}
          {e.comparisons.length > 0 && (
            <details>
              <summary>Compare the other genotypes</summary>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">DNA letters</th>
                      <th className="text-left p-2">What they mean</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.comparisons.map((c) => (
                      <tr
                        key={c.genotype}
                        className={c.isYours ? "bg-emerald-50 font-medium" : ""}
                      >
                        <th scope="row" className="text-left p-2 align-top">
                          {c.genotype}
                          {c.isYours && (
                            <span className="block text-xs">Your result</span>
                          )}
                        </th>
                        <td className="p-2 align-top">{c.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="panel-note">
                Having one copy does not always mean half the effect of two.
                Each marker must be interpreted using its own evidence.
              </p>
            </details>
          )}
          <details>
            <summary>Scientific detail, sources and limits</summary>
            {e.variantMeaning && (
              <p className="panel-note">
                <strong>About this DNA change:</strong> {e.variantMeaning}
              </p>
            )}
            <p className="panel-note">
              <strong>What the research supports:</strong> {e.evidence}
            </p>
            {e.limitations && <p className="panel-note">{e.limitations}</p>}
            <p className="panel-note">
              These DNA letters use the reference forward reading direction. A
              source using another direction needs checking before comparison.
            </p>
            <p className="panel-note">{e.boundary}</p>
            {e.sources.map((s) => (
              <p key={s.url}>
                <a
                  className="text-link"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.title}
                </a>
              </p>
            ))}
            <p className="panel-note">Explanation version: {e.version}</p>
          </details>
        </article>
      ))}
    </section>
  );
}
