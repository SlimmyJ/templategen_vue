import { reactive, computed, watch } from "vue";
import type { DesignerNode, DesignerNote, NodeType, SegmentCategory } from "../models/designerModels";

const RECENT_KEY = "tt_recent_colors_v1";
const BOARD_KEY = "tt_designer_board_v1";

function toHex6(c: string): string {
  const s = String(c || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toLowerCase();
  return "#000000";
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? (arr as unknown[]).filter((v): v is string => typeof v === "string") : [];
  } catch { return []; }
}

function saveRecent(list: string[]): void {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 4))); } catch {}
}

type PersistedBoard = {
  title: string;
  nodes: DesignerNode[];
  notes: DesignerNote[];
  segments: Record<string, string>;
  labels: Record<string, string>;
  timelineY: number | null;
  grid: number;
  snapEnabled: boolean;
  nextNodeId: number;
  nextNoteId: number;
};

function loadBoard(): Partial<PersistedBoard> | null {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedBoard>) : null;
  } catch { return null; }
}

const saved = loadBoard();

const savedNodes = (saved?.nodes ?? []).map(n => ({ ...n, label: n.label ?? "" }));

const state = reactive({
  title:              saved?.title ?? "",
  nodes:              savedNodes as DesignerNode[],
  notes:              (saved?.notes ?? []) as DesignerNote[],
  segments:           (saved?.segments ?? {}) as Record<string, string>,
  labels:             (saved?.labels ?? {}) as Record<string, string>,
  timelineY:          (saved?.timelineY ?? null) as number | null,
  grid:               saved?.grid ?? 20,
  snapEnabled:        saved?.snapEnabled ?? true,
  selectedSegmentKey: null as string | null,
  selectedColor:      "#357bb7",
  recentColors:       loadRecent(),
  colorClipboard:     null as string | null,
  nextNodeId:         saved?.nextNodeId ?? 1,
  nextNoteId:         saved?.nextNoteId ?? 1,
});

type HistorySnapshot = string;
const history = reactive({ past: [] as HistorySnapshot[], future: [] as HistorySnapshot[] });
let pending: HistorySnapshot | null = null;
const HISTORY_LIMIT = 100;

function snapshot(): HistorySnapshot {
  return JSON.stringify({
    title:      state.title,
    nodes:      state.nodes,
    notes:      state.notes,
    segments:   state.segments,
    labels:     state.labels,
    timelineY:  state.timelineY,
    grid:       state.grid,
    nextNodeId: state.nextNodeId,
    nextNoteId: state.nextNoteId,
  });
}

function restoreSnapshot(snap: HistorySnapshot): void {
  const s = JSON.parse(snap) as {
    title?: string;
    nodes?: DesignerNode[];
    notes?: DesignerNote[];
    segments?: Record<string, string>;
    labels?: Record<string, string>;
    timelineY?: number | null;
    grid?: number;
    nextNodeId?: number;
    nextNoteId?: number;
  };
  state.title              = s.title ?? "";
  state.nodes              = s.nodes ?? [];
  state.notes              = s.notes ?? [];
  state.segments           = s.segments ?? {};
  state.labels             = s.labels ?? {};
  state.timelineY          = s.timelineY ?? null;
  state.grid               = s.grid ?? 20;
  state.nextNodeId         = s.nextNodeId ?? 1;
  state.nextNoteId         = s.nextNoteId ?? 1;
  state.selectedSegmentKey = null;
}

function beginHistory(): void {
  pending = snapshot();
}

function commitHistory(): void {
  if (pending !== null && pending !== snapshot()) {
    history.past.push(pending);
    if (history.past.length > HISTORY_LIMIT) history.past.shift();
    history.future = [];
  }
  pending = null;
}

watch(
  () => [state.title, state.nodes, state.notes, state.segments, state.labels, state.timelineY, state.grid, state.snapEnabled, state.nextNodeId, state.nextNoteId],
  () => {
    const board: PersistedBoard = {
      title:       state.title,
      nodes:       state.nodes,
      notes:       state.notes,
      segments:    state.segments,
      labels:      state.labels,
      timelineY:   state.timelineY,
      grid:        state.grid,
      snapEnabled: state.snapEnabled,
      nextNodeId:  state.nextNodeId,
      nextNoteId:  state.nextNoteId,
    };
    try { localStorage.setItem(BOARD_KEY, JSON.stringify(board)); } catch {}
  },
  { deep: true }
);

function snapVal(v: number): number {
  return state.snapEnabled ? Math.round(v / state.grid) * state.grid : v;
}

const sortedNodes = computed(() =>
  [...state.nodes].sort((a, b) => a.x - b.x)
);

const segmentPairs = computed(() => {
  const nodes = sortedNodes.value;
  const pairs: { key: string; a: DesignerNode; b: DesignerNode; color: string; label: string }[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i] as DesignerNode;
    const b = nodes[i + 1] as DesignerNode;
    const key = `${a.id}->${b.id}`;
    pairs.push({ key, a, b, color: toHex6(state.segments[key] || "#000000"), label: state.labels[key] || "" });
  }
  return pairs;
});

