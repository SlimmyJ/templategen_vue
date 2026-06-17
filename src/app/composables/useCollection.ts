import { computed, ref, type Ref } from "vue";
import type { Identifiable, ICollectionRepository } from "../repositories/interfaces/ICollectionRepository";

export type UseCollectionOptions<T> = {

  seed?: T[];

  searchFields?: (item: T) => string[];
};

export function useCollection<T extends Identifiable>(
  repository: ICollectionRepository<T>,
  options: UseCollectionOptions<T> = {}
) {
  if (options.seed && options.seed.length > 0) repository.ensureSeed(options.seed);

  const items = ref<T[]>([]) as Ref<T[]>;
  const search = ref<string>("");

  function reload(): void {
    items.value = repository.getAll();
  }
  reload();

  const filtered = computed<T[]>(() => {
    const term = search.value.trim().toLowerCase();
    if (term.length === 0) return items.value;

    const searchFields = options.searchFields;
    if (!searchFields) return items.value;

    return items.value.filter((item) =>
      searchFields(item).some((field) => field.trim().toLowerCase().includes(term))
    );
  });

  function upsert(item: T): void {
    repository.upsert(item);
    reload();
  }

  function remove(id: string): void {
    repository.remove(id);
    reload();
  }

  return { items, filtered, search, reload, upsert, remove };
}
