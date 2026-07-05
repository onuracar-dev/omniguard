import { describe, it, expect } from 'vitest';
import { v } from '../src/index';

describe('NumberValidator', () => {
  it('should parse valid numbers', () => {
    expect(v.number().parse(123)).toBe(123);
    expect(v.number().parse(0)).toBe(0);
    expect(v.number().parse(-10.5)).toBe(-10.5);
  });

  it('should reject non-numbers and NaN', () => {
    expect(() => v.number().parse('123')).toThrow('Expected number, received string');
    expect(() => v.number().parse(NaN)).toThrow('Expected number, received number'); // Because of NaN check
  });

  it('should validate min', () => {
    const schema = v.number().min(5);
    expect(schema.parse(5)).toBe(5);
    expect(schema.parse(10)).toBe(10);
    expect(() => schema.parse(4)).toThrow('Number must be greater than or equal to 5');
  });

  it('should validate max', () => {
    const schema = v.number().max(10);
    expect(schema.parse(10)).toBe(10);
    expect(schema.parse(0)).toBe(0);
    expect(() => schema.parse(11)).toThrow('Number must be less than or equal to 10');
  });

  it('should validate int', () => {
    const schema = v.number().int();
    expect(schema.parse(10)).toBe(10);
    expect(() => schema.parse(10.5)).toThrow('Expected integer, received float');
  });

  it('should validate positive', () => {
    const schema = v.number().positive();
    expect(schema.parse(1)).toBe(1);
    expect(() => schema.parse(0)).toThrow('Number must be greater than 0');
    expect(() => schema.parse(-1)).toThrow('Number must be greater than 0');
  });

  it('should handle optional and nullable', () => {
    expect(v.number().optional().parse(undefined)).toBeUndefined();
    expect(v.number().nullable().parse(null)).toBeNull();
  });
});
