"use strict";
// Prototype-only release data. Authoritative published milestones must come from verified canonical release metadata.
const PUBLISHED_RELEASES = Object.freeze([]);
// Explicitly fictional demonstration, deliberately opt-in; minors advance elements, patches retain the previous identity.
const DEMO_RELEASES = Object.freeze([
  { atomicNumber:1, version:"1.0.0", publishedAt:null, highlights:["Illustrative first major-release highlight — not a product claim."] },
  { atomicNumber:2, version:"1.1.0", publishedAt:null, highlights:["Illustrative second milestone — example only."] },
  { atomicNumber:3, version:"1.2.0", publishedAt:null, highlights:["Illustrative third milestone — not shipped."] },
  { atomicNumber:4, version:"1.3.0", publishedAt:null, highlights:["Illustrative fourth milestone — not shipped."] },
]);
const data = [
['H','Hydrogen'],['He','Helium'],['Li','Lithium'],['Be','Beryllium'],['B','Boron'],['C','Carbon'],['N','Nitrogen'],['O','Oxygen'],['F','Fluorine'],['Ne','Neon'],['Na','Sodium'],['Mg','Magnesium'],['Al','Aluminium'],['Si','Silicon'],['P','Phosphorus'],['S','Sulfur'],['Cl','Chlorine'],['Ar','Argon'],['K','Potassium'],['Ca','Calcium'],['Sc','Scandium'],['Ti','Titanium'],['V','Vanadium'],['Cr','Chromium'],['Mn','Manganese'],['Fe','Iron'],['Co','Cobalt'],['Ni','Nickel'],['Cu','Copper'],['Zn','Zinc'],['Ga','Gallium'],['Ge','Germanium'],['As','Arsenic'],['Se','Selenium'],['Br','Bromine'],['Kr','Krypton'],['Rb','Rubidium'],['Sr','Strontium'],['Y','Yttrium'],['Zr','Zirconium'],['Nb','Niobium'],['Mo','Molybdenum'],['Tc','Technetium'],['Ru','Ruthenium'],['Rh','Rhodium'],['Pd','Palladium'],['Ag','Silver'],['Cd','Cadmium'],['In','Indium'],['Sn','Tin'],['Sb','Antimony'],['Te','Tellurium'],['I','Iodine'],['Xe','Xenon'],['Cs','Caesium'],['Ba','Barium'],['La','Lanthanum'],['Ce','Cerium'],['Pr','Praseodymium'],['Nd','Neodymium'],['Pm','Promethium'],['Sm','Samarium'],['Eu','Europium'],['Gd','Gadolinium'],['Tb','Terbium'],['Dy','Dysprosium'],['Ho','Holmium'],['Er','Erbium'],['Tm','Thulium'],['Yb','Ytterbium'],['Lu','Lutetium'],['Hf','Hafnium'],['Ta','Tantalum'],['W','Tungsten'],['Re','Rhenium'],['Os','Osmium'],['Ir','Iridium'],['Pt','Platinum'],['Au','Gold'],['Hg','Mercury'],['Tl','Thallium'],['Pb','Lead'],['Bi','Bismuth'],['Po','Polonium'],['At','Astatine'],['Rn','Radon'],['Fr','Francium'],['Ra','Radium'],['Ac','Actinium'],['Th','Thorium'],['Pa','Protactinium'],['U','Uranium'],['Np','Neptunium'],['Pu','Plutonium'],['Am','Americium'],['Cm','Curium'],['Bk','Berkelium'],['Cf','Californium'],['Es','Einsteinium'],['Fm','Fermium'],['Md','Mendelevium'],['No','Nobelium'],['Lr','Lawrencium'],['Rf','Rutherfordium'],['Db','Dubnium'],['Sg','Seaborgium'],['Bh','Bohrium'],['Hs','Hassium'],['Mt','Meitnerium'],['Ds','Darmstadtium'],['Rg','Roentgenium'],['Cn','Copernicium'],['Nh','Nihonium'],['Fl','Flerovium'],['Mc','Moscovium'],['Lv','Livermorium'],['Ts','Tennessine'],['Og','Oganesson'] ];
const get = id => document.getElementById(id);
const tile=get("originTile"), openButton=get("openButton"), veil=get("veil"), sheet=get("sheet"), grid=get("periodic"), closeButton=get("closeButton"), demo=get("demo"), theme=get("theme"), info=get("info");
const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastFocus=null, busy=false, pointerStart=null, ghost=null, closeTimer=null;
// Accepted 18-column main-grid convention: La/Ac represented by group-3 series markers,
// with the 15 actual lanthanide/actinide elements numbered 57-71 / 89-103 in rows 9 and 10.
function placement(n){
 if(n===1)return [1,1];if(n===2)return [1,18];
 const short=[1,2,13,14,15,16,17,18];
 if(n<=10)return [2,short[n-3]];if(n<=18)return [3,short[n-11]];
 if(n<=36)return [4,n-18];if(n<=54)return [5,n-36];
 if(n===55||n===56)return [6,n-54];if(n>=57&&n<=71)return [9,n-54];
 if(n>=72&&n<=86)return [6,n-68];if(n===87||n===88)return [7,n-86];
 if(n>=89&&n<=103)return [10,n-86];return [7,n-100];
}
function releases(){return demo.checked?DEMO_RELEASES:PUBLISHED_RELEASES}
function render(){
 grid.replaceChildren();const active=new Map(releases().map(r=>[r.atomicNumber,r]));
 get("notice").textContent=demo.checked?"DEMONSTRATION ONLY — illuminated milestones and highlights are fictional, not published.":active.size?"Only verified published milestones are illuminated.":"No publicly shipped element releases are configured. Genesis remains the pre-release identity.";
 data.forEach(([symbol,name],i)=>{
  const n=i+1,[row,col]=placement(n),r=active.get(n),el=document.createElement(r?"button":"div");
  el.className="element"+(r?" published":"");el.style.gridRow=row;el.style.gridColumn=col;el.style.setProperty("--col",col);el.title=`${n} · ${name}`;
  const number=document.createElement("span");number.className="atomic";number.textContent=n;
  const sym=document.createElement("span");sym.className="symbol";sym.textContent=symbol;
  const chemical=document.createElement("span");chemical.className="chemical";chemical.textContent=name;
  el.append(number,sym,chemical);
  if(r){el.type="button";el.setAttribute("aria-label",`${name}, ${symbol}, element ${n}; ${demo.checked?"fictional demonstration":"published"} Bloom ${r.version}. Open release details`);el.addEventListener("click",()=>select(r,name,el));}
  else {el.setAttribute("role","img");el.setAttribute("aria-label",`${name}, ${symbol}, atomic number ${n}; future Bloom release, not yet published`);el.dataset.release="future";}
  grid.append(el);
 });
 for(const [row,txt] of [[6,"57–71"],[7,"89–103"]]){const marker=document.createElement("div");marker.className="series";marker.style.gridRow=row;marker.style.gridColumn=3;marker.textContent=txt;marker.setAttribute("aria-hidden","true");grid.append(marker);}
 const heading=document.createElement("h3");heading.textContent="Every element has a place.";
 const paragraph=document.createElement("p");paragraph.textContent="Only a shipped Bloom milestone unlocks a release story. Select an illuminated element to see its verified details, or enable fictional demonstrations.";
 const caption=document.createElement("div");caption.className="info-label";caption.textContent="RELEASE HISTORY";info.replaceChildren(caption,heading,paragraph);
}
function select(release,name,el){
 grid.querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"));el.classList.add("selected");
 const cap=document.createElement("div");cap.className="info-label";cap.textContent=demo.checked?"FICTIONAL DEMONSTRATION — NOT PUBLISHED":"PUBLISHED BLOOM MILESTONE";
 const heading=document.createElement("h3");heading.textContent=`${name} · Bloom ${release.version}`;
 const parts=[cap,heading];if(release.publishedAt){const date=document.createElement("p");date.textContent=`Published ${release.publishedAt}`;parts.push(date)}
 if(release.highlights?.length){const list=document.createElement("ul");for(const s of release.highlights){const item=document.createElement("li");item.textContent=s;list.append(item)}parts.push(list)}else{let x=document.createElement("p");x.textContent="No verified public highlights supplied.";parts.push(x)}
 if(release.notesUrl&&!demo.checked){const link=document.createElement("a");link.href=release.notesUrl;link.textContent="View published release notes";link.rel="noopener noreferrer";parts.push(link)}
 info.replaceChildren(...parts);
}
function makeGhost(){const rect=tile.getBoundingClientRect();const node=tile.cloneNode(true);node.removeAttribute("id");node.removeAttribute("role");node.removeAttribute("tabindex");node.removeAttribute("aria-label");node.classList.add("transition-clone");Object.assign(node.style,{position:"fixed",left:rect.left+"px",top:rect.top+"px",width:rect.width+"px",height:rect.height+"px"});document.body.append(node);ghost=node;return node}
function animateGhost(){if(reducedMotion())return;const g=makeGhost();g.animate([{transform:"translateX(0) rotateY(0deg) translateY(0)",opacity:1},{transform:"translateX(14px) rotateY(-13deg) translateY(-12px)",opacity:1,offset:.45},{transform:"translateX(-10px) rotateY(-2deg) translateY(-4px) scale(.38)",opacity:0}],{duration:480,easing:"cubic-bezier(.2,.7,.2,1)"}).finished.finally(()=>{g.remove();if(ghost===g)ghost=null})}
function openArchive(){if(busy||!veil.hidden)return;busy=true;lastFocus=document.activeElement;render();veil.hidden=false;document.body.style.overflow="hidden";const r=tile.getBoundingClientRect();sheet.style.setProperty("--originX",`${Math.max(10,Math.min(90,(r.left+r.width/2)/innerWidth*100))}%`);sheet.style.setProperty("--originY",`${Math.max(5,Math.min(90,(r.top+r.height/2)/innerHeight*100))}%`);animateGhost();if(!reducedMotion()){sheet.classList.add("opening");window.setTimeout(()=>sheet.classList.remove("opening"),520)}closeButton.focus({preventScroll:true});busy=false}
function finalizeClose(){veil.hidden=true;sheet.classList.remove("closing","opening");document.body.style.overflow="";demo.checked=false;ghost?.remove();ghost=null;const el=lastFocus?.isConnected?lastFocus:openButton;el.focus({preventScroll:true});busy=false}
function closeArchive(){if(busy||veil.hidden)return;busy=true;if(closeTimer)clearTimeout(closeTimer);if(reducedMotion()){finalizeClose();return}sheet.classList.add("closing");closeTimer=window.setTimeout(finalizeClose,320)}
openButton.addEventListener("click",openArchive);tile.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openArchive()}});
// Horizontal swipe/drag only. Ignore short taps, vertical movement, pointer cancellation and multi-touch.
tile.addEventListener("pointerdown",e=>{if(e.button!==0||!veil.hidden||pointerStart)return;pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),cancelled:false};tile.setPointerCapture?.(e.pointerId)});
tile.addEventListener("pointermove",e=>{if(!pointerStart||pointerStart.id!==e.pointerId)return;let dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;if(Math.abs(dy)>Math.abs(dx)*1.2&&Math.abs(dy)>14){pointerStart.cancelled=true;tile.style.transform="";return}if(pointerStart.cancelled)return;tile.style.transform=`translateX(${Math.max(-22,Math.min(22,dx*.16))}px) rotateY(${Math.max(-12,Math.min(12,dx*-.11))}deg)`});
tile.addEventListener("pointerup",e=>{if(!pointerStart||e.pointerId!==pointerStart.id)return;const p=pointerStart;pointerStart=null;tile.style.transform="";const dx=e.clientX-p.x,dy=e.clientY-p.y;if(!p.cancelled&&Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.4){openArchive()}else if(Math.abs(dx)>8){get("gestureStatus").textContent="Swipe further across the tile, or use Explore Bloom’s elements."}});
tile.addEventListener("pointercancel",()=>{pointerStart=null;tile.style.transform=""});tile.addEventListener("lostpointercapture",()=>{pointerStart=null;tile.style.transform=""});
closeButton.addEventListener("click",closeArchive);veil.addEventListener("pointerdown",e=>{if(e.target===veil)closeArchive()});demo.addEventListener("change",render);theme.addEventListener("change",()=>{document.body.dataset.theme=theme.value});
document.addEventListener("keydown",e=>{if(veil.hidden)return;if(e.key==="Escape"){e.preventDefault();closeArchive();return}if(e.key!=="Tab")return;const focusables=[...sheet.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);if(!focusables.length)return;const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
render();
