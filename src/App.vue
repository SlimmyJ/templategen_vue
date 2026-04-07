<script setup lang="ts">
  import { ref } from "vue";
  import { LocalInstallationRequestRepository } from "./app/repositories/local/LocalInstallationRequestRepository";

  import type { InstallerInfo } from "./app/models/installationModels";

  import { useVehicleImport } from "./app/composables/useVehicleImport";
  import { useInstallationRequest } from "./app/composables/useInstallationRequest";
  import { useEmailPreview } from "./app/composables/useEmailPreview";
  import { useInstallerCatalog } from "./app/composables/useInstallerCatalog";

  import TopBar from "./app/components/TopBar.vue";
  import LanguageSection from "./app/components/request/LanguageSection.vue";
  import IntroSection from "./app/components/request/IntroSection.vue";
  import PlanningSection from "./app/components/request/PlanningSection.vue";
  import InstallerSection from "./app/components/request/InstallerSection.vue";
  import InstallationDetailsSection from "./app/components/request/InstallationDetailsSection.vue";
  import VehicleSection from "./app/components/request/VehicleSection.vue";
  import LocationSection from "./app/components/request/LocationSection.vue";
  import ContactSection from "./app/components/request/ContactSection.vue";
  import EndingSection from "./app/components/request/EndingSection.vue";
  import PreviewPanel from "./app/components/preview/PreviewPanel.vue";

  type PreviewTab = "installer" | "customer";

  const requestRepository = new LocalInstallationRequestRepository();
  const { request, reset } = useInstallationRequest(requestRepository);

  const {
    filteredInstallers,
    installerSearch,
    installerOpen,
    installerEdit,
    selectedInstaller,
    activeInstaller,
    pickExistingInstaller,
    pickNewInstaller,
    saveNewInstaller,
    saveSelectedInstallerEdits,
    deleteSelectedInstaller,
  } = useInstallerCatalog(request);

  const {
    onVehiclePaste,
    onVehicleFileSelected,
    onVehicleDrop,
    onVehicleDragOver,
    addVehicle,
    removeVehicle,
    clearVehicleTable,
  } = useVehicleImport(request);

  const {
    status,
    renderedInstaller,
    renderedCustomer,
    copyInstaller,
    copyCustomer,
    copyCalendar,
  } = useEmailPreview(request, activeInstaller);

  const activeTab = ref<PreviewTab>("installer");

  function resetForm(): void {
    reset();
  }

  function updateInstallerPicker(picker: {
    search: string;
    open: boolean;
  }): void {
    installerSearch.value = picker.search;
    installerOpen.value = picker.open;
  }

  function updateNewInstaller(value: InstallerInfo): void {
    request.installerSelection.newInstaller = value;
  }

  function updateInstallerEdit(value: InstallerInfo): void {
    installerEdit.companyName = value.companyName;
    installerEdit.contactPerson = value.contactPerson;
    installerEdit.email = value.email;
    installerEdit.gsm = value.gsm;
  }
</script>

<template>
  <TopBar
    brandText="Geofleet V2 Planning"
    :leftItems="[{ key: 'Installlers', label: 'Installateurs', active: true }]"
    :rightItems="[
      { key: '', label: ' ' },
      { key: '', label: ' ' },
    ]" />

  <div class="container">
    <div class="header">
      <h1 class="title">Installatie template</h1>
    </div>

    <div class="grid">
      <div class="card">
        <LanguageSection v-model="request.language" />

        <IntroSection v-model="request.intro" />

        <PlanningSection
          v-model="request.planning"
          v-model:notes="request.notes.planningNotes" />

        <InstallationDetailsSection v-model="request.installation" />
        <VehicleSection
          :vehicle-table="request.vehicleTable"
          :vehicles="request.vehicles"
          :vehicle-notes="request.notes.vehicleNotes"
          @update:vehicles="request.vehicles = $event"
          @update:vehicle-notes="request.notes.vehicleNotes = $event"
          @paste="onVehiclePaste"
          @file-select="onVehicleFileSelected"
          @drop="onVehicleDrop"
          @drag-over="onVehicleDragOver"
          @clear-table="clearVehicleTable"
          @add-vehicle="addVehicle"
          @remove-vehicle="removeVehicle" />

        <LocationSection
          v-model="request.location"
          v-model:title="request.notes.installationPlaceLine"
          v-model:notes="request.notes.installationPlaceNotes" />
        <ContactSection v-model="request.contact" />
        <InstallerSection
          :installers="filteredInstallers"
          :picker="{ search: installerSearch, open: installerOpen }"
          :mode="request.installerSelection.mode"
          :selected-installer="selectedInstaller"
          :new-installer="request.installerSelection.newInstaller"
          :installer-edit="installerEdit"
          @update:picker="updateInstallerPicker"
          @update:new-installer="updateNewInstaller"
          @update:installer-edit="updateInstallerEdit"
          @pick-existing-installer="pickExistingInstaller"
          @pick-new-installer="pickNewInstaller"
          @save-new-installer="saveNewInstaller"
          @save-selected-installer-edits="saveSelectedInstallerEdits"
          @delete-selected-installer="deleteSelectedInstaller" />
        <EndingSection v-model="request.ending" />
      </div>

      <PreviewPanel
        :active-tab="activeTab"
        :installer-html="renderedInstaller.htmlBody"
        :customer-html="renderedCustomer.htmlBody"
        :installer-subject="renderedInstaller.subject"
        :customer-subject="renderedCustomer.subject"
        :status="status"
        @update:active-tab="activeTab = $event"
        @copy-installer="copyInstaller"
        @copy-customer="copyCustomer"
        @copy-calendar="copyCalendar"
        @reset="resetForm" />
    </div>
  </div>
</template>
