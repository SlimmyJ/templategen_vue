import type { InstallationRequest } from "../models/installationModels";
import { createDefaultRequest } from "../models/installationModels";
import { mergeDefaults } from "../utils/mergeDefaults";

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
      return mergeDefaults(createDefaultRequest(), JSON.parse(raw));
    } catch {
      return null;
    }
  }

  public save(state: InstallationRequest): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch {}
  }

  public clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {}
  }
}
