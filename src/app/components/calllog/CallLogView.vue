<script setup lang="ts">
  import { computed, ref } from "vue";

  import { useCallLog } from "../../composables/useCallLog";
  import {
    CALL_DIRECTIONS,
    CALL_OUTCOMES,
    createCallLogDraft,
    toDraft,
    directionLabel,
    outcomeLabel,
    formatCallMoment,
    formatDate,
    type CallLogEntry
  } from "../../models/callLogModels";

  const { entries, search, save, remove } = useCallLog();

  const draft = ref(createCallLogDraft());
  const editingId = ref<string>("");
  const isEditing = computed(() => editingId.value !== "");

  function startEdit(entry: CallLogEntry): void {
    draft.value = toDraft(entry);
    editingId.value = entry.id;
  }

  function resetForm(): void {
    draft.value = createCallLogDraft();
    editingId.value = "";
  }

  function onSubmit(): void {
    const hasIdentity =
      draft.value.contactName.trim() !== "" ||
      draft.value.company.trim() !== "" ||
      draft.value.phone.trim() !== "";
    if (!hasIdentity) return;

    save(draft.value);
    resetForm();
  }

  function onDelete(entry: CallLogEntry): void {
    const who = entry.contactName.trim() || entry.company.trim() || "deze oproep";
    if (!window.confirm(`Oproep met ${who} verwijderen?`)) return;
    if (editingId.value === entry.id) resetForm();
    remove(entry.id);
  }
</script>

<template>
  <div class="header">
    <h1 class="title">Call log</h1>
    <span class="small">{{ entries.length }} {{ entries.length === 1 ? "oproep" : "oproepen" }}</span>
  </div>

  <div class="card">
    <div class="section-title">{{ isEditing ? "Oproep bewerken" : "Oproep toevoegen" }}</div>

    <form @submit.prevent="onSubmit">
      <div class="cl-form-grid">
        <div>
          <label>Tijdstip</label>
          <input type="datetime-local" v-model="draft.at" />
        </div>
        <div>
          <label>Richting</label>
          <select v-model="draft.direction">
            <option v-for="d in CALL_DIRECTIONS" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>
        <div>
          <label>Resultaat</label>
          <select v-model="draft.outcome">
            <option v-for="o in CALL_OUTCOMES" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>
      </div>

      <div class="two" style="margin-top: 10px;">
        <div>
          <label>Contactpersoon</label>
          <input v-model="draft.contactName" placeholder="Naam" />
        </div>
        <div>
          <label>Firma</label>
          <input v-model="draft.company" placeholder="Bedrijf" />
        </div>
      </div>

      <div class="two" style="margin-top: 10px;">
        <div>
          <label>Telefoon</label>
          <input v-model="draft.phone" placeholder="GSM / tel" />
        </div>
        <div>
          <label>Opvolgdatum</label>
          <input type="date" v-model="draft.followUpDate" />
        </div>
      </div>

      <div style="margin-top: 10px;">
        <label>Notities</label>
        <textarea v-model="draft.notes" class="textarea-compact" placeholder="Wat is er besproken?"></textarea>
      </div>

      <div class="actions">
        <button type="submit" class="primary">{{ isEditing ? "Bijwerken" : "Toevoegen" }}</button>
        <button v-if="isEditing" type="button" @click="resetForm">Annuleren</button>
      </div>
    </form>
  </div>

  <div class="card" style="margin-top: 12px;">
    <div class="cl-list-head">
      <label style="margin: 0;">Geregistreerde oproepen</label>
      <input v-model="search" class="cl-search" placeholder="Zoek op naam, firma, telefoon…" />
    </div>

    <p v-if="entries.length === 0" class="hint">Nog geen oproepen geregistreerd.</p>

    <table v-else class="cl-table">
      <thead>
        <tr>
          <th>Tijdstip</th>
          <th>Richting</th>
          <th>Contact</th>
          <th>Firma</th>
          <th>Telefoon</th>
          <th>Resultaat</th>
          <th>Opvolging</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td>{{ formatCallMoment(entry.at) }}</td>
          <td>{{ directionLabel(entry.direction) }}</td>
          <td>
            {{ entry.contactName || "—" }}
            <div v-if="entry.notes" class="cl-notes">{{ entry.notes }}</div>
          </td>
          <td>{{ entry.company || "—" }}</td>
          <td>{{ entry.phone || "—" }}</td>
          <td>
            <span class="cl-badge" :class="'cl-badge--' + entry.outcome">{{ outcomeLabel(entry.outcome) }}</span>
          </td>
          <td>{{ entry.followUpDate ? formatDate(entry.followUpDate) : "—" }}</td>
          <td class="cl-row-actions">
            <button type="button" class="cl-icon" title="Bewerken" @click="startEdit(entry)">✎</button>
            <button type="button" class="cl-icon" title="Verwijderen" @click="onDelete(entry)">🗑</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.cl-form-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 10px;
}

.cl-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.cl-search {
  width: 320px;
}

.cl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.cl-table th,
.cl-table td {
  border-bottom: 1px solid var(--panel-border);
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.cl-table th {
  font-size: 11px;
  color: var(--muted);
  font-weight: bold;
}

.cl-notes {
  color: var(--muted);
  font-size: 11px;
  margin-top: 2px;
  max-width: 280px;
}

.cl-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
  border: 1px solid var(--panel-border);
  background: #f1f1f1;
  white-space: nowrap;
}

.cl-badge--reached {
  background: #e3f5e9;
  border-color: #b8e2c8;
  color: #1d7a43;
}

.cl-badge--callback {
  background: #fff3da;
  border-color: #f0d9a8;
  color: #9a6a00;
}

.cl-badge--no-answer,
.cl-badge--wrong-number {
  background: #fbe6e6;
  border-color: #efc2c2;
  color: #a52121;
}

.cl-row-actions {
  white-space: nowrap;
  text-align: right;
}

.cl-icon {
  padding: 3px 7px;
  font-size: 12px;
}
</style>
