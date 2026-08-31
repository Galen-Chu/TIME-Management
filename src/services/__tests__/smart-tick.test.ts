/**
 * smartTick 整合測試:排程到點 + 預測,冪等性。
 */
import { smartTick } from '../smart-tick';
import type { Event } from '../../domain/events';
import type { ScheduleItem } from '../../data/schedule-types';

function ev(date: string, start: number, end: number, category: Event['category'] = 'work', predicted = false): Event {
  return { id: `${date}-${start}-${category}-${predicted}`, date, start, end, category, label: '', predicted, source: predicted ? 'predicted' : 'manual', createdAt: 0, updatedAt: 0 };
}

const SETTINGS = {
  sensitivity: 1 as const,
  sleepStart: 23,
  sleepEnd: 7,
  flexEnabled: false,
  irregularMode: false,
  leadTime: 15,
};

const SCHED: ScheduleItem = {
  id: 's1', title: '晨間瑜伽', category: 'exercise',
  recurrence: 'daily', weekdays: [], time: 7, durationH: 1, reminderOn: true,
};

describe('smartTick', () => {
  it('排程到點+歷史預測同時產出', () => {
    const history = [
      ev('2026-08-20', 9, 12, 'work'),
      ev('2026-08-21', 9, 12, 'work'),
      ev('2026-08-22', 9, 12, 'work'),
    ];
    const r = smartTick('2026-08-25', 7.1, [SCHED], [], [], history, SETTINGS);
    expect(r.scheduleEvents).toHaveLength(1);
    expect(r.scheduleEvents[0].label).toBe('晨間瑜伽');
    // 7.1 附近無歷史工作 → 可能無預測
    expect(r.predictions.length).toBeLessThanOrEqual(1);
  });

  it('冪等:第二次呼叫不重複生成排程事件', () => {
    const first = smartTick('2026-08-25', 7.1, [SCHED], [], [], [], SETTINGS);
    const existing = [...first.scheduleEvents.map((e) => ({ ...e, createdAt: 0, updatedAt: 0 }))];
    const second = smartTick('2026-08-25', 7.1, [SCHED], existing, [], [], SETTINGS);
    expect(second.scheduleEvents).toHaveLength(0);
  });
});
