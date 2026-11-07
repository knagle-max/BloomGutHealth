import{LabImageError,type LabImageExtractor}from'@shared/lab-image-file';
/** No image/transcription upload, URL input, CDN, persistent image cache or main-thread OCR. */
export const extractLabImageText:LabImageExtractor=(bytes,kind,signal)=>new Promise((resolve,reject)=>{
 if(signal.aborted){reject(new LabImageError('cancelled'));return;}
 const worker=new Worker(new URL('./lab-image-worker.ts',import.meta.url),{type:'module'});
 let settled=false;
 const finish=(work:()=>void)=>{if(settled)return;settled=true;signal.removeEventListener('abort',cancel);worker.terminate();work();};
 const cancel=()=>finish(()=>reject(new LabImageError('cancelled')));
 signal.addEventListener('abort',cancel,{once:true});
 worker.onerror=()=>finish(()=>reject(new LabImageError('unreadable')));
 worker.onmessage=(event:MessageEvent)=>{const result=event.data;finish(()=>result?.ok===true&&typeof result.text==='string'?resolve(result.text):reject(new LabImageError('unreadable')));};
 try{worker.postMessage({bytes,kind},[bytes.buffer]);}catch{finish(()=>reject(new LabImageError('unreadable')));}
});
