import type { InstallationRequest } from "../../models/installationModels";

export interface IInstallationRequestRepository {
  loadDraft(): InstallationRequest | null;
  saveDraft(request: InstallationRequest): void;
  clearDraft(): void;
}