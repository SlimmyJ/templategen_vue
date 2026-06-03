import type { AppLanguage } from "./sharedModels";
import type { IntroText, PlanningInfo, LocationInfo, ContactInfo, EndingText, InstallerSelection } from "./installationModels";
import {
  createDefaultPlanningInfo,
  createDefaultLocationInfo,
  createDefaultContactInfo,
  createDefaultInstallerSelection
} from "./installationModels";

export type InspectionVehicle = {
  typeLabel: string;
  brand: string;
  model: string;
  licensePlate: string;
};

export type InspectionItem = {
  idcode: string;
  problemDescription: string;
  solution: string;
  vehicle: InspectionVehicle;
};

export type InspectionNotesInfo = {
  planningNotes: string;
  locationNotes: string;
};

export type InspectionRequest = {
  language: AppLanguage;
  intro: IntroText;
  planning: PlanningInfo;
  detailsText: string;
  items: InspectionItem[];
  notes: InspectionNotesInfo;
  location: LocationInfo;
  contact: ContactInfo;
  ending: EndingText;
  senderName: string;
  brandPrimaryColorHex: string;
  installerSelection: InstallerSelection;
};

export function createDefaultInspectionVehicle(): InspectionVehicle {
  return { typeLabel: "", brand: "", model: "", licensePlate: "" };
}

export function createDefaultInspectionItem(): InspectionItem {
  return {
    idcode: "",
    problemDescription: "",
    solution: "",
    vehicle: createDefaultInspectionVehicle()
  };
}

export function createDefaultInspectionNotesInfo(): InspectionNotesInfo {
  return { planningNotes: "", locationNotes: "" };
}

export function createDefaultInspectionRequest(): InspectionRequest {
  return {
    language: "nl",
    senderName: "Sven Paelman",
    brandPrimaryColorHex: "#C20E1A",
    intro: {
      salutationPrefix: "Beste",
      salutationName: "",
      requestLine: "Gelieve onderstaand nazicht in te plannen."
    },
    planning: createDefaultPlanningInfo(),
    detailsText: "",
    items: [createDefaultInspectionItem()],
    notes: createDefaultInspectionNotesInfo(),
    location: createDefaultLocationInfo(),
    contact: createDefaultContactInfo(),
    ending: {
      confirmLine: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
      thanksLine: "Alvast bedankt voor de professionele uitvoering van bovenstaande."
    },
    installerSelection: createDefaultInstallerSelection()
  };
}
