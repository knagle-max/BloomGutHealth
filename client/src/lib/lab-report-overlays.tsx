import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {useAuth} from './auth';
import type {LabOverlayChoice,LabOverlayPreference} from '@shared/lab-overlay-preference';
type State={owner:string;active:string|null;preferences:Record<string,LabOverlayPreference>;contexts:Record<string,{version:string;context:LabOverlayChoice['context'];confirmed:boolean}>};
const empty=(owner:string):State=>({owner,active:null,preferences:{},contexts:{}});
const Context=createContext<null|{state:State;activate:(key:string|null)=>void;preference:(key:string,value:LabOverlayPreference)=>void;sourceContext:(id:string,version:string,value:LabOverlayChoice)=>void;reconcile:(keys:string[],ids:string[])=>void}>(null);
/** Session view state, never observations or a second source store. Owner changes
 * withdraw it synchronously; reload restores Original report and reconfirmation. */
export function LabReportOverlayProvider({children}:{children:ReactNode}){
 const{user}=useAuth(),owner=user?.id||'',[saved,setSaved]=useState(()=>empty(owner)),state=saved.owner===owner?saved:empty(owner);
 const activeOwner=useRef(owner);activeOwner.current=owner;useEffect(()=>setSaved(old=>old.owner===owner?old:empty(owner)),[owner]);
 const update=useCallback((fn:(state:State)=>State)=>{if(activeOwner.current!==owner)return;setSaved(old=>activeOwner.current===owner?fn(old.owner===owner?old:empty(owner)):old);},[owner]);
 const activate=useCallback((key:string|null)=>update(old=>old.active===key?old:{...old,active:key}),[update]);
 const preference=useCallback((key:string,value:LabOverlayPreference)=>update(old=>({...old,active:key,preferences:{...old.preferences,[key]:{provider:value.provider,province:value.province,otherProvider:value.otherProvider}}})),[update]);
 const sourceContext=useCallback((id:string,version:string,value:LabOverlayChoice)=>update(old=>({...old,contexts:{...old.contexts,[id]:{version,context:value.context,confirmed:value.confirmed}}})),[update]);
 const reconcile=useCallback((keys:string[],ids:string[])=>update(old=>{const valid=new Set(keys),sources=new Set(ids),active=old.active&&valid.has(old.active)?old.active:keys.length===1?keys[0]:null,preferences=Object.fromEntries(Object.entries(old.preferences).filter(([key])=>valid.has(key))),contexts=Object.fromEntries(Object.entries(old.contexts).filter(([id])=>sources.has(id)));return active===old.active&&Object.keys(preferences).length===Object.keys(old.preferences).length&&Object.keys(contexts).length===Object.keys(old.contexts).length?old:{...old,active,preferences,contexts};}),[update]);
 const value=useMemo(()=>({state,activate,preference,sourceContext,reconcile}),[state,activate,preference,sourceContext,reconcile]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLabReportOverlays(){const value=useContext(Context);if(!value)throw Error('Laboratory report view context is required.');return value;}
