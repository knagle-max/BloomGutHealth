import { eq, and, desc, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { precisionProfiles, precisionRecords, users } from "../shared/schema";
import { labSchema, contextSchema } from "../shared/precision-nutrition";
import {
  preferenceSchema,
  defaultPreferences,
} from "../shared/meal-intelligence";
import { encryptPrecision, decryptPrecision } from "./precision-crypto";
import type {
  PrecisionContext,
  PrecisionRecord,
} from "../shared/precision-nutrition";
import type { db as appDatabase } from "./db";

type PrecisionDatabase = Pick<
  typeof appDatabase,
  "select" | "insert" | "delete" | "transaction"
>;
export class PrecisionStorage {
  constructor(private readonly db: PrecisionDatabase) {}
  async getPrecisionContext(userId: string): Promise<unknown> {
    const [row] = await this.db
      .select()
      .from(precisionProfiles)
      .where(eq(precisionProfiles.userId, userId));
    return row ? decryptPrecision(row.encryptedContext, userId) : undefined;
  }
  async putPrecisionContext(
    userId: string,
    context: PrecisionContext,
  ): Promise<void> {
    const encryptedContext = encryptPrecision(context, userId);
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      await tx
        .insert(precisionProfiles)
        .values({ userId, encryptedContext })
        .onConflictDoUpdate({
          target: precisionProfiles.userId,
          set: { encryptedContext, updatedAt: new Date() },
        });
    });
  }
  async getPrecisionRecords(userId: string): Promise<PrecisionRecord[]> {
    const rows = await this.db
      .select()
      .from(precisionRecords)
      .where(eq(precisionRecords.userId, userId))
      .orderBy(desc(precisionRecords.createdAt));
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      payload: decryptPrecision(row.encryptedPayload, userId),
      createdAt: row.createdAt,
    }));
  }
  async insertPrecisionRecord(
    userId: string,
    kind: string,
    payload: unknown,
    saveKey?: string,
  ): Promise<PrecisionRecord> {
    const encryptedPayload = encryptPrecision(payload, userId);
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      const id = saveKey ? createHash("sha256").update(JSON.stringify(["precision-save-v1",userId,saveKey])).digest("hex") : undefined;
      if(id){
        const [existing]=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.id,id),eq(precisionRecords.userId,userId)));
        if(existing){
          const decoded=decryptPrecision(existing.encryptedPayload,userId);
          if(existing.kind!==kind||!isDeepStrictEqual(decoded,payload))throw Error("PRECISION_SAVE_CONFLICT");
          return {id:existing.id,kind:existing.kind,payload:decoded,createdAt:existing.createdAt};
        }
      }
      const plan = payload as any;
      if (kind === "lab" && plan?.unitReview?.status === "confirmed") {
        const owned = await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
        const decoded = owned.map(r=>({...r,payload:decryptPrecision(r.encryptedPayload,userId) as any}));
        const prior = decoded.find(r=>r.payload?.unitReview?.supersedes===plan.unitReview.supersedes);
        if(prior) return {id:prior.id,kind:prior.kind,payload:prior.payload,createdAt:prior.createdAt};
        const source = decoded.find(r=>r.id===plan.unitReview.supersedes);
        const parsed = labSchema.safeParse(source?.payload);
        if(!parsed.success || parsed.data.unitReview?.status!=="pending" ||
          parsed.data.unitReview.originalValue!==plan.value || parsed.data.marker!==plan.marker)
          throw Error("LAB_SOURCE_CHANGED");
      }

      if (kind === "plan" && plan?.type === "weekly-plan") {
        const [profile] = await tx
          .select()
          .from(precisionProfiles)
          .where(eq(precisionProfiles.userId, userId));
        const [user] = await tx
          .select({ dietaryPreferences: users.dietaryPreferences })
          .from(users)
          .where(eq(users.id, userId))
          .for("share");
        const currentPrefs = preferenceSchema.safeParse(
          user?.dietaryPreferences,
        );
        if (
          !profile ||
          JSON.stringify(
            contextSchema.parse(
              decryptPrecision(profile.encryptedContext, userId),
            ),
          ) !== JSON.stringify(plan.inputGuard?.context) ||
          JSON.stringify(
            currentPrefs.success ? currentPrefs.data : defaultPreferences,
          ) !== JSON.stringify(plan.inputGuard?.preferences)
        )
          throw Error("PRECISION_INPUTS_CHANGED");
        const records = await tx
          .select({ id: precisionRecords.id, kind: precisionRecords.kind })
          .from(precisionRecords)
          .where(eq(precisionRecords.userId, userId))
          .orderBy(desc(precisionRecords.createdAt));
        const latestGenetics = records.find((r) => r.kind === "genetics");
        const sourceIds = records
          .filter(
            (r) =>
              r.kind === "lab" ||
              r.kind === "metabolite" ||
              r.id === latestGenetics?.id,
          )
          .map((r) => r.id);
        if (
          !Array.isArray(plan.inputGuard?.sourceRecordIds) ||
          plan.inputGuard.sourceRecordIds.length !== sourceIds.length ||
          !plan.inputGuard.sourceRecordIds.every((id: string) =>
            sourceIds.includes(id),
          )
        )
          throw Error("PRECISION_INPUTS_CHANGED");
      }
      const [row] = await tx
        .insert(precisionRecords)
        .values({ ...(id?{id}:{}), userId, kind, encryptedPayload })
        .returning();
      return { id: row.id, kind: row.kind, payload, createdAt: row.createdAt };
    });
  }
  async deletePrecisionRecord(userId: string, id: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      const removed = await tx
        .delete(precisionRecords)
        .where(
          and(eq(precisionRecords.userId, userId), eq(precisionRecords.id, id)),
        )
        .returning({ id: precisionRecords.id, kind: precisionRecords.kind });
      if (!removed.length) return false;
      // Any derived plan can contain conclusions based on the removed source.
      if (removed[0].kind !== "plan")
        await tx
          .delete(precisionRecords)
          .where(
            and(
              eq(precisionRecords.userId, userId),
              eq(precisionRecords.kind, "plan"),
            ),
          );
      return true;
    });
  }
  async clearPrecisionData(userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      await tx
        .delete(precisionRecords)
        .where(eq(precisionRecords.userId, userId));
      await tx
        .delete(precisionProfiles)
        .where(eq(precisionProfiles.userId, userId));
    });
  }
}
