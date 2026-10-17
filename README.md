# OmniGuard

Small TypeScript library with four security primitives: runtime validation, HTML text escaping, hashing, and HS256 JWTs. It has no runtime dependencies.

[Live demo](https://omniguard.onuracar.dev/) · [npm](https://www.npmjs.com/package/omniguard) · [Security guarantees](./docs/security-guarantees.md)

```bash
npm install omniguard
```

> **Status:** v0.2, pre-1.0. The library is tested, but nobody has audited it independently. Read [what it guarantees and what it leaves out](./docs/security-guarantees.md) before you put it at a trust boundary.

---

## Why it exists

Many apps only need to check what comes in, escape what goes out, and sign a short-lived token. A full schema library or identity platform is more than that job needs. OmniGuard covers those cases, and every function documents exactly what it guarantees, so the whole library stays small enough to read in one sitting.

| Use OmniGuard for | Use something else for |
|---|---|
| Validating request bodies, form input, and config | Complex schemas (unions, recursion, async refinements). Use Zod or Valibot |
| Escaping untrusted text before inserting it into HTML | Keeping user-supplied rich HTML. Use DOMPurify |
| SHA-256/384/512 digests | Password hashing. Use Argon2id or scrypt |
| HS256 tokens shared between services you control | RS256/ES256, JWKS, refresh tokens, or revocation. Use `jose` |

---

## Quick start

```ts
import { v, escapeHtmlText, signJWT, verifyJWT } from 'omniguard';

// 1. Validate untrusted input
const signup = v.object({
  email: v.string().trim().email(),
  age: v.number().int().min(18),
});
const user = signup.parse(req.body); // throws ValidationError on bad input

// 2. Escape output
const html = `<p>Welcome, ${escapeHtmlText(user.email)}</p>`;

// 3. Issue and verify a short-lived token
const token = await signJWT({ role: 'member' }, process.env.JWT_SECRET!, {
  subject: user.email,
  expiresInSeconds: 15 * 60,
});
const claims = await verifyJWT(token, process.env.JWT_SECRET!, {
  requireExpiration: true,
});
// claims is the payload, or null when the token is invalid
```

---

## Validation

Build a schema, then either `parse` it (which throws) or `safeParse` it (which returns a result).

```ts
import { v } from 'omniguard';

const schema = v.object({
  email: v.string().trim().email(),
  age: v.number().int().min(18),
  tags: v.array(v.string()).max(2),
  nickname: v.string().optional(),
});

const result = schema.safeParse({ email: 'bad', age: 17.5, tags: ['a', 'b', 'c'] });

if (!result.success) {
  console.log(result.error.issues);
}
```

```js
[
  { code: 'invalid_string', message: 'Invalid email', path: ['email'] },
  { code: 'invalid_type', message: 'Expected integer, received float', path: ['age'] },
  { code: 'too_small', message: 'Number must be greater than or equal to 18', path: ['age'] },
  { code: 'too_big', message: 'Array must contain at most 2 element(s)', path: ['tags'] },
]
```

Behaviour to know about:

- **All issues are collected.** You get every problem at once, each with a `path`.
- **Unknown keys are dropped.** `v.object` returns only the keys in its shape, so extra fields in the input never reach your code.
- **Transforms run before rules.** `v.string().trim().email()` trims first and then checks the email, so `'  a@b.co '` passes and comes back as `'a@b.co'`.
- **Numbers must be finite.** `NaN` and `±Infinity` are always rejected.
- **Schemas are immutable.** Each chained call returns a new validator, so a shared base schema is safe to extend.

### Validator reference

| Validator | Methods |
|---|---|
| `v.string()` | `min(n)`, `max(n)`, `email()`, `url()` (http/https only), `regex(re)`, `trim()`, `escape()`, `stripHtmlTags()` |
| `v.number()` | `min(n)`, `max(n)`, `int()`, `positive()`, `nonnegative()` |
| `v.array(schema)` | `min(n)`, `max(n)` |
| `v.object(shape)` | |
| Every validator | `parse(value)`, `safeParse(value)`, `optional()`, `nullable()` |

Each rule method takes an optional custom message, for example `v.string().min(8, 'Password too short')`.

---

## HTML output

```ts
import { escapeHtmlText, stripHtmlTags } from 'omniguard';

escapeHtmlText(`<a href="x">Tom & 'Jerry'</a>`);
// &lt;a href=&quot;x&quot;&gt;Tom &amp; &#039;Jerry&#039;&lt;/a&gt;

stripHtmlTags('<b>Hello</b> world');
// Hello world
```

- `escapeHtmlText` encodes `& < > " '`. Use it for HTML text, in templates that don't already escape values. It is **not** safe inside `<script>`, `style`, event handlers, or URLs.
- `stripHtmlTags` pulls approximate plain text out of HTML, for example to build a search index or a preview snippet. **It is not an XSS sanitizer.** A regex cannot parse malformed HTML safely.

Inside a schema, `v.string().escape()` and `v.string().stripHtmlTags()` apply the same functions as transforms.

---

## Hashing

```ts
import { hash } from 'omniguard';

await hash('hello');            // SHA-256 (default)
// 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

await hash('hello', 'SHA-512'); // 'SHA-256' | 'SHA-384' | 'SHA-512'
```

The result is a hex digest computed with Web Crypto. A digest proves neither who sent a message nor that a password is safe. Use HMAC for authentication and Argon2id or scrypt for passwords.

---

## HS256 JWTs

```ts
import { signJWT, verifyJWT } from 'omniguard';

// At least 32 UTF-8 bytes, generated randomly, e.g.:
// node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
const secret = process.env.JWT_SECRET!;

const token = await signJWT({ role: 'editor' }, secret, {
  subject: 'user-42',
  issuer: 'my-api',
  audience: 'dashboard',
  expiresInSeconds: 15 * 60,
});

const claims = await verifyJWT(token, secret, {
  issuer: 'my-api',
  audience: 'dashboard',
  requireExpiration: true,
  maxTokenAgeSeconds: 15 * 60,
});
// { role: 'editor', iat, exp, iss: 'my-api', aud: 'dashboard', sub: 'user-42' }
```

**How it fails:** `verifyJWT` returns `null` for any bad token: wrong signature, expired, wrong audience, malformed, and so on. It deliberately doesn't tell you which. A configuration mistake throws instead, for example a secret shorter than 32 bytes throws a `RangeError`. That way a bad token can't crash your app, and a bad setup can't go unnoticed.

What verification checks:

- The header must say `alg: "HS256"`. Any other algorithm, including `none`, is rejected.
- The HMAC signature is checked **before** the payload is read.
- `exp`, `nbf`, and future `iat` are checked, with optional `clockToleranceSeconds`.
- `issuer`, `audience`, and `subject` are checked when you pass them.

| `signJWT` option | | `verifyJWT` option | |
|---|---|---|---|
| `expiresInSeconds` | sets `exp` | `requireExpiration` | reject tokens without `exp` |
| `notBeforeSeconds` | sets `nbf` | `maxTokenAgeSeconds` | reject tokens older than this (needs `iat`) |
| `issuer` / `audience` / `subject` | set `iss` / `aud` / `sub` | `issuer` / `audience` / `subject` | must match (a string or a list) |
| `issuedAt: false` | omit `iat` (on by default) | `clockToleranceSeconds` | allowed clock skew |
| `now` | override the clock (tests) | `now` | override the clock (tests) |

JWT payloads are **encoded, not encrypted**, so anyone holding the token can read them. Don't put secrets in claims.

---

## Runtime support

OmniGuard needs Web Crypto (`crypto.subtle`), `TextEncoder`/`TextDecoder`, and `atob`/`btoa`. CI tests it on **Node.js 20**, and the package declares `node >= 18`. Any runtime with those globals should work (modern browsers, Deno, Bun, Cloudflare Workers), but CI doesn't test them.

It ships ESM and CommonJS builds with TypeScript declarations.

---

## Development

```bash
npm ci
npm test        # vitest
npm run build   # tsup → dist/, then builds the website
```

The demo site lives in [`website/`](./website). It's a Vite + React app that imports the library straight from `src/`.

See [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) for reporting vulnerabilities, and [CHANGELOG.md](./CHANGELOG.md).

### Deprecated names

`escapeHtml`, `stripHtml`, and the validator method `.stripHtml()` still work in 0.2.x. They are aliases of `escapeHtmlText` and `stripHtmlTags`, renamed so each name says exactly what the function does.

## License

MIT © Onur Acar
