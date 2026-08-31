/**
 * Prediction 服務 v1(ARCHITECTURE §AI Services):規則式預測——純函式。
 *
 * 策略:例行工事 timeHint + 歷史同時段類別眾數 + 睡眠視窗
 *   → 產出候選事件(predicted: true)與信心分數(0–1)
 *
 * 誠實失敗:信心不足即不預測,不得為了畫面完整而虛構事件。
 * 敏感度=信心門檻:低(0)/中(1)/高(2) → ≥0.8 / ≥0.6 / ≥0.4
 * 彈性作息=輸出時間區間而非單點(以 ±0.5h 擴展)
 */
import type { CategoryKey } from '../domain/categories';
import { overlaps, snap, type Event } from '../domain/events';
import type { Routine } from '../data/routine-types';
import type { Settings } from '../state/settings';

/** 敏感度→信心門檻(ARCHITECTURE) */
export const CONFIDENCE_THRESHOLDS = [0.8, 0.6, 0.4] as const;

export interface PredictionCandidate {
  start: number; // 0–24(彈性作息=區間中心)
  end: number;
  rangeStart?: number; // 彈性作息時的區間起點
  rangeEnd?: number;
  category: CategoryKey;
  label: string;
  confidence: number;
  reason: 'routine' | 'history' | 'sleep' | 'schedule';
}

export type PredictionResult =
  | { type: 'none'; reason: string } // 誠實失敗
  | { type: 'candidates'; items: PredictionCandidate[] };

interface PredictInput {
  date: string;
  hour: number; // 目前時刻(0–24)
  events: Event[]; // 今日既有事件(已確認+已預測)
  routines: Routine[];
  history: Event[]; // 近 N 日歷史(已確認)
  settings: Pick<Settings, 'sensitivity' | 'sleepStart' | 'sleepEnd' | 'flexEnabled' | 'irregularMode'>;
}

/** 歷史同時段的類別分布(±1h 窗口) */
export function historyModeAt(
  history: Event[],
  hour: number,
  windowH = 1
): { category: CategoryKey; count: number; ratio: number } | null {
  const counts = new Map<CategoryKey, number>();
  let total = 0;
  history
    .filter((e) => !e.predicted)
    .forEach((e) => {
      const inWindow = Math.abs(e.start - hour) <= windowH || Math.abs(e.end - hour) <= windowH;
      if (inWindow) {
        counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
        total++;
      }
    });
  if (total === 0) return null;
  let bestCat: CategoryKey | null = null;
  let bestCount = 0;
  counts.forEach((count, category) => {
    if (count > bestCount) {
      bestCat = category;
      bestCount = count;
    }
  });
  return bestCat ? { category: bestCat, count: bestCount, ratio: bestCount / total } : null;
}

/** 例行工事的下一個 timeHint(今天尚未完成的:doneDate=null 或早於今日) */
export function nextRoutineTime(routines: Routine[], hour: number, date: string): Routine | null {
  const pending = routines.filter((r) => r.doneDate === null || r.doneDate < date);
  const upcoming = pending
    .map((r) => {
      const [h, m] = r.timeHint.split(':').map(Number);
      const t = h + m / 60;
      return { r, t };
    })
    .filter((x) => x.t > hour)
    .sort((a, b) => a.t - b.t);
  return upcoming[0]?.r ?? null;
}

/** 睡眠時段判定(含跨午夜;±buffer 小時) */
export function inSleepWindow(
  hour: number,
  sleepStart: number,
  sleepEnd: number,
  buffer = 0.5
): boolean {
  // 跨午夜(e.g. 23–07)
  if (sleepStart > sleepEnd) {
    return hour >= sleepStart - buffer || hour <= sleepEnd + buffer;
  }
  return hour >= sleepStart - buffer && hour <= sleepEnd + buffer;
}

/**
 * 主預測函式:對「下一小時」產出候選事件。
 * 規則優先級:睡眠窗口排除 → 排程到點 > 例行 timeHint > 歷史眾數
 */
export function predictNext(input: PredictInput): PredictionResult {
  const { date, hour, events, routines, history, settings } = input;
  const threshold = CONFIDENCE_THRESHOLDS[settings.sensitivity];
  const candidates: PredictionCandidate[] = [];
  const occupied = events.map((e) => ({ start: e.start, end: e.end, id: e.id }));

  // 1) 睡眠窗口:不預測(除非現有事件覆蓋了這個時段=已醒)
  if (inSleepWindow(hour, settings.sleepStart, settings.sleepEnd) &&
      !events.some((e) => !e.predicted && overlaps({ start: hour, end: hour + 1 }, e))) {
    return { type: 'none', reason: 'sleep-window' };
  }

  // 2) 例行工事 timeHint(高信心:0.9——使用者自己定的)
  const nextRoutine = nextRoutineTime(routines, hour, date);
  if (nextRoutine) {
    const [h, m] = nextRoutine.timeHint.split(':').map(Number);
    const t = snap(h + m / 60);
    if (t > hour && t < hour + 2) {
      // 例行工事通常 0.5–1h
      const start = t;
      const end = t + 0.5;
      if (!occupied.some((o) => overlaps({ start, end }, o))) {
        candidates.push({
          start, end,
          category: 'exercise', // 例行工事預設類別(Phase 4 簡化)
          label: nextRoutine.label.startsWith('today.') ? nextRoutine.label.split('.').pop() ?? nextRoutine.label : nextRoutine.label,
          confidence: 0.9,
          reason: 'routine',
          ...(settings.flexEnabled ? { rangeStart: snap(start - 0.5), rangeEnd: snap(end + 0.5) } : {}),
        });
      }
    }
  }

  // 3) 歷史同時段眾數
  const mode = historyModeAt(history, hour);
  if (mode && mode.ratio >= 0.5) {
    // 找歷史中這個類別的平均時長
    const sameCat = history.filter((e) => e.category === mode.category && !e.predicted);
    const avgDur = sameCat.length > 0
      ? sameCat.reduce((s, e) => s + (e.end - e.start), 0) / sameCat.length
      : 1;
    const dur = snap(Math.min(Math.max(avgDur, 0.5), 4));
    const start = snap(hour + 0.5); // 半小時後開始
    const end = snap(start + dur);
    if (!occupied.some((o) => overlaps({ start, end }, o))) {
      // 非規律模式:降低規律假設的信心
      const confidence = settings.irregularMode ? mode.ratio * 0.6 : mode.ratio;
      candidates.push({
        start, end,
        category: mode.category,
        label: '', // 由 UI 依類別填入(如「工作(預測)」)
        confidence,
        reason: 'history',
        ...(settings.flexEnabled ? { rangeStart: snap(start - 0.5), rangeEnd: snap(end + 0.5) } : {}),
      });
    }
  }

  // 4) 過濾:信心 < 門檻的丟棄(誠實失敗)
  const qualified = candidates.filter((c) => c.confidence >= threshold);
  if (qualified.length === 0) {
    return { type: 'none', reason: `below-threshold(${threshold})` };
  }

  // 5) 排序:信心降序、僅取前 2(避免打擾)
  qualified.sort((a, b) => b.confidence - a.confidence);
  return { type: 'candidates', items: qualified.slice(0, 2) };
}
