import { reactive, watch } from "vue";
import { createDefaultRequest, type InstallationRequest } from "../models/installationModels";
import type { IInstallationRequestRepository } from "../repositories/interfaces/IInstallationRequestRepository";

type Lang = "nl" | "fr";

type LangDefaults = {
  introPrefix: string;
  introLine: string;
  confirmLine: string;
  thanksLine: string;
  placeLine: string;
  customerPrefix: string;
};

type AutoTextSnapshot = {
  language: Lang;
  introLine: string;
  confirmLine: string;
  thanksLine: string;
  placeLine: string;
  introPrefix: string;
  customerPrefix: string;
};

const defaultsByLang: Record<Lang, LangDefaults> = {
  nl: {
    introPrefix: "Beste",
    introLine: "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen.",
    confirmLine: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
    thanksLine: "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht.",
    placeLine: "Installatieplaats: te verifiëren met klant",
    customerPrefix: "Beste"
  },
  fr: {
    introPrefix: "Bonjour",
    introLine: "Veuillez contacter le client ci-dessous et planifier la mission suivante.",
    confirmLine: "Veuillez confirmer la date du rendez-vous à la planning et au client.",
    thanksLine: "Merci d'avance pour le bon traitement de cette demande.",
    placeLine: "Lieu d'installation : à vérifier avec le client",
    customerPrefix: "Bonjour"
  }
};

function normalizeText(value: string): string {
  return (value ?? "").trim();
}

function setIfUnchanged(
  current: string,
  previousAuto: string,
  nextAuto: string,
  setter: (value: string) => void
): void {
  const currentValue = normalizeText(current);
  const previousValue = normalizeText(previousAuto);

  if (currentValue.length === 0 || currentValue === previousValue) {
    setter(nextAuto);
  }
}

function createEmptyAutoTextSnapshot(language: Lang): AutoTextSnapshot {
  return {
    language,
    introLine: "",
    confirmLine: "",
    thanksLine: "",
    placeLine: "",
    introPrefix: "",
    customerPrefix: ""
  };
}

export function useInstallationRequest(repository: IInstallationRequestRepository) {
  const request = reactive<InstallationRequest>(repository.loadDraft() ?? createDefaultRequest());
  const lastAuto = reactive<AutoTextSnapshot>(
    createEmptyAutoTextSnapshot(request.language as Lang)
  );

  function applyLanguageDefaults(lang: Lang): void {
    const nextDefaults = defaultsByLang[lang];

    setIfUnchanged(request.intro.salutationPrefix, lastAuto.introPrefix, nextDefaults.introPrefix, (value) => {
      request.intro.salutationPrefix = value;
    });

    setIfUnchanged(
      request.customerEmail.intro.salutationPrefix,
      lastAuto.customerPrefix,
      nextDefaults.customerPrefix,
      (value) => {
        request.customerEmail.intro.salutationPrefix = value;
      }
    );

    setIfUnchanged(request.intro.requestLine, lastAuto.introLine, nextDefaults.introLine, (value) => {
      request.intro.requestLine = value;
    });

    setIfUnchanged(request.ending.confirmLine, lastAuto.confirmLine, nextDefaults.confirmLine, (value) => {
      request.ending.confirmLine = value;
    });

    setIfUnchanged(request.ending.thanksLine, lastAuto.thanksLine, nextDefaults.thanksLine, (value) => {
      request.ending.thanksLine = value;
    });

    setIfUnchanged(request.notes.installationPlaceLine, lastAuto.placeLine, nextDefaults.placeLine, (value) => {
      request.notes.installationPlaceLine = value;
    });
  }

  function syncLastAutoFromRequest(lang: Lang): void {
    const defaults = defaultsByLang[lang];

    lastAuto.language = lang;
    lastAuto.introLine =
      normalizeText(request.intro.requestLine).length === 0
        ? defaults.introLine
        : normalizeText(request.intro.requestLine);

    lastAuto.confirmLine =
      normalizeText(request.ending.confirmLine).length === 0
        ? defaults.confirmLine
        : normalizeText(request.ending.confirmLine);

    lastAuto.thanksLine =
      normalizeText(request.ending.thanksLine).length === 0
        ? defaults.thanksLine
        : normalizeText(request.ending.thanksLine);

    lastAuto.placeLine =
      normalizeText(request.notes.installationPlaceLine).length === 0
        ? defaults.placeLine
        : normalizeText(request.notes.installationPlaceLine);

    lastAuto.introPrefix =
      normalizeText(request.intro.salutationPrefix).length === 0
        ? defaults.introPrefix
        : normalizeText(request.intro.salutationPrefix);

    lastAuto.customerPrefix =
      normalizeText(request.customerEmail.intro.salutationPrefix).length === 0
        ? defaults.customerPrefix
        : normalizeText(request.customerEmail.intro.salutationPrefix);
  }

  function reset(): void {
    repository.clearDraft();
    Object.assign(request, createDefaultRequest());
    syncLastAutoFromRequest(request.language as Lang);
  }

  syncLastAutoFromRequest(request.language as Lang);

  watch(
    () => request.language as Lang,
    (lang) => {
      applyLanguageDefaults(lang);
      syncLastAutoFromRequest(lang);
    },
    { immediate: true }
  );

  watch(
    () => request,
    () => {
      repository.saveDraft(request);
    },
    { deep: true }
  );

  return {
    request,
    reset
  };
}