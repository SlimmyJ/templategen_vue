<script setup lang="ts">
  import type { ContactInfo } from "../../models/installationModels";

  const props = defineProps<{
    modelValue: ContactInfo;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: ContactInfo];
  }>();

  function updateField<TKey extends keyof ContactInfo>(
    key: TKey,
    value: ContactInfo[TKey],
  ): void {
    emit("update:modelValue", {
      ...props.modelValue,
      [key]: value,
    });
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Contactpersoon</div>

    <div class="two">
      <div>
        <label>Naam</label>
        <input
          :value="modelValue.name"
          placeholder="Dhr. Van Der Vaert"
          @input="
            updateField('name', ($event.target as HTMLInputElement).value)
          " />
      </div>

      <div>
        <label>Tel</label>
        <input
          :value="modelValue.tel"
          placeholder="+32 9 335 61 35"
          @input="
            updateField('tel', ($event.target as HTMLInputElement).value)
          " />
      </div>
    </div>

    <div
      class="two"
      style="margin-top: 10px">
      <div>
        <label>GSM</label>
        <input
          :value="modelValue.gsm"
          placeholder="+32 470 00 11 23"
          @input="
            updateField('gsm', ($event.target as HTMLInputElement).value)
          " />
      </div>

      <div>
        <label>Email</label>
        <input
          :value="modelValue.email"
          placeholder="naam@bedrijf.be"
          @input="
            updateField('email', ($event.target as HTMLInputElement).value)
          " />
      </div>
    </div>
  </div>
</template>
