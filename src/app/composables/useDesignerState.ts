import { reactive, computed } from "vue";
import type { DesignerNode, DesignerNote, NodeType, UndoAction } from "../models/designerModels";

const RECENT_KEY = "tt_recent_colors_v1";

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
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 4))); } catch { /* ignore */ }
}

// Module-level singleton — persists across tab switches
const state = reactive({
  nodes:              [] as DesignerNode[],
  notes:              [] as DesignerNote[],
  segments:           {} as Record<string, string>,
  timelineY:          null as number | null,
  grid:               20,
  snapEnabled:        true,
  selectedSegmentKey: null as string | null,
  selectedColor:      "#357bb7",
  recentColors:       loadRecent(),
  colorClipboard:     null as string | null,
  nextNodeId:         1,
  nextNoteId:         1,
  undoStack:          [] as UndoAction[],
});

function snapVal(v: number): number {
  return state.snapEnabled ? Math.round(v / state.grid) * state.grid : v;
}

const sortedNodes = computed(() =>
  [...state.nodes].sort((a, b) => a.x - b.x)
);

const segmentPairs = computed(() => {
  const nodes = sortedNodes.value;
  const pairs: { key: string; a: DesignerNode; b: DesignerNode; color: string }[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i] as DesignerNode;
    const b = nodes[i + 1] as DesignerNode;
    const key = `${a.id}->${b.id}`;
    pairs.push({ key, a, b, color: toHex6(state.segments[key] || "#000000") });
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

// ── Node operations ────────────────────────────────────────────────────────────

function addNode(type: NodeType, x: number, y: number): DesignerNode {
  const node: DesignerNode = { id: state.nextNodeId++, type, x, y };
  state.nodes.push(node);
  state.undoStack.push({ type: "addNode", id: node.id });
  return node;
}

function moveNode(id: number, x: number, y: number): void {
  const node = state.nodes.find(n => n.id === id);
  if (node) { node.x = x; node.y = y; }
}

function removeNode(id: number): void {
  state.nodes = state.nodes.filter(n => n.id !== id);
  for (const key of Object.keys(state.segments)) {
    const [l, r] = key.split("->").map(Number);
    if (l === id || r === id) delete state.segments[key];
  }
  if (state.selectedSegmentKey) {
    const [l, r] = state.selectedSegmentKey.split("->").map(Number);
    if (l === id || r === id) state.selectedSegmentKey = null;
  }
  if (state.nodes.length < 2) state.timelineY = null;
}

// ── Note operations ────────────────────────────────────────────────────────────

function addNote(x: number, y: number): DesignerNote {
  const note: DesignerNote = { id: state.nextNoteId++, x, y, text: "Opmerking…" };
  state.notes.push(note);
  state.undoStack.push({ type: "addNote", id: note.id });
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
  state.notes = state.notes.filter(n => n.id !== id);
}

// ── Segment / color ────────────────────────────────────────────────────────────

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

function commitColor(color: string): void {
  const norm = toHex6(color);
  const list = [norm, ...state.recentColors.filter(c => c !== norm)].slice(0, 4);
  saveRecent(list);
  state.recentColors = list;
}

function applyRecentColor(color: string): void {
  state.selectedColor = color;
  if (state.selectedSegmentKey) state.segments[state.selectedSegmentKey] = color;
  commitColor(color);
}

function copySegmentColor(): void {
  if (!state.selectedSegmentKey) return;
  const c = state.segments[state.selectedSegmentKey];
  if (c) state.colorClipboard = toHex6(c);
}

function pasteSegmentColor(): void {
  if (!state.selectedSegmentKey || !state.colorClipboard) return;
  state.segments[state.selectedSegmentKey] = state.colorClipboard;
  state.selectedColor = state.colorClipboard;
  commitColor(state.colorClipboard);
}

// ── Timeline ───────────────────────────────────────────────────────────────────

function setTimelineY(y: number | null): void {
  state.timelineY = y;
}

function setGrid(v: number): void {
  state.grid = v;
}

// ── History ────────────────────────────────────────────────────────────────────

function undo(): void {
  for (;;) {
    const action = state.undoStack.pop();
    if (!action) return;
    if (action.type === "addNode" && state.nodes.some(n => n.id === action.id)) {
      removeNode(action.id);
      return;
    }
    if (action.type === "addNote" && state.notes.some(n => n.id === action.id)) {
      state.notes = state.notes.filter(n => n.id !== action.id);
      return;
    }
  }
}

function clear(): void {
  state.nodes              = [];
  state.notes              = [];
  state.segments           = {};
  state.timelineY          = null;
  state.selectedSegmentKey = null;
  state.undoStack          = [];
  state.nextNodeId         = 1;
  state.nextNoteId         = 1;
}

// ── Serialization ──────────────────────────────────────────────────────────────

function saveAsJson(boardW: number, boardH: number): Record<string, unknown> {
  const g  = state.grid;
  const tY = state.timelineY;

  const nodeList = state.nodes.map((n, idx) => {
    const fx       = boardW ? n.x / boardW : 0;
    const dy       = tY != null ? n.y - tY : null;
    const dyUnits  = dy != null ? Math.round(dy / g) : null;
    return { id: n.id, type: n.type, x: n.x, y: n.y, fx, dy, dyUnits, order: idx, col: 0 };
  });

  const key = (v: number) => Math.round((v * 100_000) || 0);
  const fxKeys   = [...new Set(nodeList.map(n => key(n.fx)))].sort((a, b) => a - b);
  const columnsFx = fxKeys.map(k => k / 100_000);
  nodeList.forEach(n => { n.col = fxKeys.indexOf(key(n.fx)); });

  return {
    version:   5,
    grid:      g,
    timelineY: tY,
    boardSize: { w: boardW, h: boardH },
    columnsFx,
    nodes:     nodeList,
    segments:  { ...state.segments },
  };
}

function loadFromJson(data: unknown, boardW: number, boardH: number): void {
  if (typeof data !== "object" || data === null) return;
  const s = data as Record<string, unknown>;

  clear();

  if (typeof s.grid === "number") state.grid = s.grid;
  const g = state.grid;
  state.timelineY = typeof s.timelineY === "number" ? s.timelineY : null;

  if (s.segments && typeof s.segments === "object") {
    state.segments = { ...(s.segments as Record<string, string>) };
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
    state.nodes.push({ id, type: n.type as NodeType, x, y });
  }
  state.nextNodeId = maxId + 1;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function useDesignerState() {
  return {
    state,
    sortedNodes,
    segmentPairs,
    effectiveTimelineY,
    showTimeline,
    snapVal,
    addNode,
    moveNode,
    removeNode,
    addNote,
    moveNote,
    updateNoteText,
    removeNote,
    selectSegment,
    setSegmentColor,
    commitColor,
    applyRecentColor,
    copySegmentColor,
    pasteSegmentColor,
    setTimelineY,
    setGrid,
    undo,
    clear,
    saveAsJson,
    loadFromJson,
  };
}
