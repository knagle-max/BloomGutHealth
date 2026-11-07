import { and, eq, sql } from "drizzle-orm";
import { healthSourceConsents, healthObservations } from "../shared/schema";
import { healthImportConsentSchema, reconcileHealthBatch, type HealthImportConsent } from "../shared/health-reconciliation";
import { healthObservationSchema, healthObservationKey, type HealthObservation } from "../shared/health-ingestion";
import { encryptPrecision, decryptPrecision } from "./precision-crypto";
import type { db as appDatabase } from "./db";

type Database = Pick<typeof appDatabase, "select" | "insert" | "update" | "delete" | "transaction">;

/** Internal-only storage service; do not expose ingestion as a public API
 * until a device authorization mechanism has been independently verified. */
export class HealthSourceStorage {
  constructor(private readonly db: Database) {}

  async getConsents(userId: string): Promise<HealthImportConsent[]> {
    const rows = await this.db.select().from(healthSourceConsents).where(eq(healthSourceConsents.userId,userId));
    return rows.map(row => healthImportConsentSchema.parse(decryptPrecision(row.encryptedPayload,userId)));
  }

  async saveConsent(userId: string, candidate: unknown): Promise<HealthImportConsent> {
    const consent = healthImportConsentSchema.parse(candidate);
    await this.db.insert(healthSourceConsents).values({
      userId, provider:consent.provider, encryptedPayload:encryptPrecision(consent,userId),
    }).onConflictDoUpdate({
      target:[healthSourceConsents.userId,healthSourceConsents.provider],
      set:{encryptedPayload:encryptPrecision(consent,userId),updatedAt:new Date()},
    });
    return consent;
  }

  async getObservations(userId:string):Promise<HealthObservation[]> {
    const rows = await this.db.select().from(healthObservations).where(eq(healthObservations.userId,userId)).limit(50000);
    return rows.map(row => healthObservationSchema.parse(decryptPrecision(row.encryptedPayload,userId)));
  }

  /** Atomic account-locked ingestion; consent and ownership are rechecked in
   * transaction. A verified native bridge must establish connector trust first.
   */
  async importVerified(userId:string, candidates:readonly unknown[], now=new Date()) {
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 4))`);
      const c=await tx.select().from(healthSourceConsents).where(eq(healthSourceConsents.userId,userId));
      const o=await tx.select().from(healthObservations).where(eq(healthObservations.userId,userId));
      const existing=o.map(row=>healthObservationSchema.parse(decryptPrecision(row.encryptedPayload,userId)));
      const consents=c.map(row=>healthImportConsentSchema.parse(decryptPrecision(row.encryptedPayload,userId)));
      const result=reconcileHealthBatch(existing,candidates,consents,now);
      const existingKeys=new Set(o.map(row=>row.sourceKey));
      const genuinelyNew=result.accepted.filter(item=>!existingKeys.has(healthObservationKey(item))).length;
      if(o.length+genuinelyNew>50000) throw Error("HEALTH_STORAGE_LIMIT");
      for(const observation of result.accepted) {
        const sourceKey=healthObservationKey(observation);
        await tx.insert(healthObservations).values({
          userId,sourceKey,encryptedPayload:encryptPrecision(observation,userId),
        }).onConflictDoUpdate({
          target:[healthObservations.userId,healthObservations.sourceKey],
          set:{encryptedPayload:encryptPrecision(observation,userId),updatedAt:new Date()},
        });
      }
      return {accepted:result.accepted.length,replayed:result.replayed,rejected:result.rejected,conflicts:result.conflicts};
    });
  }

  async clearProvider(userId:string,provider:"apple_health"|"health_connect") {
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 4))`);
      const rows=await tx.select().from(healthObservations).where(eq(healthObservations.userId,userId));
      for(const row of rows) {
        const observation=healthObservationSchema.parse(decryptPrecision(row.encryptedPayload,userId));
        if(observation.source.provider===provider)
          await tx.delete(healthObservations).where(and(eq(healthObservations.userId,userId),eq(healthObservations.sourceKey,row.sourceKey)));
      }
      await tx.delete(healthSourceConsents).where(and(eq(healthSourceConsents.userId,userId),eq(healthSourceConsents.provider,provider)));
    });
  }

  async clearAccount(userId:string) {
    await this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 4))`);
      await tx.delete(healthObservations).where(eq(healthObservations.userId,userId));
      await tx.delete(healthSourceConsents).where(eq(healthSourceConsents.userId,userId));
    });
  }
}
