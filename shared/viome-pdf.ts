import {VIOME_FINDINGS_VERSION,parseViomeFindings,type ViomeFindings} from "./viome-findings";

export const VIOME_PDF_TEMPLATE_VERSION="viome-text-layout-2026-11-05.1";
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
export type ViomePdfDraft=Omit<ViomeFindings,"reviewConfirmed">;
export type ViomePdfFile={name:string;size:number;arrayBuffer():Promise<ArrayBuffer>};
export type ViomePdfExtractor=(bytes:Uint8Array,signal:AbortSignal,onPage:(page:ViomePdfPage)=>void)=>Promise<number>;
const identities=/\b(?:patient|client|customer|sample|specimen|test|kit|order|membership)\s*(?:id|number|no\b|#)|\b(?:name|dob|birth|address|email|phone|barcode|mrn)\s*[:#]|@|https?:|\d{7,}/i;
const clean=(text:string)=>text.replace(/\s+/g," ").trim();
const organismName=/^(?:[A-Z][a-z]+|[A-Z]\.) [a-z][a-z0-9.-]+(?: [A-Za-z0-9][A-Za-z0-9._()/-]*){0,8}$/;
const groups=["Bacteria","Viruses","Eukaryotes"] as const;
const assessmentCategories=["Improve","Attention","Maintain"] as const;
const foodCategories=["Enjoy","Superfood","Minimize","Avoid"] as const;

/** Volatile, page-at-a-time section parser. Never return raw page text, headers,
 * metadata, filenames or raw fingerprints. Layout/text fidelity is separately
 * tested: passing synthetic layouts is not genuine-provider certification. */
export function createViomePdfParser(){
 let pages=0,characters=0,items=0,provider=false,microbes=false,recommendations=false;
 let group:typeof groups[number]|null=null,assessment:typeof assessmentCategories[number]|null=null,food:typeof foodCategories[number]|null=null,section:"organisms"|"assessments"|"foods"|null=null;
 const draft:ViomePdfDraft={schemaVersion:VIOME_FINDINGS_VERSION,provider:"Viome",documentKind:"active-gut-microbes",specimenType:"not-supplied",method:"not-supplied",biologicalDates:{},organisms:[],assessments:[],foods:[]};
 function page(input:ViomePdfPage){
  if(input.page!==pages+1||input.page>VIOME_PDF_LIMITS.pages||!Number.isFinite(input.width)||!Number.isFinite(input.height)||input.width<100||input.height<100)throw new ViomePdfError("pages");
  pages++;items+=input.items.length;if(items>VIOME_PDF_LIMITS.items)throw new ViomePdfError("resource");
  // Geometry is transient. Three independent column rows avoid interleaving
  // wrapped organism labels with the next column's first word.
  const columns:Array<Array<{y:number;parts:ViomePdfTextItem[]}>>=[[],[],[]];
  for(const item of input.items){
   characters+=item.text.length;if(characters>VIOME_PDF_LIMITS.characters)throw new ViomePdfError("resource");
   if(![item.x,item.y,item.width,item.height].every(Number.isFinite)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/.test(item.text))throw new ViomePdfError("unreadable",input.page);
   const value=clean(item.text);if(!value)continue;
   if(/\bViome\b/i.test(value))provider=true;
   if(/My Active Gut Microbes/i.test(value))microbes=true;
   if(/Health Scores\s*(?:&|and)\s*Food Recommendations/i.test(value))recommendations=true;
   // Only explicitly labelled biological dates. DOB and document creation
   // dates never become collection/report dates.
   const date=value.match(/^(Collection(?: Date)?|Collected(?: On)?|Received(?: Date| On)?|Report(?:ed)?(?: Date| On)?):\s*(\d{4}-\d{2}-\d{2})$/i);
   if(date){const key=/collect/i.test(date[1])?"collectedOn":/receiv/i.test(date[1])?"receivedOn":"reportedOn";if(draft.biologicalDates[key]&&draft.biologicalDates[key]!==date[2])throw new ViomePdfError("ambiguous",input.page);draft.biologicalDates[key]=date[2];continue;}
   if(/^(?:Specimen type:\s*)?fecal$/i.test(value))draft.specimenType="fecal";
   if(/^qualitative RNA$/i.test(value))draft.method="qualitative RNA";
   // Header/footer text is never a biological row. This bounded adapter does
   // not render original pages or retain hidden text/metadata for source links.
   if(item.y<90||item.y>input.height-45||identities.test(value))continue;
   const column=Math.max(0,Math.min(2,Math.floor(item.x/(input.width/3))));
   let line=columns[column].find(row=>Math.abs(row.y-item.y)<3);
   if(!line){line={y:item.y,parts:[]};columns[column].push(line);}line.parts.push(item);
  }
  for(const[column,lines]of Array.from(columns.entries())){
   lines.sort((a,b)=>a.y-b.y);let row=0;
   for(const line of lines){
    const value=clean(line.parts.sort((a,b)=>a.x-b.x).map(part=>part.text).join(" "));if(!value)continue;
    if(groups.includes(value as any)){group=value as typeof groups[number];section="organisms";food=null;assessment=null;continue;}
    if(/^Health (?:Scores|Assessments)$/i.test(value)){section="assessments";food=null;group=null;continue;}
    if(/^Food Recommendations$/i.test(value)){section="foods";assessment=null;group=null;continue;}
    if(assessmentCategories.includes(value as any)){assessment=value as typeof assessmentCategories[number];section="assessments";food=null;group=null;continue;}
    if(foodCategories.includes(value as any)){food=value as typeof foodCategories[number];section="foods";assessment=null;group=null;continue;}
    if(!section||/^(?:Viome|My Active Gut Microbes|Gut Intelligence Test|Health Scores\s*(?:&|and)\s*Food Recommendations|qualitative RNA|Specimen type: fecal|Page \d+(?: of \d+)?)$/i.test(value))continue;
    if(identities.test(value))throw new ViomePdfError("ambiguous",input.page);
    const position={page:input.page,column:column+1,row:++row};
    if(section==="organisms"&&group){
     if(organismName.test(value))draft.organisms.push({name:value,reportedGroup:group,reportedStatus:"reported_present",position});
     else if(/^[A-Z][a-z]+$/.test(value))throw new ViomePdfError("ambiguous",input.page);
     else if(/^[A-Z0-9][A-Za-z0-9._/-]{1,30}$/.test(value)){
      const prior=draft.organisms.at(-1);if(!prior||prior.position.page!==input.page||prior.position.column!==column+1||prior.name.length+value.length>150)throw new ViomePdfError("ambiguous",input.page);prior.name+=" "+value;
     }else throw new ViomePdfError("ambiguous",input.page);
    }else if(section==="assessments"&&assessment){
     if(!/^[A-Za-z][A-Za-z0-9 ,&()'’/.-]{1,148}$/.test(value))throw new ViomePdfError("ambiguous",input.page);
     draft.assessments.push({name:value,reportedCategory:assessment,position});
    }else if(section==="foods"&&food){
     if(!/^[A-Za-z][A-Za-z0-9 ,&()'’/.-]{1,148}$/.test(value))throw new ViomePdfError("ambiguous",input.page);
     draft.foods.push({name:value,reportedCategory:food,position});
    }else throw new ViomePdfError("ambiguous",input.page);
   }
  }
 }
 function finish():ViomePdfDraft{
  if(!characters)throw new ViomePdfError("empty");
  if(!provider||microbes===recommendations)throw new ViomePdfError("template");
  draft.documentKind=microbes?"active-gut-microbes":"health-scores-foods";
  try{const checked=parseViomeFindings({...draft,reviewConfirmed:true});const{reviewConfirmed:_review,...result}=checked;return result;}catch{throw new ViomePdfError("ambiguous");}
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
