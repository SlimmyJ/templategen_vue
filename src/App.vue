<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { createDefaultRequest } from "./app/models/installationModels";
import { TemplateRenderer } from "./app/services/templateRenderer";
import { ClipboardService } from "./app/services/clipboardService";
import TopBar from "./app/components/TopBar.vue";
import {
  InstallerStore,
  type InstallerRecord,
} from "./app/services/installerStore";
import { TableImportService } from "./app/services/tableImportService";
import { LocalStateService } from "./app/services/localStateService";

type PreviewTab = "installer" | "customer";

const tableImport = new TableImportService();
const stateStore = new LocalStateService();
const loaded = stateStore.load();
const request = reactive(loaded ?? createDefaultRequest());
const installerSearch = ref<string>("");
const installerStore = new InstallerStore();
const installers = ref<InstallerRecord[]>(installerStore.getAll());
const activeTab = ref<PreviewTab>("installer");
const renderer = new TemplateRenderer();
const clipboard = new ClipboardService();
const status = ref<string>("");

installerStore.ensureSeed([
  {
    id: "ct-protection",
    companyName: "Car&Truck Protection",
    contactPerson: "Dhr. Ronny Michiels",
    email: "ronny@ronny.be",
    gsm: "0476 45 75 75",
  },
]);

reloadInstallers();

const renderedInstaller = computed(() =>
  renderer.renderInstallerEmail(request),
);

const activeInstaller = computed(() => {
  if (request.installerSelection.mode === "new") return request.installerSelection.newInstaller;
  if (selectedInstaller.value) return installerEdit;
  return request.installerSelection.newInstaller;
});


const renderedCustomer = computed(() =>
  renderer.renderCustomerEmail(request, activeInstaller.value),
);

const selectedInstaller = computed<InstallerRecord | null>(() => {
  const id = request.installerSelection.selectedId;
  if (!id) return null;
  return installers.value.find((x) => x.id === id) ?? null;
});

const installerEdit = reactive({
  companyName: "",
  contactPerson: "",
  email: "",
  gsm: ""
});


function reloadInstallers(): void {
  installers.value = installerStore.getAll().map(x => ({
    id: x.id,
    companyName: x.companyName ?? "",
    contactPerson: x.contactPerson ?? "",
    email: x.email ?? "",
    gsm: x.gsm ?? ""
  }));
}

function onInstallerPick(): void {
  const value = installerSearch.value.trim();

  if (value.length === 0) {
    request.installerSelection.mode = "existing";
    request.installerSelection.selectedId = "";
    return;
  }

  if (value.toLowerCase() === "nieuwe installateur") {
    request.installerSelection.mode = "new";
    request.installerSelection.selectedId = "";
    return;
  }

  const normalized = value.toLowerCase();

  // 1) exact match
  let match = installers.value.find(x => x.companyName.trim().toLowerCase() === normalized) ?? null;

  // 2) startsWith match
  if (!match) {
    match = installers.value.find(x => x.companyName.trim().toLowerCase().startsWith(normalized)) ?? null;
  }

  // 3) contains match
  if (!match) {
    match = installers.value.find(x => x.companyName.trim().toLowerCase().includes(normalized)) ?? null;
  }

  if (match) {
    request.installerSelection.mode = "existing";
    request.installerSelection.selectedId = match.id;
    installerSearch.value = match.companyName;
    return;
  }

  // unknown => new installer
  request.installerSelection.mode = "new";
  request.installerSelection.selectedId = "";
  request.installerSelection.newInstaller.companyName = value;
}


function saveNewInstaller(): void {
  const n = request.installerSelection.newInstaller;

  const companyName = n.companyName.trim();
  if (companyName.length === 0) return;

  const id = companyName
    .toLowerCase()
    .split(" ")
    .filter((x) => x.length > 0)
    .join("-")
    .split("&")
    .join("and");

  const record: InstallerRecord = {
    id,
    companyName,
    contactPerson: n.contactPerson.trim(),
    email: n.email.trim(),
    gsm: n.gsm.trim(),
  };

  installerStore.upsert(record);
  reloadInstallers();

  request.installerSelection.mode = "existing";
  request.installerSelection.selectedId = record.id;
  installerSearch.value = record.companyName;
}

