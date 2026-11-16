import {additionalLabMarkers,type AdditionalLabMarkerId} from './additional-lab-markers';
const nameKey=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
export function labUnitKey(raw:string){return raw.replace(/¹²/g,'^12').replace(/⁹/g,'^9').replace(/⁶/g,'^6').replace(/³/g,'^3').normalize('NFKC').replace(/[µμ]/g,'u').toLowerCase().replace(/\s/g,'').replace(/^[x×]/,'').replace(/10\*/g,'10^').replace(/mcg/g,'ug');}
export function additionalLabSourceIdentity(label:string,unit:string|undefined):{id?:AdditionalLabMarkerId;ambiguous?:string}{
 const key=nameKey(label),unitKey=labUnitKey(unit||'');
 if(key==='psa'||key==='prostatespecificantigen')return{ambiguous:'Confirm total PSA versus free PSA or a ratio from the original report; an unspecified fraction stays source-only.'};
 if(key==='immaturegranulocytes'||key==='immaturegranulocyte'){if(['10^9/l','10^3/ul','k/ul'].includes(unitKey))return{id:'immature_granulocytes'};return{ambiguous:'Confirm absolute immature granulocyte count versus percentage from the source unit; they are different measurements.'};}
 for(const base of ['neutrophils','lymphocytes','monocytes','eosinophils','basophils']as const){
  const singular=base.slice(0,-1),short={neutrophils:'neut',lymphocytes:'lymph',monocytes:'mono',eosinophils:'eos',basophils:'baso'}[base];
  if([base,singular,short,base+'count',singular+'count'].includes(key)){
   if(label.includes('%')||unitKey==='%'||unitKey==='percent')return{id:(base+'_percent') as AdditionalLabMarkerId};
   if(['10^9/l','10^3/ul','k/ul'].includes(unitKey))return{id:base};
   return{ambiguous:'Confirm whether this differential result is an absolute count or a percentage, and retain its reported unit.'};
  }
 }
 if(key==='rdw'||key==='redcelldistributionwidth'){
  if(label.includes('%')||unitKey==='%'||unitKey==='percent')return{id:'rdw_cv'};
  if(unitKey==='fl')return{id:'rdw_sd'};
  return{ambiguous:'Confirm RDW-CV (%) versus RDW-SD (fL); they are different measurements.'};
 }
 const marker=additionalLabMarkers.find(marker=>[marker.id,marker.name,...marker.aliases].some(alias=>nameKey(alias)===key));
 if(marker)return{id:marker.id};
 // Explicit absolute/percentage labels may put the qualifier before the cell name.
 const qualified=/^(absolute|abs)(.+)$/.exec(key);
 if(qualified){const found=additionalLabMarkers.find(marker=>!marker.id.endsWith('_percent')&&marker.aliases.some(alias=>nameKey(alias)===qualified[2]+'absolute'));if(found)return{id:found.id};}
 return{};
}
export function normalizedLabUnit(raw:string,units:readonly string[]):string|undefined{
 let key=labUnitKey(raw);
 if(key==='percent'||key==='pct')key='%';
 if(key==='k/ul'&&units.includes('10^3/uL'))key='10^3/ul';
 if((/^M\//.test(raw)||key==='million/ul')&&units.includes('10^6/uL'))key='10^6/ul';
 return units.find(unit=>labUnitKey(unit)===key);
}

export type PsaSourceFamilyIdentity={
 analyteFamily:'prostate-specific-antigen';name:'Prostate-specific antigen (PSA)';
 confirmedMarkerId:null;assaySubtype:'unspecified'|'total'|'free'|'ratio'|'conflicting';status:string;
};
/** Read-only family recognition. Value, units, demographics and prevalence never
 * choose a total/free fraction or authorize a canonical numeric trend. */
export function labSourceAnalyteFamily(label:string,method?:string):PsaSourceFamilyIdentity|null{
 const key=nameKey(label);
 let assaySubtype:PsaSourceFamilyIdentity['assaySubtype'];
 if(['psa','prostatespecificantigen','prostatespecificantigenpsa','psaprostatespecificantigen'].includes(key))assaySubtype='unspecified';
 else if(additionalLabMarkers.some(marker=>marker.id==='psa_total'&&[marker.id,marker.name,...marker.aliases].some(alias=>nameKey(alias)===key)))assaySubtype='total';
 else if(['psaratio','freetotalpsa','freetototalpsa','psafreetotalratio','psafreetototalratio','percentfreepsa','percentagefreepsa','freetotalpsaratio','freetototalpsaratio','freepsatotalpsaratio','freepsatototalpsaratio','prostatespecificantigenratio','prostatespecificantigenfreetotalratio','prostatespecificantigenfreetototalratio','psafreetotal','psafreetototal'].includes(key)||(['freepsa','psafree'].includes(key)&&label.includes('%')))assaySubtype='ratio';
 else if(['freepsa','psafree','fpsa','freeprostatespecificantigen','prostatespecificantigenfree'].includes(key))assaySubtype='free';
 else return null;
 const methodText=(method||'').toLowerCase();
 if(assaySubtype==='total'&&/\bfree[\s-]+(?:psa|prostate)|\bpsa[\s-]+free\b|\bfpsa\b|\bfreepsa\b|\b(?:psa[\s-]+ratio|free[\s/-]+to[\s/-]+total)\b/.test(methodText)||assaySubtype==='free'&&/\btotal[\s-]+(?:psa|prostate)|\bpsa[\s-]+total\b/.test(methodText))assaySubtype='conflicting';
 const status=assaySubtype==='unspecified'?'Total/free assay type not confirmed':assaySubtype==='conflicting'?'Assay type conflicts in the source details':assaySubtype==='total'?'Total PSA reported; assay details need review':assaySubtype==='free'?'Free PSA reported; kept separate from total PSA':'PSA ratio reported; kept separate from total PSA';
 return{analyteFamily:'prostate-specific-antigen',name:'Prostate-specific antigen (PSA)',confirmedMarkerId:null,assaySubtype,status};
}
