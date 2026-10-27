import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
/** An explicitly started local clock. It never writes or completes training records. */
export default function RestTimer(){
 const[duration,setDuration]=useState('60'),[remaining,setRemaining]=useState<number|null>(null),[deadline,setDeadline]=useState<number|null>(null),[finished,setFinished]=useState(false);
 useEffect(()=>{
  if(deadline===null)return;
  const tick=()=>{const value=Math.max(0,deadline-Date.now());setRemaining(value);if(value===0){setDeadline(null);setFinished(true);}};
  tick();const id=window.setInterval(tick,1000);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',tick);
  return()=>{window.clearInterval(id);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick);};
 },[deadline]);
 const seconds=Number(duration),valid=duration.trim()!==''&&Number.isInteger(seconds)&&seconds>=1&&seconds<=3600;
 const active=remaining!==null&&!finished,total=Math.ceil((remaining??0)/1000),text=`${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`;
 const start=()=>{if(!valid)return;setFinished(false);setRemaining(seconds*1000);setDeadline(Date.now()+seconds*1000);};
 const reset=()=>{setDeadline(null);setRemaining(null);setFinished(false);};
 return <details className="bloom-panel space-y-3"><summary>Rest timer (optional)</summary>
  <p className="panel-note">A local timer for this visit. Start, pause or reset it yourself; it never logs or completes a set or session.</p>
  <label className="block">Rest duration (seconds)<input className="bloom-input w-full" type="number" min={1} max={3600} step={1} value={duration} disabled={active} onChange={event=>setDuration(event.target.value)}/></label>
  <p role="timer" aria-live="off" aria-label="Rest time remaining" className="text-2xl tabular-nums">{remaining===null?'Not started':text}</p>
  <div className="flex flex-wrap gap-2">{!active?<Button type="button" disabled={!valid} onClick={start}>Start timer</Button>:deadline!==null?<Button type="button" onClick={()=>{const value=Math.max(0,deadline-Date.now());setRemaining(value);setDeadline(null);if(value===0)setFinished(true);}}>Pause timer</Button>:<Button type="button" onClick={()=>{if(remaining!==null&&remaining>0)setDeadline(Date.now()+remaining);}}>Resume timer</Button>}
  {remaining!==null&&<Button type="button" variant="outline" onClick={reset}>Reset timer</Button>}</div>
  {finished&&<p role="status">Rest timer finished. Continue when you choose.</p>}
 </details>;
}
