import { AuthUser, Role } from "@/types/auth";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXT_PUBLIC_SESSION_SECRET ||
  "cmd-center-cryptographic-signing-key-v1-prod-2026-safe-hmac";

const HASH_SALT = "cmd-center-pwd-salt-v1-2026";

/**
 * Derives a CryptoKey for HMAC-SHA256 signing/verification.
 */
async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Computes an HMAC-SHA256 hex digest for a given string.
 */
async function computeHmacHex(data: string): Promise<string> {
  const key = await getHmacKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const bytes = new Uint8Array(signatureBuffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  exp: number;
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

function encodePayloadToBase64Url(jsonStr: string): string {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(jsonStr, "utf-8").toString("base64url");
    } catch {
      return toBase64Url(Buffer.from(jsonStr, "utf-8").toString("base64"));
    }
  }
  return toBase64Url(btoa(unescape(encodeURIComponent(jsonStr))));
}

function decodeBase64UrlToPayload(base64url: string): string {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(base64url, "base64url").toString("utf-8");
    } catch {
      const base64 = fromBase64Url(base64url);
      return Buffer.from(base64, "base64").toString("utf-8");
    }
  }
  const base64 = fromBase64Url(base64url);
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Creates a cryptographically signed session token string: `${base64Payload}.${signature}`.
 */
export async function signSessionPayload(
  user: AuthUser,
  expiresInDays = 7
): Promise<string> {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + expiresInDays * 86400 * 1000,
  };

  const jsonStr = JSON.stringify(payload);
  const base64Payload = encodePayloadToBase64Url(jsonStr);

  const signature = await computeHmacHex(base64Payload);
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies a signed session token. Returns the authenticated user or null if
 * token is invalid, expired, or tampered with.
 */
export async function verifySessionToken(
  token: string | null | undefined
): Promise<AuthUser | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  if (!base64Payload || !signature) return null;

  // 1. Verify cryptographic HMAC signature
  try {
    const expectedSig = await computeHmacHex(base64Payload);
    if (expectedSig !== signature) {
      return null; // Tampered token
    }

    // 2. Decode payload safely
    const jsonStr = decodeBase64UrlToPayload(base64Payload);

    const payload: SessionPayload = JSON.parse(jsonStr);

    // 3. Verify expiration
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    // 4. Validate role format
    const role: Role =
      payload.role === "ADMIN" || (payload.role as string)?.toUpperCase() === "ADMIN"
        ? "ADMIN"
        : "VIEWER";

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Hashes a plaintext password with salt using SHA-256 via Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${HASH_SALT}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
