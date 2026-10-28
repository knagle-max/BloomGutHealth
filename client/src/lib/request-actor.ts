/** Derived tab identity only. The signed server session remains the authority. */
let actor: string | null = null;
let epoch = 0;
export const ACCOUNT_CONTEXT_MESSAGE = 'The signed-in account changed. Reload this page and review the current account before continuing.';
export class AccountContextChangedError extends Error {
  readonly status = 409;
  constructor() { super(ACCOUNT_CONTEXT_MESSAGE); }
}
export function bindRequestActor(next: string | null) {
  if (next !== actor) { actor = next; epoch++; }
}
export function accountContextGuard(): () => void {
  const started = epoch;
  return () => { if (started !== epoch) throw new AccountContextChangedError(); };
}
function ownedApi(url: string): boolean {
  try {
    const origin = typeof window === 'undefined' ? 'https://bloom.invalid' : window.location.origin;
    const target = new URL(url, origin);
    return target.origin === origin && target.pathname.startsWith('/api/') && !target.pathname.startsWith('/api/auth/');
  } catch { return false; }
}
const bodyReaders = new Set(["json","text","blob","arrayBuffer","formData","bytes"]);
function guardResponse(response:Response,assertCurrent:()=>void):Response {
  return new Proxy(response,{get(target,key){
    const value=Reflect.get(target,key,target);
    if(key==="clone")return()=>guardResponse(target.clone(),assertCurrent);
    if(typeof value!=="function")return value;
    if(typeof key==="string"&&bodyReaders.has(key))return async(...args:unknown[])=>{
      try{const result=await Reflect.apply(value,target,args);assertCurrent();return result;}
      catch(error){assertCurrent();throw error;}
    };
    return value.bind(target);
  }});
}
/** Preserve raw HTTP responses so specialised receipt/conflict readers still work. */
export async function accountFetch(url: string, init?: RequestInit): Promise<Response> {
  const owned = ownedApi(url), assertCurrent = accountContextGuard();
  const headers = new Headers(init?.headers);
  headers.delete('X-Bloom-Actor');
  if (owned && actor !== null) headers.set('X-Bloom-Actor', actor);
  const response = await fetch(url, { ...init, headers });
  if (owned) assertCurrent();
  return owned ? guardResponse(response,assertCurrent) : response;
}
