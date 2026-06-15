import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";
import type { IEntityRepository } from "./entityRepository";

/**
 * REST client implementation of {@link IEntityRepository}. This file doubles as
 * the contract the C# API must satisfy for a given `resource` (e.g. "customers"):
 *
 *   GET    {base}/{resource}            -> T[]              (list)
 *   GET    {base}/{resource}?q={term}   -> T[]              (search)
 *   GET    {base}/{resource}/{id}       -> T  | 404         (get)
 *   PUT    {base}/{resource}/{id}       -> T                (upsert; body = T)
 *   DELETE {base}/{resource}/{id}       -> 204              (remove)
 *
 * IDs are generated client-side (uuid), so create and update both use PUT/{id}
 * as an idempotent upsert. The backend should set `createdAt`/`updatedAt`.
 */
export class HttpEntityRepository<T extends Identifiable> implements IEntityRepository<T> {
  private readonly baseUrl: string;
  private readonly resource: string;

  public constructor(baseUrl: string, resource: string) {
    this.baseUrl = baseUrl;
    this.resource = resource;
  }

  public async list(): Promise<T[]> {
    return this.json<T[]>(await fetch(this.url()));
  }

  public async search(term: string): Promise<T[]> {
    return this.json<T[]>(await fetch(`${this.url()}?q=${encodeURIComponent(term)}`));
  }

  public async get(id: string): Promise<T | null> {
    const response = await fetch(this.url(id));
    if (response.status === 404) return null;
    return this.json<T>(response);
  }

  public async save(item: T): Promise<T> {
    const response = await fetch(this.url(item.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    return this.json<T>(response);
  }

  public async remove(id: string): Promise<void> {
    const response = await fetch(this.url(id), { method: "DELETE" });
    if (!response.ok) throw new Error(`DELETE ${this.resource}/${id} failed: ${response.status}`);
  }

  private url(id?: string): string {
    const base = `${this.baseUrl}/${this.resource}`;
    return id ? `${base}/${encodeURIComponent(id)}` : base;
  }

  private async json<R>(response: Response): Promise<R> {
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return (await response.json()) as R;
  }
}
