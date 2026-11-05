import {useEffect,useState} from "react";
import {molecularIllustration} from "@shared/scientific-visuals";

export default function MolecularIllustration({entityId,label,kind}:{entityId:string;label:string;kind:string}){
 const visual=molecularIllustration(entityId,label,kind),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>setUnavailable(false),[visual?.src]);
 if(!visual)return null;
 return <figure aria-label={`Molecular illustration for ${label}`} className="space-y-2 min-w-0 break-words">
  {unavailable?<p role="status">Illustration unavailable. Research connections remain available below.</p>:<img src={visual.src} alt={visual.label} width={480} height={520} className="w-full max-w-sm h-auto rounded-xl" decoding="async" referrerPolicy="no-referrer" onError={()=>setUnavailable(true)}/>}
  <figcaption className="panel-note">Molecular connectivity illustration · source draft, chemistry review pending. Not your measured chemical form, pH or amount.</figcaption>
  {!unavailable&&<a className="text-link block max-w-full min-h-11 py-2 break-words" href={visual.src} target="_blank" rel="noopener noreferrer">View full illustration</a>}
 </figure>;
}
