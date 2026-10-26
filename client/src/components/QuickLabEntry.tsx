import {localLabDateInstants,labMeasuredAtFromLocal,labUtcOffsetLabel} from "@shared/lab-date-correction";
import {possibleLabReimports,labImportReceiptMatches} from "@shared/lab-reimport";
import type {AnyLabHistoryRow} from "@shared/lab-history";
import { useState,useId,useRef,useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { invalidatePlanningInputs } from "@/lib/planning-cache";
import { Button } from "@/components/ui/button";
import { parseLabPaste, labPasteCorrections } from "@shared/lab-paste";
import { dateKey } from "@shared/experience";
import { labSchema, sourceOnlyLabSchema, markerDefinitions, type Lab, type SourceOnlyLab } from "@shared/precision-nutrition";
type Row = { line:number; payload:Lab|SourceOnlyLab; key:string; reviewedMatchIds?:string[] };
type Preview = { sourceOnlyOffered:number; keptSourceOnly:boolean; rows:Row[]; errors:Array<{line:number;message:string}> };
export default function QuickLabEntry({existingLabs=[]}:{existingLabs?:AnyLabHistoryRow[]}) {
  const active=useRef(true),reviewFocusPending=useRef(false),completionFocusPending=useRef(false);
  const reviewHeading=useRef<HTMLHeadingElement>(null),nextImportButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  const [needsMatchReview,setNeedsMatchReview]=useState(false),[hardConflict,setHardConflict]=useState(false);
  const offsetId=useId();
  const [selectedInstant,setSelectedInstant]=useState("");
  const [importId,setImportId]=useState(()=>crypto.randomUUID());
  const [reportIdentifier,setReportIdentifier]=useState(""),[specimenIdentifier,setSpecimenIdentifier]=useState("");
  const [mode,setMode]=useState<"paste"|"single">("paste");
  const [text,setText]=useState(""),[date,setDate]=useState(""),[time,setTime]=useState(""),[lab,setLab]=useState(""),[method,setMethod]=useState(""),[fasting,setFasting]=useState<Lab["fasting"]>("unknown");
  const [marker,setMarker]=useState("ldl"),[value,setValue]=useState(""),[unit,setUnit]=useState(""),[low,setLow]=useState(""),[high,setHigh]=useState(""),[notes,setNotes]=useState("");
  const clockChoices=(()=>{try{return localLabDateInstants(date,time);}catch{return [];}})();
  const [preview,setPreview]=useState<Preview|null>(null),[error,setError]=useState(""),[started,setStarted]=useState(false),[completed,setCompleted]=useState(0);
  const [reviewedMatches,setReviewedMatches]=useState("");
  const reimports=(preview?.rows||[]).flatMap(row=>{const matches=possibleLabReimports(row.payload,existingLabs);return matches.length?[{row,matches}]:[];});
  const matchBasis=JSON.stringify(reimports.map(({row,matches})=>[row.key,matches.map(match=>match.id).sort()]));
  const matchesReviewed=(!reimports.length&&!needsMatchReview)||reviewedMatches===matchBasis;
  const clear=()=>{setPreview(null);setError("");setReviewedMatches("");setNeedsMatchReview(false);setHardConflict(false);};
  const save=useMutation({mutationFn:async()=>{
    if(!active.current)throw Error("Your account or import form changed. Reopen the current form.");
    if(!preview?.rows.length)throw Error("Preview results first.");
    if((!started||needsMatchReview)&&!matchesReviewed)throw Error("Review possible previously recorded results before saving.");
    if(hardConflict)throw Error("The source or save reference conflicts. Keep this draft and review source history.");
    const remaining=preview.rows.map(row=>({...row,reviewedMatchIds:needsMatchReview||row.reviewedMatchIds===undefined?possibleLabReimports(row.payload,existingLabs).map(match=>match.id).sort():row.reviewedMatchIds}));
    setStarted(true);setNeedsMatchReview(false);setError("");setPreview(old=>old?{...old,rows:[...remaining]}:old);
    try{
      while(remaining.length){
        if(!active.current)throw Error("Your account or import form changed. No further results were sent.");
        const row=remaining[0];
        const response=await fetch("/api/precision/labs/import",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","Idempotency-Key":row.key},body:JSON.stringify({payload:row.payload,reviewedMatchIds:row.reviewedMatchIds})});
        const receipt=await response.json().catch(()=>null);
        if(!active.current)return;
        if(!response.ok){
          if(response.status===409&&receipt?.code==="LAB_REIMPORT_REVIEW_REQUIRED"){
            setNeedsMatchReview(true);reviewFocusPending.current=true;setReviewedMatches("");
            throw Error("Review possible previously recorded results again. Recorded source matches changed; no result from this attempt was inserted.");
          }
          if(response.status===409){setHardConflict(true);throw Error("The source or save reference conflicts. Keep this draft and review source history.");}
          throw Error("We could not confirm all results were saved. Retry the remaining results with the same save references.");
        }
        if(!labImportReceiptMatches(receipt,row.payload))throw Error("We could not confirm the exact source receipt. Retry the remaining results with the same references.");
        remaining.shift();if(!remaining.length)completionFocusPending.current=true;setCompleted(old=>old+1);setPreview(old=>old?{...old,rows:[...remaining]}:old);
      }
    }finally{if(active.current)await invalidatePlanningInputs();}
  },onError:error=>{if(active.current)setError(error.message.includes("conflicts")||error.message.startsWith("Review possible")?error.message:"We could not confirm all results were saved. Retry the remaining results; acknowledged rows will not be sent again.");}});
  useEffect(()=>{
    if(needsMatchReview&&!save.isPending&&reviewFocusPending.current){reviewHeading.current?.focus();reviewFocusPending.current=false;}
    if(!save.isPending&&!preview?.rows.length&&completionFocusPending.current){if(document.activeElement===document.body)nextImportButton.current?.focus();completionFocusPending.current=false;}
  },[needsMatchReview,save.isPending,preview?.rows.length,matchBasis]);
  const review=(keepSourceOnly=false)=>{try{
    dateKey.parse(date);const measuredAt=labMeasuredAtFromLocal(date,time,selectedInstant||undefined);
    const common={measuredAt,laboratory:lab.trim()||"Not supplied",method:method.trim()||"Not supplied",fasting,sourceReport:{importId,enteredDate:date,...(time?{enteredTime:time}:{}),...(reportIdentifier.trim()?{reportIdentifier}:{}),...(specimenIdentifier.trim()?{specimenIdentifier}:{})}};
    let rows:Array<{line:number;payload:Lab|SourceOnlyLab}>,errors:Preview["errors"]=[],sourceOnlyOffered=0;
    if(mode==="paste"){
      const parsed=parseLabPaste(text,measuredAt,common.laboratory);errors=parsed.errors;
      sourceOnlyOffered=parsed.sourceOnly.length;
      const raw=keepSourceOnly?parsed.sourceOnly.map(row=>({...row,payload:sourceOnlyLabSchema.parse({...row.payload,...common})})):[];
      if(keepSourceOnly){const kept=new Set(raw.map(row=>row.line));errors=errors.filter(error=>!kept.has(error.line));}
      rows=[...parsed.valid,...parsed.pending].map(row=>({...row,payload:labSchema.parse({...row.payload,...common})}));
      rows=[...rows,...raw].sort((a,b)=>a.line-b.line);
    }else{
      if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value.trim()))throw Error("Enter a complete source number.");
      const definition=markerDefinitions.find(m=>m.id===marker)!;
      const raw=`${definition.name}, ${value}${unit?`, ${unit}`:""}`;
      const payload=labSchema.parse({...common,marker,value:Number(value),unit:unit||definition.units[0],referenceLow:low.trim()?Number(low):null,referenceHigh:high.trim()?Number(high):null,notes,
        sourceInput:{text:raw.slice(0,1000),number:value,suppliedUnit:unit||null,capture:"manual-report"},
        ...(!unit?{unitReview:{status:"pending",originalValue:Number(value),originalUnit:null,originalText:raw,suggestedUnit:definition.units[0],confirmedAt:null,supersedes:null}}:{})});
      rows=[{line:1,payload}];
    }
    setPreview({sourceOnlyOffered,keptSourceOnly:keepSourceOnly,rows:rows.map(r=>({...r,key:crypto.randomUUID()})),errors});setError("");setReviewedMatches("");
  }catch(error){setError(error instanceof Error&&/^(?:This local time|This collection time|Review the collection time)/.test(error.message)?error.message:"Check the test date, source number, units and reference interval. Use complete numbers and a real calendar date.");}};
  const nextImport=(corrections=false)=>{
    if(!corrections){setSelectedInstant("");setImportId(crypto.randomUUID());setReportIdentifier("");setSpecimenIdentifier("");}
    setText(corrections?labPasteCorrections(text,preview?.errors.map(e=>e.line)||[]):"");
    setValue("");setLow("");setHigh("");setNotes("");setPreview(null);setCompleted(0);setError("");setStarted(false);setNeedsMatchReview(false);setHardConflict(false);setReviewedMatches("");
  };
  const rows=preview?.rows||[];
  return <section className="bloom-panel space-y-4" aria-labelledby="add-labs-title">
    <h2 id="add-labs-title">Add lab results</h2>
    <p>Use the report’s date, laboratory and assay context for either entry method. Results with missing units stay provisional and do not inform clinical flags or recommendations.</p>
    <div role="group" aria-label="Lab entry method" className="flex flex-wrap gap-3">
      <Button type="button" variant={mode==="paste"?"default":"outline"} aria-pressed={mode==="paste"} disabled={started} onClick={()=>{setMode("paste");clear();}}>Paste several</Button>
      <Button type="button" variant={mode==="single"?"default":"outline"} aria-pressed={mode==="single"} disabled={started} onClick={()=>{setMode("single");clear();}}>Enter one</Button>
    </div>
    <div className="precision-grid">
      <label>Test date<input className="bloom-input w-full" type="date" value={date} disabled={started} onChange={e=>{setDate(e.target.value);setSelectedInstant("");clear();}}/></label>
      <label>Collection time (optional)<input className="bloom-input w-full" type="time" value={time} disabled={started} onChange={e=>{setTime(e.target.value);setSelectedInstant("");clear();}}/></label>
      <label>Laboratory (optional)<input className="bloom-input w-full" value={lab} disabled={started} maxLength={200} onChange={e=>{setLab(e.target.value);clear();}}/></label>
      <label>Method / assay (optional)<input className="bloom-input w-full" value={method} disabled={started} maxLength={200} onChange={e=>{setMethod(e.target.value);clear();}}/></label>
      <label>Fasting<select aria-label="Fasting" className="bloom-input w-full" value={fasting} disabled={started} onChange={e=>{setFasting(e.target.value as Lab["fasting"]);clear();}}><option value="unknown">Unknown / not applicable</option><option value="yes">Yes</option><option value="no">No</option></select></label>
    </div>
    {clockChoices.length>1&&<div><label htmlFor={offsetId}>Collection time UTC offset</label><select id={offsetId} className="bloom-input w-full" value={selectedInstant} disabled={started} onChange={event=>{setSelectedInstant(event.target.value);clear();}}><option value="">Choose the occurrence shown by your source</option>{clockChoices.map(choice=><option key={choice.measuredAt} value={choice.measuredAt}>{labUtcOffsetLabel(choice.offsetMinutes)} · {choice.measuredAt}</option>)}</select><p className="panel-note">This clock time occurs twice in your current timezone. Choose the source's offset only when known, or leave collection time empty.</p></div>}
    <details><summary>Report & specimen identifiers (optional)</summary>
      <p className="panel-note">Copy identifiers from this report if available. They help distinguish reports or specimens collected on the same date; Bloom does not verify them with the laboratory.</p>
      <div className="precision-grid">
        <label>Report identifier (optional)<input className="bloom-input w-full" maxLength={200} value={reportIdentifier} disabled={started} onChange={e=>{setReportIdentifier(e.target.value);clear();}}/></label>
        <label>Specimen identifier (optional)<input className="bloom-input w-full" maxLength={200} value={specimenIdentifier} disabled={started} onChange={e=>{setSpecimenIdentifier(e.target.value);clear();}}/></label>
      </div>
    </details>
    {mode==="paste"?<label className="block">Results<textarea aria-label="Results" className="bloom-input w-full" rows={5} maxLength={30000} disabled={started} placeholder={"[ Reported section ]\nLDL, 3.2, mmol/L\nALT, 73, U/L\nVitamin D, 75"} value={text} onChange={e=>{setText(e.target.value);clear();}}/></label>:<div className="precision-grid">
      <label>Marker<select aria-label="Marker" className="bloom-input w-full" disabled={started} value={marker} onChange={e=>{setMarker(e.target.value);setUnit("");clear();}}>{markerDefinitions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label>Source value<input className="bloom-input w-full" inputMode="decimal" value={value} disabled={started} onChange={e=>{setValue(e.target.value);clear();}}/></label>
      <label>Source unit<select aria-label="Source unit" className="bloom-input w-full" disabled={started} value={unit} onChange={e=>{setUnit(e.target.value);clear();}}><option value="">Not reported — needs confirmation</option>{markerDefinitions.find(m=>m.id===marker)!.units.map(u=><option key={u} value={u}>{u}</option>)}</select></label>
      <label>Report reference low (optional)<input className="bloom-input w-full" inputMode="decimal" value={low} disabled={started} onChange={e=>{setLow(e.target.value);clear();}}/></label>
      <label>Report reference high (optional)<input className="bloom-input w-full" inputMode="decimal" value={high} disabled={started} onChange={e=>{setHigh(e.target.value);clear();}}/></label>
      <label>Notes<input className="bloom-input w-full" maxLength={1000} value={notes} disabled={started} onChange={e=>{setNotes(e.target.value);clear();}}/></label>
    </div>}
    {mode==="paste"&&<p className="panel-note">Optional section headings in [brackets] are retained as reported. Up to 50 results per paste; headings do not count toward that limit. Unsupported rows stay available for correction.</p>}
    <details><summary>Supported tests & units</summary><ul>{markerDefinitions.map(m=><li key={m.id}>{m.name}: {m.units.join(" or ")}</li>)}</ul></details>
    <Button type="button" onClick={()=>review()} disabled={started||!(mode==="paste"?text.trim():value.trim())}>Preview results</Button>
    {error&&<p role="alert">{error}</p>}
    {completed>0&&<p role="status">{completed} result(s) saved. Missing units still need confirmation below. Rows listed as errors were not saved; source-only rows have no interpretation.</p>}
    {save.isPending&&<p role="status">Saving remaining laboratory results…</p>}
    {preview&&<div className="space-y-3">
      {((!!reimports.length&&!started)||needsMatchReview)&&<div className="border rounded-xl p-3 space-y-3" role="status">
        <h3 ref={reviewHeading} tabIndex={-1}>These results may already be recorded</h3>
        <p>{reimports.length} preview row(s) match recorded analyte, original source value/unit, time and assay context. Matching values do not prove the same specimen. Different supplied report or specimen identifiers stay separate.</p>
        <ul>{reimports.map(({row,matches})=><li key={row.key}>Line {row.line}: {"sourceOnly" in row.payload?row.payload.reportedAnalyte:markerDefinitions.find(marker=>marker.id===("marker" in row.payload?row.payload.marker:undefined))?.name} · {matches.length} recorded match(es)</li>)}</ul>
        <a className="text-link" href="#lab-source-history">Review recorded source history</a>
        <label className="block"><input type="checkbox" checked={matchesReviewed} onChange={event=>setReviewedMatches(event.target.checked?matchBasis:"")}/> I reviewed the matches; these are separate results to record.</label>
        <p className="panel-note">If this is the same report, leave it unsaved. No existing result is merged or removed automatically.</p>
      </div>}

      {!started&&!preview.keptSourceOnly&&preview.sourceOnlyOffered>0&&<div className="border rounded-xl p-3 space-y-2"><p>These delimited rows can be kept exactly as source records. They have no supported interpretation; no assay, unit, reference range or medical meaning is inferred.</p><Button type="button" variant="outline" onClick={()=>review(true)}>Keep {preview.sourceOnlyOffered} source-only row(s)</Button></div>}
      {preview.errors.map(e=><p role="alert" key={e.line}>Line {e.line}: {e.message} This row will not be saved.</p>)}
      {rows.map(row=>{
        const payload=row.payload;
        if("sourceOnly" in payload)return <article className="lab-review-row" key={row.key}><h3>{payload.reportedAnalyte}</h3><p>{payload.reportedValue} · {payload.reportedUnit??"Unit not reported"} · {date}</p><p className="evidence-state">Source record only — no interpretation</p>{payload.sourceInput.reportedSection!==undefined&&<p className="panel-note whitespace-pre-wrap">Reported section: {payload.sourceInput.reportedSection}</p>}<p className="panel-note whitespace-pre-wrap">Original report row: {payload.sourceInput.text}</p></article>;
        return <article className="lab-review-row" key={row.key}><h3>{markerDefinitions.find(marker=>marker.id===payload.marker)?.name}</h3><p>{payload.value} · {date} · {payload.laboratory} · {payload.method}</p>{payload.sourceInput?.reportedSection!==undefined&&<p className="panel-note whitespace-pre-wrap break-words">Reported section: {payload.sourceInput.reportedSection}</p>}<p className="evidence-state">{payload.unitReview?"Unit assumed — confirm":"Unit supplied — review against report"}</p><p>{payload.unitReview?`System guess — confirm: ${payload.unit}. This is not a verified source unit.`:`Source unit: ${payload.sourceInput?.suppliedUnit||payload.unit}`}</p></article>;
      })}
      <p className="panel-note">Review every row against the source. A reference interval is not a personal treatment target. {time?"The supplied collection time is retained with the report date.":"Test dates are stored at local noon for date-only ordering; no collection time is claimed."}</p>
      {needsMatchReview&&<p className="panel-note" role="status">Recorded matches changed while saving. Acknowledged rows are retained. Review current matches above before retrying the remaining original source rows.</p>}
      {!!rows.length&&<Button type="button" disabled={save.isPending||hardConflict||(!started||needsMatchReview)&&!matchesReviewed} onClick={()=>save.mutate()}>{save.isPending?"Saving…":started?"Retry remaining results":`Save ${rows.length} result(s)${rows.some(r=>!("sourceOnly" in r.payload)&&r.payload.unitReview?.status==="pending")?" for review":" after review"}`}</Button>}
      {started&&!rows.length&&<div className="flex flex-wrap gap-3"><Button ref={nextImportButton} type="button" variant="outline" onClick={()=>nextImport()}>Start another import</Button>{preview.errors.length>0&&mode==="paste"&&<Button type="button" variant="outline" onClick={()=>nextImport(true)}>Correct unrecognized rows</Button>}</div>}
    </div>}
  </section>;
}
