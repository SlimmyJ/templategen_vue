<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { LocalInstallationRequestRepository } from "./app/repositories/local/LocalInstallationRequestRepository";
  import { LocalInspectionRequestRepository } from "./app/repositories/local/LocalInspectionRequestRepository";

  import { useVehicleImport } from "./app/composables/useVehicleImport";
  import { useInstallationRequest } from "./app/composables/useInstallationRequest";
  import { useEmailPreview } from "./app/composables/useEmailPreview";
  import { useInstallerCatalog } from "./app/composables/useInstallerCatalog";
  import { useInspectionRequest } from "./app/composables/useInspectionRequest";
  import { useInspectionEmailPreview } from "./app/composables/useInspectionEmailPreview";

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
  import DesignerView from "./app/components/designer/DesignerView.vue";

  type PreviewTab = "installer" | "customer";
  type FormMode = "installatie" | "inspection" | "designer";

  // ── Installation ──────────────────────────────────────────────────────────────
  const { request, reset } = useInstallationRequest(new LocalInstallationRequestRepository());
  const installerCatalog = reactive(useInstallerCatalog(request));

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
  } = useEmailPreview(request, () => installerCatalog.activeInstaller);

  const activeTab = ref<PreviewTab>("installer");

  // ── Inspection ────────────────────────────────────────────────────────────────
  const { request: inspectionRequest, reset: resetInspection } =
    useInspectionRequest(new LocalInspectionRequestRepository());
  const inspectionCatalog = reactive(useInstallerCatalog(inspectionRequest));

  const {
    status: inspectionStatus,
    renderedInstaller: inspectionRenderedInstaller,
    copyInstaller: copyInspectionInstaller
  } = useInspectionEmailPreview(inspectionRequest);

  // ── Mode ──────────────────────────────────────────────────────────────────────
  const formMode = ref<FormMode>("installatie");

  function handleTopBarClick(key: string): void {
    if (key === "installatie" || key === "inspection" || key === "designer") {
      formMode.value = key;
    }
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
          :installers="installerCatalog.filteredInstallers"
          :picker="{ search: installerCatalog.installerSearch, open: installerCatalog.installerOpen }"
          :mode="request.installerSelection.mode"
          :selected-installer="installerCatalog.selectedInstaller"
          :new-installer="request.installerSelection.newInstaller"
          :installer-edit="installerCatalog.installerEdit"
          @update:picker="installerCatalog.updatePicker"
          @update:new-installer="installerCatalog.updateNewInstaller"
          @update:installer-edit="installerCatalog.updateInstallerEdit"
          @pick-existing-installer="installerCatalog.pickExistingInstaller"
          @pick-new-installer="installerCatalog.pickNewInstaller"
          @save-new-installer="installerCatalog.saveNewInstaller"
          @save-selected-installer-edits="installerCatalog.saveSelectedInstallerEdits"
          @delete-selected-installer="installerCatalog.deleteSelectedInstaller" />

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
          :installers="inspectionCatalog.filteredInstallers"
          :picker="{ search: inspectionCatalog.installerSearch, open: inspectionCatalog.installerOpen }"
          :mode="inspectionRequest.installerSelection.mode"
          :selected-installer="inspectionCatalog.selectedInstaller"
          :new-installer="inspectionRequest.installerSelection.newInstaller"
          :installer-edit="inspectionCatalog.installerEdit"
          @update:picker="inspectionCatalog.updatePicker"
          @update:new-installer="inspectionCatalog.updateNewInstaller"
          @update:installer-edit="inspectionCatalog.updateInstallerEdit"
          @pick-existing-installer="inspectionCatalog.pickExistingInstaller"
          @pick-new-installer="inspectionCatalog.pickNewInstaller"
          @save-new-installer="inspectionCatalog.saveNewInstaller"
          @save-selected-installer-edits="inspectionCatalog.saveSelectedInstallerEdits"
          @delete-selected-installer="inspectionCatalog.deleteSelectedInstaller" />

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
        @reset="reset" />

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
