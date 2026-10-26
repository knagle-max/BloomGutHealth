import type { Lab } from "@shared/precision-nutrition";
/** Verbatim user-supplied source context; never an inferred panel or taxonomy. */
export default function LabSourceContext({source}:{source:Lab["sourceInput"]}) {
  if(!source)return <p className="panel-note">Original report row was not recorded.</p>;
  return <div className="panel-note space-y-1 break-words">
    {source.reportedSection!==undefined&&<p className="whitespace-pre-wrap">Reported section: {source.reportedSection}</p>}
    {source.rowOrder!==undefined&&<p>Report line: {source.rowOrder}</p>}
    <p>Reported number: {source.number}</p>
    <p>Original supplied unit: {source.suppliedUnit??"Not supplied"}</p>
    <p className="whitespace-pre-wrap">Original report row: {source.text}</p>
  </div>;
}
