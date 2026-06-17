<script setup lang="ts">
  import { computed } from "vue";

  import { inspectionModule } from "../../requests/inspectionModule";
  import { useRequestModule } from "../../requests/requestModule";
  import { TemplateRenderer } from "../../services/templateRenderer";

  import LanguageSection from "../request/LanguageSection.vue";
  import IntroSection from "../request/IntroSection.vue";
  import PlanningSection from "../request/PlanningSection.vue";
  import InspectionItemsSection from "../inspection/InspectionItemsSection.vue";
  import LocationSection from "../request/LocationSection.vue";
  import ContactSection from "../request/ContactSection.vue";
  import InstallerSection from "../request/InstallerSection.vue";
  import EndingSection from "../request/EndingSection.vue";
  import PreviewPanel from "../preview/PreviewPanel.vue";

  const { request, reset, catalog, status, copyHtml } = useRequestModule(inspectionModule);

  const renderer = new TemplateRenderer();
  const renderedInstaller = computed(() => renderer.renderInspectionInstallerEmail(request));

  const warnings = computed<string[]>(() => {
    const list: string[] = [];
    if (!request.items.some((item) => item.problemDescription.trim() || item.idcode.trim() || item.solution.trim())) {
      list.push("Geen nazicht ingevuld");
    }
    if (!request.contact.name.trim()) list.push("Contactpersoon ontbreekt");
    if (!request.location.street.trim() && !request.location.postalCity.trim()) list.push("Locatie ontbreekt");
    return list;
  });

  async function copyInstaller(): Promise<void> {
    await copyHtml(renderedInstaller.value.htmlBody, "Installateur mail gekopieerd (HTML).");
  }
</script>

<template>
  <div class="header">
    <h1 class="title">Nazicht template</h1>
  </div>

  <div class="grid">
    <div class="card">
      <LanguageSection v-model="request.language" />

      <IntroSection v-model="request.intro" />

      <PlanningSection
        v-model="request.planning"
        v-model:notes="request.notes.planningNotes"
        section-title="Wanneer" />

      <InspectionItemsSection
        :items="request.items"
        :details-text="request.detailsText"
        @update:items="request.items = $event"
        @update:details-text="request.detailsText = $event" />

      <LocationSection
        v-model="request.location"
        v-model:notes="request.notes.locationNotes"
        section-title="Nazichtplaats"
        :show-title-field="false" />

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
      active-tab="installer"
      :installer-html="renderedInstaller.htmlBody"
      :installer-subject="renderedInstaller.subject"
      :status="status"
      :warnings="warnings"
      :show-customer-tab="false"
      :show-calendar-copy="false"
      @copy-installer="copyInstaller"
      @reset="reset" />
  </div>
</template>
