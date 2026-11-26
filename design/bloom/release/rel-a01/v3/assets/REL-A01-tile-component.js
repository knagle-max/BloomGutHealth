/** REL-A01: source-data-driven, editable SVG tile. Never infer public release from npm/package version. */
export function createElementTile({atomicNumber,symbol,name,mode='everyday-light',size=160}) {
  if(!Number.isInteger(atomicNumber)||atomicNumber<1||atomicNumber>118) throw new Error('Invalid atomic number');
  if(!/^[A-Z][a-z]?$/.test(symbol)) throw new Error('Invalid element symbol');
  if(typeof name!=='string'||!name.trim()) throw new Error('Missing element name');
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 320 320');
  svg.setAttribute('width',String(size));svg.setAttribute('height',String(size));svg.setAttribute('role','img');
  svg.setAttribute('aria-label',`${name}, atomic number ${atomicNumber}, symbol ${symbol}`);
  const palettes={
    'everyday-light':['#052F21','#A7BE94','#FAF3E5'],
    'everyday-dark':['#123D2E','#A7BE94','#FAF3E5'],
    'athlete-light':['#182B45','#89ACCE','#F1F6FF'],
    'athlete-dark':['#12263D','#89ACCE','#F1F6FF']};
  const [bg,line,ink]=palettes[mode]||palettes['everyday-light'];
  const el=(tag,props,text)=>{let e=document.createElementNS(ns,tag);for(let [k,v] of Object.entries(props))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;svg.append(e)};
  el('rect',{x:2.5,y:2.5,width:315,height:315,rx:29,fill:bg,stroke:line,'stroke-width':5});
  el('text',{x:27,y:69,fill:ink,'font-family':"'Newsreader',Georgia,serif",'font-size':51},String(atomicNumber));
  el('text',{x:160,y:216,fill:ink,'font-family':"'Newsreader',Georgia,serif",'font-size':symbol.length===1?213:158,'text-anchor':'middle'},symbol);
  el('text',{x:160,y:277,fill:ink,'font-family':"'Plus Jakarta Sans',Inter,system-ui,sans-serif",'font-size':name.length>10?25:29,'font-weight':500,'text-anchor':'middle'},name);
  return svg;
}
