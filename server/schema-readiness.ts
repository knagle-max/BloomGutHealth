import {getTableConfig} from "drizzle-orm/pg-core";
import {users, meals, microbiomeSamples, bacterialComposition, metabolites, healthImpacts, mlAnalyses, recommendations, precisionProfiles, precisionRecords, nutritionProducts, experienceSettings, experienceRecords, experimentVersions, profileMeasurementSources, healthSourceConsents, healthObservations, capabilityPreferences} from "../shared/schema";

// These are schema contracts, not claims that data, consent or integrations are ready.
// Optional storage must remain distinguishable from prerequisites for account workflows.
export const schemaContracts = [
 ...[users, meals, microbiomeSamples, bacterialComposition, metabolites, healthImpacts, mlAnalyses, recommendations, precisionProfiles, precisionRecords, nutritionProducts, experienceSettings, experienceRecords, experimentVersions, profileMeasurementSources].map(table => ({...contract(table), required:true})),
 {name:"session", columns:["sid","sess","expire"], required:true},
 ...[healthSourceConsents, healthObservations, capabilityPreferences].map(table => ({...contract(table), required:false})),
];
function contract(table: Parameters<typeof getTableConfig>[0]) {
 const config=getTableConfig(table);
 return {name:config.name, columns:config.columns.map(column=>column.name)};
}
const literal=(value:string)=>"'"+value.replaceAll("'","''")+"'";
// A single bounded catalog-only SELECT: no account records, migrations or writes.
export const schemaReadinessQuery = `WITH expected(table_name, column_name) AS (VALUES ${schemaContracts.flatMap(table=>table.columns.map(column=>`(${literal(table.name)},${literal(column)})`)).join(",")})
SELECT e.table_name, e.column_name,
 to_regclass(e.table_name) IS NOT NULL AS table_present,
 EXISTS(SELECT 1 FROM pg_attribute a WHERE a.attrelid=to_regclass(e.table_name) AND a.attnum>0 AND NOT a.attisdropped AND a.attname=e.column_name) AS column_present,
 COALESCE(has_table_privilege(current_user,to_regclass(e.table_name),'SELECT'),false) AS readable,
 COALESCE(has_table_privilege(current_user,to_regclass(e.table_name),'INSERT'),false) AS insertable,
 COALESCE(has_table_privilege(current_user,to_regclass(e.table_name),'UPDATE'),false) AS updatable,
 COALESCE(has_table_privilege(current_user,to_regclass(e.table_name),'DELETE'),false) AS deletable
FROM expected e`;
export async function schemaReadinessAudit(pool:{query(config:{text:string;query_timeout:number}):Promise<{rows:Record<string,unknown>[]}>}, phase:"runtime"|"before-app-start"="runtime") {
 try {
  const {rows}=await pool.query({text:schemaReadinessQuery,query_timeout:5000});
  const storage=schemaContracts.map(contract=>{
   const records=rows.filter(row=>row.table_name===contract.name);
   const present=records.length===contract.columns.length && records.every(row=>row.table_present===true);
   const missingColumns=contract.columns.filter(column=>!records.some(row=>row.column_name===column && row.column_present===true));
   const access={read:records.length>0&&records.every(row=>row.readable===true),write:records.length>0&&records.every(row=>row.insertable===true&&row.updatable===true&&row.deletable===true)};
   return {table:contract.name,required:contract.required,status:!present?'missing-table':missingColumns.length?'missing-columns':!access.read||!access.write?'insufficient-access':'available',missingColumns,access};
  });
  return {event:'application-schema-readiness',status:storage.some(table=>table.required&&!(phase==='before-app-start'&&table.table==='session')&&table.status!=='available')?'incomplete':phase==='before-app-start'?'pre-bootstrap-catalog-ready':'catalog-ready',phase,storage,note:'Catalog and table privileges only; does not verify constraints, encryption, data isolation, consent, sequence privileges or successful user workflows.'};
 } catch(error) {
  const code=(error as {code?:unknown})?.code;
  return {event:'application-schema-readiness',status:'unavailable',errorCode:typeof code==='string'&&/^[A-Z0-9]{5}$/.test(code)?code:'unclassified'};
 }
}
