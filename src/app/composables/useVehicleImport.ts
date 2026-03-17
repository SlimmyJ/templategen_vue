import { TableImportService } from "../services/tableImportService";
import type {
  InstallationRequest,
  VehicleLine,
  VehicleTableSource
} from "../models/installationModels";

function createEmptyVehicleLine(): VehicleLine {
  return {
    brand: "",
    model: "",
    quantity: 1,
    licensePlate: ""
  };
}

export function useVehicleImport(request: InstallationRequest) {
  const tableImport = new TableImportService();

  function applyVehicleTable(
    source: VehicleTableSource,
    html: string,
    plain: string
  ): void {
    request.vehicleTable.source = source;
    request.vehicleTable.html = html;
    request.vehicleTable.plain = plain;
  }

  function clearPasteTarget(target: EventTarget | null): void {
    const element = target as HTMLElement | null;
    if (element) {
      element.innerHTML = "";
    }
  }

  function importFromClipboard(html: string, plain: string): void {
    const parsed = tableImport.fromClipboard(html, plain);
    const source: VehicleTableSource = html.trim().length > 0 ? "html" : "text";
    applyVehicleTable(source, parsed.html, parsed.plain);
  }

  function importFromCsvText(text: string): void {
    const parsed = tableImport.fromCsvFileContent(text);
    applyVehicleTable("file", parsed.html, parsed.plain);
  }

  function onVehiclePaste(event: ClipboardEvent): void {
    event.preventDefault();

    const html = event.clipboardData?.getData("text/html") ?? "";
    const plain = event.clipboardData?.getData("text/plain") ?? "";

    importFromClipboard(html, plain);
    clearPasteTarget(event.target);
  }

  async function onVehicleFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    importFromCsvText(text);

    input.value = "";
  }

  function onVehicleDrop(event: DragEvent): void {
    event.preventDefault();

    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }

    file.text().then(importFromCsvText);
  }

  function onVehicleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  function addVehicle(): void {
    request.vehicles.push(createEmptyVehicleLine());
  }

  function removeVehicle(index: number): void {
    request.vehicles.splice(index, 1);
  }

  function clearVehicleTable(): void {
    applyVehicleTable("none", "", "");
  }

  return {
    onVehiclePaste,
    onVehicleFileSelected,
    onVehicleDrop,
    onVehicleDragOver,
    addVehicle,
    removeVehicle,
    clearVehicleTable
  };
}