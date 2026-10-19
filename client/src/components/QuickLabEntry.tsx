import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { parseLabPaste } from "@shared/lab-paste";
import { markerDefinitions } from "@shared/precision-nutrition";
export default function QuickLabEntry() {
  const [text,setText]=useState(""),[date,setDate]=useState(""),[lab,setLab]=useState("");
  const [preview,setPreview]=useState<ReturnType<typeof parseLabPaste>|null>(null),[error,setError]=useState(""),[saved,setSaved]=useState("");
  const rows=preview?[...preview.valid,...preview.pending].sort((a,b)=>a.line-b.line):[];
  const save=useMutation({mutationFn:async()=>{
    if(!preview||!rows.length)throw Error("Preview results first.");
    const remaining=[...rows];let completed=0;
    try{while(remaining.length){await apiRequest("POST","/api/precision/records",{kind:"lab",payload:remaining[0].payload});remaining.shift();completed++;
      setPreview({...preview,valid:remaining.filter(r=>r.payload.unitReview?.status!=="pending"),pending:remaining.filter(r=>r.payload.unitReview?.status==="pending")});
    }}finally{if(completed){setSaved(`${completed} result(s) saved. Missing units still need confirmation below. Unrecognized rows were not saved.`);queryClient.invalidateQueries({queryKey:["/api/precision"]});}}
  },onError:e=>setError(e.message)});
  const clear=()=>{setPreview(null);setError("");setSaved("");};
  const review=()=>{try{if(!date)throw Error("Choose the test date on your report.");const parsed=parseLabPaste(text,new Date(date+"T12:00:00").toISOString(),lab);setPreview(parsed);setError("");setSaved("");}catch(e){setError((e as Error).message);}};
  return <section className="bloom-panel space-y-4"><h2>Add lab results together</h2><p>Paste rows, then review each value and source unit. Missing-unit rows can be saved for later confirmation; they do not affect your recommendations or trends.</p>
    <div className="precision-grid"><label>Test date<input className="bloom-input w-full" type="date" value={date} disabled={save.isPending} onChange={e=>{setDate(e.target.value);clear();}}/></label><label>Laboratory (optional)<input className="bloom-input w-full" value={lab} disabled={save.isPending} maxLength={200} onChange={e=>{setLab(e.target.value);clear();}}/></label></div>
    <label className="block">Results<textarea className="bloom-input w-full" rows={5} maxLength={30000} disabled={save.isPending} placeholder={"LDL, 3.2, mmol/L\nHbA1c, 5.4, %\nVitamin D, 75"} value={text} onChange={e=>{setText(e.target.value);clear();}}/></label>
    <details><summary>Supported tests & units</summary><ul>{markerDefinitions.map(m=><li key={m.id}>{m.name}: {m.units.join(" or ")}</li>)}</ul></details>
    <Button type="button" onClick={review} disabled={!text.trim()||save.isPending}>Preview results</Button>
    {error&&<p role="alert">{error}</p>}{saved&&<p role="status">{saved}</p>}
    {preview&&<div className="space-y-3">{preview.errors.map(e=><p role="alert" key={e.line}>Line {e.line}: {e.message} This row will not be saved.</p>)}
      {rows.map(r=><article className="lab-review-row" key={r.line}><h3>{markerDefinitions.find(m=>m.id===r.payload.marker)?.name}</h3><p>{r.payload.value} · {date} · {r.payload.laboratory}</p><p className="evidence-state">{r.payload.unitReview?"Unit assumed — confirm":"Unit supplied — review against report"}</p><p>{r.payload.unitReview?`System guess — confirm: ${r.payload.unit}. This catalogue suggestion is not inferred from the number.`:`Source unit: ${r.payload.unit}`}</p></article>)}
      <p className="panel-note">Unrecognized rows do not block saving valid rows. Reference ranges, fasting status and assay details remain unspecified; this is not clinical verification.</p>
      <Button disabled={save.isPending||!rows.length} onClick={()=>{setError("");save.mutate();}}>{save.isPending?"Saving…":`Save ${rows.length} result(s)${preview.pending.length?" for review":" after review"}`}</Button>
    </div>}
  </section>;
}
