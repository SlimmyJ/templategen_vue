<script setup lang="ts">
  import { computed, ref } from "vue";

  import { installationModule } from "../../requests/installationModule";
  import { useRequestModule } from "../../requests/requestModule";
  import { useVehicleImport } from "../../composables/useVehicleImport";
  import { TemplateRenderer } from "../../services/templateRenderer";

  import LanguageSection from "../request/LanguageSection.vue";
  import IntroSection from "../request/IntroSection.vue";
  import PlanningSection from "../request/PlanningSection.vue";
  import InstallationDetailsSection from "../request/InstallationDetailsSection.vue";
  import VehicleSection from "../request/VehicleSection.vue";
  import LocationSection from "../request/LocationSection.vue";
  import ContactSection from "../request/ContactSection.vue";
  import InstallerSection from "../request/InstallerSection.vue";
  import EndingSection from "../request/EndingSection.vue";
  import PreviewPanel from "../preview/PreviewPanel.vue";

  type PreviewTab = "installer" | "customer";

  const { request, reset, catalog, status, copyHtml } = useRequestModule(installationModule);

  const {
    onVehiclePaste,
    onVehicleFileSelected,
    onVehicleDrop,
    onVehicleDragOver,
    addVehicle,
    removeVehicle,
    clearVehicleTable
  } = useVehicleImport(request);

  const renderer = new TemplateRenderer();
  const renderedInstaller = computed(() => renderer.renderInstallerEmail(request));
  const renderedCustomer = computed(() => renderer.renderCustomerEmail(request, catalog.activeInstaller));
  const renderedCalendar = computed(() => renderer.renderCalendarSnippet(request));

  const activeTab = ref<PreviewTab>("installer");

  async function copyInstaller(): Promise<void> {
    await copyHtml(renderedInstaller.value.htmlBody, "Installateur mail gekopieerd (HTML).");
  }
  async function copyCustomer(): Promise<void> {
    await copyHtml(renderedCustomer.value.htmlBody, "Klant mail gekopieerd (HTML).");
  }
  async function copyCalendar(): Promise<void> {
    await copyHtml(renderedCalendar.value.htmlBody, "Kalender snippet gekopieerd (HTML).");
  }
</script>

<template>
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
        :installers="catalog.filteredInstallers"
        :picker="{ search: catalog.installerSearch, open: catalog.installerOpen }"
        :mode="request.installerSelection.mode"
        :selected-installer="catalog.selectedInstaller"
        :new-installer="request.installerSelection.newInstaller"
        :installer-edit="catalog.installerEdit"
        @update:picker="catalog.updatePicker"
        @update:new-installer="catalog.updateNewInstaller"
        @update:installer-edit="catalog.updateInstallerEdit"
        @pick-existing-installer="catalog.pickExistingInstaller"
        @pick-new-installer="catalog.pickNewInstaller"
        @save-new-installer="catalog.saveNewInstaller"
        @save-selected-installer-edits="catalog.saveSelectedInstallerEdits"
        @delete-selected-installer="catalog.deleteSelectedInstaller" />

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
      @reset="reset" />
  </div>
</template>
