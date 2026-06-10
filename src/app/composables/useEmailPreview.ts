import { computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import type { InstallationRequest, InstallerInfo } from "../models/installationModels";
import { TemplateRenderer } from "../services/templateRenderer";
import { useCopyStatus } from "./useCopyStatus";

export function useEmailPreview(
  request: InstallationRequest,
  activeInstaller: MaybeRefOrGetter<InstallerInfo>
) {
  const renderer = new TemplateRenderer();
  const { status, copyHtml } = useCopyStatus();

  const renderedInstaller = computed(() => renderer.renderInstallerEmail(request));
  const renderedCustomer = computed(() => renderer.renderCustomerEmail(request, toValue(activeInstaller)));
  const renderedCalendar = computed(() => renderer.renderCalendarSnippet(request));

  async function copyInstaller(): Promise<void> {
    await copyHtml(renderedInstaller.value.htmlBody, "Installateur mail gekopieerd (HTML).");
  }

  async function copyCustomer(): Promise<void> {
    await copyHtml(renderedCustomer.value.htmlBody, "Klant mail gekopieerd (HTML).");
  }

  async function copyCalendar(): Promise<void> {
    await copyHtml(renderedCalendar.value.htmlBody, "Kalender snippet gekopieerd (HTML).");
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
