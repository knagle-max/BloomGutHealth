import {possibleLabReimports} from "@shared/lab-reimport";
import type {AnyLabHistoryRow} from "@shared/lab-history";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { invalidatePlanningInputs } from "@/lib/planning-cache";
import { Button } from "@/components/ui/button";
import { parseLabPaste, labPasteCorrections } from "@shared/lab-paste";
import { dateKey } from "@shared/experience";
import { labSchema, sourceOnlyLabSchema, markerDefinitions, type Lab, type SourceOnlyLab } from "@shared/precision-nutrition";
type Row = { line:number; payload:Lab|SourceOnlyLab; key:string };
type Preview = { sourceOnlyOffered:number; keptSourceOnly:boolean; rows:Row[]; errors:Array<{line:number;message:string}> };
export default function QuickLabEntry({existingLabs=[]}:{existingLabs?:AnyLabHistoryRow[]}) {
  const [importId,setImportId]=useState(()=>crypto.randomUUID());
  const [reportIdentifier,setReportIdentifier]=useState(""),[specimenIdentifier,setSpecimenIdentifier]=useState("");
  const [mode,setMode]=useState<"paste"|"single">("paste");
  const [text,setText]=useState(""),[date,setDate]=useState(""),[time,setTime]=useState(""),[lab,setLab]=useState(""),[method,setMethod]=useState(""),[fasting,setFasting]=useState<Lab["fasting"]>("unknown");
  const [marker,setMarker]=useState("ldl"),[value,setValue]=useState(""),[unit,setUnit]=useState(""),[low,setLow]=useState(""),[high,setHigh]=useState(""),[notes,setNotes]=useState("");
  const [preview,setPreview]=useState<Preview|null>(null),[error,setError]=useState(""),[started,setStarted]=useState(false),[completed,setCompleted]=useState(0);
  const [reviewedMatches,setReviewedMatches]=useState("");
  const reimports=(preview?.rows||[]).flatMap(row=>{const matches=possibleLabReimports(row.payload,existingLabs);return matches.length?[{row,matches}]:[];});
  const matchBasis=JSON.stringify(reimports.map(({row,matches})=>[row.key,matches.map(match=>match.id).sort()]));
  const matchesReviewed=!reimports.length||reviewedMatches===matchBasis;
  const clear=()=>{setPreview(null);setError("");setReviewedMatches("");};
  const save=useMutation({mutationFn:async()=>{
    if(!preview?.rows.length)throw Error("Preview results first.");
    if(!started&&!matchesReviewed)throw Error("Review possible previously recorded results before saving.");
    setStarted(true);setError("");const remaining=[...preview.rows];
    try{
      while(remaining.length){
        const row=remaining[0];
        const response=await fetch("/api/precision/records",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","Idempotency-Key":row.key},body:JSON.stringify({kind:"lab",payload:row.payload})});
        if(!response.ok)throw Error(response.status===409?"The save reference conflicts with another result. Keep this draft and review the original entry.":"We could not confirm all results were saved. Retry the remaining results with the same save references.");
        remaining.shift();setCompleted(old=>old+1);setPreview(old=>old?{...old,rows:[...remaining]}:old);
      }
    }finally{await invalidatePlanningInputs();}
  },onError:e=>setError((e.message.includes("conflicts")||e.message.startsWith("Review possible"))?e.message:"We could not confirm all results were saved. Retry the remaining results; acknowledged rows will not be sent again.")});
  const review=(keepSourceOnly=false)=>{try{
    dateKey.parse(date);const measuredAt=new Date(date+"T"+(time||"12:00")).toISOString();
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
  }catch{setError("Check the test date, source number, units and reference interval. Use complete numbers and a real calendar date.");}};
  const nextImport=(corrections=false)=>{
    if(!corrections){setImportId(crypto.randomUUID());setReportIdentifier("");setSpecimenIdentifier("");}
    setText(corrections?labPasteCorrections(text,preview?.errors.map(e=>e.line)||[]):"");
    setValue("");setLow("");setHigh("");setNotes("");setPreview(null);setCompleted(0);setError("");setStarted(false);
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
      <label>Test date<input className="bloom-input w-full" type="date" value={date} disabled={started} onChange={e=>{setDate(e.target.value);clear();}}/></label>
      <label>Collection time (optional)<input className="bloom-input w-full" type="time" value={time} disabled={started} onChange={e=>{setTime(e.target.value);clear();}}/></label>
      <label>Laboratory (optional)<input className="bloom-input w-full" value={lab} disabled={started} maxLength={200} onChange={e=>{setLab(e.target.value);clear();}}/></label>
      <label>Method / assay (optional)<input className="bloom-input w-full" value={method} disabled={started} maxLength={200} onChange={e=>{setMethod(e.target.value);clear();}}/></label>
      <label>Fasting<select aria-label="Fasting" className="bloom-input w-full" value={fasting} disabled={started} onChange={e=>{setFasting(e.target.value as Lab["fasting"]);clear();}}><option value="unknown">Unknown / not applicable</option><option value="yes">Yes</option><option value="no">No</option></select></label>
    </div>
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
      {!!reimports.length&&!started&&<div className="border rounded-xl p-3 space-y-3" role="status">
        <h3>These results may already be recorded</h3>
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
      {!!rows.length&&<Button type="button" disabled={save.isPending||!started&&!matchesReviewed} onClick={()=>save.mutate()}>{save.isPending?"Saving…":started?"Retry remaining results":`Save ${rows.length} result(s)${rows.some(r=>!("sourceOnly" in r.payload)&&r.payload.unitReview?.status==="pending")?" for review":" after review"}`}</Button>}
      {started&&!rows.length&&<div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={()=>nextImport()}>Start another import</Button>{preview.errors.length>0&&mode==="paste"&&<Button type="button" variant="outline" onClick={()=>nextImport(true)}>Correct unrecognized rows</Button>}</div>}
    </div>}
  </section>;
}
