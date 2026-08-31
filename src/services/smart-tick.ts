/**
 * Smart tick:定期呼叫的智慧服務整合入口。
 * 排程到點生成 + 規則式預測注入 —— 純函式,由 UI 層定時呼叫。
 */
import { dueSchedulesToEvents } from './notification';
import { predictNext } from './prediction';
import type { Event } from '../domain/events';
import type { ScheduleItem } from '../data/schedule-types';
import type { Routine } from '../data/routine-types';
import type { Settings } from '../state/settings';

export interface SmartTickResult {
  /** 排程到點應生成的待確認事件 */
  scheduleEvents: Array<Omit<Event, 'createdAt' | 'updatedAt'>>;
  /** 預測候選(已在事件中新增) */
  predictions: Array<Omit<Event, 'createdAt' | 'updatedAt'>>;
}

export function smartTick(
  date: string,
  currentHour: number,
  schedules: ScheduleItem[],
  events: Event[],
  routines: Routine[],
  history: Event[],
  settings: Pick<Settings, 'sensitivity' | 'sleepStart' | 'sleepEnd' | 'flexEnabled' | 'irregularMode' | 'leadTime'>
): SmartTickResult {
  // 1) 排程到點 → 待確認事件(冪等)
  const scheduleEvents = dueSchedulesToEvents(
    schedules, date, currentHour, settings.leadTime, events
  );

  // 2) 規則式預測
  const existingIds = new Set([...events, ...scheduleEvents].map((e) => e.id));
  const prediction = predictNext({
    date, hour: currentHour,
    events: [...events, ...scheduleEvents.map((e) => ({ ...e, createdAt: 0, updatedAt: 0 }))],
    routines, history, settings,
  });

  const predictions: Array<Omit<Event, 'createdAt' | 'updatedAt'>> = [];
  if (prediction.type === 'candidates') {
    prediction.items.forEach((c, i) => {
      const id = `pred-${date}-${currentHour}-${i}`;
      if (existingIds.has(id)) return;
      predictions.push({
        id,
        date,
        start: c.start,
        end: c.end,
        category: c.category,
        // label 留空時由 UI 依類別顯示(prediction.ts 註記的約定)
        label: c.label,
        predicted: true,
        source: 'predicted',
      });
    });
  }

  return { scheduleEvents, predictions };
}
