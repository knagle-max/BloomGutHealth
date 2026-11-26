import type {SurfaceTraining} from '@shared/anatomy-training';
import {useId,useState} from 'react';
import frontLocations from '../../../design/bloom/anatomy/unified-symptom/v1/assets/front-regions-provisional.json';
import backLocations from '../../../design/bloom/anatomy/unified-symptom/v1/assets/back-regions-provisional.json';
import frontBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-front.png';
import backBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-back.png';
import frontEveryday from '../../../design/bloom/anatomy/presentation-20261126/front-everyday.svg';
import frontAthlete from '../../../design/bloom/anatomy/presentation-20261126/front-athlete.svg';
import backEveryday from '../../../design/bloom/anatomy/presentation-20261126/back-everyday.svg';
import backAthlete from '../../../design/bloom/anatomy/presentation-20261126/back-athlete.svg';
import '@/styles/anatomy-region-selector.css';
import AnatomyMarkers from './AnatomyMarkers';
import AnatomyMuscleLayer from './AnatomyMuscleLayer';
import{muscleTargets}from'@/lib/anatomy-muscle-presentation';
import {muscleInspectorCrosswalk,symptomInspectorCrosswalk} from '@/lib/anatomy-inspector-crosswalk';
import {layoutAnatomyMarkers,markerCountLabel,type MarkerReport} from '@/lib/anatomy-marker-layout';

type View='front'|'back';
type Layer='muscles'|'locations';
/** A source-qualified visual selection, deliberately not a canonical muscle,
 * symptom record, diagnostic finding or reviewed exercise participation. */
export type AnatomyVisualSelection={source:'stages-1-3'|'unified-symptom-v1'|'text-only-inspection'|'v433-provisional';sourceTargetId?:string;parentSourceId?:string|null;view:View|null;layer:Layer;visualKey:string;label:string};
/** Nonpersisting illustrative inspector; canonical health analytics remain separate.
 * No account API, persistence, source aggregation or sample health data. */
