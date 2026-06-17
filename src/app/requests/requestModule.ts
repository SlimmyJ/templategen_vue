import { reactive } from "vue";
import type { AppLanguage, InstallerSelection } from "../models/installationModels";
import type { IDraftRepository } from "../repositories/interfaces/IDraftRepository";
import { LocalDraftRepository } from "../repositories/local/LocalDraftRepository";
import { usePersistentDraft } from "../composables/usePersistentDraft";
import { useLanguageDefaults, type LanguageDefaultBinding } from "../composables/useLanguageDefaults";
import { useCopyStatus } from "../composables/useCopyStatus";
import { useInstallerCatalog } from "../composables/useInstallerCatalog";

export type RequestBase = {
  language: AppLanguage;
  installerSelection: InstallerSelection;
};

export type RequestModuleConfig<T extends RequestBase> = {

  storageKey: string;
  createDefaults: () => T;
  languageDefaults: ReadonlyArray<LanguageDefaultBinding<T>>;
};

export function useRequestModule<T extends RequestBase>(
  config: RequestModuleConfig<T>,
  repository: IDraftRepository<T> = new LocalDraftRepository<T>(config.storageKey, config.createDefaults)
) {
  const { request, resetDraft } = usePersistentDraft(repository, config.createDefaults);
  useLanguageDefaults(request, config.languageDefaults);

  const catalog = reactive(useInstallerCatalog(request));
  const { status, copyHtml } = useCopyStatus();

  return { request, reset: resetDraft, catalog, status, copyHtml };
}
