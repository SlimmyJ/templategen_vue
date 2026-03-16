<script setup lang="ts">
defineProps<{
  name: string;
  tel: string;
  gsm: string;
  email: string;
}>();

defineEmits<{
  "update:name": [value: string];
  "update:tel": [value: string];
  "update:gsm": [value: string];
  "update:email": [value: string];
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">Contactpersoon</div>

    <div class="two">
      <div>
        <label>Naam</label>
        <input
          :value="name"
          placeholder="Dhr. Van Der Vaert"
          @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div>
        <label>Tel</label>
        <input
          :value="tel"
          placeholder="+32 9 335 61 35"
          @input="$emit('update:tel', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="two" style="margin-top: 10px">
      <div>
        <label>GSM</label>
        <input
          :value="gsm"
          placeholder="+32 470 00 11 23"
          @input="$emit('update:gsm', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          :value="email"
          placeholder="naam@bedrijf.be"
          @input="$emit('update:email', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
