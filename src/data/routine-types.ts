/**
 * 例行工事實體(ARCHITECTURE §Data Model)。
 */
export interface Routine {
  id: string;
  label: string;
  timeHint: string; // "07:15"
  streak: number;
  doneDate: string | null; // YYYY-MM-DD(跨日重算依據)
}
