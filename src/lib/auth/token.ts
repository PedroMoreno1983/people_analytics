export const AUTH_COOKIE_NAME = "dw_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type SessionTokenPayload = {
  sid: string;
  uid: string;
  exp: number;
};

function getSessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.DATABASE_URL ||
    "datawise-local-dev-session-secret"
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSessionToken(payload: SessionTokenPayload) {
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingKey = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    signingKey,
    encoder.encode(encodedPayload),
  );

  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string) {
  const [encodedPayload, encodedSignature] = token.split(".");

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const signingKey = await getSigningKey();
  const isValid = await crypto.subtle.verify(
    "HMAC",
    signingKey,
    fromBase64Url(encodedSignature),
    encoder.encode(encodedPayload),
  );

  if (!isValid) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decoder.decode(fromBase64Url(encodedPayload)),
    ) as SessionTokenPayload;

    if (!payload.sid || !payload.uid || !payload.exp) {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
