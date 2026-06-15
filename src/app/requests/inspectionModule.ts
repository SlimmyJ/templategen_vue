import { createDefaultInspectionRequest, type InspectionRequest } from "../models/inspectionModels";
import type { LanguageDefaultBinding } from "../composables/useLanguageDefaults";
import type { RequestModuleConfig } from "./requestModule";

const languageDefaults: ReadonlyArray<LanguageDefaultBinding<InspectionRequest>> = [
  {
    defaults: { nl: "Beste", fr: "Bonjour" },
    get: (r) => r.intro.salutationPrefix,
    set: (r, value) => { r.intro.salutationPrefix = value; }
  },
  {
    defaults: {
      nl: "Gelieve onderstaand nazicht in te plannen.",
      fr: "Veuillez planifier la révision suivante."
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
      nl: "Alvast bedankt voor de professionele uitvoering van bovenstaande.",
      fr: "Merci d'avance pour le bon traitement de cette demande."
    },
    get: (r) => r.ending.thanksLine,
    set: (r, value) => { r.ending.thanksLine = value; }
  }
];

export const inspectionModule: RequestModuleConfig<InspectionRequest> = {
  storageKey: "templategen.inspectionRequest.v1",
  createDefaults: createDefaultInspectionRequest,
  languageDefaults
};
