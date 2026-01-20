export interface IClipboardService {
  copyHtmlAndPlain(html: string, plain: string): Promise<void>;
  copyHtmlOnly(html: string): Promise<void>;
}

export class ClipboardService implements IClipboardService {
  public async copyHtmlAndPlain(html: string, plain: string): Promise<void> {
    this.ensureSupported();

    const htmlBlob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([plain], { type: "text/plain" });

    const item = new ClipboardItem({
      "text/html": htmlBlob,
      "text/plain": textBlob
    });

    await navigator.clipboard.write([item]);
  }

  public async copyHtmlOnly(html: string): Promise<void> {
    this.ensureSupported();

    const blob = new Blob([html], { type: "text/html" });
    const item = new ClipboardItem({ "text/html": blob });
    await navigator.clipboard.write([item]);
  }

  private ensureSupported(): void {
    if (!navigator.clipboard || !("ClipboardItem" in window)) {
      throw new Error("Clipboard API not supported in this browser context.");
    }
  }
}
