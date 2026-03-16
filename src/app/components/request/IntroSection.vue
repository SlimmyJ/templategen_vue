<script setup lang="ts">
defineProps<{
  salutationPrefix: string;
  salutationName: string;
  requestLine: string;
}>();

defineEmits<{
  "update:salutationPrefix": [value: string];
  "update:salutationName": [value: string];
  "update:requestLine": [value: string];
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">Intro</div>

    <label>Aanspreking</label>
    <div class="salutation-row">
      <input
        class="salutation-prefix"
        :value="salutationPrefix"
        @input="$emit('update:salutationPrefix', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="salutationName"
        placeholder="Naam"
        @input="$emit('update:salutationName', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <label style="margin-top: 10px">Intro</label>
    <textarea
      class="textarea-compact muted-editable"
      :value="requestLine"
      @input="$emit('update:requestLine', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>
