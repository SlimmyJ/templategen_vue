import type { InstallationRequest } from "../models/installationModels";
import { createDefaultRequest } from "../models/installationModels";

export interface ILocalStateService {
  load(): InstallationRequest | null;
  save(state: InstallationRequest): void;
  clear(): void;
}

export class LocalStateService implements ILocalStateService {
  private readonly key = "templategen.installationRequest.v2";

  public load(): InstallationRequest | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as unknown;
      const defaults = createDefaultRequest();

      return this.mergeIntoDefaults(defaults, parsed);
    } catch {
      return null;
    }
  }

  public save(state: InstallationRequest): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch {
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // ignore
    }
  }

  private mergeIntoDefaults<T>(defaults: T, incoming: unknown): T {
    if (!incoming || typeof incoming !== "object") return defaults;

    const src = incoming as Record<string, unknown>;
    const dst = { ...(defaults as any) } as any;

    for (const k of Object.keys(dst)) {
      const dv = dst[k];
      const sv = src[k];

      if (Array.isArray(dv)) {
        dst[k] = Array.isArray(sv) ? sv : dv;
        continue;
      }

      if (dv && typeof dv === "object" && !Array.isArray(dv)) {
        dst[k] = this.mergeIntoDefaults(dv, sv);
        continue;
      }

      dst[k] = sv !== undefined ? sv : dv;
    }

    return dst as T;
  }
}
