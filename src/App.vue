<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { createDefaultRequest} from "./app/models/installationModels";
import { TemplateRenderer } from "./app/services/templateRenderer";
import { ClipboardService } from "./app/services/clipboardService";
import TopBar from "./app/components/TopBar.vue";



import { TableImportService } from "./app/services/tableImportService";
import { watch } from "vue";

import { LocalStateService } from "./app/services/localStateService";

const tableImport = new TableImportService();
const stateStore = new LocalStateService();
const loaded = stateStore.load();

const request = reactive(loaded ?? createDefaultRequest());

// State save
watch(
  () => request,
  () => {
    stateStore.save(request);
  },
  { deep: true }
);

function resetForm(): void {
  stateStore.clear();
  Object.assign(request, createDefaultRequest());
}

function onVehiclePaste(e: ClipboardEvent): void {
  e.preventDefault();

  const html = e.clipboardData?.getData("text/html") ?? "";
  const plain = e.clipboardData?.getData("text/plain") ?? "";

  const parsed = tableImport.fromClipboard(html, plain);
  request.vehicleTable.source = html.trim().length > 0 ? "html" : "text";
  request.vehicleTable.html = parsed.html;
  request.vehicleTable.plain = parsed.plain;

  const target = e.target as HTMLElement | null;
  if (target) {
    target.innerHTML = "";
  }
}

async function onVehicleFileSelected(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const text = await file.text();
  const parsed = tableImport.fromCsvFileContent(text);

  request.vehicleTable.source = "file";
  request.vehicleTable.html = parsed.html;
  request.vehicleTable.plain = parsed.plain;

  input.value = "";
}

function onVehicleDrop(e: DragEvent): void {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;

  file.text().then(text => {
    const parsed = tableImport.fromCsvFileContent(text);
    request.vehicleTable.source = "file";
    request.vehicleTable.html = parsed.html;
    request.vehicleTable.plain = parsed.plain;
  });
}

function onVehicleDragOver(e: DragEvent): void {
  e.preventDefault();
}

function clearVehicleTable(): void {
  request.vehicleTable.source = "none";
  request.vehicleTable.html = "";
  request.vehicleTable.plain = "";
}

const renderer = new TemplateRenderer();
const clipboard = new ClipboardService();

const rendered = computed(() => renderer.renderInstallerEmail(request));
const status = ref<string>("");

function addVehicle(): void {
  request.vehicles.push({
    brand: "",
    model: "",
    quantity: 1,
    licensePlate: ""
  });
}

function removeVehicle(index: number): void {
  request.vehicles.splice(index, 1);
}

async function copyEmail(): Promise<void> {
  status.value = "";
  try {
    await clipboard.copyHtmlAndPlain(rendered.value.htmlBody, rendered.value.plainBody);
    status.value = "Gekopieerd naar klembord (HTML + tekst).";
  } catch (e) {
    const message = e instanceof Error ? e.message : "Onbekende fout";
    status.value = `Kon niet kopieren: ${message}`;
  }
}
</script>

<template>

  <TopBar
  brandText="Geofleet V2 Planning"
  :leftItems="[{ key: 'Installlers', label: 'Installateurs', active: true }]"
  :rightItems="[
    { key: '', label: ' ' },
    { key: '', label: ' ' }
  ]"
