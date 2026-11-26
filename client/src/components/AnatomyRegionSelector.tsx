import {useId,useState} from 'react';
import geometry from '@/content/anatomy-source-geometry.json';
import frontLocations from '../../../design/bloom/anatomy/unified-symptom/v1/assets/front-regions-provisional.json';
import backLocations from '../../../design/bloom/anatomy/unified-symptom/v1/assets/back-regions-provisional.json';
import frontBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-front.png';
import backBody from '../../../design/bloom/anatomy/stages-1-3/assets/body-back.png';
import '@/styles/anatomy-region-selector.css';

type View='front'|'back';
type Layer='muscles'|'locations';
/** A source-qualified visual selection, deliberately not a canonical muscle,
 * symptom record, diagnostic finding or reviewed exercise participation. */
export type AnatomyVisualSelection={source:'stages-1-3'|'unified-symptom-v1';view:View;layer:Layer;visualKey:string;label:string};
/** Unmounted integration seam until canonical mapping/rights/anatomy review.
 * No account API, persistence, source aggregation or sample health data. */
export default function AnatomyRegionSelector({onSelect}:{onSelect?:(selection:AnatomyVisualSelection)=>void}){
 const [view,setView]=useState<View>('front'),[layer,setLayer]=useState<Layer>('muscles'),[selected,setSelected]=useState<string|null>(null),[failed,setFailed]=useState(false);
 const prefix=useId(),description=prefix+'-description';
 const muscles=geometry.views[view];
 const locations=view==='front'?frontLocations:backLocations;
 const regions=layer==='muscles'?Array.from(new Set(muscles.map(path=>path.group))).map(key=>({key,label:muscles.find(path=>path.group===key&&path.label)?.label??key})):locations.map(region=>({key:region.id,label:region.label}));
 function choose(key:string){const region=regions.find(row=>row.key===key);if(!region)return;setSelected(key);onSelect?.({source:layer==='muscles'?'stages-1-3':'unified-symptom-v1',view,layer,visualKey:key,label:region.label});}
 function switchView(value:View){setView(value);setSelected(null);setFailed(false);}
 function switchLayer(value:Layer){setLayer(value);setSelected(null);}
 const selection=regions.find(region=>region.key===selected);
 return <section className="anatomy-region-selector space-y-4" aria-label="Original anatomy artwork interaction">
  <h2>Explore the body map</h2>
  <p id={description} className="panel-note">Development artwork preview. Regions are provisional visual labels, not confirmed anatomy mappings, measured muscle activation, pain findings or diagnoses. Selecting a location does not save a health record.</p>
  <fieldset className="flex flex-wrap gap-2"><legend>View</legend>{(['front','back'] as const).map(value=><button type="button" key={value} aria-pressed={view===value} onClick={()=>switchView(value)}>{value==='front'?'Front':'Back'}</button>)}</fieldset>
  <fieldset className="flex flex-wrap gap-2"><legend>Artwork layer</legend>{(['muscles','locations'] as const).map(value=><button type="button" key={value} aria-pressed={layer===value} onClick={()=>switchLayer(value)}>{value==='muscles'?'Muscle regions':'Pain / symptom locations'}</button>)}</fieldset>
  <div className="anatomy-selector-layout">
   <div className="anatomy-selector-figure">
    {!failed?<svg viewBox="0 0 320 820" className="anatomy-selector-svg" role="group" aria-label={`${view==='front'?'Front':'Back'} ${layer==='muscles'?'muscle regions':'symptom locations'}`} aria-describedby={description}>
     <image href={view==='front'?frontBody:backBody} width="320" height="820" onError={()=>setFailed(true)}/>
     {layer==='muscles'?muscles.map(path=><path key={path.id} d={path.d} data-region-key={path.group} data-selected={selected===path.group} className="anatomy-selector-path" aria-hidden="true" onClick={()=>choose(path.group)}/>):locations.map(region=><path key={region.id} d={region.d} data-region-key={region.id} data-selected={selected===region.id} className="anatomy-selector-path" aria-hidden="true" onClick={()=>choose(region.id)}/>)}
    </svg>:<p role="status">The original body image is unavailable. Choose a region from the list.</p>}
   </div>
   <div><p className="panel-note">Use the figure or the equivalent buttons. Left and right in symptom labels mean the person's anatomical side. The inactive layer is not rendered.</p>
    <div className="anatomy-selector-regions" aria-label="Body regions">{regions.map(region=><button type="button" key={`${view}:${layer}:${region.key}`} aria-pressed={selected===region.key} onClick={()=>choose(region.key)}>{region.label}</button>)}</div>
    <p role="status" aria-live="polite">{selection?`Selected: ${selection.label}. Artwork selection only.`:'No region selected. This does not mean no symptoms or no activity.'}</p>
    <button type="button" onClick={()=>setSelected(null)} disabled={!selected}>Clear selection</button>
   </div>
  </div>
 </section>;
}
