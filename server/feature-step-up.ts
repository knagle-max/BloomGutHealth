import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { featureControlChangeSchema, type FeatureControlChange, type FeatureControlAccess, type FeatureControlQuery } from './feature-control-storage';
import registry from '../docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json';
const id = z.string().regex(/^[A-Za-z0-9_.:/-]{1,120}$/), digest = z.string().regex(/^[a-f0-9]{64}$/);
const environment = z.enum(['development-review', 'isolated-synthetic']);
const bindingSchema = z.object({ serviceId: z.string().regex(/^srv-[a-z0-9]+$/), environment }).strict();
const contextSchema = z.object({ actorId: id, sessionId: z.string().regex(/^[A-Za-z0-9_-]{16,256}$/) }).strict();
const actionSchema = z.enum(['enable', 'pause', 'rollback', 'emergency-disable']);
const intentSchema = z.object({ action: actionSchema, change: featureControlChangeSchema }).strict();
export type StepUpContext = z.infer<typeof contextSchema>;
export type StepUpIntent = z.infer<typeof intentSchema>;
// Server-provisioned scope and credential version only. A metadata read grant
// cannot satisfy this schema; the credential adapter must verify actual login.
export const stepUpControllerSchema = z.object({ userId: id, role: z.literal('feature-controller'), scopes: z.tuple([z.literal('features:control')]), grantId: id, reviewReference: id, ...bindingSchema.shape, featureIds: z.array(id).min(1).max(52), actions: z.array(actionSchema).min(1).max(4), credentialVersion: digest, expiresAt: z.string().datetime({ offset: true }) }).strict();
export type StepUpController = z.infer<typeof stepUpControllerSchema>;
export interface StepUpAdapters {
    reauthenticate(context: StepUpContext, intent: StepUpIntent, password: string, signal: AbortSignal): Promise<StepUpController | null>;
    current(context: StepUpContext, intent: StepUpIntent, signal: AbortSignal): Promise<StepUpController | null>;
}
const receiptKeysSchema = z.object({ proofKey: digest, sessionKey: digest, actorKey: digest, intentKey: digest, grantKey: digest, ...bindingSchema.shape }).strict();
type ReceiptKeys = z.infer<typeof receiptKeysSchema>;
const payloadSchema = z.object({ nonce: z.string().regex(/^[A-Za-z0-9_-]{43}$/), issuedAt: z.number().int().nonnegative().safe(), expiresAt: z.number().int().positive().safe() }).strict().refine(v => v.expiresAt > v.issuedAt && v.expiresAt - v.issuedAt <= 120000);
export class FeatureStepUpError extends Error {
    constructor(public readonly code: 'INVALID_REQUEST' | 'DENIED' | 'INVALID_PROOF' | 'UNAVAILABLE') { super(`Feature step-up: ${code}`); }
}
const fail = (code: FeatureStepUpError['code']): never => { throw new FeatureStepUpError(code); };
/** Atomic shared receipt storage. Keys are purpose-separated HMACs created by
 * FeatureStepUp; this primitive is not a password verifier or a grant issuer. */
export class FeatureStepUpReceipts {
    constructor(private db: FeatureControlQuery) { }
    async issue(input: ReceiptKeys, expiresAt: number) {
        const keys = receiptKeysSchema.safeParse(input);
        if (!keys.success || !Number.isSafeInteger(expiresAt))
            return fail('INVALID_REQUEST');
        try {
            const k = keys.data, row = (await this.db.query(`WITH clock AS (SELECT clock_timestamp() AS at)
   INSERT INTO public.feature_control_step_up_receipts (proof_key,session_key,actor_key,intent_key,grant_key,service_id,environment,created_at,expires_at)
   SELECT $1,$2,$3,$4,$5,$6,$7,at,LEAST($8::timestamptz,at+interval '120 seconds') FROM clock WHERE $8::timestamptz>at
   RETURNING expires_at`, [k.proofKey, k.sessionKey, k.actorKey, k.intentKey, k.grantKey, k.serviceId, k.environment, new Date(expiresAt).toISOString()])).rows[0];
            return row ? new Date(row.expires_at).getTime() : null;
        }
        catch {
            return fail('UNAVAILABLE');
        }
    }
    async consume(input: ReceiptKeys, expiresAt: number) {
        const keys = receiptKeysSchema.safeParse(input);
        if (!keys.success || !Number.isSafeInteger(expiresAt))
            return fail('INVALID_REQUEST');
        try {
            const k = keys.data;
            return (await this.db.query(`UPDATE public.feature_control_step_up_receipts SET consumed_at=clock_timestamp()
   WHERE proof_key=$1 AND session_key=$2 AND actor_key=$3 AND intent_key=$4 AND grant_key=$5 AND service_id=$6 AND environment=$7
    AND consumed_at IS NULL AND expires_at>= $8::timestamptz AND expires_at>clock_timestamp() AND $8::timestamptz>clock_timestamp()
   RETURNING proof_key`, [k.proofKey, k.sessionKey, k.actorKey, k.intentKey, k.grantKey, k.serviceId, k.environment, new Date(expiresAt).toISOString()])).rows.length === 1;
        }
        catch {
            return fail('UNAVAILABLE');
        }
    }
    async prune() {
        try {
            return (await this.db.query(`DELETE FROM public.feature_control_step_up_receipts WHERE proof_key IN
  (SELECT proof_key FROM public.feature_control_step_up_receipts WHERE expires_at<=clock_timestamp() LIMIT 1000) RETURNING proof_key`)).rows.length;
        }
        catch {
            return fail('UNAVAILABLE');
        }
    }
}
/** Reauthentication protocol only; no production factory, HTTP credential route
 * or runtime control installer is configured. Trusted adapters must verify the
 * actual account/password and separately provisioned controller scope. */
