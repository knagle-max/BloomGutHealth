import {useId,useState} from 'react';
import geometry from '@/content/anatomy-source-geometry.json';
import frontLocations from '../../../design/bloom/anatomy/unified-symptom/v1/assets/front-regions-provisional.json';
import backLocations from '../../../design/bloom/anatomy/unified-symptom/v1/assets/back-regions-provisional.json';
import frontBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-front.png';
import backBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-back.png';
import '@/styles/anatomy-region-selector.css';
import AnatomyMarkers from './AnatomyMarkers';
import {muscleInspectorCrosswalk,symptomInspectorCrosswalk} from '@/lib/anatomy-inspector-crosswalk';
import {layoutAnatomyMarkers,markerCountLabel,type MarkerReport} from '@/lib/anatomy-marker-layout';

type View='front'|'back';
type Layer='muscles'|'locations';
/** A source-qualified visual selection, deliberately not a canonical muscle,
 * symptom record, diagnostic finding or reviewed exercise participation. */
export type AnatomyVisualSelection={source:'stages-1-3'|'unified-symptom-v1'|'text-only-inspection';view:View|null;layer:Layer;visualKey:string;label:string};
/** Nonpersisting illustrative inspector; canonical health analytics remain separate.
 * No account API, persistence, source aggregation or sample health data. */
