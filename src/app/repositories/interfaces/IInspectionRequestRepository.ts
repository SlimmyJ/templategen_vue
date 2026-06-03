import type { InspectionRequest } from "../../models/inspectionModels";

export interface IInspectionRequestRepository {
  loadDraft(): InspectionRequest | null;
  saveDraft(request: InspectionRequest): void;
  clearDraft(): void;
}
