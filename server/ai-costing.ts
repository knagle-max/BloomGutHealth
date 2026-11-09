/** Provider unit contract only. No default tariff, live provider activation or invoice claim. */
export interface TokenUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}
export interface TokenTariff {
  reference: string;
  provider: 'openai';
  model: string;
  effectiveFrom: string;
  expiresAt: string;
  inputMicroUsdPerMillion: number;
  cachedInputMicroUsdPerMillion: number;
  outputMicroUsdPerMillion: number;
}
const units = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
/** OpenAI Responses input includes cached input; output includes reasoning tokens.
 * Do not add either subset twice. Missing cached breakdown is unknown, not zero. */
export function openAIReportedUsage(value: unknown): TokenUsage | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const details = raw.input_tokens_details;
  const cached = details && typeof details === 'object' ? (details as Record<string, unknown>).cached_tokens : undefined;
  if (!units(raw.input_tokens) || !units(raw.output_tokens) || !units(cached) || cached > raw.input_tokens) return null;
  const total = BigInt(raw.input_tokens) + BigInt(raw.output_tokens);
  if (raw.total_tokens !== undefined && (!units(raw.total_tokens) || BigInt(raw.total_tokens) !== total)) return null;
  return {inputTokens: raw.input_tokens, cachedInputTokens: cached, outputTokens: raw.output_tokens};
}
export function tokenCostMicroUsd(usage: TokenUsage, tariff: TokenTariff, model: string, now = Date.now()): number | null {
  if (!Number.isFinite(now) || tariff.provider !== 'openai' || tariff.model !== model || !/^[A-Za-z0-9_.:/-]{1,120}$/.test(tariff.reference)) return null;
  const from = Date.parse(tariff.effectiveFrom), expiry = Date.parse(tariff.expiresAt);
  if (!Number.isFinite(from) || !Number.isFinite(expiry) || from >= expiry || now < from || now >= expiry) return null;
  if (![usage.inputTokens, usage.cachedInputTokens, usage.outputTokens, tariff.inputMicroUsdPerMillion, tariff.cachedInputMicroUsdPerMillion, tariff.outputMicroUsdPerMillion].every(units) || usage.cachedInputTokens > usage.inputTokens) return null;
  const numerator = BigInt(usage.inputTokens - usage.cachedInputTokens) * BigInt(tariff.inputMicroUsdPerMillion) + BigInt(usage.cachedInputTokens) * BigInt(tariff.cachedInputMicroUsdPerMillion) + BigInt(usage.outputTokens) * BigInt(tariff.outputMicroUsdPerMillion);
  // Round up only after summing categories, without floating-point loss.
  const amount = (numerator + BigInt(999_999)) / BigInt(1_000_000);
  return amount <= BigInt(1_000_000_000_000) ? Number(amount) : null;
}
/** Reserve with no cache discount: cache hits are unknown before execution. Bounds
 * must come from a verified model tokenizer/request contract, not character guesses. */
export function maximumTokenCostMicroUsd(inputTokenBound: number, outputTokenBound: number, tariff: TokenTariff, model: string, now = Date.now()): number | null {
  if (!units(inputTokenBound) || !units(outputTokenBound)) return null;
  // A reviewed tariff may price cached input above normal input. Still reserve the worst rate.
  return tokenCostMicroUsd({inputTokens: inputTokenBound, cachedInputTokens: 0, outputTokens: outputTokenBound}, {...tariff, inputMicroUsdPerMillion: Math.max(tariff.inputMicroUsdPerMillion, tariff.cachedInputMicroUsdPerMillion)}, model, now);
}
