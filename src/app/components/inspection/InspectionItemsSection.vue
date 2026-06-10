<script setup lang="ts">
  import type { InspectionItem, InspectionVehicle } from "../../models/inspectionModels";
  import { createDefaultInspectionItem } from "../../models/inspectionModels";

  const VEHICLE_TYPES = [
    "Personenwagen",
    "Bestelwagen",
    "Lichte vracht",
    "Vrachtwagen",
    "Trekker",
    "Trailer",
    "Machine",
    "Quad",
    "Ander"
  ];

  const DEVICE_SUGGESTIONS = [
    "1 x FMC234",
    "1 x FMC234 + antidémarrage",
    "1 x FMC234M + DRU",
    "1 x FMC650",
    "1 x FMC920",
    "1 x G70",
    "1 x Barra Battery",
    "2 x FMC234",
    "Nazicht FMC234",
    "Nazicht FMC920",
    "Nazicht FMC650"
  ];

  const props = defineProps<{
    items: InspectionItem[];
    detailsText: string;
  }>();

  const emit = defineEmits<{
    "update:items": [value: InspectionItem[]];
    "update:detailsText": [value: string];
  }>();

  function updateItem<K extends keyof InspectionItem>(
    index: number,
    key: K,
    value: InspectionItem[K]
  ): void {
    emit(
      "update:items",
      props.items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function updateVehicle<K extends keyof InspectionVehicle>(
    index: number,
    key: K,
    value: InspectionVehicle[K]
  ): void {
    emit(
      "update:items",
      props.items.map((item, i) =>
        i === index ? { ...item, vehicle: { ...item.vehicle, [key]: value } } : item
      )
    );
  }

  function addItem(): void {
    emit("update:items", [...props.items, createDefaultInspectionItem()]);
  }

  function removeItem(index: number): void {
    emit("update:items", props.items.filter((_, i) => i !== index));
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Nazichtgegevens</div>

    <label>Wat (optioneel)</label>
    <input
      list="inspection-device-list"
      :value="detailsText"
      placeholder="Bijvoorbeeld: Nazicht 1 x FMC234"
      @input="$emit('update:detailsText', ($event.target as HTMLInputElement).value)" />
    <datalist id="inspection-device-list">
      <option v-for="suggestion in DEVICE_SUGGESTIONS" :key="suggestion" :value="suggestion" />
    </datalist>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="inspection-item">
      <div class="inspection-item-header">
        <span class="inspection-item-label">
          <span class="item-badge">{{ index + 1 }}</span>
          Nazicht
        </span>
        <button
          v-if="items.length > 1"
          type="button"
          class="btn-remove-item"
          @click="removeItem(index)">
          ✕ Verwijder
        </button>
      </div>

      <div class="two" style="margin-top: 10px">
        <div>
          <label>IDCODE</label>
          <input
            :value="item.idcode"
            placeholder="625350"
            @input="updateItem(index, 'idcode', ($event.target as HTMLInputElement).value)" />
        </div>
        <div>
          <label>Voertuig type</label>
          <input
            list="vehicle-type-list"
            :value="item.vehicle.typeLabel"
            placeholder="Vrachtwagen"
            @input="updateVehicle(index, 'typeLabel', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>

      <div class="two" style="margin-top: 10px">
        <div>
          <label>Merk</label>
          <input
            :value="item.vehicle.brand"
            placeholder="Renault"
            @input="updateVehicle(index, 'brand', ($event.target as HTMLInputElement).value)" />
        </div>
        <div>
          <label>Type / Model</label>
          <input
            :value="item.vehicle.model"
            placeholder="T"
            @input="updateVehicle(index, 'model', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>

      <div style="margin-top: 10px">
        <label>Nummerplaat</label>
        <input
          :value="item.vehicle.licensePlate"
          placeholder="1-YCQ-892"
          @input="updateVehicle(index, 'licensePlate', ($event.target as HTMLInputElement).value)" />
      </div>

      <label style="margin-top: 10px">Probleemomschrijving</label>
      <textarea
        :value="item.problemDescription"
        placeholder="Geen tacho download"
        @input="updateItem(index, 'problemDescription', ($event.target as HTMLTextAreaElement).value)" />

      <label style="margin-top: 10px">Oplossing</label>
      <textarea
        :value="item.solution"
        placeholder="Veranderen naar front download"
        @input="updateItem(index, 'solution', ($event.target as HTMLTextAreaElement).value)" />
    </div>

    <datalist id="vehicle-type-list">
      <option v-for="vt in VEHICLE_TYPES" :key="vt" :value="vt" />
    </datalist>

    <button
      type="button"
      class="btn-add-item"
      style="margin-top: 10px"
      @click="addItem">
      + Voeg nazicht toe
    </button>
  </div>
</template>

<style scoped>
.inspection-item {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
}

.inspection-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inspection-item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 13px;
  color: #444;
}

.item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #357bb7;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}

.btn-remove-item {
  font-size: 11px;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  color: #888;
}

.btn-remove-item:hover {
  border-color: #c00;
  color: #c00;
}

.btn-add-item {
  font-size: 12px;
  padding: 5px 12px;
  background: #fff;
  border: 1px solid #aaa;
  border-radius: 3px;
  cursor: pointer;
  color: #444;
}

.btn-add-item:hover {
  background: #f0f0f0;
}
</style>
