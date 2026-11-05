import {useState} from 'react';
import {labCategoryIllustration} from '@shared/scientific-visuals';
/** The adjacent category text supplies the name and meaning, including fallback. */
export default function LabCategoryIcon({categoryId}:{categoryId:string}){
 const [unavailable,setUnavailable]=useState(false),image=labCategoryIllustration(categoryId);
 return <span className="lab-category-icon" aria-hidden="true">{image&&!unavailable?<img src={image.src} width={36} height={36} alt="" referrerPolicy="no-referrer" decoding="async" onError={()=>setUnavailable(true)}/>:<span>▤</span>}</span>;
}
