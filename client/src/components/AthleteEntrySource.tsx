import type {AthleteEntrySource as Source} from "@shared/athlete-entry-source";
const labels:Record<string,string>={weightKg:"Reference body mass",energyKcal:"Team energy target",fluidMl:"Session fluid",preKg:"Pre-session mass",postKg:"Post-session mass",drankMl:"Fluid consumed",urineMl:"Urine during session"};
export default function AthleteEntrySource({source}:{source?:Source}){
 return <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Entered values & units</summary>
  {source?<><p className="panel-note">Retained self-reported entry text and units, before display conversion. These inputs are not independently verified; only retained fields are listed.</p><dl>{Object.entries(source.fields).filter(([,input])=>!!input).map(([key,input])=><div key={key}><dt>{labels[key]}</dt><dd>{input!.value} {input!.unit==="US-fl-oz"?"US fl oz":input!.unit}</dd></div>)}</dl></>:<p className="panel-note">Original entry text and units were not retained. Saved canonical values remain available; their original entry cannot be reconstructed.</p>}
 </details>;
}
