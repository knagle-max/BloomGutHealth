import {useQuery} from "@tanstack/react-query";
import {apiRequest} from "./queryClient";
import {preferenceSchema,type DietaryPreferences} from "@shared/meal-intelligence";
export type SavedPreferences=DietaryPreferences&{readonly preferenceRevision?:string};
export function preferenceValues(source:SavedPreferences):DietaryPreferences{
 const{preferenceRevision,...values}=source;return preferenceSchema.parse(values);
}
export const preferenceHeaders=(revision?:string)=>revision?{"If-Match":`"${revision}"`}:undefined;
/** One canonical cache entry. Header metadata never enters the strict persisted preference body. */
export function useSavedPreferences(){return useQuery<SavedPreferences>({queryKey:["/api/preferences"],queryFn:async({signal})=>{
 const response=await apiRequest("GET","/api/preferences",undefined,undefined,signal),values=preferenceSchema.parse(await response.json());
 const revision=response.headers.get("X-Bloom-Preferences-Revision");
 if(revision===null)return values; // Older server/clients remain compatible; weak Express ETags are not revision contracts.
 if(!/^[a-f0-9]{64}$/.test(revision))throw Error("Saved preferences revision could not be verified.");
 return{...values,preferenceRevision:revision};
}});}
