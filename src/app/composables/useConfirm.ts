import { reactive } from "vue";

type ConfirmRequest = {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  resolve: ((ok: boolean) => void) | null;
};

const state = reactive<ConfirmRequest>({
  open: false,
  message: "",
  confirmLabel: "Bevestigen",
  cancelLabel: "Annuleren",
  danger: false,
  resolve: null
});

export type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export function useConfirm() {
  function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      state.message = message;
      state.confirmLabel = options.confirmLabel ?? "Bevestigen";
      state.cancelLabel = options.cancelLabel ?? "Annuleren";
      state.danger = options.danger ?? false;
      state.open = true;
      state.resolve = resolve;
    });
  }

  function respond(ok: boolean): void {
    if (!state.open) return;
    state.open = false;
    const resolve = state.resolve;
    state.resolve = null;
    resolve?.(ok);
  }

  return { state, confirm, respond };
}
