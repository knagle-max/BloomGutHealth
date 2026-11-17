import {ProfileRevisionConflict} from "./profile-errors";
import {updateProfileMeasurementSource,readProfileMeasurementSource} from "./profile-measurement-source";
import type {ProfileMeasurementWrite} from "../shared/profile-measurement-source";
import {preserveSoftDislikes} from "./preference-source";
import type {DietaryPreferences} from "../shared/meal-intelligence";
import {createHash} from "node:crypto";
import {eq} from "drizzle-orm";
import {users,type UpdateUserProfile} from "../shared/schema";
/** Current Profile inputs only: unrelated preferences do not invalidate a demographic draft. */
export function profileRevision(profile:{id:string;sex?:string|null;age?:number|null;heightCm?:number|null;weightKg?:number|null;activityLevel?:string|null},birthYear:number|null=null) {
 return createHash("sha256").update(JSON.stringify([profile.id,profile.sex??null,profile.age??null,profile.heightCm??null,profile.weightKg??null,profile.activityLevel??null,...(birthYear===null?[]:[birthYear])])).digest("hex");
}
export {ProfileRevisionConflict} from "./profile-errors";
/** Row lock makes revision comparison and update indivisible across application replicas. */
export async function updateProfileWithRevision(database:any,id:string,profile:UpdateUserProfile,expectedRevision?:string,measurementSource?:ProfileMeasurementWrite):Promise<void> {
 await database.transaction(async(tx:any)=>{
  const [current]=await tx.select().from(users).where(eq(users.id,id)).for("update");
  const source=current?await readProfileMeasurementSource(tx,id,current):null,birthYear=source?.available?source.fields.birthYear??null:null;
  if(!current||(expectedRevision!==undefined&&profileRevision(current,birthYear)!==expectedRevision))throw new ProfileRevisionConflict();
  const {birthYear:nextBirthYear,...columns}=profile;
  const next=columns.dietaryPreferences&&typeof profile.dietaryPreferences==="object"?{...columns,dietaryPreferences:preserveSoftDislikes(current.dietaryPreferences,columns.dietaryPreferences as DietaryPreferences)}:columns;
  const saved=Object.keys(next).length?(await tx.update(users).set(next).where(eq(users.id,id)).returning())[0]:current;
  await updateProfileMeasurementSource(tx,id,current,saved,measurementSource,nextBirthYear);
 });
}
