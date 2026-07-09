# OmniGuard

Zero-dependency validation, sanitization, hashing, and JWT helpers for TypeScript.

OmniGuard is a compact security utility library built around native Web APIs. It combines a Zod-like validation API, basic sanitization helpers, hashing, and JSON Web Token signing/verification in one tree-shakable package.

## Why It Exists

Small apps and edge runtimes often need security basics without pulling several heavy dependencies:

- schema validation
- HTML stripping and escaping
- hashing through Web Crypto
- JWT signing and verification
- compatibility with browser-like and edge environments

OmniGuard puts those pieces behind one consistent API.

## Highlights

- Fluent validators for strings, numbers, arrays, and objects
- `safeParse` style validation results
- Sanitization helpers such as `stripHtml` and `escape`
- Web Crypto based hashing
- JWT signing and verification
- TypeScript-first build with tests

## Install

```bash
npm install omniguard
```

## Example

```ts
import { crypto, v } from "omniguard";

const schema = v.object({
  username: v.string().stripHtml().min(3).max(20),
  email: v.string().email(),
  tags: v.array(v.string().escape()),
});

const result = schema.safeParse({
  username: "<b>onur</b>",
  email: "onur@example.com",
  tags: ["<script>alert(1)</script>"],
});

if (result.success) {
  const token = await crypto.signJWT({ sub: result.data.email }, "secret");
  const payload = await crypto.verifyJWT(token, "secret");
  console.log(payload);
}
```

## Project Status

This is an early security toolkit and portfolio project. It already has focused unit coverage for validation, sanitization, and crypto helpers. The next useful improvements are richer error formatting, more validators, and runtime compatibility examples.

## Development

```bash
npm install
npm test
npm run build
```

## Recent Hardening

JWT verification now rejects expired tokens and tokens whose `nbf` claim is still in the future.

## License

MIT
