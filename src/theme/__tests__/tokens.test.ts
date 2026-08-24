/**
 * 設計 token 完整性(DESIGN-SPEC 為唯一事實來源)。
 */
import tokens from '../tokens.json';

const SPEC_COLORS = {
  bg: '#FBF5EC',
  ink: '#2E2A25',
  inkSecondary: '#8A7F72',
  inkMuted: '#B4A99C',
  accent: '#E2795A',
  accentLight: '#F2B79A',
  success: '#7C9473',
  successLight: '#B9C7B0',
  track: '#F0E6D8',
  trackAlt: '#E2D9C8',
  divider: '#EFE6D8',
  trackSoft: '#F5EFE3',
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
