import {sql} from "drizzle-orm";
import {randomUUID} from "node:crypto";
import {encryptPrecision,decryptPrecision} from "./precision-crypto";
import {profileMeasurementFieldsSchema,profileMeasurementFieldsMatch,type ProfileMeasurementSource,type ProfileMeasurementWrite,type ProfileMeasurementFields} from "../shared/profile-measurement-source";
import {ProfileRevisionConflict,ProfileMeasurementMismatch} from "./profile-errors";
const purpose=(id:string)=>JSON.stringify(["profile-measurement-source-v1",id]);
export class ProfileMeasurementUnavailable extends Error{constructor(){super("Original-entry storage unavailable. Your Profile was not changed.");}}
export async function profileMeasurementStorageAvailable(database:any){const result=await database.execute(sql`SELECT to_regclass('public.profile_measurement_sources') AS relation`);return !!result.rows[0]?.relation;}
export async function readProfileMeasurementSource(database:any,id:string,values:{heightCm?:number|null;weightKg?:number|null}):Promise<ProfileMeasurementSource>{
 if(!await profileMeasurementStorageAvailable(database))return{available:false};
 const result=await database.execute(sql`SELECT revision,encrypted_payload FROM profile_measurement_sources WHERE user_id=${id}`);const row=result.rows[0];
 if(!row)return{available:true,revision:"none",fields:{}};
 const fields=profileMeasurementFieldsSchema.parse(decryptPrecision(row.encrypted_payload,purpose(id)));
 if(!profileMeasurementFieldsMatch(fields,values))throw Error("Profile entry source does not match saved values");
 return{available:true,revision:row.revision,fields};
}
export async function updateProfileMeasurementSource(tx:any,id:string,current:any,next:any,write?:ProfileMeasurementWrite){
 const available=await profileMeasurementStorageAvailable(tx);
 if(!available){if(write)throw new ProfileMeasurementUnavailable();return;}
 const source=await readProfileMeasurementSource(tx,id,current);
 if(!source.available)throw new ProfileMeasurementUnavailable();
 if(write&&write.expectedRevision!==source.revision)throw new ProfileRevisionConflict();
 if(write&&!profileMeasurementFieldsMatch(write.fields,next))throw new ProfileMeasurementMismatch("Original entry does not match saved Profile");
 const fields:ProfileMeasurementFields={...source.fields};
 for(const key of["height","weight"]as const){const column=key==="height"?"heightCm":"weightKg";
  if(current[column]!==next[column])delete fields[key];
 }
 Object.assign(fields,write?.fields??{});
 // No row/key required for old accounts until actual original tokens are captured.
 if(source.revision==="none"&&!Object.keys(fields).length)return;
 if(JSON.stringify(fields)===JSON.stringify(source.fields))return;
 const encrypted=encryptPrecision(fields,purpose(id)),revision=randomUUID();
 await tx.execute(sql`INSERT INTO profile_measurement_sources(user_id,revision,encrypted_payload) VALUES(${id},${revision},${JSON.stringify(encrypted)}::jsonb) ON CONFLICT(user_id) DO UPDATE SET revision=EXCLUDED.revision,encrypted_payload=EXCLUDED.encrypted_payload`);
}
