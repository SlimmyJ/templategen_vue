import { reactive } from "vue";
import type { AppLanguage, InstallerSelection } from "../models/installationModels";
import type { IDraftRepository } from "../repositories/interfaces/IDraftRepository";
import { LocalDraftRepository } from "../repositories/local/LocalDraftRepository";
import { usePersistentDraft } from "../composables/usePersistentDraft";
import { useLanguageDefaults, type LanguageDefaultBinding } from "../composables/useLanguageDefaults";
import { useCopyStatus } from "../composables/useCopyStatus";
import { useInstallerCatalog } from "../composables/useInstallerCatalog";

/**
 * The minimum a request model must expose to be driven by {@link useRequestModule}:
 * a language (for language-dependent defaults) and an installer selection (for the
 * shared installer catalog). Both the installation and inspection requests satisfy it.
 */
export type RequestBase = {
  language: AppLanguage;
  installerSelection: InstallerSelection;
};

/**
 * Declarative description of an email-style request module. This is the single
 * source of truth that distinguishes one request (installation, inspection, …)
 * from another; everything else — autosave, language defaults, installer catalog,
 * copy status — is shared plumbing provided by {@link useRequestModule}.
 */
export type RequestModuleConfig<T extends RequestBase> = {
  /** localStorage key for the autosaved draft. */
  storageKey: string;
  createDefaults: () => T;
  languageDefaults: ReadonlyArray<LanguageDefaultBinding<T>>;
};

/**
 * Wires a request model's shared plumbing: a persistent draft, language-aware
 * default texts, the installer catalog and a clipboard status line. Views built
 * on top only have to lay out their sections and map the renderer's output onto
 * the preview panel.
 *
 * The repository is injectable so the same module can later be backed by a real
 * API instead of localStorage; it defaults to the local draft repository.
 */
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
