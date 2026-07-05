import { BaseValidator, ParseContext, SafeParseResult } from '../core/BaseValidator';
import { Issue, ValidationError } from '../errors/ValidationError';

export class ObjectValidator<T extends Record<string, BaseValidator<any>>> extends BaseValidator<{ [K in keyof T]: T[K] extends BaseValidator<infer U> ? U : never }> {
  private shape: T;

  constructor(shape: T) {
    super();
    this.shape = shape;
  }

  protected _parse(val: unknown, ctx: ParseContext): { success: boolean; data?: any; issue?: Issue } {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      return { success: false, issue: { code: 'invalid_type', message: 'Expected object, received ' + (val === null ? 'null' : typeof val), path: ctx.path } };
    }

    const obj = val as Record<string, unknown>;
    const parsedObj: Record<string, unknown> = {};
    const issues: Issue[] = [];

    for (const key in this.shape) {
      if (Object.prototype.hasOwnProperty.call(this.shape, key)) {
        const validator = this.shape[key];
        const value = obj[key];
        
        const childCtx: ParseContext = { path: [...ctx.path, key] };
        
        const result = validator.safeParse(value, childCtx);
        if (!result.success) {
          // Flatten issues
          issues.push(...result.error.issues);
        } else {
          if (result.data !== undefined) {
             parsedObj[key] = result.data;
          }
        }
      }
    }

    if (issues.length > 0) {
      // The BaseValidator expects a single issue returned here if it fails, but object can have multiple.
      // We throw a ValidationError immediately since _parse can only return one issue right now,
      // OR we adjust the type. Actually, if we return false, BaseValidator wraps it in a new ValidationError.
      // Let's throw the aggregated ValidationError here directly.
      throw new ValidationError(issues);
    }

    return { success: true, data: parsedObj };
  }

  // Override safeParse to catch the throw from _parse
  public safeParse(val: unknown, ctx?: ParseContext): SafeParseResult<any> {
    try {
      return super.safeParse(val, ctx);
    } catch (e: any) {
      if (e instanceof ValidationError) {
        return { success: false, error: e };
      }
      throw e;
    }
  }
}

export function object<T extends Record<string, BaseValidator<any>>>(shape: T) {
  return new ObjectValidator(shape);
}
