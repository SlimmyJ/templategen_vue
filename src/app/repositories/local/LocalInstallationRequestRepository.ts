import type { InstallationRequest } from "../../models/installationModels";
import type { IInstallationRequestRepository } from "../interfaces/IInstallationRequestRepository";
import { LocalStateService } from "../../services/localStateService";

export class LocalInstallationRequestRepository implements IInstallationRequestRepository {
  private readonly stateService: LocalStateService;

  public constructor() {
    this.stateService = new LocalStateService();
  }

  public loadDraft(): InstallationRequest | null {
    return this.stateService.load();
  }

  public saveDraft(request: InstallationRequest): void {
    this.stateService.save(request);
  }

  public clearDraft(): void {
    this.stateService.clear();
  }
}