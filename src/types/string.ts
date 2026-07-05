import { BaseValidator, ParseContext } from '../core/BaseValidator';
import { Issue } from '../errors/ValidationError';
import { escapeHtml, stripHtml } from '../security/sanitization';

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

  // Sanitization methods
  public escape(): this {
    return this.addTransform((val) => escapeHtml(val));
  }

  public stripHtml(): this {
    return this.addTransform((val) => stripHtml(val));
  }
}

export function string() {
  return new StringValidator();
}
