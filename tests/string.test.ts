import { describe, it, expect } from 'vitest';
import { v } from '../src/index';

describe('StringValidator', () => {
  it('should parse valid strings', () => {
    expect(v.string().parse('hello')).toBe('hello');
    expect(v.string().parse('')).toBe('');
  });

  it('should reject non-strings', () => {
    expect(() => v.string().parse(123)).toThrow('Expected string, received number');
    expect(() => v.string().parse(null)).toThrow('Expected type, received null');
  });

  it('should handle optional and nullable', () => {
    expect(v.string().optional().parse(undefined)).toBeUndefined();
    expect(v.string().nullable().parse(null)).toBeNull();
    // Chaining optional and nullable is supported implicitly based on TypeScript, 
    // but in runtime we check them individually if flagged.
    // Wait, chaining both:
    const schema = v.string().optional().nullable();
    expect(schema.parse(undefined)).toBeUndefined();
    expect(schema.parse(null)).toBeNull();
    expect(schema.parse('test')).toBe('test');
  });

  it('should validate min length', () => {
    const schema = v.string().min(3);
    expect(schema.parse('abc')).toBe('abc');
    expect(() => schema.parse('ab')).toThrow('String must contain at least 3 character(s)');
  });

  it('should validate max length', () => {
    const schema = v.string().max(3);
    expect(schema.parse('abc')).toBe('abc');
    expect(() => schema.parse('abcd')).toThrow('String must contain at most 3 character(s)');
  });

  it('should validate emails', () => {
    const schema = v.string().email();
    expect(schema.parse('test@example.com')).toBe('test@example.com');
    expect(() => schema.parse('invalid-email')).toThrow('Invalid email');
  });

  it('should chain multiple rules', () => {
    const schema = v.string().min(10).email();
    expect(schema.parse('hello@test.com')).toBe('hello@test.com');
    expect(() => schema.parse('a@b.c')).toThrow('String must contain at least 10 character(s)');
  });

  it('should return multiple issues on safeParse if possible', () => {
    // Currently, BaseValidator throws or returns immediately after base type check,
    // but accumulates all rule issues.
    const schema = v.string().min(10).email();
    const result = schema.safeParse('abc');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2);
      expect(result.error.issues[0].code).toBe('too_small');
      expect(result.error.issues[1].code).toBe('invalid_string');
    }
  });
});
