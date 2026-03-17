import type {
  AddressInfo,
  AppLanguage,
  CompanyInfo,
  ContactChannels,
  InstallerMode,
  PersonNameInfo,
  VehicleTableSource
} from "./sharedModels";

export type {
  AddressInfo,
  AppLanguage,
  CompanyInfo,
  ContactChannels,
  InstallerMode,
  PersonNameInfo,
  VehicleTableSource
} from "./sharedModels";

export type VehicleLine = {
  brand: string;
  model: string;
  quantity: number;
  licensePlate?: string;
};

export type VehicleTable = {
  source: VehicleTableSource;
  html: string;
  plain: string;
};

export type PlanningInfo = {
  plannedDate: string;
  plannedTime: string;
};

export type InstallationDetails = {
  detailsText: string;
};

export type LocationInfo = AddressInfo & {
  name: string;
};

export type ContactInfo = PersonNameInfo & ContactChannels;

export type IntroText = {
  salutationPrefix: string;
  salutationName: string;
  requestLine: string;
};

export type EndingText = {
  confirmLine: string;
  thanksLine: string;
};

export type NotesInfo = {
  vehicleNotes: string;
  planningNotes: string;
  installationPlaceLine: string;
  installationPlaceNotes: string;
};

export type InstallerInfo = CompanyInfo & {
  contactPerson: string;
  email: string;
  gsm: string;
};

export type InstallerSelection = {
  mode: InstallerMode;
  selectedId: string;
  newInstaller: InstallerInfo;
};

export type CustomerIntroText = {
  salutationPrefix: string;
  salutationName: string;
};

export type CustomerEmailData = {
  salesOrderDescription: string;
  intro: CustomerIntroText;
};

export type BrandingInfo = {
  senderName: string;
  brandPrimaryColorHex: string;
};

export type InstallationRequest = {
  language: AppLanguage;
  intro: IntroText;
  planning: PlanningInfo;
  installation: InstallationDetails;
  vehicles: VehicleLine[];
  vehicleTable: VehicleTable;
  location: LocationInfo;
  contact: ContactInfo;
  notes: NotesInfo;
  ending: EndingText;
  senderName: string;
  brandPrimaryColorHex: string;
  customerEmail: CustomerEmailData;
  installerSelection: InstallerSelection;
};

export function createDefaultInstallerInfo(): InstallerInfo {
  return {
    companyName: "",
    contactPerson: "",
    email: "",
    gsm: ""
  };
}

export function createDefaultVehicleLine(): VehicleLine {
  return {
    brand: "",
    model: "",
    quantity: 1,
    licensePlate: ""
  };
}

export function createDefaultVehicleTable(): VehicleTable {
  return {
    source: "none",
    html: "",
    plain: ""
  };
}

export function createDefaultPlanningInfo(): PlanningInfo {
  return {
    plannedDate: "",
    plannedTime: ""
  };
}

export function createDefaultInstallationDetails(): InstallationDetails {
  return {
    detailsText: "8 x FMC234"
  };
}

export function createDefaultLocationInfo(): LocationInfo {
  return {
    name: "",
    street: "",
    postalCity: ""
  };
}

export function createDefaultContactInfo(): ContactInfo {
  return {
    name: "",
    tel: "",
    gsm: "",
    email: ""
  };
}

export function createDefaultNotesInfo(): NotesInfo {
  return {
    vehicleNotes: "",
    planningNotes: "",
    installationPlaceLine: "Installatieplaats: te verifiëren met klant",
    installationPlaceNotes: ""
  };
}

export function createDefaultIntroText(): IntroText {
  return {
    salutationPrefix: "Beste",
    salutationName: "",
    requestLine: "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen."
  };
}

export function createDefaultEndingText(): EndingText {
  return {
    confirmLine: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
    thanksLine: "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht."
  };
}

export function createDefaultCustomerEmailData(): CustomerEmailData {
  return {
    salesOrderDescription: "",
    intro: {
      salutationPrefix: "Beste",
      salutationName: ""
    }
  };
}

export function createDefaultInstallerSelection(): InstallerSelection {
  return {
    mode: "existing",
    selectedId: "",
    newInstaller: createDefaultInstallerInfo()
  };
}

export function createDefaultBrandingInfo(): BrandingInfo {
  return {
    senderName: "Sven Paelman",
    brandPrimaryColorHex: "#C20E1A"
  };
}

export function createDefaultRequest(): InstallationRequest {
  const branding = createDefaultBrandingInfo();

  return {
    language: "nl",
    senderName: branding.senderName,
    brandPrimaryColorHex: branding.brandPrimaryColorHex,
    intro: createDefaultIntroText(),
    planning: createDefaultPlanningInfo(),
    installation: createDefaultInstallationDetails(),
    vehicles: [createDefaultVehicleLine()],
    vehicleTable: createDefaultVehicleTable(),
    location: createDefaultLocationInfo(),
    contact: createDefaultContactInfo(),
    notes: createDefaultNotesInfo(),
    ending: createDefaultEndingText(),
    customerEmail: createDefaultCustomerEmailData(),
    installerSelection: createDefaultInstallerSelection()
  };
}