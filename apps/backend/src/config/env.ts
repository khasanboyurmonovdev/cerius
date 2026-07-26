import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

/**
 * Schema for every environment variable the backend reads.
 * Secrets are optional in development so the skeleton boots without real
 * credentials; they are required in production.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    // Datastore — MongoDB Atlas is the ONLY datastore (D3/D8). Not connected yet.
    MONGODB_URI: z.string().default(''),

    // Auth (D6)
    JWT_SECRET: z.string().default(''),
    JWT_REFRESH_SECRET: z.string().default(''),

    // AI provider (D2 — Gemini is the default, bake-off resolves by Day 11)
    AI_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
    AI_API_KEY: z.string().default(''),
    AI_MODEL: z.string().default('gemini-2.5-flash'),

    // Firebase — Auth/FCM/Analytics/Crashlytics only, never a datastore
    FIREBASE_SERVICE_ACCOUNT_PATH: z.string().default(''),

    // Billing (D7 — Google Play via RevenueCat)
    GOOGLE_PLAY_PACKAGE_NAME: z.string().default('app.cerius.android'),
    GOOGLE_PLAY_SERVICE_ACCOUNT_PATH: z.string().default(''),

    SENTRY_DSN: z.string().default(''),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;

    const requiredInProduction = [
      'MONGODB_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'AI_API_KEY',
    ] as const;

    for (const key of requiredInProduction) {
      if (env[key] === '') {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required when NODE_ENV=production`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env: Env = parsed.data;
