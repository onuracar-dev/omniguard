export type JwtAudience = string | readonly string[];
export type JwtPayload = Record<string, unknown> & {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
};

export interface JwtSignOptions {
  audience?: string | string[];
  expiresInSeconds?: number;
  issuer?: string;
  issuedAt?: boolean;
  notBeforeSeconds?: number;
  now?: number;
  subject?: string;
}

export interface JwtVerifyOptions {
  algorithms?: readonly string[];
  audience?: JwtAudience;
  clockToleranceSeconds?: number;
  issuer?: string | readonly string[];
  maxTokenAgeSeconds?: number;
  now?: number;
  requireExpiration?: boolean;
  subject?: string;
}

const MIN_SECRET_BYTES = 32;

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array | null {
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padding = '='.repeat((4 - value.length % 4) % 4);
  try {
    const rawData = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(rawData, character => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function decodeJson(value: string): unknown {
  const bytes = base64UrlDecode(value);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function encodeSecret(secret: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(secret);
  if (encoded.byteLength < MIN_SECRET_BYTES) {
    throw new RangeError(`JWT secret must be at least ${MIN_SECRET_BYTES} UTF-8 bytes`);
  }
  const copy = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(copy).set(encoded);
  return copy;
}

function assertDuration(value: number | undefined, name: string, allowZero = false): void {
  if (value === undefined) return;
  const minimum = allowZero ? 0 : Number.EPSILON;
  if (!Number.isFinite(value) || value < minimum) {
    throw new RangeError(`${name} must be a finite ${allowZero ? 'non-negative' : 'positive'} number`);
  }
}

function matchesExpected(actual: string | undefined, expected: string | readonly string[] | undefined): boolean {
  if (expected === undefined) return true;
  if (actual === undefined) return false;
  return (Array.isArray(expected) ? expected : [expected]).includes(actual);
}

function matchesAudience(actual: string | string[] | undefined, expected: JwtAudience | undefined): boolean {
  if (expected === undefined) return true;
  if (actual === undefined) return false;
  const actualValues = Array.isArray(actual) ? actual : [actual];
  const expectedValues = Array.isArray(expected) ? expected : [expected];
  return expectedValues.some(value => actualValues.includes(value));
}

export async function signJWT(
  payload: JwtPayload,
  secret: string,
  options: JwtSignOptions = {},
): Promise<string> {
  if (!isPlainObject(payload)) throw new TypeError('JWT payload must be a plain object');
  assertDuration(options.expiresInSeconds, 'expiresInSeconds');
  assertDuration(options.notBeforeSeconds, 'notBeforeSeconds', true);

  const now = Math.floor(options.now ?? Date.now() / 1000);
  if (!Number.isFinite(now)) throw new RangeError('now must be a finite Unix timestamp');

  const claims: JwtPayload = { ...payload };
  if (options.issuedAt !== false) claims.iat = now;
  if (options.expiresInSeconds !== undefined) claims.exp = now + options.expiresInSeconds;
  if (options.notBeforeSeconds !== undefined) claims.nbf = now + options.notBeforeSeconds;
  if (options.issuer !== undefined) claims.iss = options.issuer;
  if (options.audience !== undefined) claims.aud = options.audience;
  if (options.subject !== undefined) claims.sub = options.subject;

  const encoder = new TextEncoder();
  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encodeSecret(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
  return `${dataToSign}.${base64UrlEncode(signature)}`;
}

export async function verifyJWT(
  token: string,
  secret: string,
  options: JwtVerifyOptions = {},
): Promise<JwtPayload | null> {
  assertDuration(options.clockToleranceSeconds, 'clockToleranceSeconds', true);
  assertDuration(options.maxTokenAgeSeconds, 'maxTokenAgeSeconds');
  const secretBytes = encodeSecret(secret);
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson(encodedHeader);
  if (!isPlainObject(header) || header.alg !== 'HS256' || (header.typ !== undefined && header.typ !== 'JWT')) return null;
  if (options.algorithms && !options.algorithms.includes('HS256')) return null;

  const signature = base64UrlDecode(encodedSignature);
  if (!signature) return null;
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await globalThis.crypto.subtle.verify(
    'HMAC',
    key,
    signature as BufferSource,
    encoder.encode(`${encodedHeader}.${encodedPayload}`),
  );
  if (!valid) return null;

  const decodedPayload = decodeJson(encodedPayload);
  if (!isPlainObject(decodedPayload)) return null;
  const payload = decodedPayload as JwtPayload;
  const numericClaims = ['exp', 'nbf', 'iat'] as const;
  if (numericClaims.some(claim => payload[claim] !== undefined && !Number.isFinite(payload[claim]))) return null;
  if (payload.iss !== undefined && typeof payload.iss !== 'string') return null;
  if (payload.sub !== undefined && typeof payload.sub !== 'string') return null;
  if (payload.aud !== undefined && typeof payload.aud !== 'string' && !(Array.isArray(payload.aud) && payload.aud.every(item => typeof item === 'string'))) return null;

  const now = Math.floor(options.now ?? Date.now() / 1000);
  if (!Number.isFinite(now)) throw new RangeError('now must be a finite Unix timestamp');
  const tolerance = options.clockToleranceSeconds ?? 0;
  if (options.requireExpiration && payload.exp === undefined) return null;
  if (payload.exp !== undefined && payload.exp <= now - tolerance) return null;
  if (payload.nbf !== undefined && payload.nbf > now + tolerance) return null;
  if (payload.iat !== undefined && payload.iat > now + tolerance) return null;
  if (options.maxTokenAgeSeconds !== undefined) {
    if (payload.iat === undefined || now - payload.iat > options.maxTokenAgeSeconds + tolerance) return null;
  }
  if (!matchesExpected(payload.iss, options.issuer)) return null;
  if (!matchesAudience(payload.aud, options.audience)) return null;
  if (!matchesExpected(payload.sub, options.subject)) return null;
  return payload;
}
