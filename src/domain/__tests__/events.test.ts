/**
 * 事件領域邏輯測試(ROADMAP Phase 2:重疊/跨日/夾限)。
 */
import {
  canAdd,
  durationOf,
  hoursByCategory,
  isContiguous,
  isValidDuration,
  overlaps,
  shiftDate,
  snap,
  timelineBlocks,
  toDateKey,
} from '../events';

describe('時長與夾限', () => {
  it('一般與跨午夜時長', () => {
    expect(durationOf({ start: 9, end: 12.5 })).toBe(3.5);
    expect(durationOf({ start: 23, end: 1 })).toBe(2);
    expect(durationOf({ start: 0, end: 24 })).toBe(24);
  });
  it('合法區間 [0.25, 24]', () => {
    expect(isValidDuration({ start: 9, end: 9.25 })).toBe(true);
    expect(isValidDuration({ start: 9, end: 9 })).toBe(false); // 時長 0
    expect(isValidDuration({ start: 9, end: 8.75 })).toBe(true); // 跨午夜 24-9+8.75=23.75,合法
    expect(isValidDuration({ start: 0, end: 24 })).toBe(true); // 恰 24h
  });
  it('snap 步階 0.25', () => {
    expect(snap(7.13)).toBe(7.25);
    expect(snap(7.1)).toBe(7);
  });
});

describe('重疊判定(含跨午夜)', () => {
  it('同日基本重疊', () => {
    expect(overlaps({ start: 9, end: 12 }, { start: 11, end: 13 })).toBe(true);
    expect(overlaps({ start: 9, end: 12 }, { start: 12, end: 13 })).toBe(false); // 端點相接不重疊
  });
  it('跨午夜事件與清晨事件重疊', () => {
    expect(overlaps({ start: 23, end: 2 }, { start: 1, end: 3 })).toBe(true);
    expect(overlaps({ start: 23, end: 2 }, { start: 3, end: 5 })).toBe(false);
  });
  it('兩個跨午夜事件重疊', () => {
    expect(overlaps({ start: 22, end: 3 }, { start: 23.5, end: 4 })).toBe(true);
  });
  it('canAdd 綜合判定', () => {
    const existing = [{ id: '1', start: 9, end: 12 }];
    expect(canAdd({ start: 12, end: 13 }, existing)).toBe(true);
    expect(canAdd({ start: 11, end: 13 }, existing)).toBe(false);
    expect(canAdd({ start: 12, end: 12 }, existing)).toBe(false); // 時長不合法
  });
});

describe('同類連續合併判定', () => {
  it('同類相接可合併', () => {
    expect(
      isContiguous(
        { start: 9, end: 12, category: 'work' },
        { start: 12, end: 13, category: 'work' }
      )
    ).toBe(true);
  });
  it('不同類或不相接不可', () => {
    expect(
      isContiguous(
        { start: 9, end: 12, category: 'work' },
        { start: 12, end: 13, category: 'meal' }
      )
    ).toBe(false);
    expect(
      isContiguous(
        { start: 9, end: 12, category: 'work' },
        { start: 12.5, end: 13, category: 'work' }
      )
    ).toBe(false);
  });
});

describe('時間軸幾何', () => {
  it('一般事件單塊', () => {
    expect(timelineBlocks({ start: 9, end: 12 })).toEqual([
      { start: 9, hours: 3, tail: false },
    ]);
  });
  it('跨午夜拆兩塊(尾段回頂部)', () => {
    expect(timelineBlocks({ start: 23, end: 2 })).toEqual([
      { start: 23, hours: 1, tail: false },
      { start: 0, hours: 2, tail: true },
    ]);
  });
});

describe('彙總與日期', () => {
  it('類別時數', () => {
    const h = hoursByCategory([
      { id: 'a', date: '2026-08-24', start: 9, end: 12, category: 'work', label: '', predicted: false, source: 'manual', createdAt: 0, updatedAt: 0 },
      { id: 'b', date: '2026-08-24', start: 23, end: 1, category: 'sleep', label: '', predicted: false, source: 'manual', createdAt: 0, updatedAt: 0 },
    ]);
    expect(h.work).toBe(3);
    expect(h.sleep).toBe(2);
  });
  it('日期位移與 key', () => {
    expect(toDateKey(new Date('2026-08-24T00:00:00'))).toBe('2026-08-24');
    expect(shiftDate('2026-08-24', 1)).toBe('2026-08-25');
    expect(shiftDate('2026-09-01', -1)).toBe('2026-08-31');
  });
});
