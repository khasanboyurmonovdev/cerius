import { SHARED_VERSION } from '@cerius/shared';

/**
 * Placeholder only. Proves the build runs, Tailwind compiles, and the
 * @cerius/shared workspace link resolves. No PRD screens or flows yet.
 */
export const App = (): React.JSX.Element => (
  <main className="flex h-full flex-col items-center justify-center bg-brand-surface">
    <h1 className="text-4xl font-semibold tracking-tight text-brand-primary">Cerius</h1>
    <div className="mt-3 h-1 w-12 rounded-full bg-brand-accent" />
    <p className="mt-2 text-sm text-brand-on-surface-muted">
      shared types v{SHARED_VERSION}
    </p>
  </main>
);
