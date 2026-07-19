# Security policy

## Supported versions

Security fixes are provided for the latest published minor release. Users should upgrade before reporting an issue that only affects an older release.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not open a public issue with exploit details, private keys, tokens, or user data.

Include the affected version, runtime, minimal reproduction, likely impact, and any known workaround. You should receive an acknowledgement within seven days. Disclosure timing will be coordinated after the report is reproduced and a fix is available.

## Scope and expectations

OmniGuard is a compact utility library, not an identity provider, authorization system, WAF, HTML sanitizer, password hashing library, or cryptographic key-management service. It has not received an independent security audit. See [docs/security-guarantees.md](./docs/security-guarantees.md) for the precise guarantees and non-goals.
