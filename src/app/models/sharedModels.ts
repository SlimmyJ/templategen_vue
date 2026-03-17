export type AppLanguage = "nl" | "fr";

export type PersonNameInfo = {
  name: string;
};

export type CompanyInfo = {
  companyName: string;
};

export type AddressInfo = {
  street: string;
  postalCity: string;
};

export type ContactChannels = {
  tel: string;
  gsm: string;
  email: string;
};

export type InstallerMode = "existing" | "new";

export type VehicleTableSource = "none" | "html" | "text" | "file";