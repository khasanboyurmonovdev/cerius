import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Static wrap only: Capacitor serves the pre-built Vite output from `webDir`.
 * There is deliberately no `server` block — no live-reload, no dev-server URL.
 * Run `pnpm --filter frontend build` before `npx cap sync` so `dist` exists.
 */
const config: CapacitorConfig = {
  appId: 'app.xeriusfit.android',
  appName: 'xeriusFit',
  webDir: 'dist',
};

export default config;
