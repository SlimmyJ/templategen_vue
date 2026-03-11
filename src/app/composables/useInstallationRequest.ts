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

function setIfUnchanged(
  current: string,
  previousAuto: string,
  nextAuto: string,
  setter: (value: string) => void
): void {
  const currentValue = (current ?? "").trim();
  const previousValue = (previousAuto ?? "").trim();

  if (currentValue.length === 0 || currentValue === previousValue) {
    setter(nextAuto);
  }
}

export function useInstallationRequest(repository: IInstallationRequestRepository) {
  const request = reactive<InstallationRequest>(repository.loadDraft() ?? createDefaultRequest());

  const lastAuto = reactive({
    language: request.language as Lang,
    introLine: "",
    confirmLine: "",
    thanksLine: "",
    placeLine: "",
    introPrefix: "",
    customerPrefix: ""
  });

  function initLastAutoFromCurrent(lang: Lang): void {
    const defaults = defaultsByLang[lang];

    lastAuto.language = lang;
    lastAuto.introLine =
      request.intro.requestLine.trim().length === 0 ? defaults.introLine : request.intro.requestLine.trim();
    lastAuto.confirmLine =
      request.ending.confirmLine.trim().length === 0 ? defaults.confirmLine : request.ending.confirmLine.trim();
    lastAuto.thanksLine =
      request.ending.thanksLine.trim().length === 0 ? defaults.thanksLine : request.ending.thanksLine.trim();
    lastAuto.placeLine =
      request.notes.installationPlaceLine.trim().length === 0
        ? defaults.placeLine
        : request.notes.installationPlaceLine.trim();
    lastAuto.introPrefix =
      request.intro.salutationPrefix.trim().length === 0
        ? defaults.introPrefix
        : request.intro.salutationPrefix.trim();
    lastAuto.customerPrefix =
      request.customerEmail.intro.salutationPrefix.trim().length === 0
        ? defaults.customerPrefix
        : request.customerEmail.intro.salutationPrefix.trim();
  }

  initLastAutoFromCurrent(request.language as Lang);

  watch(
    () => request.language as Lang,
    (lang) => {
      const next = defaultsByLang[lang];

      setIfUnchanged(request.intro.salutationPrefix, lastAuto.introPrefix, next.introPrefix, (value) => {
        request.intro.salutationPrefix = value;
      });

      setIfUnchanged(
        request.customerEmail.intro.salutationPrefix,
        lastAuto.customerPrefix,
        next.customerPrefix,
        (value) => {
          request.customerEmail.intro.salutationPrefix = value;
        }
      );

      setIfUnchanged(request.intro.requestLine, lastAuto.introLine, next.introLine, (value) => {
        request.intro.requestLine = value;
      });

      setIfUnchanged(request.ending.confirmLine, lastAuto.confirmLine, next.confirmLine, (value) => {
        request.ending.confirmLine = value;
      });

      setIfUnchanged(request.ending.thanksLine, lastAuto.thanksLine, next.thanksLine, (value) => {
        request.ending.thanksLine = value;
      });

      setIfUnchanged(request.notes.installationPlaceLine, lastAuto.placeLine, next.placeLine, (value) => {
        request.notes.installationPlaceLine = value;
      });

      lastAuto.language = lang;
      lastAuto.introPrefix = request.intro.salutationPrefix.trim();
      lastAuto.customerPrefix = request.customerEmail.intro.salutationPrefix.trim();
      lastAuto.introLine = request.intro.requestLine.trim();
      lastAuto.confirmLine = request.ending.confirmLine.trim();
      lastAuto.thanksLine = request.ending.thanksLine.trim();
      lastAuto.placeLine = request.notes.installationPlaceLine.trim();
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

  function reset(): void {
    repository.clearDraft();
    Object.assign(request, createDefaultRequest());
    initLastAutoFromCurrent(request.language as Lang);
  }

  return {
    request,
    reset
  };
}