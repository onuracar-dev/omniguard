import { describe, it, expect } from 'vitest';
import { hash } from '../src/crypto/hash';
import { signJWT, verifyJWT } from '../src/crypto/jwt';

describe('Cryptography (Web Crypto API)', () => {
  it('should hash strings using SHA-256', async () => {
    const hashed = await hash('hello world');
    // SHA-256 for 'hello world'
    expect(hashed).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('should sign and verify JWTs', async () => {
    const secret = 'super-secret-key-123!';
    const payload = { userId: 1, role: 'admin' };
    
    const token = await signJWT(payload, secret);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verifiedPayload = await verifyJWT(token, secret);
    expect(verifiedPayload).not.toBeNull();
    expect(verifiedPayload?.userId).toBe(1);
    expect(verifiedPayload?.role).toBe('admin');
  });

  it('should return null for invalid JWT verification', async () => {
    const secret = 'super-secret-key-123!';
    const wrongSecret = 'wrong-key';
    const payload = { userId: 1 };
    
    const token = await signJWT(payload, secret);
    
    // Wrong secret
    const verifiedWrong = await verifyJWT(token, wrongSecret);
    expect(verifiedWrong).toBeNull();

    // Tampered token
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.invalid_signature`;
    const verifiedTampered = await verifyJWT(tamperedToken, secret);
    expect(verifiedTampered).toBeNull();
  });
});
