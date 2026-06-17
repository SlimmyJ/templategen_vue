import type { Identifiable, ICollectionRepository } from "../interfaces/ICollectionRepository";

export class LocalCollectionRepository<T extends Identifiable> implements ICollectionRepository<T> {
  private readonly storageKey: string;

  public constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  public getAll(): T[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  public upsert(item: T): void {
    const all = this.getAll();
    const index = all.findIndex((x) => x.id === item.id);
    if (index >= 0) all[index] = item;
    else all.push(item);
    this.write(all);
  }

  public remove(id: string): void {
    this.write(this.getAll().filter((x) => x.id !== id));
  }

  public ensureSeed(seed: T[]): void {
    const existing = this.getAll();
    if (existing.length === 0) {
      this.write(seed);
      return;
    }

    const merged = [...existing];
    for (const item of seed) {
      if (!merged.some((x) => x.id === item.id)) merged.push(item);
    }
    this.write(merged);
  }

  private write(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {

    }
  }
}
