import type { Lab } from "@shared/precision-nutrition";
/** Verbatim user-supplied source context; never an inferred panel or taxonomy. */
export default function LabSourceContext({source,report}:{source:Lab["sourceInput"];report?:Lab["sourceReport"]}) {
  if(!source&&!report)return <p className="panel-note">Original report row was not recorded.</p>;
  return <div className="panel-note space-y-1 break-words">
    {report&&<div className="space-y-1">
      {report.enteredDate?<><p>User-entered test date: {report.enteredDate}</p><p>{report.enteredTime?`User-entered collection time: ${report.enteredTime}`:"Entered collection time was not supplied."}</p></>:<p>Date/time entry precision was not recorded.</p>}
      <p>Bloom import reference: {report.importId}</p>
      {report.reportIdentifier!==undefined&&<p className="whitespace-pre-wrap">User-entered report identifier: {report.reportIdentifier}</p>}
      {report.specimenIdentifier!==undefined&&<p className="whitespace-pre-wrap">User-entered specimen identifier: {report.specimenIdentifier}</p>}
      <p>Source identifiers are recorded context, not verification by the laboratory.</p>
    </div>}
    {!source?<p>Original report row was not recorded.</p>:<>
    {source.reportedSection!==undefined&&<p className="whitespace-pre-wrap">Reported section: {source.reportedSection}</p>}
    {source.rowOrder!==undefined&&<p>Report line: {source.rowOrder}</p>}
    <p>Reported number: {source.number}</p>
    <p>Original supplied unit: {source.suppliedUnit??"Not supplied"}</p>
    <p className="whitespace-pre-wrap">Original report row: {source.text}</p>
    </>}
  </div>;
}
