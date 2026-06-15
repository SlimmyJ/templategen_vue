export type Identifiable = { id: string };

/**
 * Persistence for a flat collection of identifiable records (installers, call-log
 * entries, …). The local implementation is localStorage-backed, but the interface
 * is the seam a real API can slot into later.
 */
export interface ICollectionRepository<T extends Identifiable> {
  getAll(): T[];
  upsert(item: T): void;
  remove(id: string): void;
  /** Inserts any seed records whose id is not present yet; never overwrites. */
  ensureSeed(seed: T[]): void;
}
