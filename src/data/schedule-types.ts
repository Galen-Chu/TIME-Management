/**
 * 排程實體(DESIGN-ADDENDUM §A5:結構化欄位,顯示字串由 i18n 組合)。
 */
import type { CategoryKey } from '../domain/categories';

export type Recurrence = 'daily' | 'weekly' | 'biweekly' | 'once';

export interface ScheduleItem {
  id: string;
  title: string;
  category: CategoryKey;
  recurrence: Recurrence;
  weekdays: number[]; // 1=一 … 7=日(weekly/biweekly 用)
  date?: string; // YYYY-MM-DD(once 用)
  time: number; // 0–24,0.25 步階
  durationH: number; // 0.5–4,預設 1
  reminderOn: boolean;
}
