<script setup lang="ts">
  import type { EndingText } from "../../models/installationModels";

  const props = defineProps<{
    modelValue: EndingText;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: EndingText];
  }>();

  function updateField<TKey extends keyof EndingText>(
    key: TKey,
    value: EndingText[TKey],
  ): void {
    emit("update:modelValue", {
      ...props.modelValue,
      [key]: value,
    });
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Afsluiting</div>

    <label>Bevestiging</label>
    <textarea
      class="textarea-compact muted-editable"
      :value="modelValue.confirmLine"
      @input="
        updateField('confirmLine', ($event.target as HTMLTextAreaElement).value)
      "></textarea>

    <label style="margin-top: 10px">Dankzin</label>
    <textarea
      class="textarea-compact muted-editable"
      :value="modelValue.thanksLine"
      @input="
        updateField('thanksLine', ($event.target as HTMLTextAreaElement).value)
      "></textarea>
  </div>
</template>
