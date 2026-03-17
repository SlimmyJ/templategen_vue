<script setup lang="ts">
import type { InstallerInfo } from "../../models/installationModels";
import type { InstallerRecord } from "../../services/installerStore";

type InstallerMode = "existing" | "new";

type InstallerPickerState = {
  search: string;
  open: boolean;
};

const props = defineProps<{
  installers: InstallerRecord[];
  picker: InstallerPickerState;
  mode: InstallerMode;
  selectedInstaller: InstallerRecord | null;
  newInstaller: InstallerInfo;
  installerEdit: InstallerInfo;
}>();

const emit = defineEmits<{
  "update:picker": [value: InstallerPickerState];
  "update:new-installer": [value: InstallerInfo];
  "update:installer-edit": [value: InstallerInfo];
  "pick-existing-installer": [id: string];
  "pick-new-installer": [];
  "save-new-installer": [];
  "save-selected-installer-edits": [];
  "delete-selected-installer": [];
}>();

function updatePicker(value: Partial<InstallerPickerState>): void {
  emit("update:picker", {
    ...props.picker,
    ...value
  });
}

function updateNewInstallerField<TKey extends keyof InstallerInfo>(
  key: TKey,
  value: InstallerInfo[TKey]
): void {
  emit("update:new-installer", {
    ...props.newInstaller,
    [key]: value
  });
}

function updateInstallerEditField<TKey extends keyof InstallerInfo>(
  key: TKey,
  value: InstallerInfo[TKey]
): void {
  emit("update:installer-edit", {
    ...props.installerEdit,
    [key]: value
  });
}
</script>

<template>
  <div class="section">
    <div class="section-title">Installateur</div>

    <label>Zoek installateur</label>

    <div class="picker-row">
      <input
        :value="picker.search"
        placeholder="Zoek op bedrijfsnaam, contact, email of gsm"
        @focus="updatePicker({ open: true })"
        @input="
          updatePicker({
            search: ($event.target as HTMLInputElement).value,
            open: true
          })
        "
      />

      <button
        type="button"
        class="picker-btn"
        @click="updatePicker({ open: !picker.open })"
      >
        ▼
      </button>
    </div>

    <div v-if="picker.open" class="picker-menu">
      <button
        type="button"
        class="picker-item picker-new"
        @click="$emit('pick-new-installer')"
      >
        Nieuwe installateur
      </button>

      <button
        v-for="installer in installers"
        :key="installer.id"
        type="button"
        class="picker-item"
        @click="$emit('pick-existing-installer', installer.id)"
      >
        {{ installer.companyName }}
      </button>

      <div v-if="installers.length === 0" class="hint" style="padding: 10px 0">
        Geen installateurs gevonden.
      </div>
    </div>

    <div v-if="mode === 'new'" style="margin-top: 10px">
      <label>Bedrijfsnaam</label>
      <input
        :value="newInstaller.companyName"
        @input="updateNewInstallerField('companyName', ($event.target as HTMLInputElement).value)"
      />

      <label style="margin-top: 10px">Contactpersoon</label>
      <input
        :value="newInstaller.contactPerson"
        @input="updateNewInstallerField('contactPerson', ($event.target as HTMLInputElement).value)"
      />

      <label style="margin-top: 10px">Email</label>
      <input
        :value="newInstaller.email"
        @input="updateNewInstallerField('email', ($event.target as HTMLInputElement).value)"
      />

      <label style="margin-top: 10px">GSM</label>
      <input
        :value="newInstaller.gsm"
        @input="updateNewInstallerField('gsm', ($event.target as HTMLInputElement).value)"
      />

      <div class="actions">
        <button type="button" @click="$emit('save-new-installer')">
          Opslaan in lijst
        </button>
      </div>
    </div>

    <div v-else-if="selectedInstaller" style="margin-top: 10px">
      <div v-if="selectedInstaller">
        <label>Bedrijfsnaam</label>
        <input
          :value="installerEdit.companyName"
          @input="updateInstallerEditField('companyName', ($event.target as HTMLInputElement).value)"
        />

        <label style="margin-top: 10px">Contactpersoon</label>
        <input
          :value="installerEdit.contactPerson"
          @input="updateInstallerEditField('contactPerson', ($event.target as HTMLInputElement).value)"
        />

        <label style="margin-top: 10px">Email</label>
        <input
          :value="installerEdit.email"
          @input="updateInstallerEditField('email', ($event.target as HTMLInputElement).value)"
        />

        <label style="margin-top: 10px">GSM</label>
        <input
          :value="installerEdit.gsm"
          @input="updateInstallerEditField('gsm', ($event.target as HTMLInputElement).value)"
        />

        <div class="actions">
          <button type="button" @click="$emit('save-selected-installer-edits')">
            Wijzigingen opslaan
          </button>

          <button type="button" class="danger" @click="$emit('delete-selected-installer')">
            Verwijder installateur
          </button>
        </div>
      </div>

      <div v-else-if="picker.search.trim().length > 0" class="hint" style="margin-top: 10px">
        Kies een installateur uit de lijst of maak een nieuwe aan.
      </div>
    </div>
  </div>
</template>