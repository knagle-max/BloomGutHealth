import{createWorker,OEM}from'tesseract.js';
/** Dedicated owner worker also owns the library's child worker; terminating this
 * worker cancels initialization/recognition, including before createWorker settles. */
self.onmessage=async(event:MessageEvent<{bytes:Uint8Array;kind:'png'|'jpeg'}>)=>{
 let worker:Awaited<ReturnType<typeof createWorker>>|undefined;
 try{
  const base=new URL('/ocr/v1/',self.location.origin).href;
  worker=await createWorker('eng',OEM.LSTM_ONLY,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'language',cacheMethod:'none',workerBlobURL:false,gzip:true,legacyCore:false,legacyLang:false,logger:()=>{},errorHandler:()=>{}});
  const{data}=await worker.recognize(new Blob([event.data.bytes],{type:'image/'+event.data.kind}),{}, {text:true});
  self.postMessage({ok:true,text:data.text});
 }catch{self.postMessage({ok:false});}
 finally{await worker?.terminate().catch(()=>{});}
};
