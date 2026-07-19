export * from './errors/ValidationError';
export * from './core/BaseValidator';
export { string, StringValidator } from './types/string';
export { number, NumberValidator } from './types/number';
export { object, ObjectValidator } from './types/object';
export { array, ArrayValidator } from './types/array';
export { hash } from './crypto/hash';
export { signJWT, verifyJWT } from './crypto/jwt';
export type { JwtAudience, JwtPayload, JwtSignOptions, JwtVerifyOptions } from './crypto/jwt';
export { escapeHtml, escapeHtmlText, stripHtml, stripHtmlTags } from './security/sanitization';

import { string } from './types/string';
import { number } from './types/number';
import { object } from './types/object';
import { array } from './types/array';
import { hash } from './crypto/hash';
import { signJWT, verifyJWT } from './crypto/jwt';

// Provide a convenient exported object 'v' similar to 'z' in Zod.
export const v = {
  string,
  number,
  object,
  array,
};

export const crypto = {
  hash,
  signJWT,
  verifyJWT,
};

export default { v, crypto };
