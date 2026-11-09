import {useState} from "react";
import type {DisplayUnits} from "@shared/experience";
/** Uncontrolled forms retain their reviewed entry units until explicitly cleared. */
export function useDraftUnits(preferred:DisplayUnits){
 const [snapshot,setSnapshot]=useState<DisplayUnits|null>(null);
 return {units:snapshot??preferred,changed:snapshot!==null&&Object.keys(preferred).some(key=>preferred[key as keyof DisplayUnits]!==snapshot[key as keyof DisplayUnits]),
  markEdited:()=>setSnapshot(previous=>previous??{...preferred}),reset:()=>setSnapshot(null)};
}
