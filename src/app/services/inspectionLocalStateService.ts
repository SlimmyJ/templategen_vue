import type { InspectionRequest } from "../models/inspectionModels";
import { createDefaultInspectionRequest } from "../models/inspectionModels";
import { mergeDefaults } from "../utils/mergeDefaults";

export class InspectionLocalStateService {
  private readonly key = "templategen.inspectionRequest.v1";

  public load(): InspectionRequest | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      return mergeDefaults(createDefaultInspectionRequest(), JSON.parse(raw));
    } catch {
      return null;
    }
  }

  public save(state: InspectionRequest): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch {}
  }

  public clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {}
  }
}
