import {createHash} from 'node:crypto';
/** Operator-only startup evidence; no accounts, grant contents, credentials,
 * connection strings, database names or health records are logged or read. */
export async function reviewRuntimeAudit(pool:{query(config:{text:string;query_timeout:number}):Promise<{rows:Record<string,unknown>[]}>},env:Record<string,string|undefined>){
 let endpoint='unavailable';
 try{const host=new URL(env.DATABASE_URL||'').hostname;const match=/^(ep-[a-z0-9-]+)\.[a-z0-9.-]+\.neon\.tech$/.exec(host);if(match)endpoint=match[1].replace(/-pooler$/,'');}catch{}
 const metadata={errorCode:null as string|null,event:'internal-review-readiness',serviceId:/^srv-[a-z0-9]+$/.test(env.RENDER_SERVICE_ID||'')?env.RENDER_SERVICE_ID:'unavailable',commit:/^[a-f0-9]{40}$/.test(env.RENDER_GIT_COMMIT||'')?env.RENDER_GIT_COMMIT:'unavailable',configuredNeonEndpoint:endpoint,
  configuration:{isolatedSyntheticFlag:env.BLOOM_EXPERIMENTAL_ENVIRONMENT==='isolated-synthetic',previewTerritoryPresent:!!env.BLOOM_PREVIEW_TERRITORY,baseTesterConfigurationPresent:!!env.BLOOM_INTERNAL_TESTERS,supplementalTesterConfigurationPresent:!!env.BLOOM_ADDITIONAL_INTERNAL_TESTER_GRANT,baseAdminConfigurationPresent:!!env.BLOOM_FEATURE_ADMINS,supplementalAdminConfigurationPresent:!!env.BLOOM_ADDITIONAL_FEATURE_ADMIN_GRANT},
  note:'Configuration and schema observations only; not verified account identity, dataset isolation, approval or provisioning.'};
 try{
  const result=await pool.query({query_timeout:5000,text:"SELECT current_database() AS database_name, to_regclass('capability_preferences') IS NOT NULL AS preferences_table_present, (SELECT count(*) = 4 FROM pg_attribute WHERE attrelid = to_regclass('capability_preferences') AND attnum > 0 AND NOT attisdropped AND attname IN ('user_id','enabled','grant_fingerprint','updated_at')) AS preferences_columns_present, COALESCE(has_table_privilege(current_user,to_regclass('capability_preferences'),'SELECT'),false) AS preferences_readable, COALESCE(has_table_privilege(current_user,to_regclass('capability_preferences'),'INSERT'),false) AS preferences_insertable, COALESCE(has_table_privilege(current_user,to_regclass('capability_preferences'),'UPDATE'),false) AS preferences_updatable"});
  const row=result.rows[0];
  return {...metadata,databaseNameHash:typeof row?.database_name==='string'?createHash('sha256').update(row.database_name).digest('hex'):'unavailable',preferenceAccess:{read:row?.preferences_readable===true,write:row?.preferences_insertable===true&&row?.preferences_updatable===true},preferenceStorage:row?.preferences_table_present!==true?'missing-table':row?.preferences_columns_present!==true?'missing-columns':'columns-present'};
 }catch(error){const candidate=(error as {code?:unknown})?.code;return {...metadata,databaseNameHash:'unavailable',preferenceStorage:'unavailable',errorCode:typeof candidate==='string'&&/^[A-Z0-9]{5}$/.test(candidate)?candidate:'unclassified'};}
}
