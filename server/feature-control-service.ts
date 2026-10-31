import { FeatureStepUp, featureStepUpIntentSchema, type StepUpIntent } from './feature-step-up';
import { FeatureControlStorage, FeatureControlStorageError, type FeatureControlTransaction, type FeatureControlBinding } from './feature-control-storage';
import { reviewedCapabilityControlDecision, type ReviewedCapabilityControlFacts, type RegisteredCapability } from './effective-capability';
type ReviewFacts = Omit<ReviewedCapabilityControlFacts, 'control' | 'featureId' | 'now'>;
export interface FeatureControlReviewAdapter {
    current(binding: FeatureControlBinding, signal: AbortSignal): Promise<ReviewFacts | null>;
    source(featureId: string): RegisteredCapability | null;
}
/** Domain service only: no HTTP route, role provisioning or runtime installation.
 * Approval facts are loaded afresh from a separate trusted adapter at every store
 * check; password proof is not an approval. Disabled controls do not execute. */
export class FeatureControlService {
    constructor(private transaction: FeatureControlTransaction, private stepUp: FeatureStepUp, private reviews: FeatureControlReviewAdapter = { current: async () => null, source: () => null }, private now: () => number = Date.now) { }
    private intent(input: unknown): StepUpIntent {
        const parsed = featureStepUpIntentSchema.safeParse(input);
        if (!parsed.success)
            throw new FeatureControlStorageError('INVALID_REQUEST');
        if (parsed.data.action === 'rollback' ? parsed.data.change.rollbackRevision === undefined || parsed.data.change.rollbackRevision > parsed.data.change.expectedRevision : parsed.data.change.rollbackRevision !== undefined)
            throw new FeatureControlStorageError('INVALID_REQUEST');
        if (parsed.data.change.action !== undefined && parsed.data.change.action !== parsed.data.action)
            throw new FeatureControlStorageError('INVALID_REQUEST');
        return { ...parsed.data, change: { ...parsed.data.change, action: parsed.data.action } };
    }
    async issue(context: unknown, input: unknown, password: unknown) {
        return this.stepUp.issue(context, this.intent(input), password);
    }
    async apply(context: unknown, input: unknown, proof: unknown) {
        const intent = this.intent(input), lease = await this.stepUp.consume(context, intent, proof);
        if (intent.action === 'rollback') {
            const binding = intent.change.binding;
            const reader = new FeatureControlStorage(this.transaction, async (access, signal) => {
                if (access.operation !== 'read' || access.actorId !== intent.change.actorId || access.binding.serviceId !== binding.serviceId || access.binding.environment !== binding.environment || access.binding.featureId !== binding.featureId)
                    return false;
                return lease.authorize({ operation: 'write', change: intent.change }, signal);
            }, this.now);
            const history = await reader.history(binding, intent.change.actorId, intent.change.rollbackRevision! + 1);
            const target = history.find(event => event.control.revision === intent.change.rollbackRevision);
            const snapshot = (control: StepUpIntent['change']['control']) => { const { revision, changedBy, ...rest } = control; return JSON.stringify(rest); };
            if (!target || snapshot(target.control) !== snapshot(intent.change.control))
                throw new FeatureControlStorageError('ACCESS_DENIED');
        }
        const storage = new FeatureControlStorage(this.transaction, async (access, signal) => {
            if (!await lease.authorize(access, signal) || signal.aborted || access.operation !== 'write')
                return false;
            if (access.change.control.state !== 'enabled')
                return true;
            const facts = await this.reviews.current(structuredClone(access.change.binding), signal);
            if (!facts || signal.aborted)
                return false;
            const decision = reviewedCapabilityControlDecision({ ...facts, featureId: access.change.binding.featureId, now: this.now(), control: access.change.control }, id => this.reviews.source(id));
            // Recheck credentials after the independent review lookup, too.
            return decision.allowed && !signal.aborted && await lease.authorize(access, signal);
        }, this.now);
        return storage.append(intent.change);
    }
}
