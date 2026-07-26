/// <reference types="vite/client" />

/** Public, VITE_-prefixed env vars. Never put secrets here — this is bundled. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
