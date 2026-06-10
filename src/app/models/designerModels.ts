export type NodeType = "Prikklok" | "Voertuig" | "Werf" | "Huis" | "Bedrijf";

export const NODE_TYPES: NodeType[] = ["Prikklok", "Voertuig", "Werf", "Huis", "Bedrijf"];

export const NODE_ICON_CLASSES: Record<NodeType, string> = {
  Prikklok: "fa-regular fa-clock",
  Voertuig: "fa-solid fa-car-side",
  Werf:     "fa-solid fa-person-digging",
  Huis:     "fa-solid fa-house",
  Bedrijf:  "fa-solid fa-building",
};

export type DesignerNode = {
  id: number;
  type: NodeType;
  x: number;
  y: number;
};

export type DesignerNote = {
  id: number;
  x: number;
  y: number;
  text: string;
};

export type UndoAction =
  | { type: "addNode"; id: number }
  | { type: "addNote"; id: number };