watch(
  () => request.language,
  (lang) => {
    const fr = lang === "fr";

    request.intro.salutationPrefix = fr ? "Bonjour" : "Beste";

    if (request.intro.requestLine.trim() === "" ||
        request.intro.requestLine.trim() === "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen." ||
        request.intro.requestLine.trim() === "Veuillez contacter le client ci-dessous et planifier la mission suivante.") {
      request.intro.requestLine = fr
        ? "Veuillez contacter le client ci-dessous et planifier la mission suivante."
        : "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen.";
    }

    if (request.ending.confirmLine.trim() === "" ||
        request.ending.confirmLine.includes("Gelieve de datum") ||
        request.ending.confirmLine.includes("Veuillez confirmer")) {
      request.ending.confirmLine = fr
        ? "Veuillez confirmer la date du rendez-vous à la planning et au client."
        : "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.";
    }

    if (request.ending.thanksLine.trim() === "" ||
        request.ending.thanksLine.includes("Alvast bedankt") ||
        request.ending.thanksLine.includes("Merci d'avance")) {
      request.ending.thanksLine = fr
        ? "Merci d'avance pour le bon traitement de cette demande."
        : "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht.";
    }

    if (request.notes.installationPlaceLine.trim() === "" ||
        request.notes.installationPlaceLine.includes("te verifi") ||
        request.notes.installationPlaceLine.includes("à vérifier")) {
      request.notes.installationPlaceLine = fr
        ? "Lieu d'installation : à vérifier avec le client"
        : "Installatieplaats: te verifiëren met klant";
    }

    request.customerEmail.intro.salutationPrefix = fr ? "Bonjour" : "Beste";
  },
  { immediate: true }
);


watch(
  () => selectedInstaller.value,
  (sel) => {
    if (!sel) {
      installerEdit.companyName = "";
      installerEdit.contactPerson = "";
      installerEdit.email = "";
      installerEdit.gsm = "";
      return;
    }
    installerEdit.companyName = sel.companyName;
    installerEdit.contactPerson = sel.contactPerson;
    installerEdit.email = sel.email;
    installerEdit.gsm = sel.gsm;
  },
  { immediate: true }
);


function saveSelectedInstallerEdits(): void {
  const sel = selectedInstaller.value;
  if (!sel) return;

  installerStore.upsert({
    id: sel.id,
    companyName: installerEdit.companyName.trim(),
    contactPerson: installerEdit.contactPerson.trim(),
    email: installerEdit.email.trim(),
    gsm: installerEdit.gsm.trim()
  });

  reloadInstallers();
  installerSearch.value = installerEdit.companyName.trim();
}

// State save
watch(
  () => request,
  () => {
    stateStore.save(request);
  },
  { deep: true },
);

