<script setup lang="ts">
defineProps<{
  installationPlaceLine: string;
  locationName: string;
  street: string;
  postalCity: string;
  installationPlaceNotes: string;
}>();

defineEmits<{
  "update:installationPlaceLine": [value: string];
  "update:locationName": [value: string];
  "update:street": [value: string];
  "update:postalCity": [value: string];
  "update:installationPlaceNotes": [value: string];
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">Installatieplaats</div>

    <label>Titel</label>
    <input
      :value="installationPlaceLine"
      @input="$emit('update:installationPlaceLine', ($event.target as HTMLInputElement).value)"
    />

    <div class="two" style="margin-top: 10px">
      <div>
        <label>Locatie</label>
        <input
          :value="locationName"
          placeholder="Total Energies Muide"
          @input="$emit('update:locationName', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div>
        <label>Straat</label>
        <input
          :value="street"
          placeholder="Goolestraat 2"
          @input="$emit('update:street', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="two" style="margin-top: 10px">
      <div style="margin-top: 10px">
        <label>Postcode + Stad</label>
        <input
          :value="postalCity"
          placeholder="9000 Gent"
          @input="$emit('update:postalCity', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <label style="margin-top: 10px">Opmerking installatieplaats</label>
    <textarea
      class="textarea-compact"
      :value="installationPlaceNotes"
      placeholder="Vrij veld"
      @input="$emit('update:installationPlaceNotes', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>
