import { describe, expect, it } from 'vitest';
import { signJWT, verifyJWT } from '../src/crypto/jwt';

const secret = 'super-secret-key-with-at-least-32-bytes';

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

describe('JWT security policy', () => {
  it('rejects secrets shorter than 32 UTF-8 bytes', async () => {
    await expect(signJWT({ sub: '42' }, 'short-secret')).rejects.toThrow('at least 32');
    await expect(verifyJWT('a.b.c', 'short-secret')).rejects.toThrow('at least 32');
  });

  it('creates and verifies constrained tokens', async () => {
    const token = await signJWT(
      { role: 'admin' },
      secret,
      {
        audience: 'dashboard',
        expiresInSeconds: 300,
        issuer: 'omniguard-tests',
        now: 1_700_000_000,
        subject: 'user-42',
      },
    );

    const payload = await verifyJWT(token, secret, {
      audience: 'dashboard',
      issuer: 'omniguard-tests',
      now: 1_700_000_010,
      requireExpiration: true,
      subject: 'user-42',
    });

    expect(payload).toMatchObject({
      aud: 'dashboard',
      exp: 1_700_000_300,
      iat: 1_700_000_000,
      iss: 'omniguard-tests',
      role: 'admin',
      sub: 'user-42',
    });
  });

  it('rejects unexpected issuer, audience, subject, and algorithms', async () => {
    const token = await signJWT(
      { sub: 'user-42' },
      secret,
      { audience: ['api', 'dashboard'], expiresInSeconds: 60, issuer: 'issuer-a', now: 100 },
    );

    expect(await verifyJWT(token, secret, { audience: 'missing', now: 101 })).toBeNull();
    expect(await verifyJWT(token, secret, { issuer: 'issuer-b', now: 101 })).toBeNull();
    expect(await verifyJWT(token, secret, { subject: 'user-99', now: 101 })).toBeNull();
    expect(await verifyJWT(token, secret, { algorithms: ['RS256'], now: 101 })).toBeNull();
  });

  it('rejects tokens without an expiration when required and tokens older than max age', async () => {
    const noExpiration = await signJWT({ sub: '42' }, secret, { now: 100 });
    const expiring = await signJWT({ sub: '42' }, secret, { expiresInSeconds: 500, now: 100 });

    expect(await verifyJWT(noExpiration, secret, { now: 101, requireExpiration: true })).toBeNull();
    expect(await verifyJWT(expiring, secret, { maxTokenAgeSeconds: 50, now: 151 })).toBeNull();
    expect(await verifyJWT(expiring, secret, { clockToleranceSeconds: 1, maxTokenAgeSeconds: 50, now: 151 })).not.toBeNull();
  });

  it('rejects unsigned and malformed JOSE headers before accepting claims', async () => {
    const unsigned = `${encodeJson({ alg: 'none', typ: 'JWT' })}.${encodeJson({ sub: '42' })}.invalid`;
    const wrongType = `${encodeJson({ alg: 'HS256', typ: 'NOT-JWT' })}.${encodeJson({ sub: '42' })}.invalid`;

    expect(await verifyJWT(unsigned, secret)).toBeNull();
    expect(await verifyJWT(wrongType, secret)).toBeNull();
  });
});
