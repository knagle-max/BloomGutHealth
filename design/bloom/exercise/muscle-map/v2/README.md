# Bloom exercise muscle illustrations — high-detail v2

**Visual authority:** The three owner-selected high-detail original Bloom anatomy reference images (front, back, 10 muscle-category tile sheet). The flat v1 SVG icons are **superseded and should not be used** as primary muscle illustrations.

### Finished design assets (raster source delivery)
`Bloom_Anatomy_Illustration_Library_v2.zip` was exported in the project conversation, containing:
- 2 full-resolution front/back labeled anatomy references.
- 10 individually cropped high-detail muscle tiles.
- 10 illustration-only art crops with original subtle background.
- 10 512px UI renditions and metadata.

**Asset source limitation:** These PNG bytes reside in the conversation downloadable ZIP and are **not yet checked into this GitHub repository**. Developer should import that ZIP's PNGs under `public/assets/exercise/muscle-v2/`, optimize size and update the manifest paths. Do not wire broken GitHub filenames as if the PNGs already exist. This branch contains the design integration and supersession specification only.

A reliable transparent export would require layered source images or a hand-refined silhouette mask. These exports deliberately keep pale backgrounds to avoid destroying pale anatomical details.

### Implementation contract
1. Athlete mode only for primary and secondary muscle group highlights, based on reviewed, versioned exercise mappings; not measured activation, injury or recovery.
2. Everyday mode retains the full strength set editor: sets, reps, kg/lb, status, correction and edits. No loss of canonical workout data.
3. Treat highlighted muscle groups as `mapped`, not `measured`; no percentage recruitment.
4. Front/back anatomical illustrations are education graphics with selectable explanatory text; a screen-reader gets named groups and descriptions. Do not make text baked into PNG the only accessible name.
5. For quick exercise icons, prefer cropped high-detail original tiles over flat geometric v1 SVGs. Use proper responsive image dimensions.
6. Product rights/provenance and professional mapping acceptance remain separate publication gates.
