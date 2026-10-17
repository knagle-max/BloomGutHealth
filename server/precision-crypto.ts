import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function key() {
  const value = process.env.PRECISION_DATA_KEY;
  if (
    !value ||
    !/^[A-Za-z0-9+/]{43}=$/.test(value) ||
    Buffer.from(value, "base64").length !== 32
  )
    throw new Error(
      "PRECISION_DATA_KEY must be a base64-encoded 32-byte key before precision data can be stored.",
    );
  return Buffer.from(value, "base64");
}
export function encryptPrecision(value: unknown, userId: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(userId));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return {
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}
export function decryptPrecision(encrypted: any, userId: string): unknown {
  if (encrypted?.version !== 1)
    throw new Error("Unsupported precision data encryption version");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(encrypted.iv, "base64"),
  );
  cipher.setAAD(Buffer.from(userId));
  cipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
  return JSON.parse(
    Buffer.concat([
      cipher.update(Buffer.from(encrypted.ciphertext, "base64")),
      cipher.final(),
    ]).toString("utf8"),
  );
}
