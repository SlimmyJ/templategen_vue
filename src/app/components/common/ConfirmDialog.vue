<script setup lang="ts">
  import { onMounted, onUnmounted } from "vue";
  import { useConfirm } from "../../composables/useConfirm";

  const { state, respond } = useConfirm();

  function onKeyDown(e: KeyboardEvent): void {
    if (!state.open) return;
    if (e.key === "Escape") { e.preventDefault(); respond(false); }
    else if (e.key === "Enter") { e.preventDefault(); respond(true); }
  }

  onMounted(() => window.addEventListener("keydown", onKeyDown));
  onUnmounted(() => window.removeEventListener("keydown", onKeyDown));
</script>

<template>
  <div v-if="state.open" class="confirm-overlay" @click.self="respond(false)">
    <div class="confirm-box" role="dialog" aria-modal="true">
      <p class="confirm-message">{{ state.message }}</p>
      <div class="confirm-actions">
        <button type="button" @click="respond(false)">{{ state.cancelLabel }}</button>
        <button
          type="button"
          class="confirm-ok"
          :class="{ 'confirm-ok--danger': state.danger }"
          @click="respond(true)">
          {{ state.confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.confirm-box {
  width: min(92vw, 380px);
  padding: 18px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.confirm-message {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirm-actions button {
  padding: 7px 14px;
}

.confirm-ok--danger {
  background: #c20e1a;
  border-color: #a00b15;
  color: #fff;
}

.confirm-ok--danger:hover {
  background: #a00b15;
  color: #fff;
}
</style>
