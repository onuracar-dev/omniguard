import { BaseValidator, ParseContext, SafeParseResult } from '../core/BaseValidator';
import { Issue, ValidationError } from '../errors/ValidationError';

export class ArrayValidator<T extends BaseValidator<any>> extends BaseValidator<Array<T extends BaseValidator<infer U> ? U : never>> {
  private elementValidator: T;

  constructor(elementValidator: T) {
    super();
    this.elementValidator = elementValidator;
  }

  protected _parse(val: unknown, ctx: ParseContext): { success: boolean; data?: any; issue?: Issue } {
    if (!Array.isArray(val)) {
      return { success: false, issue: { code: 'invalid_type', message: 'Expected array, received ' + typeof val, path: ctx.path } };
    }

    const parsedArray: any[] = [];
    const issues: Issue[] = [];

    for (let i = 0; i < val.length; i++) {
      const item = val[i];
      const childCtx: ParseContext = { path: [...ctx.path, i] };
      const result = this.elementValidator.safeParse(item, childCtx);
      
      if (!result.success) {
        issues.push(...result.error.issues);
      } else {
        parsedArray.push(result.data);
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return { success: true, data: parsedArray };
  }

  public min(length: number, message?: string): this {
    return this.addRule((val, ctx) => {
      if (val.length < length) {
        return { code: 'too_small', message: message || `Array must contain at least ${length} element(s)`, path: ctx.path };
      }
    });
  }

  public max(length: number, message?: string): this {
    return this.addRule((val, ctx) => {
      if (val.length > length) {
        return { code: 'too_big', message: message || `Array must contain at most ${length} element(s)`, path: ctx.path };
      }
    });
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

export function array<T extends BaseValidator<any>>(elementValidator: T) {
  return new ArrayValidator(elementValidator);
}
