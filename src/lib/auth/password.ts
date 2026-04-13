import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return {
    salt,
    hash,
  };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const computedHash = scryptSync(password, salt, KEY_LENGTH);
  const storedHash = Buffer.from(hash, "hex");

  if (computedHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(computedHash, storedHash);
}
