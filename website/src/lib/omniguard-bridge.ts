import {
  v,
  hash,
  signJWT,
  verifyJWT,
  escapeHtmlText,
  stripHtmlTags,
  type JwtPayload,
  type JwtSignOptions,
  type JwtVerifyOptions,
} from 'omniguard';

export {
  v,
  hash,
  signJWT,
  verifyJWT,
  escapeHtmlText,
  stripHtmlTags,
  type JwtPayload,
  type JwtSignOptions,
  type JwtVerifyOptions,
};

// Preset Schema definitions for the interactive Studio
export interface SchemaPreset {
  id: string;
  name: string;
  description: string;
  schemaCode: string;
  defaultPayload: string;
  validate: (input: unknown) => { success: boolean; data?: unknown; error?: unknown; durationMs: number };
}

export const SCHEMA_PRESETS: Record<string, SchemaPreset> = {
  userAuth: {
    id: 'userAuth',
    name: 'User Registration',
    description: 'Validates email format, age boundaries, URL homepage, and allowed role strings.',
    schemaCode: `const userSchema = v.object({
  email: v.string().trim().email(),
  age: v.number().int().nonnegative().min(18),
  website: v.string().url(),
  roles: v.array(v.string().regex(/^[a-z_]+$/)),
});`,
    defaultPayload: JSON.stringify(
      {
        email: 'developer@example.com',
        age: 26,
        website: 'https://omniguard.onuracar.dev',
        roles: ['admin', 'security_lead'],
      },
      null,
      2,
    ),
    validate: (input: unknown) => {
      const start = performance.now();
      const schema = v.object({
        email: v.string().trim().email(),
        age: v.number().int().nonnegative().min(18),
        website: v.string().url(),
        roles: v.array(v.string().regex(/^[a-z_]+$/)),
      });
      const result = schema.safeParse(input);
      const durationMs = performance.now() - start;
      if (result.success) {
        return { success: true, data: result.data, durationMs };
      }
      return { success: false, error: result.error, durationMs };
    },
  },
  apiOrder: {
    id: 'apiOrder',
    name: 'API Order Payload',
    description: 'Enforces strictly positive amounts, 3-letter currency codes, and positive quantities.',
    schemaCode: `const orderSchema = v.object({
  orderId: v.string().min(8),
  amount: v.number().positive(),
  currency: v.string().trim().min(3).max(3),
  quantity: v.number().int().positive(),
});`,
    defaultPayload: JSON.stringify(
      {
        orderId: 'ord_98726351',
        amount: 149.5,
        currency: 'USD',
        quantity: 2,
      },
      null,
      2,
    ),
    validate: (input: unknown) => {
      const start = performance.now();
      const schema = v.object({
        orderId: v.string().min(8),
        amount: v.number().positive(),
        currency: v.string().trim().min(3).max(3),
        quantity: v.number().int().positive(),
      });
      const result = schema.safeParse(input);
      const durationMs = performance.now() - start;
      if (result.success) {
        return { success: true, data: result.data, durationMs };
      }
      return { success: false, error: result.error, durationMs };
    },
  },
  sessionClaim: {
    id: 'sessionClaim',
    name: 'Session Token Claims',
    description: 'Restricts subject to email, organization slug to regex, and token level to integer.',
    schemaCode: `const sessionSchema = v.object({
  sub: v.string().trim().email(),
  org: v.string().regex(/^[a-z0-9-]+$/),
  level: v.number().int().min(1).max(5),
});`,
    defaultPayload: JSON.stringify(
      {
        sub: 'secops@enterprise.internal',
        org: 'acme-corp',
        level: 4,
      },
      null,
      2,
    ),
    validate: (input: unknown) => {
      const start = performance.now();
      const schema = v.object({
        sub: v.string().trim().email(),
        org: v.string().regex(/^[a-z0-9-]+$/),
        level: v.number().int().min(1).max(5),
      });
      const result = schema.safeParse(input);
      const durationMs = performance.now() - start;
      if (result.success) {
        return { success: true, data: result.data, durationMs };
      }
      return { success: false, error: result.error, durationMs };
    },
  },
};
