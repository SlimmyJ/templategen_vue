<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { useDesignerState } from "../../composables/useDesignerState";
  import { NODE_ICON_CLASSES, NODE_LABELS } from "../../models/designerModels";
  import type { NodeType } from "../../models/designerModels";

  const {
    state,
    sortedNodes,
    segmentPairs,
    effectiveTimelineY,
    showTimeline,
    legend,
    snapVal,
    addNode,
    moveNode,
    setNodeLabel,
    removeNode,
    addNote,
    moveNote,
    updateNoteText,
    removeNote,
    selectSegment,
    setTitle,
    setTimelineY,
    beginHistory,
    commitHistory,
    saveAsJson,
    loadFromJson,
  } = useDesignerState();

  const boardRef  = ref<HTMLDivElement | null>(null);
  const boardW    = ref(800);
  const boardH    = ref(520);
  const exporting = ref(false);
  const dragOver  = ref(false);

  const gridClass = computed(() =>
    exporting.value ? "" : `grid-${state.grid}`
  );

  type DS =
    | { kind: "node";     id: number; sx: number; sy: number; cx: number; cy: number }
    | { kind: "baseline";            sy: number;              cx: number; cy: number }
    | { kind: "note";     id: number; sx: number; sy: number; cx: number; cy: number };

  const drag = ref<(DS & { recorded?: boolean }) | null>(null);

  function startNodeDrag(e: PointerEvent, nodeId: number): void {
    if (e.button !== 0) return;
    e.stopPropagation();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    drag.value = { kind: "node", id: nodeId, sx: node.x, sy: node.y, cx: e.clientX, cy: e.clientY };
    document.body.style.cursor = "grabbing";
  }

  function startBaselineDrag(e: PointerEvent): void {
    if (e.button !== 0) return;
    drag.value = { kind: "baseline", sy: effectiveTimelineY.value, cx: e.clientX, cy: e.clientY };
    document.body.style.cursor = "ns-resize";
  }

  function startNoteDrag(e: PointerEvent, noteId: number): void {
    if (e.button !== 0) return;
    e.stopPropagation();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return;
    drag.value = { kind: "note", id: noteId, sx: note.x, sy: note.y, cx: e.clientX, cy: e.clientY };
    document.body.style.cursor = "grabbing";
  }

  function onPointerMove(e: PointerEvent): void {
    const d = drag.value;
    if (!d) return;

    if (!d.recorded) {
      beginHistory();
      d.recorded = true;
    }

    const dx = e.clientX - d.cx;
    const dy = e.clientY - d.cy;

    if (d.kind === "node") {
      let nx = snapVal(d.sx + dx);
      let ny = snapVal(d.sy + dy);
      nx = Math.max(0, Math.min(boardW.value - 54, nx));
      ny = Math.max(0, Math.min(boardH.value - 54, ny));
      moveNode(d.id, nx, ny);

    } else if (d.kind === "baseline") {
      let ny = d.sy + dy;
      if (state.snapEnabled) ny = snapVal(ny);
      ny = Math.max(20, Math.min(boardH.value - 20, ny));
      setTimelineY(ny);

    } else if (d.kind === "note") {
      let nx = snapVal(d.sx + dx);
      let ny = snapVal(d.sy + dy);
      nx = Math.max(0, Math.min(boardW.value - 40, nx));
      ny = Math.max(0, Math.min(boardH.value - 30, ny));
      moveNote(d.id, nx, ny);
    }
  }

  function onPointerUp(): void {
    if (drag.value) commitHistory();
    drag.value = null;
    document.body.style.cursor = "";
  }

  function onDragLeave(e: DragEvent): void {
    const related = e.relatedTarget as Node | null;
    if (!boardRef.value || !related || !boardRef.value.contains(related)) {
      dragOver.value = false;
    }
  }

  function onDrop(e: DragEvent): void {
    e.preventDefault();
    dragOver.value = false;
    const type = e.dataTransfer?.getData("text/plain") as NodeType | undefined;
    if (!type) return;
    const rect = boardRef.value!.getBoundingClientRect();
    let x = snapVal(e.clientX - rect.left - 27);
    const first = state.nodes[0];
    let y = first ? first.y : snapVal(e.clientY - rect.top - 27);
    x = Math.max(0, Math.min(boardW.value - 54, x));
    y = Math.max(0, Math.min(boardH.value - 54, y));
    addNode(type, x, y);
  }

  const baselineX1 = computed(() => {
    const nodes = sortedNodes.value;
    return nodes.length > 0 ? (nodes[0] as { x: number }).x + 27 : 0;
  });
  const baselineX2 = computed(() => {
    const nodes = sortedNodes.value;
    return nodes.length > 0 ? (nodes[nodes.length - 1] as { x: number }).x + 27 : 0;
  });

  function doAddNote(): void {
    const x = snapVal((boardW.value - 200) / 2);
    const y = snapVal(effectiveTimelineY.value + 30);
    addNote(x, y);
  }

  async function exportPng(): Promise<void> {
    if (!boardRef.value) return;
    const h2c = (window as unknown as Record<string, unknown>).html2canvas as
      ((el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement>) | undefined;
    if (!h2c) { alert("html2canvas niet beschikbaar."); return; }

    exporting.value = true;
    await new Promise<void>(r => setTimeout(r, 80));
    try {
      const canvas = await h2c(boardRef.value, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        removeContainer: true,
      });
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const a  = document.createElement("a");
      a.href     = canvas.toDataURL("image/png");
      a.download = `timeline-${ts}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Exporteren mislukt.");
    } finally {
      exporting.value = false;
    }
  }

  function exportJson(): void {
    const data = saveAsJson(boardW.value, boardH.value);
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const a  = document.createElement("a");
    a.href     = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    a.download = `timeline-${ts}.json`;
    a.click();
  }

  function importJson(file: File): void {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        loadFromJson(JSON.parse(e.target?.result as string), boardW.value, boardH.value);
      } catch {
        alert("Ongeldig JSON bestand.");
      }
    };
    reader.readAsText(file);
  }

  defineExpose({ doAddNote, exportPng, exportJson, importJson });

  let ro: ResizeObserver | null = null;

  onMounted(() => {
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup",   onPointerUp);

    ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        boardW.value = entry.contentRect.width;
        boardH.value = entry.contentRect.height;
      }
    });
    if (boardRef.value) {
      ro.observe(boardRef.value);
      boardW.value = boardRef.value.clientWidth;
      boardH.value = boardRef.value.clientHeight;
    }
  });

  onUnmounted(() => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup",   onPointerUp);
    ro?.disconnect();
  });
</script>

<template>
  <div
    ref="boardRef"
    class="designer-board"
    :class="[gridClass, { 'drag-over': dragOver }]"
    @dragover.prevent="dragOver = true"
    @dragleave="onDragLeave"
    @drop="onDrop">

    <input
      class="board-title"
      :value="state.title"
      :style="{ visibility: exporting && !state.title ? 'hidden' : 'visible' }"
      placeholder="Titel van het schema…"
      @pointerdown.stop
      @focus="beginHistory()"
      @blur="commitHistory()"
      @input="setTitle(($event.target as HTMLInputElement).value)" />

    <div v-if="legend.length" class="board-legend">
      <div v-for="item in legend" :key="item.color + item.label" class="legend-item">
        <span class="legend-swatch" :style="{ background: item.color }"></span>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <svg v-if="showTimeline" class="board-overlay">

      <line
        v-for="seg in segmentPairs"
        v-show="state.selectedSegmentKey === seg.key"
        :key="`halo-${seg.key}`"
        :x1="seg.a.x + 27" :y1="effectiveTimelineY"
        :x2="seg.b.x + 27" :y2="effectiveTimelineY"
        class="seg-halo" />

      <line
        :x1="baselineX1" :y1="effectiveTimelineY"
        :x2="baselineX2" :y2="effectiveTimelineY"
        stroke="#000" stroke-width="4" stroke-linecap="round" />

      <line
        :x1="baselineX1" :y1="effectiveTimelineY"
        :x2="baselineX2" :y2="effectiveTimelineY"
        stroke="transparent" stroke-width="18" stroke-linecap="round"
        style="cursor: ns-resize"
        @pointerdown="startBaselineDrag" />

      <line
        v-for="seg in segmentPairs"
        :key="`seg-${seg.key}`"
        :x1="seg.a.x + 27" :y1="effectiveTimelineY"
        :x2="seg.b.x + 27" :y2="effectiveTimelineY"
        :stroke="seg.color"
        stroke-width="8" stroke-linecap="round"
        class="timeline-segment"
        @click="selectSegment(seg.key)" />

      <text
        v-for="seg in segmentPairs"
        v-show="seg.label"
        :key="`label-${seg.key}`"
        :x="(seg.a.x + seg.b.x) / 2 + 27"
        :y="effectiveTimelineY + 24"
        text-anchor="middle"
        class="seg-label"
        @click="selectSegment(seg.key)">{{ seg.label }}</text>

      <line
        v-for="node in sortedNodes"
        :key="`tick-${node.id}`"
        :x1="node.x + 27" :y1="effectiveTimelineY - 14"
        :x2="node.x + 27" :y2="effectiveTimelineY + 14"
        stroke="#000" stroke-width="3" stroke-linecap="round" />

    </svg>

    <div
      v-for="node in state.nodes"
      :key="node.id"
      class="d-node"
      :style="{ left: node.x + 'px', top: node.y + 'px' }"
      @pointerdown="startNodeDrag($event, node.id)">
      <input
        class="node-label"
        :value="node.label"
        :style="{ visibility: exporting && !node.label ? 'hidden' : 'visible' }"
        :placeholder="NODE_LABELS[node.type]"
        @pointerdown.stop
        @focus="beginHistory()"
        @blur="commitHistory()"
        @input="setNodeLabel(node.id, ($event.target as HTMLInputElement).value)" />
      <i :class="NODE_ICON_CLASSES[node.type]"></i>
      <button class="node-delete" title="Verwijder" @pointerdown.stop @click.stop="removeNode(node.id)">×</button>
    </div>

    <div
      v-for="note in state.notes"
      :key="note.id"
      class="d-note"
      :style="{ left: note.x + 'px', top: note.y + 'px' }">
      <div class="note-handle" @pointerdown="startNoteDrag($event, note.id)">
        <i class="fa-solid fa-grip-lines"></i>
        <button class="note-delete" title="Verwijder nota" @pointerdown.stop @click.stop="removeNote(note.id)">×</button>
      </div>
      <textarea
        class="note-body"
        :value="note.text"
        rows="2"
        @focus="beginHistory()"
        @blur="commitHistory()"
        @input="updateNoteText(note.id, ($event.target as HTMLTextAreaElement).value)" />
    </div>

    <div v-if="state.nodes.length === 0" class="board-hint">
      Sleep een element van de werkbalk naar het canvas
    </div>

  </div>
</template>
