import {embeddedReportTestDate} from './structured-report';
export type ReportDateContext={source:"import-date"|"user-provided"|"report-provided"|"unknown";input?:string;importedAt?:string};
type SampleDate={testDate?:string|Date|null;uploadedAt?:string|Date|null;structuredData?:unknown;dateContext?:ReportDateContext};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
function sourceDate(value:unknown){
 if(typeof value!=='string')return null;
 if(!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value))return null;
 const day=value.slice(0,10),date=new Date(day+'T00:00:00Z');
 return Number.isFinite(+date)&&date.toISOString().slice(0,10)===day&&Number.isFinite(Date.parse(value))?value:null;
}
function recorded(value:SampleDate['testDate']){const date=value?new Date(value):null;return date&&Number.isFinite(+date)?date.toLocaleDateString():'Date not recorded';}
/** Minimal date provenance for derived report views; no raw report values. */
export function reportDateContext(sample:SampleDate):ReportDateContext {
 const data=object(sample.structuredData)?sample.structuredData:{},info=object(data.importInfo)?data.importInfo:{};
 const source=info.dateSource==='import-date'||info.dateSource==='user-provided'||info.dateSource==='report-provided'?info.dateSource:'unknown';
 const input=sourceDate(source==='user-provided'?info.testDateInput:source==='report-provided'?embeddedReportTestDate(data.sourceReport):undefined);
 const imported=sample.uploadedAt?new Date(sample.uploadedAt):null;
 return {source,...(input?{input}:{}),...(imported&&Number.isFinite(+imported)?{importedAt:imported.toISOString()}:{})};
}
/** Date role and entered calendar are provenance, not inferred test chronology. */
export function reportDateText(sample:SampleDate){
 const context=sample.dateContext??reportDateContext(sample),value=sourceDate(context.input);
 if(context.source==='import-date')return `Imported ${recorded(context.importedAt||sample.testDate)} · test date not provided`;
 if(context.source==='user-provided')return value?`Test date (entered): ${value}`:`Recorded date: ${recorded(sample.testDate)} · original entered calendar not recorded`;
 if(context.source==='report-provided')return value?`Test date (report): ${value}`:`Recorded date: ${recorded(sample.testDate)} · report calendar unavailable`;
 return `Recorded date: ${recorded(sample.testDate)} · test-date source not recorded`;
}
