export type VehicleLine = {
  brand: string;
  model: string;
  quantity: number;
  licensePlate: string;
};

export type VehicleTable = {
  source: "none" | "html" | "text" | "file";
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

export type LocationInfo = {
  name: string;
  street: string;
  postalCity: string;
};

export type ContactInfo = {
  name: string;
  tel: string;
  gsm: string;
  email: string;
};

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
  installationPlaceLine: string;
  installationPlaceNotes: string;
};

export type InstallerInfo = {
  companyName: string;
  contactPerson: string;
  email: string;
  gsm: string;
};

export type InstallerSelection = {
  mode: "existing" | "new";
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

export type InstallationRequest = {
  language: "nl" | "fr";

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

export function createDefaultRequest(): InstallationRequest {
  return {
    language: "nl",
    senderName: "Sven Paelman",
    brandPrimaryColorHex: "#C20E1A",

    intro: {
      salutationPrefix: "Beste",
      salutationName: "",
      requestLine: "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen."
    },

    planning: {
      plannedDate: "",
      plannedTime: ""
    },

    installation: {
      detailsText: "8 x FMC234"
    },

    vehicles: [
      {
        brand: "",
        model: "",
        quantity: 1,
        licensePlate: ""
      }
    ],

    vehicleTable: {
      source: "none",
      html: "",
      plain: ""
    },

    location: {
      name: "",
      street: "",
      postalCity: ""
    },

    contact: {
      name: "",
      tel: "",
      gsm: "",
      email: ""
    },

    notes: {
      vehicleNotes: "",
      installationPlaceLine: "Installatieplaats: te verifiëren met klant",
      installationPlaceNotes: ""
    },

    ending: {
      confirmLine: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
      thanksLine: "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht."
    },

    customerEmail: {
      salesOrderDescription: "",
      intro: {
        salutationPrefix: "Beste",
        salutationName: ""
      }
    },

    installerSelection: {
      mode: "existing",
      selectedId: "",
      newInstaller: {
        companyName: "",
        contactPerson: "",
        email: "",
        gsm: ""
      }
    }
  };
}
