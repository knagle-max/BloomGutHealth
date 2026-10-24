import bcrypt from "bcrypt";
import { eq, inArray, sql } from "drizzle-orm";
import { users, meals, microbiomeSamples, bacterialComposition, metabolites, healthImpacts, mlAnalyses, recommendations, precisionProfiles, precisionRecords, nutritionProducts, experienceSettings, experienceRecords, healthSourceConsents, healthObservations } from "../shared/schema";
import type { db as appDatabase } from "./db";
export class AccountErasureError extends Error {
  constructor(readonly reason:"credentials"|"unavailable") {super("Account deletion unavailable");}
}
export class AccountErasureStorage {
  constructor(private readonly db:Pick<typeof appDatabase,"transaction">) {}
  async eraseAccount(userId:string,password:string) {
    try {await this.db.transaction(async tx=>{
      await tx.execute(sql`SET LOCAL statement_timeout = '20s'`);
      for(const lock of [0,1,4])await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, ${lock}))`);
      const [user]=await tx.select({id:users.id,password:users.password}).from(users).where(eq(users.id,userId)).for("update");
      if(!user||user.id==="demo-user-123"||!await bcrypt.compare(password,user.password))throw new AccountErasureError("credentials");
      // Lock the parent before deleting children: concurrent FK inserts must wait for deletion/rollback.
      const ownSamples=tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(eq(microbiomeSamples.userId,userId));
      const ownMetabolites=tx.select({id:metabolites.id}).from(metabolites).where(inArray(metabolites.sampleId,ownSamples));
      await tx.delete(recommendations).where(inArray(recommendations.sampleId,ownSamples));
      await tx.delete(healthImpacts).where(inArray(healthImpacts.metaboliteId,ownMetabolites));
      await tx.delete(mlAnalyses).where(inArray(mlAnalyses.sampleId,ownSamples));
      await tx.delete(metabolites).where(inArray(metabolites.sampleId,ownSamples));
      await tx.delete(bacterialComposition).where(inArray(bacterialComposition.sampleId,ownSamples));
      await tx.delete(microbiomeSamples).where(eq(microbiomeSamples.userId,userId));
      await tx.delete(meals).where(eq(meals.userId,userId));
      await tx.delete(precisionRecords).where(eq(precisionRecords.userId,userId));
      await tx.delete(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      await tx.delete(nutritionProducts).where(eq(nutritionProducts.userId,userId));
      await tx.delete(experienceRecords).where(eq(experienceRecords.userId,userId));
      await tx.delete(experienceSettings).where(eq(experienceSettings.userId,userId));
      const optional=await tx.execute<{consents:string|null;observations:string|null;sessions:string|null}>(sql`SELECT to_regclass('health_source_consents')::text AS consents,to_regclass('health_observations')::text AS observations,to_regclass('session')::text AS sessions`);
      if(optional.rows[0].consents)await tx.delete(healthSourceConsents).where(eq(healthSourceConsents.userId,userId));
      if(optional.rows[0].observations)await tx.delete(healthObservations).where(eq(healthObservations.userId,userId));
      // Fail closed if the expected persistent session store cannot be revoked atomically.
      if(!optional.rows[0].sessions)throw new AccountErasureError("unavailable");
      await tx.execute(sql`DELETE FROM "session" WHERE sess->>'userId' = ${userId}`);
      await tx.delete(users).where(eq(users.id,userId));
    });}catch(error){if(error instanceof AccountErasureError)throw error;throw new AccountErasureError("unavailable");}
  }
}
