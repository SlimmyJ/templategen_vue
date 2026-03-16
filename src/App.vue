<script setup lang="ts">
import { ref } from "vue";
import TopBar from "./app/components/TopBar.vue";
import { useVehicleImport } from "./app/composables/useVehicleImport";
import { useInstallationRequest } from "./app/composables/useInstallationRequest";
import { LocalInstallationRequestRepository } from "./app/repositories/local/LocalInstallationRequestRepository";
import { useEmailPreview } from "./app/composables/useEmailPreview";
import { useInstallerCatalog } from "./app/composables/useInstallerCatalog";

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
  installers,
  installerSearch,
  installerOpen,
  installerEdit,
  selectedInstaller,
  activeInstaller,
  onInstallerPick,
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

function resetForm(): void {
  reset();
}

</script>


<template>
  <TopBar brandText="Geofleet V2 Planning" :leftItems="[{ key: 'Installlers', label: 'Installateurs', active: true }]"
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

        <IntroSection :salutation-prefix="request.intro.salutationPrefix"
          :salutation-name="request.intro.salutationName" :request-line="request.intro.requestLine"
          @update:salutation-prefix="request.intro.salutationPrefix = $event"
          @update:salutation-name="request.intro.salutationName = $event"
          @update:request-line="request.intro.requestLine = $event" />

        <PlanningSection :planned-date="request.planning.plannedDate" :planned-time="request.planning.plannedTime"
          :planning-notes="request.notes.planningNotes" @update:planned-date="request.planning.plannedDate = $event"
          @update:planned-time="request.planning.plannedTime = $event"
          @update:planning-notes="request.notes.planningNotes = $event" />

        <InstallationDetailsSection :details-text="request.installation.detailsText"
          @update:details-text="request.installation.detailsText = $event" />
        <VehicleSection :vehicle-table="request.vehicleTable" :vehicles="request.vehicles"
          :vehicle-notes="request.notes.vehicleNotes" @update:vehicle-notes="request.notes.vehicleNotes = $event"
          @paste="onVehiclePaste" @file-select="onVehicleFileSelected" @drop="onVehicleDrop"
          @drag-over="onVehicleDragOver" @clear-table="clearVehicleTable" @add-vehicle="addVehicle"
          @remove-vehicle="removeVehicle" />

        <LocationSection :installation-place-line="request.notes.installationPlaceLine"
          :location-name="request.location.name" :street="request.location.street"
          :postal-city="request.location.postalCity" :installation-place-notes="request.notes.installationPlaceNotes"
          @update:installation-place-line="request.notes.installationPlaceLine = $event"
          @update:location-name="request.location.name = $event" @update:street="request.location.street = $event"
          @update:postal-city="request.location.postalCity = $event"
          @update:installation-place-notes="request.notes.installationPlaceNotes = $event" />
        <ContactSection :name="request.contact.name" :tel="request.contact.tel" :gsm="request.contact.gsm"
          :email="request.contact.email" @update:name="request.contact.name = $event"
          @update:tel="request.contact.tel = $event" @update:gsm="request.contact.gsm = $event"
          @update:email="request.contact.email = $event" />
  <InstallerSection
  :installers="installers"
  :installer-search="installerSearch"
  :installer-open="installerOpen"
  :mode="request.installerSelection.mode"
  :selected-installer="selectedInstaller"
  :new-installer="request.installerSelection.newInstaller"
  :installer-edit="installerEdit"
  @update:installer-search="installerSearch = $event"
  @update:installer-open="installerOpen = $event"
  @update:new-installer-company-name="request.installerSelection.newInstaller.companyName = $event"
  @update:new-installer-contact-person="request.installerSelection.newInstaller.contactPerson = $event"
  @update:new-installer-email="request.installerSelection.newInstaller.email = $event"
  @update:new-installer-gsm="request.installerSelection.newInstaller.gsm = $event"
  @update:installer-edit-company-name="installerEdit.companyName = $event"
  @update:installer-edit-contact-person="installerEdit.contactPerson = $event"
  @update:installer-edit-email="installerEdit.email = $event"
  @update:installer-edit-gsm="installerEdit.gsm = $event"
  @installer-pick="onInstallerPick"
  @pick-existing-installer="pickExistingInstaller"
  @pick-new-installer="pickNewInstaller"
  @save-new-installer="saveNewInstaller"
  @save-selected-installer-edits="saveSelectedInstallerEdits"
  @delete-selected-installer="deleteSelectedInstaller"
/>
        <EndingSection :confirm-line="request.ending.confirmLine" :thanks-line="request.ending.thanksLine"
          @update:confirm-line="request.ending.confirmLine = $event"
          @update:thanks-line="request.ending.thanksLine = $event" />
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
  @reset="resetForm"
/>
    </div>
  </div>
</template>
