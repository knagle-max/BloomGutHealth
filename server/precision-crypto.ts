import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function decodeKey(value: unknown) {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(value) || Buffer.from(value, "base64").length !== 32)
    throw new Error("A configured base64-encoded 32-byte data key is required.");
  return Buffer.from(value, "base64");
}
function legacyKey() { return decodeKey(process.env.PRECISION_DATA_KEY); }
function namedKey(id: string) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw Error("Invalid data key identifier.");
  let ring: Record<string, unknown>;
  try { ring = JSON.parse(process.env.PRECISION_DATA_KEYRING || "{}"); }
  catch { throw Error("Data key configuration is invalid."); }
  if (!ring || Array.isArray(ring) || typeof ring !== "object" || !Object.hasOwn(ring, id))
    throw Error("The required data key is unavailable.");
  return decodeKey(ring[id]);
}
export function encryptPrecision(value: unknown, userId: string) {
  const keyId = process.env.PRECISION_ACTIVE_KEY_ID;
  if (process.env.PRECISION_DATA_KEYRING && !keyId) throw Error("Select the active data key before writing records.");
  const version = keyId ? 2 : 1;
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", keyId ? namedKey(keyId) : legacyKey(), iv);
  cipher.setAAD(Buffer.from(keyId ? JSON.stringify([version, keyId, userId]) : userId));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return { version, ...(keyId ? { keyId } : {}), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}
export function decryptPrecision(encrypted: any, userId: string): unknown {
  if (encrypted?.version !== 1 && encrypted?.version !== 2) throw new Error("Unsupported precision data encryption version");
  const modern = encrypted.version === 2;
  const keyId = modern ? encrypted.keyId : undefined;
  if (modern && typeof keyId !== "string") throw Error("Missing data key identifier.");
  const iv = Buffer.from(encrypted.iv, "base64"), tag = Buffer.from(encrypted.tag, "base64");
  if (iv.length !== 12 || tag.length !== 16) throw Error("Invalid encrypted record.");
  const cipher = createDecipheriv("aes-256-gcm", modern ? namedKey(keyId) : legacyKey(), iv);
  cipher.setAAD(Buffer.from(modern ? JSON.stringify([2, keyId, userId]) : userId));
  cipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([cipher.update(Buffer.from(encrypted.ciphertext, "base64")), cipher.final()]).toString("utf8"));
}
