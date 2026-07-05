import { describe, it, expect } from 'vitest';
import { v } from '../src/index';

describe('ObjectValidator', () => {
  it('should validate simple objects', () => {
    const schema = v.object({
      name: v.string(),
      age: v.number()
    });

    expect(schema.parse({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 });
  });

  it('should throw on invalid objects', () => {
    const schema = v.object({ name: v.string() });
    expect(() => schema.parse(null)).toThrow('Expected type, received null');
    expect(() => schema.parse([])).toThrow('Expected object, received object'); // arrays fail Array.isArray check
    expect(() => schema.parse({ name: 123 })).toThrow('Expected string, received number');
  });

  it('should aggregate multiple issues', () => {
    const schema = v.object({
      name: v.string().min(5),
      age: v.number().min(18)
    });

    const result = schema.safeParse({ name: 'Bob', age: 10 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2);
      expect(result.error.issues[0].path).toEqual(['name']);
      expect(result.error.issues[1].path).toEqual(['age']);
    }
  });

  it('should support nested objects', () => {
    const schema = v.object({
      user: v.object({
        name: v.string()
      })
    });

    expect(schema.parse({ user: { name: 'Alice' } })).toEqual({ user: { name: 'Alice' } });
    
    const result = schema.safeParse({ user: { name: 123 } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['user', 'name']);
    }
  });
});
