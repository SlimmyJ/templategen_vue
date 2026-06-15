/**
 * Central switch between local (localStorage) and remote (C# API) data sources.
 *
 * Set `VITE_API_BASE_URL` (e.g. in `.env.local`) to point the whole app at the
 * API; leave it empty to keep working offline against localStorage. Nothing else
 * in the app needs to change — see {@link createEntityRepository}.
 */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

export const apiConfig = {
  baseUrl: rawBaseUrl,
  useRemote: rawBaseUrl.length > 0
} as const;
