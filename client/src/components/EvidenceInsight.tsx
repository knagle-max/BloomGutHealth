import type { ReactNode,Ref } from "react";
export type ObservationState="reported"|"calculated"|"estimated"|"association"|"experimental"|"unknown";
const names:Record<ObservationState,string>={reported:"User-recorded observation",calculated:"Calculated from recorded values",estimated:"Estimate",association:"Research association",experimental:"Research only",unknown:"Not available"};
/** The caller supplies the scientific state. Visual styling never upgrades evidence. */
export default function EvidenceInsight({title,state,meaning,limitations,children,details,detailsRef,detailsId}:{title:string;state:ObservationState;meaning:string;limitations:string;children?:ReactNode;details?:ReactNode;detailsRef?:Ref<HTMLDetailsElement>;detailsId?:string}) {
 return <article className="relationship-card evidence-insight"><span className="evidence-state">{names[state]}</span><h3>{title}</h3>{children}<p>{meaning}</p><p className="panel-note">{limitations}</p>{details&&<details ref={detailsRef} id={detailsId}><summary>Sources, method & recorded values</summary>{details}</details>}</article>;
}
