import type { InstallationRequest } from "../models/installationModels";

export interface ILocalStateService {
  load(): InstallationRequest | null;
  save(state: InstallationRequest): void;
  clear(): void;
}

export class LocalStateService implements ILocalStateService {
  private readonly key = "templategen_vue_state_v1";

  public load(): InstallationRequest | null {
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as InstallationRequest;
    } catch {
      return null;
    }
  }

  public save(state: InstallationRequest): void {
    const json = JSON.stringify(state);
    window.localStorage.setItem(this.key, json);
  }

  public clear(): void {
    window.localStorage.removeItem(this.key);
  }
}
