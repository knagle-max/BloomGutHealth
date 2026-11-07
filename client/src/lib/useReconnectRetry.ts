import {useEffect,useRef,useState} from 'react';
/** Opt-in, memory-only retry for an already confirmed immutable request. */
export function useReconnectRetry({actorId,attemptKey,eligible,retry}:{actorId:string|undefined;attemptKey:string|undefined;eligible:boolean;retry:()=>void}){
 const[online,setOnline]=useState(()=>navigator.onLine),[binding,setBinding]=useState<{actor:string;key:string}|null>(null);
 const armed=useRef(binding),latest=useRef({actorId,attemptKey,eligible,retry});latest.current={actorId,attemptKey,eligible,retry};
 useEffect(()=>{
  let active=true,wasOffline=!navigator.onLine;
  const offline=()=>{wasOffline=true;setOnline(false);};
  const reconnected=()=>{
   setOnline(true);if(!active||!wasOffline)return;wasOffline=false;
   const current=latest.current,selected=armed.current;
   if(!selected||!current.eligible||selected.actor!==current.actorId||selected.key!==current.attemptKey)return;
   armed.current=null;setBinding(null);current.retry();
  };
  window.addEventListener('offline',offline);window.addEventListener('online',reconnected);
  return()=>{active=false;window.removeEventListener('offline',offline);window.removeEventListener('online',reconnected);};
 },[]);
 const enabled=!!binding&&binding.actor===actorId&&binding.key===attemptKey;
 function arm(value:boolean){const next=value&&eligible&&actorId&&attemptKey?{actor:actorId,key:attemptKey}:null;armed.current=next;setBinding(next);}
 return{online,enabled,arm};
}
