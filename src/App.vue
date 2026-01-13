<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { createDefaultRequest, PowertrainType } from "./app/models/installationModels";
import { TemplateRenderer } from "./app/services/templateRenderer";
import { ClipboardService } from "./app/services/clipboardService";

const request = reactive(createDefaultRequest());

const renderer = new TemplateRenderer();
const clipboard = new ClipboardService();

const rendered = computed(() => renderer.renderInstallerEmail(request));
const status = ref<string>("");

function addVehicle(): void {
  request.vehicles.push({
    brand: "",
    model: "",
    quantity: 1,
    powertrain: PowertrainType.Unknown,
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
  <textarea v-model="request.installation.detailsText" placeholder="Bijvoorbeeld: 8 x FMC234 + extra info"></textarea>
</div>

        <div class="section">
          <div class="section-title">Voertuiggegevens</div>

          <div
            v-for="(v, index) in request.vehicles"
            :key="index"
            class="vehicle-row"
            style="margin-bottom: 10px;"
          >
            <input v-model="v.brand" placeholder="Merk" />
            <input v-model="v.model" placeholder="Model" />
            <input type="number" min="1" v-model.number="v.quantity" />
            <select v-model="v.powertrain">
              <option :value="PowertrainType.Unknown">Onbekend</option>
              <option :value="PowertrainType.Electric">Elektrisch</option>
              <option :value="PowertrainType.Diesel">Diesel</option>
              <option :value="PowertrainType.Petrol">Benzine</option>
              <option :value="PowertrainType.Hybrid">Hybride</option>
            </select>
            <input v-model="v.licensePlate" placeholder="Kenteken" />
            <button type="button" @click="removeVehicle(index)">X</button>
          </div>

          <div class="actions">
            <button type="button" @click="addVehicle">Voeg voertuig toe</button>
          </div>

          <label style="margin-top: 10px;">Opmerking voertuigen</label>
          <textarea v-model="request.notes.vehicleNotes" placeholder="Vrij veld"></textarea>
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
            <div>
              <label>Postcode</label>
              <input v-model="request.location.postalCode" placeholder="9000" />
            </div>
            <div>
              <label>Stad</label>
              <input v-model="request.location.city" placeholder="Gent" />
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
              <label>Telefoon</label>
              <input v-model="request.contact.phone" placeholder="+32 470 00 11 23" />
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
        </div>

        <div class="small">{{ status }}</div>
      </div>
    </div>
  </div>
</template>
