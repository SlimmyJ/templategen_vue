import type { InstallationRequest } from "../../models/installationModels";
import { createDefaultRequest } from "../../models/installationModels";
import { LocalDraftRepository } from "./LocalDraftRepository";

export class LocalInstallationRequestRepository extends LocalDraftRepository<InstallationRequest> {
  public constructor() {
    super("templategen.installationRequest.v2", createDefaultRequest);
  }
}
