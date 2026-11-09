/** Image transcription is local source-text convenience, never clinical confirmation. */
export const LAB_IMAGE_BYTE_LIMIT=5*1024*1024;
export const LAB_IMAGE_PIXEL_LIMIT=16_000_000;
export const LAB_IMAGE_TEXT_LIMIT=30000;
type Failure='file'|'size'|'pixels'|'empty'|'text'|'cancelled'|'timeout'|'unreadable';
const messages:Record<Failure,string>={
 file:'Choose a PNG or JPEG report image. Your current source draft was retained.',
 size:'Choose a nonempty PNG or JPEG up to 5 MB. Crop a larger report before reading.',
 pixels:'Use an image up to 16 megapixels and 10,000 pixels per side. Crop a larger report before reading.',
 empty:'No readable text was found. Enter the source values manually or use a text PDF/CSV export.',
 text:'The image contains too much text. Use a smaller report section, up to 30,000 characters.',
 cancelled:'Image reading was cancelled. Your current source draft was retained.',
 timeout:'Image reading took too long. Try a smaller clear image or enter results manually.',
 unreadable:'This image could not be read. Use a clear PNG/JPEG or enter source values manually. Your current draft was retained.',
};
export class LabImageError extends Error{constructor(readonly code:Failure){super(messages[code]);}}
export type LabImageFile={name:string;size:number;arrayBuffer():Promise<ArrayBuffer>};
export type LabImageExtractor=(bytes:Uint8Array,kind:'png'|'jpeg',signal:AbortSignal)=>Promise<string>;
/** Read dimensions before any decoder/worker allocation. Extension and actual format must agree. */
export function labImageDimensions(bytes:Uint8Array,kind:'png'|'jpeg'){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(kind==='png'){
  const signature=[137,80,78,71,13,10,26,10];
  if(bytes.length<33||!signature.every((v,i)=>bytes[i]===v)||view.getUint32(8)!==13||String.fromCharCode(...Array.from(bytes.subarray(12,16)))!=='IHDR')throw new LabImageError('unreadable');
  return{width:view.getUint32(16),height:view.getUint32(20)};
 }
 if(bytes.length<4||bytes[0]!==255||bytes[1]!==216)throw new LabImageError('unreadable');
 let offset=2,segments=0;
 while(offset+3<bytes.length&&++segments<=4096){
  if(bytes[offset++]!==255)break;
  while(offset<bytes.length&&bytes[offset]===255)offset++;
  const marker=bytes[offset++];
  if(marker===217||marker===218)break;
  if(marker===1||marker>=208&&marker<=215)continue;
  if(offset+2>bytes.length)break;
  const length=view.getUint16(offset);
  if(length<2||offset+length>bytes.length)break;
  if([192,193,194].includes(marker)){
   if(length<8)break;
   return{height:view.getUint16(offset+3),width:view.getUint16(offset+5)};
  }
  offset+=length;
 }
 throw new LabImageError('unreadable');
}
export async function readLabImageFile(file:LabImageFile,extract:LabImageExtractor,signal?:AbortSignal,deadlineMs=60000){
 const extension=/\.png$/i.test(file.name)?'png':/\.jpe?g$/i.test(file.name)?'jpeg':null;
 if(!extension)throw new LabImageError('file');
 if(!Number.isSafeInteger(file.size)||file.size<1||file.size>LAB_IMAGE_BYTE_LIMIT)throw new LabImageError('size');
 const controller=new AbortController();let rejectStop!:(error:LabImageError)=>void;
 const stopped=new Promise<never>((_resolve,reject)=>{rejectStop=reject;});
 const stop=(code:'cancelled'|'timeout')=>{rejectStop(new LabImageError(code));controller.abort();};
 const parentAbort=()=>stop('cancelled');signal?.addEventListener('abort',parentAbort,{once:true});if(signal?.aborted)parentAbort();
 const timer=setTimeout(()=>stop('timeout'),deadlineMs);
 try{return await Promise.race([stopped,(async()=>{
  if(controller.signal.aborted)throw new LabImageError('cancelled');
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(controller.signal.aborted)throw new LabImageError('cancelled');
  if(bytes.byteLength!==file.size||bytes.byteLength>LAB_IMAGE_BYTE_LIMIT)throw new LabImageError('size');
  const{width,height}=labImageDimensions(bytes,extension);
  if(!width||!height||width>10000||height>10000||width*height>LAB_IMAGE_PIXEL_LIMIT)throw new LabImageError('pixels');
  const text=await extract(bytes,extension,controller.signal);
  if(controller.signal.aborted)throw new LabImageError('cancelled');
  if(typeof text!=='string'||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/.test(text))throw new LabImageError('unreadable');
  if(text.length>LAB_IMAGE_TEXT_LIMIT)throw new LabImageError('text');
  if(!text.trim())throw new LabImageError('empty');
  return{name:file.name,text};
 })()]);}catch(error){throw error instanceof LabImageError?error:new LabImageError('unreadable');}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',parentAbort);controller.abort();}
}
