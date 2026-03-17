<script setup lang="ts">
  import type { IntroText } from "../../models/installationModels";

  const props = defineProps<{
    modelValue: IntroText;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: IntroText];
  }>();

  function updateField<TKey extends keyof IntroText>(
    key: TKey,
    value: IntroText[TKey],
  ): void {
    emit("update:modelValue", {
      ...props.modelValue,
      [key]: value,
    });
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Intro</div>

    <label>Aanspreking</label>
    <div class="salutation-row">
      <input
        class="salutation-prefix"
        :value="modelValue.salutationPrefix"
        @input="
          updateField(
            'salutationPrefix',
            ($event.target as HTMLInputElement).value,
          )
        " />
      <input
        :value="modelValue.salutationName"
        placeholder="Naam"
        @input="
          updateField(
            'salutationName',
            ($event.target as HTMLInputElement).value,
          )
        " />
    </div>

    <label style="margin-top: 10px">Intro</label>
    <textarea
      class="textarea-compact muted-editable"
      :value="modelValue.requestLine"
      @input="
        updateField('requestLine', ($event.target as HTMLTextAreaElement).value)
      "></textarea>
  </div>
</template>
