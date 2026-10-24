import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { SpendLedger, type SpendTransaction } from '../server/spend-ledger';
import { MeteredAIExecutor, AIExecutionUnavailable, executeMeteredAI, type AIExecutionPolicy } from '../server/metered-ai';
const now = Date.parse('2026-10-24T00:00:00Z');
// All rates, identities and allowances are synthetic; no provider call is made.
const policy: AIExecutionPolicy = { tariff: { reference: 'synthetic-test-v1', provider: 'openai', model: 'synthetic-model', effectiveFrom: '2026-10-01T00:00:00Z', expiresAt: '2026-11-01T00:00:00Z', inputMicroUsdPerMillion: 2000000, cachedInputMicroUsdPerMillion: 500000, outputMicroUsdPerMillion: 8000000 }, limits: { accountDaily: 10000, accountMonthly: 20000, featureDaily: 10000, providerMonthly: 30000, platformMonthly: 40000, accountConcurrency: 2, platformConcurrency: 4 }, maximumRequestBytes: 20000, maximumInputTokens: 1000, maximumOutputTokens: 100, boundsReviewReference: 'synthetic-model-contract-v1' };
const context = (requestId: string) => ({ userId: 'synthetic-a', requestId, consent: true });
const request = { model: 'synthetic-model', input: 'synthetic description' };
const response = { id: 'resp_synthetic', model: 'synthetic-model', usage: { input_tokens: 10, input_tokens_details: { cached_tokens: 0 }, output_tokens: 1, total_tokens: 11 }, output_parsed: { safe: true } };
async function setup(authorize = () => true, resolve = () => structuredClone(policy)) { const db = new PGlite(); await db.exec(await readFile(new URL('../migrations/0009_ai_spend_ledger.sql', import.meta.url), 'utf8')); await db.exec(await readFile(new URL('../migrations/0010_ai_usage_receipts.sql', import.meta.url), 'utf8')); const transaction: SpendTransaction = work => db.transaction(async (tx) => { await tx.query('SELECT pg_advisory_xact_lock(142590, 1)'); return work(tx as any); }); const executor = new MeteredAIExecutor(new SpendLedger(transaction, 'synthetic-stable-identity-secret-long-enough'), resolve, authorize, () => now); return { db, executor }; }
test('metered executor reserves before invocation, bounds SDK output, settles actual units once and denies replay', async () => { const { db, executor } = await setup(); let calls = 0; try {
    const output = await executor.execute('ingredient-parsing', context('once'), request, async (payload) => { calls++; const row = (await db.query('SELECT * FROM ai_spend_requests')).rows[0]; assert.equal(row.state, 'reserved'); assert.equal(Number(row.reserved_micro_usd), 2800); assert.equal(payload.max_output_tokens, 100); assert.equal(payload.store, false); return response; });
    assert.deepEqual(output, response);
    const row = (await db.query('SELECT * FROM ai_spend_requests')).rows[0];
    assert.equal(row.state, 'settled');
    assert.equal(Number(row.settled_micro_usd), 28);
    assert.equal(row.billing_basis, 'actual');
    await assert.rejects(() => executor.execute('ingredient-parsing', context('once'), request, async () => { calls++; return response; }), AIExecutionUnavailable);
    assert.equal(calls, 1);
}
finally {
    await db.close();
} });
test('missing identity/consent/authorization, invalid bounds, tariff, oversized body and streams deny before provider execution', async () => { const { db, executor } = await setup(); let calls = 0; const invoke = async () => { calls++; return response; }; try {
    for (const ctx of [undefined, { ...context('a'), consent: false }, { ...context('a'), userId: '' }])
        await assert.rejects(() => executor.execute('recipe-ranking', ctx, request, invoke));
    for (const input of [{ ...request, stream: true }, { ...request, background: true }, { ...request, n: 2 }, { ...request, tools:[{type:'web_search'}] }, { ...request, previous_response_id:'private_previous' }, { ...request, input:[{role:'user',content:[{type:'input_image',image_url:'synthetic-only'}]}] }, { ...request, model: 'other' }, { ...request, input: 'x'.repeat(20001) }])
        await assert.rejects(() => executor.execute('recipe-ranking', context('a'), input, invoke));
    assert.equal((await db.query('SELECT * FROM ai_spend_requests')).rows.length, 0);
    await assert.rejects(() => executeMeteredAI('recipe-generation', context('b'), request, invoke));
    assert.equal(calls, 0);
}
finally {
    await db.close();
} });
test('provider errors or unknown billing units keep the reservation and cannot retry under the same request', async () => { const { db, executor } = await setup(); try {
    await assert.rejects(() => executor.execute('ingredient-parsing', context('timeout'), request, async () => { throw Error('synthetic timeout'); }));
    await assert.rejects(() => executor.execute('ingredient-parsing', context('missing-usage'), request, async () => ({ model: 'synthetic-model' })), AIExecutionUnavailable);
    const rows = (await db.query('SELECT * FROM ai_spend_requests')).rows;
    assert.equal(rows.length, 2);
    assert.ok(rows.every(row => row.state === 'reserved' && row.settled_micro_usd === null));
    let calls = 0;
    await assert.rejects(() => executor.execute('ingredient-parsing', context('timeout'), request, async () => { calls++; return response; }));
    assert.equal(calls, 0);
    await assert.rejects(() => executor.execute('ingredient-parsing', context('concurrent-cap'), request, async () => { calls++; return response; }));
    assert.equal(calls, 0);
}
finally {
    await db.close();
} });
test('revocation before invocation releases only the unstarted operation; revocation after invocation still settles without returning output', async () => { let checks = 0; const first = await setup(() => ++checks === 1); try {
    let calls = 0;
    await assert.rejects(() => first.executor.execute('recipe-ranking', context('revoked-before'), request, async () => { calls++; return response; }));
    assert.equal(calls, 0);
    assert.equal((await first.db.query('SELECT state FROM ai_spend_requests')).rows[0].state, 'released');
}
finally {
    await first.db.close();
} let authorized = true; const second = await setup(() => authorized); try {
    await assert.rejects(() => second.executor.execute('recipe-ranking', context('revoked-after'), request, async () => { authorized = false; return response; }));
    assert.equal((await second.db.query('SELECT state FROM ai_spend_requests')).rows[0].state, 'settled');
}
finally {
    await second.db.close();
} });
test('provider usage beyond reviewed bounds is charged in full but output is withheld', async () => { const { db, executor } = await setup(); try {
    await assert.rejects(() => executor.execute('recipe-generation', context('overage'), request, async () => ({ ...response, usage: { input_tokens: 2000, input_tokens_details: { cached_tokens: 0 }, output_tokens: 200, total_tokens: 2200 } })));
    const row = (await db.query('SELECT * FROM ai_spend_requests')).rows[0];
    assert.equal(row.state, 'settled');
    assert.equal(Number(row.settled_micro_usd), 5600);
}
finally {
    await db.close();
} });
test('actual parser and recipe SDK callsites deny credentials plus consent without an installed reviewed executor', async () => { const { parseMeal } = await import('../server/meal-intelligence'); const { prioritizeRecipes } = await import('../server/recipe-ranking'); const { generateRecipes } = await import('../server/recipe-generation'); const { defaultPreferences, recommendMeals } = await import('../shared/meal-intelligence'); const key = process.env.OPENAI_API_KEY, model = process.env.OPENAI_SCIENCE_MODEL, fetcher = globalThis.fetch; let calls = 0; process.env.OPENAI_API_KEY = 'synthetic-only'; process.env.OPENAI_SCIENCE_MODEL = 'synthetic-model'; globalThis.fetch = (async () => { calls++; throw Error('Unexpected external request'); }) as typeof fetch; try {
    assert.equal((await parseMeal('unknown synthetic sauce', true, context('parse'))).parser, 'rules');
    const eligible = recommendMeals(defaultPreferences, []);
    assert.ok(eligible.length > 0);
    assert.deepEqual((await prioritizeRecipes(eligible, defaultPreferences, true, context('rank'))).suggestions, eligible);
    await assert.rejects(() => generateRecipes(defaultPreferences, [], 'synthetic soup', context('generate')), AIExecutionUnavailable);
    assert.equal(calls, 0);
}
finally {
    globalThis.fetch = fetcher;
    if (key === undefined)
        delete process.env.OPENAI_API_KEY;
    else
        process.env.OPENAI_API_KEY = key;
    if (model === undefined)
        delete process.env.OPENAI_SCIENCE_MODEL;
    else
        process.env.OPENAI_SCIENCE_MODEL = model;
} });
test('actual SDK parser uses the reservation and verified usage; quota errors fall back without releasing unknown spend', async () => { const { parseMeal } = await import('../server/meal-intelligence'); const { installMeteredAI } = await import('../server/metered-ai'); const { db, executor } = await setup(); const key = process.env.OPENAI_API_KEY, model = process.env.OPENAI_SCIENCE_MODEL, fetcher = globalThis.fetch; let fail = false, calls = 0; process.env.OPENAI_API_KEY = 'synthetic-not-real'; process.env.OPENAI_SCIENCE_MODEL = 'synthetic-model'; installMeteredAI(executor); globalThis.fetch = (async (_url, init) => { calls++; const payload = JSON.parse(String(init?.body)); assert.equal(payload.max_output_tokens, 100); assert.equal(payload.store, false); assert.ok((await db.query("SELECT * FROM ai_spend_requests WHERE state='reserved'")).rows.length > 0); return fail ? new Response(JSON.stringify({ error: { type: 'insufficient_quota', code: 'insufficient_quota', message: 'PRIVATE_PROVIDER_SENTINEL' } }), { status: 429, headers: { 'content-type': 'application/json' } }) : new Response(JSON.stringify({ id: 'resp_synthetic', object: 'response', created_at: 1, status: 'completed', model: 'synthetic-model', output: [{ id: 'msg_synthetic', type: 'message', status: 'completed', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify({ ingredients: [{ name: 'unknown synthetic sauce', grams: 10, preparation: 'unknown', assumption: 'Synthetic portion' }], clarificationQuestions: [] }), annotations: [] }] }], usage: response.usage }), { status: 200, headers: { 'content-type': 'application/json' } }); }) as typeof fetch; try {
    const parsed = await parseMeal('unknown synthetic sauce', true, context('sdk-success'));
    assert.equal(parsed.parser, 'ai');
    assert.equal(parsed.ingredients[0].grams, 10);
    assert.equal((await db.query("SELECT state FROM ai_spend_requests WHERE state='settled'")).rows.length, 1);
    fail = true;
    const fallback = await parseMeal('unknown synthetic sauce', true, context('sdk-quota'));
    assert.equal(fallback.parser, 'rules');
    assert.match(fallback.parserNotice!, /insufficient API quota/);
    assert.ok(!fallback.parserNotice!.includes('PRIVATE_PROVIDER_SENTINEL'));
    assert.equal((await db.query("SELECT state FROM ai_spend_requests WHERE state='reserved'")).rows.length, 1);
    assert.equal(calls, 2);
}
finally {
    installMeteredAI(undefined);
    globalThis.fetch = fetcher;
    if (key === undefined)
        delete process.env.OPENAI_API_KEY;
    else
        process.env.OPENAI_API_KEY = key;
    if (model === undefined)
        delete process.env.OPENAI_SCIENCE_MODEL;
    else
        process.env.OPENAI_SCIENCE_MODEL = model;
    await db.close();
} });

test('runtime disable withholds in-flight output, settles incurred usage and prevents subsequent reservations',async()=>{const {db,executor}=await setup();try{await assert.rejects(()=>executor.execute('recipe-ranking',context('runtime-off'),request,async()=>{executor.disable();return response;}),AIExecutionUnavailable);assert.equal((await db.query('SELECT state FROM ai_spend_requests')).rows[0].state,'settled');assert.equal(executor.available('recipe-ranking','synthetic-a','synthetic-model'),false);let calls=0;await assert.rejects(()=>executor.execute('recipe-ranking',context('after-off'),request,async()=>{calls++;return response;}));assert.equal(calls,0);assert.equal((await db.query('SELECT * FROM ai_spend_requests')).rows.length,1);}finally{await db.close();}});
