<script setup lang="ts">
defineProps<{
  detailsText: string;
}>();

defineEmits<{
  "update:detailsText": [value: string];
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">Installatiegegevens</div>

    <label>Details</label>
    <textarea
      :value="detailsText"
      placeholder="Bijvoorbeeld: 8 x FMC234 + extra info"
      @input="$emit('update:detailsText', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>