const autoTimelineY = computed(() => {
  const nodes = sortedNodes.value;
  if (nodes.length < 2) return 260;
  const first = nodes[0] as DesignerNode;
  const last  = nodes[nodes.length - 1] as DesignerNode;
  return snapVal(((first.y + 27) + (last.y + 27)) / 2);
});

const effectiveTimelineY = computed(() => state.timelineY ?? autoTimelineY.value);
const showTimeline       = computed(() => sortedNodes.value.length >= 2);

const legend = computed(() => {
  const seen = new Map<string, { color: string; label: string }>();
  for (const seg of segmentPairs.value) {
    if (!seg.label) continue;
    const key = `${seg.color}|${seg.label}`;
    if (!seen.has(key)) seen.set(key, { color: seg.color, label: seg.label });
  }
  return [...seen.values()];
});

function addNode(type: NodeType, x: number, y: number): DesignerNode {
  beginHistory();
  const node: DesignerNode = { id: state.nextNodeId++, type, x, y, label: "" };
  state.nodes.push(node);
  commitHistory();
  return node;
}

function moveNode(id: number, x: number, y: number): void {
  const node = state.nodes.find(n => n.id === id);
  if (node) { node.x = x; node.y = y; }
}

function setNodeLabel(id: number, text: string): void {
  const node = state.nodes.find(n => n.id === id);
  if (node) node.label = text;
}

function forgetSegmentsTouching(id: number): void {
  for (const key of Object.keys(state.segments)) {
    const [l, r] = key.split("->").map(Number);
    if (l === id || r === id) delete state.segments[key];
  }
  for (const key of Object.keys(state.labels)) {
    const [l, r] = key.split("->").map(Number);
    if (l === id || r === id) delete state.labels[key];
  }
}

function removeNode(id: number): void {
  beginHistory();
  state.nodes = state.nodes.filter(n => n.id !== id);
  forgetSegmentsTouching(id);
  if (state.selectedSegmentKey) {
    const [l, r] = state.selectedSegmentKey.split("->").map(Number);
    if (l === id || r === id) state.selectedSegmentKey = null;
  }
  if (state.nodes.length < 2) state.timelineY = null;
  commitHistory();
}

function addNote(x: number, y: number): DesignerNote {
  beginHistory();
  const note: DesignerNote = { id: state.nextNoteId++, x, y, text: "Opmerking…" };
  state.notes.push(note);
  commitHistory();
  return note;
}

function moveNote(id: number, x: number, y: number): void {
  const note = state.notes.find(n => n.id === id);
  if (note) { note.x = x; note.y = y; }
}

function updateNoteText(id: number, text: string): void {
  const note = state.notes.find(n => n.id === id);
  if (note) note.text = text;
}

function removeNote(id: number): void {
  beginHistory();
  state.notes = state.notes.filter(n => n.id !== id);
  commitHistory();
}

function selectSegment(key: string | null): void {
  if (key === null || state.selectedSegmentKey === key) {
    state.selectedSegmentKey = null;
  } else {
    state.selectedSegmentKey = key;
    if (state.segments[key]) state.selectedColor = toHex6(state.segments[key]);
  }
}

function setSegmentColor(color: string): void {
  if (!state.selectedSegmentKey) return;
  state.segments[state.selectedSegmentKey] = color;
  state.selectedColor = color;
}

function setSegmentLabel(text: string): void {
  if (!state.selectedSegmentKey) return;
  if (text.trim()) state.labels[state.selectedSegmentKey] = text;
  else delete state.labels[state.selectedSegmentKey];
}

function clearSegment(): void {
  const key = state.selectedSegmentKey;
  if (!key) return;
  beginHistory();
  delete state.segments[key];
  delete state.labels[key];
  commitHistory();
}

function applyCategory(cat: SegmentCategory): void {
  if (!state.selectedSegmentKey) return;
  beginHistory();
  state.segments[state.selectedSegmentKey] = cat.color;
  state.labels[state.selectedSegmentKey] = cat.label;
  state.selectedColor = cat.color;
  commitColor(cat.color);
  commitHistory();
}

function setTitle(text: string): void {
  state.title = text;
}

function commitColor(color: string): void {
  const norm = toHex6(color);
  const list = [norm, ...state.recentColors.filter(c => c !== norm)].slice(0, 4);
  saveRecent(list);
  state.recentColors = list;
}

function applyRecentColor(color: string): void {
  beginHistory();
  state.selectedColor = color;
  if (state.selectedSegmentKey) state.segments[state.selectedSegmentKey] = color;
  commitColor(color);
  commitHistory();
}

function copySegmentColor(): void {
  if (!state.selectedSegmentKey) return;
  const c = state.segments[state.selectedSegmentKey];
  if (c) state.colorClipboard = toHex6(c);
}

function pasteSegmentColor(): void {
  if (!state.selectedSegmentKey || !state.colorClipboard) return;
  beginHistory();
  state.segments[state.selectedSegmentKey] = state.colorClipboard;
  state.selectedColor = state.colorClipboard;
  commitColor(state.colorClipboard);
  commitHistory();
}

