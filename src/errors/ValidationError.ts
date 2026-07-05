export interface Issue {
  code: string;
  message: string;
  path?: (string | number)[];
}

export class ValidationError extends Error {
  public readonly issues: Issue[];

  constructor(issues: Issue[]) {
    super(issues[0]?.message || 'Validation failed');
    this.name = 'ValidationError';
    this.issues = issues;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  get message(): string {
    return this.issues.map(i => i.message).join(', ');
  }
}
