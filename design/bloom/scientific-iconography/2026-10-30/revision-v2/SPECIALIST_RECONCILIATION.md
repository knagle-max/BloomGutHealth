# Bloom Scientific Iconography — Specialist Reconciliation / Revision v2
Date 2026-10-30. DESIGN CANDIDATES ONLY; no science, chemistry, legal, user-study or Architect approval implied.

Reviewed these actual shared handoffs:
- Bloom_Biology_Six_Asset_Iconography_Corrections_2026-10-30.md
- Bloom_Integration_Iconography_Pilot_Identity_Mapping_2026-10-30.md
- Bloom_Security_Legal_Scientific_Iconography_Review_2026-10-30.md (Security review, Legal referred/pending)
- Bloom_User_Testing_Scientific_Iconography_Pilot_Acceptance_2026-10-30.md (16 tests specified; NONE claimed executed)

## Changes delivered now
- microbe-archaea-oval.svg — six short oval/coccobacillary conceptual cells replacing sphere-only subject representation. NCBI taxon 2173; Methanobrevibacter smithii / Methanocatella smithii nomenclature must be reviewed by Biology + Integration; original reported label unchanged. Not a micrograph or distinctive specimen photo.
- neutral-organism-icon.svg — safe default for unknown/ambiguous/unapproved taxon mapping, no species inference.
- neutral-molecule-icon.svg — safe default for compound unverified form or missing chemist signoff; abstract category symbol, not actual structure.
- butyric-acid-comparison.svg — explicit human-readable butyric acid (CID 264, neutral CH3CH2CH2COOH) versus butyrate (CID 104775, −1 CH3CH2CH2COO−), ready for chemistry review; simplified chemical text visual, not a licensed conformer.
- Existing original E coli/Faecalibacterium SVGs are retained in pilot/ as source drafts but must display generic representative morphology labels and be mapped only within approved depiction specificity. Existing three molecule SVGs remain unapproved pending qualified graph and formula review.

## Review gating
Biology: validate actual new archaeal SVG morphology and rank/nomenclature, and two prior rod portraits; cite morphological basis. Chemistry-qualified reviewer: independently validate four chemical graphics and original three anions against PubChem exact CID, InChIKey, SMILES, valence, charge and stereochemistry when applicable. Legal: confirm original art chain of title including AI-assisted tooling and permitted commercial redistribution; no evidence claimed. Security: verify inline SVG local assets only; no scripts, remote href, foreignObject, remote fonts or beacons; runtime CDN/withdrawal not assessed. User Testing: conduct UT-SCIART-3001–3016 on actual integrated assets including 36px, 160–200px hero, mobile/200% zoom, VoiceOver, source/context interpretation and failed-image fallback; current checklist only (not run). Chief Architect: consolidate before authorizing Developer release.

## Identity crosswalk
- E. coli NCBI 562 — species reference but illustrative morphology not uniquely diagnostic.
- Faecalibacterium NCBI 216851 — genus only, never silently upgrade to F. prausnitzii species.
- Methanobrevibacter smithii NCBI 2173 — archaeon, naming alias under versioned nomenclatural authority.
- Butyrate CID 104775, acetate 175, propionate 104745; butyric acid CID 264. Unverified visual mapping must not be advertised as chemically approved.
- Original user report strings preserved; images remain independent from actual assay outputs.

## Pickup
Branch: design/biology-visuals-2026-10-30. Directory: design/bloom/scientific-iconography/2026-10-30/revision-v2/. Do not delete earlier pilot/ or claim production integration. Exact file source readback and commit hash should be checked by Developer before use.

## Outstanding design work
Actual 36px/hero exports and full responsive connected flow/screens remain not complete in v2. Qualified independent chemistry signoff, morphology citations per final art, secure rights ledger and actual user testing are blockers to production use. Do not mark delivered merely because source art exists.
