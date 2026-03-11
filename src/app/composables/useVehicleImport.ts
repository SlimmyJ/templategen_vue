import { TableImportService } from "../services/tableImportService";
import type { InstallationRequest } from "../models/installationModels";

export function useVehicleImport(request: InstallationRequest) {
  const tableImport = new TableImportService();

  function onVehiclePaste(e: ClipboardEvent): void {
    e.preventDefault();

    const html = e.clipboardData?.getData("text/html") ?? "";
    const plain = e.clipboardData?.getData("text/plain") ?? "";

    const parsed = tableImport.fromClipboard(html, plain);
    request.vehicleTable.source = html.trim().length > 0 ? "html" : "text";
    request.vehicleTable.html = parsed.html;
    request.vehicleTable.plain = parsed.plain;

    const target = e.target as HTMLElement | null;
    if (target) {
      target.innerHTML = "";
    }
  }

  async function onVehicleFileSelected(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = tableImport.fromCsvFileContent(text);

    request.vehicleTable.source = "file";
    request.vehicleTable.html = parsed.html;
    request.vehicleTable.plain = parsed.plain;

    input.value = "";
  }

  function onVehicleDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    file.text().then((text) => {
      const parsed = tableImport.fromCsvFileContent(text);
      request.vehicleTable.source = "file";
      request.vehicleTable.html = parsed.html;
      request.vehicleTable.plain = parsed.plain;
    });
  }

  function onVehicleDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  function addVehicle(): void {
    request.vehicles.push({
      brand: "",
      model: "",
      quantity: 1,
      licensePlate: "",
    });
  }

  function removeVehicle(index: number): void {
    request.vehicles.splice(index, 1);
  }

  function clearVehicleTable(): void {
    request.vehicleTable.source = "none";
    request.vehicleTable.html = "";
    request.vehicleTable.plain = "";
  }

  return {
    onVehiclePaste,
    onVehicleFileSelected,
    onVehicleDrop,
    onVehicleDragOver,
    addVehicle,
    removeVehicle,
    clearVehicleTable,
  };
}