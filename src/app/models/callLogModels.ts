import type { Identifiable } from "../repositories/interfaces/ICollectionRepository";

export type CallDirection = "outbound" | "inbound";

export type CallOutcome =
  | "reached"
  | "voicemail"
  | "no-answer"
  | "callback"
  | "wrong-number";

export type CallLogEntry = Identifiable & {
  id: string;

  at: string;
  contactName: string;
  company: string;
  phone: string;
  direction: CallDirection;
  outcome: CallOutcome;

  followUpDate: string;
  notes: string;

  customerId: string;
  installerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CallLogDraft = {
  id: string;
  at: string;
  contactName: string;
  company: string;
  phone: string;
  direction: CallDirection;
  outcome: CallOutcome;
  followUpDate: string;
  notes: string;
  customerId: string;
  installerId: string;
  createdAt: string;
};

export const CALL_DIRECTIONS: ReadonlyArray<{ value: CallDirection; label: string }> = [
  { value: "outbound", label: "Uitgaand" },
  { value: "inbound", label: "Inkomend" }
];

export const CALL_OUTCOMES: ReadonlyArray<{ value: CallOutcome; label: string }> = [
  { value: "reached", label: "Bereikt" },
  { value: "voicemail", label: "Voicemail" },
  { value: "no-answer", label: "Geen gehoor" },
  { value: "callback", label: "Terugbellen" },
  { value: "wrong-number", label: "Verkeerd nummer" }
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateTimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function createCallLogDraft(): CallLogDraft {
  return {
    id: "",
    at: toDateTimeLocal(new Date()),
    contactName: "",
    company: "",
    phone: "",
    direction: "outbound",
    outcome: "reached",
    followUpDate: "",
    notes: "",
    customerId: "",
    installerId: "",
    createdAt: ""
  };
}

export function toDraft(entry: CallLogEntry): CallLogDraft {
  return {
    id: entry.id,
    at: entry.at,
    contactName: entry.contactName,
    company: entry.company,
    phone: entry.phone,
    direction: entry.direction,
    outcome: entry.outcome,
    followUpDate: entry.followUpDate,
    notes: entry.notes,
    customerId: entry.customerId,
    installerId: entry.installerId,
    createdAt: entry.createdAt
  };
}

export function directionLabel(value: CallDirection): string {
  return CALL_DIRECTIONS.find((d) => d.value === value)?.label ?? value;
}

export function outcomeLabel(value: CallOutcome): string {
  return CALL_OUTCOMES.find((o) => o.value === value)?.label ?? value;
}

export function formatCallMoment(at: string): string {
  const [datePart, timePart] = at.split("T");
  const [y, m, d] = (datePart ?? "").split("-");
  if (!y || !m || !d) return at;
  return `${d}/${m}/${y}${timePart ? ` ${timePart}` : ""}`;
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${d}/${m}/${y}`;
}
