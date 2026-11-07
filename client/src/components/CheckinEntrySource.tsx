import type {CheckinEntrySource as Source} from "@shared/checkin-entry-source";
const labels:Record<string,string>={weight:"Weight",waist:"Waist",bodyFatPercent:"Body fat",bloating:"Bloating",energy:"Energy",adherencePercent:"Adherence"};
export default function CheckinEntrySource({source}:{source?:Source}){
 return <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Entered values & units</summary>
  {source?<><p className="panel-note">Retained entry text and units, before display conversion. These are self-reported inputs, not independently verified measurements. Only retained fields are listed.</p><dl className="space-y-1">{Object.entries(source.fields).filter(([,value])=>!!value).map(([key,input])=><div key={key}><dt className="font-medium">{labels[key]}</dt><dd>{input!.value} {input!.unit==="0-10"?"out of 10":input!.unit}</dd></div>)}</dl></>:<p className="panel-note">Original entered text and units were not retained for this record. The saved canonical values remain available; their original entry cannot be reconstructed.</p>}
 </details>;
}
