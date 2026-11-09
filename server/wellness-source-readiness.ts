import {sql} from 'drizzle-orm';
import type {db} from './db';
const columns={meals:['id','user_id','meal_text','meal_type','logged_at','nutritional_data','meal_context','intelligence','total_calories','total_protein','total_carbs','total_fat'],precision_records:['id','user_id','kind','encrypted_payload','created_at']}as const;
/** Optional sources must not abort a consistent read-only context transaction. */
export async function optionalWellnessSourceReadable(tx:Pick<typeof db,'execute'>,table:keyof typeof columns){
 const required=columns[table],qualified='public.'+table;
 const result=await tx.execute(sql`SELECT COALESCE(has_table_privilege(to_regclass(${qualified}),'SELECT'),false) AND (SELECT count(*)=${required.length} FROM information_schema.columns WHERE table_schema='public' AND table_name=${table} AND column_name IN (${sql.join(required.map(name=>sql`${name}`),sql`, `)})) AS available`);
 const row=(Array.isArray(result)?result:(result as {rows?:unknown[]}).rows)?.[0]as{available?:boolean}|undefined;
 return row?.available===true;
}
