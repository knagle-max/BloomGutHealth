import { createHash } from 'node:crypto';
import type { Pool } from 'pg';
import { z } from 'zod';
import { capabilityControlSchema, type CapabilityControl } from './effective-capability';
import { encryptPrecision, decryptPrecision } from './precision-crypto';
import registry from '../docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json';
const identifier = z.string().regex(/^[A-Za-z0-9_.:/-]{1,120}$/);
const bindingSchema = z.object({ serviceId: z.string().regex(/^srv-[a-z0-9]+$/), environment: z.enum(['development-review', 'isolated-synthetic']), featureId: identifier }).strict();
export type FeatureControlBinding = z.infer<typeof bindingSchema>;
export const featureControlChangeSchema = z.object({ binding: bindingSchema, actorId: identifier, requestId: z.uuid(), expectedRevision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1), reason: z.string().trim().min(1).max(500), action: z.enum(['enable','pause','rollback','emergency-disable']).optional(), control: capabilityControlSchema }).strict();
export type FeatureControlChange = z.infer<typeof featureControlChangeSchema>;
const eventSchema = featureControlChangeSchema.extend({ recordedAt: z.string().datetime({ offset: true }) });
export type FeatureControlAccess = {
    operation: 'read';
    binding: FeatureControlBinding;
    actorId: string;
} | {
    operation: 'write';
    change: FeatureControlChange;
};
export interface FeatureControlQuery {
    query(sql: string, values?: any[]): Promise<{
        rows: any[];
    }>;
}
export type FeatureControlTransaction = <T>(work: (db: FeatureControlQuery) => Promise<T>) => Promise<T>;
export class FeatureControlStorageError extends Error {
    constructor(public readonly code: 'INVALID_REQUEST' | 'ACCESS_DENIED' | 'CONFLICT' | 'UNAVAILABLE') { super(`Feature control storage: ${code}`); }
}
const fail = (code: FeatureControlStorageError['code']): never => { throw new FeatureControlStorageError(code); };
const aad = (binding: FeatureControlBinding, kind: 'state' | 'event', revision: number) => JSON.stringify(['bloom-feature-control-v1', kind, binding.serviceId, binding.environment, binding.featureId, revision]);
const canonical = (value: unknown): string => Array.isArray(value) ? `[${value.map(canonical).join(',')}]` : value && typeof value === 'object' ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}` : JSON.stringify(value);
/** A dedicated transaction lock serializes rare control changes across replicas.
 * Nothing creates a pool, applies a migration or installs this repository at startup. */
export function postgresFeatureControlTransaction(pool: Pick<Pool, 'connect'>): FeatureControlTransaction {
    return async (work) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query("SET LOCAL lock_timeout = '2s'");
            await client.query("SET LOCAL statement_timeout = '5s'");
            await client.query("SET LOCAL idle_in_transaction_session_timeout = '5s'");
            await client.query('SELECT pg_advisory_xact_lock(142591, 1)');
            const result = await work(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK').catch(() => { });
            throw error;
        }
        finally {
            client.release();
        }
    };
}
/** Durable snapshots are NOT execution permission. The future service must supply
 * an independent scoped write/step-up/review authorizer and feed current controls
 * through the effective policy at every execution boundary. Default access is
 * denied. Existing production admin routes remain read-only; no installer exists.
 * Actors/reasons/cohorts are encrypted, with purpose/deployment/revision AAD. */
export class FeatureControlStorage {
    constructor(private transaction: FeatureControlTransaction, private authorize: (access: FeatureControlAccess, signal: AbortSignal) => Promise<boolean> = async () => false, private now: () => number = Date.now, private authorizationTimeoutMs = 2000) { }
    private async allowed(access: FeatureControlAccess) {
        if (!Number.isFinite(this.now()) || !Number.isInteger(this.authorizationTimeoutMs) || this.authorizationTimeoutMs < 1 || this.authorizationTimeoutMs > 2000)
            return fail('UNAVAILABLE');
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
            const expired = new Promise<boolean>(resolve => {timer = setTimeout(() => {controller.abort();resolve(false);}, this.authorizationTimeoutMs);});
            const answer = await Promise.race([this.authorize(structuredClone(access), controller.signal), expired]);
            if (answer !== true) return fail('ACCESS_DENIED');
        } catch {
            controller.abort();
            return fail('ACCESS_DENIED');
        } finally {
            clearTimeout(timer);
        }
    }
    private async safely<T>(work: () => Promise<T>): Promise<T> { try {
        return await work();
    }
    catch (error) {
        if (error instanceof FeatureControlStorageError)
            throw error;
        return fail('UNAVAILABLE');
    } }
    private binding(input: unknown): FeatureControlBinding { const result = bindingSchema.safeParse(input); if (!result.success || !registry.features.some(row => row.feature_id === result.data.featureId))
        return fail('INVALID_REQUEST'); return result.data; }
    private control(value: unknown, binding: FeatureControlBinding, revision: number, state?: string): CapabilityControl {
        const parsed = capabilityControlSchema.safeParse(value);
        if (!parsed.success || parsed.data.featureId !== binding.featureId || parsed.data.serviceId !== binding.serviceId || parsed.data.environment !== binding.environment || parsed.data.revision !== revision || state !== undefined && parsed.data.state !== state)
            return fail('UNAVAILABLE');
        return parsed.data;
    }
    async append(input: unknown) {
        const parsed = featureControlChangeSchema.safeParse(input);
        if (!parsed.success)
            return fail('INVALID_REQUEST');
        const change = parsed.data, binding = this.binding(change.binding), control = change.control, source = registry.features.find(row => row.feature_id === binding.featureId)!;
        if (control.featureId !== binding.featureId || control.serviceId !== binding.serviceId || control.environment !== binding.environment || control.changedBy !== change.actorId || control.revision !== change.expectedRevision + 1)
            return fail('INVALID_REQUEST');
        // Even an injected authorizer cannot override immutable incident/research boundaries.
        if (control.state === 'enabled' && source.release_category !== 'GENERAL_RELEASE')
            return fail('ACCESS_DENIED');
        const command = canonical(change);
        return this.safely(async () => {
            await this.allowed({ operation: 'write', change });
            return this.transaction(async (db) => {
                const params = [binding.serviceId, binding.environment, binding.featureId];
                const prior = (await db.query('SELECT * FROM feature_control_audit WHERE service_id=$1 AND environment=$2 AND request_id=$3', [...params.slice(0, 2), change.requestId])).rows[0];
                const current = (await db.query('SELECT * FROM feature_control_states WHERE service_id=$1 AND environment=$2 AND feature_id=$3 FOR UPDATE', params)).rows[0];
                await this.allowed({ operation: 'write', change });
                const time = this.now();
                if (!Number.isFinite(time))
                    return fail('UNAVAILABLE');
                const currentRevision = current ? Number(current.revision) : 0;
                if (current)
                    this.state(current, binding);
                if (prior) {
                    if (prior.feature_id !== binding.featureId)
                        return fail('CONFLICT');
                    if (createHash('sha256').update(canonical(prior.encrypted_event)).digest('hex') !== prior.event_digest)
                        return fail('UNAVAILABLE');
                    const event = eventSchema.parse(decryptPrecision(prior.encrypted_event, aad(binding, 'event', Number(prior.revision))));
                    const { recordedAt, ...original } = event;
                    if (event.requestId !== prior.request_id)
                        return fail('UNAVAILABLE');
                    if (canonical(original) !== command)
                        return fail('CONFLICT');
                    const recorded = this.control(event.control, binding, Number(prior.revision));
                    await this.allowed({ operation: 'write', change });
                    return { control: recorded, replay: true, currentRevision };
                }
                if (currentRevision !== change.expectedRevision)
                    return fail('CONFLICT');
                if (control.state === 'enabled' && Date.parse(control.expiresAt) <= time)
                    return fail('ACCESS_DENIED');
                const event = { ...change, recordedAt: new Date(time).toISOString() }, encryptedControl = encryptPrecision(control, aad(binding, 'state', control.revision)), encryptedEvent = encryptPrecision(event, aad(binding, 'event', control.revision));
                await db.query(`INSERT INTO feature_control_states (service_id,environment,feature_id,revision,state,material_digest,encrypted_control)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (service_id,environment,feature_id)
     DO UPDATE SET revision=EXCLUDED.revision,state=EXCLUDED.state,material_digest=EXCLUDED.material_digest,encrypted_control=EXCLUDED.encrypted_control,updated_at=clock_timestamp()`, [...params, control.revision, control.state, control.materialDigest, JSON.stringify(encryptedControl)]);
                await db.query(`INSERT INTO feature_control_audit (service_id,environment,feature_id,revision,request_id,event_digest,encrypted_event)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`, [...params, control.revision, change.requestId, createHash('sha256').update(canonical(encryptedEvent)).digest('hex'), JSON.stringify(encryptedEvent)]);
                await this.allowed({ operation: 'write', change });
                const committedAt = this.now();
                if (!Number.isFinite(committedAt))
                    return fail('UNAVAILABLE');
                if (control.state === 'enabled' && Date.parse(control.expiresAt) <= committedAt)
                    return fail('ACCESS_DENIED');
                return { control, replay: false, currentRevision: control.revision };
            });
        });
    }
    private state(row: any, binding: FeatureControlBinding) {
        const control = this.control(decryptPrecision(row.encrypted_control, aad(binding, 'state', Number(row.revision))), binding, Number(row.revision), row.state);
        if (control.materialDigest !== row.material_digest)
            return fail('UNAVAILABLE');
        return control;
    }
    async get(input: unknown, actorId: string) {
        const binding = this.binding(input);
        if (!identifier.safeParse(actorId).success)
            return fail('INVALID_REQUEST');
        return this.safely(async () => {
            await this.allowed({ operation: 'read', binding, actorId });
            return this.transaction(async (db) => {
                const row = (await db.query('SELECT * FROM feature_control_states WHERE service_id=$1 AND environment=$2 AND feature_id=$3', [binding.serviceId, binding.environment, binding.featureId])).rows[0];
                await this.allowed({ operation: 'read', binding, actorId });
                return row ? this.state(row, binding) : null;
            });
        });
    }
    async history(input: unknown, actorId: string, beforeRevision?: number) {
        const binding = this.binding(input);
        if (!identifier.safeParse(actorId).success || beforeRevision !== undefined && (!Number.isSafeInteger(beforeRevision) || beforeRevision < 1))
            return fail('INVALID_REQUEST');
        return this.safely(async () => {
            await this.allowed({ operation: 'read', binding, actorId });
            return this.transaction(async (db) => {
                const rows = (await db.query('SELECT * FROM feature_control_audit WHERE service_id=$1 AND environment=$2 AND feature_id=$3 AND ($4::bigint IS NULL OR revision<$4) ORDER BY revision DESC LIMIT 50', [binding.serviceId, binding.environment, binding.featureId, beforeRevision ?? null])).rows;
                await this.allowed({ operation: 'read', binding, actorId });
                const events = rows.map(row => { const event = eventSchema.parse(decryptPrecision(row.encrypted_event, aad(binding, 'event', Number(row.revision)))); this.control(event.control, binding, Number(row.revision)); if (event.requestId !== row.request_id || createHash('sha256').update(canonical(row.encrypted_event)).digest('hex') !== row.event_digest)
                    return fail('UNAVAILABLE'); return event; });
                await this.allowed({ operation: 'read', binding, actorId });
                return events;
            });
        });
    }
}
