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
        // Historical rollback target binding is not implemented; never treat an
        // arbitrary caller-supplied control as a verified historical rollback.
        if (parsed.data.action === 'rollback')
            throw new FeatureControlStorageError('ACCESS_DENIED');
        if (parsed.data.change.action !== undefined && parsed.data.change.action !== parsed.data.action)
            throw new FeatureControlStorageError('INVALID_REQUEST');
        return {...parsed.data,change:{...parsed.data.change,action:parsed.data.action}};
    }
    async issue(context: unknown, input: unknown, password: unknown) {
        return this.stepUp.issue(context, this.intent(input), password);
    }
    async apply(context: unknown, input: unknown, proof: unknown) {
        const intent = this.intent(input), lease = await this.stepUp.consume(context, intent, proof);
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
