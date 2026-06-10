<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import DesignerToolbar from "./DesignerToolbar.vue";
  import DesignerBoard   from "./DesignerBoard.vue";
  import { useDesignerState } from "../../composables/useDesignerState";

  const { state, copySegmentColor, pasteSegmentColor, selectSegment } = useDesignerState();
  const boardRef = ref<InstanceType<typeof DesignerBoard> | null>(null);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────────

  function onKeyDown(e: KeyboardEvent): void {
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    const editing = tag === "input" || tag === "textarea" || tag === "select"
      || (document.activeElement as HTMLElement | null)?.isContentEditable;
    if (editing) return;

    if (e.ctrlKey && e.key.toLowerCase() === "c") { copySegmentColor(); return; }
    if (e.ctrlKey && e.key.toLowerCase() === "v") { pasteSegmentColor(); return; }
    if (e.key === "Escape")  { selectSegment(null); return; }
    if (e.key === "z" && e.ctrlKey) { e.preventDefault(); /* undo handled by toolbar */ }
  }

  onMounted(()  => window.addEventListener("keydown", onKeyDown));
  onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

  // ── Segment color status hint ─────────────────────────────────────────────────

  function getStatusText(): string {
    if (!state.selectedSegmentKey) return "";
    const c = state.segments[state.selectedSegmentKey];
    return c ? `Geselecteerd: ${c}` : "Geselecteerd — kies een kleur";
  }
</script>

<template>
  <div class="designer-view">
    <DesignerToolbar
      @add-note="boardRef?.doAddNote()"
      @export-png="boardRef?.exportPng()"
      @export-json="boardRef?.exportJson()"
      @import-json="boardRef?.importJson($event)" />

    <div v-if="state.selectedSegmentKey" class="segment-status">
      {{ getStatusText() }}
      <span class="segment-status-hint">Ctrl+C kopiëren · Ctrl+V plakken · Esc deselecteren</span>
    </div>

    <DesignerBoard ref="boardRef" />
  </div>
</template>

<style scoped>
.designer-view {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.segment-status {
  font-size: 11px;
  color: #357bb7;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 0;
}

.segment-status-hint {
  color: #888;
}
</style>
