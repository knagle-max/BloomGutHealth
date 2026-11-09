import {useEffect,useState} from "react";
import type {WellnessChoicesController} from "@/lib/wellness-choices";
import type {WellnessActionDecision} from "@shared/wellness-actions";
export default function WellnessChoiceDetails({controller,selected,showAlternatives=true}:{controller:WellnessChoicesController;selected:WellnessActionDecision|undefined;showAlternatives?:boolean}){
 const[page,setPage]=useState(0),view=controller.current;
 useEffect(()=>setPage(0),[view?.day.date,view?.history.length]);
 const disabled=controller.busy||controller.waiting||!controller.sourceReady;
 const history=view?.history.slice(page*20,(page+1)*20)??[];
 if(!selected&&!controller.busy&&!controller.waiting&&!controller.notice&&!controller.error&&!view?.history.length&&!showAlternatives)return null;
 return <>
  {selected?.choice&&selected.choice.choice!=="clear"&&<p role="status" className="panel-note mt-3">{selected.choice.choice==="try"?"Intention saved":selected.choice.choice==="later"?"Saved for later":"Not relevant"} for {view?.day.date}. Record actual food or activity in its tool.</p>}
  {selected&&<div className="flex flex-wrap gap-x-4 gap-y-2 mt-3" aria-label="Keep an action choice">
   {selected.action.category==="routine"&&<button type="button" className="text-link min-h-11" disabled={disabled} onClick={()=>controller.choose(selected.action.id,"try",false)}>Try this</button>}
   <button type="button" className="text-link min-h-11" disabled={disabled} onClick={()=>controller.choose(selected.action.id,"later")}>Save for later</button>
   <button type="button" className="text-link min-h-11" disabled={disabled} onClick={()=>controller.choose(selected.action.id,"not-relevant")}>Not relevant</button>
   {selected.choice&&selected.choice.choice!=="clear"&&<button type="button" className="text-link min-h-11" disabled={disabled} onClick={()=>controller.choose(selected.action.id,"clear")}>Clear current choice</button>}
  </div>}
  {controller.busy&&<p role="status" className="panel-note">{controller.preparing?"Preparing your choice…":"Saving your choice…"}</p>}
  {!controller.sourceReady&&!controller.busy&&<p role="status" className="panel-note">{controller.settingsLoading?"Checking saved settings…":"Review the latest saved settings before keeping an action choice."}</p>}
  {controller.notice&&<p role="status" className="panel-note">{controller.notice}</p>}
  {controller.error&&<p role="alert" className="panel-note">{controller.error}</p>}
  {controller.waiting&&!controller.busy&&<div className="space-y-2"><p role="status" className="panel-note">An action choice has not been confirmed.</p>{controller.rejected?<button type="button" className="text-link min-h-11" onClick={controller.resetRejected}>Review current suggestion</button>:<button type="button" className="text-link min-h-11" onClick={controller.retry}>Retry saving this choice</button>}</div>}
  {view&&(showAlternatives||view.history.length>0)&&<details className="mt-3"><summary className="min-h-11 cursor-pointer">{showAlternatives?"Other options & saved choices":"Saved choices"}</summary>
   <div className="space-y-3 py-2">{(showAlternatives?view.actions:[]).filter(a=>a.action.id!==selected?.action.id).map(item=><div key={item.action.id}><strong>{item.action.title}</strong><p className="panel-note">{item.eligible?item.action.description:item.reason}</p>{item.eligible&&<button type="button" className="text-link min-h-11" disabled={disabled} onClick={()=>controller.choose(item.action.id,"try",true)}>Try {item.action.title.toLowerCase()}</button>}</div>)}</div>
   {view.history.length>0&&<section className="space-y-2" aria-label="Saved action choice history"><h3>Saved choices for {view.day.date}</h3><p className="panel-note">{view.history.length} choices · showing {page*20+1}–{page*20+history.length}. These record intentions.</p><ul className="space-y-2">{history.map(row=><li key={row.id} className="break-words"><strong>{view.actions.find(a=>a.action.id===row.actionId)?.action.title??"Earlier action"}</strong> · {row.choice==="try"?"Intended to try":row.choice==="later"?"Saved for later":row.choice==="clear"?"Choice cleared":"Not relevant"}<small className="block break-all">Chosen: {row.chosenAt} · local day {row.date} · clock offset {row.timezoneOffset} min · suggestion {row.actionVersion}</small></li>)}</ul><div className="flex flex-wrap gap-3">{page>0&&<button type="button" className="text-link min-h-11" onClick={()=>setPage(page-1)}>Previous choices</button>}{(page+1)*20<view.history.length&&<button type="button" className="text-link min-h-11" onClick={()=>setPage(page+1)}>Next choices</button>}<button type="button" className="text-link min-h-11" disabled={disabled} onClick={()=>controller.deleteHistory(history)}>Delete these {history.length} saved choices</button></div></section>}
  </details>}
 </>;
}
