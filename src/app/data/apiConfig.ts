
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

export const apiConfig = {
  baseUrl: rawBaseUrl,
  useRemote: rawBaseUrl.length > 0
} as const;
