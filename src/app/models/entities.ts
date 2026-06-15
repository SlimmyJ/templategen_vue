import type { AddressInfo } from "./sharedModels";
import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";

/**
 * Shared domain entities — the records the C# API will own as database tables.
 * Anything referenced across features (a customer linked from both a request and
 * a call) lives here as a first-class record with a stable `id`, instead of being
 * copied around as loose text.
 */
export type EntityBase = Identifiable & {
  /** ISO timestamps, set by the backend (optional while running locally). */
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
