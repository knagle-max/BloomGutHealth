/** A separate staging caller process, never a change to the normal app's env. */
export function stagingCallerEnvironment(env = process.env) {
  if (env.BLOOM_DEPLOYMENT_CLASS !== "staging" || !env.RENDER_SERVICE_ID
      || env.RENDER_SERVICE_ID !== env.BLOOM_DEV_APPROVED_RENDER_SERVICE_ID
      || env.BLOOM_DEV_MAC_CALLER_ENABLED !== "true"
      || env.DEBUG || env.NODE_DEBUG || process.env.DEBUG || process.env.NODE_DEBUG) {
    throw Error("Dedicated staging caller is not configured.");
  }
  const fields = ["BLOOM_DEV_MAC_URL", "BLOOM_DEV_TAILSCALE_PROXY_URL", "BLOOM_DEV_MAC_ML_TOKEN", "BLOOM_DEV_SCIENCE_TOKEN"];
  if (fields.some(key => typeof env[key] !== "string" || !env[key])) throw Error("Dedicated staging caller is not configured.");
  return Object.freeze({ NODE_ENV: "development", BLOOM_RUNTIME_ENV: "development",
    BLOOM_LOCAL_SCIENCE_ENABLED: "true", BLOOM_DEV_MAC_CALLER_ENABLED: "true",
    BLOOM_DEV_MAC_URL: env.BLOOM_DEV_MAC_URL, BLOOM_DEV_TAILSCALE_PROXY_URL: env.BLOOM_DEV_TAILSCALE_PROXY_URL,
    ML_SERVICE_TOKEN: env.BLOOM_DEV_MAC_ML_TOKEN, BLOOM_DEV_SCIENCE_TOKEN: env.BLOOM_DEV_SCIENCE_TOKEN });
}
