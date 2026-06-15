<script setup lang="ts" generic="T extends { id: string }">
  import { computed, ref, watch, type Ref } from "vue";

  const props = defineProps<{
    label?: string;
    placeholder?: string;
    /** Returns matches for a term — typically an entity repository's `search`. */
    search: (term: string) => Promise<T[]>;
    toLabel: (item: T) => string;
    /** Optional secondary line shown under each option. */
    toHint?: (item: T) => string;
    /** When set, an inline "create" row is offered for the typed term. */
    createLabel?: (term: string) => string;
    initialText?: string;
  }>();

  const emit = defineEmits<{
    select: [item: T];
    create: [term: string];
  }>();

  const text = ref<string>(props.initialText ?? "");
  const results = ref<T[]>([]) as Ref<T[]>;
  const open = ref(false);
  const loading = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(() => props.initialText, (value) => { text.value = value ?? ""; });

  const canCreate = computed(() => Boolean(props.createLabel) && text.value.trim().length > 0);
  const createText = computed(() =>
    props.createLabel && text.value.trim().length > 0 ? props.createLabel(text.value.trim()) : ""
  );

  function onInput(event: Event): void {
    text.value = (event.target as HTMLInputElement).value;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void runSearch(), 200);
  }

  async function runSearch(): Promise<void> {
    loading.value = true;
    open.value = true;
    try {
      results.value = await props.search(text.value);
    } catch {
      results.value = [];
    } finally {
      loading.value = false;
    }
  }

  function onFocus(): void {
    void runSearch();
  }

  function onBlur(): void {
    // Delay so a click on an option registers before the menu closes.
    window.setTimeout(() => { open.value = false; }, 120);
  }

  function pick(item: T): void {
    text.value = props.toLabel(item);
    open.value = false;
    emit("select", item);
  }

  function createNew(): void {
    open.value = false;
    emit("create", text.value.trim());
  }

  function onEnter(): void {
    const first = results.value[0];
    if (first) pick(first);
    else if (canCreate.value) createNew();
  }
</script>

<template>
  <div class="ea">
    <label v-if="label">{{ label }}</label>
    <div class="ea-field">
      <input
        :value="text"
        :placeholder="placeholder"
        autocomplete="off"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.escape="open = false"
        @keydown.enter.prevent="onEnter" />

      <div v-if="open" class="ea-menu">
        <button
          v-for="item in results"
          :key="item.id"
          type="button"
          class="ea-option"
          @mousedown.prevent="pick(item)">
          <span class="ea-option-label">{{ toLabel(item) }}</span>
          <span v-if="toHint && toHint(item)" class="ea-option-hint">{{ toHint(item) }}</span>
        </button>

        <div v-if="loading" class="ea-empty">Zoeken…</div>
        <div v-else-if="results.length === 0 && !canCreate" class="ea-empty">Geen resultaten</div>

        <button
          v-if="canCreate"
          type="button"
          class="ea-option ea-create"
          @mousedown.prevent="createNew">
          + {{ createText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ea {
  position: relative;
}

.ea-field {
  position: relative;
}

.ea-menu {
  position: absolute;
  z-index: 20;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 2px;
  background: #ffffff;
  border: 1px solid var(--panel-border);
  border-radius: 2px;
  box-shadow: var(--shadow);
  max-height: 240px;
  overflow-y: auto;
}

.ea-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  width: 100%;
  text-align: left;
  background: #ffffff;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  padding: 6px 8px;
  box-shadow: none;
  cursor: pointer;
}

.ea-option:hover {
  background: #eef3fb;
  color: inherit;
}

.ea-option-label {
  font-size: 12px;
}

.ea-option-hint {
  font-size: 11px;
  color: var(--muted);
}

.ea-create {
  color: #2e3fa1;
  font-weight: bold;
}

.ea-empty {
  padding: 6px 8px;
  font-size: 11px;
  color: var(--muted);
}
</style>
