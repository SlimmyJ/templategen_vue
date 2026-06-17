import type { Customer, Installer } from "../models/entities";
import { createEntityRepository } from "./createEntityRepository";

export const customerRepository = createEntityRepository<Customer>("customers", {
  storageKey: "templategen.customers.v1",
  searchFields: (c) => [c.name, c.vatNumber, c.address.postalCity, c.contact.name, c.contact.phone]
});

export const installerRepository = createEntityRepository<Installer>("installers", {
  storageKey: "templategen_installers_v1",
  searchFields: (i) => [i.companyName, i.contactPerson, i.email, i.gsm]
});
