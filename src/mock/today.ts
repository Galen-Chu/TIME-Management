/**
 * Phase 1 虛擬資料(ROADMAP:畫面骨架含虛擬資料)。
 * 固定基準日與「現在」,畫面呈現可重現(走查/測試/截圖一致)。
 * Phase 2 起由 SQLite repository 取代。
 */
import type { CategoryKey } from '../domain/categories';

export const MOCK_DATE = '2026-08-24'; // 週一
export const MOCK_NOW = 14.5; // 14:30

export interface MockEvent {
  id: string;
  start: number; // 0–24
  end: number;
  category: CategoryKey;
  labelZh: string;
  labelEn: string;
  predicted: boolean;
}

export const mockEvents: MockEvent[] = [
  { id: 'e1', start: 0, end: 7.25, category: 'sleep', labelZh: '睡眠', labelEn: 'Sleep', predicted: false },
  { id: 'e2', start: 8.0, end: 8.75, category: 'commute', labelZh: '通勤', labelEn: 'Commute', predicted: false },
  { id: 'e3', start: 9.0, end: 12.5, category: 'work', labelZh: '專案開發', labelEn: 'Project work', predicted: false },
  { id: 'e4', start: 12.5, end: 13.5, category: 'meal', labelZh: '午餐', labelEn: 'Lunch', predicted: false },
  { id: 'e5', start: 13.5, end: 14.5, category: 'work', labelZh: '會議與覆盤', labelEn: 'Meeting & review', predicted: false },
  { id: 'e6', start: 15.0, end: 17.0, category: 'work', labelZh: '深度工作(預測)', labelEn: 'Deep work (predicted)', predicted: true },
  { id: 'e7', start: 19.5, end: 21.5, category: 'leisure', labelZh: '閱讀與放鬆(預測)', labelEn: 'Reading & chill (predicted)', predicted: true },
];

export interface MockRoutine {
  id: string;
  labelZh: string;
  labelEn: string;
  timeHint: string; // HH:MM
  streak: number;
  done: boolean;
}

export const mockRoutines: MockRoutine[] = [
  { id: 'r1', labelZh: '晨間冥想', labelEn: 'Morning meditation', timeHint: '07:15', streak: 5, done: true },
  { id: 'r2', labelZh: '走路 20 分鐘', labelEn: '20-min walk', timeHint: '18:30', streak: 3, done: false },
  { id: 'r3', labelZh: '閱讀 30 分鐘', labelEn: '30-min reading', timeHint: '21:00', streak: 12, done: false },
];

/** 週堆疊資料(週一=0 … 週日=6;各類別小時) */
export interface MockDayHours {
  weekday: number;
  hours: Partial<Record<CategoryKey, number>>;
}

export const mockWeek: MockDayHours[] = [
  { weekday: 1, hours: { sleep: 7, work: 6.5, meal: 1.5, exercise: 0.5, leisure: 2, commute: 0.75, other: 1 } },
  { weekday: 2, hours: { sleep: 6.75, work: 7, meal: 1.5, exercise: 1, leisure: 1.5, commute: 0.75 } },
  { weekday: 3, hours: { sleep: 7.25, work: 5.5, meal: 1.5, leisure: 3, commute: 0.75, other: 0.5 } },
  { weekday: 4, hours: { sleep: 7, work: 8, meal: 1.5, exercise: 0.5, leisure: 1, commute: 0.75 } },
  { weekday: 5, hours: { sleep: 6.5, work: 7.5, meal: 1.5, leisure: 2.5, commute: 0.75 } },
  { weekday: 6, hours: { sleep: 8.5, meal: 2, exercise: 1.5, leisure: 5, other: 1.5 } },
  { weekday: 0, hours: { sleep: 8.25, meal: 2, exercise: 1, leisure: 4.5, other: 1 } },
];

/** 統計頁虛擬資料 */
export const mockStats = {
  loggedDays: 6,
  totalDays: 7,
  coverage: 6 / 7,
  workAvgPerDay: 6.9,
  breakdown: [
    { key: 'work' as CategoryKey, avg: 6.9 },
    { key: 'sleep' as CategoryKey, avg: 7.3 },
    { key: 'leisure' as CategoryKey, avg: 2.8 },
    { key: 'meal' as CategoryKey, avg: 1.6 },
    { key: 'exercise' as CategoryKey, avg: 0.9 },
    { key: 'commute' as CategoryKey, avg: 0.6 },
    { key: 'other' as CategoryKey, avg: 0.7 },
  ],
  workTrendDiff: 0.6, // 較上週 +
  weekendSleepDiff: 1.25,
};

/** 排程虛擬資料(Phase 3 實作完整功能;Phase 1 日誌卡顯示區塊) */
export const mockSchedules = [
  { id: 's1', titleZh: '晨間瑜伽', titleEn: 'Morning yoga', time: 7.0, durationH: 1, category: 'exercise' as CategoryKey, dueToday: true, dueNow: false },
  { id: 's2', titleZh: '讀書會', titleEn: 'Book club', time: 20.0, durationH: 1.5, category: 'leisure' as CategoryKey, dueToday: true, dueNow: false },
];
