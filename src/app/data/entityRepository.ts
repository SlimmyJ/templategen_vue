import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";

/**
 * Async CRUD + search over a shared entity collection. This is the seam between
 * the app and its data source: a {@link LocalEntityRepository} backs it with
 * localStorage today, and a {@link HttpEntityRepository} will back it with the
 * C# API. Everything above this interface is storage-agnostic.
 */
export interface IEntityRepository<T extends Identifiable> {
  /** All records (optionally capped by the backend). */
  list(): Promise<T[]>;
  /** Records matching a free-text term — drives autocomplete. */
  search(term: string): Promise<T[]>;
  get(id: string): Promise<T | null>;
  /** Insert or update; returns the stored record (with backend-assigned fields). */
  save(item: T): Promise<T>;
  remove(id: string): Promise<void>;
}
