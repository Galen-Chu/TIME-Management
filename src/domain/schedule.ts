/**
 * 排程領域邏輯(§A5):顯示字串組合與下次發生時間——純函式。
 */
import type { ScheduleItem, Recurrence } from '../data/schedule-types';
import { shiftDate } from './events';

/** 今天是否適用(供「今日排程」區塊與清單 accent 點) */
export function occursOn(item: ScheduleItem, date: string): boolean {
  const wd = new Date(`${date}T00:00:00`).getDay();
  const dow = wd === 0 ? 7 : wd;
  switch (item.recurrence) {
    case 'daily':
      return true;
    case 'weekly':
    case 'biweekly':
      return item.weekdays.includes(dow);
    case 'once':
      return item.date === date;
  }
}

/**
 * 下次發生日期(≥ today);daily/weekly 找最近的適用日;
 * biweekly 以週期基準(簡化:從 today 起找第一個適用日,跨週以 weekdays 每週重複);
 * once 已過期 → null。
 */
export function nextOccurrence(item: ScheduleItem, today: string): string | null {
  if (item.recurrence === 'once') {
    return item.date && item.date >= today ? item.date : null;
  }
  for (let i = 0; i < 14; i++) {
    const d = shiftDate(today, i);
    if (occursOn(item, d)) return d;
  }
  return null;
}

/** 排序:下次發生時間升序(無下次的排最後) */
export function sortSchedules(items: ScheduleItem[], today: string): ScheduleItem[] {
  return items
    .map((s) => ({ s, next: nextOccurrence(s, today) }))
    .sort((a, b) => {
      if (a.next == null && b.next == null) return a.s.time - b.s.time;
      if (a.next == null) return 1;
      if (b.next == null) return -1;
      if (a.next !== b.next) return a.next < b.next ? -1 : 1;
      return a.s.time - b.s.time;
    })
    .map((x) => x.s);
}

/** 重複描述字串的 i18n 參數(如「每週 · 一三五 · 07:00」) */
export function recurrenceParams(item: ScheduleItem): {
  recurrenceKey: string;
  weekdayKeys: number[];
  time: number;
} {
  return {
    recurrenceKey: `schedule.recurrence.${item.recurrence}`,
    weekdayKeys: [...item.weekdays].sort(),
    time: item.time,
  };
}

/** 時長步階:0.5–4 */
export function clampDuration(n: number): number {
  return Math.min(4, Math.max(0.5, Math.round(n * 2) / 2));
}

export type { Recurrence };
