import { nutrientDefinitions } from "../shared/meal-intelligence";
import { normalizeBarcode } from "../shared/barcodes";
import type { Product } from "../shared/products";

const text=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const known=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
export function normalizeUSDABranded(raw:any, detail=true):Product {
  if(raw?.dataType!=="Branded"||!Number.isSafeInteger(raw.fdcId)||raw.fdcId<=0||!text(raw.description,120))throw Error("Invalid branded record");
  const grams=known(raw.servingSize)&&raw.servingSize>0&&raw.servingSize<=3000&&text(raw.servingSizeUnit,20).toLowerCase()==="g"?raw.servingSize:null;
  const labelKeys:Record<string,string>={calories:"calories",protein_g:"protein",carbohydrates_total_g:"carbohydrates",fat_total_g:"fat",fiber_g:"fiber",sugar_g:"sugars",sodium_mg:"sodium",fat_saturated_g:"saturatedFat",cholesterol_mg:"cholesterol",calcium_mg:"calcium",iron_mg:"iron",potassium_mg:"potassium"};
  const perServing:Record<string,number>={};
  const hasLabel=Object.values(labelKeys).some(k=>known(raw.labelNutrients?.[k]?.value));
  const statedServing=text(raw.householdServingFullText,120)|| (known(raw.servingSize)&&raw.servingSize>0&&text(raw.servingSizeUnit,20)?String(raw.servingSize):"");
  const per100g=grams===null&&(!hasLabel||!statedServing);
  if(detail){
    if(grams!==null||per100g){
      for(const [key,,expected,id] of nutrientDefinitions){
        const n=(Array.isArray(raw.foodNutrients)?raw.foodNutrients:[]).find((n:any)=>n?.nutrient?.id===id);
        if(n&&known(n.amount)&&text(n.nutrient.unitName,20).toLowerCase().replace(/[μµ]/g,"u")===expected.toLowerCase().replace(/[μµ]/g,"u"))perServing[key]=n.amount*(grams===null?1:grams/100);
      }
    }
    // Label values are explicitly per serving; no density or missing nutrient inference.
    if(!per100g)for(const [key,label] of Object.entries(labelKeys))if(known(raw.labelNutrients?.[label]?.value))perServing[key]=raw.labelNutrients[label].value;
  }
  const barcode=normalizeBarcode(text(raw.gtinUpc,16));
  const serving=text(raw.householdServingFullText,120)||`${raw.servingSize||""} ${text(raw.servingSizeUnit,20)}`.trim();
  return {source:"usda-branded",id:String(raw.fdcId),name:text(raw.description,120),brand:text(raw.brandName,100)||text(raw.brandOwner,100),...(barcode?{barcode}:{}),
    servingGrams:detail?(per100g?100:grams):null,servingDescription:detail?(per100g?"100 g — package serving unavailable":serving||"One source label serving"):"Select to review the exact label and serving",
    perServing,url:`https://fdc.nal.usda.gov/food-details/${raw.fdcId}/nutrients`,retrievedAt:new Date().toISOString(),
    provenance:{version:"usda-branded-v1",fdcId:raw.fdcId,gtin:text(raw.gtinUpc,16)||null,brandOwner:text(raw.brandOwner,100),marketCountry:text(raw.marketCountry,100)||null,publishedDate:text(raw.publicationDate,40)||null,modifiedDate:text(raw.modifiedDate,40)||null,ingredients:text(raw.ingredients,4000)||null},
    notes:["USDA Branded Foods: manufacturer-supplied label data, not the generic FNDDS catalogue. Confirm package, barcode, variety, country and serving; a US record does not establish Canadian formulation or availability.",...(detail&&per100g?["Source serving is unavailable; values are per 100 g, not per package. No volume-to-mass conversion was assumed."]:[]),"Missing source nutrients remain unknown. Label data do not establish allergen safety or clinical suitability."]};
}