export default function AnatomyRegionSelector({onSelect,reports}:{onSelect?:(selection:AnatomyVisualSelection|null)=>void;reports?:Partial<Record<View,readonly MarkerReport[]>>}){
 const [view,setView]=useState<View>('front'),[layer,setLayer]=useState<Layer>('muscles'),[selected,setSelected]=useState<string|null>(null),[failed,setFailed]=useState(false);
 const [focused,setFocused]=useState<string|null>(null);
 const prefix=useId(),description=prefix+'-description';
 const muscles=geometry.views[view];
 const locations=view==='front'?frontLocations:backLocations;
 const crosswalk=(layer==='muscles'?muscleInspectorCrosswalk:symptomInspectorCrosswalk).filter(row=>row.view===view);
 const regions=Array.from(new Set(crosswalk.map(row=>row.visualKey))).map(key=>({key,label:crosswalk.find(row=>row.visualKey===key)!.displayLabel}));
 const unlocalized={key:'diffuse_non_anatomical',label:'General / not localized'};
 function choose(key:string){if(layer==='locations'&&key===unlocalized.key){setSelected(key);onSelect?.({source:'text-only-inspection',view:null,layer,visualKey:key,label:unlocalized.label});return;}const region=regions.find(row=>row.key===key);if(!region)return;setSelected(key);onSelect?.({source:layer==='muscles'?'stages-1-3':'unified-symptom-v1',view,layer,visualKey:key,label:region.label});}
 function clear(){setSelected(null);setFocused(null);onSelect?.(null);}
 function switchView(value:View){if(value===view)return;clear();setView(value);setFailed(false);}
 function switchLayer(value:Layer){if(value===layer)return;clear();setLayer(value);}
 const selectedAnatomy=layer==='muscles'?muscleInspectorCrosswalk.find(row=>row.view===view&&row.visualKey===selected):undefined;
 const selection=regions.find(region=>region.key===selected)??(layer==='locations'&&selected===unlocalized.key?unlocalized:undefined);
 const layout=layoutAnatomyMarkers(locations,reports?.[view]??[],selected,focused);
 function suppliedState(key:string){return layout.ok?markerCountLabel(layout.markers.find(row=>row.visualKey===key)):'Marker data unavailable: unsupported display input.';}
 return <section className="anatomy-region-selector space-y-4" aria-label="Illustrative body-region inspector">
  <h2>Explore body regions</h2>
  <p id={description} className="panel-note">Illustrative regions, not measurements. Explore source-labeled areas without recording an exercise or symptom. Selection does not indicate a muscle exercised, pain, injury or a diagnosis.</p>
  <fieldset className="flex flex-wrap gap-2"><legend>View</legend>{(['front','back'] as const).map(value=><button type="button" key={value} aria-pressed={view===value} onClick={()=>switchView(value)}>{value==='front'?'Front':'Back'}</button>)}</fieldset>
  <fieldset className="flex flex-wrap gap-2"><legend>Artwork layer</legend>{(['muscles','locations'] as const).map(value=><button type="button" key={value} aria-pressed={layer===value} onClick={()=>switchLayer(value)}>{value==='muscles'?'Muscle regions':'Symptom geography'}</button>)}</fieldset>
  <div className="anatomy-selector-layout">
   <div className="anatomy-selector-figure">
    {!failed?<svg viewBox="0 0 320 820" className="anatomy-selector-svg" role="group" aria-label={`${view==='front'?'Front':'Back'} ${layer==='muscles'?'muscle regions':'symptom locations'}`} aria-describedby={description}>
     <image href={view==='front'?frontBody:backBody} width="320" height="820" onError={()=>setFailed(true)}/>
     {layer==='muscles'?muscles.map(path=><path key={path.id} d={path.d} data-region-key={path.group} data-selected={selected===path.group} className="anatomy-selector-path" aria-hidden="true" onClick={()=>choose(path.group)}/>):locations.map(region=><path key={region.id} d={region.d} data-region-key={region.id} data-selected={selected===region.id} className="anatomy-selector-path" aria-hidden="true" onClick={()=>choose(region.id)}/>)}
    {layer==='locations'&&<AnatomyMarkers layout={layout}/>}
    </svg>:<p role="status">The original body image is unavailable. Choose a region from the list.</p>}
   </div>
   <div><p className="panel-note">Use the figure or the equivalent buttons. Front left/right labels come from the source anatomy fields. Posterior left/right words are unverified source labels. No body-side mapping or matching personal record is asserted.</p>
    {selection&&<details className="anatomy-selector-source"><summary>About this visual region</summary><p>This illustration is not linked to a logged activity or symptom. Broad visual regions do not distinguish every structure within an area.</p>{selectedAnatomy&&<><p>{selectedAnatomy.anatomicalContext}</p><a className="text-link" href={selectedAnatomy.anatomyReference} target="_blank" rel="noopener noreferrer">Anatomy reference (OpenStax)</a></>}<p>{crosswalk.find(row=>row.visualKey===selection.key)?.lateralityEvidence}</p></details>}
    {layer==='locations'&&reports&&<p role={layout.ok?'note':'alert'} className="panel-note">{layout.ok?'Rings show supplied reported severity, not tissue damage. Counts are supplied observations, not episodes. Missing reports never mean no symptoms.':'Marker data unavailable: unsupported display input. Region selection remains available.'}</p>}
    <div className="anatomy-selector-regions" aria-label="Body regions">{regions.map(region=><button type="button" key={`${view}:${layer}:${region.key}`} aria-pressed={selected===region.key} onClick={()=>choose(region.key)} onFocus={()=>setFocused(region.key)} onBlur={()=>setFocused(null)}>{region.label}{layer==='locations'&&<span className="anatomy-region-state">{reports?suppliedState(region.key):'Illustrative location; no personal record linked.'}</span>}</button>)}</div>
    {layer==='locations'&&<button type="button" aria-pressed={selected===unlocalized.key} onClick={()=>choose(unlocalized.key)}>{unlocalized.label}</button>}
    {layer==='locations'&&<p className="panel-note">General or unlocalized inspection stays text-only; it never places a dot on the body.</p>}
    <p role="status" aria-live="polite">{selection?`Selected: ${selection.label}. Artwork selection only.${layer==='locations'&&reports?' '+suppliedState(selection.key)+(layout.ok&&layout.hiddenCounts.includes(selection.key)?' Count pill omitted for space or collision; full count is in the list.':''):''}`:'No region selected. This does not mean no symptoms or no activity.'}</p>
    <button type="button" onClick={clear} disabled={!selected}>Clear selection</button>
   </div>
  </div>
 </section>;
}
