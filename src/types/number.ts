import { BaseValidator, ParseContext } from '../core/BaseValidator';
import { Issue } from '../errors/ValidationError';

export class NumberValidator extends BaseValidator<number> {
  protected _parse(val: unknown, ctx: ParseContext): { success: boolean; data?: number; issue?: Issue } {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return { success: false, issue: { code: 'invalid_type', message: 'Expected number, received ' + typeof val, path: ctx.path } };
    }
    return { success: true, data: val };
  }

  public min(minVal: number, message?: string): this {
    return this.addRule((val, ctx) => {
      if (val < minVal) {
        return { code: 'too_small', message: message || `Number must be greater than or equal to ${minVal}`, path: ctx.path };
      }
    });
  }

  public max(maxVal: number, message?: string): this {
    return this.addRule((val, ctx) => {
      if (val > maxVal) {
        return { code: 'too_big', message: message || `Number must be less than or equal to ${maxVal}`, path: ctx.path };
      }
    });
  }

  public int(message?: string): this {
    return this.addRule((val, ctx) => {
      if (!Number.isInteger(val)) {
        return { code: 'invalid_type', message: message || 'Expected integer, received float', path: ctx.path };
      }
    });
  }

  public positive(message?: string): this {
    return this.addRule((val, ctx) => {
      if (val <= 0) {
        return { code: 'too_small', message: message || 'Number must be greater than 0', path: ctx.path };
      }
    });
  }

  public nonnegative(message?: string): this {
    return this.addRule((val, ctx) => {
      if (val < 0) {
        return { code: 'too_small', message: message || 'Number must be greater than or equal to 0', path: ctx.path };
      }
    });
  }
}

export function number() {
  return new NumberValidator();
}
