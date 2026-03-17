<script setup lang="ts">
  import type { InstallerInfo } from "../../models/installationModels";
  import type { InstallerRecord } from "../../services/installerStore";
  import InstallerPicker from "./InstallerPicker.vue";
  import InstallerEditor from "./InstallerEditor.vue";

  type InstallerMode = "existing" | "new";

  type InstallerPickerState = {
    search: string;
    open: boolean;
  };

  defineProps<{
    installers: InstallerRecord[];
    picker: InstallerPickerState;
    mode: InstallerMode;
    selectedInstaller: InstallerRecord | null;
    newInstaller: InstallerInfo;
    installerEdit: InstallerInfo;
  }>();

  defineEmits<{
    "update:picker": [value: InstallerPickerState];
    "update:new-installer": [value: InstallerInfo];
    "update:installer-edit": [value: InstallerInfo];
    "pick-existing-installer": [id: string];
    "pick-new-installer": [];
    "save-new-installer": [];
    "save-selected-installer-edits": [];
    "delete-selected-installer": [];
  }>();
</script>

<template>
  <div class="section">
    <div class="section-title">Installateur</div>

    <InstallerPicker
      :installers="installers"
      :picker="picker"
      @update:picker="$emit('update:picker', $event)"
      @pick-existing-installer="$emit('pick-existing-installer', $event)"
      @pick-new-installer="$emit('pick-new-installer')" />

    <InstallerEditor
      :mode="mode"
      :selected-installer="selectedInstaller"
      :new-installer="newInstaller"
      :installer-edit="installerEdit"
      :search-text="picker.search"
      @update:new-installer="$emit('update:new-installer', $event)"
      @update:installer-edit="$emit('update:installer-edit', $event)"
      @save-new-installer="$emit('save-new-installer')"
      @save-selected-installer-edits="$emit('save-selected-installer-edits')"
      @delete-selected-installer="$emit('delete-selected-installer')" />
  </div>
</template>
