import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";
import type { IEntityRepository } from "./entityRepository";
import { apiConfig } from "./apiConfig";
import { LocalEntityRepository } from "./LocalEntityRepository";
import { HttpEntityRepository } from "./HttpEntityRepository";

export type EntityRepositoryOptions<T> = {

  storageKey: string;

  searchFields: (item: T) => string[];

  seed?: T[];
};

export function createEntityRepository<T extends Identifiable>(
  resource: string,
  options: EntityRepositoryOptions<T>
): IEntityRepository<T> {
  if (apiConfig.useRemote) {
    return new HttpEntityRepository<T>(apiConfig.baseUrl, resource);
  }
  return new LocalEntityRepository<T>(options.storageKey, options.searchFields, options.seed);
}
