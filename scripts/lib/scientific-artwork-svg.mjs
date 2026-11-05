import {DOMParser} from '@xmldom/xmldom';
/** Namespace-aware, passive subset for original Bloom illustration files.
 * This verifies delivery safety, never morphology, rights or scientific accuracy. */
export function assertScientificArtworkSvg(source){
 const fail=()=>{throw Error('Scientific illustration is outside the passive SVG subset');};
 if(typeof source!=='string'||source.length>100000||/[&]|<!|<\?/.test(source))fail();
 let invalid=false;const doc=new DOMParser({onError:()=>{invalid=true;}}).parseFromString(source,'image/svg+xml');
 if(invalid||!doc?.documentElement||doc.documentElement.localName!=='svg')fail();
 const tags=new Set(['svg','defs','g','rect','circle','ellipse','path','line','polyline','polygon','text','title','desc','radialGradient','linearGradient','stop']);
 const numeric=new Set(['viewBox','width','height','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','stroke-width','font-size','opacity','stop-opacity','offset']);
 const ids=new Map(),references=[];
 function visit(node){
  if(node.nodeType===3){if(node.nodeValue.trim()&&!['text','title','desc'].includes(node.parentNode?.localName))fail();return;}
  if(node.nodeType!==1)fail();
  if(node.namespaceURI!=='http://www.w3.org/2000/svg'||node.prefix||!tags.has(node.localName)||node!==doc.documentElement&&node.localName==='svg')fail();
  for(let i=0;i<node.attributes.length;i++){
   const attr=node.attributes.item(i),name=attr.name,value=attr.value;
   if(name==='xmlns'){if(node!==doc.documentElement||value!=='http://www.w3.org/2000/svg')fail();continue;}
   if(attr.namespaceURI||attr.prefix)fail();
   if(numeric.has(name)){if(!/^[0-9eE+.,\s-]+$/.test(value))fail();}
   else if(['fill','stroke','stop-color'].includes(name)){
    if(/^url\(#[a-z][a-z0-9_-]*\)$/i.test(value)){if(name==='stop-color')fail();references.push(value.slice(5,-1));}
    else if(!/^(?:none|currentColor|#[a-f0-9]{3}|#[a-f0-9]{6}|#[a-f0-9]{8})$/i.test(value))fail();
   }else if(name==='id'){if(!/^[a-z][a-z0-9_-]{0,50}$/i.test(value)||ids.has(value))fail();ids.set(value,node.localName);}
   else if(name==='role'){if(value!=='img')fail();}
   else if(name==='aria-label'){if(value.length>1000)fail();}
   else if(name==='font-family'){if(!['Georgia,serif','Arial,sans-serif'].includes(value))fail();}
   else if(name==='stroke-linecap'){if(!['butt','round','square'].includes(value))fail();}
   else if(name==='d'){if(!/^[MmZzLlHhVvCcSsQqTtAa0-9eE+.,\s-]+$/.test(value))fail();}
   else if(name==='points'){if(!/^[0-9eE+.,\s-]+$/.test(value))fail();}
   else if(name==='transform'){if(!value||value.replace(/(?:translate|rotate|scale|matrix)\([0-9eE+.,\s-]+\)/g,'').trim())fail();}
   else fail();
  }
  for(let child=node.firstChild;child;child=child.nextSibling)visit(child);
 }
 for(let child=doc.firstChild;child;child=child.nextSibling){if(child===doc.documentElement)visit(child);else if(child.nodeType!==3||child.nodeValue.trim())fail();}
 if(references.some(id=>!['linearGradient','radialGradient'].includes(ids.get(id))))fail();return true;
}
