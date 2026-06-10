<script setup lang="ts">
  import { ref } from "vue";
  import { LocalInstallationRequestRepository } from "./app/repositories/local/LocalInstallationRequestRepository";
  import { LocalInspectionRequestRepository } from "./app/repositories/local/LocalInspectionRequestRepository";

  import type { InstallerInfo } from "./app/models/installationModels";

  import { useVehicleImport } from "./app/composables/useVehicleImport";
  import { useInstallationRequest } from "./app/composables/useInstallationRequest";
  import { useEmailPreview } from "./app/composables/useEmailPreview";
  import { useInstallerCatalog } from "./app/composables/useInstallerCatalog";
  import { useInspectionRequest } from "./app/composables/useInspectionRequest";
  import { useInspectionEmailPreview } from "./app/composables/useInspectionEmailPreview";
  import DesignerView from "./app/components/designer/DesignerView.vue";

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
  import InspectionItemsSection from "./app/components/inspection/InspectionItemsSection.vue";

  type PreviewTab = "installer" | "customer";
  type FormMode = "installatie" | "inspection" | "designer";

  // ── Installation ──────────────────────────────────────────────────────────────
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
    deleteSelectedInstaller
  } = useInstallerCatalog(request);

  const {
    onVehiclePaste,
    onVehicleFileSelected,
    onVehicleDrop,
    onVehicleDragOver,
    addVehicle,
    removeVehicle,
    clearVehicleTable
  } = useVehicleImport(request);

  const {
    status,
    renderedInstaller,
    renderedCustomer,
    copyInstaller,
    copyCustomer,
    copyCalendar
  } = useEmailPreview(request, activeInstaller);

  const activeTab = ref<PreviewTab>("installer");

  // ── Inspection ────────────────────────────────────────────────────────────────
  const inspectionRepository = new LocalInspectionRequestRepository();
  const { request: inspectionRequest, reset: resetInspection } = useInspectionRequest(inspectionRepository);

  const {
    filteredInstallers: inspectionFilteredInstallers,
    installerSearch: inspectionInstallerSearch,
    installerOpen: inspectionInstallerOpen,
    installerEdit: inspectionInstallerEdit,
    selectedInstaller: inspectionSelectedInstaller,
    activeInstaller: inspectionActiveInstaller,
    pickExistingInstaller: inspectionPickExistingInstaller,
    pickNewInstaller: inspectionPickNewInstaller,
    saveNewInstaller: inspectionSaveNewInstaller,
    saveSelectedInstallerEdits: inspectionSaveSelectedInstallerEdits,
    deleteSelectedInstaller: inspectionDeleteSelectedInstaller
  } = useInstallerCatalog(inspectionRequest);

  const {
    status: inspectionStatus,
    renderedInstaller: inspectionRenderedInstaller,
    copyInstaller: copyInspectionInstaller
  } = useInspectionEmailPreview(inspectionRequest, inspectionActiveInstaller);

  // ── Mode ──────────────────────────────────────────────────────────────────────
  const formMode = ref<FormMode>("installatie");

  function handleTopBarClick(key: string): void {
    if (key === "installatie" || key === "inspection" || key === "designer") {
      formMode.value = key;
    }
  }

  // ── Installation event handlers ───────────────────────────────────────────────
  function resetForm(): void {
    reset();
  }

  function updateInstallerPicker(picker: { search: string; open: boolean }): void {
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

  // ── Inspection event handlers ─────────────────────────────────────────────────
  function updateInspectionInstallerPicker(picker: { search: string; open: boolean }): void {
    inspectionInstallerSearch.value = picker.search;
    inspectionInstallerOpen.value = picker.open;
  }

  function updateInspectionNewInstaller(value: InstallerInfo): void {
    inspectionRequest.installerSelection.newInstaller = value;
  }

  function updateInspectionInstallerEdit(value: InstallerInfo): void {
    inspectionInstallerEdit.companyName = value.companyName;
    inspectionInstallerEdit.contactPerson = value.contactPerson;
    inspectionInstallerEdit.email = value.email;
    inspectionInstallerEdit.gsm = value.gsm;
  }
</script>

<template>
  <TopBar
    brandText="Geofleet V2 Planning"
    :leftItems="[
      { key: 'installatie', label: 'Installaties', active: formMode === 'installatie' },
      { key: 'inspection',  label: 'Nazichten',    active: formMode === 'inspection' },
      { key: 'designer',    label: 'Designer',     active: formMode === 'designer' },
    ]"
    :rightItems="[
      { key: '', label: ' ' },
      { key: '', label: ' ' },
    ]"
    @clickItem="handleTopBarClick" />

  <div class="container">
    <div class="header" v-if="formMode !== 'designer'">
      <h1 class="title">
        {{ formMode === "installatie" ? "Installatie template" : "Nazicht template" }}
      </h1>
    </div>

    <!-- ── Designer (full width) ── -->
    <div v-if="formMode === 'designer'" class="card">
      <DesignerView />
    </div>

    <div v-else class="grid">

      <!-- ── Installation form ── -->
      <div v-if="formMode === 'installatie'" class="card">
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

      <!-- ── Inspection form ── -->
      <div v-else class="card">
        <LanguageSection v-model="inspectionRequest.language" />

        <IntroSection v-model="inspectionRequest.intro" />

        <PlanningSection
          v-model="inspectionRequest.planning"
          v-model:notes="inspectionRequest.notes.planningNotes"
          section-title="Wanneer" />

        <InspectionItemsSection
          :items="inspectionRequest.items"
          :details-text="inspectionRequest.detailsText"
          @update:items="inspectionRequest.items = $event"
          @update:details-text="inspectionRequest.detailsText = $event" />

        <LocationSection
          v-model="inspectionRequest.location"
          v-model:notes="inspectionRequest.notes.locationNotes"
          section-title="Nazichtplaats"
          :show-title-field="false" />

        <ContactSection v-model="inspectionRequest.contact" />

        <InstallerSection
          :installers="inspectionFilteredInstallers"
          :picker="{ search: inspectionInstallerSearch, open: inspectionInstallerOpen }"
          :mode="inspectionRequest.installerSelection.mode"
          :selected-installer="inspectionSelectedInstaller"
          :new-installer="inspectionRequest.installerSelection.newInstaller"
          :installer-edit="inspectionInstallerEdit"
          @update:picker="updateInspectionInstallerPicker"
          @update:new-installer="updateInspectionNewInstaller"
          @update:installer-edit="updateInspectionInstallerEdit"
          @pick-existing-installer="inspectionPickExistingInstaller"
          @pick-new-installer="inspectionPickNewInstaller"
          @save-new-installer="inspectionSaveNewInstaller"
          @save-selected-installer-edits="inspectionSaveSelectedInstallerEdits"
          @delete-selected-installer="inspectionDeleteSelectedInstaller" />

        <EndingSection v-model="inspectionRequest.ending" />
      </div>

      <!-- ── Installation preview ── -->
      <PreviewPanel
        v-if="formMode === 'installatie'"
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

      <!-- ── Inspection preview ── -->
      <PreviewPanel
        v-else
        active-tab="installer"
        :installer-html="inspectionRenderedInstaller.htmlBody"
        :installer-subject="inspectionRenderedInstaller.subject"
        :status="inspectionStatus"
        :show-customer-tab="false"
        :show-calendar-copy="false"
        @copy-installer="copyInspectionInstaller"
        @reset="resetInspection" />

    </div>
  </div>
</template>