function setTimelineY(y: number | null): void {
  state.timelineY = y;
}

function setGrid(v: number): void {
  beginHistory();
  state.grid = v;
  commitHistory();
}

function undo(): void {
  pending = null;
  const prev = history.past.pop();
  if (prev === undefined) return;
  history.future.push(snapshot());
  restoreSnapshot(prev);
}

function redo(): void {
  pending = null;
  const next = history.future.pop();
  if (next === undefined) return;
  history.past.push(snapshot());
  restoreSnapshot(next);
}

const canUndo = computed(() => history.past.length > 0);
const canRedo = computed(() => history.future.length > 0);

function clear(): void {
  beginHistory();
  state.title              = "";
  state.nodes              = [];
  state.notes              = [];
  state.segments           = {};
  state.labels             = {};
  state.timelineY          = null;
  state.selectedSegmentKey = null;
  state.nextNodeId         = 1;
  state.nextNoteId         = 1;
  commitHistory();
}

function saveAsJson(boardW: number, boardH: number): Record<string, unknown> {
  const g  = state.grid;
  const tY = state.timelineY;

  const nodeList = state.nodes.map((n, idx) => {
    const fx       = boardW ? n.x / boardW : 0;
    const dy       = tY != null ? n.y - tY : null;
    const dyUnits  = dy != null ? Math.round(dy / g) : null;
    return { id: n.id, type: n.type, label: n.label, x: n.x, y: n.y, fx, dy, dyUnits, order: idx, col: 0 };
  });

  const key = (v: number) => Math.round((v * 100_000) || 0);
  const fxKeys   = [...new Set(nodeList.map(n => key(n.fx)))].sort((a, b) => a - b);
  const columnsFx = fxKeys.map(k => k / 100_000);
  nodeList.forEach(n => { n.col = fxKeys.indexOf(key(n.fx)); });

  return {
    version:   6,
    title:     state.title,
    grid:      g,
    timelineY: tY,
    boardSize: { w: boardW, h: boardH },
    columnsFx,
    nodes:     nodeList,
    segments:  { ...state.segments },
    labels:    { ...state.labels },
  };
}

function loadFromJson(data: unknown, boardW: number, boardH: number): void {
  if (typeof data !== "object" || data === null) return;
  const s = data as Record<string, unknown>;

  clear();

  if (typeof s.title === "string") state.title = s.title;
  if (typeof s.grid === "number") state.grid = s.grid;
  const g = state.grid;
  state.timelineY = typeof s.timelineY === "number" ? s.timelineY : null;

  if (s.segments && typeof s.segments === "object") {
    state.segments = { ...(s.segments as Record<string, string>) };
  }
  if (s.labels && typeof s.labels === "object") {
    state.labels = { ...(s.labels as Record<string, string>) };
  }

  const bs = s.boardSize as { w?: number; h?: number } | undefined;
  const scaleX = bs?.w ? boardW / bs.w : 1;
  const scaleY = bs?.h ? boardH / bs.h : 1;
  const cols   = Array.isArray(s.columnsFx) ? (s.columnsFx as number[]) : null;

  const nodeList = Array.isArray(s.nodes) ? [...(s.nodes as unknown[])] : [];
  nodeList.sort((a, b) => {
    const ao = (a as Record<string, number>).order ?? 0;
    const bo = (b as Record<string, number>).order ?? 0;
    return ao - bo;
  });

  let maxId = 0;
  for (const nd of nodeList) {
    if (typeof nd !== "object" || nd === null) continue;
    const n = nd as Record<string, unknown>;

    let x: number;
    if (cols && typeof n.col === "number" && n.col >= 0 && n.col < cols.length && cols[n.col] != null) {
      x = Math.round((cols[n.col] as number) * boardW);
    } else if (typeof n.fx === "number" && isFinite(n.fx)) {
      x = Math.round((n.fx as number) * boardW);
    } else {
      x = Math.round(((n.x as number) || 0) * scaleX);
    }

    const baseY = state.timelineY ?? 0;
    let y: number;
    if (typeof n.dyUnits === "number" && isFinite(n.dyUnits) && state.timelineY != null) {
      y = baseY + (n.dyUnits as number) * g;
    } else if (typeof n.dy === "number" && isFinite(n.dy) && state.timelineY != null) {
      y = Math.round(baseY + (n.dy as number) * scaleY);
    } else {
      y = Math.round(((n.y as number) || 0) * scaleY);
    }

    const id = typeof n.id === "number" ? n.id : state.nextNodeId;
    maxId = Math.max(maxId, id);
    state.nodes.push({ id, type: n.type as NodeType, x, y, label: typeof n.label === "string" ? n.label : "" });
  }
  state.nextNodeId = maxId + 1;
}

export function useDesignerState() {
  return {
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
    setSegmentColor,
    setSegmentLabel,
    clearSegment,
    applyCategory,
    setTitle,
    commitColor,
    applyRecentColor,
    copySegmentColor,
    pasteSegmentColor,
    setTimelineY,
    setGrid,
    beginHistory,
    commitHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    saveAsJson,
    loadFromJson,
  };
}
