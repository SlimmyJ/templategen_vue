export const PowertrainType = {
  Unknown: "Unknown",
  Electric: "Electric",
  Diesel: "Diesel",
  Petrol: "Petrol",
  Hybrid: "Hybrid"
} as const;

export type PowertrainType = typeof PowertrainType[keyof typeof PowertrainType];

export type VehicleLine = {
  brand: string;
  model: string;
  quantity: number;
  powertrain: PowertrainType;
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
  postalCode: string;
  city: string;
};

export type ContactInfo = {
  name: string;
  phone: string;
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

export type InstallationRequest = {
  intro: IntroText;
  planning: PlanningInfo;
  installation: InstallationDetails;
  vehicles: VehicleLine[];
  location: LocationInfo;
  contact: ContactInfo;
  notes: NotesInfo;
  ending: EndingText;

  customerName: string;
  senderName: string;
  brandPrimaryColorHex: string;
    vehicleTable: VehicleTable;
};

export function createDefaultRequest(): InstallationRequest {
  return {
    customerName: "",
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
        powertrain: PowertrainType.Unknown,
        licensePlate: ""
      }
    ],

    notes: {
      vehicleNotes: "",
      installationPlaceLine: "Installatieplaats: te verifieren met klant",
      installationPlaceNotes: ""
    },

   vehicleTable: {
  source: "none",
  html: "",
  plain: ""
}, 

    location: {
      name: "",
      street: "",
      postalCode: "",
      city: ""
    },

contact: {
  name: "",
  phone: "",
  email: ""
},

    ending: {
      confirmLine: "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
      thanksLine: "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht."
    }
  };
}
