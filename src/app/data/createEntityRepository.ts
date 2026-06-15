import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";
import type { IEntityRepository } from "./entityRepository";
import { apiConfig } from "./apiConfig";
import { LocalEntityRepository } from "./LocalEntityRepository";
import { HttpEntityRepository } from "./HttpEntityRepository";

export type EntityRepositoryOptions<T> = {
  /** localStorage key used when running in local mode. */
  storageKey: string;
  /** Fields matched by client-side search in local mode. */
  searchFields: (item: T) => string[];
  /** Optional records inserted on first use in local mode. */
  seed?: T[];
};

/**
 * Builds the right {@link IEntityRepository} for a resource based on
 * {@link apiConfig}: the HTTP client when a backend URL is configured, otherwise
 * the localStorage-backed one. This is the single place the data source is chosen.
 */
export function createEntityRepository<T extends Identifiable>(
  resource: string,
  options: EntityRepositoryOptions<T>
): IEntityRepository<T> {
  if (apiConfig.useRemote) {
    return new HttpEntityRepository<T>(apiConfig.baseUrl, resource);
  }
  return new LocalEntityRepository<T>(options.storageKey, options.searchFields, options.seed);
}
