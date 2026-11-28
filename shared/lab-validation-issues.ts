export type LabValidationIssue={code:string;path:string[];message:string};
/** Retain typed validation diagnostics without copying values or source rows. */
export function labValidationIssues(issues:readonly {code:string;path:readonly PropertyKey[];message:string}[]):LabValidationIssue[]{return issues.map(issue=>({code:issue.code,path:issue.path.map(String),message:issue.message}));}
export function labValidationMessage(issues:readonly LabValidationIssue[],marker?:{name:string;units:readonly string[]}){
 const date=issues.find(issue=>issue.path.includes('measuredAt')||issue.path.includes('enteredDate')||issue.path.includes('enteredTime')||issue.path.includes('dateCorrection'));
 if(date)return /future/i.test(date.message)?'The report date is later than the current device clock. Check the actual collection date and your device date/time; future measurements cannot be saved.':'Review the collection date, optional time and original report context; the date or timestamp is invalid or conflicts with the source.';
 if(issues.some(issue=>issue.path.includes('unit')))return `Check the reported unit${marker?` for ${marker.name}; supported units: ${marker.units.join(', ')}`:''}. Keep an unconfirmed unit as source-only rather than guessing a conversion.`;
 if(issues.some(issue=>issue.path.some(part=>['referenceLow','referenceHigh'].includes(part))))return 'Review the original reference bounds. Keep absent bounds unknown and the lower bound below the upper bound.';
 if(issues.some(issue=>issue.path.includes('value')))return 'Review the complete source number; the value is outside the supported numeric format or magnitude.';
 if(issues.some(issue=>issue.path.includes('sourceInput')))return 'Review the original source row and its reported number/unit; the source context could not be validated.';
 return 'Review this result and its source fields before saving; validation could not confirm this row.';
}
