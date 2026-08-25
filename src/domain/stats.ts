/**
 * 統計口徑純函式(ROADMAP Phase 3;NFR-5:可單元測試)。
 * 本週 = date 所在週(週一為首 7 日);本月 = 30 天口徑(FR-STA)。
 */
import type { CategoryKey } from './categories';
import { durationOf, shiftDate, type Event } from './events';

export interface RangeStats {
  /** 已記錄天數(有任一已確認事件的日) */
  loggedDays: number;
  /** 範圍天數(本週 7 / 本月 30) */
  totalDays: number;
  /** 涵蓋率 0–1 */
  coverage: number;
  /** 各類別平均時數/日(依範圍天數;已確認事件) */
  byCategory: Array<{ key: CategoryKey; avgPerDay: number; total: number }>;
  /** 每日類別時數(堆疊圖;依日期升序) */
  perDay: Array<{ date: string; hours: Partial<Record<CategoryKey, number>> }>;
  /** 工作類平均時數/日(洞察用;無工作資料為 null) */
  workAvgPerDay: number | null;
}

/** 日期範圍(週一為首) */
export function weekRange(date: string): { from: string; to: string } {
  const wd = new Date(`${date}T00:00:00`).getDay();
  const idx = wd === 0 ? 7 : wd;
  return { from: shiftDate(date, -(idx - 1)), to: shiftDate(date, 7 - idx) };
}

export function monthRange(date: string): { from: string; to: string } {
  return { from: shiftDate(date, -29), to: date };
}

export function computeRangeStats(
  events: Event[],
  from: string,
  to: string,
  totalDays?: number
): RangeStats {
  const days = totalDays ?? Math.round((Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / 86400000) + 1;
  const confirmed = events.filter((e) => !e.predicted && e.date >= from && e.date <= to);

  // 已記錄天數
  const daySet = new Set(confirmed.map((e) => e.date));

  // 類別彙總 + 每日彙總
  const catTotals = new Map<CategoryKey, number>();
  const perDayMap = new Map<string, Partial<Record<CategoryKey, number>>>();
  confirmed.forEach((e) => {
    catTotals.set(e.category, (catTotals.get(e.category) ?? 0) + durationOf(e));
    const day = perDayMap.get(e.date) ?? {};
    day[e.category] = (day[e.category] ?? 0) + durationOf(e);
    perDayMap.set(e.date, day);
  });

  // 範圍內每日(無資料的日也列出,堆疊圖連續)
  const perDay: RangeStats['perDay'] = [];
  for (let i = 0; i < days; i++) {
    const d = shiftDate(from, i);
    if (d > to) break;
    perDay.push({ date: d, hours: perDayMap.get(d) ?? {} });
  }

  const byCategory = [...catTotals.entries()]
    .map(([key, total]) => ({ key, total, avgPerDay: total / days }))
    .sort((a, b) => b.total - a.total);

  const workTotal = catTotals.get('work');

  return {
    loggedDays: daySet.size,
    totalDays: days,
    coverage: days > 0 ? daySet.size / days : 0,
    byCategory,
    perDay,
    workAvgPerDay: workTotal != null ? workTotal / days : null,
  };
}

/** 洞察文字的 i18n 參數(雙語範本組字,不上傳資料) */
export interface InsightParams {
  avg: string;
  trend: string;
  period: string;
}

/** 工作趨勢:本週 vs 上週平均差(小時;上週無資料 → null) */
export function workTrend(
  events: Event[],
  thisWeek: { from: string; to: string },
  today: string
): { diffHours: number } | null {
  const cur = computeRangeStats(events, thisWeek.from, thisWeek.to).workAvgPerDay;
  const prevTo = shiftDate(thisWeek.from, -1);
  const prevFrom = shiftDate(prevTo, -6);
  if (prevFrom > today) return null; // 上週全部在未來(資料不足)
  const prev = computeRangeStats(
    events.filter((e) => e.date <= today),
    prevFrom,
    prevTo
  ).workAvgPerDay;
  if (cur == null || prev == null) return null;
  return { diffHours: Math.round((cur - prev) * 10) / 10 };
}
