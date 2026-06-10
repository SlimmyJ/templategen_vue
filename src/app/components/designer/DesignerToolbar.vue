<script setup lang="ts">
  import { ref } from "vue";
  import { NODE_TYPES, NODE_ICON_CLASSES } from "../../models/designerModels";
  import { useDesignerState } from "../../composables/useDesignerState";

  const {
    state,
    setGrid,
    setSegmentColor,
    commitColor,
    applyRecentColor,
    undo,
    clear,
  } = useDesignerState();

  const emit = defineEmits<{
    "add-note":    [];
    "export-png":  [];
    "export-json": [];
    "import-json": [file: File];
  }>();

  const importRef = ref<HTMLInputElement | null>(null);

  function onDragStart(e: DragEvent, type: string): void {
    e.dataTransfer?.setData("text/plain", type);
  }

  function onGridChange(e: Event): void {
    const v = Number((e.target as HTMLSelectElement).value);
    if (v) setGrid(v);
  }

  function onColorInput(e: Event): void {
    setSegmentColor((e.target as HTMLInputElement).value);
  }

  function onColorChange(e: Event): void {
    commitColor((e.target as HTMLInputElement).value);
  }

  function handleClear(): void {
    if (!confirm("Canvas leegmaken? Alle elementen worden verwijderd.")) return;
    clear();
  }

  function onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    emit("import-json", file);
    (e.target as HTMLInputElement).value = "";
  }
</script>

<template>
  <div class="designer-toolbar">

    <!-- Palette -->
    <div class="dt-group" title="Sleep een element naar het canvas">
      <button
        v-for="type in NODE_TYPES"
        :key="type"
        class="palette-btn"
        draggable="true"
        :title="type"
        @dragstart="onDragStart($event, type)">
        <i :class="NODE_ICON_CLASSES[type]"></i>
      </button>
    </div>

    <div class="dt-divider"></div>

    <!-- Canvas actions -->
    <div class="dt-group">
      <button class="dt-btn" title="Opmerking toevoegen" @click="$emit('add-note')">
        <i class="fa-solid fa-note-sticky"></i>
        <span class="dt-label">Nota</span>
      </button>
      <button class="dt-btn" title="Ongedaan maken (laatste toevoeging)" @click="undo">
        <i class="fa-solid fa-rotate-left"></i>
      </button>
      <button class="dt-btn dt-btn--danger" title="Canvas leegmaken" @click="handleClear">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <div class="dt-divider"></div>

    <!-- Grid -->
    <div class="dt-group">
      <select class="dt-select" :value="state.grid" title="Rastergrootte" @change="onGridChange">
        <option value="10">10px</option>
        <option value="20">20px</option>
        <option value="30">30px</option>
        <option value="40">40px</option>
      </select>
      <label class="dt-switch" title="Snappen aan raster">
        <input type="checkbox" v-model="state.snapEnabled" />
        <span>Snap</span>
      </label>
    </div>

    <div class="dt-divider"></div>

    <!-- Segment color -->
    <div class="dt-group">
      <div class="color-zone" :class="{ 'color-zone--active': !!state.selectedSegmentKey }">
        <input
          type="color"
          class="dt-color"
          :value="state.selectedColor"
          :disabled="!state.selectedSegmentKey"
          :title="state.selectedSegmentKey ? 'Segmentkleur wijzigen (Ctrl+C kopiëren, Ctrl+V plakken)' : 'Klik eerst op een segment'"
          @input="onColorInput"
          @change="onColorChange" />
        <span class="color-hint">{{ state.selectedSegmentKey ? "Segment" : "Klik segment" }}</span>
      </div>
      <button
        v-for="c in state.recentColors"
        :key="c"
        class="color-swatch"
        :style="{ background: c }"
        :title="c"
        @click="applyRecentColor(c)"></button>
    </div>

    <div class="dt-divider"></div>

    <!-- Export / Import -->
    <div class="dt-group">
      <button class="dt-btn" title="Exporteer als PNG" @click="$emit('export-png')">
        <i class="fa-solid fa-image"></i>
        <span class="dt-label">PNG</span>
      </button>
      <button class="dt-btn" title="Exporteer als JSON" @click="$emit('export-json')">
        <i class="fa-solid fa-file-export"></i>
        <span class="dt-label">Export</span>
      </button>
      <button class="dt-btn" title="Importeer JSON" @click="importRef?.click()">
        <i class="fa-solid fa-file-import"></i>
        <span class="dt-label">Import</span>
      </button>
      <input ref="importRef" type="file" accept="application/json" hidden @change="onFileSelected" />
    </div>

  </div>
</template>
