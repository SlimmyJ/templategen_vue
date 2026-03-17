<script setup lang="ts">
  import type { PlanningInfo } from "../../models/installationModels";

  const props = defineProps<{
    modelValue: PlanningInfo;
    notes: string;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: PlanningInfo];
    "update:notes": [value: string];
  }>();

  function updateField<TKey extends keyof PlanningInfo>(
    key: TKey,
    value: PlanningInfo[TKey],
  ): void {
    emit("update:modelValue", {
      ...props.modelValue,
      [key]: value,
    });
  }
</script>

<template>
  <div class="section">
    <div class="section-title">Datum installatie</div>

    <div class="two">
      <div>
        <label>Datum</label>
        <input
          type="date"
          :value="modelValue.plannedDate"
          @input="
            updateField(
              'plannedDate',
              ($event.target as HTMLInputElement).value,
            )
          " />
        <div class="hint">Leeg = te bepalen met klant</div>
      </div>

      <div>
        <label>Tijd</label>
        <input
          type="time"
          :value="modelValue.plannedTime"
          @input="
            updateField(
              'plannedTime',
              ($event.target as HTMLInputElement).value,
            )
          " />
        <div class="hint">Leeg = te bepalen met klant</div>
      </div>
    </div>

    <label style="margin-top: 10px">Opmerking datum installatie</label>
    <textarea
      class="textarea-compact"
      :value="notes"
      placeholder="Vrij veld"
      @input="
        $emit('update:notes', ($event.target as HTMLTextAreaElement).value)
      "></textarea>
  </div>
</template>
