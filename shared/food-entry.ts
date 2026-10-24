export const foodEntryMethods=[
  {id:"barcode",label:"Scan barcode",description:"Scan a package or enter its number."},
  {id:"search",label:"Search foods",description:"Find generic foods, brands or your saved labels."},
  {id:"restaurant",label:"Restaurant meal",description:"Choose a name, then add menu values or describe the item."},
  {id:"photo",label:"Take/upload photo",description:"Check available photo entry and manual alternatives."},
  {id:"describe",label:"Describe what I ate",description:"Type foods and amounts for review."},
] as const;
export type FoodEntryMethod=typeof foodEntryMethods[number]["id"];
export function parseFoodEntryMethod(value:string|null):FoodEntryMethod|null{return foodEntryMethods.some(m=>m.id===value)?value as FoodEntryMethod:null;}

/** Shipped implementation readiness; a role flag cannot create an unfinished workflow. */
export const foodEntryImplementationReady:Readonly<Record<FoodEntryMethod,boolean>>={barcode:true,search:true,restaurant:true,photo:false,describe:true};
export function availableFoodEntryMethods(server?:Partial<Record<FoodEntryMethod,boolean>>){return foodEntryMethods.filter(method=>foodEntryImplementationReady[method.id]&&(server?.[method.id]??true));}
export function parseAvailableFoodEntryMethod(value:string|null,server?:Partial<Record<FoodEntryMethod,boolean>>):FoodEntryMethod|null {return availableFoodEntryMethods(server).some(method=>method.id===value)?value as FoodEntryMethod:null;}
