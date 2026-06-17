import { watch } from "vue";
import type { AppLanguage } from "../models/sharedModels";

export type LanguageDefaultBinding<TRequest> = {

  defaults: Record<AppLanguage, string>;
  get(request: TRequest): string;
  set(request: TRequest, value: string): void;
};

export function useLanguageDefaults<TRequest extends { language: AppLanguage }>(
  request: TRequest,
  bindings: ReadonlyArray<LanguageDefaultBinding<TRequest>>
) {
  function normalize(value: string): string {
    return (value ?? "").trim();
  }

  function isUntouched(binding: LanguageDefaultBinding<TRequest>): boolean {
    const current = normalize(binding.get(request));
    if (current.length === 0) return true;
    return Object.values(binding.defaults).some((text) => normalize(text) === current);
  }

  watch(
    () => request.language,
    (language) => {
      for (const binding of bindings) {
        if (isUntouched(binding)) {
          binding.set(request, binding.defaults[language]);
        }
      }
    }
  );
}
