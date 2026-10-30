import type {Lab,SourceOnlyLab} from './precision-nutrition';
export type LabHistoryRow=Lab&{id:string};
export type AnyLabHistoryRow=LabHistoryRow|(SourceOnlyLab&{id:string});
/** A source view over canonical active records, never a new panel or deduplication model. */
export function groupLabHistory<Row extends AnyLabHistoryRow>(rows:readonly Row[]){
 const groups=new Map<string,{key:string;source:NonNullable<Lab['sourceReport']>;rows:Row[]}>(),unlinked:Row[]=[];
 for(const row of rows){
  const source=row.sourceReport;
  if(!source){unlinked.push(row);continue;}
  // Split inconsistent identifiers rather than assigning the first row's context to others.
  const key=JSON.stringify([source.importId,source.reportIdentifier??null,source.specimenIdentifier??null]);
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
 return last.value-first.value;
}
