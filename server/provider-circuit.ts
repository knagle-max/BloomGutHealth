import { randomUUID } from 'node:crypto';
import type { SpendTransaction } from './spend-ledger';
export interface CircuitPolicy {
    maximumFailures: number;
    cooldownSeconds: number;
    probeLeaseSeconds: number;
}
interface CircuitEntry {
    key: string;
    generation: string;
    probeToken: string | null;
}
export interface CircuitClaim {
    entries: CircuitEntry[];
}
const validKey = (key: string) => /^(platform:ai|provider:[a-z0-9][a-z0-9-]{0,49})$/.test(key);
/** One shared transaction/lock strategy as the monetary ledger; provider state has
 * no account or request content. Policy has no defaults and is immutable per instance. */
export class SharedProviderCircuit {
    private readonly policies: Readonly<Record<string, CircuitPolicy>>;
    constructor(private readonly transaction: SpendTransaction, policies: Record<string, CircuitPolicy>) {
        for (const [key, p] of Object.entries(policies))
            if (!validKey(key) || !p || !Number.isInteger(p.maximumFailures) || p.maximumFailures < 1 || p.maximumFailures > 10000 || !Number.isInteger(p.cooldownSeconds) || p.cooldownSeconds < 1 || p.cooldownSeconds > 86400 || !Number.isInteger(p.probeLeaseSeconds) || p.probeLeaseSeconds < 30 || p.probeLeaseSeconds > 300)
                throw Error('Invalid provider circuit policy');
        this.policies = structuredClone(policies);
    }
    supports(keys: string[]) { return keys.length > 0 && keys.length <= 8 && new Set(keys).size === keys.length && keys.every(key => !!this.policies[key]); }
    async admit(keys: string[]): Promise<CircuitClaim | null> {
        if (!this.supports(keys))
            throw Error('Provider circuit is not configured');
        return this.transaction(async (db) => {
            const now = +new Date((await db.query('SELECT clock_timestamp() AS now')).rows[0].now), rows: any[] = [];
            for (const key of [...keys].sort()) {
                await db.query('INSERT INTO provider_circuits(circuit_key) VALUES($1) ON CONFLICT DO NOTHING', [key]);
                rows.push((await db.query('SELECT * FROM provider_circuits WHERE circuit_key=$1 FOR UPDATE', [key])).rows[0]);
            }
            // Decide for every scope before claiming any probe: a denial in one scope
            // must not strand an unused probe in another scope.
            if (rows.some(row => row.open_until && (+new Date(row.open_until) > now || row.probe_expires_at && +new Date(row.probe_expires_at) > now)))
                return null;
            const entries: CircuitEntry[] = [];
            for (const row of rows) {
                let generation = String(row.generation), probeToken: string | null = null;
                if (row.open_until) {
                    probeToken = randomUUID();
                    const updated = await db.query('UPDATE provider_circuits SET probe_token=$2,probe_expires_at=$3,generation=generation+1,updated_at=clock_timestamp() WHERE circuit_key=$1 RETURNING generation', [row.circuit_key, probeToken, new Date(now + this.policies[row.circuit_key].probeLeaseSeconds * 1000)]);
                    generation = String(updated.rows[0].generation);
                }
                entries.push({ key: row.circuit_key, generation, probeToken });
            }
            return { entries };
        });
    }
    async success(claim: CircuitClaim) { return this.finish(claim, 'success'); }
    async failure(claim: CircuitClaim, hardProviderFailure = false) { return this.finish(claim, 'failure', hardProviderFailure); }
    async cancelBeforeExecution(claim: CircuitClaim) { return this.finish(claim, 'cancelled'); }
    private async finish(claim: CircuitClaim, outcome: 'success' | 'failure' | 'cancelled', hardProviderFailure = false) {
        if (!this.supports(claim.entries.map(entry => entry.key)))
            throw Error('Invalid provider circuit claim');
        await this.transaction(async (db) => {
            const now = +new Date((await db.query('SELECT clock_timestamp() AS now')).rows[0].now);
            for (const entry of [...claim.entries].sort((a, b) => a.key.localeCompare(b.key))) {
                const row = (await db.query('SELECT * FROM provider_circuits WHERE circuit_key=$1 FOR UPDATE', [entry.key])).rows[0];
                // A slow old success cannot close a newly opened circuit, or win after a
                // crashed probe's lease was reclaimed by another replica.
                if (!row || String(row.generation) !== entry.generation || row.probe_token !== entry.probeToken)
                    continue;
                if (outcome === 'cancelled') {
                    if (entry.probeToken)
                        await db.query('UPDATE provider_circuits SET probe_token=NULL,probe_expires_at=NULL,generation=generation+1,updated_at=clock_timestamp() WHERE circuit_key=$1', [entry.key]);
                }
                else if (outcome === 'success') {
                    await db.query('UPDATE provider_circuits SET failures=0,open_until=NULL,probe_token=NULL,probe_expires_at=NULL,generation=generation+$2,updated_at=clock_timestamp() WHERE circuit_key=$1', [entry.key, entry.probeToken ? 1 : 0]);
                }
                else {
                    const p = this.policies[entry.key], failures = Math.min(row.failures + 1, p.maximumFailures), open = !!entry.probeToken || failures >= p.maximumFailures || hardProviderFailure && entry.key.startsWith('provider:');
                    await db.query('UPDATE provider_circuits SET failures=$2,open_until=$3,probe_token=NULL,probe_expires_at=NULL,generation=generation+$4,updated_at=clock_timestamp() WHERE circuit_key=$1', [entry.key, failures, open ? new Date(now + p.cooldownSeconds * 1000) : null, open ? 1 : 0]);
                }
            }
        });
    }
}
/** Inspect only allowlisted status/category fields, never raw provider messages. */
export function immediateProviderFailure(error: unknown) { if (!error || typeof error !== 'object')
    return false; const e = error as {
    status?: unknown;
    code?: unknown;
    type?: unknown;
}; return [401, 403, 429].includes(Number(e.status)) || ['insufficient_quota', 'credit_balance_exhausted', 'organization_spend_limit_exceeded', 'project_spend_limit_exceeded'].includes(String(e.code)); }
