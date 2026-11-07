import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { stepUpControllerSchema, type StepUpAdapters, type StepUpContext, type StepUpIntent } from './feature-step-up';
// Credential fingerprints are derived only from the stored account credential.
// Provisioning cannot supply or override them.
const grantSchema = stepUpControllerSchema.omit({ credentialVersion: true });
const grantsSchema = z.array(grantSchema).max(100);
type Account = {
    id: string;
    password: string;
};
export interface FeatureControllerAccountStore {
    getUser(id: string): Promise<Account | undefined>;
}
/** Trusted server adapter, deliberately not installed by the application. The
 * caller must derive context from its authenticated session, never request JSON.
 * Controller scope is separate from metadata-read/tester grants and approvals. */
export function featureControllerAdapters(store: FeatureControllerAccountStore, environment: () => Record<string, string | undefined> = () => process.env, now: () => number = Date.now): StepUpAdapters {
    async function current(context: StepUpContext, intent: StepUpIntent, signal: AbortSignal) {
        if (signal.aborted)
            return null;
        const env = environment(), time = now();
        if (!Number.isSafeInteger(time) || time < 0 || env.BLOOM_FEATURE_CONTROL_KILL_SWITCH !== 'false' || env.RENDER_SERVICE_ID !== intent.change.binding.serviceId || env.BLOOM_FEATURE_CONTROL_ENVIRONMENT !== intent.change.binding.environment)
            return null;
        const raw = env.BLOOM_FEATURE_CONTROLLERS;
        if (!raw || raw.length > 65536)
            return null;
        let grants: z.infer<typeof grantsSchema>;
        try {
            grants = grantsSchema.parse(JSON.parse(raw));
        }
        catch {
            return null;
        }
        const matched = grants.filter(grant => grant.userId === context.actorId);
        if (matched.length !== 1)
            return null;
        const grant = matched[0];
        if (grant.serviceId !== env.RENDER_SERVICE_ID || grant.environment !== env.BLOOM_FEATURE_CONTROL_ENVIRONMENT || Date.parse(grant.expiresAt) <= time || !grant.featureIds.includes(intent.change.binding.featureId) || !grant.actions.includes(intent.action))
            return null;
        const account = await store.getUser(context.actorId);
        if (signal.aborted || !account || account.id !== context.actorId || typeof account.password !== 'string' || !/^\$2[ab]\$(?:1[0-5])\$[./A-Za-z0-9]{53}$/.test(account.password))
            return null;
        return { ...grant, credentialVersion: createHash('sha256').update('bloom-controller-credential-v1\0').update(account.password).digest('hex') };
    }
    return {
        current,
        async reauthenticate(context, intent, password, signal) {
            if (typeof password !== 'string' || !password.length || Buffer.byteLength(password) > 72 || signal.aborted)
                return null;
            const grant = await current(context, intent, signal);
            if (!grant)
                return null;
            const account = await store.getUser(context.actorId);
            if (!account || signal.aborted || account.id !== context.actorId || createHash('sha256').update('bloom-controller-credential-v1\0').update(account.password).digest('hex') !== grant.credentialVersion)
                return null;
            const valid = await bcrypt.compare(password, account.password);
            if (!valid || signal.aborted)
                return null;
            const fresh = await current(context, intent, signal);
            return fresh && JSON.stringify(fresh) === JSON.stringify(grant) ? fresh : null;
        }
    };
}