/>

  <div class="container">
    <div class="header">
      <h1 class="title">Installatie template</h1>
    </div>

    <div class="grid">
      <div class="card">
        <div class="section">
          <div class="section-title">Intro</div>

          <label>Aanspreking</label>
          <div class="salutation-row">
            <input class="salutation-prefix" v-model="request.intro.salutationPrefix" />
            <input v-model="request.intro.salutationName" placeholder="Naam" />
          </div>

          <label style="margin-top: 10px;">Intro zin</label>
          <textarea v-model="request.intro.requestLine"></textarea>
        </div>


        <div class="section">
          <div class="section-title">Datum installatie</div>

          <div class="two">
            <div>
              <label>Datum</label>
              <input type="date" v-model="request.planning.plannedDate" />
              <div class="hint">Leeg = te bepalen met klant</div>
            </div>
            <div>
              <label>Tijd</label>
              <input type="time" v-model="request.planning.plannedTime" />
              <div class="hint">Leeg = te bepalen met klant</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Installatiegegevens</div>
          <label>Details</label>
          <textarea v-model="request.installation.detailsText"
            placeholder="Bijvoorbeeld: 8 x FMC234 + extra info"></textarea>
        </div>

        <div class="section">
          <div class="section-title">Voertuiggegevens</div>

          <div class="dropzone" @drop="onVehicleDrop" @dragover="onVehicleDragOver">
            <div class="dropzone-title">Tabel plakken of CSV droppen</div>
            <div class="dropzone-sub">Plak hier (Ctrl+V) vanuit Excel of Outlook, of sleep een .csv bestand</div>

            <div class="paste-area" contenteditable="true" @paste="onVehiclePaste"></div>

            <div class="actions">
              <input class="file-input" type="file" accept=".csv,text/csv" @change="onVehicleFileSelected" />
              <button type="button" @click="clearVehicleTable">Tabel wissen</button>
            </div>
          </div>

          <label style="margin-top: 10px;">Opmerking voertuigen</label>
          <textarea v-model="request.notes.vehicleNotes" placeholder="Vrij veld"></textarea>

          <div v-if="request.vehicleTable.html.trim().length === 0" style="margin-top: 10px;">
            <div class="hint">Geen tabel ingeplakt. Je kan nog altijd losse voertuiglijnen gebruiken.</div>

            <div v-for="(v, index) in request.vehicles" :key="index" class="vehicle-row" style="margin-bottom: 10px;">
              <input v-model="v.brand" placeholder="Merk" />
              <input v-model="v.model" placeholder="Model" />
              <input type="number" min="1" v-model.number="v.quantity" />             
              <input v-model="v.licensePlate" placeholder="Kenteken" />
              <button type="button" @click="removeVehicle(index)">X</button>
            </div>

            <div class="actions">
              <button type="button" @click="addVehicle">Voeg voertuig toe</button>
            </div>
          </div>

          <div v-else style="margin-top: 10px;">
            <div class="hint">Tabel is actief en wordt meegenomen in de preview en in de kopie.</div>
          </div>
        </div>


        <div class="section">
          <div class="section-title">Installatieplaats</div>

          <label>Titel zin</label>
          <input v-model="request.notes.installationPlaceLine" />

          <div class="two" style="margin-top: 10px;">
            <div>
              <label>Locatienaam</label>
              <input v-model="request.location.name" placeholder="Total Energies Muide" />
            </div>
            <div>
              <label>Straat</label>
              <input v-model="request.location.street" placeholder="Goolestraat 2" />
            </div>
          </div>

          <div class="two" style="margin-top: 10px;">
            <div style="margin-top: 10px;">
              <label>Postcode + Stad</label>
              <input v-model="request.location.postalCity" placeholder="9000 Gent" />
            </div>

          </div>

          <label style="margin-top: 10px;">Opmerking installatieplaats</label>
          <textarea v-model="request.notes.installationPlaceNotes" placeholder="Vrij veld"></textarea>
        </div>
        <div class="section">
          <div class="section-title">Contactpersoon</div>

          <div class="two">
            <div>
              <label>Naam</label>
              <input v-model="request.contact.name" placeholder="Dhr. Van Der Vaert" />
            </div>
            <div>
              <label>Tel</label>
              <input v-model="request.contact.tel" placeholder="+32 9 335 61 35" />
            </div>
          </div>

          <div class="two" style="margin-top: 10px;">
            <div>
              <label>GSM</label>
              <input v-model="request.contact.gsm" placeholder="+32 470 00 11 23" />
            </div>
            <div>
              <label>Email</label>
              <input v-model="request.contact.email" placeholder="naam@bedrijf.be" />
            </div>
          </div>


        </div>


        <div class="section">
          <div class="section-title">Afsluiting</div>

          <label>Bevestiging</label>
          <textarea v-model="request.ending.confirmLine"></textarea>

          <label style="margin-top: 10px;">Dank zin</label>
          <textarea v-model="request.ending.thanksLine"></textarea>

        </div>
      </div>

      <div class="card">
        <label>Preview</label>
        <div class="preview" v-html="rendered.htmlBody"></div>

        <div style="margin-top: 14px;">
          <label>Onderwerp</label>
          <input :value="rendered.subject" readonly />
        </div>
      

  <div class="actions">
  <button class="primary" type="button" @click="copyEmail">Copy email (HTML)</button>
  <div class="spacer"></div>
  <button type="button" class="btn-reset" @click="resetForm">Reset</button>
</div>

        <div class="small">{{ status }}</div>
      </div>
    </div>
  </div>
</template>
