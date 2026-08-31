/**
 * Intl 格式化測試(P3:I18N.md「禁止手動串接」的核心模組)。
 */
import { formatClock, formatHeaderDate, formatHours, formatPercent, formatRange } from '../format';

const MONDAY = new Date('2026-08-24T00:00:00'); // 週一(本地時區)

describe('formatHeaderDate', () => {
  it('zh-TW:「8月24日」+ 星期', () => {
    const s = formatHeaderDate(MONDAY, 'zh-TW');
    expect(s).toContain('8月24日');
    expect(s).toContain('星期一');
  });
  it('en-US:weekday 在前 + 縮寫月份', () => {
    const s = formatHeaderDate(MONDAY, 'en-US');
    expect(s).toMatch(/^Monday, Aug 24/);
  });
});

describe('formatClock(0–24 小數 → HH:mm)', () => {
  it.each([
    [0, '00:00'],
    [9, '09:00'],
    [14.75, '14:45'],
    [23.9833, '23:59'],
    [24, '00:00'],
  ])('%s → %s', (value, expected) => {
    expect(formatClock(value)).toBe(expected);
  });

  it('分鐘進位:59.99 分 → 進到下一小時', () => {
    expect(formatClock(1.999999999)).toBe('02:00');
  });
});

describe('formatHours / formatPercent / formatRange', () => {
  it('formatHours:zh「4.7 小時」/ en「4.7 h」', () => {
    expect(formatHours(4.7, 'zh-TW')).toBe('4.7 小時');
    expect(formatHours(4.7, 'en-US')).toBe('4.7 h');
  });
  it('formatPercent:0.86 → 86%', () => {
    expect(formatPercent(0.86)).toBe('86%');
    expect(formatPercent(0)).toBe('0%');
  });
  it('formatRange:14:45 – 17:00', () => {
    expect(formatRange(14.75, 17)).toBe('14:45 – 17:00');
  });
});
