import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";
import { LocalCollectionRepository } from "../repositories/local/LocalCollectionRepository";
import type { IEntityRepository } from "./entityRepository";

export class LocalEntityRepository<T extends Identifiable> implements IEntityRepository<T> {
  private readonly store: LocalCollectionRepository<T>;
  private readonly searchFields: (item: T) => string[];

  public constructor(
    storageKey: string,
    searchFields: (item: T) => string[],
    seed?: T[]
  ) {
    this.store = new LocalCollectionRepository<T>(storageKey);
    this.searchFields = searchFields;
    if (seed && seed.length > 0) this.store.ensureSeed(seed);
  }

  public async list(): Promise<T[]> {
    return this.store.getAll();
  }

  public async search(term: string): Promise<T[]> {
    const needle = term.trim().toLowerCase();
    const all = this.store.getAll();
    if (needle.length === 0) return all;
    return all.filter((item) =>
      this.searchFields(item).some((field) => field.trim().toLowerCase().includes(needle))
    );
  }

  public async get(id: string): Promise<T | null> {
    return this.store.getAll().find((item) => item.id === id) ?? null;
  }

  public async save(item: T): Promise<T> {
    this.store.upsert(item);
    return item;
  }

  public async remove(id: string): Promise<void> {
    this.store.remove(id);
  }
}
