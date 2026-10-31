import { pathways, evidenceSources } from "./science-coach";
import {
  variantCatalog,
  precisionSources,
  type PrecisionReport,
} from "./precision-nutrition";

export const NETWORK_VERSION = "network-2026-10-17.1";
export type EvidenceLink = {
  id: string;
  from: string;
  to: string;
  relationship: string;
  evidence:
    "human-intervention" | "association" | "mechanistic" | "interpretation";
  sourceIds: string[];
  limitation: string;
};
// Registry nodes are independent of user findings. A missing personal measurement never creates a node labelled measured.
export function evidenceNetwork() {
  const nodes: Array<{ id: string; label: string; kind: string }> = [];
  const edges: EvidenceLink[] = [];
  for (const p of pathways) {
    nodes.push({
      id: p.id,
      label: p.microbialFunction,
      kind: "microbial-pathway",
    });
    nodes.push({
      id: `substrate:${p.id}`,
      label: p.substrate,
      kind: "substrate",
    });
    edges.push({
      id: `fuel:${p.id}`,
      from: `substrate:${p.id}`,
      to: p.id,
      relationship: p.relationship,
      evidence: "mechanistic",
      sourceIds: p.sourceIds,
      limitation: p.evidence,
    });
    for (const m of p.molecules.filter((m) => !m.startsWith("No single"))) {
      const id = `molecule:${m.toLowerCase()}`;
      if (!nodes.some((n) => n.id === id))
        nodes.push({ id, label: m, kind: "molecule" });
      edges.push({
        id: `product:${p.id}:${id}`,
        from: p.id,
        to: id,
        relationship: "Reported pathway product or transformation",
        evidence: "mechanistic",
        sourceIds: p.sourceIds,
        limitation:
          "Capability does not establish activity, concentration, absorption or clinical benefit.",
      });
    }
    for (const organism of p.organisms.filter(
      (o) => !o.startsWith("No single"),
    )) {
      const id = `organism:${organism}`;
      if (!nodes.some((n) => n.id === id))
        nodes.push({ id, label: organism, kind: "organism" });
      edges.push({
        id: `organism:${p.id}:${organism}`,
        from: id,
        to: p.id,
        relationship: "Research-linked participant; species and strain matter",
        evidence: "mechanistic",
        sourceIds: p.sourceIds,
        limitation: "Detection does not demonstrate pathway genes or activity.",
      });
    }
  }
  for (const v of variantCatalog) {
    nodes.push(
      { id: v.rsid, label: `${v.gene} · ${v.rsid}`, kind: "host-variant" },
      { id: `host:${v.rsid}`, label: v.pathway, kind: "host-pathway" },
    );
    edges.push({
      id: `host:${v.rsid}`,
      from: v.rsid,
      to: `host:${v.rsid}`,
      relationship: v.interpretation,
      evidence: "association",
      sourceIds: [...v.sources],
      limitation: v.limitation,
    });
  }
  return {
    version: NETWORK_VERSION,
    nodes,
    edges,
    sources: [...evidenceSources, ...precisionSources],
    boundary:
      "Host genetic pathways and microbial mechanisms are separate unless a reviewed direct interaction is available. No quantitative metabolic flux simulation is implemented.",
  };
}
export function personalEvidence(report: PrecisionReport) {
  const network = evidenceNetwork();
  return {
    version: NETWORK_VERSION,
    geneticContext: report.genetics.findings
      .filter((f) => f.genotype && f.genotype !== "--")
      .map((f) => ({
        rsid: f.rsid,
        genotype: f.genotype,
        pathway: f.pathway,
        interpretation: f.interpretation,
        limitation: f.limitation,
        sourceIds: [...f.sources],
      })),
    labPriorities: report.labs
      .filter((l) => !l.stale && l.flag !== "within reported range")
      .map((l) => ({
        id: l.id,
        marker: l.marker,
        value: l.value,
        unit: l.unit,
        date: l.measuredAt,
        flag: l.flag,
      })),
    microbialObservations: report.microbiome.report
      ? {
          id: report.microbiome.report.id,
          date: report.microbiome.report.date,
          taxa: report.microbiome.report.taxa,
          interpretation:
            "Reported abundance; functional activity and metabolite production remain unmeasured.",
        }
      : null,
    measuredMetabolites: report.microbiome.measuredMetabolites,
    pathwayContext: pathways.map((p) => ({
      id: p.id,
      substrate: p.substrate,
      molecules: p.molecules,
      sourceIds: p.sourceIds,
      reportedParticipants: (report.microbiome.report?.taxa || []).filter((t) =>
        p.organisms.some((o) => {
          const genus = o.split(" ")[0].toLowerCase();
          return (
            genus.length > 4 && t.name.toLowerCase().split(/\s+/)[0] === genus
          );
        }),
      ),
      interpretation:
        "Taxonomic name matches are research context only. Missing report matches do not establish absence; matched taxa do not establish genes, flux or a personal response.",
    })),
    network,
  };
}
