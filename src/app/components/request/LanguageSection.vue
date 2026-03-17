<script setup lang="ts">
  type Language = "nl" | "fr";

  defineProps<{
    modelValue: Language;
  }>();

  defineEmits<{
    "update:modelValue": [value: Language];
  }>();
</script>

<template>
  <div class="section">
    <div class="section-title">Taal</div>

    <label for="language-select">Kies taal</label>
    <select
      id="language-select"
      :value="modelValue"
      @change="
        $emit(
          'update:modelValue',
          ($event.target as HTMLSelectElement).value as Language,
        )
      ">
      <option value="nl">Nederlands</option>
      <option value="fr">Français</option>
    </select>
  </div>
</template>
