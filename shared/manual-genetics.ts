import { manualGeneticEntrySchema } from "./precision-nutrition";
// Names are entry shortcuts, not a claim that all these variants are actionable.
export const additionalEntryShortcuts = [
  ["MTHFR", "rs1801131"],
  ["MTRR", "rs1801394"],
  ["MTR", "rs1805087"],
  ["CBS", "rs234706"],
  ["FUT2", "rs601338"],
  ["FADS1 region", "rs174550"],
  ["BCMO1", "rs12934922"],
  ["CYP2R1", "rs10741657"],
  ["CYP27B1", "rs10877012"],
  ["HFE", "rs1800562"],
  ["HFE", "rs1799945"],
  ["TMPRSS6", "rs855791"],
  ["MTNR1B", "rs10830963"],
  ["SLC23A1", "rs33972313"],
  ["FTO", "rs9939609"],
  ["MC4R region", "rs17782313"],
  ["FGF21 region", "rs838133"],
  ["SOD2", "rs4880"],
  ["APOE", "rs429358"],
  ["APOE", "rs7412"],
  ["GLUT2/SLC2A2", "rs5400"],
  ["APOA2", "rs5082"],
] as const;
export function parseGenotypeTable(text: string) {
  if (text.length > 30000)
    throw Error("Paste up to 200 rows and 30,000 characters.");
  const rows = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const entries = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (/^(?:gene[\s,;\t]+)?snp[\s,;\t]+(?:your[\s,;\t]+)?genotype$/i.test(row))
      continue;
    const match = row.match(
      /^(.*?)\b(rs\d{1,12})\b[\s,;\t]+([ACGTacgt][\s/|]*[ACGTacgt]|--)\s*$/,
    );
    if (!match)
      throw Error(
        `Row ${i + 1}: use Gene SNP Genotype, for example MTHFR rs1801133 AG.`,
      );
    const parsed = manualGeneticEntrySchema.safeParse({
      gene: match[1].replace(/[\s,;\t]+$/, ""),
      rsid: match[2],
      genotype: match[3],
    });
    if (!parsed.success)
      throw Error(`Row ${i + 1}: check the gene label, rsID and genotype.`);
    entries.push(parsed.data);
  }
  if (!entries.length || entries.length > 200)
    throw Error("Provide between 1 and 200 SNPs.");
  if (new Set(entries.map((e) => e.rsid)).size !== entries.length)
    throw Error(
      "Duplicate SNPs: keep one result per rsID; resolve conflicts with your source.",
    );
  return entries;
}
