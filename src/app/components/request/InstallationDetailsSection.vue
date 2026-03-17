<script setup lang="ts">
  import type { InstallationDetails } from "../../models/installationModels";

  const props = defineProps<{
    modelValue: InstallationDetails;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: InstallationDetails];
  }>();

  function updateDetails(value: string): void {
    emit("update:modelValue", {
      ...props.modelValue,
      detailsText: value,
    });
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Installatiegegevens</div>

    <label>Details</label>
    <textarea
      :value="modelValue.detailsText"
      placeholder="Bijvoorbeeld: 8 x FMC234 + extra info"
      @input="
        updateDetails(($event.target as HTMLTextAreaElement).value)
      "></textarea>
  </div>
</template>
