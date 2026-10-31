import {preserveSoftDislikes} from "./preference-source";
import type {DietaryPreferences} from "../shared/meal-intelligence";
import {createHash} from "node:crypto";
import {eq} from "drizzle-orm";
import {users,type UpdateUserProfile} from "../shared/schema";
/** Current Profile inputs only: unrelated preferences do not invalidate a demographic draft. */
export function profileRevision(profile:{id:string;sex?:string|null;age?:number|null;heightCm?:number|null;weightKg?:number|null;activityLevel?:string|null}) {
 return createHash("sha256").update(JSON.stringify([profile.id,profile.sex??null,profile.age??null,profile.heightCm??null,profile.weightKg??null,profile.activityLevel??null])).digest("hex");
}
export class ProfileRevisionConflict extends Error {constructor(){super("Saved profile changed. Your draft was not applied; reload the latest saved profile before saving again.");}}
/** Row lock makes revision comparison and update indivisible across application replicas. */
export async function updateProfileWithRevision(database:any,id:string,profile:UpdateUserProfile,expectedRevision?:string):Promise<void> {
 if(expectedRevision===undefined&&profile.dietaryPreferences===undefined){await database.update(users).set(profile).where(eq(users.id,id));return;}
 await database.transaction(async(tx:any)=>{
  const [current]=await tx.select().from(users).where(eq(users.id,id)).for("update");
  if(!current||(expectedRevision!==undefined&&profileRevision(current)!==expectedRevision))throw new ProfileRevisionConflict();
  const next=profile.dietaryPreferences&&typeof profile.dietaryPreferences==="object"?{...profile,dietaryPreferences:preserveSoftDislikes(current.dietaryPreferences,profile.dietaryPreferences as DietaryPreferences)}:profile;
  await tx.update(users).set(next).where(eq(users.id,id));
 });
}
