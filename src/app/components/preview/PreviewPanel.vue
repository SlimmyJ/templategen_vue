<script setup lang="ts">
import { ref } from "vue";

type PreviewTab = "installer" | "customer";
type CopiedBtn = "installer" | "customer" | "calendar" | "subject" | null;

const props = withDefaults(defineProps<{
  activeTab: PreviewTab;
  installerHtml: string;
  customerHtml?: string;
  installerSubject?: string;
  customerSubject?: string;
  status: string;
  showCustomerTab?: boolean;
  showCalendarCopy?: boolean;
}>(), {
  customerHtml: "",
  installerSubject: "",
  customerSubject: "",
  showCustomerTab: true,
  showCalendarCopy: true
});

const emit = defineEmits<{
  "update:activeTab": [value: PreviewTab];
  copyInstaller: [];
  copyCustomer: [];
  copyCalendar: [];
  reset: [];
}>();

const copied = ref<CopiedBtn>(null);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

function flashCopied(btn: CopiedBtn): void {
  if (copyTimer) clearTimeout(copyTimer);
  copied.value = btn;
  copyTimer = setTimeout(() => { copied.value = null; }, 1500);
}

function handleCopyInstaller(): void {
  emit("copyInstaller");
  flashCopied("installer");
}

function handleCopyCustomer(): void {
  emit("copyCustomer");
  flashCopied("customer");
}

function handleCopyCalendar(): void {
  emit("copyCalendar");
  flashCopied("calendar");
}

async function handleCopySubject(): Promise<void> {
  const subject = props.activeTab === "installer" ? props.installerSubject : props.customerSubject;
  if (!subject) return;
  try {
    await navigator.clipboard.writeText(subject);
    flashCopied("subject");
  } catch { /* clipboard unavailable */ }
}

function handleReset(): void {
  if (!confirm("Formulier resetten? Alle ingevulde gegevens gaan verloren.")) return;
  emit("reset");
}
</script>

<template>
  <div class="card">
    <label>Preview</label>

    <div class="tabbar" v-if="showCustomerTab">
      <button type="button" :class="{ active: activeTab === 'installer' }"
        @click="$emit('update:activeTab', 'installer')">
        Installateur
      </button>

      <button type="button" :class="{ active: activeTab === 'customer' }"
        @click="$emit('update:activeTab', 'customer')">
        Klant
      </button>
    </div>

    <div class="preview" v-html="activeTab === 'installer' ? installerHtml : customerHtml"></div>

    <div style="margin-top: 14px">
      <label>Onderwerp</label>
      <div class="subject-row">
        <input :value="activeTab === 'installer' ? installerSubject : customerSubject" readonly />
        <button
          type="button"
          class="btn-copy-subject"
          :class="{ done: copied === 'subject' }"
          title="Kopieer onderwerp"
          @click="handleCopySubject">
          {{ copied === "subject" ? "✓" : "⎘" }}
        </button>
      </div>
    </div>

    <div class="actions">
      <button
        type="button"
        class="primary"
        :class="{ done: copied === 'installer' }"
        @click="handleCopyInstaller">
        {{ copied === "installer" ? "✓ Gekopieerd" : "Kopieer installateur" }}
      </button>

      <button
        v-if="showCustomerTab"
        type="button"
        :class="{ done: copied === 'customer' }"
        @click="handleCopyCustomer">
        {{ copied === "customer" ? "✓ Gekopieerd" : "Kopieer klant" }}
      </button>

      <button
        v-if="showCalendarCopy"
        type="button"
        :class="{ done: copied === 'calendar' }"
        @click="handleCopyCalendar">
        {{ copied === "calendar" ? "✓ Gekopieerd" : "Kopieer kalender" }}
      </button>

      <div class="spacer"></div>

      <button type="button" class="btn-reset" @click="handleReset">
        Reset
      </button>
    </div>

    <div class="small">{{ status }}</div>
  </div>
</template>

<style scoped>
.subject-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.subject-row input {
  flex: 1;
}

.btn-copy-subject {
  width: 30px;
  min-width: 30px;
  height: 28px;
  padding: 0;
  font-size: 13px;
  line-height: 1;
  border: 1px solid #c9c9c9;
  background: #f0f0f0;
  border-radius: 2px;
  flex-shrink: 0;
}

.btn-copy-subject.done {
  background: #2a9d5c;
  border-color: #228a4e;
  color: #fff;
}

button.done,
button.primary.done {
  background: #2a9d5c !important;
  border-color: #228a4e !important;
  color: #fff !important;
}
</style>
