import type { InstallerInfo } from "../models/installationModels";
import { LocalCollectionRepository } from "../repositories/local/LocalCollectionRepository";

export type InstallerRecord = InstallerInfo & { id: string };

/**
 * The installer catalog is just a {@link LocalCollectionRepository} bound to a
 * fixed storage key. All CRUD + seed behaviour comes from the generic base.
 */
export class InstallerStore extends LocalCollectionRepository<InstallerRecord> {
  public constructor() {
    super("templategen_installers_v1");
  }
}
