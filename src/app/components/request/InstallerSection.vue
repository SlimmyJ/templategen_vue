<script setup lang="ts">
import type { InstallerInfo } from "../../models/installationModels";
import type { InstallerRecord } from "../../services/installerStore";

defineProps<{
  installers: InstallerRecord[];
  installerSearch: string;
  installerOpen: boolean;
  mode: "existing" | "new";
  selectedInstaller: InstallerRecord | null;
  newInstaller: InstallerInfo;
  installerEdit: InstallerInfo;
}>();

defineEmits<{
  "update:installerSearch": [value: string];
  "update:installerOpen": [value: boolean];
  "update:newInstallerCompanyName": [value: string];
  "update:newInstallerContactPerson": [value: string];
  "update:newInstallerEmail": [value: string];
  "update:newInstallerGsm": [value: string];
  "update:installerEditCompanyName": [value: string];
  "update:installerEditContactPerson": [value: string];
  "update:installerEditEmail": [value: string];
  "update:installerEditGsm": [value: string];
  installerPick: [];
  pickExistingInstaller: [id: string];
  pickNewInstaller: [];
  saveNewInstaller: [];
  saveSelectedInstallerEdits: [];
  deleteSelectedInstaller: [];
}>();

</script>

<template>
  <div class="section">
    <div class="section-title">Installateur</div>

    <div class="installer-picker">
      <label>Kies installateur</label>

      <div class="picker-row">
        <input
          :value="installerSearch"
          placeholder="Zoek installateur..."
          @focus="$emit('update:installerOpen', true)"
          @input="
            $emit('update:installerSearch', ($event.target as HTMLInputElement).value);
            $emit('update:installerOpen', true);
            $emit('installerPick');
          "
        />
        <button
          type="button"
          class="picker-btn"
          @click="$emit('update:installerOpen', !installerOpen)"
        >
          ▼
        </button>
      </div>

      <div v-if="installerOpen" class="picker-menu">
        <button
          type="button"
          class="picker-item picker-new"
          @click="$emit('pickNewInstaller')"
        >
          Nieuwe installateur
        </button>

        <button
          v-for="ins in installers"
          :key="ins.id"
          type="button"
          class="picker-item"
          @click="$emit('pickExistingInstaller', ins.id)"
        >
          {{ ins.companyName }}
        </button>
      </div>
    </div>

    <div v-if="mode === 'new'" style="margin-top: 10px;">
      <label>Bedrijfsnaam</label>
      <input
        :value="newInstaller.companyName"
        @input="$emit('update:newInstallerCompanyName', ($event.target as HTMLInputElement).value)"
      />

      <label style="margin-top: 10px;">Contactpersoon</label>
      <input
        :value="newInstaller.contactPerson"
        @input="$emit('update:newInstallerContactPerson', ($event.target as HTMLInputElement).value)"
      />

      <label style="margin-top: 10px;">Email</label>
      <input
        :value="newInstaller.email"
        @input="$emit('update:newInstallerEmail', ($event.target as HTMLInputElement).value)"
      />

      <label style="margin-top: 10px;">GSM</label>
      <input
        :value="newInstaller.gsm"
        @input="$emit('update:newInstallerGsm', ($event.target as HTMLInputElement).value)"
      />

      <div class="actions">
        <button type="button" @click="$emit('saveNewInstaller')">
          Opslaan in lijst
        </button>
      </div>
    </div>

    <div v-else style="margin-top: 10px;">
      <div v-if="selectedInstaller">
        <label>Bedrijfsnaam</label>
        <input
          :value="installerEdit.companyName"
          @input="$emit('update:installerEditCompanyName', ($event.target as HTMLInputElement).value)"
        />

        <label style="margin-top: 10px;">Contactpersoon</label>
        <input
          :value="installerEdit.contactPerson"
          @input="$emit('update:installerEditContactPerson', ($event.target as HTMLInputElement).value)"
        />

        <label style="margin-top: 10px;">Email</label>
        <input
          :value="installerEdit.email"
          @input="$emit('update:installerEditEmail', ($event.target as HTMLInputElement).value)"
        />

        <label style="margin-top: 10px;">GSM</label>
        <input
          :value="installerEdit.gsm"
          @input="$emit('update:installerEditGsm', ($event.target as HTMLInputElement).value)"
        />

        <div class="actions">
          <button type="button" @click="$emit('saveSelectedInstallerEdits')">
            Wijzigingen opslaan
          </button>
          <button type="button" class="danger" @click="$emit('deleteSelectedInstaller')">
            Verwijder installateur
          </button>
        </div>
      </div>

      <div v-else class="hint">
        Geen installateur geselecteerd.
      </div>
    </div>
  </div>
</template>