import {getDocument,PDFWorker} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {LabPdfError,LAB_PDF_PAGE_LIMIT,LAB_PDF_TEXT_LIMIT,type LabPdfExtractor} from '@shared/lab-pdf-file';
/** Dedicated local worker; never render, execute PDF actions, fetch a document URL or fall back to main-thread parsing. */
export const extractLabPdfText:LabPdfExtractor=async(bytes,signal)=>{
 if(signal.aborted)throw new LabPdfError('cancelled');
 const nativeWorker=new Worker(workerUrl,{type:'module'});
 let worker:PDFWorker|undefined,task:ReturnType<typeof getDocument>|undefined,closed=false;
 const stop=()=>{if(closed)return;closed=true;void task?.destroy().catch(()=>{});try{worker?.destroy();}finally{nativeWorker.terminate();}};
 let rejectFailure!:(error:LabPdfError)=>void;
 const failedReading=new Promise<never>((_resolve,reject)=>{rejectFailure=reject;});
 const failed=()=>{rejectFailure(new LabPdfError('unreadable'));stop();};
 signal.addEventListener('abort',stop,{once:true});nativeWorker.addEventListener('error',failed,{once:true});
 try{
  worker=PDFWorker.create({port:nativeWorker,verbosity:0});
  task=getDocument({data:bytes,worker,verbosity:0,stopAtErrors:true,disableFontFace:true,useSystemFonts:false,useWorkerFetch:false,maxImageSize:0,isOffscreenCanvasSupported:false,isImageDecoderSupported:false});
  task.onPassword=failed;
  const pdf=await Promise.race([task.promise,failedReading]);
  if(pdf.numPages>LAB_PDF_PAGE_LIMIT)throw new LabPdfError('pages');
  let text='';
  const append=(value:string)=>{if(text.length+value.length>LAB_PDF_TEXT_LIMIT)throw new LabPdfError('text');text+=value;};
  for(let index=1;index<=pdf.numPages;index++){
   if(signal.aborted)throw new LabPdfError('cancelled');
   const page=await pdf.getPage(index),reader=page.streamTextContent({disableNormalization:true}).getReader();
   try{
    while(true){
     const{value,done}=await reader.read();if(done)break;
     if(signal.aborted)throw new LabPdfError('cancelled');
     for(const item of value.items){if(typeof item.str==='string')append(item.str+(item.hasEOL?'\n':' '));}
    }
   }finally{void reader.cancel().catch(()=>{});reader.releaseLock();page.cleanup();}
   if(index<pdf.numPages)append('\n');
  }
  return {text,pages:pdf.numPages};
 }finally{signal.removeEventListener('abort',stop);nativeWorker.removeEventListener('error',failed);stop();}
};
