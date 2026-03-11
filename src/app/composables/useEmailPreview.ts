import { computed, ref } from "vue";
import type { InstallationRequest, InstallerInfo } from "../models/installationModels";
import { TemplateRenderer } from "../services/templateRenderer";
import { ClipboardService } from "../services/clipboardService";

export function useEmailPreview(
  request: InstallationRequest,
  activeInstaller: { value: InstallerInfo }
) {
  const renderer = new TemplateRenderer();
  const clipboard = new ClipboardService();
  const status = ref<string>("");

  const renderedInstaller = computed(() => renderer.renderInstallerEmail(request));
  const renderedCustomer = computed(() => renderer.renderCustomerEmail(request, activeInstaller.value));
  const renderedCalendar = computed(() => renderer.renderCalendarSnippet(request));

  async function copyInstaller(): Promise<void> {
    status.value = "";
    try {
      await clipboard.copyHtmlOnly(renderedInstaller.value.htmlBody);
      status.value = "Installateur mail gekopieerd (HTML).";
    } catch (e) {
      const message = e instanceof Error ? e.message : "Onbekende fout";
      status.value = `Kon niet kopieren: ${message}`;
    }
  }

  async function copyCustomer(): Promise<void> {
    status.value = "";
    try {
      await clipboard.copyHtmlOnly(renderedCustomer.value.htmlBody);
      status.value = "Klant mail gekopieerd (HTML).";
    } catch (e) {
      const message = e instanceof Error ? e.message : "Onbekende fout";
      status.value = `Kon niet kopieren: ${message}`;
    }
  }

  async function copyCalendar(): Promise<void> {
    status.value = "";
    try {
      await clipboard.copyHtmlOnly(renderedCalendar.value.htmlBody);
      status.value = "Kalender snippet gekopieerd (HTML).";
    } catch (e) {
      const message = e instanceof Error ? e.message : "Onbekende fout";
      status.value = `Kon niet kopieren: ${message}`;
    }
  }

  return {
    status,
    renderedInstaller,
    renderedCustomer,
    renderedCalendar,
    copyInstaller,
    copyCustomer,
    copyCalendar,
  };
}