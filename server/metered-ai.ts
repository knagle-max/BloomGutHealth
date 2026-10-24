import { randomUUID } from 'node:crypto';
import { SpendLedger, configuredSpendLimits, type SpendLimits } from './spend-ledger';
import { maximumTokenCostMicroUsd, openAIReportedUsage, tokenCostMicroUsd, type TokenTariff } from './ai-costing';
export type AIFeature = 'ingredient-parsing' | 'recipe-ranking' | 'recipe-generation';
export interface AIExecutionContext {
    userId: string;
    requestId: string;
    consent: boolean;
}
export interface AIExecutionPolicy {
    tariff: TokenTariff;
    limits: SpendLimits;
    // Reviewed provider/model-specific bound for the entire serialized request,
    // including format schema and system input. Never infer tokens from characters.
    maximumRequestBytes: number;
    maximumInputTokens: number;
    maximumOutputTokens: number;
    boundsReviewReference: string;
}
export class AIExecutionUnavailable extends Error {
    constructor() { super('Optional AI is unavailable. Use the supported manual or curated alternative.'); }
}
export class MeteredAIExecutor {
    private enabled=true;
    disable(){this.enabled=false;}
    constructor(private readonly ledger: SpendLedger, private readonly policyFor: (feature: AIFeature, userId: string) => AIExecutionPolicy | null, private readonly authorize: (feature: AIFeature, userId: string) => boolean, private readonly now = Date.now) { }
    available(feature: AIFeature, userId: string, model: string) { try {
        const policy = this.policyFor(feature, userId);
        return this.enabled && !!userId && this.authorize(feature, userId) && !!policy && !!policy.boundsReviewReference?.trim() && configuredSpendLimits(policy.limits) && [policy.maximumRequestBytes, policy.maximumInputTokens, policy.maximumOutputTokens].every(n => Number.isSafeInteger(n) && n > 0) && (maximumTokenCostMicroUsd(policy.maximumInputTokens, policy.maximumOutputTokens, policy.tariff, model, this.now()) ?? 0) > 0;
    }
    catch {
        return false;
    } }
    async execute<T extends {
        usage?: unknown;
        model?: string;
        id?: string;
    }>(feature: AIFeature, context: AIExecutionContext | undefined, request: Record<string, unknown>, invoke: (payload: Record<string, unknown>) => Promise<T>): Promise<T> {
        if (!this.enabled || !context?.userId || !context.requestId || context.consent !== true || !this.authorize(feature, context.userId))
            throw new AIExecutionUnavailable();
        const selected = this.policyFor(feature, context.userId);
        const policy = selected ? structuredClone(selected) : null;
        const policyRevision = JSON.stringify(policy);
        if (!policy || !policy.boundsReviewReference.trim() || ![policy.maximumRequestBytes, policy.maximumInputTokens, policy.maximumOutputTokens].every(n => Number.isSafeInteger(n) && n > 0) || request.model !== policy.tariff.model)
            throw new AIExecutionUnavailable();
        // Never accept streaming, background work or extra samples without a separately
        // verified billing/reconciliation contract. SDK retries must remain disabled.
        if (request.stream || request.background || request.n !== undefined)
            throw new AIExecutionUnavailable();
        if (Object.keys(request).some(key=>!['model','input','text','store','max_output_tokens'].includes(key)))throw new AIExecutionUnavailable();
        const textOnly=typeof request.input==='string'||Array.isArray(request.input)&&request.input.length>0&&request.input.every(message=>message&&typeof message==='object'&&['system','user'].includes(message.role)&&typeof message.content==='string'&&Object.keys(message).every(key=>['role','content'].includes(key)));
        if(!textOnly)throw new AIExecutionUnavailable();
        const payload = { ...request, max_output_tokens: policy.maximumOutputTokens, store: false };
        const serializedPayload = JSON.stringify(payload);
        if (Buffer.byteLength(serializedPayload, 'utf8') > policy.maximumRequestBytes)
            throw new AIExecutionUnavailable();
        const amount = maximumTokenCostMicroUsd(policy.maximumInputTokens, policy.maximumOutputTokens, policy.tariff, policy.tariff.model, this.now());
        if (amount === null || amount <= 0)
            throw new AIExecutionUnavailable();
        const reservation = await this.ledger.reserve({ userId: context.userId, requestId: context.requestId, feature, provider: 'openai', model: policy.tariff.model, tariffReference: policy.tariff.reference, maximumMicroUsd: amount }, policy.limits);
        // A retry cannot execute again, even if the first response was lost or settled.
        if (!reservation.allowed || reservation.replay || reservation.state !== 'reserved')
            throw new AIExecutionUnavailable();
        const executionStartedAt = this.now();
        if (!this.enabled || JSON.stringify(payload) !== serializedPayload || !this.authorize(feature, context.userId) || JSON.stringify(this.policyFor(feature, context.userId)) !== policyRevision || tokenCostMicroUsd({ inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }, policy.tariff, policy.tariff.model, executionStartedAt) === null) {
            await this.ledger.releaseBeforeExecution(context.userId, context.requestId);
            throw new AIExecutionUnavailable();
        }
        // Once invoke starts, errors/aborts/timeouts have an unknown billing outcome.
        // Leave the reservation intact. Never free money because an HTTP request failed.
        const result = await invoke(payload);
        const usage = openAIReportedUsage(result.usage), cost = usage && result.model === policy.tariff.model ? tokenCostMicroUsd(usage, policy.tariff, policy.tariff.model, executionStartedAt) : null;
        if (cost === null || !usage || !result.id)
            throw new AIExecutionUnavailable();
        if(!await this.ledger.settle(context.userId, context.requestId, cost, 'actual', { providerResponseId: result.id, ...usage }))throw new AIExecutionUnavailable();
        if (!this.enabled || !this.authorize(feature, context.userId) || !usage || usage.inputTokens > policy.maximumInputTokens || usage.outputTokens > policy.maximumOutputTokens)
            throw new AIExecutionUnavailable();
        return result;
    }
}
let executor: MeteredAIExecutor | undefined;
/** Server composition only; no HTTP/environment boolean can self-enable this.
 * Install only with reviewed tariff, payload/token bounds, stable ledger key,
 * migration and account/capability policy. No live installation is provisioned. */
export function installMeteredAI(value: MeteredAIExecutor | undefined) { if(executor&&executor!==value)executor.disable();executor = value; }
export function meteredAIFeatures(userId: string) { const model = process.env.OPENAI_SCIENCE_MODEL; const ready = (feature: AIFeature) => !!executor && !!process.env.OPENAI_API_KEY && !!model && executor.available(feature, userId, model); return { ingredientParsing: ready("ingredient-parsing"), recipeRanking: ready("recipe-ranking"), recipeGeneration: ready("recipe-generation") }; }
export function aiExecutionContext(userId: string | undefined, consent: boolean): AIExecutionContext | undefined { return userId ? { userId, consent, requestId: randomUUID() } : undefined; }
export async function executeMeteredAI<T extends {
    usage?: unknown;
    model?: string;
    id?: string;
}>(feature: AIFeature, context: AIExecutionContext | undefined, request: Record<string, unknown>, invoke: (payload: Record<string, unknown>) => Promise<T>) { if (!executor)
    throw new AIExecutionUnavailable(); return executor.execute(feature, context, request, invoke); }
