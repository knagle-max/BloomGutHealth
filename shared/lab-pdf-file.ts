/** Local text extraction only. Output must enter the ordinary editable source review. */
export const LAB_PDF_BYTE_LIMIT = 5 * 1024 * 1024;
export const LAB_PDF_PAGE_LIMIT = 5;
export const LAB_PDF_TEXT_LIMIT = 30000;
type Failure = 'file' | 'size' | 'pages' | 'text' | 'empty' | 'cancelled' | 'timeout' | 'unreadable';
const messages: Record<Failure,string> = {
 file:'Choose a PDF report. Your current source draft was retained.',
 size:'Choose a nonempty PDF up to 5 MB. Split larger reports before loading.',
 pages:'Use a PDF of up to 5 pages. Split larger reports before loading.',
 text:'The PDF contains too much text. Use a shorter export, up to 30,000 characters.',
 empty:'No readable text was found. Scanned reports and images need manual entry or a CSV/TXT export.',
 cancelled:'PDF reading was cancelled. Your current source draft was retained.',
 timeout:'PDF reading took too long. Try a smaller text report or enter results manually.',
 unreadable:'This PDF could not be read. Use an unprotected text PDF, a CSV/TXT export or manual entry. Your current source draft was retained.',
};
export class LabPdfError extends Error { constructor(readonly code: Failure) { super(messages[code]); } }
export type LabPdfFile = {name:string;size:number;arrayBuffer():Promise<ArrayBuffer>};
export type LabPdfExtractor = (bytes:Uint8Array,signal:AbortSignal)=>Promise<{text:string;pages:number}>;
export async function readLabPdfFile(file:LabPdfFile,extract:LabPdfExtractor,signal?:AbortSignal,deadlineMs=20000) {
 if(!/\.pdf$/i.test(file.name))throw new LabPdfError('file');
 if(!Number.isSafeInteger(file.size)||file.size<1||file.size>LAB_PDF_BYTE_LIMIT)throw new LabPdfError('size');
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 let rejectStop!:(error:LabPdfError)=>void;
 const stopped=new Promise<never>((_resolve,reject)=>{rejectStop=reject;});
 const abort=(code:'cancelled'|'timeout')=>{rejectStop(new LabPdfError(code));controller.abort();};
 const parentAbort=()=>abort('cancelled');
 signal?.addEventListener('abort',parentAbort,{once:true});
 if(signal?.aborted)parentAbort();
 timer=setTimeout(()=>abort('timeout'),deadlineMs);
 try {
  return await Promise.race([stopped,(async()=>{
   if(controller.signal.aborted)throw new LabPdfError('cancelled');
   const bytes=new Uint8Array(await file.arrayBuffer());
   if(controller.signal.aborted)throw new LabPdfError('cancelled');
   if(bytes.byteLength!==file.size||bytes.byteLength>LAB_PDF_BYTE_LIMIT)throw new LabPdfError('size');
   if(Array.from(bytes.subarray(0,5),byte=>String.fromCharCode(byte)).join('')!=='%PDF-')throw new LabPdfError('unreadable');
   const result=await extract(bytes,controller.signal);
   if(controller.signal.aborted)throw new LabPdfError('cancelled');
   if(!Number.isSafeInteger(result.pages)||result.pages<1||result.pages>LAB_PDF_PAGE_LIMIT)throw new LabPdfError('pages');
   if(result.text.length>LAB_PDF_TEXT_LIMIT)throw new LabPdfError('text');
   if(!result.text.trim())throw new LabPdfError('empty');
   if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/.test(result.text))throw new LabPdfError('unreadable');
   return {name:file.name,text:result.text};
  })()]);
 }catch(error){throw error instanceof LabPdfError?error:new LabPdfError('unreadable');}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',parentAbort);controller.abort();}
}
