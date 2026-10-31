import { labEnteredContext, type Lab } from "@shared/precision-nutrition";
/** Verbatim user-supplied source context; never an inferred panel or taxonomy. */
export default function LabSourceContext({source,report,correction}:{source:Lab["sourceInput"];report?:Lab["sourceReport"];correction?:Lab["dateCorrection"]}) {
  const entered=labEnteredContext({sourceReport:report,dateCorrection:correction});
  if(!source&&!report&&!correction)return <p className="panel-note">Original report row was not recorded.</p>;
  return <div className="panel-note space-y-1 break-words">
    {(report||correction)&&<div className="space-y-1">{entered?.enteredDate?<><p>User-entered test date: {entered.enteredDate}</p><p>{entered.enteredTime?`User-entered collection time: ${entered.enteredTime}`:"Entered collection time was not supplied."}</p></>:<p>Date/time entry precision was not recorded.</p>}</div>}
    {correction&&<div className="space-y-1"><p>Date corrected by the account owner: {correction.correctedAt}</p><p>Previous stored timestamp: {correction.previousMeasuredAt}</p><p>Previous entered date/time: {correction.previousEnteredDate?`${correction.previousEnteredDate}${correction.previousEnteredTime?` ${correction.previousEnteredTime}`:" · time not supplied"}`:"Not recorded"}</p><p className="whitespace-pre-wrap">Correction reason: {correction.reason}</p></div>}
    {report&&<div className="space-y-1">
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
