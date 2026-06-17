import type { InstallerInfo } from "../models/installationModels";
import { LocalCollectionRepository } from "../repositories/local/LocalCollectionRepository";

export type InstallerRecord = InstallerInfo & { id: string };

export class InstallerStore extends LocalCollectionRepository<InstallerRecord> {
  public constructor() {
    super("templategen_installers_v1");
  }
}
