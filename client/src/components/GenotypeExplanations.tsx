import { useState } from "react";
import type { GenotypeExplanation } from "@shared/genotype-explanations";
export default function GenotypeExplanations({
  entries,
}: {
  entries: GenotypeExplanation[];
}) {
  const [search, setSearch] = useState("");
  if (!entries.length) return null;
  const shown = entries.filter((e) =>
    `${e.gene} ${e.rsid} ${e.submittedGene}`
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
          A gene is a stretch of DNA; an SNP is one specific position. Your two
          letters are the alleles reported at that position. Comparisons below
          describe the studied allele pair, not every possible rare allele and
          not an overall good/bad genetic score.
        </p>
        <p className="panel-note">
          Some markers have useful biological evidence but no proven
          genotype-specific dietary action. These explanations do not expand the
          diet-ranking catalogue or change nutrient targets. Self-reported calls
          remain unverified.
        </p>
        <label className="block">
          Find a gene or SNP
          <input
            className="bloom-input w-full"
            aria-label="Find a gene or SNP"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. MTHFR or rs1801133"
          />
        </label>
        <p role="status">
          {shown.length} of {entries.length} saved SNP explanations
        </p>
      </div>
      {shown.map((e) => (
        <article
          key={e.rsid}
          className="bloom-panel space-y-3 break-words"
          aria-label={`Explanation ${e.rsid}`}
        >
          <p className="eyebrow">
            {e.status === "matched"
              ? "MATCHED EDUCATIONAL COMPARISON"
              : e.status === "no-call"
                ? "NO CALL"
                : e.status === "not-curated"
                  ? "EXPLANATION NOT YET CURATED"
                  : "YOUR RESULT NEEDS VERIFICATION"}
          </p>
          <h3>
            {e.gene} · {e.rsid}
          </h3>
          <p>
            Reported result: <strong>{e.genotype}</strong> · genomic
            forward-strand comparison
          </p>
          {e.geneRole && (
            <p>
              <strong>Why this gene matters:</strong> {e.geneRole}
            </p>
          )}
          {e.variantMeaning && (
            <p>
              <strong>This specific variant:</strong> {e.variantMeaning}
            </p>
          )}
          <p>
            <strong>Your result:</strong> {e.personalMeaning}
          </p>
          {e.comparisons.length > 0 && (
            <details>
              <summary>Compare the other genotypes</summary>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Genotype</th>
                      <th className="text-left p-2">Comparison</th>
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
                One copy does not always mean half the effect of two. Dominance,
                combined variants and study design can change the comparison.
              </p>
            </details>
          )}
          {e.dietMeaning && (
            <p>
              <strong>Dietary relevance:</strong> {e.dietMeaning}
            </p>
          )}
          <p className="panel-note">
            <strong>Evidence:</strong> {e.evidence}
          </p>
          {e.limitations && <p className="panel-note">{e.limitations}</p>}
          <details>
            <summary>Sources and interpretation limits</summary>
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
