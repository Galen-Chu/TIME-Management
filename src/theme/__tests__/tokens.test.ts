/**
 * 設計 token 完整性(DESIGN-SPEC 為唯一事實來源)。
 * 2026-11-24 起 token 值取自 Uniconsign v0.2.0(vendor 於 src/theme/uniconsign/)。
 */
import tokens from '../tokens.json';

const SPEC_COLORS = {
  bg: '#F7F7F5',
  surface: '#FFFFFF',
  ink: '#1A1917',
  inkSecondary: '#5A574F',
  inkMuted: '#9C9890',
  accent: '#167839',
  accentLight: '#96D4A2',
  success: '#167839',
  successLight: '#BBE6C3',
  warning: '#796900',
  danger: '#C8423B',
  info: '#007687',
  track: '#EEEDEA',
  trackAlt: '#C4C1BA',
  divider: '#DEDCD7',
  trackSoft: '#EEEDEA',
  stepperInk: '#6E5C7E',
};

describe('theme tokens', () => {
  it('核心色與 DESIGN-SPEC 一致', () => {
    const { category: _categories, ...rest } = tokens.color;
    const colors = rest as Record<string, string>;
    for (const [key, hex] of Object.entries(SPEC_COLORS)) {
      expect(colors[key]).toBe(hex);
    }
  });

  it('7 類別色齊全', () => {
    expect(Object.keys(tokens.color.category).sort()).toEqual([
      'commute',
      'exercise',
      'leisure',
      'meal',
      'other',
      'sleep',
      'work',
    ]);
  });

  it('時間軸幾何:40px/h、左欄 44px', () => {
    expect(tokens.timeline.pxPerHour).toBe(40);
    expect(tokens.timeline.leftGutter).toBe(44);
  });

  it('時鐘盤尺寸 250/170', () => {
    expect(tokens.clock.diameter).toBe(250);
    expect(tokens.clock.innerDiameter).toBe(170);
  });
});
