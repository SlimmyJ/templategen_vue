<script setup lang="ts">
defineProps<{
  plannedDate: string;
  plannedTime: string;
  planningNotes: string;
}>();

defineEmits<{
  "update:plannedDate": [value: string];
  "update:plannedTime": [value: string];
  "update:planningNotes": [value: string];
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">Datum installatie</div>

    <div class="two">
      <div>
        <label>Datum</label>
        <input
          type="date"
          :value="plannedDate"
          @input="$emit('update:plannedDate', ($event.target as HTMLInputElement).value)"
        />
        <div class="hint">Leeg = te bepalen met klant</div>
      </div>

      <div>
        <label>Tijd</label>
        <input
          type="time"
          :value="plannedTime"
          @input="$emit('update:plannedTime', ($event.target as HTMLInputElement).value)"
        />
        <div class="hint">Leeg = te bepalen met klant</div>
      </div>
    </div>

    <label style="margin-top: 10px;">Opmerking datum installatie</label>
    <textarea
      class="textarea-compact"
      :value="planningNotes"
      placeholder="Vrij veld"
      @input="$emit('update:planningNotes', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>