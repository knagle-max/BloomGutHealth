/** A broken optional grant must not revoke unrelated, valid base grants.
 * An identifiable conflicting intent still denies that account; valid duplicate
 * identities remain denied by the caller. No invalid supplement grants access. */
export function readSupplementalGrant<T extends {userId:string}>(raw:string|undefined,userId:string,schema:{safeParse(input:unknown):{success:true;data:T}|{success:false}}):{grants:T[];deniesAccount:boolean}{
 if(!raw||raw.length>65536)return {grants:[],deniesAccount:false};
 let candidate:unknown;
 try{candidate=JSON.parse(raw);}catch{return {grants:[],deniesAccount:false};}
 const parsed=schema.safeParse(candidate);
 if(parsed.success)return {grants:[parsed.data],deniesAccount:false};
 return {grants:[],deniesAccount:!!candidate&&typeof candidate==='object'&&!Array.isArray(candidate)&&(candidate as {userId?:unknown}).userId===userId};
}
