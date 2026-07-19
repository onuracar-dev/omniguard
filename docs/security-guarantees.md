# Security guarantees and non-goals

OmniGuard keeps its security claims deliberately narrow.

## Validation

Validators establish that a runtime value matches the rules configured by the caller. They do not establish authorization, ownership, uniqueness, database safety, or business correctness. Continue to use parameterized queries and enforce access control at the resource boundary.

## HTML handling

`escapeHtmlText` encodes `&`, `<`, `>`, double quotes, and single quotes. Use it for an HTML text node when the rendering system does not already escape values. Do not reuse its output in JavaScript, CSS, event-handler, or URL contexts.

`stripHtmlTags` uses tag-shaped plain-text extraction. It is intentionally not presented as sanitization: parsing malformed HTML with a regular expression cannot provide an XSS guarantee. Use a well-maintained, allow-list HTML sanitizer when accepting rich text.

## Hashing

`hash` delegates to Web Crypto digest algorithms. A digest provides neither authenticity nor password-hardening. Use HMAC for message authentication and Argon2id or scrypt with appropriate parameters for passwords.

## JWT

The JWT helper implements symmetric HS256 only. Verification:

- accepts only a JOSE header declaring `HS256` and, when present, type `JWT`;
- verifies the HMAC before returning claims;
- validates `exp`, `nbf`, and future `iat` values;
- can require expiration and constrain maximum token age, issuer, audience, and subject;
- rejects secrets shorter than 32 UTF-8 bytes.

The caller remains responsible for generating and protecting a high-entropy secret, selecting all expected claims, rotating keys, revoking sessions, preventing token theft, and keeping token contents non-sensitive. JWT payloads are encoded, not encrypted. OmniGuard does not support asymmetric algorithms, JWK discovery, multiple signing keys, refresh-token workflows, or revocation lists.

## Audit status

The project is tested but has not received an independent security audit. Review the implementation and threat model before adopting it for high-risk systems.
