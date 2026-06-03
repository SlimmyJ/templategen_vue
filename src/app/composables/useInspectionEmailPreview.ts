import { computed, ref } from "vue";
import type { ComputedRef } from "vue";
import type { InspectionRequest } from "../models/inspectionModels";
import type { InstallerInfo } from "../models/installationModels";
import { TemplateRenderer } from "../services/templateRenderer";
import { ClipboardService } from "../services/clipboardService";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Onbekende fout";
}

export function useInspectionEmailPreview(
  request: InspectionRequest,
  activeInstaller: ComputedRef<InstallerInfo>
) {
  const renderer = new TemplateRenderer();
  const clipboard = new ClipboardService();
  const status = ref<string>("");

  const renderedInstaller = computed(() =>
    renderer.renderInspectionInstallerEmail(request, activeInstaller.value)
  );

  async function copyInstaller(): Promise<void> {
    status.value = "";
    try {
      await clipboard.copyHtmlOnly(renderedInstaller.value.htmlBody);
      status.value = "Installateur mail gekopieerd (HTML).";
    } catch (error) {
      status.value = `Kon niet kopieren: ${getErrorMessage(error)}`;
    }
  }

  return { status, renderedInstaller, copyInstaller };
}
