import type {Lab} from './precision-nutrition';
export type LabHistoryRow=Lab&{id:string};
/** A source view over canonical active records, never a new panel or deduplication model. */
export function groupLabHistory(rows:readonly LabHistoryRow[]){
 const groups=new Map<string,{key:string;source:NonNullable<Lab['sourceReport']>;rows:LabHistoryRow[]}>(),unlinked:LabHistoryRow[]=[];
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
