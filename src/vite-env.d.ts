/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the C# API, e.g. "https://api.example.com". Empty = local mode. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
