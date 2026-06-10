import type { IDraftRepository } from "../interfaces/IDraftRepository";
import { mergeDefaults } from "../../utils/mergeDefaults";

/**
 * Generic localStorage-backed draft repository. Stored drafts are merged onto
 * fresh defaults on load, so drafts saved by an older model version keep
 * working after new fields are added.
 */
export class LocalDraftRepository<T> implements IDraftRepository<T> {
  private readonly storageKey: string;
  private readonly createDefaults: () => T;

  public constructor(storageKey: string, createDefaults: () => T) {
    this.storageKey = storageKey;
    this.createDefaults = createDefaults;
  }

  public loadDraft(): T | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return mergeDefaults(this.createDefaults(), JSON.parse(raw));
    } catch {
      return null;
    }
  }

  public saveDraft(request: T): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(request));
    } catch {
      // Storage full or unavailable; losing the autosave is acceptable.
    }
  }

  public clearDraft(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }
}
