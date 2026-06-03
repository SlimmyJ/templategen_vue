import { reactive, watch } from "vue";
import { createDefaultInspectionRequest, type InspectionRequest } from "../models/inspectionModels";
import type { IInspectionRequestRepository } from "../repositories/interfaces/IInspectionRequestRepository";

type Lang = "nl" | "fr";

type LangDefaults = {
  introPrefix: string;
  introLine: string;
  confirmLine: string;
  thanksLine: string;
};

const defaultsByLang: Record<Lang, LangDefaults> = {
  nl: {
    introPrefix: "Beste",
    introLine: "Gelieve onderstaand nazicht in te plannen.",
    confirmLine: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
    thanksLine: "Alvast bedankt voor de professionele uitvoering van bovenstaande."
  },
  fr: {
    introPrefix: "Bonjour",
    introLine: "Veuillez planifier la révision suivante.",
    confirmLine: "Veuillez confirmer la date du rendez-vous à la planning et au client.",
    thanksLine: "Merci d'avance pour le bon traitement de cette demande."
  }
};

type AutoTextSnapshot = {
  language: Lang;
  introPrefix: string;
  introLine: string;
  confirmLine: string;
  thanksLine: string;
};

function normalize(value: string): string {
  return (value ?? "").trim();
}

function setIfUnchanged(
  current: string,
  previousAuto: string,
  nextAuto: string,
  setter: (value: string) => void
): void {
  if (normalize(current).length === 0 || normalize(current) === normalize(previousAuto)) {
    setter(nextAuto);
  }
}

function emptySnapshot(language: Lang): AutoTextSnapshot {
  return { language, introPrefix: "", introLine: "", confirmLine: "", thanksLine: "" };
}

export function useInspectionRequest(repository: IInspectionRequestRepository) {
  const request = reactive<InspectionRequest>(
    repository.loadDraft() ?? createDefaultInspectionRequest()
  );
  const lastAuto = reactive<AutoTextSnapshot>(emptySnapshot(request.language as Lang));

  function applyLanguageDefaults(lang: Lang): void {
    const next = defaultsByLang[lang];
    setIfUnchanged(request.intro.salutationPrefix, lastAuto.introPrefix, next.introPrefix, (v) => {
      request.intro.salutationPrefix = v;
    });
    setIfUnchanged(request.intro.requestLine, lastAuto.introLine, next.introLine, (v) => {
      request.intro.requestLine = v;
    });
    setIfUnchanged(request.ending.confirmLine, lastAuto.confirmLine, next.confirmLine, (v) => {
      request.ending.confirmLine = v;
    });
    setIfUnchanged(request.ending.thanksLine, lastAuto.thanksLine, next.thanksLine, (v) => {
      request.ending.thanksLine = v;
    });
  }

  function syncLastAuto(lang: Lang): void {
    const defaults = defaultsByLang[lang];
    lastAuto.language = lang;
    lastAuto.introPrefix = normalize(request.intro.salutationPrefix) || defaults.introPrefix;
    lastAuto.introLine = normalize(request.intro.requestLine) || defaults.introLine;
    lastAuto.confirmLine = normalize(request.ending.confirmLine) || defaults.confirmLine;
    lastAuto.thanksLine = normalize(request.ending.thanksLine) || defaults.thanksLine;
  }

  function reset(): void {
    repository.clearDraft();
    Object.assign(request, createDefaultInspectionRequest());
    syncLastAuto(request.language as Lang);
  }

  syncLastAuto(request.language as Lang);

  watch(
    () => request.language as Lang,
    (lang) => {
      applyLanguageDefaults(lang);
      syncLastAuto(lang);
    },
    { immediate: true }
  );

  watch(() => request, () => repository.saveDraft(request), { deep: true });

  return { request, reset };
}
