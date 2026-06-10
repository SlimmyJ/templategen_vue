import type { InspectionRequest } from "../../models/inspectionModels";
import { createDefaultInspectionRequest } from "../../models/inspectionModels";
import { LocalDraftRepository } from "./LocalDraftRepository";

export class LocalInspectionRequestRepository extends LocalDraftRepository<InspectionRequest> {
  public constructor() {
    super("templategen.inspectionRequest.v1", createDefaultInspectionRequest);
  }
}
