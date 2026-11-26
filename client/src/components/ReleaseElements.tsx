import {useEffect,useId,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import catalogSource from '../../../design/bloom/release/ee-01/v1/periodic-elements.json';
import {BLOOM_CURRENT_RELEASE} from '@shared/product-release';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import BloomBrand from './BloomBrand';
import '@/styles/release-elements.css';

type ElementRecord={atomicNumber:number;symbol:string;name:string;period:number;group:number|null;displayRow:number;displayColumn:number;series?:string};
const elements:readonly ElementRecord[]=catalogSource.elements;
const rows=[1,2,3,4,5,6,7,8,9,10];
// Geometry and type hierarchy are the supplied REL-A01 v3 data-bound SVG.
// This branch requires an explicitly published canonical product identity;
// current Genesis never displays an element as its release tile.
function ApprovedElementTile({element}:{element:ElementRecord}){
 return <svg className="release-element-approved-tile" viewBox="0 0 320 320" role="img" aria-label={`${element.name}, atomic number ${element.atomicNumber}, symbol ${element.symbol}`}>
  <rect x="2.5" y="2.5" width="315" height="315" rx="29" strokeWidth="5"/>
  <text x="27" y="69" fontSize="51">{element.atomicNumber}</text>
  <text x="160" y="216" fontSize={element.symbol.length===1?213:158} textAnchor="middle">{element.symbol}</text>
  <text className="release-element-approved-name" x="160" y="277" fontSize={element.name.length>10?25:29} fontWeight="500" textAnchor="middle">{element.name}</text>
 </svg>;
}
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function viewportBounds(){
 const scale=Number.parseFloat(getComputedStyle(document.documentElement).zoom)||1;
 return {width:Math.min(1216,Math.max(1,innerWidth/scale-16)),height:Math.max(1,innerHeight/scale-16)};
}
/** Source catalog is chemistry metadata, never a release announcement. No
 * publication history, demo toggle, account query or analytics is installed. */
export default function ReleaseElements(){
 const currentElement=BLOOM_CURRENT_RELEASE.publicRelease?elements.find(element=>element.atomicNumber===BLOOM_CURRENT_RELEASE.atomicNumber):undefined;
 const [bounds,setBounds]=useState(viewportBounds),[portalContainer,setPortalContainer]=useState<HTMLElement|null>(null);
 const [open,setOpen]=useState(false),[tilt,setTilt]=useState(''),[origin,setOrigin]=useState({x:50,y:50});
 const entry=useRef<HTMLButtonElement>(null),fallback=useRef<HTMLButtonElement>(null),returnFocus=useRef<HTMLElement|null>(null);
 const gesture=useRef<{id:number;x:number;y:number;cancelled:boolean}|null>(null),hint=useId();
 const closePress=useRef<{x:number;y:number;cancelled:boolean}|null>(null);
 useEffect(()=>{
  if(!open)return;
  const update=()=>{const next=viewportBounds();setBounds(previous=>previous.width===next.width&&previous.height===next.height?previous:next);};
  update();window.addEventListener('resize',update);
  const observer=new ResizeObserver(update);observer.observe(document.documentElement);
  return()=>{window.removeEventListener('resize',update);observer.disconnect();};
 },[open]);
 function clearGesture(){gesture.current=null;closePress.current=null;setTilt('');}
 function reveal(opener:HTMLElement){
  returnFocus.current=opener;setPortalContainer(opener.closest<HTMLElement>('.app-shell'));
  const rect=entry.current?.getBoundingClientRect();
  if(rect)setOrigin({x:Math.max(5,Math.min(95,(rect.left+rect.width/2)/innerWidth*100)),y:Math.max(5,Math.min(95,(rect.top+rect.height/2)/innerHeight*100))});
  clearGesture();setOpen(true);
 }
 function start(event:PointerEvent<HTMLButtonElement>){
  if(event.pointerType==='touch'&&!event.isPrimary){clearGesture();return;}
  if(open||event.button!==0)return;
  if(gesture.current){clearGesture();return;}
  gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,cancelled:false};
  event.currentTarget.setPointerCapture?.(event.pointerId);
 }
 function move(event:PointerEvent<HTMLButtonElement>){
  const current=gesture.current;if(!current||current.id!==event.pointerId)return;
  const dx=event.clientX-current.x,dy=event.clientY-current.y;
  if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)*1.2){current.cancelled=true;setTilt('');return;}
  if(!current.cancelled&&!reducedMotion())setTilt(`translateX(${Math.max(-22,Math.min(22,dx*.16))}px) rotateY(${Math.max(-12,Math.min(12,-dx*.11))}deg)`);
 }
 function finish(event:PointerEvent<HTMLButtonElement>){
  const current=gesture.current;if(!current||current.id!==event.pointerId)return;
  const dx=event.clientX-current.x,dy=event.clientY-current.y;
  clearGesture();
  if(!current.cancelled&&Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.4)reveal(event.currentTarget);
 }
 return <section className="release-elements-entry" aria-label="About Bloom" data-open={open}>
  <p aria-label="About Bloom version" className="release-elements-identity">{BLOOM_CURRENT_RELEASE.label}<span>{BLOOM_CURRENT_RELEASE.descriptor}</span></p>
  <div className="release-elements-discovery">
   <button ref={entry} type="button" className="release-elements-origin" aria-label={`Explore Bloom's elements from ${currentElement?.name??'Project Genesis'}`} aria-describedby={hint} aria-haspopup="dialog" aria-expanded={open}
    style={{transform:tilt||undefined}} onDragStart={event=>event.preventDefault()} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={clearGesture} onLostPointerCapture={clearGesture}
    onClick={event=>{if(event.detail===0)reveal(event.currentTarget);}}>
    <>{currentElement?<ApprovedElementTile element={currentElement}/>:<><BloomBrand icon/><span>Project Genesis</span></>}</>
   </button>
   <div><p id={hint} className="panel-note">Swipe across the Genesis tile, drag with a mouse, or use the button to explore the elements. Genesis is not a published element release.</p><Button ref={fallback} type="button" variant="outline" className="release-elements-explore" onClick={event=>reveal(event.currentTarget)}>Explore Bloom's elements</Button></div>
  </div>
  <Dialog open={open} onOpenChange={value=>{clearGesture();setOpen(value);}}>
   <DialogContent portalContainer={portalContainer} className="release-elements-dialog w-[calc(100vw-1rem)] max-w-[76rem] max-h-[calc(100dvh-1rem)] overflow-y-auto gap-0 p-4 sm:p-8"
    style={{width:`${bounds.width}px`,maxHeight:`${bounds.height}px`,'--ee-origin-x':`${origin.x}%`,'--ee-origin-y':`${origin.y}%`} as CSSProperties}
    onPointerDownCapture={event=>{
     if(event.pointerType!=='touch')return;
     const close=event.currentTarget.querySelector(':scope > button');
     closePress.current=event.isPrimary&&(event.target as Element).closest('button')===close?{x:event.clientX,y:event.clientY,cancelled:false}:null;
    }}
    onPointerMoveCapture={event=>{const press=closePress.current;if(press&&(Math.abs(event.clientX-press.x)>8||Math.abs(event.clientY-press.y)>8))press.cancelled=true;}}
    onPointerCancelCapture={()=>{closePress.current=null;}}
    onTouchEndCapture={event=>{
     // A custom swipe can suppress the next compatibility click on mobile.
     // Activate the existing Close only for a stationary single-touch release;
     // cancel its delayed click so it cannot hit content behind the dialog.
     const press=closePress.current;closePress.current=null;
     const close=event.currentTarget.querySelector(':scope > button'),touch=event.changedTouches[0];
     if(!press||press.cancelled||event.touches.length||event.changedTouches.length!==1||!touch||(event.target as Element).closest('button')!==close||Math.abs(touch.clientX-press.x)>8||Math.abs(touch.clientY-press.y)>8)return;
     event.preventDefault();setOpen(false);
    }}
    onOpenAutoFocus={event=>{event.preventDefault();document.querySelector<HTMLButtonElement>('.release-elements-dialog button')?.focus();}}
    onCloseAutoFocus={event=>{event.preventDefault();const target=returnFocus.current?.isConnected?returnFocus.current:fallback.current;target?.focus({preventScroll:true});}}>
    <DialogHeader><p className="eyebrow">BLOOM · DISCOVERY ARCHIVE</p><DialogTitle className="release-elements-title">The elements <em>of our story.</em></DialogTitle><DialogDescription>Each element has its own place. A Bloom milestone illuminates only after that release is published. Bloom is currently Project Genesis; no public element releases have been published.</DialogDescription></DialogHeader>
    <p className="release-elements-legend"><span aria-hidden="true"/>Future elements · no published milestones yet</p>
    <p id={`${hint}-scroll`} className="panel-note">Scroll horizontally to explore all 18 groups, or use the arrow keys when the table is focused. Names, symbols and atomic numbers are chemistry reference labels. Published Bloom milestones will remain separate from this chemistry catalog.</p>
    <div className="release-elements-scroll" role="region" aria-label="Periodic table of 118 elements" aria-describedby={`${hint}-scroll`} tabIndex={0}>
     <table className="release-elements-table"><colgroup>{Array.from({length:18},(_,column)=><col key={column} style={{width:`${100/18}%`}}/>)}</colgroup><caption className="sr-only">118 chemical elements. Every element is currently a future Bloom milestone, not a published release.</caption><tbody>{rows.map(row=>{
      const cells=[];let column=1;
      while(column<=18){
       const element=elements.find(item=>item.displayRow===row&&item.displayColumn===column);
       if(element){cells.push(<td key={column} className="release-element" data-atomic-number={element.atomicNumber} aria-label={`${element.atomicNumber}, ${element.symbol}, ${element.name}. Future Bloom milestone; not published.`}><span className="release-element-number">{element.atomicNumber}</span><strong>{element.symbol}</strong><span className="release-element-name">{element.name}</span></td>);column++;continue;}
       if(column===3&&(row===6||row===7)){cells.push(<td key={column} className="release-element-series">{row===6?'57–71':'89–103'}<span className="sr-only"> displayed separately below</span></td>);column++;continue;}
       const start=column;while(column<=18&&!elements.some(item=>item.displayRow===row&&item.displayColumn===column)&&!(column===3&&(row===6||row===7)))column++;
       cells.push(<td key={start} colSpan={column-start} className="release-element-gap" aria-hidden="true"/>);
      }
      return <tr key={row} aria-hidden={row===8?true:undefined} aria-label={row===9?'Lanthanide series, period 6':row===10?'Actinide series, period 7':row<8?`Period ${row}`:undefined} className={row===8?'release-elements-spacer':undefined}>{cells}</tr>;
     })}</tbody></table>
    </div>
    <p className="panel-note release-elements-footnote">Lanthanides (57–71) and actinides (89–103) are shown in separate rows using the source design's La/Ac series placeholders. The La/Ac labels are series placeholders, not extra elements.</p>
   </DialogContent>
  </Dialog>
 </section>;
}
