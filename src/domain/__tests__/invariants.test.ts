/**
 * 領域不變量與格式化(ARCHITECTURE invariants / I18N format rules)。
 */
import { clampLeadTime, wrapSleep } from '../invariants';
import { formatClock, formatHours, formatRange } from '../../i18n/format';

describe('leadTime 夾限 5–30', () => {
  it('低於下界夾回 5', () => expect(clampLeadTime(0)).toBe(5));
  it('高於上界夾回 30', () => expect(clampLeadTime(45)).toBe(30));
  it('步階內保持原值', () => expect(clampLeadTime(15)).toBe(15));
});

describe('睡眠 ±0.25 環繞 24h', () => {
  it('23.75 + 0.25 = 0', () => expect(wrapSleep(24)).toBe(0));
  it('0 − 0.25 = 23.75', () => expect(wrapSleep(-0.25)).toBe(23.75));
  it('0.25 步階進位', () => expect(wrapSleep(7.13)).toBe(7.25));
});

describe('時間格式化(24h)', () => {
  it('formatClock 基本與進位', () => {
    expect(formatClock(14.5)).toBe('14:30');
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(23.75)).toBe('23:45');
  });
  it('formatRange', () => {
    expect(formatRange(14.75, 17)).toBe('14:45 – 17:00');
  });
  it('formatHours 雙語', () => {
    expect(formatHours(4.5, 'zh-TW')).toBe('4.5 小時');
    expect(formatHours(4.5, 'en-US')).toBe('4.5 h');
  });
});
