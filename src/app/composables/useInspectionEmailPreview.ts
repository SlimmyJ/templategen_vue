import { computed } from "vue";
import type { InspectionRequest } from "../models/inspectionModels";
import { TemplateRenderer } from "../services/templateRenderer";
import { useCopyStatus } from "./useCopyStatus";

export function useInspectionEmailPreview(request: InspectionRequest) {
  const renderer = new TemplateRenderer();
  const { status, copyHtml } = useCopyStatus();

  const renderedInstaller = computed(() => renderer.renderInspectionInstallerEmail(request));

  async function copyInstaller(): Promise<void> {
    await copyHtml(renderedInstaller.value.htmlBody, "Installateur mail gekopieerd (HTML).");
  }

  return { status, renderedInstaller, copyInstaller };
}
