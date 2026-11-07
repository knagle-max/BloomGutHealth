import {createHash} from "node:crypto";
import {eq} from "drizzle-orm";
import {users} from "../shared/schema";
import {preferenceSchema,type DietaryPreferences} from "../shared/meal-intelligence";
/** Unaware preference editors preserve the newer explicit taste choices. */
export function preserveSoftDislikes(previous:unknown,next:DietaryPreferences):DietaryPreferences{
 if(next.softDislikes!==undefined)return next;
 if(previous&&typeof previous==="object"&&"softDislikes" in previous&&previous.softDislikes!==undefined)return{...next,softDislikes:preferenceSchema.shape.softDislikes.parse(previous.softDislikes)};
 return next;
}
/** Hash the actual stored JSONB source, including absence, independently of Profile inputs. */
export const preferenceRevision=(userId:string,stored:unknown)=>createHash("sha256").update(JSON.stringify([userId,stored??null])).digest("hex");
export class PreferenceRevisionConflict extends Error{constructor(){super("Saved food preferences changed. Your draft was not applied; review the latest saved preferences before saving again.");}}
export async function updatePreferencesWithRevision(database:any,userId:string,preferences:DietaryPreferences,expectedRevision:string):Promise<void>{
 await database.transaction(async(tx:any)=>{
  const[current]=await tx.select().from(users).where(eq(users.id,userId)).for("update");
  if(!current||preferenceRevision(userId,current.dietaryPreferences)!==expectedRevision)throw new PreferenceRevisionConflict();
  await tx.update(users).set({dietaryPreferences:preserveSoftDislikes(current.dietaryPreferences,preferences)}).where(eq(users.id,userId));
 });
}
