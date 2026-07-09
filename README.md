# OmniGuard 🛡️

A universal, high-performance, and tree-shakable security and validation toolkit for JavaScript and TypeScript.

## Project Snapshot

OmniGuard is a zero-dependency TypeScript toolkit that combines schema validation, sanitization, hashing, and JWT helpers around native Web APIs. It is a strong systems-style portfolio project because it touches correctness, edge-runtime compatibility, security ergonomics, and testable APIs.

- **Core idea:** replace several common validation/security dependencies with one small tree-shakable package.
- **Recent hardening:** JWT verification now rejects expired tokens and tokens whose `nbf` claim is still in the future.
- **Validation:** `npm test` and `npm run build`.

[English](#english) | [Türkçe](#türkçe)

---

<a id="english"></a>
## English

### What is OmniGuard?
OmniGuard is a modern, all-in-one utility library designed to handle data validation, sanitization, and cryptography. It features a fluent, Zod-like API for schema validation, built-in XSS prevention, and lightweight Web Crypto API integrations for hashing and JSON Web Tokens (JWT).

### The Problem It Solves
Modern web development often requires multiple heavy dependencies:
- `zod` or `yup` for validation.
- `dompurify` or `xss` for sanitization.
- `jsonwebtoken` and `crypto` libraries for security.

These dependencies bloat your bundle size and often don't work natively in Edge environments (like Cloudflare Workers, Vercel Edge, Deno, or Bun) without polyfills. **OmniGuard solves this** by combining all these features into a single, zero-dependency, tree-shakable library that runs perfectly anywhere using native Web APIs.

### Installation

```bash
npm install omniguard
# or
yarn add omniguard
# or
pnpm add omniguard
```

### Basic Usage

#### 1. Schema Validation & Sanitization
```typescript
import { v } from 'omniguard';

// Define a schema with chained rules and sanitization
const userSchema = v.object({
  username: v.string().stripHtml().min(3).max(20),
  email: v.string().email(),
  age: v.number().int().positive().optional(),
  tags: v.array(v.string().escape()).min(1)
});

// Parse data safely
const data = {
  username: "<b>JohnDoe</b>", // HTML will be stripped
  email: "john@example.com",
  age: 30,
  tags: ["<script>alert(1)</script>"] // HTML will be escaped
};

const result = userSchema.safeParse(data);

if (result.success) {
  console.log("Valid Data:", result.data);
  // { username: 'JohnDoe', email: 'john@...', age: 30, tags: ['&lt;script&gt...'] }
} else {
  console.error("Validation Errors:", result.error.issues);
}
```

#### 2. Cryptography (Web Crypto API)
```typescript
import { crypto } from 'omniguard';

// 1. Hashing
const hashedStr = await crypto.hash("my-password", "SHA-256");

// 2. JWT Sign & Verify
const secret = "super-secret-key-123!";
const payload = { userId: 42, role: "admin" };

const token = await crypto.signJWT(payload, secret);
console.log("Token:", token);

const verifiedPayload = await crypto.verifyJWT(token, secret);
console.log("Verified:", verifiedPayload);
```

---

<a id="türkçe"></a>
## Türkçe

### OmniGuard Nedir?
OmniGuard; veri doğrulama, temizleme (sanitization) ve kriptografi işlemlerini tek bir çatıda toplayan, evrensel (Node.js, Deno, Tarayıcı), yüksek performanslı ve modern bir JavaScript/TypeScript güvenlik kütüphanesidir. Zod benzeri akıcı (fluent) bir API sunar.

### Hangi Soruna Çözüm Olur?
Günümüz web projelerinde genellikle şu sorunlarla karşılaşılır:
- Doğrulama için `zod` veya `yup`.
- XSS temizliği için `dompurify` vb. kütüphaneler.
- Güvenlik ve token işlemleri için `jsonwebtoken`.

Bu kütüphanelerin hepsi projeye büyük bir yük (bundle size) getirir ve Cloudflare Workers, Vercel Edge gibi "Edge" ortamlarda veya Deno/Bun gibi modern runtime'larda sorun çıkartabilir. **OmniGuard**, hiçbir dış bağımlılık (zero-dependency) içermeden ve tamamen yerleşik `Web Crypto API` altyapısını kullanarak tüm bu ihtiyaçları tek bir pakette ve en yüksek performansla çözer.

### Kurulum

```bash
npm install omniguard
# veya
yarn add omniguard
# veya
pnpm add omniguard
```

### Basit Kullanım Örneği

#### 1. Veri Doğrulama ve Temizleme (Sanitization)
```typescript
import { v } from 'omniguard';

// Zincirlenebilir kurallar ve temizleyicilerle bir şema oluşturun
const userSchema = v.object({
  username: v.string().stripHtml().min(3).max(20),
  email: v.string().email(),
  age: v.number().int().positive().optional(),
  tags: v.array(v.string().escape()).min(1)
});

// Gelen veriyi güvenli bir şekilde ayrıştırın
const data = {
  username: "<b>AhmetYilmaz</b>", // HTML tagleri silinir (stripHtml)
  email: "ahmet@example.com",
  age: 30,
  tags: ["<script>alert('XSS')</script>"] // XSS'e karşı özel karakterler kaçışlanır (escape)
};

const result = userSchema.safeParse(data);

if (result.success) {
  console.log("Geçerli Veri:", result.data);
  // { username: 'AhmetYilmaz', email: '...', age: 30, tags: ['&lt;script...'] }
} else {
  console.error("Doğrulama Hataları:", result.error.issues);
}
```

#### 2. Kriptografi (Web Crypto API)
```typescript
import { crypto } from 'omniguard';

// 1. Şifreleme (Hash)
const hashedStr = await crypto.hash("sifrem123", "SHA-256");

// 2. JWT Oluşturma ve Doğrulama
const secret = "cok-gizli-anahtar-123!";
const payload = { userId: 42, role: "admin" };

const token = await crypto.signJWT(payload, secret);
console.log("Oluşturulan Token:", token);

const verifiedPayload = await crypto.verifyJWT(token, secret);
console.log("Doğrulanan İçerik:", verifiedPayload);
```
