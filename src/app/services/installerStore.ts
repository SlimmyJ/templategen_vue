import type { InstallerInfo } from "../models/installationModels";

export type InstallerRecord = InstallerInfo & { id: string };

export interface IInstallerStore {
  getAll(): InstallerRecord[];
  upsert(installer: InstallerRecord): void;
  remove(id: string): void;
  ensureSeed(seed: InstallerRecord[]): void;
}

export class InstallerStore implements IInstallerStore {
  private readonly key = "templategen_installers_v1";

  public getAll(): InstallerRecord[] {
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as InstallerRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public upsert(installer: InstallerRecord): void {
    const all = this.getAll();
    const existingIndex = all.findIndex((x) => x.id === installer.id);

    if (existingIndex >= 0) {
      all[existingIndex] = installer;
    } else {
      all.push(installer);
    }

    window.localStorage.setItem(this.key, JSON.stringify(all));
  }

  public remove(id: string): void {
    const all = this.getAll().filter((x) => x.id !== id);
    window.localStorage.setItem(this.key, JSON.stringify(all));
  }

  public ensureSeed(seed: InstallerRecord[]): void {
    const existing = this.getAll();

    if (existing.length === 0) {
      window.localStorage.setItem(this.key, JSON.stringify(seed));
      return;
    }

    const merged = [...existing];

    for (const seedInstaller of seed) {
      const alreadyExists = merged.some((x) => x.id === seedInstaller.id);
      if (!alreadyExists) {
        merged.push(seedInstaller);
      }
    }

    window.localStorage.setItem(this.key, JSON.stringify(merged));
  }
}