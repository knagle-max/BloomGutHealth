import {additionalLabSourceIdentity} from './lab-source-identity';
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
 const fields:string[]=[];let field='',quoted=false,closed=false;
 for(let index=0;index<raw.length;index++){
  const character=raw[index];
  if(quoted){if(character==='"'){if(raw[index+1]==='"'){field+='"';index++;}else{quoted=false;closed=true;}}else field+=character;continue;}
  if(character===','||character==='\t'){fields.push(field);field='';closed=false;continue;}
  if(character==='"'){if(field.trim()||closed)return[];field='';quoted=true;continue;}
  if(closed&&character.trim())return[];
  field+=character;
 }
 if(quoted)return[];
 fields.push(field);
 // Unquoted commas in explicitly named fractions remain part of that label.
 // A numeric/value column is never guessed from magnitude or an unknown name.
 for(let index=2;index<fields.length;index++){
  if(!/^\s*(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?\s*$/i.test(fields[index]))continue;
  const label=fields.slice(0,index).join(',');
  if(/^\s*1\s*,\s*25/.test(label)||additionalLabSourceIdentity(label,fields[index+1]).id)return[label,...fields.slice(index)];
 }
 return fields;
}

/** An unidentified bilirubin fraction is retained as its own source identity. */
export function hasConfirmedLabIdentity(marker:string,point:{method?:string;sourceInput?:{text:string}}|undefined):boolean {
 if(marker==='bilirubin')return false;
 if(marker==='vitamin_d')return supportsVitaminDStatus(point);
 const label=normalized(labSourceColumns(point?.sourceInput?.text||'')[0]),method=normalized(point?.method);
 // Explicitly different fractions stay source-native, even when a controlled
 // review chooses a total marker. Unknown source labels are not auto-mapped.
 if(marker==='psa_total'&&(/\bfree\b|\bratio\b|%|\bfpsa\b/.test(label)||/\bfree[\s-]+(?:psa|prostate)|\bpsa[\s-]+free\b/.test(method)))return false;
 if(marker==='testosterone_total'&&(/\bfree\b|\bbioavailable\b/.test(label)||/\b(?:free|bioavailable)[\s-]+testosterone\b|\btestosterone[\s-]+(?:free|bioavailable)\b/.test(method)))return false;
 return true;
}
