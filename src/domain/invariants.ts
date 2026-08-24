/**
 * 領域不變量(ARCHITECTURE §Data Model invariants)——純函式,不依賴 UI 或儲存。
 */
/** leadTime 夾限 5–30(步階 5 由 UI 控制) */
export function clampLeadTime(n: number): number {
  return Math.min(30, Math.max(5, n));
}

/** 睡眠時間 ±0.25 環繞 0/24 */
export function wrapSleep(n: number): number {
  const v = Math.round(n * 4) / 4; // 0.25 步階
  return ((v % 24) + 24) % 24;
}

/** 事件時長合法區間 [0.25, 24] */
export function validDuration(start: number, end: number, crossesMidnight = false): boolean {
  const dur = crossesMidnight ? 24 - start + end : end - start;
  return dur >= 0.25 && dur <= 24;
}
