import {VIOME_FINDINGS_VERSION,parseViomeFindings,type ViomeFindings} from "./viome-findings";

export const VIOME_PDF_TEMPLATE_VERSION="viome-coordinate-layout-2026-11-06.2";
export const VIOME_PDF_LIMITS={bytes:8*1024*1024,pages:20,characters:180000,items:40000,deadlineMs:30000} as const;
type Failure="file"|"size"|"pages"|"resource"|"empty"|"template"|"ambiguous"|"unreadable"|"cancelled"|"timeout";
const messages:Record<Failure,string>={
 file:"Choose a text-based Viome PDF.",size:"Choose a nonempty PDF up to 8 MB.",pages:"Choose a report of up to 20 pages.",resource:"This report exceeds the local reader limits. No findings were saved.",
 empty:"No readable text was found. Scanned PDFs are not supported by this reader. No findings were saved.",
 template:"This PDF layout is not supported. No findings were saved. Check that it is a text-based Viome report.",
 ambiguous:"Some report rows could not be separated safely. No findings were saved. Try a clearer text-based report.",
 unreadable:"This PDF could not be read. Choose an unprotected text-based report. No findings were saved.",
 cancelled:"PDF reading cancelled. No findings were saved.",timeout:"PDF reading took too long. No findings were saved.",
};
export class ViomePdfError extends Error{constructor(readonly code:Failure,readonly page?:number){super(messages[code]+(page?` Check page ${page}.`:""));}}
export type ViomePdfTextItem={text:string;x:number;y:number;width:number;height:number};
export type ViomePdfPage={page:number;width:number;height:number;items:ViomePdfTextItem[]};
export type ViomePdfIssue={kind:"organisms"|"assessments"|"foods";position:{page:number;column:number;row:number};reason:"row_not_separated"};
export type ViomePdfDraft=Omit<ViomeFindings,"reviewConfirmed">&{extraction?:{status:"PARTIAL_REVIEW_REQUIRED";issues:ViomePdfIssue[]}};
export type ViomePdfFile={name:string;size:number;arrayBuffer():Promise<ArrayBuffer>};
export type ViomePdfExtractor=(bytes:Uint8Array,signal:AbortSignal,onPage:(page:ViomePdfPage)=>void)=>Promise<number>;
const identities=/\b(?:patient|client|customer|sample|specimen|test|kit|order|membership)\s*(?:id|number|no\b|#)|\b(?:name|dob|birth|address|email|phone|barcode|mrn)\s*[:#]|@|https?:|\d{7,}/i;
const clean=(text:string)=>text.replace(/\s+/g," ").trim();
const organismName=/^(?:\[?[A-Z][a-z]+\]?|[A-Z]\.) [a-z][a-z0-9._-]+(?: (?:[A-Za-z0-9][A-Za-z0-9._()/-]*|=)){0,10}$/;
const groups=["Bacteria","Viruses","Eukaryotes"] as const;
const assessmentCategories=["Improve","Attention","Maintain"] as const;
const foodCategories=["Enjoy","Superfood","Minimize","Avoid"] as const;

/** Only allowlisted findings leave this volatile page-at-a-time reader. Uncertain
 * positions contain no unrecognized source text and must be resolved in review. */
export function createViomePdfParser(){
 let pages=0,characters=0,items=0,provider=false,microbes=false,recommendations=false;
 let section:"organisms"|"assessments"|"foods"|null=null,bodyFont=0;
 const issues:ViomePdfIssue[]=[];
 const draft:Omit<ViomeFindings,"reviewConfirmed">={schemaVersion:VIOME_FINDINGS_VERSION,provider:"Viome",documentKind:"active-gut-microbes",specimenType:"not-supplied",method:"not-supplied",biologicalDates:{},organisms:[],assessments:[],foods:[]};
 const groupMap:Record<string,typeof groups[number]>={Bacterium:"Bacteria",Bacteria:"Bacteria",Virus:"Viruses",Viruses:"Viruses",Eukaryote:"Eukaryotes",Eukaryotes:"Eukaryotes"};
 const label=(v:string)=>v.length<=150&&/^[A-Z][A-Za-z0-9 ,&()'’/._+–-]*$/.test(v)&&!identities.test(v)&&!/[.!?:]$/.test(v);
 const append=(left:string,right:string)=>left.endsWith("-")?left+right:clean(left+" "+right);
 function page(input:ViomePdfPage){
  if(input.page!==pages+1||input.page>VIOME_PDF_LIMITS.pages||!Number.isFinite(input.width)||!Number.isFinite(input.height)||input.width<100||input.height<100)throw new ViomePdfError("pages");
  pages++;items+=input.items.length;if(items>VIOME_PDF_LIMITS.items)throw new ViomePdfError("resource");
  const parts:ViomePdfTextItem[]=[];
  for(const item of input.items){
   characters+=item.text.length;if(characters>VIOME_PDF_LIMITS.characters)throw new ViomePdfError("resource");
   if(![item.x,item.y,item.width,item.height].every(Number.isFinite)||item.width<0||item.height<0||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/.test(item.text))throw new ViomePdfError("unreadable",input.page);
   const value=clean(item.text);if(!value)continue;
   if(/\bViome\b/i.test(value))provider=true;
   if(/My Active Gut Microbes/i.test(value))microbes=true;
   if(/Health Scores\s*(?:&|and)\s*Food Recommendations/i.test(value))recommendations=true;
   const date=value.match(/^(Collection(?: Date)?|Collected(?: On)?|Received(?: Date| On)?|Report(?:ed)?(?: Date| On)?):\s*(\d{4}-\d{2}-\d{2})$/i);
   if(date){const key=/collect/i.test(date[1])?"collectedOn":/receiv/i.test(date[1])?"receivedOn":"reportedOn";if(draft.biologicalDates[key]&&draft.biologicalDates[key]!==date[2])throw new ViomePdfError("ambiguous",input.page);draft.biologicalDates[key]=date[2];continue;}
   if(/^(?:Specimen type:\s*)?fecal$/i.test(value))draft.specimenType="fecal";
   if(/^qualitative RNA$/i.test(value))draft.method="qualitative RNA";
   if((item.y<40&&!/^My Active Gut Microbes$/i.test(value))||item.y>input.height-55||identities.test(value))continue;
   // Reconstructed PDFs can encode several visual columns in one text item.
   // Explicit spacing separates cells; interpolation orders cells only, never
   // assigns a fixed fraction of the page to a biological column.
   for(const match of Array.from(item.text.trimEnd().matchAll(/\S(?:.*?\S)?(?=\s{2,}|$)/g))){
    const text=clean(match[0]),offset=match.index??0,scale=item.text.length?item.width/item.text.length:0;
    parts.push({...item,text,x:item.x+offset*scale,width:match[0].length*scale});
   }
  }
  const lines:Array<{y:number;height:number;parts:ViomePdfTextItem[]}>=[];
  for(const part of parts.sort((a,b)=>a.y-b.y||a.x-b.x)){
   const last=lines.at(-1),line=last&&Math.abs(last.y-part.y)<=Math.max(1,Math.min(last.height,part.height)*.28)?last:undefined;
   if(line){line.parts.push(part);line.height=Math.max(line.height,part.height);}else lines.push({y:part.y,height:Math.max(1,part.height),parts:[part]});
  }
  const join=(entries:ViomePdfTextItem[])=>{let result="",end=0;for(const p of entries.sort((a,b)=>a.x-b.x)){result+=(result&&p.x-end>p.height*.12?" ":"")+p.text;end=p.x+p.width;}return clean(result);};
  // Repeated class labels identify actual organism column anchors, including
  // uneven widths. Glossary labels cannot create data before the table heading.
  const anchors:number[]=[];
  for(const p of parts.filter(p=>groupMap[p.text]).sort((a,b)=>a.x-b.x))if(!anchors.some(x=>Math.abs(x-p.x)<Math.max(3,p.height)))anchors.push(p.x);
  if(anchors.length>3)throw new ViomePdfError("ambiguous",input.page);
  const categoryAnchors:number[]=[];for(const p of parts.filter(p=>[...assessmentCategories,...foodCategories].includes(p.text as any)).sort((a,b)=>a.x-b.x))if(!categoryAnchors.some(x=>Math.abs(x-p.x)<Math.max(3,p.height)))categoryAnchors.push(p.x);
  if(!anchors.length&&categoryAnchors.length<=3)anchors.push(...categoryAnchors);
  const columnFor=(x:number)=>anchors.length?anchors.reduce((best,v,i)=>Math.abs(x-v)<Math.abs(x-anchors[best])?i:best,0):0;
  const counters=[0,0,0],pending=new Map<number,{name:string;height:number;y:number;lines:number;position:{page:number;column:number;row:number}}>(),fallback=new Map<number,string>();
  const position=(column:number)=>({page:input.page,column:column+1,row:++counters[column]});
  const uncertain=(kind:ViomePdfIssue["kind"],pos:ViomePdfIssue["position"])=>{if(issues.length>=100)throw new ViomePdfError("ambiguous",input.page);issues.push({kind,position:pos,reason:"row_not_separated"});};
  const flush=(col:number)=>{const p=pending.get(col);if(!p)return;const g=fallback.get(col);if(g&&groupMap[g]&&organismName.test(p.name))draft.organisms.push({name:p.name,reportedGroup:groupMap[g],reportedStatus:"reported_present",position:p.position});else uncertain("organisms",p.position);pending.delete(col);};
  for(const line of lines){
   line.parts.sort((a,b)=>a.x-b.x);const value=join([...line.parts]);
   if(/^My Active Gut Microbes$/i.test(value)){for(const col of Array.from(pending.keys()))flush(col);section="organisms";fallback.clear();continue;}
   if(/^Health (?:Scores|Assessments)$/i.test(value)){section="assessments";fallback.clear();continue;}
   if(/^(?:My Foods|Food Recommendations)$/i.test(value)){section="foods";fallback.clear();continue;}
   if(/^(?:Viome|Health Results|Gut Intelligence Test|Health Scores\s*(?:&|and)\s*Food Recommendations|qualitative RNA|Specimen type: fecal|Page \d+(?: of \d+)?)$/i.test(value))continue;
   if(recommendations&&line.parts.every(p=>assessmentCategories.includes(p.text as any))&&line.parts.length===1&&section!=="assessments"){section="assessments";fallback.clear();}
   if(recommendations&&line.parts.every(p=>foodCategories.includes(p.text as any))&&line.parts.length<=3&&section!=="foods"){section="foods";fallback.clear();}
   if(!section)continue;
   if(section==="organisms"&&bodyFont&&line.height>bodyFont*1.4){for(const col of Array.from(pending.keys()))flush(col);section=null;fallback.clear();continue;}
   if(section==="organisms"){
    const columns=new Map<number,ViomePdfTextItem[]>();for(const p of line.parts){const c=columnFor(p.x);columns.set(c,[...(columns.get(c)||[]),p]);}
    for(const[col,entries]of Array.from(columns)){const text=join(entries),p=pending.get(col);
     const inlineClass=entries.at(-1);if(entries.length>1&&inlineClass&&groupMap[inlineClass.text]){flush(col);const name=join(entries.slice(0,-1)),pos=position(col);if(organismName.test(name))draft.organisms.push({name,reportedGroup:groupMap[inlineClass.text],reportedStatus:"reported_present",position:pos});else uncertain("organisms",pos);continue;}
     if(groupMap[text]){
      bodyFont=Math.max(bodyFont,line.height);
      if(groups.includes(text as any)){flush(col);fallback.set(col,text);continue;}
      if(p){if(organismName.test(p.name))draft.organisms.push({name:p.name,reportedGroup:groupMap[text],reportedStatus:"reported_present",position:p.position});else uncertain("organisms",p.position);pending.delete(col);}
      // Only plural category-first headings can classify subsequent rows.
      if(groups.includes(text as any))fallback.set(col,text);continue;
     }
     if(p&&line.y-p.y<=Math.max(p.height,line.height)*1.8){if(p.lines>=2){uncertain("organisms",p.position);pending.delete(col);}else{p.name=append(p.name,text);p.y=line.y;p.lines++;}continue;}
     if(organismName.test(text)||/^[A-Z][a-z]+$/.test(text)){
      flush(col);pending.set(col,{name:text,height:line.height,y:line.y,lines:1,position:position(col)});
     }else if(p||fallback.has(col)){flush(col);uncertain("organisms",position(col));}
    }
   }else{
    const categories=section==="foods"?foodCategories:assessmentCategories;
    const kind=section;
    // Adjacent name/category cells may be separate items or a single text run.
    const isCategory=(part:ViomePdfTextItem,index:number)=>categories.includes(part.text as never)&&(line.parts.every(p=>categories.includes(p.text as never))||index>0&&part.x-line.parts[index-1].x-line.parts[index-1].width>=Math.min(part.height,line.parts[index-1].height)*.65&&(index===line.parts.length-1||line.parts[index+1].x-part.x-part.width>=Math.min(part.height,line.parts[index+1].height)*.65));
    const cells=line.parts.map(p=>p.text);
    const categoryCount=line.parts.filter(isCategory).length;
    if(categoryCount){
     if(cells.every(c=>categories.includes(c as never))){if(cells.length===1||kind==="foods"&&cells.length<=3&&anchors.length===cells.length)line.parts.forEach(p=>fallback.set(columnFor(p.x),p.text));continue;}
     let name:ViomePdfTextItem[]=[],column=0;
     for(const[partIndex,part]of Array.from(line.parts.entries())){
      const cell=part.text;if(!isCategory(part,partIndex)){name.push(part);continue;}
      const groups:ViomePdfTextItem[][]=[];for(const entry of name){const prior=groups.at(-1)?.at(-1);if(!prior||entry.x-prior.x-prior.width>Math.max(entry.height,prior.height)*2.5)groups.push([entry]);else groups.at(-1)!.push(entry);}
      if(groups.length>1){for(const _group of groups){if(column>2)throw new ViomePdfError("ambiguous",input.page);uncertain(kind,position(column++));}name=[];continue;}
      const text=join(name);name=[];
      if(column>2)throw new ViomePdfError("ambiguous",input.page);
      const pos=position(column++);
      if(!label(text)){uncertain(kind,pos);continue;}
      if(kind==="foods")draft.foods.push({name:text,reportedCategory:cell as typeof foodCategories[number],position:pos});else draft.assessments.push({name:text,reportedCategory:cell as typeof assessmentCategories[number],position:pos});
     }
     if(name.length)uncertain(kind,position(Math.min(column,2)));
    }else if(fallback.size){
     const columns=new Map<number,ViomePdfTextItem[]>();for(const part of line.parts){const c=columnFor(part.x);columns.set(c,[...(columns.get(c)||[]),part]);}
     for(const[column,entries]of Array.from(columns)){const category=fallback.get(column),name=join(entries);if(category){const pos=position(column);if(!label(name)){uncertain(kind,pos);continue;}if(kind==="foods")draft.foods.push({name,reportedCategory:category as typeof foodCategories[number],position:pos});else draft.assessments.push({name,reportedCategory:category as typeof assessmentCategories[number],position:pos});}}
    }
   }
  }
  for(const col of Array.from(pending.keys()))flush(col);
 }
 function finish():ViomePdfDraft{
  if(!characters)throw new ViomePdfError("empty");
  if(!provider||microbes===recommendations)throw new ViomePdfError("template");
  draft.documentKind=microbes?"active-gut-microbes":"health-scores-foods";
  // Preserve the established page/column/row traversal for source consumers.
  for(const rows of[draft.organisms,draft.assessments,draft.foods])rows.sort((a,b)=>a.position.page-b.position.page||a.position.column-b.position.column||a.position.row-b.position.row);
  try{const checked=parseViomeFindings({...draft,reviewConfirmed:true});const{reviewConfirmed:_review,...result}=checked;return {...result,...(issues.length?{extraction:{status:"PARTIAL_REVIEW_REQUIRED" as const,issues}}:{})};}catch{throw new ViomePdfError("ambiguous");}
 }
 return{page,finish};
}

export async function readViomePdf(file:ViomePdfFile,extract:ViomePdfExtractor,signal?:AbortSignal,deadlineMs:number=VIOME_PDF_LIMITS.deadlineMs):Promise<ViomePdfDraft>{
 if(!/\.pdf$/i.test(file.name))throw new ViomePdfError("file");
 if(!Number.isSafeInteger(file.size)||file.size<1||file.size>VIOME_PDF_LIMITS.bytes)throw new ViomePdfError("size");
 const controller=new AbortController();let bytes:Uint8Array|undefined,timer:ReturnType<typeof setTimeout>|undefined;
 let rejectStop!:(error:ViomePdfError)=>void;
 const stopped=new Promise<never>((_resolve,reject)=>{rejectStop=reject;});
 const stop=(code:"cancelled"|"timeout")=>{rejectStop(new ViomePdfError(code));controller.abort();};
 const abort=()=>stop("cancelled");signal?.addEventListener("abort",abort,{once:true});if(signal?.aborted)abort();timer=setTimeout(()=>stop("timeout"),deadlineMs);
 try{return await Promise.race([stopped,(async()=>{
  if(controller.signal.aborted)throw new ViomePdfError("cancelled");
  bytes=new Uint8Array(await file.arrayBuffer());
  if(controller.signal.aborted){bytes.fill(0);throw new ViomePdfError("cancelled");}
  if(bytes.length!==file.size||bytes.length>VIOME_PDF_LIMITS.bytes)throw new ViomePdfError("size");
  if(new TextDecoder().decode(bytes.subarray(0,5))!=="%PDF-")throw new ViomePdfError("unreadable");
  const parser=createViomePdfParser();let visited=0;
  const pages=await extract(bytes,controller.signal,page=>{if(controller.signal.aborted)throw new ViomePdfError("cancelled");parser.page(page);visited++;});
  if(controller.signal.aborted)throw new ViomePdfError("cancelled");
  if(!Number.isSafeInteger(pages)||pages<1||pages>VIOME_PDF_LIMITS.pages||visited!==pages)throw new ViomePdfError("pages");
  return parser.finish();
 })()]);}catch(error){throw error instanceof ViomePdfError?error:new ViomePdfError("unreadable");}
 finally{clearTimeout(timer);signal?.removeEventListener("abort",abort);controller.abort();try{bytes?.fill(0);}catch{/* PDF worker may own/detach transferred bytes. */}}
}
