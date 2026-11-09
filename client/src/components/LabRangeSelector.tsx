import type {ProviderRangeContext} from '@shared/lab-provider-ranges';
export type LabOverlayChoice={provider:'original-report'|'LifeLabs'|'other'|'none';province:string;otherProvider:string;context:Pick<ProviderRangeContext,'specimen'|'assay'|'method'|'ageAtCollection'|'sexReferenceCategory'|'fasting'|'collectedOn'>;confirmed:boolean};
export const emptyLabOverlayChoice=():LabOverlayChoice=>({provider:'original-report',province:'',otherProvider:'',context:{specimen:'',assay:'',method:'',ageAtCollection:null,sexReferenceCategory:null,fasting:'unknown',collectedOn:''},confirmed:false});
export default function LabRangeSelector({value,onChange,id,selected}:{value:LabOverlayChoice;onChange:(next:LabOverlayChoice)=>void;id:string;selected:boolean}){
 const published=value.provider==='LifeLabs'||value.provider==='other';
 const context=(change:Partial<LabOverlayChoice['context']>)=>onChange({...value,confirmed:false,context:{...value.context,...change}});
 return <div className="space-y-2 min-w-0 lab-range-selector">
  <label className="block" htmlFor={id+'-provider'}>Reference overlay</label><select id={id+'-provider'} className="bloom-input w-full" value={value.provider} onChange={event=>onChange({...emptyLabOverlayChoice(),provider:event.target.value as LabOverlayChoice['provider']})}><option value="original-report">Original report</option><option value="LifeLabs">LifeLabs</option><option value="other">Other lab</option><option value="none">None</option></select>
  {published&&<>
   <p className="panel-note">Published comparisons require independently verified provider, province, test, specimen/assay, collection-era version and applicable collection context. Selection changes this view only; original laboratory and report intervals are preserved.</p>
   {value.provider==='other'&&<label className="block">Published comparison laboratory<input className="bloom-input w-full" maxLength={100} value={value.otherProvider} onChange={event=>onChange({...value,otherProvider:event.target.value,confirmed:false})}/></label>}
   <label className="block" htmlFor={id+'-province'}>Comparison province / territory (required)</label><select id={id+'-province'} required aria-required="true" className="bloom-input w-full" value={value.province} onChange={event=>onChange({...value,province:event.target.value,confirmed:false})}><option value="">Choose a province or territory</option>{['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(province=><option key={province} value={province}>{province}</option>)}</select>
   <p className="panel-note">BC examples cannot be used for Saskatchewan or Ontario. Current Profile demographics never fill collection context.</p>
   <details><summary className="min-h-11 cursor-pointer">Collection context for a provider comparison</summary><div className="space-y-2 py-2 min-w-0">
    {!selected&&<p className="panel-note">Choose a recorded result below. Collection context belongs to that observation, not your current Profile.</p>}
    <p className="panel-note">Date, method and fasting come from the selected saved source. A timestamp alone does not confirm the source collection date. Review the original source to confirm missing context.</p>
    <label className="block">Recorded test date<input type="date" className="bloom-input w-full" value={value.context.collectedOn} readOnly/></label>
    <label className="block">Age at collection (years)<input type="number" min="0" max="130" step="any" className="bloom-input w-full" value={value.context.ageAtCollection??''} onChange={event=>context({ageAtCollection:event.target.value===''?null:Number(event.target.value)})}/></label>
    <label className="block" htmlFor={id+'-sex'}>Report reference sex category</label><select id={id+'-sex'} className="bloom-input w-full" value={value.context.sexReferenceCategory??''} onChange={event=>context({sexReferenceCategory:(event.target.value||null) as 'M'|'F'|null})}><option value="">Unknown / not supplied</option><option value="M">M — report reference category</option><option value="F">F — report reference category</option></select>
    <label className="block">Reported specimen type<input className="bloom-input w-full" value={value.context.specimen} maxLength={100} onChange={event=>context({specimen:event.target.value})}/></label>
    <label className="block">Reported assay<input className="bloom-input w-full" value={value.context.assay} maxLength={200} onChange={event=>context({assay:event.target.value})}/></label>
    <label className="block">Reported method<input className="bloom-input w-full" value={value.context.method} maxLength={200} readOnly/></label>
    <label className="block" htmlFor={id+'-fasting'}>Fasting context at collection</label><select id={id+'-fasting'} className="bloom-input w-full" value={value.context.fasting} disabled><option value="unknown">Unknown / not supplied</option><option value="yes">Fasting</option><option value="no">Not fasting / random</option></select>
    <label className="block"><input type="checkbox" checked={value.confirmed} onChange={event=>onChange({...value,confirmed:event.target.checked})}/> I checked this collection context against the selected source report.</label>
   </div></details>
  </>}
 </div>;
}
