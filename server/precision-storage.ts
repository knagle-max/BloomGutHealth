import { eq, and, desc } from "drizzle-orm";
import { precisionProfiles, precisionRecords } from "../shared/schema";
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
    await this.db
      .insert(precisionProfiles)
      .values({ userId, encryptedContext })
      .onConflictDoUpdate({
        target: precisionProfiles.userId,
        set: { encryptedContext, updatedAt: new Date() },
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
  ): Promise<PrecisionRecord> {
    const encryptedPayload = encryptPrecision(payload, userId);
    const [row] = await this.db
      .insert(precisionRecords)
      .values({ userId, kind, encryptedPayload })
      .returning();
    return { id: row.id, kind: row.kind, payload, createdAt: row.createdAt };
  }
  async deletePrecisionRecord(userId: string, id: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
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
      await tx
        .delete(precisionRecords)
        .where(eq(precisionRecords.userId, userId));
      await tx
        .delete(precisionProfiles)
        .where(eq(precisionProfiles.userId, userId));
    });
  }
}
