import { computed, ref } from "vue";
import type { InstallationRequest, InstallerInfo } from "../models/installationModels";
import { TemplateRenderer } from "../services/templateRenderer";
import { ClipboardService } from "../services/clipboardService";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Onbekende fout";
}

export function useEmailPreview(
  request: InstallationRequest,
  activeInstaller: { value: InstallerInfo }
) {
  const renderer = new TemplateRenderer();
  const clipboard = new ClipboardService();
  const status = ref<string>("");

  const renderedInstaller = computed(() => renderer.renderInstallerEmail(request));
  const renderedCustomer = computed(() =>
    renderer.renderCustomerEmail(request, activeInstaller.value)
  );
  const renderedCalendar = computed(() => renderer.renderCalendarSnippet(request));

  async function copyHtmlWithStatus(html: string, successMessage: string): Promise<void> {
    status.value = "";

    try {
      await clipboard.copyHtmlOnly(html);
      status.value = successMessage;
    } catch (error) {
      status.value = `Kon niet kopieren: ${getErrorMessage(error)}`;
    }
  }

  async function copyInstaller(): Promise<void> {
    await copyHtmlWithStatus(
      renderedInstaller.value.htmlBody,
      "Installateur mail gekopieerd (HTML)."
    );
  }

  async function copyCustomer(): Promise<void> {
    await copyHtmlWithStatus(
      renderedCustomer.value.htmlBody,
      "Klant mail gekopieerd (HTML)."
    );
  }

  async function copyCalendar(): Promise<void> {
    await copyHtmlWithStatus(
      renderedCalendar.value.htmlBody,
      "Kalender snippet gekopieerd (HTML)."
    );
  }

  return {
    status,
    renderedInstaller,
    renderedCustomer,
    renderedCalendar,
    copyInstaller,
    copyCustomer,
    copyCalendar
  };
}