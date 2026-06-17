import type { AddressInfo } from "./sharedModels";
import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";

export type EntityBase = Identifiable & {

  createdAt?: string;
  updatedAt?: string;
};

export type CustomerContact = {
  name: string;
  phone: string;
  email: string;
};

export type Customer = EntityBase & {
  name: string;
  vatNumber: string;
  address: AddressInfo;
  contact: CustomerContact;
};

export type Installer = EntityBase & {
  companyName: string;
  contactPerson: string;
  email: string;
  gsm: string;
};

export function createCustomer(name = ""): Customer {
  return {
    id: crypto.randomUUID(),
    name,
    vatNumber: "",
    address: { street: "", postalCity: "" },
    contact: { name: "", phone: "", email: "" }
  };
}

export function createInstaller(companyName = ""): Installer {
  return {
    id: crypto.randomUUID(),
    companyName,
    contactPerson: "",
    email: "",
    gsm: ""
  };
}

export function customerLabel(customer: Customer): string {
  return customer.name.trim() || customer.contact.name.trim() || "(naamloze klant)";
}

export function installerLabel(installer: Installer): string {
  return installer.companyName.trim() || installer.contactPerson.trim() || "(naamloze installateur)";
}
