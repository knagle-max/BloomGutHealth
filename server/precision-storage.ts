import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { precisionProfiles, precisionRecords, users } from "../shared/schema";
import { labSchema, sourceOnlyLabSchema, contextSchema, activeLabObservations, type Lab } from "../shared/precision-nutrition";
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
          // Only lab payloads need classification; do not transfer wide genetics/plan blobs.
          .select({ id: precisionRecords.id, kind: precisionRecords.kind,
            labPayload: sql<unknown>`CASE WHEN ${precisionRecords.kind} = 'lab' THEN ${precisionRecords.encryptedPayload} ELSE NULL END` })
          .from(precisionRecords)
          .where(eq(precisionRecords.userId, userId))
          .orderBy(desc(precisionRecords.createdAt));
        const supportedLabs:Array<Lab&{id:string}>=[],unresolvedLabs=new Set<string>();
        for(const record of records.filter(row=>row.kind==="lab")){
          const payload=decryptPrecision(record.labPayload,userId),supported=labSchema.safeParse(payload);
          if(supported.success)supportedLabs.push({...supported.data,id:record.id});
          else if(!sourceOnlyLabSchema.safeParse(payload).success)unresolvedLabs.add(record.id);
        }
        if(unresolvedLabs.size)throw Error("PRECISION_INPUTS_CHANGED");
        const clinicalLabIds=new Set(activeLabObservations(supportedLabs).labs.map(row=>row.id));
        const latestGenetics = records.find((r) => r.kind === "genetics");
        const sourceIds = records
          .filter(
            (r) =>
              (r.kind === "lab" && clinicalLabIds.has(r.id)) ||
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
  // Explicit logical-entry deletion; the legacy record endpoint remains row-only.
  async deleteLabEntry(userId: string, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
      const rows = await tx.select({ id: precisionRecords.id, encryptedPayload: precisionRecords.encryptedPayload })
        .from(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "lab")));
      if (!rows.some(row => row.id === id)) return; // Idempotent, same response for absent/foreign IDs.
      const supported: (Lab & { id: string })[] = [];
      const links = new Map<string, Set<string>>(rows.map(row => [row.id, new Set<string>()]));
      for (const row of rows) {
        const payload = decryptPrecision(row.encryptedPayload, userId);
        const parsed = labSchema.safeParse(payload);
        if (parsed.success) {
          supported.push({ ...parsed.data, id: row.id });
          const parent = parsed.data.unitReview?.supersedes;
          if (parent && links.has(parent)) {
            links.get(row.id)!.add(parent);
            links.get(parent)!.add(row.id);
          }
        } else if (!sourceOnlyLabSchema.safeParse(payload).success) {
          throw Error("LAB_SOURCE_CHANGED");
        }
      }
      const active = activeLabObservations(supported);
      if (supported.some(row => row.id === id) && ![...active.labs, ...active.pendingLabs].some(row => row.id === id))
        throw Error("LAB_SOURCE_CHANGED");
      const ids = [id], seen = new Set(ids);
      for (let index = 0; index < ids.length; index++) {
        for (const linked of Array.from(links.get(ids[index])!)) {
          if (!seen.has(linked)) { seen.add(linked); ids.push(linked); }
        }
      }
      await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "lab"), inArray(precisionRecords.id, ids)));
      if (active.labs.some(row => seen.has(row.id)))
        await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "plan")));
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
         .returning({ id: precisionRecords.id, kind: precisionRecords.kind,
          labPayload:sql<unknown>`CASE WHEN ${precisionRecords.kind} = 'lab' THEN ${precisionRecords.encryptedPayload} ELSE NULL END` });
      if (!removed.length) return false;
      let sourceOnly=false;
      if(removed[0].kind==="lab")try{sourceOnly=sourceOnlyLabSchema.safeParse(decryptPrecision(removed[0].labPayload,userId)).success;}catch{/* Unreadable sources retain conservative plan invalidation. */}
      // Validated raw-only facts never entered a clinical plan's input set.
      if (removed[0].kind !== "plan" && !sourceOnly)
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
