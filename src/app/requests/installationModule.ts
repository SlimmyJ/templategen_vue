import { createDefaultRequest, type InstallationRequest } from "../models/installationModels";
import type { LanguageDefaultBinding } from "../composables/useLanguageDefaults";
import type { RequestModuleConfig } from "./requestModule";

const languageDefaults: ReadonlyArray<LanguageDefaultBinding<InstallationRequest>> = [
  {
    defaults: { nl: "Beste", fr: "Bonjour" },
    get: (r) => r.intro.salutationPrefix,
    set: (r, value) => { r.intro.salutationPrefix = value; }
  },
  {
    defaults: { nl: "Beste", fr: "Bonjour" },
    get: (r) => r.customerEmail.intro.salutationPrefix,
    set: (r, value) => { r.customerEmail.intro.salutationPrefix = value; }
  },
  {
    defaults: {
      nl: "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen.",
      fr: "Veuillez contacter le client ci-dessous et planifier la mission suivante."
    },
    get: (r) => r.intro.requestLine,
    set: (r, value) => { r.intro.requestLine = value; }
  },
  {
    defaults: {
      nl: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
      fr: "Veuillez confirmer la date du rendez-vous à la planning et au client."
    },
    get: (r) => r.ending.confirmLine,
    set: (r, value) => { r.ending.confirmLine = value; }
  },
  {
    defaults: {
      nl: "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht.",
      fr: "Merci d'avance pour le bon traitement de cette demande."
    },
    get: (r) => r.ending.thanksLine,
    set: (r, value) => { r.ending.thanksLine = value; }
  },
  {
    defaults: {
      nl: "Installatieplaats: te verifiëren met klant",
      fr: "Lieu d'installation : à vérifier avec le client"
    },
    get: (r) => r.notes.installationPlaceLine,
    set: (r, value) => { r.notes.installationPlaceLine = value; }
  }
];

export const installationModule: RequestModuleConfig<InstallationRequest> = {
  storageKey: "templategen.installationRequest.v2",
  createDefaults: createDefaultRequest,
  languageDefaults
};
