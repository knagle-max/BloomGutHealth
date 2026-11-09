import type {Lab,SourceOnlyLab} from './precision-nutrition';
export type LabHistoryRow=Lab&{id:string};
export type AnyLabHistoryRow=LabHistoryRow|(SourceOnlyLab&{id:string});
/** Preserve import identity and split inconsistent report/specimen identifiers. */
export function labReportGroupKey(source:Lab['sourceReport']){return source?JSON.stringify([source.importId,source.reportIdentifier??null,source.specimenIdentifier??null]):null;}
/** A source view over canonical active records, never a new panel or deduplication model. */
export function groupLabHistory<Row extends AnyLabHistoryRow>(rows:readonly Row[]){
 const groups=new Map<string,{key:string;source:NonNullable<Lab['sourceReport']>;rows:Row[]}>(),unlinked:Row[]=[];
 for(const row of rows){
  const source=row.sourceReport;
  if(!source){unlinked.push(row);continue;}
  // Split inconsistent identifiers rather than assigning the first row's context to others.
  const key=labReportGroupKey(source)!;
  const group=groups.get(key)||{key,source,rows:[]};group.rows.push(row);groups.set(key,group);
 }
 const imports=Array.from(groups.values()).map(group=>({...group,rows:group.rows.map((row,index)=>({row,index})).sort((a,b)=>(a.row.sourceInput?.rowOrder??Infinity)-(b.row.sourceInput?.rowOrder??Infinity)||a.index-b.index).map(({row})=>row)}));
 return{imports,unlinked};
}

/** Prefer explicitly entered calendar text; do not reconstruct missing legacy entry context. */
export function labDateText(timestamp:string,source?:Lab['sourceReport'],correction?:Lab['dateCorrection']){return correction?.enteredDate||source?.enteredDate||timestamp.slice(0,10);}

/** Filter a source view only; a shared calendar date never establishes a panel. */
export function labHistoryDates(rows: readonly AnyLabHistoryRow[]) {
 return Array.from(new Set(rows.map(row=>labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)))).sort().reverse();
}
export function labHistoryOnDate<Row extends AnyLabHistoryRow>(rows: readonly Row[], date: string) {
 return rows.filter(row=>!date||labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)===date);
}

/** Arithmetic over recorded canonical points, independent of clinical comparability. */
export function recordedLabDifference(points: readonly {date:string;value:number;unit:string}[]) {
 if(points.length<2||new Set(points.map(point=>Date.parse(point.date))).size!==points.length)return null;
 const first=points[0],last=points[points.length-1];
 if(!points.every(point=>Number.isFinite(point.value)&&Number.isFinite(Date.parse(point.date))&&point.unit===first.unit)||Date.parse(last.date)<=Date.parse(first.date))return null;
 const difference=last.value-first.value;return Number.isFinite(difference)?difference:null;
}

/** Contiguous original sections only: repeated headings never merge separated source rows. */
export function reportedLabSections<Row extends AnyLabHistoryRow>(rows: readonly Row[]) {
 const sections: {firstId:string; reportedSection:string|undefined; rows:Row[]}[]=[];
 for(const row of rows){
  const heading=row.sourceInput?.reportedSection,last=sections[sections.length-1];
  if(last&&last.reportedSection===heading)last.rows.push(row);
  else sections.push({firstId:row.id,reportedSection:heading,rows:[row]});
 }
 return sections;
}

export type LabPointSelection={point:string;first:string;second:string};
/** Resolve only explicit immutable source revisions; ambiguous or missing ownership stays unavailable. */
export function resolveRecordedLabPoint<T extends {id:string;supersededIds?:readonly string[]}>(points:readonly T[],id:string){
 const matches=id?points.filter(p=>p.id===id||p.supersededIds?.includes(id)):[];
 return matches.length===1?matches[0]:undefined;
}
/** Explicit pair of current records from one marker. Selection is not clinical
 * comparability; arithmetic reuses the canonical recorded-difference rules. */
export function compareRecordedLabResults<T extends {id:string;date:string;value:number;unit:string;supersededIds?:readonly string[]}>(points:readonly T[],firstId:string,secondId:string){
 const first=resolveRecordedLabPoint(points,firstId),second=resolveRecordedLabPoint(points,secondId),base={first,second};
 if(!firstId||!secondId)return{...base,status:'choose-two' as const,difference:null};
 if(!first||!second)return{...base,status:'unavailable' as const,difference:null};
 if(first.id===second.id)return{...base,status:'same-record' as const,difference:null};
 if(Date.parse(first.date)===Date.parse(second.date))return{...base,status:'same-time' as const,difference:null};
 if(Date.parse(second.date)<Date.parse(first.date))return{...base,status:'reverse-time' as const,difference:null};
 const difference=recordedLabDifference([first,second]);
 return{...base,status:difference===null?'incompatible' as const:'recorded-difference' as const,difference};
}
/** Significant digits retain tiny nonzero arithmetic instead of displaying zero. */
export function formatRecordedLabNumber(value:number){return Number.isFinite(value)?new Intl.NumberFormat(undefined,{maximumSignificantDigits:6}).format(value===0?0:value):'Not available';}

/** Management metadata contains no biomarker values or original report identifiers. */
export type LabSourceSummary={id:string;revision:string;scope:'report'|'result';results:number|null;records:number;dates:string[];detailRecordId?:string;manageable?:boolean;savedAt?:string|null};
