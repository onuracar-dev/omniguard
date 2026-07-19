import { BaseValidator, ParseContext } from '../core/BaseValidator';
import { Issue } from '../errors/ValidationError';
import { escapeHtmlText, stripHtmlTags } from '../security/sanitization';

export class StringValidator extends BaseValidator<string> {
  protected _parse(val: unknown, ctx: ParseContext): { success: boolean; data?: string; issue?: Issue } {
    if (typeof val !== 'string') {
      return { success: false, issue: { code: 'invalid_type', message: 'Expected string, received ' + typeof val, path: ctx.path } };
    }
    return { success: true, data: val };
  }

  public min(length: number, message?: string): this {
    return this.addRule((val, ctx) => {
      if (val.length < length) {
        return { code: 'too_small', message: message || `String must contain at least ${length} character(s)`, path: ctx.path };
      }
    });
  }

  public max(length: number, message?: string): this {
    return this.addRule((val, ctx) => {
      if (val.length > length) {
        return { code: 'too_big', message: message || `String must contain at most ${length} character(s)`, path: ctx.path };
      }
    });
  }

  public email(message?: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.addRule((val, ctx) => {
      if (!emailRegex.test(val)) {
        return { code: 'invalid_string', message: message || 'Invalid email', path: ctx.path };
      }
    });
  }

  public url(message?: string): this {
    return this.addRule((val, ctx) => {
      try {
        const parsed = new URL(val);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error();
      } catch {
        return { code: 'invalid_string', message: message || 'Invalid HTTP(S) URL', path: ctx.path };
      }
    });
  }

  public regex(pattern: RegExp, message?: string): this {
    return this.addRule((val, ctx) => {
      pattern.lastIndex = 0;
      if (!pattern.test(val)) {
        return { code: 'invalid_string', message: message || 'String does not match the required pattern', path: ctx.path };
      }
    });
  }

  public trim(): this {
    return this.addTransform((val) => val.trim());
  }

  // Sanitization methods
  public escape(): this {
    return this.addTransform((val) => escapeHtmlText(val));
  }

  /** @deprecated This extracts plain text; it is not an XSS sanitizer. */
  public stripHtml(): this {
    return this.stripHtmlTags();
  }

  public stripHtmlTags(): this {
    return this.addTransform((val) => stripHtmlTags(val));
  }
}

export function string() {
  return new StringValidator();
}
