import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(overrideKey?: string): Buffer {
  const hexKey = overrideKey || process.env.TOKEN_ENCRYPTION_KEY;
  if (!hexKey) {
    throw new Error("TOKEN_ENCRYPTION_KEY environment variable is not defined");
  }
  // If 64-char hex string, convert from hex; otherwise hash to 32 bytes
  if (hexKey.length === 64) {
    return Buffer.from(hexKey, "hex");
  }
  return crypto.createHash("sha256").update(hexKey).digest();
}

/**
 * Encrypts a sensitive plaintext string (such as Meta/Instagram social OAuth tokens)
 * using authenticated AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex encoded)
 */
export function encryptToken(plaintext: string, overrideKey?: string): string {
  if (!plaintext) {
    throw new Error("Cannot encrypt empty token");
  }
  const key = getKey(overrideKey);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts an authenticated AES-256-GCM ciphertext.
 * Validates integrity tag. Fails if ciphertext or auth tag is corrupted.
 */
export function decryptToken(encryptedPayload: string, overrideKey?: string): string {
  if (!encryptedPayload) {
    throw new Error("Cannot decrypt empty payload");
  }

  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format (expected iv:tag:data)");
  }

  const [ivHex, tagHex, dataHex] = parts;
  const key = getKey(overrideKey);
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
