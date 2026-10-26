import {possibleLabReimports} from "../shared/lab-reimport";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {labDateChangeSchema,applyLabDateChange,type LabDateChange} from "../shared/lab-date-correction";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { precisionProfiles, precisionRecords, users } from "../shared/schema";
import { labSchema, sourceOnlyLabSchema, contextSchema, activeLabObservations, activeLabRows, type Lab, type SourceOnlyLab } from "../shared/precision-nutrition";
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
export class LabImportReviewRequired extends Error {
  constructor(readonly matchedIds:string[]){super("LAB_REIMPORT_REVIEW_REQUIRED");}
}
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
  insertReviewedLab(userId:string,payload:unknown,saveKey:string,reviewedMatches:readonly string[]){
    if(!/^[A-Za-z0-9_-]{8,128}$/.test(saveKey))throw Error("LAB_SOURCE_CHANGED");
    return this.insertPrecisionRecord(userId,"lab",payload,saveKey,reviewedMatches);
  }
  async insertPrecisionRecord(
    userId: string,
    kind: string,
    payload: unknown,
    saveKey?: string,
    reviewedLabMatches?:readonly string[],
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
      if (kind === "lab" && plan?.dateCorrection && plan?.unitReview?.status !== "confirmed") throw Error("LAB_SOURCE_CHANGED");
      if(reviewedLabMatches!==undefined){
        const known=labSchema.safeParse(payload),raw=sourceOnlyLabSchema.safeParse(payload);
        const incoming=known.success?known.data:raw.success?raw.data:null;
        if(kind!=="lab"||!saveKey||!incoming||incoming.dateCorrection||("unitReview" in incoming&&incoming.unitReview&&(incoming.unitReview.status!=="pending"||incoming.unitReview.confirmedAt!==null||incoming.unitReview.supersedes!==null||incoming.value!==incoming.unitReview.originalValue)))throw Error("LAB_SOURCE_CHANGED");
        const owned=await tx.select({id:precisionRecords.id,encryptedPayload:precisionRecords.encryptedPayload}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
        const rows=owned.map(row=>{
          const decoded=decryptPrecision(row.encryptedPayload,userId),supported=labSchema.safeParse(decoded),source=sourceOnlyLabSchema.safeParse(decoded);
          if(!supported.success&&!source.success)throw Error("LAB_SOURCE_CHANGED");
          return {...(supported.success?supported.data:source.data!),id:row.id};
        });
        const expected=possibleLabReimports(incoming,activeLabRows(rows)).map(row=>row.id).sort();
        if(JSON.stringify(expected)!==JSON.stringify([...reviewedLabMatches].sort()))throw new LabImportReviewRequired(expected);
      }
      if (kind === "lab" && plan?.unitReview?.status === "confirmed") {
        const owned = await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
        const decoded = owned.map(r=>({...r,payload:decryptPrecision(r.encryptedPayload,userId) as any}));
        const supported=decoded.flatMap(row=>{const parsed=labSchema.safeParse(row.payload);return parsed.success?[{...parsed.data,id:row.id}]:[];});
        const active=activeLabRows(supported);
        const prior = active.find(row=>row.unitReview?.supersedes===plan.unitReview.supersedes);
        const source = decoded.find(r=>r.id===plan.unitReview.supersedes);
        const parsed = labSchema.safeParse(source?.payload);
        if(!parsed.success||!isDeepStrictEqual(parsed.data.dateCorrection,plan.dateCorrection))throw Error("LAB_SOURCE_CHANGED");
        if(prior){const record=decoded.find(row=>row.id===prior.id)!;return {id:record.id,kind:record.kind,payload:record.payload,createdAt:record.createdAt};}
        if(!active.some(row=>row.id===source?.id))throw Error("LAB_SOURCE_CHANGED");
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
  async correctLabDate(userId: string, sourceId: string, input: LabDateChange, saveKey: string): Promise<PrecisionRecord> {
    const request = labDateChangeSchema.parse(input);
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(saveKey)) throw Error("LAB_DATE_INVALID");
    const id = createHash("sha256").update(JSON.stringify(["lab-date-v1", userId, saveKey])).digest("hex");
    const fingerprint = createHash("sha256").update(JSON.stringify([sourceId, request])).digest("hex");
    return this.db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
      const [receipt] = await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      if (receipt) {
        const payload = decryptPrecision(receipt.encryptedPayload,userId);
        const known = labSchema.safeParse(payload), raw = sourceOnlyLabSchema.safeParse(payload);
        const parsed = known.success ? known.data : raw.success ? raw.data : null;
        if(receipt.kind!=="lab"||parsed?.dateCorrection?.requestFingerprint!==fingerprint)throw Error("PRECISION_SAVE_CONFLICT");
        return {id:receipt.id,kind:receipt.kind,payload:parsed,createdAt:receipt.createdAt};
      }
      const rows = await tx.select({id:precisionRecords.id,encryptedPayload:precisionRecords.encryptedPayload})
        .from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
      if(!rows.some(row=>row.id===sourceId))throw Error("LAB_NOT_FOUND");
      const parsedRows = rows.map(row=>{
        const payload=decryptPrecision(row.encryptedPayload,userId), known=labSchema.safeParse(payload), raw=sourceOnlyLabSchema.safeParse(payload);
        if(!known.success&&!raw.success)throw Error("LAB_SOURCE_CHANGED");
        return {...(known.success?known.data:raw.data!),id:row.id};
      });
      const source=activeLabRows(parsedRows).find(row=>row.id===sourceId);
      if(!source)throw Error("LAB_SOURCE_CHANGED");
      const {id:_sourceId,...payload}=source;
      const corrected=applyLabDateChange(payload,sourceId,request,fingerprint,new Date().toISOString());
      const [row]=await tx.insert(precisionRecords).values({id,userId,kind:"lab",encryptedPayload:encryptPrecision(corrected,userId)}).returning();
      if("marker" in corrected&&corrected.unitReview?.status!=="pending")
        await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"plan")));
      return {id:row.id,kind:row.kind,payload:corrected,createdAt:row.createdAt};
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
      const raw: (SourceOnlyLab & {id:string})[] = [];
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
        } else {
          const parsedRaw=sourceOnlyLabSchema.safeParse(payload);
          if(!parsedRaw.success)throw Error("LAB_SOURCE_CHANGED");
          raw.push({...parsedRaw.data,id:row.id});
        }
      }
      for(const row of [...supported,...raw]){
        const parent=row.dateCorrection?.supersedes;
        if(parent&&links.has(parent)){links.get(row.id)!.add(parent);links.get(parent)!.add(row.id);}
      }
      const active = activeLabObservations(supported);
      if (!activeLabRows([...supported,...raw]).some(row => row.id === id))
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
