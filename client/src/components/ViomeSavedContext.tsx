import {viomeSource,compatibleViomeCompanion,type ViomeSavedSource} from "@shared/viome-report-context";

export default function ViomeSavedContext({sample,samples,onSelect}:{sample:ViomeSavedSource;samples:ViomeSavedSource[];onSelect:(id:string)=>void}){
 const source=viomeSource(sample.structuredData);if(!source)return null;
 const parent=source.specimenEvent?samples.find(row=>row.id===source.specimenEvent!.rootReportId):null;
 const parentSource=parent?viomeSource(parent.structuredData):null;
 const companions=source.specimenEvent?(parent&&parentSource&&compatibleViomeCompanion(source,parentSource)?[parent]:[]):samples.filter(row=>{const linked=viomeSource(row.structuredData);return linked?.specimenEvent?.rootReportId===sample.id&&compatibleViomeCompanion(linked,source);});
 return <section className="bloom-panel space-y-3" aria-label="Viome source relationship">
  <h2>Source relationship</h2><p>{companions.length?"You confirmed these separate reports came from the same specimen. Their values and categories remain separate.":source.specimenEvent?"The linked report is no longer available. This report's own findings remain available.":"This is a standalone source. Matching dates do not establish a shared specimen."}</p>
  {companions.map(row=><button key={row.id} className="text-link min-h-11 focus-visible:outline focus-visible:outline-2" type="button" onClick={()=>onSelect(row.id)}>Open companion report</button>)}

 </section>;
}
