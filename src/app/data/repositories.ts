import type { Customer, Installer } from "../models/entities";
import { createEntityRepository } from "./createEntityRepository";

/**
 * Shared entity repositories, one per backend resource/table. Add a new shared
 * table here as a one-liner; features import these and never touch the data
 * source directly.
 *
 * `installers` deliberately reuses the catalog's existing storage key, so the
 * installers seeded by the request forms are immediately searchable everywhere.
 */
export const customerRepository = createEntityRepository<Customer>("customers", {
  storageKey: "templategen.customers.v1",
  searchFields: (c) => [c.name, c.vatNumber, c.address.postalCity, c.contact.name, c.contact.phone]
});

export const installerRepository = createEntityRepository<Installer>("installers", {
  storageKey: "templategen_installers_v1",
  searchFields: (i) => [i.companyName, i.contactPerson, i.email, i.gsm]
});
