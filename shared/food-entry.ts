export const foodEntryMethods=[
  {id:"barcode",label:"Scan barcode",description:"Scan a package or enter its number."},
  {id:"search",label:"Search foods",description:"Find generic foods, brands or your saved labels."},
  {id:"restaurant",label:"Search restaurants",description:"Find an item or enter published menu nutrition."},
  {id:"photo",label:"Take/upload photo",description:"Check available photo entry and manual alternatives."},
  {id:"describe",label:"Describe what I ate",description:"Type foods and amounts for review."},
] as const;
export type FoodEntryMethod=typeof foodEntryMethods[number]["id"];
export function parseFoodEntryMethod(value:string|null):FoodEntryMethod|null{return foodEntryMethods.some(m=>m.id===value)?value as FoodEntryMethod:null;}
