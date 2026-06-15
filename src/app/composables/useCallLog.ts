import { computed } from "vue";
import { LocalCollectionRepository } from "../repositories/local/LocalCollectionRepository";
import { useCollection } from "./useCollection";
import type { CallLogDraft, CallLogEntry } from "../models/callLogModels";

const STORAGE_KEY = "templategen.callLog.v1";

export function useCallLog() {
  const repository = new LocalCollectionRepository<CallLogEntry>(STORAGE_KEY);
  const { filtered, search, upsert, remove } = useCollection(repository, {
    searchFields: (entry) => [entry.contactName, entry.company, entry.phone, entry.notes]
  });

  // The collection's search-filtered list, presented most-recent-call-first.
  const entries = computed(() =>
    [...filtered.value].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
  );

  function save(draft: CallLogDraft): void {
    const now = new Date().toISOString();
    const entry: CallLogEntry = {
      id: draft.id || crypto.randomUUID(),
      at: draft.at,
      contactName: draft.contactName.trim(),
      company: draft.company.trim(),
      phone: draft.phone.trim(),
      direction: draft.direction,
      outcome: draft.outcome,
      followUpDate: draft.followUpDate,
      notes: draft.notes.trim(),
      createdAt: draft.createdAt || now,
      updatedAt: now
    };
    upsert(entry);
  }

  return { entries, search, save, remove };
}
