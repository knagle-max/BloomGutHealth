import {useState} from 'react';
import {neutralMicroorganismVisual,organismIllustration,legacyOrganismIllustration,type OrganismArtworkSource} from '@shared/scientific-visuals';

export default function OrganismPortrait({size,sourceName,source,disabled=false,captionPlacement='inline'}:{size:'thumbnail'|'portrait'|'card';captionPlacement?:'inline'|'footer';sourceName?:string;source?:OrganismArtworkSource;disabled?:boolean}){
 const variant=size==='thumbnail'?'thumbnail':'portrait';
 const candidate=organismIllustration(sourceName,variant,source);
 const key=`${source?.reportId||''}:${source?.observationId||''}:${candidate.src}`;
 const [failure,setFailure]=useState({key,stage:0});
 const stage=failure.key===key?failure.stage:0;
 const fallback=candidate.styleId!=='U00'?legacyOrganismIllustration(sourceName,variant):null;
 const visual=disabled||stage>=2?neutralMicroorganismVisual(true):stage===1?(fallback||neutralMicroorganismVisual()):candidate;
 const pixels=size==='thumbnail'?36:180;
 const picture=<span className={`organism-visual organism-visual-${size}`} data-morphology-source={disabled||stage?"fallback":"optimized"} data-morphology-style={candidate.styleId} data-bloom-asset-id={candidate.assetId}>
  {visual.src?<img src={visual.src} width={pixels} height={pixels} alt={visual.label} onError={()=>setFailure(old=>({key,stage:Math.min(2,old.key===key?old.stage+1:1)}))} decoding="async" referrerPolicy="no-referrer"/>:<span className="organism-visual-inline" role="img" aria-label={visual.label}><span aria-hidden="true">○</span></span>}
 </span>;
 if(size==='card'||size==='thumbnail')return picture;
 if(captionPlacement==='footer')return <><figure className="organism-portrait">{picture}</figure><p className="organism-portrait-caption panel-note">{visual.label}</p></>;
 return <figure className="organism-portrait">{picture}<figcaption className="panel-note">{visual.label}</figcaption></figure>;
}
