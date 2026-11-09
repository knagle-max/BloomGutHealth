/** Identity only: never infer a vitamin-D metabolite from its number, unit or range. */
export type VitaminDAssayIdentity='25-hydroxy'|'different-or-ambiguous'|'unconfirmed';
const normalized=(value:string|undefined)=>String(value||'').normalize('NFKC').replace(/[‐‑‒–—−]/g,'-').toLowerCase();
export function vitaminDAssayIdentity(value:string|undefined):VitaminDAssayIdentity {
 const text=normalized(value);
 // Exclusions take precedence over any embedded 25-OH substring or conflicting label.
 if(/\bcalcitriol\b|\b1\s*(?:alpha|α)?\s*[,，-]\s*25(?=\b|oh|\()|\bdi[\s-]*hydroxy|\(\s*oh\s*\)\s*2\b/.test(text))return'different-or-ambiguous';
 if(/\?|\b(?:unknown|unconfirmed|unspecified|uncertain|pending)\b|\bnot\s+(?:measured|tested|confirmed|25)/.test(text))return'unconfirmed';
 return /\b25[\s-]*(?:\(\s*oh\s*\)(?:\s*d[23]?)?(?=\b|\s|$)|oh(?:d[23]?)?\b|hydroxy(?:vitamin\s*d[23]?|cholecalciferol|ergocalciferol)?\b)/.test(text)?'25-hydroxy':'unconfirmed';
}
/** The recorded assay must be explicit; the shared marker ID is not evidence.
 * Conflicting original source text cannot be overridden by a method label. */
export function supportsVitaminDStatus(point:{method?:string;sourceInput?:{text:string}}|undefined):boolean {
 return !!point&&vitaminDAssayIdentity(point.method)==='25-hydroxy'&&vitaminDAssayIdentity(point.sourceInput?.text)!=='different-or-ambiguous';
}
/** Retain commas belonging to an explicitly incompatible assay name as source text,
 * rather than treating `1,25` as an analyte/value pair. No canonical mapping follows. */
export function labSourceColumns(raw:string):string[]{
 const fields=raw.split(/[,\t]/),separators=Array.from(raw.matchAll(/[,\t]/g));
 for(let index=2;index<fields.length;index++){
  const label=raw.slice(0,separators[index-1].index);
  if(vitaminDAssayIdentity(label)==='different-or-ambiguous'&&/^\s*(?:\d+(?:\.\d*)?|\.\d+)\s*$/.test(fields[index])&&fields.length-index<=3)return[label,...fields.slice(index)];
 }
 return fields;
}
