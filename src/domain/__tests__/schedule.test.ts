/**
 * 排程領域測試:occursOn / nextOccurrence / sortSchedules / clampDuration。
 */
import { clampDuration, nextOccurrence, occursOn, sortSchedules } from '../schedule';
import type { ScheduleItem } from '../../data/schedule-types';

const mk = (over: Partial<ScheduleItem>): ScheduleItem => ({
  id: over.id ?? 'x',
  title: 'T',
  category: 'work',
  recurrence: 'weekly',
  weekdays: [1, 3, 5],
  time: 7,
  durationH: 1,
  reminderOn: true,
  ...over,
});

describe('occursOn', () => {
  it('daily 每天適用', () => {
    expect(occursOn(mk({ recurrence: 'daily', weekdays: [] }), '2026-08-25')).toBe(true);
  });
  it('weekly 依星期(2026-08-25=週二,不適用;08-24 週一適用)', () => {
    expect(occursOn(mk({}), '2026-08-25')).toBe(false);
    expect(occursOn(mk({}), '2026-08-24')).toBe(true);
  });
  it('once 只在指定日', () => {
    expect(occursOn(mk({ recurrence: 'once', weekdays: [], date: '2026-08-27' }), '2026-08-27')).toBe(true);
    expect(occursOn(mk({ recurrence: 'once', weekdays: [], date: '2026-08-27' }), '2026-08-28')).toBe(false);
  });
});

describe('nextOccurrence', () => {
  it('週三五 from 週二 → 週三(隔天)', () => {
    expect(nextOccurrence(mk({ weekdays: [3, 5] }), '2026-08-25')).toBe('2026-08-26');
  });
  it('once 未來日 → 該日;已過 → null', () => {
    expect(nextOccurrence(mk({ recurrence: 'once', weekdays: [], date: '2026-09-01' }), '2026-08-25')).toBe('2026-09-01');
    expect(nextOccurrence(mk({ recurrence: 'once', weekdays: [], date: '2026-08-01' }), '2026-08-25')).toBeNull();
  });
});

describe('sortSchedules', () => {
  it('下次發生升序;無下次排最後', () => {
    const items = [
      mk({ id: 'past', recurrence: 'once', weekdays: [], date: '2026-08-01' }),
      mk({ id: 'fri', weekdays: [5] }),   // 08-28
      mk({ id: 'wed', weekdays: [3] }),   // 08-26
    ];
    expect(sortSchedules(items, '2026-08-25').map((s) => s.id)).toEqual(['wed', 'fri', 'past']);
  });
});

describe('clampDuration', () => {
  it('0.5–4 步階 0.5', () => {
    expect(clampDuration(0.2)).toBe(0.5);
    expect(clampDuration(5)).toBe(4);
    expect(clampDuration(2.3)).toBe(2.5);
    expect(clampDuration(1)).toBe(1);
  });
});
