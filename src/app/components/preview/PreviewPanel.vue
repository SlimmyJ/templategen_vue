<script setup lang="ts">
type PreviewTab = "installer" | "customer";

defineProps<{
  activeTab: PreviewTab;
  installerHtml: string;
  customerHtml: string;
  installerSubject: string;
  customerSubject: string;
  status: string;
}>();

defineEmits<{
  "update:activeTab": [value: PreviewTab];
  copyInstaller: [];
  copyCustomer: [];
  copyCalendar: [];
  reset: [];
}>();
</script>

<template>
  <div class="card">
    <label>Preview</label>

    <div class="tabbar">
      <button
        type="button"
        :class="{ active: activeTab === 'installer' }"
        @click="$emit('update:activeTab', 'installer')"
      >
        Installateur
      </button>

      <button
        type="button"
        :class="{ active: activeTab === 'customer' }"
        @click="$emit('update:activeTab', 'customer')"
      >
        Klant
      </button>
    </div>

    <div
      class="preview"
      v-html="activeTab === 'installer' ? installerHtml : customerHtml"
    ></div>

    <div style="margin-top: 14px">
      <label>Onderwerp</label>
      <input
        :value="activeTab === 'installer' ? installerSubject : customerSubject"
        readonly
      />
    </div>

    <div class="actions">
      <button class="primary" type="button" @click="$emit('copyInstaller')">
        Copy installateur
      </button>

      <button type="button" @click="$emit('copyCustomer')">
        Copy klant
      </button>

      <button type="button" @click="$emit('copyCalendar')">
        Copy kalender
      </button>

      <div class="spacer"></div>

      <button type="button" class="btn-reset" @click="$emit('reset')">
        Reset
      </button>
    </div>

    <div class="small">{{ status }}</div>
  </div>
</template>
