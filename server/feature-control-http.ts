import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import { featureStepUpIntentSchema, FeatureStepUpError } from './feature-step-up';
import { FeatureControlStorageError } from './feature-control-storage';
import type { FeatureControlService } from './feature-control-service';
import type { SharedRateLimiter } from './shared-rate-limit';
export interface FeatureControlHttpConfiguration {
    service: Pick<FeatureControlService, 'issue' | 'apply'>;
    budgets: Pick<SharedRateLimiter, 'consume'>;
}
const issueSchema = z.object({ intent: featureStepUpIntentSchema, password: z.string().min(1).refine(value => Buffer.byteLength(value) <= 72) }).strict();
const applySchema = z.object({ intent: featureStepUpIntentSchema, proof: z.string().min(1).max(1024) }).strict();
async function boundedBudget(work: () => Promise<boolean>) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([work(), new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error('Control budget unavailable')), 2000); })]);
    }
    finally {
        clearTimeout(timer);
    }
}
/** Explicit installation only. Caller retains global JSON size/origin/session
 * security middleware. Session identity is always server-derived; the service
 * rechecks the actual account/controller and independently sourced approvals. */
export function registerFeatureControlHttp(app: Express, authenticate: RequestHandler, configuration: FeatureControlHttpConfiguration) {
    const handler = (operation: 'step-up' | 'control'): RequestHandler => async (req, res) => {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Pragma', 'no-cache');
        res.vary('Cookie');
        const actorId = req.session?.userId, sessionId = req.sessionID;
        if (!actorId || typeof sessionId !== 'string')
            return void res.status(401).json({ code: 'AUTHENTICATION_REQUIRED' });
        try {
            const stepUp = operation === 'step-up', scope = stepUp ? 'feature-control-reauth' : 'feature-control-write';
            if (!await boundedBudget(async () => await configuration.budgets.consume(scope + '-source', req.ip || 'unknown', stepUp ? 20 : 60, stepUp ? 900 : 60) === true && await configuration.budgets.consume(scope + '-account', actorId, stepUp ? 5 : 20, stepUp ? 900 : 60) === true)) {
                res.setHeader('Retry-After', stepUp ? '900' : '60');
                res.status(429).json({ code: 'CONTROL_RATE_LIMITED' });
                return;
            }
            const parsed = (stepUp ? issueSchema : applySchema).safeParse(req.body);
            if (!parsed.success || parsed.data.intent.change.binding.featureId !== req.params.featureId) {
                res.status(400).json({ code: 'INVALID_CONTROL_REQUEST' });
                return;
            }
            const context = { actorId, sessionId };
            if (stepUp) {
                const data = issueSchema.parse(parsed.data);
                res.json(await configuration.service.issue(context, data.intent, data.password));
            }
            else {
                const data = applySchema.parse(parsed.data), result = await configuration.service.apply(context, data.intent, data.proof);
                res.json({ featureId: result.control.featureId, revision: result.control.revision, state: result.control.state, replay: result.replay, currentRevision: result.currentRevision });
            }
        }
        catch (error) {
            if (error instanceof FeatureStepUpError) {
                res.status(error.code === 'UNAVAILABLE' ? 503 : error.code === 'INVALID_REQUEST' ? 400 : 403).json({ code: error.code === 'UNAVAILABLE' ? 'CONTROL_UNAVAILABLE' : 'CONTROL_DENIED' });
                return;
            }
            if (error instanceof FeatureControlStorageError) {
                res.status(error.code === 'CONFLICT' ? 409 : error.code === 'INVALID_REQUEST' ? 400 : error.code === 'UNAVAILABLE' ? 503 : 403).json({ code: error.code === 'CONFLICT' ? 'CONTROL_CONFLICT' : error.code === 'UNAVAILABLE' ? 'CONTROL_UNAVAILABLE' : 'CONTROL_DENIED' });
                return;
            }
            res.status(503).json({ code: 'CONTROL_UNAVAILABLE' });
        }
    };
    app.post('/api/admin/features/:featureId/control/step-up', authenticate, handler('step-up'));
    app.post('/api/admin/features/:featureId/control', authenticate, handler('control'));
}
