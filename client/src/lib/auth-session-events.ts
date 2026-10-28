const EVENT = 'bloom-session-changed-v1';
const STORAGE_KEY = 'bloom-session-change';
/** Notifications withdraw local state and recheck the server; they never carry identity or authorize access. */
export function observeSessionChanges(withdraw:()=>void,recheck:()=>void) {
 let channel:BroadcastChannel|null=null;
 const changed=()=>{withdraw();recheck();};
 try{channel=new BroadcastChannel(EVENT);channel.onmessage=event=>{if(event.data===EVENT)changed();};}catch{/* Restricted browsers use a nonce-only storage event. */}
 const storage=(event:StorageEvent)=>{if(event.key===STORAGE_KEY&&event.newValue!==null)changed();};
 const hidden=()=>withdraw();
 const shown=(event:PageTransitionEvent)=>{if(event.persisted)changed();};
 window.addEventListener('storage',storage);window.addEventListener('pagehide',hidden);window.addEventListener('pageshow',shown);
 return {
  announce(){if(channel){channel.postMessage(EVENT);return;}try{window.localStorage.setItem(STORAGE_KEY,crypto.randomUUID());}catch{/* No storage/channel: request-actor rejection and reload still apply. */}},
  dispose(){channel?.close();window.removeEventListener('storage',storage);window.removeEventListener('pagehide',hidden);window.removeEventListener('pageshow',shown);},
 };
}
