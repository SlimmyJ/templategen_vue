<script setup lang="ts">
defineProps<{
  confirmLine: string;
  thanksLine: string;
}>();

defineEmits<{
  "update:confirmLine": [value: string];
  "update:thanksLine": [value: string];
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">Afsluiting</div>

    <label>Bevestiging</label>
    <textarea
      class="textarea-compact muted-editable"
      :value="confirmLine"
      @input="$emit('update:confirmLine', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>

    <label style="margin-top: 10px">Dankzin</label>
    <textarea
      class="textarea-compact muted-editable"
      :value="thanksLine"
      @input="$emit('update:thanksLine', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>