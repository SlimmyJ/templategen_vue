<script setup lang="ts">
import { ref } from "vue";
import TopBar from "./app/components/TopBar.vue";
import { useVehicleImport } from "./app/composables/useVehicleImport";
import { useInstallationRequest } from "./app/composables/useInstallationRequest";
import { LocalInstallationRequestRepository } from "./app/repositories/local/LocalInstallationRequestRepository";
import { useEmailPreview } from "./app/composables/useEmailPreview";
import { useInstallerCatalog } from "./app/composables/useInstallerCatalog";

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
        <div class="section">
          <div class="section-title">Taal</div>

          <label>Kies taal</label>
          <select v-model="request.language">
            <option value="nl">Nederlands</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div class="section">
          <div class="section-title">Intro</div>

          <label>Aanspreking</label>
          <div class="salutation-row">
            <input class="salutation-prefix" v-model="request.intro.salutationPrefix" />
            <input v-model="request.intro.salutationName" placeholder="Naam" />
          </div>

          <label style="margin-top: 10px">Intro</label>
          <textarea class="textarea-compact muted-editable" v-model="request.intro.requestLine"></textarea>
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
          <label style="margin-top: 10px;">Opmerking datum installatie</label>
          <textarea class="textarea-compact" v-model="request.notes.planningNotes" placeholder="Vrij veld"></textarea>

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
              Plak vanuit Excel of Outlook, of sleep een .csv
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

          <div v-if="request.vehicleTable.html.trim().length === 0" style="margin-top: 10px;">
            <div class="hint" style="margin-bottom: 10px">
              Geen tabel ingeplakt.
            </div>

            <div v-for="(v, index) in request.vehicles" :key="index" class="vehicle-row" style="margin-bottom: 10px">
              <input v-model="v.brand" placeholder="Merk" />
              <input v-model="v.model" placeholder="Model" />
              <input type="number" min="1" v-model.number="v.quantity" />
              <input v-model="v.licensePlate" placeholder="Kenteken" />
              <button type="button" class="vehicle-remove" @click="removeVehicle(index)">X</button>
            </div>

            <div class="vehicle-row vehicle-add-row">
              <button type="button" class="btn-add-vehicle" @click="addVehicle">
                Voeg voertuig toe
              </button>
              <div class="vehicle-add-spacer"></div>
            </div>


          </div>



          <div v-else style="margin-top: 10px">
            <div class="hint">
              Tabel is actief en wordt meegenomen in de preview en kopie.
            </div>
          </div>

          <label style="margin-top: 10px">Opmerking voertuigen</label>
          <textarea class="textarea-compact" v-model="request.notes.vehicleNotes" placeholder="Vrij veld"></textarea>
        </div>
        <div class="section">
          <div class="section-title">Installatieplaats</div>

          <label>Titel</label>
          <input v-model="request.notes.installationPlaceLine" />

          <div class="two" style="margin-top: 10px">
            <div>
              <label>Locatie</label>
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
          <textarea class="textarea-compact" v-model="request.notes.installationPlaceNotes"
            placeholder="Vrij veld"></textarea>
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
              <input v-model="installerSearch" placeholder="Zoek installateur..." @focus="installerOpen = true"
                @input="installerOpen = true; onInstallerPick()" />
              <button type="button" class="picker-btn" @click="installerOpen = !installerOpen">
                ▼
              </button>
            </div>

            <div v-if="installerOpen" class="picker-menu">
              <button type="button" class="picker-item picker-new" @click="pickNewInstaller()">
                Nieuwe installateur
              </button>

              <button v-for="ins in installers" :key="ins.id" type="button" class="picker-item"
                @click="pickExistingInstaller(ins.id)">
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
          <textarea class="textarea-compact muted-editable" v-model="request.ending.confirmLine"></textarea>

          <label style="margin-top: 10px">Dankzin</label>
          <textarea class="textarea-compact muted-editable" v-model="request.ending.thanksLine"></textarea>
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
            Copy installateur
          </button>
          <button type="button" @click="copyCustomer">Copy klant</button>
          <button type="button" @click="copyCalendar">Copy kalender</button>

          <div class="spacer"></div>
          <button type="button" class="btn-reset" @click="resetForm">
            Reset
          </button>
        </div>
        <div class="small">{{ status }}</div>
      </div>
    </div>
  </div>
</template>
