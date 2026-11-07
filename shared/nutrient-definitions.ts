import {nutrientDefinitions,type MealIntelligence} from "./meal-intelligence";
export const NUTRIENT_DEFINITION_VERSION="2026-11-07.1";
/** Describes existing source fields; never converts a label into an equivalent. */
export interface NutrientDefinition {
 key:string;analyteId:string;name:string;amountUnit:string;chemicalForm:string|null;
 activityUnit:string|null;sourceBasis:string;conversionBasis:"source-reported-field-only";
 sourceMappings:{usda:number;cnf:null};version:typeof NUTRIENT_DEFINITION_VERSION;
}
const special:Record<string,{chemicalForm:string|null;activityUnit:string|null;sourceBasis:string}>={
 vitamin_a_ug:{chemicalForm:null,activityUnit:"µg RAE",sourceBasis:"USDA vitamin A, retinol activity equivalents (RAE). The source supplies RAE; this value does not identify retinol versus individual carotenoids."},
 folate_ug:{chemicalForm:null,activityUnit:null,sourceBasis:"USDA total folate, not dietary folate equivalents (DFE). Food folate and added folic acid are not resolved by this total."},
 vitamin_d_ug:{chemicalForm:"D2 + D3 total",activityUnit:null,sourceBasis:"USDA vitamin D (D2 + D3) in micrograms. Individual forms are not resolved here; no IU conversion is performed."},
 vitamin_e_mg:{chemicalForm:"alpha-tocopherol",activityUnit:null,sourceBasis:"USDA alpha-tocopherol amount. Stereoisomer and supplement activity are not established; no IU/activity conversion is performed."},
 vitamin_k_ug:{chemicalForm:"phylloquinone",activityUnit:null,sourceBasis:"USDA phylloquinone field. This is not a measurement of all vitamin K forms or menaquinones."},
};
/** One structured view of the existing tuple registry, with the same21 IDs/units. */
export function nutrientDefinitionDetails():NutrientDefinition[]{
 return nutrientDefinitions.map(([key,name,amountUnit,usda])=>({key,analyteId:`usda-nutrient:${usda}`,name,amountUnit,...(special[key]??{chemicalForm:null,activityUnit:null,sourceBasis:"Source nutrient amount; chemical form is not specified by this field."}),conversionBasis:"source-reported-field-only",sourceMappings:{usda,cnf:null},version:NUTRIENT_DEFINITION_VERSION}));
}
/** Source identity, not a positive amount or a nutrient name, determines whether
 * the generic USDA field definition can describe the current review. */
export function nutrientDefinitionSource(analysis:Pick<MealIntelligence,"ingredients"|"foodMatches"|"productDetails">){
 const generic=analysis.ingredients.length>0&&!analysis.ingredients.some(i=>i.product)&&!analysis.productDetails?.length&&analysis.foodMatches.length===analysis.ingredients.length&&analysis.foodMatches.every(m=>m.fdcId!==null);
 return generic?"usda-field-mapping" as const:"form-not-recorded" as const;
}
export function reviewedNutrientName(key:string,name:string,source:ReturnType<typeof nutrientDefinitionSource>){
 // Older mixed/label snapshots do not record a form/basis proof. Their numeric
 // source stays intact, but the presentation must not assert RAE/DFE from a name.
 if(source==="form-not-recorded"&&key==="vitamin_a_ug")return "Vitamin A (basis unconfirmed)";
 if(source==="form-not-recorded"&&key==="folate_ug")return "Folate (basis unconfirmed)";
 return name;
}
