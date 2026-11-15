import {sourceOverlayKey,type LabManagedSource} from '@shared/lab-report-metadata';
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {useAuth} from './auth';
import type {LabOverlayChoice,LabOverlayPreference} from '@shared/lab-overlay-preference';
type State={owner:string;active:string|null;preferences:Record<string,LabOverlayPreference>;canonical:Record<string,{marker:string;overlay:LabOverlayPreference}>,contexts:Record<string,{version:string;context:LabOverlayChoice['context'];confirmed:boolean}>};
const empty=(owner:string):State=>({owner,active:null,preferences:{},canonical:{},contexts:{}});
const Context=createContext<null|{state:State;activate:(key:string|null)=>void;preference:(key:string,value:LabOverlayPreference)=>void;sourceContext:(id:string,version:string,value:LabOverlayChoice)=>void;reconcile:(keys:string[],ids:string[])=>void;hydrate:(sources:LabManagedSource[])=>void}>(null);
/** Shared display state, never observations or a second source store. Owner
 * changes withdraw it synchronously; owned annotations hydrate saved preferences.
 * Fact-specific collection confirmations remain session-only. */
export function LabReportOverlayProvider({children}:{children:ReactNode}){
 const{user}=useAuth(),owner=user?.id||'',[saved,setSaved]=useState(()=>empty(owner)),state=saved.owner===owner?saved:empty(owner);
 const activeOwner=useRef(owner);activeOwner.current=owner;useEffect(()=>setSaved(old=>old.owner===owner?old:empty(owner)),[owner]);
 const update=useCallback((fn:(state:State)=>State)=>{if(activeOwner.current!==owner)return;setSaved(old=>activeOwner.current===owner?fn(old.owner===owner?old:empty(owner)):old);},[owner]);
 const activate=useCallback((key:string|null)=>update(old=>old.active===key?old:{...old,active:key}),[update]);
 const preference=useCallback((key:string,value:LabOverlayPreference)=>update(old=>({...old,active:key,preferences:{...old.preferences,[key]:{provider:value.provider,province:value.province,otherProvider:value.otherProvider}}})),[update]);
 const sourceContext=useCallback((id:string,version:string,value:LabOverlayChoice)=>update(old=>({...old,contexts:{...old.contexts,[id]:{version,context:value.context,confirmed:value.confirmed}}})),[update]);
 const hydrate=useCallback((sources:LabManagedSource[])=>update(old=>{
  let changed=false;const canonical={...old.canonical},preferences={...old.preferences};
  for(const source of sources){if(!source.metadata?.available)continue;const key=sourceOverlayKey(source),marker=JSON.stringify([source.revision,source.metadata.current?.revision??null,source.metadata.sourceCurrent]),overlay=source.metadata.current?.overlay??{provider:'original-report' as const,province:'',otherProvider:''};if(canonical[key]?.marker!==marker){canonical[key]={marker,overlay};preferences[key]=overlay;changed=true;}}
  return changed?{...old,canonical,preferences}:old;
 }),[update]);
 const reconcile=useCallback((keys:string[],ids:string[])=>update(old=>{const valid=new Set(keys),sources=new Set(ids),canonical=Object.fromEntries(Object.entries(old.canonical).filter(([key])=>valid.has(key))),active=old.active&&valid.has(old.active)?old.active:keys.length===1?keys[0]:null,preferences=Object.fromEntries(Object.entries(old.preferences).filter(([key])=>valid.has(key))),contexts=Object.fromEntries(Object.entries(old.contexts).filter(([id])=>sources.has(id)));return active===old.active&&Object.keys(preferences).length===Object.keys(old.preferences).length&&Object.keys(contexts).length===Object.keys(old.contexts).length&&Object.keys(canonical).length===Object.keys(old.canonical).length?old:{...old,active,preferences,contexts,canonical};}),[update]);
 const value=useMemo(()=>({state,activate,preference,sourceContext,reconcile,hydrate}),[state,activate,preference,sourceContext,reconcile,hydrate]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLabReportOverlays(){const value=useContext(Context);if(!value)throw Error('Laboratory report view context is required.');return value;}
