import { describe, it, expect } from 'vitest';
import { v } from '../src/index';

describe('ArrayValidator', () => {
  it('should validate simple arrays', () => {
    const schema = v.array(v.string());
    expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
    expect(schema.parse([])).toEqual([]);
  });

  it('should throw on invalid arrays', () => {
    const schema = v.array(v.string());
    expect(() => schema.parse('string')).toThrow('Expected array, received string');
    expect(() => schema.parse(['a', 2])).toThrow('Expected string, received number');
  });

  it('should validate min and max elements', () => {
    const schema = v.array(v.number()).min(2).max(3);
    expect(schema.parse([1, 2])).toEqual([1, 2]);
    expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
    expect(() => schema.parse([1])).toThrow('Array must contain at least 2 element(s)');
    expect(() => schema.parse([1, 2, 3, 4])).toThrow('Array must contain at most 3 element(s)');
  });

  it('should provide correct issue paths', () => {
    const schema = v.array(v.number());
    const result = schema.safeParse([1, 'two', 3]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([1]);
    }
  });

  it('should handle array of objects', () => {
    const schema = v.array(v.object({ id: v.number() }));
    expect(schema.parse([{ id: 1 }, { id: 2 }])).toEqual([{ id: 1 }, { id: 2 }]);
    
    const result = schema.safeParse([{ id: 1 }, { id: '2' }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([1, 'id']);
    }
  });
});
