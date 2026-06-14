export type NodeType = "Prikklok" | "Voertuig" | "Werf" | "Huis" | "Bedrijf";

export const NODE_TYPES: NodeType[] = ["Prikklok", "Voertuig", "Werf", "Huis", "Bedrijf"];

export const NODE_ICON_CLASSES: Record<NodeType, string> = {
  Prikklok: "fa-regular fa-clock",
  Voertuig: "fa-solid fa-car-side",
  Werf:     "fa-solid fa-person-digging",
  Huis:     "fa-solid fa-house",
  Bedrijf:  "fa-solid fa-building",
};

export const NODE_LABELS: Record<NodeType, string> = {
  Prikklok: "Prikklok",
  Voertuig: "Voertuig",
  Werf:     "Werf / klant",
  Huis:     "Thuis",
  Bedrijf:  "Depot / kantoor",
};

export type DesignerNode = {
  id: number;
  type: NodeType;
  x: number;
  y: number;
  label: string;
};

export type DesignerNote = {
  id: number;
  x: number;
  y: number;
  text: string;
};

export type SegmentCategory = {
  id: string;
  label: string;
  color: string;
};

export const SEGMENT_CATEGORIES: SegmentCategory[] = [
  { id: "werk",       label: "Werktijd",   color: "#2e8b57" },
  { id: "mobiliteit", label: "Mobiliteit", color: "#2f6db3" },
  { id: "prive",      label: "Privé",      color: "#98a0a8" },
];

export type UndoAction =
  | { type: "addNode"; id: number }
  | { type: "addNote"; id: number };
