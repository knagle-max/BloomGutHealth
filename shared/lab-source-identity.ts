import {additionalLabMarkers,type AdditionalLabMarkerId} from './additional-lab-markers';
const nameKey=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
export function labUnitKey(raw:string){return raw.replace(/¹²/g,'^12').replace(/⁹/g,'^9').replace(/⁶/g,'^6').replace(/³/g,'^3').normalize('NFKC').replace(/[µμ]/g,'u').toLowerCase().replace(/\s/g,'').replace(/^[x×]/,'').replace(/10\*/g,'10^').replace(/mcg/g,'ug');}
export function additionalLabSourceIdentity(label:string,unit:string|undefined):{id?:AdditionalLabMarkerId;ambiguous?:string}{
 const key=nameKey(label),unitKey=labUnitKey(unit||'');
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
