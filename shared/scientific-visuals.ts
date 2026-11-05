import registry from './data/scientific-visual-assets.json';

export const MICROORGANISM_SYMBOL_LABEL='Illustrative microorganism symbol — not species-specific';
export const SCIENTIFIC_VISUAL_VERSION=registry.registryVersion;
/** v0.5 permits only this first-party generic symbol. No name/rank/assay can
 * grant species artwork, micrographs, chemical structures or scientific review. */
export function neutralMicroorganismVisual(disabled=false){
 const asset=registry.assets.find(value=>value.id==='bloom-neutral-microorganism-v1');
 const available=!disabled&&asset?.depiction==='generic-symbol'&&asset.taxonomyId===null&&asset.moleculeId===null&&asset.lifecycle==='active-neutral'&&/^\/science\/[a-z0-9-]+\.svg$/.test(asset.src)&&/^[a-f0-9]{64}$/.test(asset.sha256);
 return{label:MICROORGANISM_SYMBOL_LABEL,assetId:asset?.id||null,src:available?`${asset.src}?v=${asset.sha256}`:null,depiction:'generic-symbol' as const};
}
