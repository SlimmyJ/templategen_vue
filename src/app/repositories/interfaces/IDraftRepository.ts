export interface IDraftRepository<T> {
  loadDraft(): T | null;
  saveDraft(request: T): void;
  clearDraft(): void;
}
