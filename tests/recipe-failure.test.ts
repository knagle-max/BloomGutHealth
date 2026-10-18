import test from "node:test";
import assert from "node:assert/strict";
import OpenAI from "openai";
import { recipeFailure } from "../server/recipe-generation";
test("AI failures distinguish actionable provider causes without exposing raw error content", () => {
  for (const [status, providerCode, expected] of [[429, "insufficient_quota", "AI_QUOTA"], [401, "invalid_api_key", "AI_AUTH"], [403, "permission_denied", "AI_ACCESS"], [404, "model_not_found", "AI_ACCESS"], [429, "rate_limit_exceeded", "AI_RATE_LIMIT"], [400, "invalid_json_schema", "AI_REQUEST"]] as const) {
    const raw = new OpenAI.APIError(status, { code: providerCode, message: "PRIVATE_KEY_AND_HEALTH_DATA" }, "PRIVATE_KEY_AND_HEALTH_DATA", new Headers());
    const r = recipeFailure(raw);
    assert.equal(r.code, expected);
    assert.equal(JSON.stringify(r).includes("PRIVATE_KEY_AND_HEALTH_DATA"), false);
  }
  assert.equal(recipeFailure(new OpenAI.APIConnectionTimeoutError()).code, "AI_TIMEOUT");
  assert.equal(recipeFailure(new Error("Generated recipes violated ingredient constraints.")).code, "AI_OUTPUT");
  assert.equal(recipeFailure(new Error("PRIVATE_KEY_AND_HEALTH_DATA")).code, "AI_UNAVAILABLE");
});