export class FeatureStepUp {
    private binding!: z.infer<typeof bindingSchema>;
    constructor(binding: unknown, private secret: string, private receipts: FeatureStepUpReceipts, private adapters: StepUpAdapters = { reauthenticate: async () => null, current: async () => null }, private now: () => number = Date.now) {
        const parsed = bindingSchema.safeParse(binding);
        if (!parsed.success || typeof secret !== 'string' || Buffer.byteLength(secret) < 32 || Buffer.byteLength(secret) > 512)
            return fail('INVALID_REQUEST');
        this.binding = parsed.data;
    }
    private time() { const now = this.now(); if (!Number.isSafeInteger(now) || now < 0)
        return fail('UNAVAILABLE'); return now; }
    private hmac(purpose: string, value: unknown) { return createHmac('sha256', this.secret).update(JSON.stringify(['bloom-feature-stepup-v1', purpose, value])).digest('hex'); }
    private parsed(context: unknown, intent: unknown) {
        const c = contextSchema.safeParse(context), i = intentSchema.safeParse(intent);
        if (!c.success || !i.success)
            return fail('INVALID_REQUEST');
        const request = i.data, change = request.change, source = registry.features.find(row => row.feature_id === change.binding.featureId);
        if (!source || change.binding.serviceId !== this.binding.serviceId || change.binding.environment !== this.binding.environment || change.actorId !== c.data.actorId || change.control.changedBy !== c.data.actorId || change.control.featureId !== change.binding.featureId || change.control.serviceId !== this.binding.serviceId || change.control.environment !== this.binding.environment || change.control.revision !== change.expectedRevision + 1)
            return fail('DENIED');
        if (request.action === 'enable' && change.control.state !== 'enabled' || request.action === 'pause' && change.control.state !== 'paused' || request.action === 'emergency-disable' && change.control.state !== 'incident-disabled')
            return fail('DENIED');
        if (request.action === 'rollback' && change.control.state === 'incident-disabled')
            return fail('DENIED');
        if (change.control.state === 'enabled' && source.release_category !== 'GENERAL_RELEASE')
            return fail('DENIED');
        return { context: c.data, intent: request };
    }
    private controller(value: unknown, context: StepUpContext, intent: StepUpIntent) {
        const parsed = stepUpControllerSchema.safeParse(value);
        if (!parsed.success)
            return fail('DENIED');
        const grant = parsed.data;
        if (grant.userId !== context.actorId || grant.serviceId !== this.binding.serviceId || grant.environment !== this.binding.environment || !grant.featureIds.includes(intent.change.binding.featureId) || !grant.actions.includes(intent.action) || new Set(grant.featureIds).size !== grant.featureIds.length || new Set(grant.actions).size !== grant.actions.length || grant.featureIds.some(id => !registry.features.some(row => row.feature_id === id)) || Date.parse(grant.expiresAt) <= this.time())
            return fail('DENIED');
        return grant;
    }
    private async bounded<T>(work: (signal: AbortSignal) => Promise<T>, parent?: AbortSignal): Promise<T> {
        const abort = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const stopped = () => abort.abort();
        if (parent?.aborted)
            return fail('DENIED');
        parent?.addEventListener('abort', stopped, { once: true });
        try {
            return await Promise.race([work(abort.signal), new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { abort.abort(); reject(new FeatureStepUpError('UNAVAILABLE')); }, 2000); abort.signal.addEventListener('abort', () => reject(new FeatureStepUpError('UNAVAILABLE')), { once: true }); })]);
        }
        catch (error) {
            abort.abort();
            if (error instanceof FeatureStepUpError)
                throw error;
            return fail('UNAVAILABLE');
        }
        finally {
            clearTimeout(timer);
            parent?.removeEventListener('abort', stopped);
        }
    }
    private keys(context: StepUpContext, intent: StepUpIntent, grant: StepUpController, nonce: string): ReceiptKeys {
        return { ...this.binding, proofKey: this.hmac('receipt', nonce), sessionKey: this.hmac('session', context.sessionId), actorKey: this.hmac('actor', context.actorId), intentKey: this.hmac('intent', intent), grantKey: this.hmac('controller', grant) };
    }
    private signature(payload: z.infer<typeof payloadSchema>, keys: ReceiptKeys) { return this.hmac('signed-proof', [payload, keys]); }
    async issue(context: unknown, intent: unknown, password: unknown) {
        const parsed = this.parsed(context, intent);
        if (typeof password !== 'string' || !password.length || Buffer.byteLength(password) > 72)
            return fail('INVALID_REQUEST');
        const authenticated = this.controller(await this.bounded(signal => this.adapters.reauthenticate(structuredClone(parsed.context), structuredClone(parsed.intent), password, signal)), parsed.context, parsed.intent);
        const current = this.controller(await this.bounded(signal => this.adapters.current(structuredClone(parsed.context), structuredClone(parsed.intent), signal)), parsed.context, parsed.intent);
        if (this.hmac('controller', authenticated) !== this.hmac('controller', current))
            return fail('DENIED');
        const issuedAt = this.time(), nonce = randomBytes(32).toString('base64url'), keys = this.keys(parsed.context, parsed.intent, current, nonce);
        const expiresAt = await this.receipts.issue(keys, Math.min(issuedAt + 120000, Date.parse(current.expiresAt)));
        if (expiresAt === null || expiresAt <= this.time() || expiresAt - issuedAt > 120000)
            return fail('DENIED');
        const payload = { nonce, issuedAt, expiresAt }, part = Buffer.from(JSON.stringify(payload)).toString('base64url');
        return { proof: part + '.' + this.signature(payload, keys), expiresAt: new Date(expiresAt).toISOString(), purpose: 'reauthentication-only' as const };
    }
    async consume(context: unknown, intent: unknown, proof: unknown) {
        const parsed = this.parsed(context, intent);
        if (typeof proof !== 'string' || proof.length > 1024)
            return fail('INVALID_PROOF');
        const match = /^([A-Za-z0-9_-]{1,512})\.([a-f0-9]{64})$/.exec(proof);
        if (!match)
            return fail('INVALID_PROOF');
        let payload: z.infer<typeof payloadSchema>;
        try {
            payload = payloadSchema.parse(JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8')));
        }
        catch {
            return fail('INVALID_PROOF');
        }
        if (Buffer.from(JSON.stringify(payload)).toString('base64url') !== match[1] || this.time() < payload.issuedAt || this.time() >= payload.expiresAt)
            return fail('INVALID_PROOF');
        const grant = this.controller(await this.bounded(signal => this.adapters.current(structuredClone(parsed.context), structuredClone(parsed.intent), signal)), parsed.context, parsed.intent), keys = this.keys(parsed.context, parsed.intent, grant, payload.nonce);
        if (!timingSafeEqual(Buffer.from(match[2]), Buffer.from(this.signature(payload, keys))))
            return fail('INVALID_PROOF');
        if (!await this.receipts.consume(keys, payload.expiresAt))
            return fail('INVALID_PROOF');
        const exact = this.hmac('intent', parsed.intent), original = this.hmac('controller', grant);
        return { expiresAt: payload.expiresAt, authorize: async (access: FeatureControlAccess, signal: AbortSignal) => {
                try {
                    if (signal.aborted || access.operation !== 'write' || this.time() < payload.issuedAt || this.time() >= payload.expiresAt)
                        return false;
                    const candidate = this.parsed(parsed.context, { action: parsed.intent.action, change: access.change });
                    if (this.hmac('intent', candidate.intent) !== exact)
                        return false;
                    const current = this.controller(await this.bounded(stop => this.adapters.current(structuredClone(parsed.context), structuredClone(parsed.intent), stop), signal), parsed.context, parsed.intent);
                    return !signal.aborted && this.time() < payload.expiresAt && this.hmac('controller', current) === original;
                }
                catch {
                    return false;
                }
            } };
    }
}