export default function AnatomyRegionSelector({onSelect,reports,training,mode='everyday'}:{training?:readonly SurfaceTraining[];mode?:'everyday'|'athlete';onSelect?:(selection:AnatomyVisualSelection|null)=>void;reports?:Partial<Record<View,readonly MarkerReport[]>>}){
 const [view,setView]=useState<View>('front'),[layer,setLayer]=useState<Layer>('muscles'),[selected,setSelected]=useState<string|null>(null),[failed,setFailed]=useState(false);
 const [detailed,setDetailed]=useState(false),[hovered,setHovered]=useState<string|null>(null);
 const [focused,setFocused]=useState<string|null>(null);
 const prefix=useId(),description=prefix+'-description';
 const showChildren=mode==='athlete'&&detailed;
 const muscleRows=muscleTargets(view,showChildren);
 const trainingRows=(training??[]).filter(row=>row.view===view),trainingTargets=muscleTargets(view,false);
 const trainingText=(key:string)=>{const row=trainingRows.find(r=>r.pathId===key);return row?`${row.primaryKeys.length} primary and ${row.secondaryKeys.length} secondary completed set records; ${row.side} body side. Nonadditive surface association.`:'No matched sided set records for this surface. This does not establish no training.';};
 const paintPrefix='anatomy-'+prefix.replace(/[^a-z0-9]/gi,'');
 const presentation=view==='front'?(mode==='athlete'?frontAthlete:frontEveryday):(mode==='athlete'?backAthlete:backEveryday);
 const locations=view==='front'?frontLocations:backLocations;
 const crosswalk=(layer==='muscles'?muscleInspectorCrosswalk:symptomInspectorCrosswalk).filter(row=>row.view===view);
 const regions=layer==='muscles'?muscleRows.map(row=>({key:row.id,label:row.label})):Array.from(new Set(crosswalk.map(row=>row.visualKey))).map(key=>({key,label:crosswalk.find(row=>row.visualKey===key)!.displayLabel}));
 const unlocalized={key:'diffuse_non_anatomical',label:'General / not localized'};
 function choose(key:string){if(layer==='locations'&&key===unlocalized.key){setSelected(key);onSelect?.({source:'text-only-inspection',view:null,layer,visualKey:key,label:unlocalized.label});return;}const region=regions.find(row=>row.key===key);if(!region)return;setSelected(key);onSelect?.({source:layer==='muscles'?(muscleRows.find(row=>row.id===key)?.provisional?'v433-provisional':'stages-1-3'):'unified-symptom-v1',sourceTargetId:key,parentSourceId:layer==='muscles'?muscleRows.find(row=>row.id===key)?.parentId:null,view,layer,visualKey:layer==='muscles'?muscleRows.find(row=>row.id===key)!.visualKey:key,label:region.label});}
 function clear(){setSelected(null);setFocused(null);setHovered(null);onSelect?.(null);}
 function switchView(value:View){if(value===view)return;clear();setView(value);setFailed(false);}
 function switchLayer(value:Layer){if(value===layer)return;clear();setLayer(value);}
 const selectedAnatomy=layer==='muscles'?muscleInspectorCrosswalk.find(row=>row.view===view&&row.svgRegionId===selected):undefined;
 const selection=regions.find(region=>region.key===selected)??(layer==='locations'&&selected===unlocalized.key?unlocalized:undefined);
 const layout=layoutAnatomyMarkers(locations,reports?.[view]??[],selected,focused);
 function suppliedState(key:string){return layout.ok?markerCountLabel(layout.markers.find(row=>row.visualKey===key)):'Marker data unavailable: unsupported display input.';}
 return <section className="anatomy-region-selector space-y-4" aria-label="Illustrative body-region inspector">
  <h2>{training?'Recorded training by surface region':'Explore body regions'}</h2>
  <p id={description} className="panel-note">{training?'Dashed outlines show curated surface associations from explicitly sided completed sets. They are not muscle activation measurements or symptoms. Selection alone records nothing.':'Illustrative regions, not measurements. Explore source-labeled areas without recording an exercise or symptom. Selection does not indicate a muscle exercised, pain, injury or a diagnosis.'}</p>
  <fieldset className="flex flex-wrap gap-2"><legend>View</legend>{(['front','back'] as const).map(value=><button type="button" key={value} aria-pressed={view===value} onClick={()=>switchView(value)}>{value==='front'?'Front':'Back'}</button>)}</fieldset>
  <fieldset className="flex flex-wrap gap-2"><legend>Artwork layer</legend>{(['muscles','locations'] as const).map(value=><button type="button" key={value} aria-pressed={layer===value} onClick={()=>switchLayer(value)}>{value==='muscles'?'Muscle regions':'Symptom geography'}</button>)}</fieldset>
  {layer==='muscles'&&mode==='athlete'&&<fieldset className="flex flex-wrap gap-2"><legend>Muscle map detail</legend>{[false,true].map(value=><button key={String(value)} type="button" aria-pressed={detailed===value} onClick={()=>{if(value!==detailed){clear();setDetailed(value);}}}>{value?'Detailed areas':'Overview'}</button>)}</fieldset>}
  {layer==='muscles'&&<p className="panel-note">Yellow areas are illustrations, not activity or pain measurements. Overview selects the original broad blue regions. Detailed areas use separate provisional footprints; focus a list button to see its exact boundary.</p>}
  <div className="anatomy-selector-layout">
   <div className="anatomy-selector-figure">
    {!failed?<svg viewBox="0 0 320 820" className="anatomy-selector-svg" role="group" aria-label={`${view==='front'?'Front':'Back'} ${layer==='muscles'?'muscle regions':'symptom locations'}`} aria-describedby={description}>
     <image href={layer==='muscles'?presentation:view==='front'?frontBody:backBody} width="320" height="820" pointerEvents="none" aria-hidden="true" onError={()=>setFailed(true)}/>
     {layer==='muscles'&&training&&<g aria-hidden="true" pointerEvents="none">{trainingRows.map(row=>{const target=trainingTargets.find(t=>t.id===row.pathId);return target?<path key={row.anatomyId} data-training-surface={row.anatomyId} d={target.d} fill="none" stroke="#a7e4de" strokeWidth="3" strokeDasharray="5 3" vectorEffect="non-scaling-stroke"/>:null;})}</g>}
     {layer==='muscles'?<AnatomyMuscleLayer targets={muscleRows} prefix={paintPrefix} selected={selected} preview={focused??hovered} onChoose={choose} onPreview={setHovered}/>:locations.map(region=><path key={region.id} d={region.d} data-region-key={region.id} data-selected={selected===region.id} className="anatomy-selector-path" aria-hidden="true" onClick={()=>choose(region.id)}/>)}
    {layer==='locations'&&<AnatomyMarkers layout={layout}/>}
    </svg>:<p role="status">The original body image is unavailable. Choose a region from the list.</p>}
   </div>
   <div><p className="panel-note">{layer==='muscles'?'Use the figure or the equivalent buttons. Diagram left/right describes the picture; candidate detailed-side labels remain provisional. Surface training labels use the separately verified baseline crosswalk.':'Use the figure or the equivalent buttons. Front left/right labels come from source fields. Posterior left/right words are unverified source labels; no personal record is linked.'}</p>
    {selection&&<details className="anatomy-selector-source"><summary>About this visual region</summary>{layer==='muscles'&&muscleRows.find(row=>row.id===selected)?.provisional&&<p>Illustrative region — provisional mapping. Source identity: {selected}. No canonical muscle or health record is assigned.{muscleRows.find(row=>row.id===selected)?.parentageUnresolved?' This expanded area has no approved parent association or roll-up.':''}</p>}<p>{training?'Dashed outlines link confirmed set records to coarse baseline surface anchors. Detailed illustrative footprints do not acquire independent counts.':'This illustration is not linked to a logged activity or symptom.'} Broad visual regions do not distinguish every structure within an area.</p>{selectedAnatomy&&<><p>{selectedAnatomy.anatomicalContext}</p><a className="text-link" href={selectedAnatomy.anatomyReference} target="_blank" rel="noopener noreferrer">Anatomy reference (OpenStax)</a></>}<p>{crosswalk.find(row=>row.visualKey===selection.key)?.lateralityEvidence}</p></details>}
    {layer==='locations'&&reports&&<p role={layout.ok?'note':'alert'} className="panel-note">{layout.ok?'Rings show supplied reported severity, not tissue damage. 0/10 is shown as a number; a hollow marker means unrated. Counts are supplied observations, not episodes. Missing reports never mean no symptoms.':'Marker data unavailable: unsupported display input. Region selection remains available.'}</p>}
    <details open={mode==='athlete'}><summary>Choose a region from the list</summary><div className="anatomy-selector-regions" aria-label="Body regions">{regions.map(region=><button type="button" key={`${view}:${layer}:${region.key}`} data-muscle-target={layer==='muscles'?region.key:undefined} data-list-only={layer==='muscles'?muscleRows.find(row=>row.id===region.key)?.listOnly:undefined} aria-label={layer==='muscles'?muscleRows.find(row=>row.id===region.key)?.ariaLabel:undefined} aria-describedby={description} aria-pressed={selected===region.key} onClick={()=>choose(region.key)} onMouseEnter={()=>setHovered(region.key)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setFocused(region.key)} onBlur={()=>setFocused(null)}>{region.label}{layer==='muscles'&&training&&!showChildren&&<span className="anatomy-region-state">{trainingText(region.key)}</span>}{layer==='locations'&&<span className="anatomy-region-state">{reports?suppliedState(region.key):'Illustrative location; no personal record linked.'}</span>}</button>)}</div></details>
    {layer==='locations'&&<button type="button" aria-pressed={selected===unlocalized.key} onClick={()=>choose(unlocalized.key)}>{unlocalized.label}</button>}
    {layer==='locations'&&<p className="panel-note">General or unlocalized inspection stays text-only; it never places a dot on the body.</p>}
    <p role="status" aria-live="polite">{selection?`Selected: ${selection.label}. Artwork selection only.${layer==='locations'&&reports?' '+suppliedState(selection.key)+(layout.ok&&layout.hiddenCounts.includes(selection.key)?' Count pill omitted for space or collision; full count is in the list.':''):''}`:'No region selected. This does not mean no symptoms or no activity.'}</p>
    <button type="button" onClick={clear} disabled={!selected}>Clear selection</button>
   </div>
  </div>
 </section>;
}
