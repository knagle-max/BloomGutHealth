import type {SnapshotFood} from './food-snapshot';
import type {NutrientDefinition} from './nutrient-definitions';
export const SOURCE_COVERAGE_VERSION='public-food-source-coverage-2026-11-17-v1';
const validDay=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
/** Read-only inventory of the actual public catalogues used by the adapters.
 * Denominators are local source rows and app-supported fields, never people,
 * consumption, biological coverage, live provider success or clinical approval. */
export function foodSourceCoverage(catalogues:Record<string,readonly SnapshotFood[]>,definitions:readonly NutrientDefinition[]){
 const all=Object.entries(catalogues).sort(([a],[b])=>a.localeCompare(b)).flatMap(([catalogue,foods])=>foods.map((food,index)=>({catalogue,index,food})));
 const quality=all.map(row=>{
  const {food}=row,issues:string[]=[];
  if(!Number.isSafeInteger(food.fdcId)||food.fdcId<=0)issues.push('invalid-source-id');
  if(!validDay(food.retrievedAt))issues.push('invalid-retrieval-date');
  if(!food.dataType?.trim())issues.push('missing-source-type');
  if(food.url!==`https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`)issues.push('source-url-mismatch');
  return{...row,issues,identity:issues.length?null:`${food.fdcId}|${food.dataType}|${food.retrievedAt}`};
 });
 const fields=definitions.map(definition=>{
  let positive=0,sourceReportedZero=0,missing=0,invalid=0,numericWithValidSourceMetadata=0;
  for(const row of quality){
   const value=row.food.per100g[String(definition.sourceMappings.usda)];
   if(value===undefined||value===null)missing++;
   else if(typeof value!=='number'||!Number.isFinite(value)||value<0)invalid++;
   else{if(value===0)sourceReportedZero++;else positive++;if(!row.issues.length)numericWithValidSourceMetadata++;}
  }
  return{key:definition.key,unit:definition.amountUnit,usdaNutrientId:definition.sourceMappings.usda,cnfNutrientId:definition.sourceMappings.cnf,chemicalForm:definition.chemicalForm,activityUnit:definition.activityUnit,definitionVersion:definition.version,sourceRows:quality.length,positive,sourceReportedZero,missing,invalid,numericWithValidSourceMetadata};
 });
 const identities=Array.from(new Set(quality.flatMap(row=>row.identity?[row.identity]:[]))).sort();
 return{
  version:SOURCE_COVERAGE_VERSION,scope:'checked-in-public-food-adapters' as const,
  catalogues:Object.entries(catalogues).sort(([a],[b])=>a.localeCompare(b)).map(([id,foods])=>({id,rows:foods.length})),
  sourceRows:quality.length,uniqueVersionedSourceIdentities:identities.length,
  sourceTypes:Array.from(new Set(all.map(row=>row.food.dataType))).sort(),
  retrievalDates:Array.from(new Set(all.map(row=>row.food.retrievedAt))).sort(),
  sourceMetadataIssues:quality.filter(row=>row.issues.length).map(({catalogue,index,issues})=>({catalogue,index,issues})),
  appSupportedNutrientFields:definitions.length,cnfMappedFields:definitions.filter(definition=>definition.sourceMappings.cnf!==null).length,
  fields,
  limits:[
   'Counts describe current local adapter inputs only; no personal records or live provider calls were queried.',
   'Source-reported zero is distinct from missing or invalid composition and is not independently verified biological zero.',
   'A value with valid source metadata is not scientific validation, dataset completeness, usual intake, adequacy or a permitted clinical claim.',
   'Canadian mappings, dataset acquisition, release identity, source rights and clinical applicability need separate evidence; absence here does not inspect external deployments.',
  ],
 };
}
