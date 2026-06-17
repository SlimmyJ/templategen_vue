export type Identifiable = { id: string };

export interface ICollectionRepository<T extends Identifiable> {
  getAll(): T[];
  upsert(item: T): void;
  remove(id: string): void;

  ensureSeed(seed: T[]): void;
}
