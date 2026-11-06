import {getDocument,PDFWorker} from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {VIOME_PDF_LIMITS,ViomePdfError,type ViomePdfExtractor,type ViomePdfTextItem} from "@shared/viome-pdf";

/** Browser-local dedicated worker. No PDF rendering, metadata/attachment reads,
 * remote document URL, external OCR, filesystem, telemetry or raw-text result. */
export const extractViomePdf:ViomePdfExtractor=async(bytes,signal,onPage)=>{
 if(signal.aborted)throw new ViomePdfError("cancelled");
 const nativeWorker=new Worker(workerUrl,{type:"module"});
 let worker:PDFWorker|undefined,task:ReturnType<typeof getDocument>|undefined,currentReader:ReadableStreamDefaultReader<any>|undefined,closed=false;
 const close=()=>{if(closed)return;closed=true;void currentReader?.cancel().catch(()=>{});void task?.destroy().catch(()=>{});try{worker?.destroy();}finally{nativeWorker.terminate();}};
 let rejectFailure!:(error:ViomePdfError)=>void;
 const failure=new Promise<never>((_resolve,reject)=>{rejectFailure=reject;});
 const failed=()=>{rejectFailure(new ViomePdfError("unreadable"));close();};
 const aborted=()=>{rejectFailure(new ViomePdfError("cancelled"));close();};
 const guarded=<T>(promise:Promise<T>)=>Promise.race([promise,failure]);
 signal.addEventListener("abort",aborted,{once:true});nativeWorker.addEventListener("error",failed,{once:true});
 try{
  worker=PDFWorker.create({port:nativeWorker,verbosity:0});
  task=getDocument({data:bytes,worker,verbosity:0,stopAtErrors:true,enableXfa:false,disableFontFace:true,useSystemFonts:false,useWorkerFetch:false,maxImageSize:0,isOffscreenCanvasSupported:false,isImageDecoderSupported:false});task.onPassword=failed;
  const pdf=await guarded(task.promise);if(pdf.numPages>VIOME_PDF_LIMITS.pages)throw new ViomePdfError("pages");
  let characters=0,itemCount=0;
  for(let index=1;index<=pdf.numPages;index++){
   if(signal.aborted)throw new ViomePdfError("cancelled");
   const page=await guarded(pdf.getPage(index)),viewport=page.getViewport({scale:1}),reader=page.streamTextContent({disableNormalization:true}).getReader();currentReader=reader;
   const items:ViomePdfTextItem[]=[];
   try{
    while(true){
     const chunk=await guarded(reader.read());if(chunk.done)break;
     if(signal.aborted)throw new ViomePdfError("cancelled");
     for(const item of chunk.value.items){
      if(typeof item.str!=="string")continue;
      characters+=item.str.length;itemCount++;if(characters>VIOME_PDF_LIMITS.characters||itemCount>VIOME_PDF_LIMITS.items)throw new ViomePdfError("resource");
      const[x,y]=viewport.convertToViewportPoint(item.transform[4],item.transform[5]);
      items.push({text:item.str,x,y,width:item.width,height:item.height});
     }
    }
    onPage({page:index,width:viewport.width,height:viewport.height,items});
   }finally{items.length=0;void reader.cancel().catch(()=>{});reader.releaseLock();currentReader=undefined;page.cleanup();}
  }
  return pdf.numPages;
 }finally{signal.removeEventListener("abort",aborted);nativeWorker.removeEventListener("error",failed);close();}
};
