# Changelog

This project follows Semantic Versioning.

## 0.2.0 - 2026-07-19

### Added

- Explicit `escapeHtmlText` and `stripHtmlTags` helpers.
- HTTP(S) URL, regular-expression, trimming, and non-negative-number validators.
- JWT issuer, audience, subject, expiration, maximum-age, algorithm, and clock-tolerance policies.
- Package exports, runtime metadata, security policy, and CI/release checks.

### Changed

- JWT secrets must contain at least 32 UTF-8 bytes.
- JWT signing adds `iat` by default and can derive registered claims from typed options.
- Non-finite numbers are rejected.
- HTML tag stripping is documented as plain-text extraction rather than sanitization.

### Deprecated

- `escapeHtml`, `stripHtml`, and validator `.stripHtml()` in favor of names that state their exact behavior.

## 0.1.0

- Initial validation, hashing, sanitization helper, and HS256 JWT release.
