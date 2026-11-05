import {useState} from 'react';
import {neutralMicroorganismVisual} from '@shared/scientific-visuals';

export default function OrganismPortrait({size,disabled=false}:{size:'thumbnail'|'portrait';disabled?:boolean}){
 const[unavailable,setUnavailable]=useState(false),visual=neutralMicroorganismVisual(disabled||unavailable),pixels=size==='thumbnail'?36:180;
 const picture=<span className={`organism-visual organism-visual-${size}`}>
  {visual.src?<img src={visual.src} width={pixels} height={pixels} alt={visual.label} onError={()=>setUnavailable(true)} decoding="async" referrerPolicy="no-referrer"/>:<span className="organism-visual-inline" role="img" aria-label={visual.label}><span aria-hidden="true">○</span></span>}
 </span>;
 return size==='thumbnail'?picture:<figure className="organism-portrait">{picture}<figcaption className="panel-note">{visual.label}</figcaption></figure>;
}
