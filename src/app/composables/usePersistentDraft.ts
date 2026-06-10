import { reactive, watch } from "vue";
import type { IDraftRepository } from "../repositories/interfaces/IDraftRepository";

/**
 * Holds a reactive request object backed by a draft repository: loads an
 * existing draft on startup, autosaves on every change and restores the
 * defaults on reset.
 */
export function usePersistentDraft<T extends object>(
  repository: IDraftRepository<T>,
  createDefaults: () => T
) {
  const request = reactive(repository.loadDraft() ?? createDefaults()) as T;

  watch(() => request, () => repository.saveDraft(request), { deep: true });

  function resetDraft(): void {
    repository.clearDraft();
    Object.assign(request, createDefaults());
  }

  return { request, resetDraft };
}
