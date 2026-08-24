/**
 * 時段事件領域邏輯(ARCHITECTURE §Data Model + invariants)——純函式。
 * Event:24h 制,start/end 為 0–24 小數(步階 0.25);start > end 代表跨午夜。
 */
import type { CategoryKey } from './categories';

export interface Event {
  id: string;
  date: string; // YYYY-MM-DD(所屬日)
  start: number; // 0–24
  end: number;
  category: CategoryKey;
  label: string;
  predicted: boolean;
  source: 'manual' | 'detected' | 'predicted';
  createdAt: number;
  updatedAt: number;
}

export const STEP = 0.25;
export const MIN_DURATION = 0.25;
export const MAX_DURATION = 24;

/** 步階對齊(0.25) */
export function snap(v: number): number {
  return Math.round(v * 4) / 4;
}

/** 有效時長(含跨午夜);[0.25, 24] */
export function durationOf(e: Pick<Event, 'start' | 'end'>): number {
  const d = e.end >= e.start ? e.end - e.start : 24 - e.start + e.end;
  return Math.round(d * 4) / 4;
}

export function isValidDuration(e: Pick<Event, 'start' | 'end'>): boolean {
  const d = durationOf(e);
  return d >= MIN_DURATION && d <= MAX_DURATION;
}

/** 是否跨午夜 */
export function crossesMidnight(e: Pick<Event, 'start' | 'end'>): boolean {
  return e.end < e.start;
}

/**
 * 重疊判定:兩事件時段(含跨午夜)是否相交。
 * 以 [start, end(+24 環繞)) 區間處理。
 */
export function overlaps(
  a: Pick<Event, 'start' | 'end'>,
  b: Pick<Event, 'start' | 'end'>
): boolean {
  const toRange = (e: Pick<Event, 'start' | 'end'>): [number, number] =>
    crossesMidnight(e) ? [e.start, e.end + 24] : [e.start, e.end];
  const [a1, a2] = toRange(a);
  const [b1, b2] = toRange(b);
  // 展開後逐一比較四種環繞組合(a 或 b 可能跨日)
  const hit = (s1: number, e1: number, s2: number, e2: number) => s1 < e2 && s2 < e1;
  return (
    hit(a1, a2, b1, b2) ||
    hit(a1, a2, b1 - 24, b2 - 24) ||
    hit(a1 - 24, a2 - 24, b1, b2) ||
    hit(a1, a2, b1 + 24, b2 + 24)
  );
}

/** 新事件是否可加入(不與任何現存事件重疊,且時長合法) */
export function canAdd(
  candidate: Pick<Event, 'start' | 'end'>,
  existing: Array<Pick<Event, 'start' | 'end' | 'id'>>
): boolean {
  if (!isValidDuration(candidate)) return false;
  return !existing.some((e) => overlaps(candidate, e));
}

/** 同類別且時間連續(端點相接)→ 可合併 */
export function isContiguous(
  a: Pick<Event, 'start' | 'end' | 'category'>,
  b: Pick<Event, 'start' | 'end' | 'category'>
): boolean {
  if (a.category !== b.category) return false;
  const ends = (e: Pick<Event, 'start' | 'end'>) => (crossesMidnight(e) ? e.end + 24 : e.end);
  const starts = (e: Pick<Event, 'start' | 'end'>) => (crossesMidnight(e) ? e.start : e.start);
  return ends(a) === starts(b) || ends(b) === starts(a);
}

/**
 * 時間軸幾何:事件塊的 top/height(px)。
 * 跨午夜事件在時間軸上拆為兩段(尾段回到頂部)。
 */
export interface TimelineBlock {
  start: number; // 渲染起始小時(0–24)
  hours: number; // 渲染時長
  tail: boolean; // 是否為跨午夜事件的尾段
}

export function timelineBlocks(e: Pick<Event, 'start' | 'end'>): TimelineBlock[] {
  if (!crossesMidnight(e)) {
    return [{ start: e.start, hours: e.end - e.start, tail: false }];
  }
  return [
    { start: e.start, hours: 24 - e.start, tail: false },
    { start: 0, hours: e.end, tail: true },
  ];
}

/** 一日的類別時數彙總(圖例/統計用) */
export function hoursByCategory(events: Event[]): Partial<Record<CategoryKey, number>> {
  const out: Partial<Record<CategoryKey, number>> = {};
  events.forEach((e) => {
    out[e.category] = (out[e.category] ?? 0) + durationOf(e);
  });
  return out;
}

/** YYYY-MM-DD(本地時區) */
export function toDateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 日期 key 的前一天/後一天 */
export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** 目前時刻的 0–24 小數(現在線) */
export function nowHours(d = new Date()): number {
  return d.getHours() + d.getMinutes() / 60;
}
