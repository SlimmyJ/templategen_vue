<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import DesignerToolbar from "./DesignerToolbar.vue";
  import DesignerBoard   from "./DesignerBoard.vue";
  import { useDesignerState } from "../../composables/useDesignerState";

  const { state, showTimeline, copySegmentColor, pasteSegmentColor, selectSegment, undo } = useDesignerState();
  const boardRef = ref<InstanceType<typeof DesignerBoard> | null>(null);

  function onKeyDown(e: KeyboardEvent): void {
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    const editing = tag === "input" || tag === "textarea" || tag === "select"
      || (document.activeElement as HTMLElement | null)?.isContentEditable;
    if (editing) return;

    if (e.ctrlKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
    if (e.ctrlKey && e.key.toLowerCase() === "c") { copySegmentColor(); return; }
    if (e.ctrlKey && e.key.toLowerCase() === "v") { pasteSegmentColor(); return; }
    if (e.key === "Escape") { selectSegment(null); return; }
  }

  onMounted(()  => window.addEventListener("keydown", onKeyDown));
  onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

  function getStatusText(): string {
    if (!state.selectedSegmentKey) return "";
    const color = state.segments[state.selectedSegmentKey];
    const label = state.labels[state.selectedSegmentKey];
    if (label) return `Segment “${label}”${color ? ` · ${color}` : ""}`;
    return color ? `Segment · ${color} — geef het een label` : "Segment geselecteerd — kies kleur en label";
  }
</script>

<template>
  <div class="card">
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
    <div v-else-if="showTimeline" class="segment-status segment-status--idle">
      Klik op een lijnstuk tussen twee elementen om het in te kleuren en te benoemen.
    </div>

    <DesignerBoard ref="boardRef" />
    </div>
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

.segment-status--idle {
  color: #888;
}

.segment-status-hint {
  color: #888;
}
</style>
