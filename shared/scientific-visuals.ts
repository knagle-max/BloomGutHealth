import morphology from './data/microbe-morphology-crosswalk-v1.json';
import type {ReportedTaxon} from './reported-taxa';
import registry from './data/scientific-visual-assets.json';

export const MICROORGANISM_SYMBOL_LABEL='Illustrative microorganism symbol — not species-specific';
export const SCIENTIFIC_VISUAL_VERSION=registry.registryVersion;
/** Generic fallback for unknown/unavailable artwork. Identity and assay metadata
 * never grant scientific review or imply a diagnostic/sample depiction. */
export function neutralMicroorganismVisual(disabled=false){
 const asset=registry.assets.find(value=>value.id==='bloom-neutral-microorganism-v1');
 const available=!disabled&&asset?.depiction==='generic-symbol'&&asset.taxonomyId===null&&asset.moleculeId===null&&asset.lifecycle==='active-neutral'&&/^\/science\/[a-z0-9-]+\.svg$/.test(asset.src)&&/^[a-f0-9]{64}$/.test(asset.sha256);
 return{label:MICROORGANISM_SYMBOL_LABEL,assetId:asset?.id||null,src:available?`${asset.src}?v=${asset.sha256}`:null,depiction:'generic-symbol' as const};
}

export const REPRESENTATIVE_ILLUSTRATION_LABEL='Representative scientific illustration — not species-diagnostic or your sample';
export const GENERIC_MORPHOLOGY_LABEL='Generic morphology illustration — not species-specific or your sample';
/** Public owner-directed imagery. Name matching selects a representative picture,
 * never verifies the report's taxonomy, strain, function or sample identity. */
export function legacyOrganismIllustration(sourceName:string|undefined,size:'thumbnail'|'portrait'){
 const entry=registry.organismIllustrations.find(value=>value.sourceName===sourceName);
 const asset=entry?.[size];
 if(!entry||!asset||!/^\/science\/organisms-v4\/(organisms|thumbnails)\/[a-z-]+\.svg$/.test(asset.src)||!/^[a-f0-9]{64}$/.test(asset.sha256))return null;
 return{src:`${asset.src}?v=${asset.sha256}`,label:entry.genericMorphology?GENERIC_MORPHOLOGY_LABEL:REPRESENTATIVE_ILLUSTRATION_LABEL,depiction:entry.genericMorphology?'generic-morphology':'representative-concept',assetId:entry.slug};
}

export type OrganismArtworkSource={reportId:string;observationId:string;observations:readonly ReportedTaxon[]};
/** Match only an explicit, unique current report observation and its original
 * ordinal/name. This selects conceptual artwork; it never identifies a taxon. */
export function organismIllustration(sourceName:string|undefined,size:'thumbnail'|'portrait',source?:OrganismArtworkSource){
 let styleId='U00';
 if(source?.reportId&&source.observationId&&sourceName){
  const matches=source.observations.filter(row=>row.id===source.observationId);
  const row=matches.length===1?matches[0]:undefined;
  const prefix=`reported-organism:${source.reportId}:`;
  const suffix=row?.reportedOrganismSourceId?.startsWith(prefix)?row.reportedOrganismSourceId.slice(prefix.length):'';
  const ordinal=/^(0|[1-9][0-9]*)$/.test(suffix)?Number(suffix)+1:null;
  const uniqueName=source.observations.filter(value=>value.bacterialName===sourceName).length===1;
  const supportedRank=!row?.taxonomyLevel||row.taxonomyLevel==='species';
  const entries=morphology.entries.filter(entry=>entry.sourceOrdinal===ordinal&&entry.reportedName===sourceName);
  const reportedGroup=row?.reportedNotes?.match(/^Provider group: ([^;]+)(?:;|$)/)?.[1];
  if(row?.bacterialName===sourceName&&uniqueName&&supportedRank&&entries.length===1&&(!reportedGroup||reportedGroup===entries[0].reportedGroup))styleId=entries[0].artworkStyleId;
 }
 const style=morphology.styles.find(value=>value.id===styleId)||morphology.styles.find(value=>value.id==='U00')!;
 const asset=style[size];
 if(!/^\/science\/morphology-v1\/[a-z][0-9]{2}\/[A-Z][0-9]{2}-BVA-[0-9]{4}-(thumbnail|portrait)\.webp$/.test(asset.publicPath)||!/^[a-f0-9]{64}$/.test(asset.sha256))throw Error('Invalid imported morphology asset');
 return{src:`${asset.publicPath}?v=${asset.sha256}`,label:style.id==='U00'?morphology.disclosure.unknown:morphology.disclosure.group,assetId:style.registryAssetId,styleId:style.id,depiction:'conceptual-morphology' as const};
}

/** Decoration for an existing navigation category, never a finding or diagnosis. */
export function labCategoryIllustration(categoryId:string){
 const entry=registry.bloodworkIllustrations.find(value=>value.categoryId===categoryId),asset=entry?.asset;
 return asset&&/^\/science\/bloodwork-v4\/[a-z-]+\.svg$/.test(asset.src)&&/^[a-f0-9]{64}$/.test(asset.sha256)?{src:`${asset.src}?v=${asset.sha256}`,label:'Illustrative category icon'}:null;
}

/** An exact existing entity selects a source drawing, never a personal chemical
 * form, pH, concentration or stereo assignment. Acid forms are not aliases. */
export function molecularIllustration(entityId:string,label:string,kind:string){
 if(kind!=="molecule")return null;
 const entry=registry.moleculeIllustrations.find(value=>value.entityId===entityId&&value.entityLabel===label),asset=entry?.asset;
 if(!entry||!asset||!/^\/science\/structures-v4\/[a-z-]+\.svg$/.test(asset.src)||!/^[a-f0-9]{64}$/.test(asset.sha256))return null;
 return{src:`${asset.src}?v=${asset.sha256}`,compoundName:entry.compoundName,sourcePubChemCid:entry.sourcePubChemCid,sourceFormalCharge:entry.sourceFormalCharge,label:`${entry.sourceDescription} Source draft, not your measured form or amount.`};
}
