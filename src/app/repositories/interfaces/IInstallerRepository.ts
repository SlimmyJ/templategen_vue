import type { InstallerInfo } from "../../models/installationModels";

export type InstallerRecord = InstallerInfo & {
  id: string;
};

export interface IInstallerRepository {
  getAll(): InstallerRecord[];
  upsert(record: InstallerRecord): void;
  remove(id: string): void;
  ensureSeed(records: InstallerRecord[]): void;
}