/**
 * Recursively merges `incoming` into `defaults`, keeping default values for any
 * key that is missing or undefined in `incoming`. Arrays are replaced wholesale
 * rather than merged element-by-element.
 */
export function mergeDefaults<T>(defaults: T, incoming: unknown): T {
  if (!incoming || typeof incoming !== "object") return defaults;

  const src = incoming as Record<string, unknown>;
  const dst = { ...(defaults as Record<string, unknown>) } as Record<string, unknown>;

  for (const key of Object.keys(dst)) {
    const defaultValue = dst[key];
    const incomingValue = src[key];

    if (Array.isArray(defaultValue)) {
      dst[key] = Array.isArray(incomingValue) ? incomingValue : defaultValue;
      continue;
    }

    if (defaultValue !== null && typeof defaultValue === "object") {
      dst[key] = mergeDefaults(defaultValue, incomingValue);
      continue;
    }

    dst[key] = incomingValue !== undefined ? incomingValue : defaultValue;
  }

  return dst as T;
}
