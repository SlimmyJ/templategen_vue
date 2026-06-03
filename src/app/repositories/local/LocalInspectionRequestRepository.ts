import type { InspectionRequest } from "../../models/inspectionModels";
import type { IInspectionRequestRepository } from "../interfaces/IInspectionRequestRepository";
import { InspectionLocalStateService } from "../../services/inspectionLocalStateService";

export class LocalInspectionRequestRepository implements IInspectionRequestRepository {
  private readonly stateService = new InspectionLocalStateService();

  public loadDraft(): InspectionRequest | null {
    return this.stateService.load();
  }

  public saveDraft(request: InspectionRequest): void {
    this.stateService.save(request);
  }

  public clearDraft(): void {
    this.stateService.clear();
  }
}
