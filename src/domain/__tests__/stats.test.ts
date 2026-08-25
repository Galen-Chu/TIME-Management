/**
 * 統計口徑測試(ROADMAP:含空資料、單日資料邊界)。
 */
import { computeRangeStats, monthRange, weekRange, workTrend } from '../stats';
import type { Event } from '../events';

function ev(date: string, start: number, end: number, category: Event['category'] = 'work'): Event {
  return {
    id: `${date}-${start}-${category}`,
    date, start, end, category,
    label: '', predicted: false, source: 'manual',
    createdAt: 0, updatedAt: 0,
  };
}

describe('日期範圍', () => {
  it('weekRange 週一為首(週日回推 6 天)', () => {
    expect(weekRange('2026-08-24')).toEqual({ from: '2026-08-24', to: '2026-08-30' }); // 週一
    expect(weekRange('2026-08-30')).toEqual({ from: '2026-08-24', to: '2026-08-30' }); // 週日
    expect(weekRange('2026-08-26')).toEqual({ from: '2026-08-24', to: '2026-08-30' }); // 週三
  });
  it('monthRange = 30 天口徑(含當日)', () => {
    expect(monthRange('2026-08-24')).toEqual({ from: '2026-07-26', to: '2026-08-24' });
  });
});

describe('computeRangeStats', () => {
  const FROM = '2026-08-24', TO = '2026-08-30';

  it('空資料:全為 0、覆蓋 0、perDay 7 列全空', () => {
    const s = computeRangeStats([], FROM, TO, 7);
    expect(s.loggedDays).toBe(0);
    expect(s.coverage).toBe(0);
    expect(s.perDay).toHaveLength(7);
    expect(s.byCategory).toEqual([]);
    expect(s.workAvgPerDay).toBeNull();
  });

  it('單日資料:1 天記錄、涵蓋 1/7、時數正確', () => {
    const s = computeRangeStats(
      [ev('2026-08-24', 9, 12), ev('2026-08-24', 13, 17)],
      FROM, TO, 7
    );
    expect(s.loggedDays).toBe(1);
    expect(s.coverage).toBeCloseTo(1 / 7);
    expect(s.byCategory[0]).toMatchObject({ key: 'work', total: 7 });
    expect(s.byCategory[0].avgPerDay).toBeCloseTo(1);
    expect(s.perDay[0].hours.work).toBe(7);
    expect(s.perDay[1].hours.work).toBeUndefined();
  });

  it('預測事件不計入;跨午夜事件時長正確', () => {
    const predicted = { ...ev('2026-08-25', 15, 17), predicted: true };
    const midnight = ev('2026-08-25', 23, 1, 'sleep');
    const s = computeRangeStats([predicted, midnight], FROM, TO, 7);
    expect(s.loggedDays).toBe(1);
    expect(s.byCategory).toEqual([
      { key: 'sleep', total: 2, avgPerDay: 2 / 7 },
    ]);
  });

  it('類別排序依總時數降冪;範圍外日期排除', () => {
    const s = computeRangeStats(
      [ev('2026-08-24', 9, 12, 'work'), ev('2026-08-24', 20, 22, 'leisure'), ev('2026-08-31', 9, 10)],
      FROM, TO, 7
    );
    expect(s.byCategory.map((c) => c.key)).toEqual(['work', 'leisure']);
    expect(s.loggedDays).toBe(1); // 08-31 超出範圍
  });

  it('本月口徑:30 天分母', () => {
    const s = computeRangeStats([ev('2026-08-24', 9, 12)], '2026-07-26', '2026-08-24', 30);
    expect(s.totalDays).toBe(30);
    expect(s.coverage).toBeCloseTo(1 / 30);
    expect(s.perDay).toHaveLength(30);
  });
});

describe('workTrend', () => {
  it('本週 vs 上週平均差', () => {
    const events = [
      // 本週(08-24~30):每天 2h → 2/日
      ...Array.from({ length: 7 }, (_, i) => ev(`2026-08-${24 + i}`, 9, 11)),
      // 上週(08-17~23):每天 1h → 1/日
      ...Array.from({ length: 7 }, (_, i) => ev(`2026-08-${17 + i}`, 9, 10)),
    ];
    const r = workTrend(events, weekRange('2026-08-26'), '2026-08-26');
    expect(r?.diffHours).toBe(1);
  });

  it('上週無資料 → null(誠實失敗)', () => {
    const events = [ev('2026-08-24', 9, 11)];
    expect(workTrend(events, weekRange('2026-08-24'), '2026-08-24')).toBeNull();
  });
});
