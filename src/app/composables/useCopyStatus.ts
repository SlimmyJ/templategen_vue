import { ref } from "vue";
import { ClipboardService } from "../services/clipboardService";


export function useCopyStatus() {
  const clipboard = new ClipboardService();
  const status = ref<string>("");

  async function copyHtml(html: string, successMessage: string): Promise<void> {
    status.value = "";
    try {
      await clipboard.copyHtmlOnly(html);
      status.value = successMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout";
      status.value = `Kon niet kopiëren: ${message}`;
    }
  }

  return { status, copyHtml };
}
