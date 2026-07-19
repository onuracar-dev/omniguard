import { describe, it, expect } from 'vitest';
import { v } from '../src/index';

describe('Sanitization & String Transforms', () => {
  it('should escape HTML characters', () => {
    const schema = v.string().escape();
    expect(schema.parse('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should strip HTML tags completely', () => {
    const schema = v.string().stripHtmlTags();
    expect(schema.parse('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });

  it('should escape ampersands before other HTML metacharacters', () => {
    const schema = v.string().escape();
    expect(schema.parse('&<\"\'')).toBe('&amp;&lt;&quot;&#039;');
  });

  it('documents that tag stripping is plain-text extraction, not sanitization', () => {
    const schema = v.string().stripHtmlTags();
    expect(schema.parse('<img src=x onerror=alert(1)>safe')).toBe('safe');
    expect(schema.parse('1 < 2 and 3 > 2')).toBe('1  2');
  });

  it('should chain transforms and validations correctly', () => {
    // Note: Transforms run before validations now based on BaseValidator implementation!
    // Let's test this behavior.
    const schema = v.string().stripHtmlTags().min(5);
    
    // Original string is 12 chars, but stripped is 4 chars ('abcd'). Should fail min(5).
    expect(() => schema.parse('<b>abcd</b>')).toThrow('String must contain at least 5 character(s)');
    
    // Original string 13 chars, stripped is 5 chars. Should pass.
    expect(schema.parse('<b>abcde</b>')).toBe('abcde');
  });
});
