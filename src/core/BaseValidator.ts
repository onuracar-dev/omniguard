import { ValidationError, Issue } from '../errors/ValidationError';

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

export interface ParseContext {
  path: (string | number)[];
}

export abstract class BaseValidator<T> {
  protected isOptional = false;
  protected isNullable = false;
  protected rules: ((val: any, ctx: ParseContext) => Issue | void)[] = [];
  protected transforms: ((val: any) => any)[] = [];

  // Abstract method that subclasses must implement to validate the base type
  protected abstract _parse(val: unknown, ctx: ParseContext): { success: boolean; data?: T; issue?: Issue };

  public parse(val: unknown): T {
    const result = this.safeParse(val);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  public safeParse(val: unknown, ctx: ParseContext = { path: [] }): SafeParseResult<T> {
    // Handle optional and nullable
    if (val === undefined) {
      if (this.isOptional) return { success: true, data: undefined as unknown as T };
      return { success: false, error: new ValidationError([{ code: 'invalid_type', message: 'Required', path: ctx.path }]) };
    }

    if (val === null) {
      if (this.isNullable) return { success: true, data: null as unknown as T };
      return { success: false, error: new ValidationError([{ code: 'invalid_type', message: 'Expected type, received null', path: ctx.path }]) };
    }

    // Base type check
    const baseResult = this._parse(val, ctx);
    if (!baseResult.success) {
      return { success: false, error: new ValidationError([baseResult.issue!]) };
    }

    let data = baseResult.data as T;
    const issues: Issue[] = [];

    // Apply transforms
    for (const transform of this.transforms) {
      data = transform(data);
    }

    // Run rules
    for (const rule of this.rules) {
      const issue = rule(data, ctx);
      if (issue) {
        issues.push(issue);
      }
    }

    if (issues.length > 0) {
      return { success: false, error: new ValidationError(issues) };
    }

    return { success: true, data };
  }

  public optional(): BaseValidator<T | undefined> {
    const clone = this.clone();
    clone.isOptional = true;
    return clone as unknown as BaseValidator<T | undefined>;
  }

  public nullable(): BaseValidator<T | null> {
    const clone = this.clone();
    clone.isNullable = true;
    return clone as unknown as BaseValidator<T | null>;
  }

  protected addRule(rule: (val: T, ctx: ParseContext) => Issue | void): this {
    const clone = this.clone();
    clone.rules.push(rule as any);
    return clone;
  }

  protected addTransform(transform: (val: T) => T): this {
    const clone = this.clone();
    clone.transforms.push(transform as any);
    return clone;
  }

  // To support chaining without mutating the original instance
  protected clone(): this {
    const clone = Object.create(Object.getPrototypeOf(this));
    Object.assign(clone, this);
    clone.rules = [...this.rules];
    clone.transforms = [...this.transforms];
    return clone;
  }
}
