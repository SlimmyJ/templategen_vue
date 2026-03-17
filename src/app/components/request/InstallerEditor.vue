<script setup lang="ts">
  import type { InstallerInfo } from "../../models/installationModels";
  import type { InstallerRecord } from "../../services/installerStore";

  type InstallerMode = "existing" | "new";

  const props = defineProps<{
    mode: InstallerMode;
    selectedInstaller: InstallerRecord | null;
    newInstaller: InstallerInfo;
    installerEdit: InstallerInfo;
    searchText: string;
  }>();

  const emit = defineEmits<{
    "update:new-installer": [value: InstallerInfo];
    "update:installer-edit": [value: InstallerInfo];
    "save-new-installer": [];
    "save-selected-installer-edits": [];
    "delete-selected-installer": [];
  }>();

  function updateNewInstallerField<TKey extends keyof InstallerInfo>(
    key: TKey,
    value: InstallerInfo[TKey],
  ): void {
    emit("update:new-installer", {
      ...props.newInstaller,
      [key]: value,
    });
  }

  function updateInstallerEditField<TKey extends keyof InstallerInfo>(
    key: TKey,
    value: InstallerInfo[TKey],
  ): void {
    emit("update:installer-edit", {
      ...props.installerEdit,
      [key]: value,
    });
  }
</script>

<template>
  <div
    v-if="mode === 'new'"
    style="margin-top: 10px">
    <label>Bedrijfsnaam</label>
    <input
      :value="newInstaller.companyName"
      @input="
        updateNewInstallerField(
          'companyName',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <label style="margin-top: 10px">Contactpersoon</label>
    <input
      :value="newInstaller.contactPerson"
      @input="
        updateNewInstallerField(
          'contactPerson',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <label style="margin-top: 10px">Email</label>
    <input
      :value="newInstaller.email"
      @input="
        updateNewInstallerField(
          'email',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <label style="margin-top: 10px">GSM</label>
    <input
      :value="newInstaller.gsm"
      @input="
        updateNewInstallerField(
          'gsm',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <div class="actions">
      <button
        type="button"
        @click="$emit('save-new-installer')">
        Opslaan in lijst
      </button>
    </div>
  </div>

  <div
    v-else-if="selectedInstaller"
    style="margin-top: 10px">
    <label>Bedrijfsnaam</label>
    <input
      :value="installerEdit.companyName"
      @input="
        updateInstallerEditField(
          'companyName',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <label style="margin-top: 10px">Contactpersoon</label>
    <input
      :value="installerEdit.contactPerson"
      @input="
        updateInstallerEditField(
          'contactPerson',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <label style="margin-top: 10px">Email</label>
    <input
      :value="installerEdit.email"
      @input="
        updateInstallerEditField(
          'email',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <label style="margin-top: 10px">GSM</label>
    <input
      :value="installerEdit.gsm"
      @input="
        updateInstallerEditField(
          'gsm',
          ($event.target as HTMLInputElement).value,
        )
      " />

    <div class="actions">
      <button
        type="button"
        @click="$emit('save-selected-installer-edits')">
        Wijzigingen opslaan
      </button>

      <button
        type="button"
        class="danger"
        @click="$emit('delete-selected-installer')">
        Verwijder installateur
      </button>
    </div>
  </div>

  <div
    v-else-if="searchText.trim().length > 0"
    class="hint"
    style="margin-top: 10px">
    Kies een installateur uit de lijst of maak een nieuwe aan.
  </div>
</template>
