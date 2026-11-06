import type {ViomePdfPage} from '../../shared/viome-pdf';
export const VIOME_PDF_CANARY='FICTIONAL_PRIVATE_CANARY_829174';
export function syntheticViomePages(kind:'organisms'|'recommendations'):ViomePdfPage[]{
 const count=kind==='organisms'?7:13;
 const pages=Array.from({length:count},(_,i)=>({page:i+1,width:612,height:792,items:[
  {text:'Viome',x:30,y:20,width:60,height:10},
  {text:kind==='organisms'?'My Active Gut Microbes':'Health Scores & Food Recommendations',x:30,y:35,width:450,height:10},
  {text:'Name: '+VIOME_PDF_CANARY,x:30,y:50,width:450,height:10},
  {text:'DOB: 1900-01-01',x:30,y:65,width:150,height:10},
  {text:'Client ID: '+VIOME_PDF_CANARY,x:30,y:760,width:400,height:10},
 ]}));
 pages[0].items.push({text:'Collected: 2026-09-01',x:30,y:78,width:160,height:10});
 const add=(page:number,column:number,text:string,y:number)=>pages[page-1].items.push({text,x:column*204+12,y,width:170,height:10});
 if(kind==='organisms'){
  for(let i=0;i<94;i++){const p=Math.floor(i/15)+1,c=Math.floor(i%15/5),r=i%5;
   const group=i<82?'Bacteria':i<89?'Viruses':'Eukaryotes';
   add(p,c,group,100+r*80);add(p,c,`Syntheticus ${i<82?'bacterium':i<89?'phage':'eukaryote'} FIX-${i}`,120+r*80);
  }
 }else{
  for(let i=0;i<22;i++){const p=Math.floor(i/6)+2,r=i%6;add(p,0,i<15?'Improve':i<19?'Attention':'Maintain',100+r*60);add(p,0,`Synthetic assessment ${i}`,120+r*60);}
  for(let i=0;i<299;i++){const p=Math.floor(i/60)+9,c=Math.floor(i%60/20),r=i%20;add(p,c,i<240?'Enjoy':i<268?'Superfood':i<290?'Minimize':'Avoid',100+r*28);add(p,c,`Synthetic food ${i}`,112+r*28);}
 }
 return pages;
}
/** Small native text PDF fixture, no real patient/report bytes. Invisible header
 * and metadata canaries exercise the actual PDF.js path as well as the parser. */
export function syntheticViomePdf(kind:'organisms'|'recommendations',sourcePages?:ViomePdfPage[],rotation=0){
 const pages=sourcePages||syntheticViomePages(kind),objects:string[]=[];
 const escape=(text:string)=>text.replace(/([\\()])/g,'\\$1');
 objects.push('<< /Type /Catalog /Pages 2 0 R >>');
 objects.push(`<< /Type /Pages /Kids [${pages.map((_,i)=>`${4+i*2} 0 R`).join(' ')}] /Count ${pages.length} >>`);
 objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
 for(const page of pages){const content=page.items.map(item=>`BT /F1 9 Tf 1 0 0 1 ${item.x} ${page.height-item.y} Tm (${escape(item.text)}) Tj ET`).join('\n')+`\nBT /F1 9 Tf 3 Tr 1 0 0 1 20 775 Tm (Name: ${VIOME_PDF_CANARY}) Tj ET`;
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Rotate ${rotation} /Resources << /Font << /F1 3 0 R >> >> /Contents ${objects.length+2} 0 R >>`);
  objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
 }
 objects.push(`<< /Author (${VIOME_PDF_CANARY}) /Title (${VIOME_PDF_CANARY}.pdf) >>`);
 let pdf='%PDF-1.4\n',offsets=[0];for(const[i,obj]of objects.entries()){offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;}
 const start=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('');
 pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${start}\n%%EOF\n`;
 return new TextEncoder().encode(pdf);
}