function deleteSelectedInstaller(): void {
  const sel = selectedInstaller.value;
  if (!sel) return;

  const name = sel.companyName.trim().length > 0 ? sel.companyName.trim() : "deze installateur";
  const ok = window.confirm(`Bent u zeker dat u ${name} wil verwijderen?`);
  if (!ok) return;

  installerStore.remove(sel.id);
  reloadInstallers();

  request.installerSelection.mode = "existing";
  request.installerSelection.selectedId = "";
  installerSearch.value = "";
}

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

  file.text().then((text) => {
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

function addVehicle(): void {
  request.vehicles.push({
    brand: "",
    model: "",
    quantity: 1,
    licensePlate: "",
  });
}

function removeVehicle(index: number): void {
  request.vehicles.splice(index, 1);
}

async function copyInstaller(): Promise<void> {
  status.value = "";
  try {
    await clipboard.copyHtmlOnly(renderedInstaller.value.htmlBody);
    status.value = "Installateur mail gekopieerd (HTML).";
  } catch (e) {
    const message = e instanceof Error ? e.message : "Onbekende fout";
    status.value = `Kon niet kopieren: ${message}`;
  }
}

async function copyCustomer(): Promise<void> {
  status.value = "";
  try {
    await clipboard.copyHtmlOnly(renderedCustomer.value.htmlBody);
    status.value = "Klant mail gekopieerd (HTML).";
  } catch (e) {
    const message = e instanceof Error ? e.message : "Onbekende fout";
    status.value = `Kon niet kopieren: ${message}`;
  }
}

const installerOpen = ref<boolean>(false);

function pickExistingInstaller(id: string): void {
  const ins = installers.value.find(x => x.id === id);
  if (!ins) return;

  request.installerSelection.mode = "existing";
  request.installerSelection.selectedId = ins.id;
  installerSearch.value = ins.companyName;
  installerOpen.value = false;
}

function pickNewInstaller(): void {
  request.installerSelection.mode = "new";
  request.installerSelection.selectedId = "";
  installerOpen.value = false;
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
        <div class="section">
  <div class="section-title">Taal</div>

  <label>Kies taal</label>
  <select v-model="request.language">
    <option value="nl">Nederlands</option>
    <option value="fr">Français</option>
  </select>

  <div class="hint">Deze taal bepaalt de vaste teksten en titels in beide mails.</div>
</div>

        <div class="section">
          <div class="section-title">Intro</div>

          <label>Aanspreking</label>
          <div class="salutation-row">
            <input class="salutation-prefix" v-model="request.intro.salutationPrefix" />
            <input v-model="request.intro.salutationName" placeholder="Naam" />
          </div>

          <label style="margin-top: 10px">Intro zin</label>
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
            <div class="dropzone-sub">
              Plak hier (Ctrl+V) vanuit Excel of Outlook, of sleep een .csv
              bestand
            </div>

            <div class="paste-area" contenteditable="true" @paste="onVehiclePaste"></div>

            <div class="actions">
              <input class="file-input" type="file" accept=".csv,text/csv" @change="onVehicleFileSelected" />
              <button type="button" @click="clearVehicleTable">
                Tabel wissen
              </button>
            </div>
          </div>

          <label style="margin-top: 10px">Opmerking voertuigen</label>
          <textarea v-model="request.notes.vehicleNotes" placeholder="Vrij veld"></textarea>

          <div v-if="request.vehicleTable.html.trim().length === 0" style="margin-top: 10px">
            <div class="hint">
              Geen tabel ingeplakt. Je kan nog altijd losse voertuiglijnen
              gebruiken.
            </div>

            <div v-for="(v, index) in request.vehicles" :key="index" class="vehicle-row" style="margin-bottom: 10px">
              <input v-model="v.brand" placeholder="Merk" />
              <input v-model="v.model" placeholder="Model" />
              <input type="number" min="1" v-model.number="v.quantity" />
              <input v-model="v.licensePlate" placeholder="Kenteken" />
              <button type="button" @click="removeVehicle(index)">X</button>
            </div>

            <div class="actions">
              <button type="button" @click="addVehicle">
                Voeg voertuig toe
              </button>
            </div>
          </div>

          <div v-else style="margin-top: 10px">
            <div class="hint">
              Tabel is actief en wordt meegenomen in de preview en in de kopie.
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Installatieplaats</div>

          <label>Titel zin</label>
          <input v-model="request.notes.installationPlaceLine" />

          <div class="two" style="margin-top: 10px">
            <div>
              <label>Locatienaam</label>
              <input v-model="request.location.name" placeholder="Total Energies Muide" />
            </div>
            <div>
              <label>Straat</label>
              <input v-model="request.location.street" placeholder="Goolestraat 2" />
            </div>
          </div>

          <div class="two" style="margin-top: 10px">
            <div style="margin-top: 10px">
              <label>Postcode + Stad</label>
              <input v-model="request.location.postalCity" placeholder="9000 Gent" />
            </div>
          </div>

          <label style="margin-top: 10px">Opmerking installatieplaats</label>
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

          <div class="two" style="margin-top: 10px">
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
  <div class="section-title">Installateur</div>

  <div class="installer-picker">
    <label>Kies installateur</label>

    <div class="picker-row">
      <input
        v-model="installerSearch"
        placeholder="Zoek installateur..."
        @focus="installerOpen = true"
        @input="installerOpen = true; onInstallerPick()"
      />
      <button type="button" class="picker-btn" @click="installerOpen = !installerOpen">
        ▼
      </button>
    </div>

    <div v-if="installerOpen" class="picker-menu">
      <button type="button" class="picker-item picker-new" @click="pickNewInstaller()">
        Nieuwe installateur
      </button>

      <button
        v-for="ins in installers"
        :key="ins.id"
        type="button"
        class="picker-item"
        @click="pickExistingInstaller(ins.id)"
      >
        {{ ins.companyName }}
      </button>
    </div>
  </div>

  <!-- NEW installer -->
  <div v-if="request.installerSelection.mode === 'new'" style="margin-top: 10px;">
    <label>Bedrijfsnaam</label>
    <input v-model="request.installerSelection.newInstaller.companyName" />

    <label style="margin-top: 10px;">Contactpersoon</label>
    <input v-model="request.installerSelection.newInstaller.contactPerson" />

    <label style="margin-top: 10px;">Email</label>
    <input v-model="request.installerSelection.newInstaller.email" />

    <label style="margin-top: 10px;">GSM</label>
    <input v-model="request.installerSelection.newInstaller.gsm" />

    <div class="actions">
      <button type="button" @click="saveNewInstaller">Opslaan in lijst</button>
    </div>
  </div>

  <!-- EXISTING installer -->
  <div v-else style="margin-top: 10px;">
    <div v-if="selectedInstaller">
      <label>Bedrijfsnaam</label>
      <input v-model="installerEdit.companyName" />

      <label style="margin-top: 10px;">Contactpersoon</label>
      <input v-model="installerEdit.contactPerson" />

      <label style="margin-top: 10px;">Email</label>
      <input v-model="installerEdit.email" />

      <label style="margin-top: 10px;">GSM</label>
      <input v-model="installerEdit.gsm" />

      <div class="actions">
        <button type="button" @click="saveSelectedInstallerEdits">Wijzigingen opslaan</button>
        <button type="button" class="danger" @click="deleteSelectedInstaller">
          Verwijder installateur
        </button>
      </div>
    </div>

    <div v-else class="hint">
      Geen installateur geselecteerd.
    </div>
  </div>
</div>


        <div class="section">
          <div class="section-title">Afsluiting</div>

          <label>Bevestiging</label>
          <textarea v-model="request.ending.confirmLine"></textarea>

          <label style="margin-top: 10px">Dank zin</label>
          <textarea v-model="request.ending.thanksLine"></textarea>
        </div>
      </div>

      <div class="card">
        <label>Preview</label>

        <div class="tabbar">
          <button type="button" :class="{ active: activeTab === 'installer' }" @click="activeTab = 'installer'">
            Installateur
          </button>
          <button type="button" :class="{ active: activeTab === 'customer' }" @click="activeTab = 'customer'">
            Klant
          </button>
        </div>

        <div class="preview" v-html="activeTab === 'installer'
          ? renderedInstaller.htmlBody
          : renderedCustomer.htmlBody
          "></div>

        <div style="margin-top: 14px">
          <label>Onderwerp</label>
          <input :value="activeTab === 'installer'
            ? renderedInstaller.subject
            : renderedCustomer.subject
            " readonly />
        </div>

        <div class="actions">
          <button class="primary" type="button" @click="copyInstaller">
            Copy installateur (HTML)
          </button>
          <button type="button" @click="copyCustomer">Copy klant (HTML)</button>
          <div class="spacer"></div>
          <button type="button" class="btn-reset" @click="resetForm">
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
