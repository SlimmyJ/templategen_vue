<script setup lang="ts">
  import type {
    VehicleLine,
    VehicleTable,
  } from "../../models/installationModels";

  const props = defineProps<{
    vehicles: VehicleLine[];
    vehicleTable: VehicleTable;
    vehicleNotes: string;
  }>();

  const emit = defineEmits<{
    "update:vehicles": [value: VehicleLine[]];
    "update:vehicleNotes": [value: string];
    paste: [event: ClipboardEvent];
    fileSelect: [event: Event];
    drop: [event: DragEvent];
    dragOver: [event: DragEvent];
    clearTable: [];
    addVehicle: [];
    removeVehicle: [index: number];
  }>();

  function updateVehicleField<TKey extends keyof VehicleLine>(
    index: number,
    key: TKey,
    value: VehicleLine[TKey],
  ): void {
    const updatedVehicles = props.vehicles.map((vehicle, vehicleIndex) => {
      if (vehicleIndex !== index) {
        return vehicle;
      }

      return {
        ...vehicle,
        [key]: value,
      };
    });

    emit("update:vehicles", updatedVehicles);
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Voertuiggegevens</div>

    <div
      class="dropzone"
      @drop="$emit('drop', $event)"
      @dragover="$emit('dragOver', $event)">
      <div class="dropzone-title">Tabel plakken of CSV droppen</div>
      <div class="dropzone-sub">
        Plak vanuit Excel of Outlook, of sleep een .csv bestand
      </div>

      <div
        class="paste-area"
        contenteditable="true"
        @paste="$emit('paste', $event)"></div>

      <div class="actions">
        <input
          class="file-input"
          type="file"
          accept=".csv,text/csv"
          @change="$emit('fileSelect', $event)" />
        <button
          type="button"
          @click="$emit('clearTable')">
          Tabel wissen
        </button>
      </div>
    </div>

    <div
      v-if="vehicleTable.html.trim().length === 0"
      style="margin-top: 10px">
      <div
        class="hint"
        style="margin-bottom: 10px">
        Geen tabel ingeplakt.
      </div>

      <div
        v-for="(vehicle, index) in vehicles"
        :key="index"
        class="vehicle-row"
        style="margin-bottom: 10px">
        <input
          :value="vehicle.brand"
          placeholder="Merk"
          @input="
            updateVehicleField(
              index,
              'brand',
              ($event.target as HTMLInputElement).value,
            )
          " />
        <input
          :value="vehicle.model"
          placeholder="Model"
          @input="
            updateVehicleField(
              index,
              'model',
              ($event.target as HTMLInputElement).value,
            )
          " />
        <input
          type="number"
          min="1"
          :value="vehicle.quantity"
          @input="
            updateVehicleField(
              index,
              'quantity',
              Number(($event.target as HTMLInputElement).value),
            )
          " />
        <input
          :value="vehicle.licensePlate"
          placeholder="Kenteken"
          @input="
            updateVehicleField(
              index,
              'licensePlate',
              ($event.target as HTMLInputElement).value,
            )
          " />
        <button
          type="button"
          class="vehicle-remove"
          @click="$emit('removeVehicle', index)">
          X
        </button>
      </div>

      <div class="vehicle-row vehicle-add-row">
        <button
          type="button"
          class="btn-add-vehicle"
          @click="$emit('addVehicle')">
          Voeg voertuig toe
        </button>
        <div class="vehicle-add-spacer"></div>
      </div>
    </div>

    <div
      v-else
      style="margin-top: 10px">
      <div class="hint">
        Tabel is actief en wordt meegenomen in de preview en kopie.
      </div>
    </div>

    <label style="margin-top: 10px">Opmerking voertuigen</label>
    <textarea
      class="textarea-compact"
      :value="vehicleNotes"
      placeholder="Vrij veld"
      @input="
        $emit(
          'update:vehicleNotes',
          ($event.target as HTMLTextAreaElement).value,
        )
      "></textarea>
  </div>
</template>
