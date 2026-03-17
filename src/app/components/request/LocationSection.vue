<script setup lang="ts">
  import type { LocationInfo } from "../../models/installationModels";

  const props = defineProps<{
    modelValue: LocationInfo;
    title: string;
    notes: string;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: LocationInfo];
    "update:title": [value: string];
    "update:notes": [value: string];
  }>();

  function updateField<TKey extends keyof LocationInfo>(
    key: TKey,
    value: LocationInfo[TKey],
  ): void {
    emit("update:modelValue", {
      ...props.modelValue,
      [key]: value,
    });
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Installatieplaats</div>

    <label>Titel</label>
    <input
      :value="title"
      @input="
        $emit('update:title', ($event.target as HTMLInputElement).value)
      " />

    <div
      class="two"
      style="margin-top: 10px">
      <div>
        <label>Locatie</label>
        <input
          :value="modelValue.name"
          placeholder="Total Energies Muide"
          @input="
            updateField('name', ($event.target as HTMLInputElement).value)
          " />
      </div>

      <div>
        <label>Straat</label>
        <input
          :value="modelValue.street"
          placeholder="Goolestraat 2"
          @input="
            updateField('street', ($event.target as HTMLInputElement).value)
          " />
      </div>
    </div>

    <div
      class="two"
      style="margin-top: 10px">
      <div style="margin-top: 10px">
        <label>Postcode + Stad</label>
        <input
          :value="modelValue.postalCity"
          placeholder="9000 Gent"
          @input="
            updateField('postalCity', ($event.target as HTMLInputElement).value)
          " />
      </div>
    </div>

    <label style="margin-top: 10px">Opmerking installatieplaats</label>
    <textarea
      class="textarea-compact"
      :value="notes"
      placeholder="Vrij veld"
      @input="
        $emit('update:notes', ($event.target as HTMLTextAreaElement).value)
      "></textarea>
  </div>
</template>
