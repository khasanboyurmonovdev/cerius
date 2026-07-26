import { env } from './env.js';

/**
 * Typed, grouped application config derived from validated env vars.
 * Application code reads this object — never `process.env` directly.
 */
export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,

  api: {
    /** URL version prefix — /v1 from day one (D12). */
    versionPrefix: '/v1',
    version: '1.0.0',
  },

  /** MongoDB Atlas — the only datastore (D3/D8). No connection is opened yet. */
  database: {
    uri: env.MONGODB_URI,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    accessTokenTtlSeconds: 600,
    refreshTokenTtlSeconds: 604_800,
  },

  /** AI provider selection (D2). Gemini is the default until the Day 11 bake-off. */
  ai: {
    provider: env.AI_PROVIDER,
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL,
  },

  firebase: {
    serviceAccountPath: env.FIREBASE_SERVICE_ACCOUNT_PATH,
  },

  billing: {
    playPackageName: env.GOOGLE_PLAY_PACKAGE_NAME,
    playServiceAccountPath: env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH,
  },

  /** CORS allow-list per docs/07. */
  cors: {
    origins: ['capacitor://localhost', 'http://localhost:5173', 'https://app.cerius.app'],
  },

  sentryDsn: env.SENTRY_DSN,
} as const;

export type AppConfig = typeof config;
export { env };
