<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import type { InstallerRecord } from "../../services/installerStore";

  type InstallerPickerState = {
    search: string;
    open: boolean;
  };

  const props = defineProps<{
    installers: InstallerRecord[];
    picker: InstallerPickerState;
  }>();

  const emit = defineEmits<{
    "update:picker": [value: InstallerPickerState];
    "pick-existing-installer": [id: string];
    "pick-new-installer": [];
  }>();

  const pickerRef = ref<HTMLElement | null>(null);

  function updatePicker(value: Partial<InstallerPickerState>): void {
    emit("update:picker", {
      ...props.picker,
      ...value,
    });
  }

  function handleClickOutside(e: MouseEvent): void {
    if (props.picker.open && pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
      updatePicker({ open: false });
    }
  }

  onMounted(() => document.addEventListener("mousedown", handleClickOutside));
  onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));
</script>

<template>
  <div ref="pickerRef">
    <label>Zoek installateur</label>

    <div class="picker-row">
      <input
        :value="picker.search"
        placeholder="Zoek op bedrijfsnaam, contact, email of gsm"
        @focus="updatePicker({ open: true })"
        @input="
          updatePicker({
            search: ($event.target as HTMLInputElement).value,
            open: true,
          })
        " />

      <button
        type="button"
        class="picker-btn"
        @click="updatePicker({ open: !picker.open })">
        ▼
      </button>
    </div>

    <div
      v-if="picker.open"
      class="picker-menu">
      <button
        type="button"
        class="picker-item picker-new"
        @click="$emit('pick-new-installer')">
        Nieuwe installateur
      </button>

      <button
        v-for="installer in installers"
        :key="installer.id"
        type="button"
        class="picker-item"
        @click="$emit('pick-existing-installer', installer.id)">
        <span class="picker-item-company">{{ installer.companyName }}</span>
        <span v-if="installer.contactPerson" class="picker-item-contact">{{ installer.contactPerson }}</span>
      </button>

      <div
        v-if="installers.length === 0"
        class="hint"
        style="padding: 10px 0">
        Geen installateurs gevonden.
      </div>
    </div>
  </div>
</template>

<style scoped>
.picker-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.picker-item-company {
  font-size: 12px;
  color: #111;
}

.picker-item-contact {
  font-size: 11px;
  color: #666;
}
</style>
