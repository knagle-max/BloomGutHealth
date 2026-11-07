import {geneticImportSchema} from './precision-nutrition';
import type {z} from 'zod';
type Import = z.infer<typeof geneticImportSchema>;
/** These markers remain storage-only; no APOE type or disease risk is inferred. */
export function isSensitiveGeneticCall(rsid:string){return rsid==='rs429358'||rsid==='rs7412';}
export function defaultGeneticSelection(preview:Import){return preview.calls.filter(call=>!isSensitiveGeneticCall(call.rsid)).map(call=>call.rsid);}
export function selectedGeneticImport(preview:Import,ids:readonly string[]):Import {
 const chosen=new Set(ids);
 if(!chosen.size||chosen.size!==ids.length||ids.some(id=>!preview.calls.some(call=>call.rsid===id)))throw Error('Select at least one unique call from this file.');
 return geneticImportSchema.parse({...preview,calls:preview.calls.filter(call=>chosen.has(call.rsid))});
}
