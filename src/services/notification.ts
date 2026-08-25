/**
 * Notification 服務(ARCHITECTURE §AI Services)——純函式。
 *
 * - leadTime 提醒:事件開始前 N 分鐘(5–30,步階 5)
 * - 通知風格:gentle = App 內建議卡片;push = 系統推播
 * - 免打擾時段(22:00–07:00):抑制主動推播,僅保留待確認卡片
 * - 排程到點:依 leadTime 提前、時間到生成待確認事件
 */
import { overlaps, snap, type Event } from '../domain/events';
import type { ScheduleItem } from '../data/schedule-types';
import { occursOn } from '../domain/schedule';

export const QUIET_START = 22;
export const QUIET_END = 7;

/** 是否在免打擾時段(22:00–07:00) */
export function inQuietHours(hour: number): boolean {
  return hour >= QUIET_START || hour < QUIET_END;
}

export type NotifyAction =
  | { type: 'none'; reason: 'quiet-hours' | 'not-due' | 'gentle-no-push' }
  | { type: 'in-app-card'; eventId: string }
  | { type: 'push'; eventId: string; title: string; body: string };

interface NotifyCheckInput {
  event: Pick<Event, 'id' | 'start' | 'label' | 'predicted'>;
  currentHour: number;
  leadTime: number; // 分鐘(5–30)
  notifyStyle: 'gentle' | 'push';
  quietHoursOn: boolean;
}

/**
 * 事件提醒判定:是否應發通知、發什麼。
 * 條件:距事件開始 ≤ leadTime 分鐘 且尚未開始。
 */
export function checkEventReminder(input: NotifyCheckInput): NotifyAction {
  const { event, currentHour, leadTime, notifyStyle, quietHoursOn } = input;
  const minutesUntil = (event.start - currentHour) * 60;

  // 尚未到提醒窗口
  if (minutesUntil > leadTime || minutesUntil < 0) {
    return { type: 'none', reason: 'not-due' };
  }

  // 免打擾:抑制主動推播,僅保留 App 內
  if (quietHoursOn && inQuietHours(currentHour) && notifyStyle === 'push') {
    return { type: 'in-app-card', eventId: event.id };
  }

  if (notifyStyle === 'gentle') {
    return { type: 'in-app-card', eventId: event.id };
  }

  return {
    type: 'push',
    eventId: event.id,
    title: event.predicted ? '預測待確認' : '即將開始',
    body: `${event.label} · ${Math.max(0, Math.round(minutesUntil))} 分鐘後開始`,
  };
}

/** 排程到點:今日適用且時間已到的排程 → 待確認事件(§A4) */
export function dueSchedulesToEvents(
  schedules: ScheduleItem[],
  date: string,
  currentHour: number,
  leadTimeMin: number,
  existingEvents: Event[]
): Array<Omit<Event, 'createdAt' | 'updatedAt'>> {
  const results: Array<Omit<Event, 'createdAt' | 'updatedAt'>> = [];

  schedules.forEach((s) => {
    if (!occursOn(s, date)) return;

    const minutesUntil = (s.time - currentHour) * 60;
    // 已到提醒窗口(≤leadTime)且未過期(≥0),或已開始
    const isDue = (minutesUntil <= leadTimeMin && minutesUntil >= 0) || minutesUntil < 0;

    if (!isDue) return;

    const id = `sched-${s.id}-${date}`;
    // 已存在(冪等)
    if (existingEvents.some((e) => e.id === id)) return;

    // 與已確認事件重疊:跳過(不打擾)
    const candidate = { start: snap(s.time), end: snap(s.time + s.durationH) };
    if (existingEvents.some((e) => overlaps(candidate, e) && !e.predicted)) return;

    results.push({
      id,
      date,
      start: candidate.start,
      end: candidate.end,
      category: s.category,
      label: s.title,
      predicted: true,
      source: 'predicted',
    });
  });

  return results;
}
