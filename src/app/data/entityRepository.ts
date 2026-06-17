import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";

export interface IEntityRepository<T extends Identifiable> {

  list(): Promise<T[]>;

  search(term: string): Promise<T[]>;
  get(id: string): Promise<T | null>;

  save(item: T): Promise<T>;
  remove(id: string): Promise<void>;
}
