# OmniGuard

Zero-runtime-dependency validation, contextual HTML text escaping, hashing, and focused HS256 JWT helpers for TypeScript.

[Live website](https://omniguard-lfqjdy.v2.appdeploy.ai/) · [GitHub repository](https://github.com/onuracar-dev/omniguard)

OmniGuard is intentionally small. It is useful when an application needs fluent runtime validation and a few Web Crypto-based primitives without adopting a full schema or identity platform.

> OmniGuard has not received an independent security audit. Read the [security guarantees and non-goals](./docs/security-guarantees.md) before using it at a trust boundary.

## Install

```bash
npm install omniguard
```

OmniGuard supports Node.js 18 or newer and modern runtimes that provide Web Crypto, `TextEncoder`, `TextDecoder`, `atob`, and `btoa`.

## Validation

```ts
import { v } from 'omniguard';

const userSchema = v.object({
  age: v.number().int().nonnegative(),
  email: v.string().trim().email(),
  homepage: v.string().url(),
  roles: v.array(v.string().regex(/^[a-z-]+$/)),
});

const result = userSchema.safeParse(input);
if (!result.success) {
  console.error(result.error.issues);
}
```

Validators are available for strings, finite numbers, arrays, and objects. A schema can throw through `parse` or return a discriminated result through `safeParse`.

## Output encoding and plain-text extraction

```ts
import { escapeHtmlText, stripHtmlTags, v } from 'omniguard';

escapeHtmlText('<strong>A&B</strong>');
// &lt;strong&gt;A&amp;B&lt;/strong&gt;

stripHtmlTags('<strong>Hello</strong>');
// Hello

const displayName = v.string().trim().escape().parse(untrustedName);
```

`escapeHtmlText` performs contextual encoding for HTML text. It is not safe for JavaScript, CSS, or URL contexts. `stripHtmlTags` only extracts approximate plain text and **must not be used as an XSS sanitizer**. Use a maintained allow-list sanitizer when you need to preserve untrusted HTML.

## Hashing

```ts
import { hash } from 'omniguard';

const digest = await hash('message', 'SHA-256');
```

The hash helper produces a digest, not a password hash. Use a purpose-built password hashing implementation such as Argon2id or scrypt for credentials.

## HS256 JWTs

```ts
import { signJWT, verifyJWT } from 'omniguard';

const secret = process.env.JWT_SECRET!; // at least 32 UTF-8 bytes, generated randomly

const token = await signJWT(
  { role: 'editor' },
  secret,
  {
    audience: 'dashboard',
    expiresInSeconds: 15 * 60,
    issuer: 'my-api',
    subject: 'user-42',
  },
);

const claims = await verifyJWT(token, secret, {
  algorithms: ['HS256'],
  audience: 'dashboard',
  issuer: 'my-api',
  maxTokenAgeSeconds: 15 * 60,
  requireExpiration: true,
});
```

Verification authenticates the signature and validates temporal and identity claims according to the options supplied by the caller. It returns `null` for an invalid token. Configuration errors, such as a secret shorter than 32 bytes, throw.

## API surface

- `v.string()`: `min`, `max`, `email`, `url`, `regex`, `trim`, `escape`, `stripHtmlTags`
- `v.number()`: `min`, `max`, `int`, `positive`, `nonnegative`
- `v.array(schema)` and `v.object(shape)`
- `hash(value, algorithm)`
- `signJWT(payload, secret, options)` and `verifyJWT(token, secret, options)`
- `escapeHtmlText(value)` and `stripHtmlTags(value)`

The old `escapeHtml`, `stripHtml`, and validator `.stripHtml()` names remain as deprecated compatibility aliases in 0.2.x.

## Development

```bash
npm ci
npm test
npm run build
npm pack --dry-run
```

See [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md), and [CHANGELOG.md](./CHANGELOG.md).

## License

MIT © Onur Acar
