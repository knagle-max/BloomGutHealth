import {useEffect,useState} from 'react';
import {FlaskConical} from 'lucide-react';
import type {DevelopmentFeature} from '@shared/development-features';
export default function DevelopmentPhotoPreview({feature}:{feature:DevelopmentFeature}){
 const [preview,setPreview]=useState<string|null>(null),[error,setError]=useState('');
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 return <section className="capability-module development-feature space-y-3" aria-label="Development photo preview"><p className="development-status"><FlaskConical size={16} aria-hidden="true"/>{feature.label}</p><p>Local preview only. Describe the food in the meal review below; automatic interpretation is not available.</p><p className="panel-note">Use a synthetic test image. No image is uploaded or saved by Bloom.</p><label className="block">Preview a synthetic food photo<input className="bloom-input w-full" type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{const file=event.target.files?.[0];event.target.value='';setError('');if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Choose a JPEG, PNG or WebP smaller than 5 MB.');return;}setPreview(URL.createObjectURL(file));}}/></label>{preview&&<img className="development-photo" src={preview} alt="Selected synthetic image for local description review" onError={()=>{setError("This image could not be previewed. Choose a valid JPEG, PNG or WebP.");setPreview(null);}}/>}{error&&<p role="alert">{error}</p>}</section>;
}
